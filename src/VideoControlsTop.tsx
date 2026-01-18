import React from "react"
import { useTranslation } from "react-i18next"
import IconButton from "./IconButton"
import Tooltip from "./Tooltip"
import CloseIcon from "./assets/icons/xmark.svg?react"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoControlsTopProps {
  showControls: boolean
  isFullScreen: boolean
  mediaFiles: MediaFile[]
  currentIndex: number
  exit: () => void
}

const VideoControlsTop: React.FC<VideoControlsTopProps> = ({
  showControls,
  isFullScreen,
  mediaFiles,
  currentIndex,
  exit,
}) => {
  const { t } = useTranslation()
  return (
    <div className="absolute top-4 right-4 left-6 flex items-center justify-between">
      <span className="text-xl font-semibold">
        {mediaFiles[currentIndex].file.name}{" "}
        {mediaFiles.length > 1 && (
          <span>
            [{currentIndex + 1}/{mediaFiles.length}]
          </span>
        )}
      </span>
      {!isFullScreen && (
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
      )}
    </div>
  )
}

export default VideoControlsTop
