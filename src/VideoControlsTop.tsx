import { ChevronDownIcon } from "@heroicons/react/24/solid"
import React from "react"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"
import IconButton from "./IconButton"
import MediaList from "./MediaList"
import Tooltip from "./Tooltip"
import CloseIcon from "./assets/icons/xmark.svg?react"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoControlsTopProps {
  showControls: boolean
  isFullScreen: boolean
  mediaFiles: MediaFile[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  setIsMediaListHovered: (isHovered: boolean) => void
  exit: () => void
}

const VideoControlsTop: React.FC<VideoControlsTopProps> = ({
  showControls,
  isFullScreen,
  mediaFiles,
  currentIndex,
  setCurrentIndex,
  setIsMediaListHovered,
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
          <div
            className="group mt-2 inline-flex max-w-2xl flex-col items-start"
            onMouseEnter={() => {
              if (showControls) {
                setIsMediaListHovered(true)
              }
            }}
            onMouseLeave={() => {
              setIsMediaListHovered(false)
            }}
          >
            <div className="flex items-center">
              <button
                tabIndex={-1}
                aria-label={t("others.showPlaylist")}
                className={twMerge(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 -ml-2 py-1 text-lg font-semibold transition-colors duration-200 ease-in-out hover:bg-white/15 focus:outline-hidden",
                  showControls && "group-hover:bg-white/20",
                )}
              >
                <span>
                  {t("others.nowPlayingStatus", {
                    current: currentIndex + 1,
                    total: mediaFiles.length,
                  })}
                </span>
                <ChevronDownIcon
                  className={twMerge(
                    "h-4 w-4 transition-transform duration-300 ease-in-out",
                    showControls && "group-hover:rotate-180",
                  )}
                />
              </button>
            </div>
            <MediaList
              mediaFiles={mediaFiles}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              showControls={showControls}
            />
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
