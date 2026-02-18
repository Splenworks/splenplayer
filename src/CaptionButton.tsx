import React from "react"
import { twMerge } from "tailwind-merge"

interface CaptionButtonProps {
  name: string // two letter language code
  filled: boolean
  onToggle: () => void
}

const CaptionButton: React.FC<CaptionButtonProps> = ({
  name,
  filled,
  onToggle,
}) => {
  return (
    <div
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out hover:bg-zinc-500/50 focus:outline-hidden"
      onClick={onToggle}
    >
      <button
        tabIndex={-1}
        className={twMerge(
          "flex h-5 w-6 cursor-pointer items-center justify-center rounded-md border-2 border-white font-mono text-xs leading-none font-semibold text-white outline-hidden transition-colors duration-300 ease-in-out focus:outline-hidden",
          filled ? "bg-white text-black" : "bg-transparent",
        )}
      >
        {name.toUpperCase()}
      </button>
    </div>
  )
}

export default CaptionButton
