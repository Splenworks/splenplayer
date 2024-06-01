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
  return (
    <>
      <div className="overflow-hidden cursor-pointer h-10 hover:h-[212px] flex flex-col-reverse items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out peer">
        <div className="w-10 h-10">
          <PlaybackSpeedIcon className="w-6 h-6 text-white m-2" />
        </div>
        <PlaySpeedButton
          playSpeed={1}
          onClick={() => handlePlaybackSpeed(1)}
          isSelected={playSpeed === 1}
        />
        <PlaySpeedButton
          playSpeed={1.2}
          onClick={() => handlePlaybackSpeed(1.2)}
          isSelected={playSpeed === 1.2}
        />
        <PlaySpeedButton
          playSpeed={1.4}
          onClick={() => handlePlaybackSpeed(1.4)}
          isSelected={playSpeed === 1.4}
        />
        <PlaySpeedButton
          playSpeed={1.6}
          onClick={() => handlePlaybackSpeed(1.6)}
          isSelected={playSpeed === 1.6}
        />
        <PlaySpeedButton
          playSpeed={1.8}
          onClick={() => handlePlaybackSpeed(1.8)}
          isSelected={playSpeed === 1.8}
        />
        <PlaySpeedButton
          playSpeed={2}
          onClick={() => handlePlaybackSpeed(2)}
          isSelected={playSpeed === 2}
          className="h-8 pt-1"
        />
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
