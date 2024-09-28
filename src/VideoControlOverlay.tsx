import { parse as srtVttParse } from "@plussub/srt-vtt-parser"
import AudioMotionAnalyzer from "audiomotion-analyzer"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ParseResult, parse as samiParse } from "sami-parser"
import { twJoin } from "tailwind-merge"
import { useWindowSize } from "usehooks-ts"

import CaptionButton from "./CaptionButton"
import PlaySpeedControl from "./PlaySpeedControl"
import Tooltip from "./Tooltip"
import VolumeControl from "./VolumeControl"
import { isMac, isSafari } from "./utils/browser"
import {
  MediaFile,
  getMediaFiles,
  getSubtitleFiles,
} from "./utils/getMediaFiles"
import { replaceBasicHtmlEntities } from "./utils/html"

import IconButton from "./IconButton"
import ChromecastIcon from "./assets/chromecast.svg?react"
import ExitFullscreenIcon from "./assets/compress.svg?react"
import FullscreenIcon from "./assets/expand.svg?react"
import NextIcon from "./assets/next.svg?react"
import PauseIcon from "./assets/pause.svg?react"
import PlayIcon from "./assets/play.svg?react"
import CloseIcon from "./assets/xmark.svg?react"

interface VideoControlOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>
  mediaFiles: MediaFile[]
  exit: () => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
  setMedia: (files: MediaFile[]) => void
}

