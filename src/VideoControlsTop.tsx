import React from "react"
import { useTranslation } from "react-i18next"
import IconButton from "./IconButton"
import MediaList from "./MediaList"
import MediaListButton from "./MediaListButton"
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
            <MediaListButton
              currentIndex={currentIndex}
              mediaFilesLength={mediaFiles.length}
              showControls={showControls}
            />
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
