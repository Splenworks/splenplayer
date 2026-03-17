import { parse as srtVttParse } from "@plussub/srt-vtt-parser"
import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react"
import { type ParseResult, parse as samiParse } from "sami-parser"
import { SubtitleContext } from "../contexts/SubtitleContext"
import type { MediaFile } from "../types/MediaFiles"
import { extractMkvSubtitleParseResult } from "../utils/mkvSubtitles"

async function parseSubtitleFile(file: File): Promise<ParseResult> {
  const content = await file.text()
  const fileName = file.name.toLowerCase()
  if (fileName.endsWith(".srt") || fileName.endsWith(".vtt")) {
    return srtVttParse(content).entries.map((entry) => ({
      startTime: entry.from,
      endTime: entry.to,
      languages: { x: entry.text },
    }))
  }
  return samiParse(content)?.result || []
}

async function loadSubtitlesForMedia(media: MediaFile): Promise<ParseResult> {
  if (media.subtitleFile) return parseSubtitleFile(media.subtitleFile)
  if (media.source === "file" && media.file.name.toLowerCase().endsWith(".mkv")) {
    return extractMkvSubtitleParseResult(media.file)
  }
  return []
}

interface SubtitleProviderProps {
  mediaFiles: MediaFile[]
  currentIndex: number
  videoFileHash: string
}

export const SubtitleProvider: React.FC<PropsWithChildren<SubtitleProviderProps>> = ({
  mediaFiles,
  currentIndex,
  videoFileHash,
  children,
}) => {
  const currentMedia = mediaFiles[currentIndex] || null
  const [subtitles, setSubtitles] = useState<ParseResult>([])
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [preferredSubtitleTrack, setPreferredSubtitleTrack] = useState<string | null>(null)
  const [subtitleOffsetState, setSubtitleOffsetState] = useState<{
    storageKey: string
    offsetMs: number
  } | null>(null)

  const subtitleSyncDelayStorageKey = `${videoFileHash}-subtitle-sync-delay`

  const subtitleOffsetMs = useMemo(() => {
    if (mediaFiles.length === 0) return 0
    if (subtitleOffsetState?.storageKey === subtitleSyncDelayStorageKey) {
      return subtitleOffsetState.offsetMs
    }
    const saved = localStorage.getItem(subtitleSyncDelayStorageKey)
    const parsed = Number(saved)
    return saved !== null && Number.isFinite(parsed) ? parsed : 0
  }, [mediaFiles.length, subtitleOffsetState, subtitleSyncDelayStorageKey])

  const setSubtitleOffsetMs = useCallback(
    (value: number | ((prevValue: number) => number)) => {
      if (mediaFiles.length === 0) return
      const next = typeof value === "function" ? value(subtitleOffsetMs) : value
      setSubtitleOffsetState({ storageKey: subtitleSyncDelayStorageKey, offsetMs: next })
      if (next === 0) {
        localStorage.removeItem(subtitleSyncDelayStorageKey)
      } else {
        localStorage.setItem(subtitleSyncDelayStorageKey, String(next))
      }
    },
    [mediaFiles.length, subtitleOffsetMs, subtitleSyncDelayStorageKey],
  )

  const activeSubtitles = useMemo(() => {
    return currentMedia ? subtitles : []
  }, [currentMedia, subtitles])

  const subtitleTracks = useMemo(() => {
    const trackSet = new Set<string>()
    activeSubtitles.forEach((subtitle) => {
      Object.entries(subtitle.languages).forEach(([track, text]) => {
        if (text.trim().length > 0) trackSet.add(track)
      })
    })
    return Array.from(trackSet)
  }, [activeSubtitles])

  const selectedSubtitleTrack = useMemo(() => {
    if (subtitleTracks.length === 0) return null
    if (preferredSubtitleTrack && subtitleTracks.includes(preferredSubtitleTrack)) {
      return preferredSubtitleTrack
    }
    return (
      subtitleTracks.find((track) => track === "und") ||
      subtitleTracks.find((track) => track.startsWith("en")) ||
      subtitleTracks[0]
    )
  }, [preferredSubtitleTrack, subtitleTracks])

  useEffect(() => {
    if (!currentMedia) {
      return
    }
    const controller = new AbortController()
    loadSubtitlesForMedia(currentMedia)
      .then((result) => {
        if (!controller.signal.aborted) setSubtitles(result)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Failed to load subtitles:", error)
          setSubtitles([])
        }
      })
    return () => controller.abort()
  }, [currentMedia])

  const loadSubtitleFile = useCallback(async (file: File) => {
    try {
      setSubtitles(await parseSubtitleFile(file))
    } catch (error) {
      console.error("Failed to parse subtitle file:", error)
      setSubtitles([])
    }
  }, [])

  return (
    <SubtitleContext.Provider
      value={{
        subtitles: activeSubtitles,
        loadSubtitleFile,
        subtitleTracks,
        selectedSubtitleTrack,
        setSelectedSubtitleTrack: setPreferredSubtitleTrack,
        subtitleOffsetMs,
        setSubtitleOffsetMs,
        showSubtitle,
        setShowSubtitle,
        hasSubtitles: subtitleTracks.length > 0,
      }}
    >
      {children}
    </SubtitleContext.Provider>
  )
}
