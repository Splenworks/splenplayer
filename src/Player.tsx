import AudioMotionAnalyzer from "audiomotion-analyzer"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import AudioOverlay from "./AudioOverlay"
import SubtitleOverlay from "./SubtitleOverlay"
import { PlaybackProvider } from "./providers/PlaybackProvider"
import { SubtitleProvider } from "./providers/SubtitleProvider"
import type { MediaFile } from "./types/MediaFiles"
import { getMediaSourceKey } from "./utils/getMediaFiles"
import { hashCode } from "./utils/hashCode"
import { formatTime } from "./utils/number"
import VideoControls from "./VideoControls"
import VideoPlayer from "./VideoPlayer"

interface PlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  exit: () => void
  setMedia: (files: MediaFile[]) => void
}

const Player: React.FC<PlayerProps> = ({ mediaFiles, currentIndex, setCurrentIndex, exit, setMedia }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const analyzer = useRef<AudioMotionAnalyzer | null>(null)
  const analyzerContainer = useRef<HTMLDivElement | null>(null)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [totalTime, setTotalTime] = useState("00:00")
  const [seekValue, setSeekValue] = useState("0")
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [duration, setDuration] = useState(0)
  const [videoRatio, setVideoRatio] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false)

  const videoFileHash = useMemo(() => {
    const allMediaFilesAndSizes = mediaFiles
      .map((mediaFile) => mediaFile.displayName + getMediaSourceKey(mediaFile))
      .join("")
    return "video-hash-" + hashCode(allMediaFilesAndSizes + currentIndex)
  }, [mediaFiles, currentIndex])

  const currentMediaFile = mediaFiles[currentIndex] || null
  const isAudio = currentMediaFile?.type === "audio"
  const shouldEnableAudioAnalyzer = isAudio && currentMediaFile?.source === "file"
  const mediaElementModeKey = shouldEnableAudioAnalyzer ? "analyzed-media" : "plain-media"
  const hasMultipleMedia = mediaFiles.length > 1
  const isPreviousMediaDisabled = hasMultipleMedia && !isRepeatEnabled && currentIndex === 0
  const isNextMediaDisabled = hasMultipleMedia && !isRepeatEnabled && currentIndex === mediaFiles.length - 1

  const resetAnalyzer = useCallback(() => {
    analyzer.current?.destroy()
    analyzer.current = null
  }, [])

  useEffect(() => {
    return () => resetAnalyzer()
  }, [resetAnalyzer])

  useEffect(() => {
    if (!shouldEnableAudioAnalyzer) {
      // A MediaElementSourceNode is permanently tied to its DOM media element,
      // so leaving analyzer mode must also release the old analyzer instance.
      resetAnalyzer()
    }
  }, [resetAnalyzer, shouldEnableAudioAnalyzer])

  const goToPreviousMedia = useCallback(() => {
    if (mediaFiles.length < 2) return false
    if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); return true }
    if (isRepeatEnabled) { setCurrentIndex(mediaFiles.length - 1); return true }
    return false
  }, [currentIndex, isRepeatEnabled, mediaFiles.length, setCurrentIndex])

  const goToNextMedia = useCallback(() => {
    if (mediaFiles.length < 2) return false
    if (currentIndex < mediaFiles.length - 1) { setCurrentIndex(currentIndex + 1); return true }
    if (isRepeatEnabled) { setCurrentIndex(0); return true }
    return false
  }, [currentIndex, isRepeatEnabled, mediaFiles.length, setCurrentIndex])

  const handleTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget
      setCurrentTime(formatTime(video.currentTime))
      setSeekValue((video.currentTime / video.duration) * 100 + "")
      setCurrentTimeMs(video.currentTime * 1000)
      if (video.duration > 90) {
        if (video.currentTime >= 30 && video.currentTime < video.duration - 30) {
          localStorage.setItem(videoFileHash, video.currentTime + "")
        } else if (video.currentTime < 30 || video.currentTime >= video.duration - 30) {
          localStorage.removeItem(videoFileHash)
        }
      }
    },
    [videoFileHash],
  )

  const handleLoadedMetadata = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget
      if (isAudio) {
        if (!shouldEnableAudioAnalyzer) {
          // Remote URLs can fail Web Audio security checks, so keep playback running without the analyzer.
          resetAnalyzer()
        } else if (analyzerContainer.current && analyzer.current === null) {
          try {
            analyzer.current = new AudioMotionAnalyzer(analyzerContainer.current, {
              source: video,
              overlay: true,
              showBgColor: false,
              smoothing: 0.8,
              showScaleX: false,
            })
          } catch (error) {
            resetAnalyzer()
            console.error("Failed to initialize audio analyzer:", error)
          }
        }
      } else {
        resetAnalyzer()
      }
      setTotalTime(formatTime(video.duration))
      const savedPlaybackPosition = localStorage.getItem(videoFileHash)
      if (video.videoWidth > 0 && savedPlaybackPosition) {
        const newCurrentTime = Number(savedPlaybackPosition)
        video.currentTime = newCurrentTime > 10 ? newCurrentTime - 10 : 0
        setSeekValue((video.currentTime / video.duration) * 100 + "")
      } else {
        setSeekValue("0")
      }
      setDuration(video.duration)
      setVideoRatio(video.videoWidth / video.videoHeight)
      video.play().then(() => setIsPaused(false))
    },
    [isAudio, shouldEnableAudioAnalyzer, resetAnalyzer, videoFileHash],
  )

  const handleEnded = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget
      localStorage.removeItem(videoFileHash)
      if (goToNextMedia()) {
        setShowControls(true)
      } else if (isRepeatEnabled && mediaFiles.length === 1) {
        video.currentTime = 0
        void video.play().then(() => setIsPaused(false))
        setShowControls(true)
      } else {
        setIsPaused(true)
        setShowControls(true)
      }
    },
    [goToNextMedia, isRepeatEnabled, mediaFiles.length, videoFileHash],
  )

  return (
    <PlaybackProvider
      videoRef={videoRef}
      isPaused={isPaused}
      setIsPaused={setIsPaused}
      isAudio={isAudio}
      currentTime={currentTime}
      totalTime={totalTime}
      seekValue={seekValue}
      duration={duration}
    >
      <SubtitleProvider mediaFiles={mediaFiles} currentIndex={currentIndex} videoFileHash={videoFileHash}>
        <div className="fixed top-0 right-0 bottom-0 left-0">
          <VideoPlayer
            key={mediaElementModeKey}
            mediaFiles={mediaFiles}
            currentIndex={currentIndex}
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
          <AudioOverlay
            analyzerContainerRef={analyzerContainer}
            isAudio={isAudio}
            mediaFile={currentMediaFile}
          />
          <SubtitleOverlay currentTimeMs={currentTimeMs} videoRatio={videoRatio} />
          <VideoControls
            playlist={{
              mediaFiles,
              currentIndex,
              setCurrentIndex,
              hasMultipleMedia,
              isPreviousMediaDisabled,
              isNextMediaDisabled,
              goToPreviousMedia,
              goToNextMedia,
              isRepeatEnabled,
              toggleRepeatEnabled: () => setIsRepeatEnabled((prev) => !prev),
              exit,
              setMedia,
            }}
            showControls={showControls}
            setShowControls={setShowControls}
          />
        </div>
      </SubtitleProvider>
    </PlaybackProvider>
  )
}

export default Player
