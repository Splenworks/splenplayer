import React from "react"
import { twMerge } from "tailwind-merge"
import { MediaFile } from "./utils/getMediaFiles"

interface MediaListProps {
  mediaFiles: MediaFile[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  showControls: boolean
  isMediaListHovered: boolean
  onMouseEnter: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave: React.MouseEventHandler<HTMLDivElement>
}

const MediaList: React.FC<MediaListProps> = ({
  mediaFiles,
  currentIndex,
  setCurrentIndex,
  showControls,
  isMediaListHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={twMerge(
        "-ml-2 max-w-2xl overflow-hidden transition-all duration-300 ease-in-out",
        showControls && isMediaListHovered
          ? "max-h-60 pt-2 opacity-100 pointer-events-auto"
          : "max-h-0 pt-0 opacity-0 pointer-events-none",
      )}
    >
      <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900/50 p-2 backdrop-blur-md">
        {mediaFiles.map((mediaFile, index) => (
          <button
            key={`${mediaFile.file.name}-${mediaFile.file.lastModified}-${index}`}
            tabIndex={-1}
            className={twMerge(
              "mb-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left text-white/85 transition-colors duration-200 ease-in-out last:mb-0 hover:bg-zinc-500/30 focus:outline-hidden",
              index === currentIndex && "bg-zinc-500/50 text-white",
            )}
            onClick={() => {
              if (showControls) {
                setCurrentIndex(index)
              }
            }}
            onKeyDown={(e) => {
              e.preventDefault()
            }}
          >
            <span className="shrink-0 text-xs text-zinc-300">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <span className="truncate text-sm font-medium">{mediaFile.file.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MediaList
