import { useEffect, useRef, type RefObject } from "react"
import { SUBTITLE_OFFSET_STEP_MS } from "../utils/subtitleOffset"
import { useFullScreen } from "./useFullScreen"

const isSubtitleOffsetIncreaseKey = (event: KeyboardEvent) => {
  return (
    event.key === "+" ||
    event.key === "=" ||
    event.code === "NumpadAdd" ||
    (event.code === "Equal" && event.shiftKey)
  )
}

const isSubtitleOffsetDecreaseKey = (event: KeyboardEvent) => {
  return event.key === "-" || event.key === "_" || event.code === "NumpadSubtract"
}

interface UsePlayerKeyboardOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  exit: () => void
  togglePlayPause: () => void
  hasSubtitles: boolean
  changeSubtitleOffsetBy: (deltaMs: number) => void
  subtitleOffsetMs: number
  volume: string
  handleVolumeChange: (value: string) => void
}

export function usePlayerKeyboard({
  videoRef,
  exit,
  togglePlayPause,
  hasSubtitles,
  changeSubtitleOffsetBy,
  subtitleOffsetMs,
  volume,
  handleVolumeChange,
}: UsePlayerKeyboardOptions) {
  const { isFullScreen, toggleFullScreen } = useFullScreen()
  const subtitleOffsetRef = useRef(subtitleOffsetMs)

  useEffect(() => {
    subtitleOffsetRef.current = subtitleOffsetMs
  }, [subtitleOffsetMs])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return
      if (event.key === "Escape" && !isFullScreen) {
        exit()
      } else if (event.key === "ArrowLeft") {
        video.currentTime -= 5
      } else if (event.key === "ArrowRight") {
        video.currentTime += 5
      } else if (event.key === " " || event.key === "k" || event.key === "K") {
        event.preventDefault()
        togglePlayPause()
      } else if (event.key === "f") {
        toggleFullScreen()
      } else if ((event.key === "m" || event.key === "M") && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        handleVolumeChange(volume === "0" ? "0.5" : "0")
      } else if (hasSubtitles && !event.metaKey && !event.ctrlKey && !event.altKey && isSubtitleOffsetIncreaseKey(event)) {
        event.preventDefault()
        changeSubtitleOffsetBy(SUBTITLE_OFFSET_STEP_MS)
      } else if (hasSubtitles && !event.metaKey && !event.ctrlKey && !event.altKey && isSubtitleOffsetDecreaseKey(event)) {
        event.preventDefault()
        changeSubtitleOffsetBy(-SUBTITLE_OFFSET_STEP_MS)
      } else if (hasSubtitles && !event.metaKey && !event.ctrlKey && !event.altKey && event.key === "0") {
        event.preventDefault()
        changeSubtitleOffsetBy(-subtitleOffsetRef.current)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [videoRef, exit, isFullScreen, toggleFullScreen, togglePlayPause, hasSubtitles, changeSubtitleOffsetBy, volume, handleVolumeChange])
}
