import React from "react"
import { twMerge } from "tailwind-merge"

interface SubtitleSyncActionButtonProps {
  label: string
  onClick: () => void
  className?: string
}

const SubtitleSyncActionButton: React.FC<SubtitleSyncActionButtonProps> = ({
  label,
  onClick,
  className,
}) => {
  return (
    <button
      tabIndex={-1}
      className={twMerge(
        "z-10 flex h-7 min-h-7 w-full shrink-0 cursor-pointer items-center justify-center bg-zinc-500/50 hover:bg-zinc-400/50",
        className,
      )}
      onClick={onClick}
    >
      <span className="text-xs text-white">{label}</span>
    </button>
  )
}

export default SubtitleSyncActionButton
