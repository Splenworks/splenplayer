import type { DroppedFile } from "../types/Files"
import type { MediaFile, UrlMediaFile } from "../types/MediaFiles"
import { getDisplayName } from "./getDroppedFiles"

const endsWith = (fileName: string, fileExtensions: string[]) => {
  return fileExtensions.some((extension) => fileName.endsWith(extension))
}

const looksLikeVideo = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [".mp4", ".webm", ".mov", ".avi", ".mkv"])
}

export const isMkvFileName = (name: string) => {
  return endsWith(name.toLowerCase(), [".mkv"])
}

const looksLikeAudio = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a", ".wma"])
}

export const isWmaFileName = (name: string) => {
  return endsWith(name.toLowerCase(), [".wma"])
}

const looksLikeSubtitle = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [".smi", ".sami", ".vtt", ".srt"])
}

const getMediaTypeFromName = (name: string) => {
  if (looksLikeVideo(name)) {
    return "video" as const
  }
  if (looksLikeAudio(name)) {
    return "audio" as const
  }
  return null
}

const nameMatchesWithoutExtension = (name1: string, name2: string) => {
  const name1WithoutExtension = name1.toLowerCase().replace(/\.[^/.]+$/, "")
  const name2WithoutExtension = name2.toLowerCase().replace(/\.[^/.]+$/, "")
  return (
    name1WithoutExtension.startsWith(name2WithoutExtension) ||
    name2WithoutExtension.startsWith(name1WithoutExtension)
  )
}

const toDroppedFile = (file: File | DroppedFile): DroppedFile => {
  if ("displayName" in file) {
    return file
  }

  return {
    file,
    displayName: getDisplayName(file),
  }
}

export const getMediaFiles = (files: Array<File | DroppedFile>): MediaFile[] => {
  const droppedFiles = files.map(toDroppedFile)
  const subtitleFiles = droppedFiles.filter(({ file }) => looksLikeSubtitle(file.name))
  return droppedFiles
    .map((file) => ({
      source: "file" as const,
      type: getMediaTypeFromName(file.file.name),
      file: file.file,
      displayName: file.displayName,
      subtitleFile:
        subtitleFiles.find((subtitleFile) =>
          nameMatchesWithoutExtension(file.displayName, subtitleFile.displayName),
        )?.file || null,
    }))
    .filter(({ type }) => type !== null)
    .sort((a, b) => a.displayName.localeCompare(b.displayName)) as MediaFile[]
}

const decodeUrlSegment = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const getDisplayNameFromUrl = (url: URL) => {
  const pathSegments = url.pathname.split("/").filter((segment) => segment.length > 0)
  const lastSegment = pathSegments[pathSegments.length - 1]
  return decodeUrlSegment(lastSegment || url.hostname)
}

export const createUrlMediaFile = (inputUrl: string): UrlMediaFile | null => {
  try {
    const url = new URL(inputUrl)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null
    }

    return {
      source: "url",
      type: getMediaTypeFromName(url.pathname) || "video",
      url: url.toString(),
      displayName: getDisplayNameFromUrl(url),
      subtitleFile: null,
    }
  } catch {
    return null
  }
}

export const getMediaSourceKey = (mediaFile: MediaFile) => {
  if (mediaFile.source === "file") {
    return `file:${mediaFile.file.name}:${mediaFile.file.size}:${mediaFile.file.lastModified}`
  }

  return `url:${mediaFile.url}`
}

export const isMkvMediaFile = (mediaFile: MediaFile) => {
  if (mediaFile.source === "file") {
    return isMkvFileName(mediaFile.file.name)
  }

  try {
    return isMkvFileName(new URL(mediaFile.url).pathname)
  } catch {
    return isMkvFileName(mediaFile.displayName)
  }
}

export const isWmaLocalMediaFile = (mediaFile: MediaFile) => {
  return mediaFile.source === "file" && isWmaFileName(mediaFile.file.name)
}

export const getSubtitleFiles = (files: Array<File | DroppedFile>) => {
  return files
    .map(toDroppedFile)
    .filter(({ file }) => looksLikeSubtitle(file.name))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}
