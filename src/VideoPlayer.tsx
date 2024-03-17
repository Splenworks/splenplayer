import React, { useRef, useEffect } from "react"
import IconButton from "./IconButton"
import { toggleHidden, hideElement, showElement } from "./utils/toggleHidden"
import { ReactComponent as CloseIcon } from "./assets/xmark.svg"
import { ReactComponent as PlayIcon } from "./assets/play.svg"
import { ReactComponent as PauseIcon } from "./assets/pause.svg"
import { ReactComponent as FullscreenIcon } from "./assets/expand.svg"
import { ReactComponent as ExitFullscreenIcon } from "./assets/compress.svg"
import { ReactComponent as VolumeIcon } from "./assets/volume-max.svg"
import { ReactComponent as MuteIcon } from "./assets/volume-mute.svg"

interface VideoPlayerProps {
  videoFile: File
  subtitleFile?: File
  exit: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoFile,
  subtitleFile,
  exit,
}) => {
  const videoSrc = URL.createObjectURL(videoFile)
  const videoPlayerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const totalTimeRef = useRef<HTMLSpanElement>(null)
  const seekRef = useRef<HTMLInputElement>(null)
  const volumnButton = useRef<HTMLButtonElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)

  let mouseMoveTimeout: number = 0

  const togglePlayPause = () => {
    if (videoRef.current) {
      const playButton = document.querySelector("#playButton")
      const pauseButton = document.querySelector("#pauseButton")
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        toggleHidden(playButton)
        toggleHidden(pauseButton)
      } else {
        videoRef.current.pause()
        toggleHidden(playButton)
        toggleHidden(pauseButton)
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.ontimeupdate = () => {
        if (currentTimeRef.current) {
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
            currentTimeRef.current.innerText = `${minute}:${second}`
          } else {
            currentTimeRef.current.innerText = `${hour}:${minute}:${second}`
          }
        }
        if (seekRef.current) {
          seekRef.current.value =
            (video.currentTime / video.duration) * 100 + ""
        }
      }
      video.onloadedmetadata = () => {
        if (totalTimeRef.current) {
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
            totalTimeRef.current.innerText = `${minute}:${second}`
          } else {
            totalTimeRef.current.innerText = `${hour}:${minute}:${second}`
          }
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

  useEffect(() => {
    const fullscreenChange = () => {
      const exitButton = document.querySelector("#exitButton")
      const fullScreenButton = document.querySelector("#fullScreenButton")
      const exitFullScreenButton = document.querySelector(
        "#exitFullScreenButton",
      )
      if (!document.fullscreenElement) {
        showElement(exitButton)
        showElement(fullScreenButton)
        hideElement(exitFullScreenButton)
      } else {
        hideElement(exitButton)
        hideElement(fullScreenButton)
        showElement(exitFullScreenButton)
      }
    }
    addEventListener("fullscreenchange", fullscreenChange)
    return () => {
      removeEventListener("fullscreenchange", fullscreenChange)
    }
  }, [])

  const handleVolumeChange = () => {
    const volumeControl = volumeRef.current
    const video = videoRef.current
    if (volumeControl && video) {
      video.volume = Number(volumeControl.value)
      const volumeIcon = document.querySelector("#volumeIcon")
      const muteIcon = document.querySelector("#muteIcon")
      if (video.volume === 0) {
        hideElement(volumeIcon)
        showElement(muteIcon)
      } else {
        showElement(volumeIcon)
        hideElement(muteIcon)
      }
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
        className="absolute inset-0 text-white transition-opacity duration-300 ease-in-out"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,75%),  rgba(0,0,0,0%), rgba(0,0,0,0%), rgba(0,0,0,75%)",
        }}
        onMouseEnter={(e) => {
          if (document.hasFocus()) {
            e.currentTarget.style.opacity = "1"
            e.currentTarget.style.cursor = "auto"
          } else {
            e.currentTarget.style.opacity = "0"
            e.currentTarget.style.cursor = "none"
          }
        }}
        onMouseMove={(e) => {
          if (mouseMoveTimeout) {
            clearTimeout(mouseMoveTimeout)
          }
          if (document.hasFocus()) {
            e.currentTarget.style.opacity = "1"
            e.currentTarget.style.cursor = "auto"
            mouseMoveTimeout = window.setTimeout(() => {
              if (controlsRef.current) {
                controlsRef.current.style.opacity = "0"
                controlsRef.current.style.cursor = "none"
              }
            }, 1000)
          } else {
            e.currentTarget.style.opacity = "0"
            e.currentTarget.style.cursor = "none"
          }
        }}
      >
        <IconButton
          id="exitButton"
          svgIcon={CloseIcon}
          onClick={exit}
          className="absolute top-4 right-4"
        />
        <div className="absolute bottom-11 left-0 right-0 h-8 mx-4 flex justify-between">
          <div className="flex justify-center items-center gap-2">
            <IconButton
              id="playButton"
              className="hidden pl-0.5"
              svgIcon={PlayIcon}
              onClick={togglePlayPause}
            />
            <IconButton
              id="pauseButton"
              svgIcon={PauseIcon}
              onClick={togglePlayPause}
            />
            <div className="font-mono text-sm font-semibold">
              <span className="pr-2" ref={currentTimeRef}></span>/
              <span className="pl-2" ref={totalTimeRef}></span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="overflow-hidden w-10 hover:w-40 p-1 h-10 flex flex-row-reverse justify-left items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out">
              <button ref={volumnButton} className="w-6 h-6 mx-2">
                <VolumeIcon id="volumeIcon" className="w-6 h-6 text-white" />
                <MuteIcon id="muteIcon" className="hidden w-6 h-6 text-white" />
              </button>
              <input
                ref={volumeRef}
                className="accent-white cursor-pointer w-24 mr-0.5 outline-none"
                type="range"
                min="0"
                max="1"
                step="0.1"
                onChange={handleVolumeChange}
              />
            </div>
            <IconButton
              id="fullScreenButton"
              svgIcon={FullscreenIcon}
              onClick={toggleFullScreen}
            />
            <IconButton
              id="exitFullScreenButton"
              className="hidden"
              svgIcon={ExitFullscreenIcon}
              onClick={toggleFullScreen}
            />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 h-8 flex justify-center items-center mx-4">
          <input
            ref={seekRef}
            className="accent-white w-full cursor-pointer outline-none"
            type="range"
            min="0"
            max="100"
            onChange={handleSeek}
          />
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
