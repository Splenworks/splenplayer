import React from "react"
import { useTranslation } from "react-i18next"
import IconButton from "./IconButton"
import Tooltip from "./Tooltip"
import ChromecastIcon from "./assets/icons/chromecast.svg?react"

interface CastButtonProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
}

const CastButton: React.FC<CastButtonProps> = ({ videoRef }) => {
  const { t } = useTranslation()
  const handleCast = () => {
    const video = videoRef.current
    if (video && video.remote) {
      video.remote.prompt().catch(() => {})
    }
  }
  return (
    <Tooltip text={t("others.cast")} place="top">
      <IconButton svgIcon={ChromecastIcon} onClick={handleCast} />
    </Tooltip>
  )
}

export default CastButton
