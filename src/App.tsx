import AudioMotionAnalyzer from "audiomotion-analyzer"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import AudioOverlay from "./AudioOverlay"
import SubtitleOverlay from "./SubtitleOverlay"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import Header from "./Header"
import type { MediaFile } from "./types/MediaFiles"
import { getMediaSourceKey, isMkvMediaFile } from "./utils/getMediaFiles"
import { isSafari } from "./utils/browser"
import { hashCode } from "./utils/hashCode"
import { SubtitleProvider } from "./providers/SubtitleProvider"
import VideoControls from "./VideoControls"
import VideoPlayer from "./VideoPlayer"

function App() {
  const { t } = useTranslation()
  const [exitedSession, setExitedSession] = useState<{
    mediaFiles: MediaFile[]
    currentIndex: number
  } | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const analyzer = useRef<AudioMotionAnalyzer | null>(null)
  const analyzerContainer = useRef<HTMLDivElement | null>(null)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [totalTime, setTotalTime] = useState("00:00")
  const [seekValue, setSeekValue] = useState("0")
  const videoFileHash = useMemo(() => {
    const allMediaFilesAndSizes = mediaFiles
      .map((mediaFile) => mediaFile.displayName + getMediaSourceKey(mediaFile))
      .join("")
    return "video-hash-" + hashCode(allMediaFilesAndSizes + currentIndex)
  }, [mediaFiles, currentIndex])
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [videoRatio, setVideoRatio] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false)
  const resetAnalyzer = useCallback(() => {
    analyzer.current?.destroy()
    analyzer.current = null
  }, [])

  const exit = useCallback(() => {
    setExitedSession({
      mediaFiles,
      currentIndex,
    })
    resetAnalyzer()
    setMediaFiles([])
    setCurrentIndex(0)
  }, [currentIndex, mediaFiles, resetAnalyzer])

  const setMedia = useCallback((files: MediaFile[]) => {
    const playableFiles = isSafari ? files.filter((file) => !isMkvMediaFile(file)) : files
    if (playableFiles.length !== files.length) {
      alert(t("dragDropArea.safariMkvUnsupported"))
    }
    if (playableFiles.length === 0) {
      return
    }

    setExitedSession(null)
    setMediaFiles(playableFiles)
    setCurrentIndex(0)
  }, [t])

  const goBack = useCallback(() => {
    if (!exitedSession || exitedSession.mediaFiles.length === 0) {
      return
    }
    setMediaFiles(exitedSession.mediaFiles)
    setCurrentIndex(Math.min(exitedSession.currentIndex, exitedSession.mediaFiles.length - 1))
    setExitedSession(null)
  }, [exitedSession])

  const hasMultipleMedia = mediaFiles.length > 1
  const currentMediaFile = mediaFiles[currentIndex] || null
  const isAudio = currentMediaFile?.type === "audio"
  const shouldEnableAudioAnalyzer = isAudio && currentMediaFile?.source === "file"
  const mediaElementModeKey = shouldEnableAudioAnalyzer ? "analyzed-media" : "plain-media"
  const isPreviousMediaDisabled = hasMultipleMedia && !isRepeatEnabled && currentIndex === 0
  const isNextMediaDisabled =
    hasMultipleMedia && !isRepeatEnabled && currentIndex === mediaFiles.length - 1

  const goToPreviousMedia = useCallback(() => {
    if (mediaFiles.length < 2) {
      return false
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      return true
    }
    if (isRepeatEnabled) {
      setCurrentIndex(mediaFiles.length - 1)
      return true
    }
    return false
  }, [currentIndex, isRepeatEnabled, mediaFiles.length])

  const goToNextMedia = useCallback(() => {
    if (mediaFiles.length < 2) {
      return false
    }
    if (currentIndex < mediaFiles.length - 1) {
      setCurrentIndex(currentIndex + 1)
      return true
    }
    if (isRepeatEnabled) {
      setCurrentIndex(0)
      return true
    }
    return false
  }, [currentIndex, isRepeatEnabled, mediaFiles.length])

  useEffect(() => {
    if (mediaFiles.length === 0) {
      resetAnalyzer()
    }
  }, [mediaFiles.length, resetAnalyzer])

  useEffect(() => {
    if (!shouldEnableAudioAnalyzer) {
      // A MediaElementSourceNode is permanently tied to its DOM media element,
      // so leaving analyzer mode must also release the old analyzer instance.
      resetAnalyzer()
    }
  }, [resetAnalyzer, shouldEnableAudioAnalyzer])

  const handleTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget
      const hour = Math.floor(video.currentTime / 3600)
      let minute = Math.floor((video.currentTime % 3600) / 60).toString()
      if (minute.length === 1) minute = `0${minute}`
      let second = Math.floor(video.currentTime % 60).toString()
      if (second.length === 1) second = `0${second}`
      setCurrentTime(hour === 0 ? `${minute}:${second}` : `${hour}:${minute}:${second}`)
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
      const hour = Math.floor(video.duration / 3600)
      let minute = Math.floor((video.duration % 3600) / 60).toString()
      if (minute.length === 1) minute = `0${minute}`
      let second = Math.floor(video.duration % 60).toString()
      if (second.length === 1) second = `0${second}`
      setTotalTime(hour === 0 ? `${minute}:${second}` : `${hour}:${minute}:${second}`)
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
        void video.play().then(() => {
          setIsPaused(false)
        })
        setShowControls(true)
      } else {
        setIsPaused(true)
        setShowControls(true)
      }
    },
    [goToNextMedia, isRepeatEnabled, mediaFiles.length, videoFileHash],
  )

  if (mediaFiles.length > 0) {
    return (
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
            mediaFile={mediaFiles[currentIndex] || null}
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
            playback={{
              videoRef,
              isPaused,
              setIsPaused,
              isAudio,
              currentTime,
              totalTime,
              seekValue,
            }}
            showControls={showControls}
            setShowControls={setShowControls}
          />
        </div>
      </SubtitleProvider>
    )
  }

  return (
    <>
      <Header exited={Boolean(exitedSession)} goBack={goBack} />
      <DragDropArea setMedia={setMedia} />
      <Footer />
    </>
  )
}

export default App
