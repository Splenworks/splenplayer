import React, { useCallback, useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import AudioMotionAnalyzer from "audiomotion-analyzer"
import { parse as samiParse, ParseResult } from "sami-parser"
import { parse as srtVttParse } from "@plussub/srt-vtt-parser"

import { MediaFile, getSubtitleFiles } from "./utils/getMediaFiles"
import { isSafari, isMac } from "./utils/browser"
import { replaceBasicHtmlEntities } from "./utils/html"
import PlaySpeedControl from "./PlaySpeedControl"
import VolumeControl from "./VolumeControl"
import CaptionButton from "./CaptionButton"

import IconButton from "./IconButton"
import PlayIcon from "./assets/play.svg?react"
import PauseIcon from "./assets/pause.svg?react"
import NextIcon from "./assets/next.svg?react"
import CloseIcon from "./assets/xmark.svg?react"
import FullscreenIcon from "./assets/expand.svg?react"
import ExitFullscreenIcon from "./assets/compress.svg?react"

interface VideoControlOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>
  mediaFiles: MediaFile[]
  exit: () => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

const VideoControlOverlay: React.FC<VideoControlOverlayProps> = ({
  videoRef,
  mediaFiles,
  exit,
  currentIndex,
  setCurrentIndex,
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
  const subtitleFile = mediaFiles[currentIndex].subtitleFile
  const subtitles = useRef<ParseResult>([])
  const [currentSubtitle, setCurrentSubtitle] = useState("")

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
    if (subtitleFile) {
      parseSubtitle(subtitleFile)
    } else {
      subtitles.current = []
    }
  }, [subtitleFile, parseSubtitle])

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
                hideScaleX: true,
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

  const handleSubtitleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const subtitleFiles = getSubtitleFiles(files)
    if (subtitleFiles.length > 0) {
      parseSubtitle(subtitleFiles[0])
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef && typeof videoRef === "object" && videoRef.current
    if (video) {
      const volume = e.currentTarget.value
      setVolume(volume)
      video.volume = Number(volume)
      localStorage.setItem("volume", volume)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0">
      <div
        ref={analyzerContainer}
        className={twJoin("absolute inset-0", isAudio ? "flex" : "hidden")}
      />
      <p
        className="absolute bottom-12 left-4 right-4 font-sans text-3xl text-center text-white font-semibold"
        style={{ textShadow: "0 0 8px black" }}
      >
        {currentSubtitle}
      </p>
      <div
        className={twJoin(
          "absolute inset-0 text-white transition-opacity duration-300 ease-in-out",
          showControls ? "opacity-100 cursor-auto" : "opacity-0 cursor-none",
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
        onDrop={handleSubtitleDrop}
      >
        <div className="absolute top-4 left-6 right-4 flex justify-between items-center">
          <span className="font-semibold text-xl">
            {mediaFiles[currentIndex].file.name}{" "}
            {mediaFiles.length > 1 && (
              <>
                [{currentIndex + 1}/{mediaFiles.length}]
              </>
            )}
          </span>
          {!isFullScreen && (
            <IconButton
              svgIcon={CloseIcon}
              onClick={() => {
                if (showControls) {
                  exit()
                }
              }}
            />
          )}
        </div>
        <div className="absolute bottom-11 left-0 right-0 mx-4 flex items-end justify-between">
          <div className="flex justify-center items-center gap-2">
            <IconButton
              className={twJoin(isPaused && "pl-0.5")}
              svgIcon={isPaused ? PlayIcon : PauseIcon}
              onClick={() => {
                if (showControls) {
                  togglePlayPause()
                }
              }}
            />
            {mediaFiles.length > 1 && currentIndex > 0 && (
              <IconButton
                svgIcon={NextIcon}
                className="transform rotate-180"
                onClick={() => {
                  if (showControls) {
                    setCurrentIndex(currentIndex - 1)
                  }
                }}
              />
            )}
            {mediaFiles.length > 1 && currentIndex < mediaFiles.length - 1 && (
              <IconButton
                svgIcon={NextIcon}
                onClick={() => {
                  if (showControls) {
                    setCurrentIndex(currentIndex + 1)
                  }
                }}
              />
            )}
            <div className="hidden sm:block font-mono text-sm font-semibold pl-2">
              <span className="pr-2">{currentTime}</span>/
              <span className="pl-2">{totalTime}</span>
            </div>
          </div>
          <div className="flex justify-center items-end gap-2">
            <VolumeControl
              volume={volume}
              handleVolumeChange={handleVolumeChange}
            />
            {subtitleFile && (
              <div className="mr-0.5">
                <CaptionButton />
              </div>
            )}
            <div className={twJoin("relative", !subtitleFile && "mr-0.5")}>
              <PlaySpeedControl
                playSpeed={playSpeed}
                handlePlaybackSpeed={handlePlaybackSpeed}
              />
            </div>
            <IconButton
              svgIcon={isFullScreen ? ExitFullscreenIcon : FullscreenIcon}
              onClick={() => {
                if (showControls) {
                  toggleFullScreen()
                }
              }}
            />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 h-8 flex justify-center items-center mx-4">
          <input
            autoFocus
            className={twJoin(
              isSafari
                ? "appearance-none accent-white bg-transparent w-full cursor-pointer outline-none rounded-full h-2 border border-neutral-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                : "accent-white w-full cursor-pointer outline-none",
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
