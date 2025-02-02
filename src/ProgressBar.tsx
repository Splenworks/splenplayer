import React from "react"
import { twJoin } from "tailwind-merge"
import { isSafari } from "./utils/browser"

interface ProgressBarProps {
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void
  seekValue: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ handleSeek, seekValue }) => {
  return (
    <div className="absolute bottom-2 left-2 right-2 mx-4 flex h-8 items-center justify-center">
      <input
        autoFocus
        className={twJoin(
          isSafari
            ? "h-2 w-full cursor-pointer appearance-none rounded-full border border-neutral-500 bg-transparent accent-white outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            : "w-full cursor-pointer accent-white outline-none",
        )}
        type="range"
        min="0"
        max="100"
        step="0.1"
        onChange={handleSeek}
        onKeyDown={(e) => {
          e.preventDefault()
        }}
        value={seekValue}
      />
    </div>
  )
}

export default ProgressBar
