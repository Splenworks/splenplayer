import React, { useEffect, useMemo, useRef, useState } from "react"
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
  const [hoverPercent, setHoverPercent] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isSeeking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalSeekValue(seekValue)
    }
  }, [isSeeking, seekValue])

  const inputValue = isSeeking ? localSeekValue : seekValue

  const tooltipPercent = useMemo(() => {
    const value = Number(inputValue)
    const percent = (!Number.isFinite(value)) ? 0 : Math.min(100, Math.max(0, value))
    if (isSeeking) return percent
    return hoverPercent ?? percent
  }, [hoverPercent, isSeeking, inputValue])

  const tooltipTime = useMemo(() => {
    if (!Number.isFinite(duration) || duration <= 0) return "00:00"
    return formatTime((duration / 100) * tooltipPercent)
  }, [duration, tooltipPercent])

  const updateHoverPercent = (clientX: number) => {
    const element = inputRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (!rect.width) return
    const ratio = (clientX - rect.left) / rect.width
    const clamped = Math.min(1, Math.max(0, ratio))
    setHoverPercent(clamped * 100)
  }

  return (
    <div className="absolute right-2 bottom-2 left-2 mx-4 flex h-8 items-center justify-center">
      <div className="relative flex w-full items-center">
        {(isSeeking || hoverPercent !== null) && (
          <div
            className="pointer-events-none absolute -top-7 rounded bg-zinc-800/80 px-2 py-0.5 text-xs font-medium text-white"
            style={{ left: `${tooltipPercent}%`, transform: "translateX(-50%)" }}
          >
            {tooltipTime}
          </div>
        )}
        <input
          autoFocus
          ref={inputRef}
          className={twJoin(
            isSafari
              ? "h-2 w-full cursor-pointer appearance-none rounded-full border border-zinc-500 bg-transparent accent-white outline-hidden [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
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
          onPointerEnter={(e) => updateHoverPercent(e.clientX)}
          onPointerMove={(e) => updateHoverPercent(e.clientX)}
          onPointerLeave={() => setHoverPercent(null)}
          onKeyDown={(e) => {
            e.preventDefault()
          }}
          value={inputValue}
        />
      </div>
    </div>
  )
}

export default ProgressBar
