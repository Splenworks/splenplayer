import React, { useEffect, useMemo, useState } from "react"
import { twJoin } from "tailwind-merge"
import { isSafari } from "./utils/browser"
import { formatTime } from "./utils/number"

interface ProgressBarProps {
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void
  seekValue: string
  duration: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ handleSeek, seekValue, duration }) => {
  const [isSeeking, setIsSeeking] = useState(false)
  const [localSeekValue, setLocalSeekValue] = useState(seekValue)

  useEffect(() => {
    if (!isSeeking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalSeekValue(seekValue)
    }
  }, [isSeeking, seekValue])

  const previewValue = isSeeking ? localSeekValue : seekValue
  const previewPercent = useMemo(() => {
    const value = Number(previewValue)
    if (!Number.isFinite(value)) return 0
    return Math.min(100, Math.max(0, value))
  }, [previewValue])
  const previewTime = useMemo(() => {
    if (!Number.isFinite(duration) || duration <= 0) return "00:00"
    return formatTime((duration / 100) * previewPercent)
  }, [duration, previewPercent])

  return (
    <div className="absolute right-2 bottom-2 left-2 mx-4 flex h-8 items-center justify-center">
      <div className="relative flex w-full items-center">
        {isSeeking && (
          <div
            className="pointer-events-none absolute -top-7 rounded bg-neutral-800/80 px-2 py-0.5 text-xs font-medium text-white"
            style={{ left: `${previewPercent}%`, transform: "translateX(-50%)" }}
          >
            {previewTime}
          </div>
        )}
        <input
          autoFocus
          className={twJoin(
            isSafari
              ? "h-2 w-full cursor-pointer appearance-none rounded-full border border-neutral-500 bg-transparent accent-white outline-hidden [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              : "w-full cursor-pointer accent-white outline-hidden",
          )}
          type="range"
          min="0"
          max="100"
          step="0.1"
          onChange={(e) => {
            setLocalSeekValue(e.currentTarget.value)
            handleSeek(e)
          }}
          onPointerDown={() => setIsSeeking(true)}
          onPointerUp={() => setIsSeeking(false)}
          onPointerCancel={() => setIsSeeking(false)}
          onBlur={() => setIsSeeking(false)}
          onKeyDown={(e) => {
            e.preventDefault()
          }}
          value={previewValue}
        />
      </div>
    </div>
  )
}

export default ProgressBar
