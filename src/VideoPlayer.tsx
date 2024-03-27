import React, { useRef, useEffect } from "react"
import { parse as samiParse, ParseResult } from "sami-parser"
import AudioMotionAnalyzer from "audiomotion-analyzer"
import IconButton from "./IconButton"
import { hideElement, showElement } from "./utils/toggleHidden"
import { ReactComponent as CloseIcon } from "./assets/xmark.svg"
import { ReactComponent as PlayIcon } from "./assets/play.svg"
import { ReactComponent as PauseIcon } from "./assets/pause.svg"
import { ReactComponent as FullscreenIcon } from "./assets/expand.svg"
import { ReactComponent as ExitFullscreenIcon } from "./assets/compress.svg"
import { ReactComponent as VolumeIcon } from "./assets/volume-max.svg"
import { ReactComponent as MuteIcon } from "./assets/volume-mute.svg"
import { getSubtitleFiles } from "./utils/getSubtitleFiles"

interface VideoPlayerProps {
  videoFile: File
  isAudio?: boolean
  subtitleFile?: File
  exit: () => void
}

let subtitles: ParseResult = []

const parseSubtitles = (subtitleFile: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const smiContent = e.target?.result
    if (typeof smiContent === "string") {
      subtitles = samiParse(smiContent)?.result || []
    }
  }
  reader.readAsText(subtitleFile)
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoFile,
  isAudio = false,
  subtitleFile,
  exit,
}) => {
  const blob = new Blob([videoFile], {
    type: isAudio ? "audio/mpeg" : "video/mp4",
  })
  const videoSrc = URL.createObjectURL(blob)
  const videoPlayerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const totalTimeRef = useRef<HTMLSpanElement>(null)
  const seekRef = useRef<HTMLInputElement>(null)
  const volumnButton = useRef<HTMLButtonElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)

  let mouseMoveTimeout: number = 0

  if (subtitleFile) {
    parseSubtitles(subtitleFile)
  } else {
    subtitles = []
  }

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
      subtitles = []
    }
  }, [])

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
        const subtitleEl =
          document.querySelector<HTMLParagraphElement>("#subtitle")
        if (subtitleEl) {
          if (subtitles.length > 0) {
            const currentSubtitle = subtitles.find(
              (subtitle) =>
                video.currentTime * 1000 >= subtitle.startTime &&
                video.currentTime * 1000 <= subtitle.endTime,
            )
            if (currentSubtitle) {
              subtitleEl.innerText = Object.values(currentSubtitle.languages)[0]
            } else {
              subtitleEl.innerText = ""
            }
          } else {
            subtitleEl.innerText = ""
          }
        }
      }
      video.onloadedmetadata = () => {
        const visualizerEl = document.querySelector<HTMLElement>("#visualizer")
        if (video.videoWidth === 0) {
          showElement(visualizerEl)
          if (visualizerEl) {
            new AudioMotionAnalyzer(visualizerEl, {
              source: video,
              smoothing: 0.8,
              hideScaleX: true,
            })
          }
        } else {
          hideElement(visualizerEl)
        }
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
        showPlayIcon()
        video.play().then(() => {
          showPauseIcon()
        })
      }
      video.onended = () => {
        showPlayIcon()
      }
    }
  }, [videoRef])

  const handleSubtitleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const subtitleFiles = getSubtitleFiles(files)
    if (subtitleFiles.length > 0) {
      parseSubtitles(subtitleFiles[0])
    }
  }

  const showPlayIcon = () => {
    const playButton = document.querySelector("#playButton")
    const pauseButton = document.querySelector("#pauseButton")
    hideElement(pauseButton)
    showElement(playButton)
  }

  const showPauseIcon = () => {
    const playButton = document.querySelector("#playButton")
    const pauseButton = document.querySelector("#pauseButton")
    hideElement(playButton)
    showElement(pauseButton)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        showPauseIcon()
      } else {
        videoRef.current.pause()
        showPlayIcon()
      }
    }
  }

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
      />
      <div id="visualizer" className="absolute inset-0 hidden" />
      <p
        id="subtitle"
        className="absolute bottom-12 left-4 right-4 font-sans text-3xl text-center text-white font-semibold"
        style={{ textShadow: "0 0 8px black" }}
      ></p>
      <div
        ref={controlsRef}
        className="absolute inset-0 text-white transition-opacity duration-300 ease-in-out"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,75%),  rgba(0,0,0,0%), rgba(0,0,0,0%), rgba(0,0,0,75%)",
        }}
        onMouseEnter={(e) => {
          if (document.hasFocus() || videoRef.current?.paused) {
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
          if (document.hasFocus() || videoRef.current?.paused) {
            e.currentTarget.style.opacity = "1"
            e.currentTarget.style.cursor = "auto"
            mouseMoveTimeout = window.setTimeout(() => {
              if (controlsRef.current && !videoRef.current?.paused) {
                controlsRef.current.style.opacity = "0"
                controlsRef.current.style.cursor = "none"
              }
            }, 1000)
          } else {
            e.currentTarget.style.opacity = "0"
            e.currentTarget.style.cursor = "none"
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleSubtitleDrop}
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
