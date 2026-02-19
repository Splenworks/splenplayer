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
        "play-speed-button z-10 flex h-7 min-h-7 w-full shrink-0 cursor-pointer items-center justify-center bg-zinc-500/50",
        isSelected ? "bg-zinc-300/50 hover:bg-zinc-300/50" : "hover:bg-zinc-400/50",
        className,
      )}
      data-play-speed={playSpeed}
      onClick={onClick}
    >
      <span className="text-xs text-white">{playSpeed.toFixed(1)}x</span>
    </div>
  )
}

export default PlaySpeedButton
