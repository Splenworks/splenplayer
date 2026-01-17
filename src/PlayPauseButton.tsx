import React from "react"
import Tooltip from "./Tooltip"
import IconButton from "./IconButton"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "react-i18next"
import PauseIcon from "./assets/icons/pause.svg?react"
import PlayIcon from "./assets/icons/play.svg?react"

interface PlayPauseButton {
  isPaused: boolean
  showControls: boolean
  togglePlayPause: () => void
}

const PlayPauseButton: React.FC<PlayPauseButton> = ({
  isPaused,
  showControls,
  togglePlayPause,
}) => {
  const { t } = useTranslation()
  return (
    <Tooltip text={isPaused ? t("others.play") : t("others.pause")} place="top" align="left">
      <IconButton
        className={twMerge(isPaused && "pl-0.5")}
        svgIcon={isPaused ? PlayIcon : PauseIcon}
        onClick={() => {
          if (showControls) {
            togglePlayPause()
          }
        }}
      />
    </Tooltip>
  )
}

export default PlayPauseButton
