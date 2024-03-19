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

export const getAudioFiles = (files: File[]) => {
  return files
    .filter((file) => looksLikeAudio(file.name))
    .sort((a, b) => a.name.localeCompare(b.name))
}
