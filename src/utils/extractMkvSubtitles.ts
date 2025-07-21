export type { ParseResult } from "sami-parser"
import type { ParseResult as SamiParseResult } from "sami-parser"
// The browser build exposes a global `MatroskaSubtitles` object
// so we load it dynamically and grab the parser class from there.

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

export async function extractMkvSubtitles(
  file: File,
): Promise<SamiParseResult> {
  if (!window.MatroskaSubtitles) {
    await import("matroska-subtitles/dist/matroska-subtitles.min.js")
  }
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
