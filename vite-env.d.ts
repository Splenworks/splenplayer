/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
declare const APP_VERSION: string
declare module "virtual:commit-hash" {
  const CommitHash: string
  export default CommitHash
}

declare module "sami-parser" {
  export type ParseResult = Array<{
    startTime: number
    endTime: number
    languages: {
      [key: string]: string
    }
  }>
  export function parse(str: string): { result: ParseResult; errors: Error[] }
}

interface SubtitleTrack {
  number: number
  language?: string
  name?: string
  type: string
}

interface SubtitleBlock {
  text: string
  time: number
  duration: number
  [key: string]: unknown
}

interface SubtitleParser {
  on(event: "tracks", listener: (tracks: SubtitleTrack[]) => void): this
  on(event: "subtitle", listener: (subtitle: SubtitleBlock, track: number) => void): this
  on(event: "finish", listener: () => void): this
  write(data: Uint8Array): void
  end(): void
}

interface MatroskaSubtitlesGlobal {
  SubtitleParser: new () => SubtitleParser
}

interface Window {
  MatroskaSubtitles: MatroskaSubtitlesGlobal
}

declare module "matroska-subtitles/dist/matroska-subtitles.min.js" {}
