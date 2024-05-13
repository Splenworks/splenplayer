import React, { useRef, useEffect, useCallback, useState } from "react"
import { parse as samiParse, ParseResult } from "sami-parser"
import { parse as srtVttParse } from "@plussub/srt-vtt-parser"
import AudioMotionAnalyzer from "audiomotion-analyzer"
import IconButton from "./IconButton"
import { hideElement, showElement } from "./utils/toggleHidden"
import { ReactComponent as CloseIcon } from "./assets/xmark.svg"
import { ReactComponent as FullscreenIcon } from "./assets/expand.svg"
import { ReactComponent as ExitFullscreenIcon } from "./assets/compress.svg"
import { ReactComponent as VolumeIcon } from "./assets/volume-max.svg"
import { ReactComponent as MuteIcon } from "./assets/volume-mute.svg"
import { ReactComponent as NextIcon } from "./assets/next.svg"
import { getSubtitleFiles } from "./utils/getMediaFiles"
import { replaceBasicHtmlEntities } from "./utils/replaceBasicHtmlEntities"
import { twJoin } from "tailwind-merge"
import { isSafari } from "./utils/browserDetect"
import { isMac } from "./utils/isMac"
import PlayButton, { showPauseIcon, showPlayIcon } from "./PlayButton"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  exit: () => void
}

// These variables are outside the component
// to prevent the video player re-rendering when the state changes
let subtitles: ParseResult = []
let mouseMoveTimeout: number = 0
let analyzer: AudioMotionAnalyzer | null = null

