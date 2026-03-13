import { parse as srtVttParse } from "@plussub/srt-vtt-parser"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { ParseResult, parse as samiParse } from "sami-parser"

import type { MediaFile } from "./types/MediaFiles"
import { getDroppedFiles } from "./utils/getDroppedFiles"
import { getMediaFiles, getSubtitleFiles } from "./utils/getMediaFiles"
import { extractMkvSubtitleParseResult } from "./utils/mkvSubtitles"
import { clampSubtitleOffset } from "./utils/subtitleOffset"

import ActionOverlay from "./ActionOverlay"
import { useFullScreen } from "./hooks/useFullScreen"
import { usePlayerKeyboard } from "./hooks/usePlayerKeyboard"
import MouseMoveOverlay from "./MouseMoveOverlay"
import ProgressBar from "./ProgressBar"
import SubtitleDelayToast from "./SubtitleDelayToast"
import VideoControlsBottom from "./VideoControlsBottom"
import VideoControlsTop from "./VideoControlsTop"

interface VideoControlsProps {
  playlist: {
    mediaFiles: MediaFile[]
    currentIndex: number
    setCurrentIndex: (index: number) => void
    hasMultipleMedia: boolean
    isPreviousMediaDisabled: boolean
    isNextMediaDisabled: boolean
    goToPreviousMedia: () => void
    goToNextMedia: () => void
    isRepeatEnabled: boolean
    toggleRepeatEnabled: () => void
    exit: () => void
    setMedia: (files: MediaFile[]) => void
  }
  playback: {
    videoRef: React.RefObject<HTMLVideoElement | null>
    isPaused: boolean
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>
    isAudio: boolean
    currentTime: string
    totalTime: string
    seekValue: string
  }
  subtitle: {
    setSubtitles: React.Dispatch<React.SetStateAction<ParseResult>>
    hasSubtitles: boolean
    showSubtitle: boolean
    setShowSubtitle: React.Dispatch<React.SetStateAction<boolean>>
    subtitleTracks: string[]
    selectedSubtitleTrack: string | null
    setSelectedSubtitleTrack: React.Dispatch<React.SetStateAction<string | null>>
    subtitleOffsetMs: number
    setSubtitleOffsetMs: React.Dispatch<React.SetStateAction<number>>
  }
  showControls: boolean
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>
}


const VideoControls: React.FC<VideoControlsProps> = ({
  playlist,
  playback,
  subtitle,
  showControls,
  setShowControls,
}) => {
  const {
    mediaFiles, currentIndex, setCurrentIndex, hasMultipleMedia,
    isPreviousMediaDisabled, isNextMediaDisabled, goToPreviousMedia, goToNextMedia,
    isRepeatEnabled, toggleRepeatEnabled, exit, setMedia,
  } = playlist
  const { videoRef, isPaused, setIsPaused, isAudio, currentTime, totalTime, seekValue } = playback
  const {
    setSubtitles, hasSubtitles, showSubtitle, setShowSubtitle,
    subtitleTracks, selectedSubtitleTrack, setSelectedSubtitleTrack,
    subtitleOffsetMs, setSubtitleOffsetMs,
  } = subtitle
  const [volume, setVolume] = useState(localStorage.getItem("volume") || "0.5")
  const [playSpeed, setPlaySpeed] = useState(1)
  const [isMediaListHovered, setIsMediaListHovered] = useState(false)
  const [subtitleDelayOffsetTime, setSubtitleDelayOffsetTime] = useState<number | null>(null)
  const [subtitleDelayToastKey, setSubtitleDelayToastKey] = useState(0)
  const subtitleOffsetRef = useRef(subtitleOffsetMs)
  const { isFullScreen, toggleFullScreen } = useFullScreen()

  const getVideo = useCallback(() => {
    return videoRef && typeof videoRef === "object" && videoRef.current
  }, [videoRef])

  useEffect(() => {
    subtitleOffsetRef.current = subtitleOffsetMs
  }, [subtitleOffsetMs])

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

        if (
          currentMedia.source === "file" &&
          currentMedia.file.name.toLowerCase().endsWith(".mkv")
        ) {
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const { dataTransfer } = e
    const files = await getDroppedFiles(dataTransfer)
    const mediaFiles = getMediaFiles(files)
    if (mediaFiles.length === 0) {
      const subtitleFiles = getSubtitleFiles(files)
      if (subtitleFiles.length > 0) {
        void parseSubtitle(subtitleFiles[0].file)
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

  const showSubtitleDelayToast = useCallback((offsetMs: number) => {
    setSubtitleDelayOffsetTime(offsetMs)
    setSubtitleDelayToastKey((prev) => prev + 1)
  }, [])

  const applySubtitleOffset = useCallback(
    (nextOffsetMs: number) => {
      const clampedOffsetMs = clampSubtitleOffset(nextOffsetMs)
      subtitleOffsetRef.current = clampedOffsetMs
      setSubtitleOffsetMs(clampedOffsetMs)
      showSubtitleDelayToast(clampedOffsetMs)
    },
    [setSubtitleOffsetMs, showSubtitleDelayToast],
  )

  const changeSubtitleOffsetBy = useCallback((deltaMs: number) => {
    applySubtitleOffset(subtitleOffsetRef.current + deltaMs)
  }, [applySubtitleOffset])

  usePlayerKeyboard({
    videoRef,
    exit,
    togglePlayPause,
    hasSubtitles,
    changeSubtitleOffsetBy,
    subtitleOffsetMs,
  })

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
    <>
      <MouseMoveOverlay
        showControls={showControls}
        setShowControls={setShowControls}

        videoPaused={isPaused}
        preventAutoHide={isMediaListHovered}
      >
        <div
          className="absolute top-30 right-0 bottom-21 left-0"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(event) => void handleDrop(event)}
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
          hasMultipleMedia={hasMultipleMedia}
          isPreviousMediaDisabled={isPreviousMediaDisabled}
          isNextMediaDisabled={isNextMediaDisabled}
          goToPreviousMedia={goToPreviousMedia}
          goToNextMedia={goToNextMedia}
          isRepeatEnabled={isRepeatEnabled}
          toggleRepeatEnabled={toggleRepeatEnabled}
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
          subtitleOffsetMs={subtitleOffsetMs}
          changeSubtitleOffsetBy={changeSubtitleOffsetBy}
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
      {subtitleDelayOffsetTime !== null && (
        <SubtitleDelayToast
          key={subtitleDelayToastKey}
          offsetTime={subtitleDelayOffsetTime}
          onHidden={() => setSubtitleDelayOffsetTime(null)}
        />
      )}
    </>
  )
}

export default VideoControls
