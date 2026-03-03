import { ArrowPathIcon } from "@heroicons/react/24/solid"
import React from "react"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"
import IconButton from "./IconButton"
import Tooltip from "./Tooltip"

interface RepeatButtonProps {
  showControls: boolean
  isRepeatEnabled: boolean
  toggleRepeat: () => void
}

const RepeatButton: React.FC<RepeatButtonProps> = ({
  showControls,
  isRepeatEnabled,
  toggleRepeat,
}) => {
  const { t } = useTranslation()

  return (
    <Tooltip text={t("others.repeat")} place="top">
      <IconButton
        svgIcon={ArrowPathIcon}
        className={twMerge(isRepeatEnabled && "bg-zinc-500/50")}
        onClick={() => {
          if (showControls) {
            toggleRepeat()
          }
        }}
      />
    </Tooltip>
  )
}

export default RepeatButton
