import { type PropsWithChildren, useCallback, useEffect, useState } from "react"
import type React from "react"
import { PlaybackContext } from "../contexts/PlaybackContext"

interface PlaybackProviderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isPaused: boolean
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>
  isAudio: boolean
  currentTime: string
  totalTime: string
  seekValue: string
  duration: number
}

export const PlaybackProvider: React.FC<PropsWithChildren<PlaybackProviderProps>> = ({
  videoRef,
  isPaused,
  setIsPaused,
  isAudio,
  currentTime,
  totalTime,
  seekValue,
  duration,
  children,
}) => {
  const [volume, setVolume] = useState(localStorage.getItem("volume") || "0.5")
  const [playSpeed, setPlaySpeed] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = Number(volume)
    }
  }, [volume, videoRef])

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
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

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current
      if (video) {
        video.currentTime = (video.duration / 100) * Number(e.currentTarget.value)
      }
    },
    [videoRef],
  )

  const handleVolumeChange = useCallback(
    (value: string) => {
      const video = videoRef.current
      if (video) {
        setVolume(value)
        video.volume = Number(value)
        localStorage.setItem("volume", value)
      }
    },
    [videoRef],
  )

  const handlePlaybackSpeed = useCallback(
    (speed: number) => {
      const video = videoRef.current
      if (video) {
        video.playbackRate = speed
        setPlaySpeed(speed)
      }
    },
    [videoRef],
  )

  return (
    <PlaybackContext.Provider
      value={{
        videoRef,
        isPaused,
        isAudio,
        currentTime,
        totalTime,
        seekValue,
        duration,
        togglePlayPause,
        handleSeek,
        volume,
        handleVolumeChange,
        playSpeed,
        handlePlaybackSpeed,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  )
}
