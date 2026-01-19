import AudioMotionAnalyzer from "audiomotion-analyzer"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ParseResult } from "sami-parser"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import Header from "./Header"
import { isSafari } from "./utils/browser"
import { MediaFile } from "./utils/getMediaFiles"
import { hashCode } from "./utils/hashCode"
import { replaceBasicHtmlEntities } from "./utils/html"
import VideoControls from "./VideoControls"
import VideoPlayer from "./VideoPlayer"

function App() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isAudio, setIsAudio] = useState(false)
  const analyzer = useRef<AudioMotionAnalyzer | null>(null)
  const analyzerContainer = useRef<HTMLDivElement | null>(null)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [totalTime, setTotalTime] = useState("00:00")
  const [seekValue, setSeekValue] = useState("0")
  const videoFileHash = useMemo(() => {
    const allMediaFilesAndSizes = mediaFiles
      .map((mediaFile) => mediaFile.file.name + mediaFile.file.size)
      .join("")
    return "video-hash-" + hashCode(allMediaFilesAndSizes + currentIndex)
  }, [mediaFiles, currentIndex])
  const subtitles = useRef<ParseResult>([])
  const hasSubtitles = subtitles.current.length > 0
  const [currentSubtitle, setCurrentSubtitle] = useState("")
  const [videoRatio, setVideoRatio] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const mouseMoveTimeout = useRef<number | null>(null)

  const exit = useCallback(() => {
    setMediaFiles([])
    setCurrentIndex(0)
  }, [])

  const setMedia = useCallback((files: MediaFile[]) => {
    setMediaFiles(files)
    setCurrentIndex(0)
  }, [])

  useEffect(() => {
    const video = videoRef.current
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
  }, [
    mediaFiles.length,
    currentIndex,
    videoFileHash,
    hasSubtitles,
  ])

  useEffect(() => {
    return () => {
      analyzer.current?.destroy()
      analyzer.current = null
    }
  }, [])

  if (mediaFiles.length > 0) {
    return (
      <>
        <VideoPlayer mediaFiles={mediaFiles} currentIndex={currentIndex} ref={videoRef} />
        <VideoControls
          mediaFiles={mediaFiles}
          exit={exit}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          videoRef={videoRef}
          setMedia={setMedia}
          isAudio={isAudio}
          analyzerContainer={analyzerContainer}
          currentTime={currentTime}
          totalTime={totalTime}
          seekValue={seekValue}
          currentSubtitle={currentSubtitle}
          videoRatio={videoRatio}
          showControls={showControls}
          setShowControls={setShowControls}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          subtitles={subtitles}
          hasSubtitles={hasSubtitles}
          mouseMoveTimeout={mouseMoveTimeout}
        />
      </>
    )
  }

  return (
    <>
      <Header />
      <DragDropArea setMedia={setMedia} />
      <Footer />
    </>
  )
}

export default App
