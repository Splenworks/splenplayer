import React from "react"
import { twMerge } from "tailwind-merge"

interface CaptionButtonProps {
  filled: boolean
  onToggle: () => void
  subtitleTracks: string[]
  selectedSubtitleTrack: string | null
  onSelectSubtitleTrack: (track: string) => void
}

const getTrackPreview = (track: string) => {
  const normalizedTrack = track.split("-")[0]
  const alphaChars = normalizedTrack.replace(/[^a-z]/gi, "")
  if (alphaChars.length > 0) {
    return alphaChars.slice(0, 2).toUpperCase()
  }
  return normalizedTrack.slice(0, 2).toUpperCase() || "CC"
}

const CaptionButton: React.FC<CaptionButtonProps> = ({
  filled,
  onToggle,
  subtitleTracks,
  selectedSubtitleTrack,
  onSelectSubtitleTrack,
}) => {
  if (subtitleTracks.length <= 1) {
    return (
      <div
        className="hover:bg-opacity-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out hover:bg-zinc-500"
        onClick={onToggle}
      >
        <button
          tabIndex={-1}
          className={twMerge(
            "cursor-pointer h-5 w-6 rounded-md border-2 border-white font-mono text-xs font-semibold text-white outline-hidden transition-colors duration-300 ease-in-out focus:outline-hidden",
            filled ? "bg-white text-black" : "bg-transparent",
          )}
        >
          CC
        </button>
      </div>
    )
  }

  const activeTrack = selectedSubtitleTrack || subtitleTracks[0]
  const selectedTrackLabel = getTrackPreview(activeTrack)

  return (
    <div className="peer flex h-10 max-h-10 cursor-pointer flex-col-reverse items-center overflow-hidden rounded-full transition-all duration-300 ease-in-out hover:h-auto hover:max-h-60 hover:bg-zinc-500 hover:bg-opacity-50">
      <div
        className="hover:bg-opacity-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out hover:bg-zinc-500"
        onClick={onToggle}
      >
        <button
          tabIndex={-1}
          className={twMerge(
            "cursor-pointer h-5 w-6 rounded-md border-2 border-white font-mono text-xs font-semibold text-white outline-hidden transition-colors duration-300 ease-in-out focus:outline-hidden",
            filled ? "bg-white text-black" : "bg-transparent",
          )}
        >
          {selectedTrackLabel}
        </button>
      </div>
      {subtitleTracks.map((track, index) => (
        <div
          key={track}
          className={twMerge(
            "z-10 flex h-7 min-h-7 w-full cursor-pointer items-center justify-center bg-opacity-50 hover:bg-opacity-50",
            selectedSubtitleTrack === track
              ? "bg-zinc-400 hover:bg-zinc-400"
              : "hover:bg-zinc-500",
            index === subtitleTracks.length - 1 && "h-8 pt-1",
          )}
          onClick={() => onSelectSubtitleTrack(track)}
        >
          <span className="text-xs text-white">{getTrackPreview(track)}</span>
        </div>
      ))}
    </div>
  )
}

export default CaptionButton
