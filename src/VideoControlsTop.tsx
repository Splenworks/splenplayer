import React from "react"
import { useTranslation } from "react-i18next"
import IconButton from "./IconButton"
import Tooltip from "./Tooltip"
import CloseIcon from "./assets/icons/xmark.svg?react"
import { MediaFile } from "./utils/getMediaFiles"
import { fileSizeString } from "./utils/number"

interface VideoControlsTopProps {
  showControls: boolean
  isFullScreen: boolean
  mediaFiles: MediaFile[]
  currentIndex: number
  exit: () => void
  width: number
  height: number
}

const VideoControlsTop: React.FC<VideoControlsTopProps> = ({
  showControls,
  isFullScreen,
  mediaFiles,
  currentIndex,
  exit,
  width,
  height,
}) => {
  const { t } = useTranslation()
  const file = mediaFiles[currentIndex].file

  return (
    <div className="absolute top-4 right-4 left-6 flex justify-between">
      <div className="flex flex-col">
        <span className="text-xl font-semibold">
          {file.name}{" "}
          {mediaFiles.length > 1 && (
            <span>
              [{currentIndex + 1}/{mediaFiles.length}]
            </span>
          )}
        </span>
        <span className="font-semibold mt-2">
          {new Date(file.lastModified).toLocaleString()}
        </span>
        {width > 0 && height > 0 && (
          <span className="font-semibold">
            {width} x {height}
          </span>
        )}
        <span className="font-semibold">{fileSizeString(file.size)}</span>
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
