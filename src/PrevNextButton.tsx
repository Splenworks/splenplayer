import React from "react"
import { useTranslation } from "react-i18next"
import IconButton from "./IconButton"
import Tooltip from "./Tooltip"
import NextIcon from "./assets/icons/next.svg?react"

interface PrevNextButtonProps {
  direction: "next" | "prev"
  showControls: boolean
  disabled?: boolean
  onClick: () => void
}

const PrevNextButton: React.FC<PrevNextButtonProps> = ({
  direction,
  showControls,
  disabled = false,
  onClick,
}) => {
  const { t } = useTranslation()

  if (direction === "prev") {
    return (
      <Tooltip text={disabled ? "" : t("others.previous")} place="top">
        <IconButton
          svgIcon={NextIcon}
          disabled={disabled}
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
    <Tooltip text={disabled ? "" : t("others.next")} place="top">
      <IconButton
        svgIcon={NextIcon}
        disabled={disabled}
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
