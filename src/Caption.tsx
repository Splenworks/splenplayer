import React from "react"

interface CaptionProps {
  caption: string
  captionBottomPosition: number
}

const Caption: React.FC<CaptionProps> = ({
  caption,
  captionBottomPosition,
}) => {
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
