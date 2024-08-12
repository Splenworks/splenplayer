import React from "react"
import { twJoin } from "tailwind-merge"
import PlaySpeedButton from "./PlaySpeedButton"
import PlaybackSpeedIcon from "./assets/playback-speed.svg?react"
import CloseIcon from "./assets/xmark.svg?react"

interface PlaySpeedControlProps {
  playSpeed: number
  handlePlaybackSpeed: (speed: number) => void
}

const PlaySpeedControl: React.FC<PlaySpeedControlProps> = ({
  playSpeed,
  handlePlaybackSpeed,
}) => {
  const playSpeedOptions = [1, 1.2, 1.4, 1.6, 1.8, 2]
  return (
    <>
      <div className="peer flex h-10 max-h-10 cursor-pointer flex-col-reverse items-center overflow-hidden rounded-full transition-all duration-300 ease-in-out hover:h-auto hover:max-h-60 hover:bg-zinc-500 hover:bg-opacity-50">
        <div
          className="h-10 w-10"
          onClick={() => {
            const currentPlaySpeedIndex = playSpeedOptions.indexOf(playSpeed)
            handlePlaybackSpeed(
              playSpeedOptions[
                (currentPlaySpeedIndex + 1) % playSpeedOptions.length
              ],
            )
          }}
        >
          <PlaybackSpeedIcon className="m-2 h-6 w-6 text-white" />
        </div>
        {playSpeedOptions.map((speed, index) => (
          <PlaySpeedButton
            playSpeed={speed}
            onClick={() => handlePlaybackSpeed(speed)}
            isSelected={playSpeed === speed}
            className={index === playSpeedOptions.length - 1 ? "h-8 pt-1" : ""}
            key={speed}
          />
        ))}
      </div>
      <div
        className={twJoin(
          "absolute -bottom-[9px] left-1 right-0 flex items-center justify-center text-xs text-white transition-opacity duration-300 ease-in-out peer-hover:opacity-0",
          playSpeed === 1 ? "opacity-0" : "opacity-100",
        )}
      >
        <span>{playSpeed.toFixed(1)}</span>
        <CloseIcon className="h-3 w-[10px]" />
      </div>
    </>
  )
}

export default PlaySpeedControl
