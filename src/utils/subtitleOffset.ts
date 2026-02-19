export const SUBTITLE_OFFSET_STEP_MS = 100
export const MIN_SUBTITLE_OFFSET_MS = -10_000
export const MAX_SUBTITLE_OFFSET_MS = 10_000

export const clampSubtitleOffset = (offsetMs: number) => {
  return Math.min(MAX_SUBTITLE_OFFSET_MS, Math.max(MIN_SUBTITLE_OFFSET_MS, offsetMs))
}

export const formatSubtitleOffset = (offsetMs: number) => {
  const sign = offsetMs >= 0 ? "+" : "-"
  const seconds = Math.abs(offsetMs) / 1000
  const normalizedSeconds = seconds.toFixed(2).replace(/\.?0+$/, "")
  return `${sign}${normalizedSeconds}`
}
