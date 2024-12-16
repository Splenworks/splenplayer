import React from "react"
import { twMerge } from "tailwind-merge"

interface CaptionButtonProps {
  filled: boolean
  onToggle: () => void
}

const CaptionButton: React.FC<CaptionButtonProps> = ({ filled, onToggle }) => {
  return (
    <div
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out hover:bg-zinc-500 hover:bg-opacity-50"
      onClick={onToggle}
    >
      <button
        tabIndex={-1}
        className={twMerge(
          "h-5 w-6 rounded-md border-2 border-white font-mono text-xs font-semibold leading-5 text-white outline-none transition-colors duration-300 ease-in-out focus:outline-none",
          filled ? "bg-white text-black" : "bg-transparent",
        )}
      >
        CC
      </button>
    </div>
  )
}

export default CaptionButton
