import { DroppedFile, getDisplayName } from "./getDroppedFiles"

const endsWith = (fileName: string, fileExtensions: string[]) => {
  return fileExtensions.some((extension) => fileName.endsWith(extension))
}

const looksLikeVideo = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [".mp4", ".webm", ".mov", ".avi", ".mkv"])
}

const looksLikeAudio = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"])
}

const looksLikeSubtitle = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [".smi", ".sami", ".vtt", ".srt"])
}

const nameMatchesWithoutExtension = (name1: string, name2: string) => {
  const name1WithoutExtension = name1.toLowerCase().replace(/\.[^/.]+$/, "")
  const name2WithoutExtension = name2.toLowerCase().replace(/\.[^/.]+$/, "")
  return (
    name1WithoutExtension.startsWith(name2WithoutExtension) ||
    name2WithoutExtension.startsWith(name1WithoutExtension)
  )
}

type MediaFileType = "video" | "audio"

export type MediaFile = {
  type: MediaFileType
  file: File
  displayName: string
  subtitleFile: File | null
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
      type: looksLikeVideo(file.file.name)
        ? "video"
        : looksLikeAudio(file.file.name)
          ? "audio"
          : null,
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

export const getSubtitleFiles = (files: Array<File | DroppedFile>) => {
  return files
    .map(toDroppedFile)
    .filter(({ file }) => looksLikeSubtitle(file.name))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}
