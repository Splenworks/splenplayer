const looksLikeVideo = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return (
    lowerCasedName.endsWith(".mp4") ||
    lowerCasedName.endsWith(".webm") ||
    lowerCasedName.endsWith(".mov") ||
    lowerCasedName.endsWith(".avi") ||
    lowerCasedName.endsWith(".mkv")
  )
}

const looksLikeAudio = (name: string) => {
  const lowerCasedName = name.toLowerCase()
  return (
    lowerCasedName.endsWith(".mp3") ||
    lowerCasedName.endsWith(".wav") ||
    lowerCasedName.endsWith(".ogg") ||
    lowerCasedName.endsWith(".flac") ||
    lowerCasedName.endsWith(".aac")
  )
}

type MediaFileType = "video" | "audio"

export type MediaFile = {
  type: MediaFileType
  file: File
}

export const getMediaFiles = (files: File[]): MediaFile[] => {
  return files
    .map((file) => ({
      type: looksLikeVideo(file.name)
        ? "video"
        : looksLikeAudio(file.name)
        ? "audio"
        : null,
      file,
    }))
    .filter(({ type }) => type !== null)
    .sort((a, b) => a.file.name.localeCompare(b.file.name)) as MediaFile[]
}
