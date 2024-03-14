export const getVideoFiles = (files: File[]) => {
  return files
    .filter((file) => file.type.startsWith("video/"))
    .sort((a, b) => a.name.localeCompare(b.name))
}
