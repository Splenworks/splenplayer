import React from "react"
import { twMerge } from "tailwind-merge"
import { MediaFile } from "./utils/getMediaFiles"

interface MediaListProps {
  mediaFiles: MediaFile[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  showMediaList: boolean
  showControls: boolean
}

const MediaList: React.FC<MediaListProps> = ({
  mediaFiles,
  currentIndex,
  setCurrentIndex,
  showMediaList,
  showControls,
}) => {
  return (
    <div
      className={twMerge(
        "-ml-2 max-w-2xl overflow-hidden transition-all duration-300 ease-in-out",
        showMediaList ? "mt-2 max-h-56 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <div className="max-h-56 overflow-y-auto rounded-xl border border-white/20 bg-black/55 p-2 backdrop-blur-md">
        {mediaFiles.map((mediaFile, index) => (
          <button
            key={`${mediaFile.file.name}-${mediaFile.file.lastModified}-${index}`}
            tabIndex={-1}
            className={twMerge(
              "mb-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-white/85 transition-colors duration-200 ease-in-out last:mb-0 hover:bg-white/10 focus:outline-hidden",
              index === currentIndex && "bg-white/20 text-white",
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
            <span className="w-7 shrink-0 text-xs text-zinc-300">
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
