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

export const formatTime = (timeInSeconds: number) => {
  if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) {
    return "00:00"
  }
  const hour = Math.floor(timeInSeconds / 3600)
  let minute = Math.floor((timeInSeconds % 3600) / 60).toString()
  if (minute.length === 1) {
    minute = `0${minute}`
  }
  let second = Math.floor(timeInSeconds % 60).toString()
  if (second.length === 1) {
    second = `0${second}`
  }
  if (hour === 0) {
    return `${minute}:${second}`
  }
  return `${hour}:${minute}:${second}`
}
