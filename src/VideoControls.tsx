import { parse as srtVttParse } from "@plussub/srt-vtt-parser"
import React, { useCallback, useEffect, useState } from "react"
import { ParseResult, parse as samiParse } from "sami-parser"
import { twJoin } from "tailwind-merge"

import { MediaFile, getMediaFiles, getSubtitleFiles } from "./utils/getMediaFiles"

import Caption from "./Caption"
import { useFullScreen } from "./hooks/useFullScreen"
import MouseMoveOverlay from "./MouseMoveOverlay"
import ProgressBar from "./ProgressBar"
import VideoControlsBottom from "./VideoControlsBottom"
import VideoControlsTop from "./VideoControlsTop"

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  mediaFiles: MediaFile[]
  exit: () => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
  setMedia: (files: MediaFile[]) => void
  isAudio: boolean
  analyzerContainer: React.RefObject<HTMLDivElement | null>
  currentTime: string
  totalTime: string
  seekValue: string
  currentSubtitle: string
  videoRatio: number
  showControls: boolean
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>
  isPaused: boolean
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>
  setSubtitles: React.Dispatch<React.SetStateAction<ParseResult>>
  hasSubtitles: boolean
  mouseMoveTimeout: React.RefObject<number | null>
}

const VideoControls: React.FC<VideoControlsProps> = ({
  videoRef,
  mediaFiles,
  exit,
  currentIndex,
  setCurrentIndex,
  setMedia,
  isAudio,
  analyzerContainer,
  currentTime,
  totalTime,
  seekValue,
  currentSubtitle,
  videoRatio,
  showControls,
  setShowControls,
  isPaused,
  setIsPaused,
  setSubtitles,
  hasSubtitles,
  mouseMoveTimeout,
}) => {
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [volume, setVolume] = useState(localStorage.getItem("volume") || "0.5")
  const [playSpeed, setPlaySpeed] = useState(1)
  const { isFullScreen, toggleFullScreen } = useFullScreen()

  const getVideo = useCallback(() => {
    return videoRef && typeof videoRef === "object" && videoRef.current
  }, [videoRef])

  const parseSubtitle = useCallback((subtitleFile: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === "string") {
        if (subtitleFile.name.endsWith(".srt") || subtitleFile.name.endsWith(".vtt")) {
          setSubtitles(srtVttParse(content).entries.map((entry) => ({
            startTime: entry.from,
            endTime: entry.to,
            languages: {
              x: entry.text,
            },
          })))
        } else {
          setSubtitles(samiParse(content)?.result || [])
        }
      }
    }
    reader.readAsText(subtitleFile)
  }, [setSubtitles])

  useEffect(() => {
    const subtitleFile = mediaFiles[currentIndex].subtitleFile
    if (subtitleFile) {
      parseSubtitle(subtitleFile)
    } else {
      setSubtitles([])
    }
  }, [currentIndex, mediaFiles, parseSubtitle, setSubtitles])

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
    const video = getVideo()
    if (video) {
      video.volume = Number(volume)
    }
  }, [volume, getVideo])

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
    const video = videoRef?.current
    if (video) {
      if (video.paused || video.ended) {
        video.play()
        setIsPaused(false)
      } else {
        video.pause()
        setIsPaused(true)
      }
    }
  }, [videoRef, setIsPaused])

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
