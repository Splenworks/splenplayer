import React, { useCallback, useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import IconButton from "./IconButton"
import CloseIcon from "./assets/xmark.svg?react"
import FullscreenIcon from "./assets/expand.svg?react"
import ExitFullscreenIcon from "./assets/compress.svg?react"
import { MediaFile } from "./utils/getMediaFiles"
import PlayIcon from "./assets/play.svg?react"
import PauseIcon from "./assets/pause.svg?react"

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
  const mouseMoveTimeout = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
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
  }, [videoRef, mediaFiles, currentIndex, setCurrentIndex])

  const togglePlayPause = useCallback(() => {
    if (videoRef && typeof videoRef === "object" && videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        setIsPaused(false)
      } else {
        videoRef.current.pause()
        setIsPaused(true)
      }
    }
  }, [videoRef])

  useEffect(() => {
    const fullscreenChange = () => {
      // const exitButton = document.querySelector("#exitButton")
      if (!document.fullscreenElement) {
        // showElement(exitButton)
        setIsFullScreen(false)
      } else {
        // hideElement(exitButton)
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

  const toggleFullScreen = () => {
    const videoPlayer = document.querySelector("#videoPlayer")
    if (!videoPlayer) return

    if (!document.fullscreenElement) {
      videoPlayer.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
        )
      })
    } else {
      document.exitFullscreen()
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
            {/* {mediaFiles[currentIndex].file.name}{" "}
            {mediaFiles.length > 1 && (
              <>
                [{currentIndex + 1}/{mediaFiles.length}]
              </>
            )} */}
          </span>
          <IconButton
            id="exitButton"
            svgIcon={CloseIcon}
            onClick={() => {
              if (showControls) {
                exit()
              }
            }}
          />
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
            {/* {mediaFiles.length > 1 && currentIndex > 0 && (
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
              )} */}
            <div className="hidden sm:block font-mono text-sm font-semibold pl-2">
              <span className="pr-2">{currentTime}</span>/
              <span className="pl-2">{totalTime}</span>
            </div>
          </div>
          <div className="flex justify-center items-end gap-2">
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
      </div>
    </div>
  )
}

export default VideoControlOverlay
