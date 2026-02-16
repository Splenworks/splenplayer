import { ChevronDownIcon } from "@heroicons/react/24/solid"
import React from "react"
import { useTranslation } from "react-i18next"
import { twMerge } from "tailwind-merge"

interface MediaListButtonProps {
  currentIndex: number
  mediaFilesLength: number
  showControls: boolean
  isMediaListHovered: boolean
  onMouseEnter: React.MouseEventHandler<HTMLButtonElement>
  onMouseLeave: React.MouseEventHandler<HTMLButtonElement>
}

const MediaListButton: React.FC<MediaListButtonProps> = ({
  currentIndex,
  mediaFilesLength,
  showControls,
  isMediaListHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { t } = useTranslation()
  return (
    <button
      tabIndex={-1}
      aria-label={t("others.showPlaylist")}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={twMerge(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 -ml-2 py-1 text-lg font-semibold transition-colors duration-200 ease-in-out hover:bg-white/15 focus:outline-hidden",
        showControls && isMediaListHovered && "bg-white/20",
      )}
    >
      <span>
        {t("others.nowPlayingStatus", {
          current: currentIndex + 1,
          total: mediaFilesLength,
        })}
      </span>
      <ChevronDownIcon
        className={twMerge(
          "h-4 w-4 transition-transform duration-300 ease-in-out",
          showControls && isMediaListHovered && "rotate-180",
        )}
      />
    </button>
  )
}

export default MediaListButton
