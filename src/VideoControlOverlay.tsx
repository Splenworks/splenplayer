import React, { useCallback, useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { MediaFile } from "./utils/getMediaFiles"
import { isSafari } from "./utils/browserDetect"
import { isMac } from "./utils/isMac"
import PlaySpeedButton from "./playSpeedButton"

import IconButton from "./IconButton"
import PlayIcon from "./assets/play.svg?react"
import PauseIcon from "./assets/pause.svg?react"
import NextIcon from "./assets/next.svg?react"
import CloseIcon from "./assets/xmark.svg?react"
import FullscreenIcon from "./assets/expand.svg?react"
import ExitFullscreenIcon from "./assets/compress.svg?react"
import VolumeIcon from "./assets/volume-max.svg?react"
import MuteIcon from "./assets/volume-mute.svg?react"
import PlaybackSpeedIcon from "./assets/playback-speed.svg?react"

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
      }
      video.onloadedmetadata = () => {
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
        video.volume = Number(volume)
        setSeekValue("0")
        handlePlaybackSpeed(playSpeed)
        video.play().then(() => {
          setIsPaused(false)
        })
      }
      video.onended = () => {
        if (currentIndex < mediaFiles.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setShowControls(true)
          mouseMoveTimeout.current = window.setTimeout(() => {
            if (!videoRef.current?.paused) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    videoRef,
    // volume,
    mediaFiles.length,
    currentIndex,
    handlePlaybackSpeed,
    setCurrentIndex,
  ])

  const togglePlayPause = useCallback(() => {
    const video = videoRef && typeof videoRef === "object" && videoRef.current
    if (video) {
      if (video.paused || video.ended) {
        videoRef.current.play()
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
      // subtitles = []
      // analyzer?.destroy()
      // analyzer = null
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
        // onDragOver={(e) => e.preventDefault()}
        // onDrop={handleSubtitleDrop}
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
            <div className="overflow-hidden w-10 hover:w-40 p-1 h-10 flex flex-row-reverse items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out">
              <button
                tabIndex={-1}
                className="w-6 h-6 mx-2 outline-none focus:outline-none"
              >
                {Number(volume) === 0 ? (
                  <MuteIcon className="w-6 h-6 text-white" />
                ) : (
                  <VolumeIcon className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                tabIndex={-1}
                className="accent-white cursor-pointer w-24 mr-0.5 outline-none focus:outline-none"
                type="range"
                min="0"
                max="1"
                step="0.1"
                onChange={handleVolumeChange}
                onKeyDown={(e) => {
                  e.stopPropagation()
                }}
                value={volume}
              />
            </div>
            <div className="relative mr-0.5">
              <div className="overflow-hidden cursor-pointer h-10 hover:h-[212px] flex flex-col-reverse items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out peer">
                <div className="w-10 h-10">
                  <PlaybackSpeedIcon className="w-6 h-6 text-white m-2" />
                </div>
                <PlaySpeedButton
                  playSpeed={1}
                  onClick={() => handlePlaybackSpeed(1)}
                  isSelected={playSpeed === 1}
                />
                <PlaySpeedButton
                  playSpeed={1.2}
                  onClick={() => handlePlaybackSpeed(1.2)}
                  isSelected={playSpeed === 1.2}
                />
                <PlaySpeedButton
                  playSpeed={1.4}
                  onClick={() => handlePlaybackSpeed(1.4)}
                  isSelected={playSpeed === 1.4}
                />
                <PlaySpeedButton
                  playSpeed={1.6}
                  onClick={() => handlePlaybackSpeed(1.6)}
                  isSelected={playSpeed === 1.6}
                />
                <PlaySpeedButton
                  playSpeed={1.8}
                  onClick={() => handlePlaybackSpeed(1.8)}
                  isSelected={playSpeed === 1.8}
                />
                <PlaySpeedButton
                  playSpeed={2}
                  onClick={() => handlePlaybackSpeed(2)}
                  isSelected={playSpeed === 2}
                  className="h-8 pt-1"
                />
              </div>
              <div
                className={twJoin(
                  "peer-hover:opacity-0 flex text-xs text-white left-1 right-0 -bottom-[9px] absolute items-center justify-center transition-opacity duration-300 ease-in-out",
                  playSpeed === 1 ? "opacity-0" : "opacity-100",
                )}
              >
                <span>{playSpeed.toFixed(1)}</span>
                <CloseIcon className="w-[10px] h-3" />
              </div>
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
