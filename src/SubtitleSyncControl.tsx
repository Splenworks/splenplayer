import React from "react"
import { twJoin } from "tailwind-merge"
import PlusMinusIcon from "./assets/icons/plus-minus.svg?react"
import SubtitleSyncActionButton from "./SubtitleSyncActionButton"
import { SUBTITLE_OFFSET_STEP_MS, formatSubtitleOffset } from "./utils/subtitleOffset"

interface SubtitleSyncControlProps {
  subtitleOffsetMs: number
  changeSubtitleOffsetBy: (deltaMs: number) => void
}

const SubtitleSyncControl: React.FC<SubtitleSyncControlProps> = ({
  subtitleOffsetMs,
  changeSubtitleOffsetBy,
}) => {
  const halfSecondStepMs = SUBTITLE_OFFSET_STEP_MS * 5
  const formatOffsetForControl = (offsetMs: number) => `${formatSubtitleOffset(offsetMs)}s`

  return (
    <>
      <div className="peer group flex h-10 max-h-10 cursor-pointer flex-col-reverse items-center overflow-hidden rounded-full transition-all duration-300 ease-in-out hover:h-auto hover:max-h-100 focus:outline-hidden">
        <button
          tabIndex={-1}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-b-full transition-colors duration-300 ease-in-out hover:bg-zinc-500/50 group-hover:bg-zinc-500/50 focus:outline-hidden"
          onClick={() => changeSubtitleOffsetBy(SUBTITLE_OFFSET_STEP_MS)}
        >
          <PlusMinusIcon className="m-2 h-6 w-6 text-white" />
        </button>
        <SubtitleSyncActionButton label="+0.5s" onClick={() => changeSubtitleOffsetBy(halfSecondStepMs)} />
        <SubtitleSyncActionButton
          label="+0.1s"
          onClick={() => changeSubtitleOffsetBy(SUBTITLE_OFFSET_STEP_MS)}
        />
        <SubtitleSyncActionButton
          label="RESET"
          onClick={() => changeSubtitleOffsetBy(-subtitleOffsetMs)}
          labelClassName="text-xxs"
        />
        <SubtitleSyncActionButton
          label="-0.1s"
          onClick={() => changeSubtitleOffsetBy(-SUBTITLE_OFFSET_STEP_MS)}
        />
        <SubtitleSyncActionButton label="-0.5s" onClick={() => changeSubtitleOffsetBy(-halfSecondStepMs)} />
      </div>
      <div
        className={twJoin(
          "absolute -bottom-[9px] left-0 right-0 flex items-center justify-center text-xs text-white transition-opacity duration-300 ease-in-out peer-hover:opacity-0",
          subtitleOffsetMs === 0 ? "opacity-0" : "opacity-100",
        )}
      >
        {formatOffsetForControl(subtitleOffsetMs)}
      </div>
    </>
  )
}

export default SubtitleSyncControl
