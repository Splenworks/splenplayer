import { parse as srtVttParse } from "@plussub/srt-vtt-parser"
import AudioMotionAnalyzer from "audiomotion-analyzer"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ParseResult, parse as samiParse } from "sami-parser"
import { twJoin } from "tailwind-merge"

import { isSafari } from "./utils/browser"
import { MediaFile, getMediaFiles, getSubtitleFiles } from "./utils/getMediaFiles"
import { replaceBasicHtmlEntities } from "./utils/html"

import Caption from "./Caption"
import { useFullScreen } from "./hooks/useFullScreen"
import MouseMoveOverlay from "./MouseMoveOverlay"
import ProgressBar from "./ProgressBar"
import { hashCode } from "./utils/hashCode"
import VideoControlsBottom from "./VideoControlsBottom"
import VideoControlsTop from "./VideoControlsTop"

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  mediaFiles: MediaFile[]
  exit: () => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
  setMedia: (files: MediaFile[]) => void
}

const VideoControls: React.FC<VideoControlsProps> = ({
  videoRef,
  mediaFiles,
  exit,
  currentIndex,
  setCurrentIndex,
  setMedia,
}) => {
  const [showControls, setShowControls] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
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
  const hasSubtitles = subtitles.current.length > 0
  const [videoRatio, setVideoRatio] = useState(0)
  const { isFullScreen, toggleFullScreen } = useFullScreen()
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

  const parseSubtitle = useCallback((subtitleFile: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === "string") {
        if (subtitleFile.name.endsWith(".srt") || subtitleFile.name.endsWith(".vtt")) {
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
        if (video.duration > 90) {
          if (video.currentTime >= 30 && video.currentTime < video.duration - 30) {
            localStorage.setItem(videoFileHash, video.currentTime + "")
          } else if (video.currentTime < 30 || video.currentTime >= video.duration - 30) {
            localStorage.removeItem(videoFileHash)
          }
        }
        if (hasSubtitles) {
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
          if (analyzerContainer.current && analyzer.current === null && !isSafari) {
            analyzer.current = new AudioMotionAnalyzer(analyzerContainer.current, {
              source: video,
              smoothing: 0.8,
              showScaleX: false,
            })
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
  }, [getVideo, mediaFiles.length, currentIndex, setCurrentIndex, videoFileHash, hasSubtitles])

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
    return () => {
      analyzer.current?.destroy()
      analyzer.current = null
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const video = getVideo()
      if (!video) return
      if (event.key === "Escape" && !isFullScreen) {
        exit()
      } else if (event.key === "ArrowLeft") {
        video.currentTime -= 5
      } else if (event.key === "ArrowRight") {
        video.currentTime += 5
      } else if (event.key === " ") {
        togglePlayPause()
      } else if (event.key === "f") {
        toggleFullScreen()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [exit, getVideo, togglePlayPause, isFullScreen, toggleFullScreen])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = getVideo()
    if (video) {
      const seekTime = (video.duration / 100) * Number(e.currentTarget.value)
      video.currentTime = seekTime
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
    <div className="fixed top-0 right-0 bottom-0 left-0">
      <div
        ref={analyzerContainer}
        className={twJoin("absolute inset-0", isAudio ? "flex" : "hidden")}
      />
      {showSubtitle && hasSubtitles && (
        <Caption caption={currentSubtitle} videoRatio={videoRatio} />
      )}
      <MouseMoveOverlay
        showControls={showControls}
        setShowControls={setShowControls}
        mouseMoveTimeoutRef={mouseMoveTimeout}
        videoPaused={isPaused}
      >
        <div
          className="absolute inset-0"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <VideoControlsTop
            showControls={showControls}
            isFullScreen={isFullScreen}
            mediaFiles={mediaFiles}
            currentIndex={currentIndex}
            exit={exit}
          />
          <VideoControlsBottom
            showControls={showControls}
            isPaused={isPaused}
            mediaFilesCount={mediaFiles.length}
            currentMediaIndex={currentIndex}
            setCurrentMediaIndex={setCurrentIndex}
            currentTime={currentTime}
            totalTime={totalTime}
            togglePlayPause={togglePlayPause}
            volume={volume}
            handleVolumeChange={handleVolumeChange}
            hasSubtitles={hasSubtitles}
            showSubtitle={showSubtitle}
            toggleShowSubtitle={() => setShowSubtitle((prev) => !prev)}
            playSpeed={playSpeed}
            handlePlaybackSpeed={handlePlaybackSpeed}
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
          />
          <ProgressBar handleSeek={handleSeek} seekValue={seekValue} />
        </div>
      </MouseMoveOverlay>
    </div>
  )
}

export default VideoControls
