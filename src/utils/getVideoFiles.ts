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

export const getVideoFiles = (files: File[]) => {
  return files
    .filter((file) => looksLikeVideo(file.name))
    .sort((a, b) => a.name.localeCompare(b.name))
}
