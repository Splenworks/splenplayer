const endsWith = (fileName: string, fileExtensions: string[]) => {
  return fileExtensions.some((extension) => fileName.endsWith(extension))
}

const looksLikeVideo = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [".mp4", ".webm", ".mov", ".avi", ".mkv"])
}

const looksLikeAudio = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return endsWith(lowerCasedName, [
    ".mp3",
    ".wav",
    ".ogg",
    ".flac",
    ".aac",
    ".m4a",
  ])
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
  subtitleFile: File | null
}

export const getMediaFiles = (files: File[]): MediaFile[] => {
  const subtitleFiles = files.filter((file) => looksLikeSubtitle(file.name))
  return files
    .map((file) => ({
      type: looksLikeVideo(file.name)
        ? "video"
        : looksLikeAudio(file.name)
          ? "audio"
          : null,
      file,
      subtitleFile:
        subtitleFiles.find((subtitleFile) =>
          nameMatchesWithoutExtension(file.name, subtitleFile.name),
        ) || null,
    }))
    .filter(({ type }) => type !== null)
    .sort((a, b) => a.file.name.localeCompare(b.file.name)) as MediaFile[]
}

export const getSubtitleFiles = (files: File[]) => {
  return files
    .filter((file) => looksLikeSubtitle(file.name))
    .sort((a, b) => a.name.localeCompare(b.name))
}
