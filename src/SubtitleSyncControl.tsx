import React from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { formatSubtitleOffset } from "./utils/subtitleOffset"

interface SubtitleSyncControlProps {
  subtitleOffsetMs: number
  increaseSubtitleOffset: () => void
  decreaseSubtitleOffset: () => void
  resetSubtitleOffset: () => void
}

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
      <span className="font-mono text-xs leading-none text-white">{label}</span>
    </button>
  )
}

const SubtitleSyncControl: React.FC<SubtitleSyncControlProps> = ({
  subtitleOffsetMs,
  increaseSubtitleOffset,
  decreaseSubtitleOffset,
  resetSubtitleOffset,
}) => {
  return (
    <>
      <div className="peer group flex h-10 max-h-10 cursor-pointer flex-col-reverse items-center overflow-hidden rounded-full transition-all duration-300 ease-in-out hover:h-auto hover:max-h-100 focus:outline-hidden">
        <button
          tabIndex={-1}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-b-full transition-colors duration-300 ease-in-out hover:bg-zinc-500/50 group-hover:bg-zinc-500/50 focus:outline-hidden"
          onClick={increaseSubtitleOffset}
        >
          <span className="font-mono text-xs leading-none font-semibold text-white">+/-</span>
        </button>
        <SubtitleSyncActionButton label="+0.1s" onClick={increaseSubtitleOffset} />
        <SubtitleSyncActionButton label="-0.1s" onClick={decreaseSubtitleOffset} />
        <SubtitleSyncActionButton label="RESET" onClick={resetSubtitleOffset} />
        <div className="z-10 flex h-8 min-h-8 w-full shrink-0 items-center justify-center rounded-t-full bg-zinc-800/70 pt-1">
          <span className="font-mono text-xs leading-none text-zinc-100">
            {formatSubtitleOffset(subtitleOffsetMs)}
          </span>
        </div>
      </div>
      <div
        className={twJoin(
          "absolute -bottom-[9px] left-1 right-0 flex items-center justify-center font-mono text-xs text-white transition-opacity duration-300 ease-in-out peer-hover:opacity-0",
          subtitleOffsetMs === 0 ? "opacity-0" : "opacity-100",
        )}
      >
        {formatSubtitleOffset(subtitleOffsetMs)}
      </div>
    </>
  )
}

export default SubtitleSyncControl
