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
      <div className="overflow-hidden cursor-pointer h-10 hover:h-auto max-h-10 hover:max-h-60 flex flex-col-reverse items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out peer">
        <div
          className="w-10 h-10"
          onClick={() => {
            const currentPlaySpeedIndex = playSpeedOptions.indexOf(playSpeed)
            handlePlaybackSpeed(
              playSpeedOptions[
                (currentPlaySpeedIndex + 1) % playSpeedOptions.length
              ],
            )
          }}
        >
          <PlaybackSpeedIcon className="w-6 h-6 text-white m-2" />
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
          "peer-hover:opacity-0 flex text-xs text-white left-1 right-0 -bottom-[9px] absolute items-center justify-center transition-opacity duration-300 ease-in-out",
          playSpeed === 1 ? "opacity-0" : "opacity-100",
        )}
      >
        <span>{playSpeed.toFixed(1)}</span>
        <CloseIcon className="w-[10px] h-3" />
      </div>
    </>
  )
}

export default PlaySpeedControl
