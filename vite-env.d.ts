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
  export function parse(str: string): { result: ParseResult; errors: any[] }
}
