import React, { useMemo } from "react"
import { useWindowSize } from "usehooks-ts"
import { useSubtitles } from "./hooks/useSubtitles"
import { replaceBasicHtmlEntities } from "./utils/html"

interface SubtitleOverlayProps {
  currentTimeMs: number
  videoRatio: number
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ currentTimeMs, videoRatio }) => {
  const { subtitles, subtitleOffsetMs, selectedSubtitleTrack, showSubtitle } = useSubtitles()
  const { width: windowWidth = 0, height: windowHeight = 0 } = useWindowSize()

  const caption = useMemo(() => {
    if (!showSubtitle || subtitles.length === 0) return null
    const adjustedTimeMs = currentTimeMs - subtitleOffsetMs
    const entry = subtitles.find(
      (subtitle) =>
        adjustedTimeMs >= subtitle.startTime &&
        adjustedTimeMs <= subtitle.endTime &&
        (selectedSubtitleTrack ? subtitle.languages[selectedSubtitleTrack] : true),
    )
    if (!entry) return null
    const text =
      (selectedSubtitleTrack && entry.languages[selectedSubtitleTrack]) ||
      Object.values(entry.languages)[0]
    return replaceBasicHtmlEntities(text)
  }, [showSubtitle, subtitles, currentTimeMs, subtitleOffsetMs, selectedSubtitleTrack])

  const bottomPosition = useMemo(() => {
    if (windowWidth === 0 || windowHeight === 0 || videoRatio === 0 || videoRatio < 1 || isNaN(videoRatio)) return 48
    const actualVideoHeight = Math.min(windowWidth / videoRatio, windowHeight)
    const videoMarginHeight = (windowHeight - actualVideoHeight) / 2
    return videoMarginHeight > 92
      ? windowHeight - videoMarginHeight - actualVideoHeight - 60
      : windowHeight - videoMarginHeight - actualVideoHeight + 48
  }, [videoRatio, windowWidth, windowHeight])

  if (!caption) return null

  return (
    <div
      className="absolute left-4 right-4 flex flex-col items-center justify-center text-center font-sans font-semibold text-white sm:text-xl md:text-2xl lg:text-3xl"
      style={{ textShadow: "0 0 8px black", bottom: bottomPosition }}
    >
      {caption
        .split("\n")
        .filter((line) => line.trim())
        .map((line, index) => (
          <p key={index} className="mb-1">
            {line.trim()}
          </p>
        ))}
    </div>
  )
}

export default SubtitleOverlay
