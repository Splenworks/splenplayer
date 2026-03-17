import { createContext } from "react"
import type { ParseResult } from "sami-parser"

export const SubtitleContext = createContext<{
  subtitles: ParseResult
  loadSubtitleFile: (file: File) => void
  subtitleTracks: string[]
  selectedSubtitleTrack: string | null
  setSelectedSubtitleTrack: (track: string | null) => void
  subtitleOffsetMs: number
  setSubtitleOffsetMs: (value: number | ((prevValue: number) => number)) => void
  showSubtitle: boolean
  setShowSubtitle: (show: boolean) => void
  hasSubtitles: boolean
}>({
  subtitles: [],
  loadSubtitleFile: () => {},
  subtitleTracks: [],
  selectedSubtitleTrack: null,
  setSelectedSubtitleTrack: () => {},
  subtitleOffsetMs: 0,
  setSubtitleOffsetMs: () => {},
  showSubtitle: true,
  setShowSubtitle: () => {},
  hasSubtitles: false,
})
