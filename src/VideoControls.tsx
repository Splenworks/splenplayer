import { parse as srtVttParse } from "@plussub/srt-vtt-parser"
import React, { useCallback, useEffect, useState } from "react"
import { ParseResult, parse as samiParse } from "sami-parser"

import { MediaFile, getMediaFiles, getSubtitleFiles } from "./utils/getMediaFiles"
import { extractMkvSubtitleParseResult } from "./utils/mkvSubtitles"

import ActionOverlay from "./ActionOverlay"
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
  currentTime: string
  totalTime: string
  seekValue: string
  showControls: boolean
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>
  isPaused: boolean
  isAudio: boolean
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>
  setSubtitles: React.Dispatch<React.SetStateAction<ParseResult>>
  hasSubtitles: boolean
  showSubtitle: boolean
  setShowSubtitle: React.Dispatch<React.SetStateAction<boolean>>
  subtitleTracks: string[]
  selectedSubtitleTrack: string | null
  setSelectedSubtitleTrack: React.Dispatch<React.SetStateAction<string | null>>
  mouseMoveTimeout: React.RefObject<number | null>
}

const VideoControls: React.FC<VideoControlsProps> = ({
  videoRef,
  mediaFiles,
  exit,
  currentIndex,
  setCurrentIndex,
  setMedia,
  currentTime,
  totalTime,
  seekValue,
  showControls,
  setShowControls,
  isPaused,
  isAudio,
  setIsPaused,
  setSubtitles,
  hasSubtitles,
  showSubtitle,
  setShowSubtitle,
  subtitleTracks,
  selectedSubtitleTrack,
  setSelectedSubtitleTrack,
  mouseMoveTimeout,
}) => {
  const [volume, setVolume] = useState(localStorage.getItem("volume") || "0.5")
  const [playSpeed, setPlaySpeed] = useState(1)
  const [isMediaListHovered, setIsMediaListHovered] = useState(false)
  const { isFullScreen, toggleFullScreen } = useFullScreen()

  const getVideo = useCallback(() => {
    return videoRef && typeof videoRef === "object" && videoRef.current
  }, [videoRef])

  const parseSubtitleFile = useCallback(async (subtitleFile: File): Promise<ParseResult> => {
    const content = await subtitleFile.text()
    const lowerCaseSubtitleFileName = subtitleFile.name.toLowerCase()
    if (lowerCaseSubtitleFileName.endsWith(".srt") || lowerCaseSubtitleFileName.endsWith(".vtt")) {
      return srtVttParse(content).entries.map((entry) => ({
        startTime: entry.from,
        endTime: entry.to,
        languages: {
          x: entry.text,
        },
      }))
    }
    return samiParse(content)?.result || []
  }, [])

  const parseSubtitle = useCallback(
    async (subtitleFile: File) => {
      try {
        setSubtitles(await parseSubtitleFile(subtitleFile))
      } catch (error) {
        console.error("Failed to parse subtitle file:", error)
        setSubtitles([])
      }
    },
    [parseSubtitleFile, setSubtitles],
  )

  useEffect(() => {
    const currentMedia = mediaFiles[currentIndex]
    if (!currentMedia) {
      setSubtitles([])
      return
    }

    let shouldIgnoreResult = false
    const setSubtitlesSafely = (parsedSubtitles: ParseResult) => {
      if (!shouldIgnoreResult) {
        setSubtitles(parsedSubtitles)
      }
    }

    const loadSubtitles = async () => {
      try {
        if (currentMedia.subtitleFile) {
          setSubtitlesSafely(await parseSubtitleFile(currentMedia.subtitleFile))
          return
        }

        if (currentMedia.file.name.toLowerCase().endsWith(".mkv")) {
          setSubtitlesSafely(await extractMkvSubtitleParseResult(currentMedia.file))
          return
        }

        setSubtitlesSafely([])
      } catch (error) {
        console.error("Failed to parse subtitles:", error)
        setSubtitlesSafely([])
      }
    }

    void loadSubtitles()
    return () => {
      shouldIgnoreResult = true
    }
  }, [currentIndex, mediaFiles, parseSubtitleFile, setSubtitles])

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

  useEffect(() => {
    if (!showControls || mediaFiles.length < 2) {
      setIsMediaListHovered(false)
    }
  }, [showControls, mediaFiles.length])

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const mediaFiles = getMediaFiles(files)
    if (mediaFiles.length === 0) {
      const subtitleFiles = getSubtitleFiles(files)
      if (subtitleFiles.length > 0) {
        void parseSubtitle(subtitleFiles[0])
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
    <MouseMoveOverlay
      showControls={showControls}
      setShowControls={setShowControls}
      mouseMoveTimeoutRef={mouseMoveTimeout}
      videoPaused={isPaused}
      preventAutoHide={isMediaListHovered}
    >
      <div
        className="absolute top-30 right-0 bottom-21 left-0"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={togglePlayPause}
      />
      <ActionOverlay isPaused={isPaused} isAudio={isAudio} />
      <VideoControlsTop
        showControls={showControls}
        isFullScreen={isFullScreen}
        mediaFiles={mediaFiles}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        isMediaListHovered={isMediaListHovered}
        setIsMediaListHovered={setIsMediaListHovered}
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
        subtitleTracks={subtitleTracks}
        selectedSubtitleTrack={selectedSubtitleTrack}
        handleSubtitleTrackChange={(track) => {
          setSelectedSubtitleTrack(track)
          setShowSubtitle(true)
        }}
        playSpeed={playSpeed}
        handlePlaybackSpeed={handlePlaybackSpeed}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
      />
      <ProgressBar
        handleSeek={handleSeek}
        seekValue={seekValue}
        // eslint-disable-next-line react-hooks/refs
        duration={videoRef.current?.duration ?? 0}
      />
    </MouseMoveOverlay>
  )
}

export default VideoControls
