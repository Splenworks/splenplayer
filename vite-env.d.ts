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

declare module "matroska-subtitles/dist/matroska-subtitles.min.js" {
  export interface SubtitleTrack {
    number: number
    language?: string
    name?: string
    type: string
  }

  export interface SubtitleBlock {
    text: string
    time: number
    duration: number
    [key: string]: unknown
  }

  export class SubtitleParser {
    on(event: "tracks", listener: (tracks: SubtitleTrack[]) => void): this
    on(event: "subtitle", listener: (subtitle: SubtitleBlock, track: number) => void): this
    on(event: "finish", listener: () => void): this
    write(data: Uint8Array): void
    end(): void
  }
}
