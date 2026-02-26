import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  AudioDisplayMetadata,
  buildAudioDisplayMetadata,
  fetchAudioMetadataFromInternet,
  getAudioFileCacheKey,
  readAudioTagMetadata,
} from "./utils/audioMetadata"
import { MediaFile } from "./utils/getMediaFiles"

interface AudioArtworkOverlayProps {
  isAudio: boolean
  mediaFile: MediaFile | null
}

const AudioArtworkOverlay: React.FC<AudioArtworkOverlayProps> = ({ isAudio, mediaFile }) => {
  const [metadataByFileKey, setMetadataByFileKey] = useState<Record<string, AudioDisplayMetadata>>({})
  const metadataByFileKeyRef = useRef<Record<string, AudioDisplayMetadata>>({})
  const currentAudioCacheKey = useMemo(() => {
    if (!mediaFile || mediaFile.type !== "audio") {
      return null
    }
    return getAudioFileCacheKey(mediaFile.file)
  }, [mediaFile])
  const metadata = useMemo(() => {
    if (!currentAudioCacheKey) {
      return null
    }
    return metadataByFileKey[currentAudioCacheKey] || null
  }, [currentAudioCacheKey, metadataByFileKey])

  useEffect(() => {
    metadataByFileKeyRef.current = metadataByFileKey
  }, [metadataByFileKey])

  useEffect(() => {
    if (!mediaFile || mediaFile.type !== "audio" || !currentAudioCacheKey) {
      return
    }
    if (metadataByFileKeyRef.current[currentAudioCacheKey]) {
      return
    }

    const abortController = new AbortController()
    let shouldIgnoreResult = false

    const loadAudioMetadata = async () => {
      const tags = await readAudioTagMetadata(mediaFile.file)
      if (shouldIgnoreResult || abortController.signal.aborted) {
        return
      }

      const metadataFromTags = buildAudioDisplayMetadata(mediaFile.file.name, tags, null)
      setMetadataByFileKey((prevMetadataByFileKey) => {
        const nextMetadataByFileKey = {
          ...prevMetadataByFileKey,
          [currentAudioCacheKey]: metadataFromTags,
        }
        metadataByFileKeyRef.current = nextMetadataByFileKey
        return nextMetadataByFileKey
      })

      const onlineMetadata = await fetchAudioMetadataFromInternet(
        mediaFile.file.name,
        tags,
        abortController.signal,
      )

      if (shouldIgnoreResult || abortController.signal.aborted || !onlineMetadata) {
        return
      }

      const metadataFromInternet = buildAudioDisplayMetadata(
        mediaFile.file.name,
        tags,
        onlineMetadata,
      )
      setMetadataByFileKey((prevMetadataByFileKey) => ({
        ...prevMetadataByFileKey,
        [currentAudioCacheKey]: metadataFromInternet,
      }))
    }

    void loadAudioMetadata().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      console.error("Failed to load audio metadata:", error)
    })

    return () => {
      shouldIgnoreResult = true
      abortController.abort()
    }
  }, [currentAudioCacheKey, mediaFile])

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
            className="h-56 w-56 object-cover opacity-50 shadow-[0_16px_60px_rgba(0,0,0,0.7)] md:h-72 md:w-72"
          />
        ) : (
          <div className="flex h-56 w-56 items-center justify-center border border-white/30 bg-white/10 text-sm text-white/70 opacity-50 md:h-72 md:w-72">
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
