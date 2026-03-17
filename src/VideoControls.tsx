import React, { useCallback, useEffect, useRef, useState } from "react"

import type { MediaFile } from "./types/MediaFiles"
import { getDroppedFiles } from "./utils/getDroppedFiles"
import { getMediaFiles, getSubtitleFiles } from "./utils/getMediaFiles"
import { clampSubtitleOffset } from "./utils/subtitleOffset"

import ActionOverlay from "./ActionOverlay"
import { useFullScreen } from "./hooks/useFullScreen"
import { usePlayback } from "./hooks/usePlayback"
import { usePlayerKeyboard } from "./hooks/usePlayerKeyboard"
import { useSubtitles } from "./hooks/useSubtitles"
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
  showControls: boolean
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>
}


const VideoControls: React.FC<VideoControlsProps> = ({
  playlist,
  showControls,
  setShowControls,
}) => {
  const {
    mediaFiles, currentIndex, setCurrentIndex, hasMultipleMedia,
    isPreviousMediaDisabled, isNextMediaDisabled, goToPreviousMedia, goToNextMedia,
    isRepeatEnabled, toggleRepeatEnabled, exit, setMedia,
  } = playlist
  const { videoRef, isPaused, isAudio, seekValue, duration, togglePlayPause, handleSeek } = usePlayback()
  const {
    loadSubtitleFile, hasSubtitles, showSubtitle, setShowSubtitle,
    subtitleTracks, selectedSubtitleTrack, setSelectedSubtitleTrack,
    subtitleOffsetMs, setSubtitleOffsetMs,
  } = useSubtitles()
  const [isMediaListHovered, setIsMediaListHovered] = useState(false)
  const [subtitleDelayOffsetTime, setSubtitleDelayOffsetTime] = useState<number | null>(null)
  const [subtitleDelayToastKey, setSubtitleDelayToastKey] = useState(0)
  const subtitleOffsetRef = useRef(subtitleOffsetMs)
  const { isFullScreen } = useFullScreen()

  useEffect(() => {
    subtitleOffsetRef.current = subtitleOffsetMs
  }, [subtitleOffsetMs])

  const canShowMediaList = showControls && mediaFiles.length >= 2
  const isMediaListVisible = isMediaListHovered && canShowMediaList

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const { dataTransfer } = e
    const files = await getDroppedFiles(dataTransfer)
    const mediaFiles = getMediaFiles(files)
    if (mediaFiles.length === 0) {
      const subtitleFiles = getSubtitleFiles(files)
      if (subtitleFiles.length > 0) {
        void loadSubtitleFile(subtitleFiles[0].file)
      }
    } else {
      setMedia(mediaFiles)
    }
  }

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

  return (
    <>
      <MouseMoveOverlay
        showControls={showControls}
        setShowControls={setShowControls}

        videoPaused={isPaused}
        preventAutoHide={isMediaListVisible}
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
          isMediaListHovered={isMediaListVisible}
          setIsMediaListHovered={setIsMediaListHovered}
          exit={exit}
        />
        <VideoControlsBottom
          showControls={showControls}
          hasMultipleMedia={hasMultipleMedia}
          isPreviousMediaDisabled={isPreviousMediaDisabled}
          isNextMediaDisabled={isNextMediaDisabled}
          goToPreviousMedia={goToPreviousMedia}
          goToNextMedia={goToNextMedia}
          isRepeatEnabled={isRepeatEnabled}
          toggleRepeatEnabled={toggleRepeatEnabled}
          hasSubtitles={hasSubtitles}
          showSubtitle={showSubtitle}
          toggleShowSubtitle={() => setShowSubtitle(!showSubtitle)}
          subtitleTracks={subtitleTracks}
          selectedSubtitleTrack={selectedSubtitleTrack}
          handleSubtitleTrackChange={(track) => {
            setSelectedSubtitleTrack(track)
            setShowSubtitle(true)
          }}
          subtitleOffsetMs={subtitleOffsetMs}
          changeSubtitleOffsetBy={changeSubtitleOffsetBy}
        />
        <ProgressBar
          handleSeek={handleSeek}
          seekValue={seekValue}
          duration={duration}
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
