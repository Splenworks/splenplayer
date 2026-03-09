export type MediaFileType = "video" | "audio"

type BaseMediaFile = {
  type: MediaFileType
  displayName: string
  subtitleFile: File | null
}

export type LocalMediaFile = BaseMediaFile & {
  source: "file"
  file: File
}

export type UrlMediaFile = BaseMediaFile & {
  source: "url"
  url: string
}

export type MediaFile = LocalMediaFile | UrlMediaFile
