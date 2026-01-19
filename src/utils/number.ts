export const fileSizeString = (size: number) => {
  if (size < 1024) return `${size} bytes`
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  let unitIndex = 0
  while (size >= 1024) {
    size /= 1024
    unitIndex++
  }
  return `${parseFloat(size.toFixed(2))} ${units[unitIndex]}`
}
