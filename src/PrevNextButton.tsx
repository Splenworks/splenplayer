import React from "react"
import Tooltip from "./Tooltip"
import IconButton from "./IconButton"
import NextIcon from "./assets/icons/next.svg?react"
import { useTranslation } from "react-i18next"

interface PrevNextButtonProps {
  direction: "next" | "prev"
  showControls: boolean
  onClick: () => void
}

const PrevNextButton: React.FC<PrevNextButtonProps> = ({
  direction,
  showControls,
  onClick,
}) => {
  const { t } = useTranslation()

  if (direction === "prev") {
    return (
      <Tooltip text={t("others.previous")} place="top">
        <IconButton
          svgIcon={NextIcon}
          className="rotate-180 transform"
          onClick={() => {
            if (showControls) {
              onClick()
            }
          }}
        />
      </Tooltip>
    )
  }

  return (
    <Tooltip text={t("others.next")} place="top">
      <IconButton
        svgIcon={NextIcon}
        onClick={() => {
          if (showControls) {
            onClick()
          }
        }}
      />
    </Tooltip>
  )
}

export default PrevNextButton
