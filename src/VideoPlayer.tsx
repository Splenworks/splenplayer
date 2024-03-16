import React, { useRef, useEffect } from "react"
import IconButton from "./IconButton"
import { ReactComponent as CloseIcon } from "./assets/xmark.svg"
import { ReactComponent as PlayIcon } from "./assets/play.svg"
import { ReactComponent as PauseIcon } from "./assets/pause.svg"
import { ReactComponent as FullscreenIcon } from "./assets/expand.svg"
import { ReactComponent as ExitFullscreenIcon } from "./assets/compress.svg"
import { ReactComponent as VolumeIcon } from "./assets/volume-max.svg"
import { ReactComponent as MuteIcon } from "./assets/volume-mute.svg"

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
  const volumnButton = useRef<HTMLButtonElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)

  let mouseMoveTimeout: number = 0

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        if (playButtonRef.current) {
          playButtonRef.current
            .querySelector("#playIcon")
            ?.classList.add("hidden")
          playButtonRef.current
            .querySelector("#pauseIcon")
            ?.classList.remove("hidden")
        }
      } else {
        videoRef.current.pause()
        if (playButtonRef.current) {
          playButtonRef.current
            .querySelector("#playIcon")
            ?.classList.remove("hidden")
          playButtonRef.current
            .querySelector("#pauseIcon")
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

  const handleVolumeChange = () => {
    const volumeControl = volumeRef.current
    const video = videoRef.current
    if (volumeControl && video) {
      video.volume = Number(volumeControl.value)
      if (video.volume === 0) {
        if (volumnButton.current) {
          volumnButton.current
            .querySelector("#volumeIcon")
            ?.classList.add("hidden")
          volumnButton.current
            .querySelector("#muteIcon")
            ?.classList.remove("hidden")
        }
      } else {
        if (volumnButton.current) {
          volumnButton.current
            .querySelector("#volumeIcon")
            ?.classList.remove("hidden")
          volumnButton.current
            .querySelector("#muteIcon")
            ?.classList.add("hidden")
        }
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
      document.querySelector("#exitButton")?.classList.add("hidden")
      document.querySelector("#fullScreenButton")?.classList.add("hidden")
      document
        .querySelector("#exitFullScreenButton")
        ?.classList.remove("hidden")
      document.querySelector("#exitFullScreenButton")?.classList.add("flex")
      videoPlayer.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
        )
        document.querySelector("#exitButton")?.classList.remove("hidden")
        document.querySelector("#fullScreenButton")?.classList.remove("hidden")
        document.querySelector("#exitFullScreenButton")?.classList.add("hidden")
      })
    } else {
      document.exitFullscreen()
      document.querySelector("#exitButton")?.classList.remove("hidden")
      document.querySelector("#fullScreenButton")?.classList.remove("hidden")
      document.querySelector("#exitFullScreenButton")?.classList.add("hidden")
      document.querySelector("#exitFullScreenButton")?.classList.add("flex")
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
        <div className="absolute bottom-9 left-0 right-0 h-8 mx-4 flex justify-between">
          <div className="flex justify-center items-center gap-2">
            <button
              className="w-8 h-8 flex justify-center items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-colors duration-300 ease-in-out"
              ref={playButtonRef}
              onClick={togglePlayPause}
            >
              <PauseIcon id="pauseIcon" className="w-6 h-6 text-white" />
              <PlayIcon id="playIcon" className="hidden w-6 h-6 text-white" />
            </button>
            <div className="font-mono text-sm font-semibold">
              <span className="pr-2" ref={currentTimeRef}></span>/
              <span className="pl-2" ref={totalTimeRef}></span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="overflow-hidden w-8 hover:w-32 p-1 h-8 flex flex-row-reverse justify-left items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out">
              <button ref={volumnButton} className="w-6 h-6">
                <VolumeIcon id="volumeIcon" className="w-6 h-6 text-white" />
                <MuteIcon
                  id="muteIcon"
                  className="hidden muteIcon w-6 h-6 text-white"
                />
              </button>
              <input
                ref={volumeRef}
                className="accent-white cursor-pointer w-20 mx-2"
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
        <div className="absolute bottom-1 left-0 right-0 h-8 flex justify-center items-center mx-4">
          <input
            ref={seekRef}
            className="accent-white w-full cursor-pointer"
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
