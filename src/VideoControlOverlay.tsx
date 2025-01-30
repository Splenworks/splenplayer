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

import Caption from "./Caption"
import FullScreenButton from "./FullScreenButton"
import IconButton from "./IconButton"
import MouseMoveOverlay from "./MouseMoveOverlay"
import ProgressBar from "./ProgressBar"
import NextIcon from "./assets/icons/next.svg?react"
import PauseIcon from "./assets/icons/pause.svg?react"
import PlayIcon from "./assets/icons/play.svg?react"
import CloseIcon from "./assets/icons/xmark.svg?react"
import { hashCode } from "./utils/hashCode"

interface VideoControlOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
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
  const videoFileHash = useMemo(() => {
    const allMediaFilesAndSizes = mediaFiles
      .map((mediaFile) => mediaFile.file.name + mediaFile.file.size)
      .join("")
    return "video-hash-" + hashCode(allMediaFilesAndSizes + currentIndex)
  }, [mediaFiles, currentIndex])

  const getVideo = useCallback(() => {
    return videoRef && typeof videoRef === "object" && videoRef.current
  }, [videoRef])

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
      const video = getVideo()
      if (video) {
        video.playbackRate = speed
        setPlaySpeed(speed)
      }
    },
    [getVideo],
  )

  useEffect(() => {
    handlePlaybackSpeed(playSpeed)
  }, [playSpeed, handlePlaybackSpeed])

  useEffect(() => {
    const video = getVideo()
    if (video) {
      video.volume = Number(volume)
    }
  }, [volume, getVideo])

  useEffect(() => {
    const video = getVideo()
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
        if (
          video.currentTime >= 30 &&
          video.duration > 90 &&
          video.currentTime < video.duration - 30
        ) {
          localStorage.setItem(videoFileHash, video.currentTime + "")
        } else if (
          video.duration > 90 &&
          video.currentTime >= video.duration - 30
        ) {
          localStorage.removeItem(videoFileHash)
        }
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
        const savedPlaybackPosition = localStorage.getItem(videoFileHash)
        if (video.videoWidth > 0 && savedPlaybackPosition) {
          const newCurrentTime = Number(savedPlaybackPosition)
          video.currentTime = newCurrentTime > 10 ? newCurrentTime - 10 : 0
          setSeekValue((video.currentTime / video.duration) * 100 + "")
        } else {
          setSeekValue("0")
        }
        setVideoRatio(video.videoWidth / video.videoHeight)
        video.play().then(() => {
          setIsPaused(false)
        })
      }
      video.onended = () => {
        localStorage.removeItem(videoFileHash)
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
  }, [
    getVideo,
    mediaFiles.length,
    currentIndex,
    setCurrentIndex,
    videoFileHash,
  ])

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
    const video = getVideo()
    if (video) {
      if (video.paused || video.ended) {
        video.play()
        setIsPaused(false)
      } else {
        video.pause()
        setIsPaused(true)
      }
    }
  }, [getVideo])

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
      const video = getVideo()
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
  }, [exit, getVideo, togglePlayPause, toggleFullScreen])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = getVideo()
    if (video) {
      const seekTime = (video.duration / 100) * Number(e.currentTarget.value)
      video.currentTime = seekTime
      if (seekTime < 30) {
        localStorage.removeItem(videoFileHash)
      }
    }
  }

  const handleVolumeChange = (value: string) => {
    const video = getVideo()
    if (video) {
      setVolume(value)
      video.volume = Number(value)
      localStorage.setItem("volume", value)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0">
      <div
        ref={analyzerContainer}
        className={twJoin("absolute inset-0", isAudio ? "flex" : "hidden")}
      />
      {showSubtitle && subtitles.current.length > 0 && (
        <Caption
          caption={currentSubtitle}
          captionBottomPosition={captionBottomPosition}
        />
      )}
      <MouseMoveOverlay
        showControls={showControls}
        setShowControls={setShowControls}
        mouseMoveTimeout={mouseMoveTimeout}
        videoPaused={isPaused}
      >
        <div
          className="absolute inset-0"
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
              {mediaFiles.length > 1 &&
                currentIndex < mediaFiles.length - 1 && (
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
              <FullScreenButton
                isFullScreen={isFullScreen}
                onClick={() => {
                  if (showControls) {
                    toggleFullScreen()
                  }
                }}
              />
            </div>
          </div>
          <ProgressBar handleSeek={handleSeek} seekValue={seekValue} />
        </div>
      </MouseMoveOverlay>
    </div>
  )
}

export default VideoControlOverlay
