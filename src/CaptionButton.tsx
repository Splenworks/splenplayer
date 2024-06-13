import React from "react"
import { twMerge } from "tailwind-merge"

interface CaptionButtonProps {
  filled: boolean
  onToggle: () => void
}

const CaptionButton: React.FC<CaptionButtonProps> = ({ filled, onToggle }) => {
  return (
    <div className="w-10 h-10 flex justify-center items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-colors duration-300 ease-in-out">
      <button
        tabIndex={-1}
        className={twMerge(
          "w-6 h-5 transition-colors duration-300 ease-in-out outline-none focus:outline-none font-mono font-semibold text-white text-xs border-2 rounded-md border-white",
          filled ? "bg-white text-black" : "bg-transparent",
        )}
        onClick={onToggle}
      >
        CC
      </button>
    </div>
  )
}

export default CaptionButton
