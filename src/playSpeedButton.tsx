import React from "react"
import { twMerge } from "tailwind-merge"

interface PlaySpeedButtonProps {
  playSpeed: number
  onClick: () => void
  isSelected?: boolean
  className?: string
}

const PlaySpeedButton: React.FC<PlaySpeedButtonProps> = ({
  playSpeed,
  onClick,
  isSelected,
  className,
}) => {
  return (
    <div
      className={twMerge(
        "play-speed-button w-full h-7 min-h-7 flex justify-center items-center cursor-pointer bg-opacity-50 hover:bg-opacity-50",
        isSelected ? "bg-zinc-400 hover:bg-zinc-400" : "hover:bg-zinc-500",
        className,
      )}
      data-play-speed={playSpeed}
      onClick={onClick}
    >
      <span className="text-white text-xs">{playSpeed.toFixed(1)}</span>
    </div>
  )
}

export default PlaySpeedButton
