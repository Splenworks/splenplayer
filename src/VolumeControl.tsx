import React from "react"
import VolumeIcon from "./assets/volume-max.svg?react"
import MuteIcon from "./assets/volume-mute.svg?react"

interface VolumeControlProps {
  volume: string
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  handleVolumeChange,
}) => {
  return (
    <div className="cursor-pointer overflow-hidden w-10 hover:w-40 p-1 h-10 flex flex-row-reverse items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-all duration-300 ease-in-out">
      <button
        tabIndex={-1}
        className="w-6 h-6 mx-2 outline-none focus:outline-none"
      >
        {Number(volume) === 0 ? (
          <MuteIcon className="w-6 h-6 text-white" />
        ) : (
          <VolumeIcon className="w-6 h-6 text-white" />
        )}
      </button>
      <input
        tabIndex={-1}
        className="accent-white cursor-pointer w-24 mr-0.5 outline-none focus:outline-none"
        type="range"
        min="0"
        max="1"
        step="0.1"
        onChange={handleVolumeChange}
        onKeyDown={(e) => {
          e.stopPropagation()
        }}
        value={volume}
      />
    </div>
  )
}

export default VolumeControl
