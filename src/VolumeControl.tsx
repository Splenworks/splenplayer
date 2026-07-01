import React from "react"
import { twMerge } from "tailwind-merge"
import VolumeIcon from "./assets/icons/volume-max.svg?react"
import MuteIcon from "./assets/icons/volume-mute.svg?react"

interface VolumeControlProps {
  volume: string
  handleVolumeChange: (value: string) => void
  expanded?: boolean
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  handleVolumeChange,
  expanded = false,
}) => {
  return (
    <div
      className={twMerge(
        "hover:bg-opacity-50 flex h-10 w-10 cursor-pointer flex-row-reverse items-center overflow-hidden rounded-full p-1 transition-all duration-300 ease-in-out hover:w-40 hover:bg-zinc-500/50 focus:outline-hidden",
        expanded && "w-40 bg-zinc-500/50",
      )}
    >
      <button
        tabIndex={-1}
        className="cursor-pointer mx-2 h-6 w-6 outline-hidden focus:outline-hidden"
        onClick={() => {
          handleVolumeChange(volume === "0" ? "0.5" : "0")
        }}
      >
        {Number(volume) === 0 ? (
          <MuteIcon className="h-6 w-6 text-white" />
        ) : (
          <VolumeIcon className="h-6 w-6 text-white" />
        )}
      </button>
      <input
        tabIndex={-1}
        className="mr-0.5 w-24 cursor-pointer accent-white outline-hidden focus:outline-hidden"
        type="range"
        min="0"
        max="1"
        step="0.1"
        onChange={(e) => handleVolumeChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          e.stopPropagation()
        }}
        value={volume}
      />
    </div>
  )
}

export default VolumeControl