const VideoControlOverlay: React.FC<VideoControlOverlayProps> = ({
  videoRef,
  mediaFiles,
  exit,
  currentIndex,
  setCurrentIndex,
  setMedia,
}) => {
  const [showControls, setShowControls] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [totalTime, setTotalTime] = useState("00:00")
  const [seekValue, setSeekValue] = useState("0")
  const [volume, setVolume] = useState(localStorage.getItem("volume") || "0.5")
  const [playSpeed, setPlaySpeed] = useState(1)
  const mouseMoveTimeout = useRef<number | null>(null)
  const analyzer = useRef<AudioMotionAnalyzer | null>(null)
  const analyzerContainer = useRef<HTMLDivElement | null>(null)
  const [isAudio, setIsAudio] = useState(false)
  const subtitles = useRef<ParseResult>([])
  const [currentSubtitle, setCurrentSubtitle] = useState("")
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [videoRatio, setVideoRatio] = useState(0)
  const { width: windowWidth = 0, height: windowHeight = 0 } = useWindowSize()
  const { t } = useTranslation()

  const captionBottomPosition = useMemo(() => {
    if (
      windowWidth === 0 ||
      windowHeight === 0 ||
      videoRatio === 0 ||
      videoRatio < 1
    )
      return 48
    const actualVideoHeight = Math.min(windowWidth / videoRatio, windowHeight)
    const videoMarginHeight = (windowHeight - actualVideoHeight) / 2
    if (videoMarginHeight > 92) {
      return windowHeight - videoMarginHeight - actualVideoHeight - 60
    } else {
      return windowHeight - videoMarginHeight - actualVideoHeight + 48
    }
  }, [videoRatio, windowWidth, windowHeight])

  const parseSubtitle = useCallback((subtitleFile: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === "string") {
        if (
          subtitleFile.name.endsWith(".srt") ||
          subtitleFile.name.endsWith(".vtt")
        ) {
          subtitles.current = srtVttParse(content).entries.map((entry) => ({
            startTime: entry.from,
            endTime: entry.to,
            languages: {
              x: entry.text,
            },
          }))
        } else {
          subtitles.current = samiParse(content)?.result || []
        }
      }
    }
    reader.readAsText(subtitleFile)
  }, [])

  useEffect(() => {
    const subtitleFile = mediaFiles[currentIndex].subtitleFile
    if (subtitleFile) {
      parseSubtitle(subtitleFile)
    } else {
      subtitles.current = []
    }
  }, [currentIndex, mediaFiles, parseSubtitle])

  const handlePlaybackSpeed = useCallback(
    (speed: number) => {
      const video = videoRef && typeof videoRef === "object" && videoRef.current
      if (video) {
        video.playbackRate = speed
        setPlaySpeed(speed)
      }
    },
    [videoRef],
  )

  useEffect(() => {
    handlePlaybackSpeed(playSpeed)
  }, [playSpeed, handlePlaybackSpeed])

  useEffect(() => {
    const video = videoRef && typeof videoRef === "object" && videoRef.current
    if (video) {
      video.volume = Number(volume)
    }
  }, [volume, videoRef])

  useEffect(() => {
    const video = videoRef && typeof videoRef === "object" && videoRef.current
    if (video) {
      video.ontimeupdate = () => {
        const hour = Math.floor(video.currentTime / 3600)
        let minute = Math.floor((video.currentTime % 3600) / 60).toString()
        if (minute.length === 1) {
          minute = `0${minute}`
        }
        let second = Math.floor(video.currentTime % 60).toString()
        if (second.length === 1) {
          second = `0${second}`
        }
        if (hour === 0) {
          setCurrentTime(`${minute}:${second}`)
        } else {
          setCurrentTime(`${hour}:${minute}:${second}`)
        }
        setSeekValue((video.currentTime / video.duration) * 100 + "")
        if (subtitles.current.length > 0) {
          const currentSubtitle = subtitles.current.find(
            (subtitle) =>
              video.currentTime * 1000 >= subtitle.startTime &&
              video.currentTime * 1000 <= subtitle.endTime,
          )
          if (currentSubtitle) {
            const text = Object.values(currentSubtitle.languages)[0]
            setCurrentSubtitle(replaceBasicHtmlEntities(text))
          } else {
            setCurrentSubtitle("")
          }
        } else {
          setCurrentSubtitle("")
        }
      }
      video.onloadedmetadata = () => {
        if (video.videoWidth === 0) {
          setIsAudio(true)
          if (
            analyzerContainer.current &&
            analyzer.current === null &&
            !isSafari
          ) {
            analyzer.current = new AudioMotionAnalyzer(
              analyzerContainer.current,
              {
                source: video,
                smoothing: 0.8,
                showScaleX: false,
              },
            )
          }
        } else {
          setIsAudio(false)
        }
        const hour = Math.floor(video.duration / 3600)
        let minute = Math.floor((video.duration % 3600) / 60).toString()
        if (minute.length === 1) {
          minute = `0${minute}`
        }
        let second = Math.floor(video.duration % 60).toString()
        if (second.length === 1) {
          second = `0${second}`
        }
        if (hour === 0) {
          setTotalTime(`${minute}:${second}`)
        } else {
          setTotalTime(`${hour}:${minute}:${second}`)
        }
        setSeekValue("0")
        setVideoRatio(video.videoWidth / video.videoHeight)
        video.play().then(() => {
          setIsPaused(false)
        })
      }
      video.onended = () => {
        if (currentIndex < mediaFiles.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setShowControls(true)
          mouseMoveTimeout.current = window.setTimeout(() => {
            if (!video.paused) {
              setShowControls(false)
            }
          }, 2000)
        } else {
          setIsPaused(true)
          setShowControls(true)
        }
      }
    }
    return () => {
      if (video) {
        video.ontimeupdate = null
        video.onloadedmetadata = null
        video.onended = null
      }
    }
  }, [videoRef, mediaFiles.length, currentIndex, setCurrentIndex])

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const mediaFiles = getMediaFiles(files)
    if (mediaFiles.length === 0) {
      const subtitleFiles = getSubtitleFiles(files)
      if (subtitleFiles.length > 0) {
        parseSubtitle(subtitleFiles[0])
      }
    } else {
      setMedia(mediaFiles)
    }
  }

  const togglePlayPause = useCallback(() => {
    const video = videoRef && typeof videoRef === "object" && videoRef.current
    if (video) {
      if (video.paused || video.ended) {
        video.play()
        setIsPaused(false)
      } else {
        video.pause()
        setIsPaused(true)
      }
    }
  }, [videoRef])

  useEffect(() => {
    const fullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false)
      } else {
        setIsFullScreen(true)
      }
    }
    addEventListener("fullscreenchange", fullscreenChange)
    return () => {
      removeEventListener("fullscreenchange", fullscreenChange)
      analyzer.current?.destroy()
      analyzer.current = null
    }
  }, [])

  const toggleFullScreen = useCallback(() => {
    const fullscreenSection = document.querySelector("#fullscreenSection")
    if (!fullscreenSection) return

    if (!document.fullscreenElement) {
      fullscreenSection.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
        )
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const video = videoRef && typeof videoRef === "object" && videoRef.current
      if (!video) return
      if (event.key === "Escape") {
        if (!document.fullscreenElement) {
          exit()
        }
      } else if (event.key === "ArrowLeft") {
        video.currentTime -= 5
      } else if (event.key === "ArrowRight") {
        video.currentTime += 5
      } else if (event.key === " ") {
        togglePlayPause()
      } else if (
        event.key === "f" ||
        (isMac && event.metaKey && event.key === "Enter") ||
        (!isMac && event.altKey && event.key === "Enter")
      ) {
        toggleFullScreen()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [exit, videoRef, togglePlayPause, toggleFullScreen])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef && typeof videoRef === "object" && videoRef.current
    if (video) {
      const seekTime = (video.duration / 100) * Number(e.currentTarget.value)
      video.currentTime = seekTime
    }
  }

  const handleVolumeChange = (value: string) => {
    const video = videoRef && typeof videoRef === "object" && videoRef.current
    if (video) {
      setVolume(value)
      video.volume = Number(value)
      localStorage.setItem("volume", value)
    }
  }
  const sessionListener = (e) => {
    console.log("New session ID: " + e.sessionId)
  }

  const receiverListener = (e) => {
    if (e === window.chrome.cast.ReceiverAvailability.AVAILABLE) {
      console.log("Receivers available")
    }
  }

  const onInitSuccess = () => {
    console.log("Initialization succeeded")
  }

  const onError = (message) => {
    console.log("Error: " + JSON.stringify(message))
  }

  const handleCastButtonClick = (session) => {
    if (session && videoRef.current) {
      console.log(videoRef.current.src)
      // const videoUrl = "https://www3.cde.ca.gov/download/rod/big_buck_bunny.mp4"
      const videoUrl = videoRef.current.src
      const mediaInfo = new window.chrome.cast.media.MediaInfo("", "video/mp4")
      const request = new window.chrome.cast.media.LoadRequest(mediaInfo)
      const media = new MediaSource()
      const sourceBuffer = media.addSourceBuffer(
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
      )
      fetch(videoUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          sourceBuffer.addEventListener("updateend", () => {
            if (!sourceBuffer.updating && media.readyState === "open") {
              media.endOfStream()
              if (videoRef.current) {
                videoRef.current.src = URL.createObjectURL(media)
              }
              session
                .loadMedia(request)
                .then(() => {
                  console.log("Load succeed")
                })
                .catch((error) => {
                  console.error("Error loading media", error)
                })
            }
          })
          sourceBuffer.appendBuffer(arrayBuffer)
        })
        .catch((error) => {
          console.error("Error fetching video", error)
        })

      // if (subtitleText) {
      //   const track = new window.chrome.cast.media.Track(1, window.chrome.cast.media.TrackType.TEXT);
      //   track.trackContentId = 'data:text/vtt;base64,' + btoa(subtitleText);
      //   track.trackContentType = 'text/vtt';
      //   track.subtype = window.chrome.cast.media.TextTrackType.SUBTITLES;
      //   track.name = 'English';
      //   track.language = 'en-US';
      //   track.customData = null;

      //   mediaInfo.textTrackStyle = new window.chrome.cast.media.TextTrackStyle();
      //   mediaInfo.tracks = [track];
      // }

      // const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      // session
      //   .loadMedia(request)
      //   .then(() => {
      //     console.log('Load succeed');
      //   })
      //   .catch((error) => {
      //     console.error('Error loading media', error);
      //   });
    } else {
      console.log("No active session")
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0">
      <div
        ref={analyzerContainer}
        className={twJoin("absolute inset-0", isAudio ? "flex" : "hidden")}
      />
      {showSubtitle && subtitles.current.length > 0 && (
        <p
          className="absolute left-4 right-4 flex h-10 items-center justify-center text-center font-sans font-semibold text-white sm:text-xl md:text-2xl lg:text-3xl"
          style={{ textShadow: "0 0 8px black", bottom: captionBottomPosition }}
        >
          {currentSubtitle}
        </p>
      )}
      <div
        className={twJoin(
          "absolute inset-0 text-white transition-opacity duration-300 ease-in-out",
          showControls ? "cursor-auto opacity-100" : "cursor-none opacity-0",
        )}
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,75%), rgba(0,0,0,0%), rgba(0,0,0,0%), rgba(0,0,0,75%)",
        }}
        onMouseEnter={() => {
          const video =
            videoRef && typeof videoRef === "object" && videoRef.current
          const videoPaused = video && video.paused
          if (document.hasFocus() || videoPaused) {
            setShowControls(true)
          } else {
            setShowControls(false)
          }
        }}
        onMouseMove={() => {
          if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current)
          }
          const video =
            videoRef && typeof videoRef === "object" && videoRef.current
          const videoPaused = video && video.paused
          if (document.hasFocus() || videoPaused) {
            setShowControls(true)
            mouseMoveTimeout.current = window.setTimeout(() => {
              if (!videoPaused) {
                setShowControls(false)
              }
            }, 1000)
          } else {
            setShowControls(false)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="absolute left-6 right-4 top-4 flex items-center justify-between">
          <span className="text-xl font-semibold">
            {mediaFiles[currentIndex].file.name}{" "}
            {mediaFiles.length > 1 && (
              <>
                [{currentIndex + 1}/{mediaFiles.length}]
              </>
            )}
          </span>
          {!isFullScreen && (
            <Tooltip text={t("others.close")} place="bottom" align="right">
              <IconButton
                svgIcon={CloseIcon}
                onClick={() => {
                  if (showControls) {
                    exit()
                  }
                }}
              />
            </Tooltip>
          )}
        </div>
        <div className="absolute bottom-11 left-0 right-0 mx-4 flex items-end justify-between">
          <div className="flex items-center justify-center gap-2">
            <Tooltip
              text={isPaused ? t("others.play") : t("others.pause")}
              place="top"
              align="left"
            >
              <IconButton
                className={twJoin(isPaused && "pl-0.5")}
                svgIcon={isPaused ? PlayIcon : PauseIcon}
                onClick={() => {
                  if (showControls) {
                    togglePlayPause()
                  }
                }}
              />
            </Tooltip>
            {mediaFiles.length > 1 && currentIndex > 0 && (
              <Tooltip text={t("others.previous")} place="top">
                <IconButton
                  svgIcon={NextIcon}
                  className="rotate-180 transform"
                  onClick={() => {
                    if (showControls) {
                      setCurrentIndex(currentIndex - 1)
                    }
                  }}
                />
              </Tooltip>
            )}
            {mediaFiles.length > 1 && currentIndex < mediaFiles.length - 1 && (
              <Tooltip text={t("others.next")} place="top">
                <IconButton
                  svgIcon={NextIcon}
                  onClick={() => {
                    if (showControls) {
                      setCurrentIndex(currentIndex + 1)
                    }
                  }}
                />
              </Tooltip>
            )}
            <div className="hidden pl-2 font-mono text-sm font-semibold sm:block">
              <span className="pr-2">{currentTime}</span>/
              <span className="pl-2">{totalTime}</span>
            </div>
          </div>
          <div className="flex items-end justify-center gap-2">
            <VolumeControl
              volume={volume}
              handleVolumeChange={handleVolumeChange}
            />
            {subtitles.current.length > 0 && (
              <div className="mr-0.5">
                <CaptionButton
                  filled={showSubtitle}
                  onToggle={() => setShowSubtitle((prev) => !prev)}
                />
              </div>
            )}
            <div
              className={twJoin(
                "relative",
                subtitles.current.length === 0 && "mr-0.5",
              )}
            >
              <PlaySpeedControl
                playSpeed={playSpeed}
                handlePlaybackSpeed={handlePlaybackSpeed}
              />
            </div>
            <Tooltip text={t("others.chromecast")} place="top">
              <IconButton
                svgIcon={ChromecastIcon}
                onClick={() => {
                  const castContext =
                    window.cast.framework.CastContext.getInstance()
                  const session = castContext.getCurrentSession()

                  if (session) {
                    handleCastButtonClick(session)
                  } else {
                    const castSessionRequest =
                      new window.chrome.cast.SessionRequest(
                        window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                      )
                    const castApiConfig = new window.chrome.cast.ApiConfig(
                      castSessionRequest,
                      sessionListener,
                      receiverListener,
                    )
                    window.chrome.cast.initialize(
                      castApiConfig,
                      onInitSuccess,
                      onError,
                    )
                    window.chrome.cast.requestSession(
                      handleCastButtonClick,
                      onError,
                    )
                  }
                }}
              />
            </Tooltip>
            <Tooltip
              text={
                isFullScreen
                  ? t("others.exitFullscreen")
                  : t("others.fullscreen")
              }
              place="top"
              align="right"
            >
              <IconButton
                svgIcon={isFullScreen ? ExitFullscreenIcon : FullscreenIcon}
                onClick={() => {
                  if (showControls) {
                    toggleFullScreen()
                  }
                }}
              />
            </Tooltip>
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 mx-4 flex h-8 items-center justify-center">
          <input
            autoFocus
            className={twJoin(
              isSafari
                ? "h-2 w-full cursor-pointer appearance-none rounded-full border border-neutral-500 bg-transparent accent-white outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                : "w-full cursor-pointer accent-white outline-none",
            )}
            type="range"
            min="0"
            max="100"
            step="0.1"
            onChange={handleSeek}
            onKeyDown={(e) => {
              e.preventDefault()
            }}
            value={seekValue}
          />
        </div>
      </div>
    </div>
  )
}

export default VideoControlOverlay
