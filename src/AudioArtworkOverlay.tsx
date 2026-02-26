import React from "react"
import { AudioDisplayMetadata } from "./utils/audioMetadata"

interface AudioArtworkOverlayProps {
  isAudio: boolean
  metadata: AudioDisplayMetadata | null
}

const AudioArtworkOverlay: React.FC<AudioArtworkOverlayProps> = ({ isAudio, metadata }) => {
  if (!isAudio || !metadata) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <div className="flex flex-col items-center">
        {metadata.artworkUrl ? (
          <img
            src={metadata.artworkUrl}
            alt={metadata.album ? `${metadata.album} album cover` : `${metadata.title} album cover`}
            className="h-56 w-56 rounded-2xl object-cover opacity-50 shadow-[0_16px_60px_rgba(0,0,0,0.7)] md:h-72 md:w-72"
          />
        ) : (
          <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-sm text-white/70 opacity-50 md:h-72 md:w-72">
            No artwork
          </div>
        )}
        <div className="mt-5 max-w-[24rem] text-center text-white">
          <p className="truncate text-xl font-semibold">{metadata.title}</p>
          {metadata.artist && <p className="truncate text-sm text-white/80">{metadata.artist}</p>}
          {metadata.album && <p className="truncate text-xs text-white/65">{metadata.album}</p>}
        </div>
      </div>
    </div>
  )
}

export default AudioArtworkOverlay
