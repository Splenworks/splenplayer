import React from "react"
import { twMerge } from "tailwind-merge"
import CaptionButton from "./CaptionButton"

interface CaptionControlProps {
  filled: boolean
  onToggle: () => void
  subtitleTracks: string[]
  selectedSubtitleTrack: string | null
  onSelectSubtitleTrack: (track: string) => void
}

const getTrackPreview = (track: string) => {
  const normalizedTrack = track.split("-")[0].toLowerCase()
  if (normalizedTrack === "und" || normalizedTrack === "un") {
    return "CC"
  }
  const alphaChars = normalizedTrack.replace(/[^a-z]/gi, "")
  if (alphaChars.length > 0) {
    return alphaChars.slice(0, 2).toUpperCase()
  }
  return normalizedTrack.slice(0, 2).toUpperCase() || "CC"
}

const CaptionControl: React.FC<CaptionControlProps> = ({
  filled,
  onToggle,
  subtitleTracks,
  selectedSubtitleTrack,
  onSelectSubtitleTrack,
}) => {
  if (subtitleTracks.length <= 1) {
    return (
      <CaptionButton
        name="CC"
        filled={filled}
        onToggle={onToggle}
      />
    )
  }

  const activeTrack = selectedSubtitleTrack || subtitleTracks[0]
  const selectedTrackLabel = getTrackPreview(activeTrack)

  return (
    <div className="group flex h-10 max-h-10 cursor-pointer flex-col-reverse items-center overflow-hidden rounded-full transition-all duration-300 ease-in-out hover:h-auto hover:max-h-60 focus:outline-hidden">
      <CaptionButton
        name={selectedTrackLabel}
        filled={filled}
        onToggle={onToggle}
        roundedTop={false}
      />
      {subtitleTracks.length > 0 && (
        subtitleTracks.map((track, index) => (
          <div
            key={track}
            className={twMerge(
              "z-10 flex h-7 min-h-7 w-full shrink-0 cursor-pointer items-center justify-center bg-zinc-500/50",
              track === activeTrack
                ? "bg-zinc-300/50 hover:bg-zinc-300/50"
                : "hover:bg-zinc-400/50",
              index === subtitleTracks.length - 1 && "h-8 min-h-8 rounded-t-full pt-1",
            )}
            onClick={() => onSelectSubtitleTrack(track)}
          >
            <span className="text-xs leading-none text-white">{getTrackPreview(track)}</span>
          </div>
        ))
      )}
    </div>
  )
}

export default CaptionControl
