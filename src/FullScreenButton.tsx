import React from "react"
import { useTranslation } from "react-i18next"
import IconButton from "./IconButton"
import Tooltip from "./Tooltip"
import ExitFullscreenIcon from "./assets/icons/compress.svg?react"
import FullscreenIcon from "./assets/icons/expand.svg?react"

interface FullScreenButtonProps {
  isFullScreen: boolean
  onClick: () => void
}

const FullScreenButton: React.FC<FullScreenButtonProps> = ({
  isFullScreen,
  onClick,
}) => {
  const { t } = useTranslation()
  return (
    <Tooltip
      text={isFullScreen ? t("others.exitFullscreen") : t("others.fullscreen")}
      place="top"
      align="right"
    >
      <IconButton
        svgIcon={isFullScreen ? ExitFullscreenIcon : FullscreenIcon}
        onClick={onClick}
      />
    </Tooltip>
  )
}

export default FullScreenButton
