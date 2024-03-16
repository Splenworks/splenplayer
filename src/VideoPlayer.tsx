import React, { useRef, useEffect } from "react"
import { ReactComponent as CloseIcon } from "./assets/xmark.svg"
import { ReactComponent as PlayIcon } from "./assets/play.svg"
import { ReactComponent as PauseIcon } from "./assets/pause.svg"
import IconButton from "./IconButton"

interface VideoPlayerProps {
  videoFile: File
  exit: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoFile, exit }) => {
  const videoSrc = URL.createObjectURL(videoFile)
  const videoPlayerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const playButtonRef = useRef<HTMLButtonElement>(null)
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const totalTimeRef = useRef<HTMLSpanElement>(null)
  const seekRef = useRef<HTMLInputElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)

  let mouseMoveTimeout: number = 0

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        if (playButtonRef.current) {
          playButtonRef.current
            .querySelector(".playIcon")
            ?.classList.add("hidden")
          playButtonRef.current
            .querySelector(".pauseIcon")
            ?.classList.remove("hidden")
        }
      } else {
        videoRef.current.pause()
        if (playButtonRef.current) {
          playButtonRef.current
            .querySelector(".playIcon")
            ?.classList.remove("hidden")
          playButtonRef.current
            .querySelector(".pauseIcon")
            ?.classList.add("hidden")
        }
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.ontimeupdate = () => {
        if (currentTimeRef.current) {
          currentTimeRef.current.innerText = video.currentTime.toFixed(2)
        }
        if (seekRef.current) {
          seekRef.current.value =
            (video.currentTime / video.duration) * 100 + ""
        }
      }
      video.onloadedmetadata = () => {
        if (totalTimeRef.current) {
          totalTimeRef.current.innerText = video.duration.toFixed(2)
        }
        if (volumeRef.current) {
          volumeRef.current.value = "0.5"
        }
        if (seekRef.current) {
          seekRef.current.value = "0"
        }
      }
    }
  }, [videoRef])

  const handleVolumeChange = () => {
    const volumeControl = volumeRef.current
    const video = videoRef.current
    if (volumeControl && video) {
      video.volume = Number(volumeControl.value)
    }
  }

  const handleSeek = () => {
    const seekControl = seekRef.current
    const video = videoRef.current
    if (seekControl && video) {
      const seekTime = (video.duration / 100) * Number(seekControl.value)
      video.currentTime = seekTime
    }
  }

  const toggleFullScreen = () => {
    const videoPlayer = videoPlayerRef.current
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
    <div
      ref={videoPlayerRef}
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black"
    >
      <video
        ref={videoRef}
        className="max-h-full max-w-full min-h-full min-w-full"
        src={videoSrc}
        autoPlay
      />
      <div
        ref={controlsRef}
        className="absolute inset-0 text-white"
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1"
          e.currentTarget.style.cursor = "auto"
        }}
        onMouseMove={(e) => {
          if (mouseMoveTimeout) {
            clearTimeout(mouseMoveTimeout)
          }
          e.currentTarget.style.opacity = "1"
          e.currentTarget.style.cursor = "auto"
          if (document.hasFocus()) {
            mouseMoveTimeout = window.setTimeout(() => {
              if (controlsRef.current) {
                controlsRef.current.style.opacity = "0"
                controlsRef.current.style.cursor = "none"
              }
            }, 1000)
          }
        }}
      >
        <IconButton
          svgIcon={CloseIcon}
          onClick={exit}
          className="absolute top-2 right-2"
        />
        <div className="absolute bottom-4 left-0 p-4">
          <button
            className="top-2 right-2 w-8 h-8 flex justify-center items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-colors duration-300 ease-in-out"
            ref={playButtonRef}
            onClick={togglePlayPause}
          >
            <PauseIcon className="pauseIcon w-6 h-6 text-white" />
            <PlayIcon className="hidden playIcon w-6 h-6 text-white" />
          </button>
        </div>
        <div>
          Current time: <span ref={currentTimeRef}></span>/ Total time:{" "}
          <span ref={totalTimeRef}></span>
        </div>
        Seek:{" "}
        <input
          ref={seekRef}
          type="range"
          min="0"
          max="100"
          onChange={handleSeek}
        />
        <br />
        Volumen:{" "}
        <input
          ref={volumeRef}
          type="range"
          min="0"
          max="1"
          step="0.1"
          onChange={handleVolumeChange}
        />
        <br />
        <button onClick={toggleFullScreen}>Fullscreen</button>
      </div>
    </div>
  )
}

export default VideoPlayer
