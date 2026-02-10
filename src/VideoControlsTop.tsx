import { ChevronDownIcon } from "@heroicons/react/24/solid"
import React from "react"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"
import IconButton from "./IconButton"
import Tooltip from "./Tooltip"
import CloseIcon from "./assets/icons/xmark.svg?react"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoControlsTopProps {
  showControls: boolean
  isFullScreen: boolean
  mediaFiles: MediaFile[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  showMediaList: boolean
  setShowMediaList: React.Dispatch<React.SetStateAction<boolean>>
  exit: () => void
}

const VideoControlsTop: React.FC<VideoControlsTopProps> = ({
  showControls,
  isFullScreen,
  mediaFiles,
  currentIndex,
  setCurrentIndex,
  showMediaList,
  setShowMediaList,
  exit,
}) => {
  const { t } = useTranslation()
  const file = mediaFiles[currentIndex].file

  return (
    <div className="absolute top-4 right-4 left-6 flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xl font-semibold">
          {file.name}
        </span>
        {mediaFiles.length > 1 && (
          <div className="mt-2 max-w-full">
            <div className="flex items-center">
              <button
                tabIndex={-1}
                aria-label={showMediaList ? t("others.hidePlaylist") : t("others.showPlaylist")}
                className={twMerge(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-base font-semibold transition-colors duration-200 ease-in-out hover:bg-white/15 focus:outline-hidden",
                  showMediaList && "bg-white/20",
                )}
                onClick={() => {
                  if (showControls) {
                    setShowMediaList((prev) => !prev)
                  }
                }}
                onKeyDown={(e) => {
                  e.preventDefault()
                }}
              >
                <ChevronDownIcon
                  className={twMerge(
                    "h-4 w-4 transition-transform duration-300 ease-in-out",
                    showMediaList ? "rotate-180" : "rotate-0",
                  )}
                />
                <span>
                  {t("others.nowPlayingStatus", {
                    current: currentIndex + 1,
                    total: mediaFiles.length,
                  })}
                </span>
              </button>
            </div>
            <div
              className={twMerge(
                "overflow-hidden transition-all duration-300 ease-in-out max-w-2xl",
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
          </div>
        )}
      </div>
      {!isFullScreen && (
        <div>
          <Tooltip text={t("others.close")} place="bottom" align="right">
            <IconButton
              svgIcon={CloseIcon}
              onClick={() => {
                if (showControls) {
                  exit()
                }
              }}
            />
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export default VideoControlsTop