const VideoPlayer: React.FC<VideoPlayerProps> = ({ mediaFiles, exit }) => {
  const videoPlayerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const totalTimeRef = useRef<HTMLSpanElement>(null)
  const seekRef = useRef<HTMLInputElement>(null)
  const volumnButton = useRef<HTMLButtonElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)
  const volume = localStorage.getItem("volume") || "0.5"
  const [currentIndex, setCurrentIndex] = useState(0)
  const blob = new Blob([mediaFiles[currentIndex].file], {
    type:
      mediaFiles[currentIndex].type === "audio" ? "audio/mpeg" : "video/mp4",
  })
  const videoSrc = URL.createObjectURL(blob)
  const subtitleFile = mediaFiles[currentIndex].subtitleFile

  const parseSubtitle = useCallback((subtitleFile: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === "string") {
        if (
          subtitleFile.name.endsWith(".srt") ||
          subtitleFile.name.endsWith(".vtt")
        ) {
          subtitles = srtVttParse(content).entries.map((entry) => ({
            startTime: entry.from,
            endTime: entry.to,
            languages: {
              x: entry.text,
            },
          }))
        } else {
          subtitles = samiParse(content)?.result || []
        }
      }
    }
    reader.readAsText(subtitleFile)
  }, [])

  if (subtitleFile) {
    parseSubtitle(subtitleFile)
  } else {
    subtitles = []
  }

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        showPauseIcon()
      } else {
        videoRef.current.pause()
        showPlayIcon()
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
      subtitles = []
      analyzer?.destroy()
      analyzer = null
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!document.fullscreenElement) {
          exit()
        }
      } else if (event.key === "ArrowLeft") {
        if (videoRef.current) {
          videoRef.current.currentTime -= 5
        }
      } else if (event.key === "ArrowRight") {
        if (videoRef.current) {
          videoRef.current.currentTime += 5
        }
      } else if (event.key === " ") {
        togglePlayPause()
      } else if (
        event.key === "f" ||
        (isMac && event.metaKey) ||
        (!isMac && event.altKey)
      ) {
        toggleFullScreen()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [exit, togglePlayPause])

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
              const text = Object.values(currentSubtitle.languages)[0]
              subtitleEl.innerText = replaceBasicHtmlEntities(text)
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
          if (visualizerEl && analyzer === null && !isSafari) {
            analyzer = new AudioMotionAnalyzer(visualizerEl, {
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
          volumeRef.current.value = volume
          const volumeNum = Number(volume)
          video.volume = volumeNum
          if (volumeNum === 0) {
            const volumeIcon = document.querySelector("#volumeIcon")
            const muteIcon = document.querySelector("#muteIcon")
            hideElement(volumeIcon)
            showElement(muteIcon)
          }
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
        if (currentIndex < mediaFiles.length - 1) {
          setCurrentIndex(currentIndex + 1)
          controlsRef.current?.style.setProperty("opacity", "1")
          controlsRef.current?.style.setProperty("cursor", "auto")
          mouseMoveTimeout = window.setTimeout(() => {
            if (controlsRef.current && !videoRef.current?.paused) {
              controlsRef.current.style.opacity = "0"
              controlsRef.current.style.cursor = "none"
            }
          }, 2000)
        } else {
          showPlayIcon()
          controlsRef.current?.style.setProperty("opacity", "1")
          controlsRef.current?.style.setProperty("cursor", "auto")
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
  }, [videoRef, volume, mediaFiles.length, currentIndex])

  const handleSubtitleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const subtitleFiles = getSubtitleFiles(files)
    if (subtitleFiles.length > 0) {
      parseSubtitle(subtitleFiles[0])
    }
  }

  const handleVolumeChange = () => {
    const volumeControl = volumeRef.current
    const video = videoRef.current
    if (volumeControl && video) {
      video.volume = Number(volumeControl.value)
      localStorage.setItem("volume", volumeControl.value)
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
            "linear-gradient(to bottom, rgba(0,0,0,75%), rgba(0,0,0,0%), rgba(0,0,0,0%), rgba(0,0,0,75%)",
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
        <div className="absolute top-4 left-6 right-4 flex justify-between items-center">
          <span className="font-semibold text-xl">
            {mediaFiles[currentIndex].file.name}{" "}
            {mediaFiles.length > 1 && (
              <>
                [{currentIndex + 1}/{mediaFiles.length}]
              </>
            )}
          </span>
          <IconButton
            id="exitButton"
            svgIcon={CloseIcon}
            onClick={() => {
              if (controlsRef.current?.style.opacity !== "0") {
                exit()
              }
            }}
          />
        </div>
        <div className="absolute bottom-11 left-0 right-0 h-8 mx-4 flex items-center justify-between">
          <div className="flex justify-center items-center gap-2">
            <PlayButton
              onClick={() => {
                if (controlsRef.current?.style.opacity !== "0") {
                  togglePlayPause()
                }
              }}
            />
            {mediaFiles.length > 1 && currentIndex > 0 && (
              <IconButton
                svgIcon={NextIcon}
                className="transform rotate-180"
                onClick={() => {
                  if (controlsRef.current?.style.opacity !== "0") {
                    setCurrentIndex(currentIndex - 1)
                  }
                }}
              />
            )}
            {mediaFiles.length > 1 && currentIndex < mediaFiles.length - 1 && (
              <IconButton
                svgIcon={NextIcon}
                onClick={() => {
                  if (controlsRef.current?.style.opacity !== "0") {
                    setCurrentIndex(currentIndex + 1)
                  }
                }}
              />
            )}
            <div className="hidden sm:block font-mono text-sm font-semibold pl-2">
              <span className="pr-2" ref={currentTimeRef}>
                00:00
              </span>
              /
              <span className="pl-2" ref={totalTimeRef}>
                00:00
              </span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="overflow-hidden w-10 hover:w-40 p-1 h-10 flex flex-row-reverse justify-left items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out">
              <button
                ref={volumnButton}
                tabIndex={-1}
                className="w-6 h-6 mx-2 outline-none focus:outline-none"
              >
                <VolumeIcon id="volumeIcon" className="w-6 h-6 text-white" />
                <MuteIcon id="muteIcon" className="hidden w-6 h-6 text-white" />
              </button>
              <input
                ref={volumeRef}
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
              />
            </div>
            <IconButton
              id="fullScreenButton"
              svgIcon={FullscreenIcon}
              onClick={() => {
                if (controlsRef.current?.style.opacity !== "0") {
                  toggleFullScreen()
                }
              }}
            />
            <IconButton
              id="exitFullScreenButton"
              className="hidden"
              svgIcon={ExitFullscreenIcon}
              onClick={() => {
                if (controlsRef.current?.style.opacity !== "0") {
                  toggleFullScreen()
                }
              }}
            />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 h-8 flex justify-center items-center mx-4">
          <input
            autoFocus
            ref={seekRef}
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
          />
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
