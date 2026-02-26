import React, { useEffect, useMemo, useState } from "react"
import {
  AudioDisplayMetadata,
  buildAudioDisplayMetadata,
  fetchAudioMetadataFromInternet,
  getAudioFileCacheKey,
  readAudioTagMetadata,
} from "./utils/audioMetadata"
import { MediaFile } from "./utils/getMediaFiles"

interface AudioOverlayProps {
  analyzerContainerRef: React.RefObject<HTMLDivElement | null>
  isAudio: boolean
  mediaFile: MediaFile | null
}

const AudioOverlay: React.FC<AudioOverlayProps> = (props) => {
  const { analyzerContainerRef, isAudio, mediaFile } = props
  const [metadataByFileKey, setMetadataByFileKey] = useState<Record<string, AudioDisplayMetadata>>({})
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
    if (!mediaFile || mediaFile.type !== "audio" || !currentAudioCacheKey) {
      return
    }
    if (metadataByFileKey[currentAudioCacheKey]) {
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
      const onlineMetadata = await fetchAudioMetadataFromInternet(
        mediaFile.file.name,
        tags,
        abortController.signal,
      )

      if (shouldIgnoreResult || abortController.signal.aborted) {
        return
      }

      const metadataFromInternet = onlineMetadata
        ? buildAudioDisplayMetadata(mediaFile.file.name, tags, onlineMetadata)
        : null

      setMetadataByFileKey((prevMetadataByFileKey) => ({
        ...prevMetadataByFileKey,
        [currentAudioCacheKey]: metadataFromInternet || metadataFromTags,
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
  }, [currentAudioCacheKey, mediaFile, metadataByFileKey])

  return (
    <>
      <div
        ref={analyzerContainerRef}
        className={
          isAudio ? "absolute inset-x-0 bottom-0 h-1/2" : "absolute inset-x-0 bottom-0 hidden h-1/2"
        }
      />
      {isAudio && metadata && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div className="flex -translate-y-10 flex-col items-center md:-translate-y-20">
            {metadata.artworkUrl && (
              <img
                src={metadata.artworkUrl}
                alt={metadata.album ? `${metadata.album} album cover` : `${metadata.title} album cover`}
                className="size-56 object-cover opacity-90 md:size-72"
              />
            )}
            <div className="mt-5 max-w-[24rem] text-center text-white">
              <p className="truncate text-xl font-semibold">{metadata.title}</p>
              {metadata.artist && <p className="truncate text-sm text-white/80">{metadata.artist}</p>}
              {metadata.album && <p className="truncate text-xs text-white/65">{metadata.album}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AudioOverlay
