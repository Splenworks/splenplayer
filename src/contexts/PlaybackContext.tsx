import { createContext } from "react"
import type React from "react"

export const PlaybackContext = createContext<{
  videoRef: React.RefObject<HTMLVideoElement | null>
  isPaused: boolean
  isAudio: boolean
  currentTime: string
  totalTime: string
  seekValue: string
  duration: number
  togglePlayPause: () => void
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void
  volume: string
  handleVolumeChange: (value: string) => void
  playSpeed: number
  handlePlaybackSpeed: (speed: number) => void
}>({
  videoRef: { current: null },
  isPaused: true,
  isAudio: false,
  currentTime: "00:00",
  totalTime: "00:00",
  seekValue: "0",
  duration: 0,
  togglePlayPause: () => {},
  handleSeek: () => {},
  volume: "0.5",
  handleVolumeChange: () => {},
  playSpeed: 1,
  handlePlaybackSpeed: () => {},
})
