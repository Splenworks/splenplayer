import React, { useMemo } from "react"
import { useWindowSize } from "usehooks-ts"

interface CaptionProps {
  caption: string
  videoRatio: number
}

const Caption: React.FC<CaptionProps> = ({
  caption,
  videoRatio,
}) => {
  const { width: windowWidth = 0, height: windowHeight = 0 } = useWindowSize()
  const captionBottomPosition = useMemo(() => {
    if (windowWidth === 0 || windowHeight === 0 || videoRatio === 0 || videoRatio < 1 || isNaN(videoRatio)) return 48
    const actualVideoHeight = Math.min(windowWidth / videoRatio, windowHeight)
    const videoMarginHeight = (windowHeight - actualVideoHeight) / 2
    if (videoMarginHeight > 92) {
      return windowHeight - videoMarginHeight - actualVideoHeight - 60
    } else {
      return windowHeight - videoMarginHeight - actualVideoHeight + 48
    }
  }, [videoRatio, windowWidth, windowHeight])
  return (
    <div
      className="absolute left-4 right-4 flex flex-col items-center justify-center text-center font-sans font-semibold text-white sm:text-xl md:text-2xl lg:text-3xl"
      style={{ textShadow: "0 0 8px black", bottom: captionBottomPosition }}
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

export default Caption
