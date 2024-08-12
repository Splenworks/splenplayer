import React from "react"
import VolumeIcon from "./assets/volume-max.svg?react"
import MuteIcon from "./assets/volume-mute.svg?react"

interface VolumeControlProps {
  volume: string
  handleVolumeChange: (value: string) => void
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  handleVolumeChange,
}) => {
  return (
    <div className="flex h-10 w-10 cursor-pointer flex-row-reverse items-center overflow-hidden rounded-full p-1 transition-all duration-300 ease-in-out hover:w-40 hover:bg-zinc-500 hover:bg-opacity-50">
      <button
        tabIndex={-1}
        className="mx-2 h-6 w-6 outline-none focus:outline-none"
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
        className="mr-0.5 w-24 cursor-pointer accent-white outline-none focus:outline-none"
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
