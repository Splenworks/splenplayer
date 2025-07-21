export type { ParseResult } from "sami-parser"
import type { ParseResult as SamiParseResult } from "sami-parser"
// The browser build exposes a global `MatroskaSubtitles` object.
// We inject the minified script dynamically so it runs as a classic
// script and attaches itself to `window`.
import matroskaSubtitlesUrl from "matroska-subtitles/dist/matroska-subtitles.min.js?url"

interface TrackInfo {
  number: number
  language?: string
  name?: string
  type: string
}

interface ParsedSubtitle {
  text: string
  time: number
  duration: number
  [key: string]: unknown
}

let loadPromise: Promise<void> | null = null

async function loadMatroskaSubtitles(): Promise<void> {
  if (window.MatroskaSubtitles) return
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = matroskaSubtitlesUrl
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load matroska-subtitles"))
      document.head.appendChild(script)
    })
  }
  await loadPromise
}

export async function extractMkvSubtitles(
  file: File,
): Promise<SamiParseResult> {
  await loadMatroskaSubtitles()
  const { SubtitleParser } = window.MatroskaSubtitles
  const buffer = await file.arrayBuffer()
  const parser = new SubtitleParser()
  const trackLang = new Map<number, string>()
  const entries: SamiParseResult = []

  parser.on("tracks", (tracks: TrackInfo[]) => {
    for (const t of tracks) {
      trackLang.set(t.number, t.language || "x")
    }
  })

  parser.on("subtitle", (subtitle: ParsedSubtitle, track: number) => {
    entries.push({
      startTime: subtitle.time,
      endTime: subtitle.time + (subtitle.duration ?? 0),
      languages: { [trackLang.get(track) || "x"]: subtitle.text },
    })
  })

  parser.write(new Uint8Array(buffer))
  parser.end()
  await new Promise<void>((resolve) => parser.on("finish", () => resolve()))

  return entries.sort((a, b) => a.startTime - b.startTime)
}
