import React, { useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { MediaFile, getMediaFiles } from "./utils/getMediaFiles"
import { PlayCircleIcon } from "@heroicons/react/24/solid"
import { Trans, useTranslation } from "react-i18next"
import { useMediaQuery } from "usehooks-ts"

interface DragDropAreaProps {
  setMedia: (files: MediaFile[]) => void
}

const DragDropArea: React.FC<DragDropAreaProps> = ({ setMedia }) => {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const smallScreen = useMediaQuery("(max-width: 640px) or (max-height: 640px)")

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const mediaFiles = getMediaFiles(files)
    if (mediaFiles.length === 0) {
      alert(t("dragDropArea.noMediaFilesFound"))
    } else {
      setMedia(mediaFiles)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || [])
    const mediaFiles = getMediaFiles(files)
    if (mediaFiles.length === 0) {
      alert(t("dragDropArea.noMediaFilesFound"))
    } else {
      setMedia(mediaFiles)
    }
  }

  return (
    <div className="fixed top-16 left-0 right-0 bottom-16 bg-white dark:bg-neutral-900">
      <div
        className={twJoin(
          "absolute inset-x-8 md:inset-x-16 inset-y-0 rounded-xl border-dashed border-4 border-gray-300 cursor-pointer flex flex-col items-center justify-center transition-colors duration-300 ease-in-out",
          dragging &&
            "bg-neutral-200 dark:bg-neutral-600 border-pink-900 dark:border-pink-700",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          multiple
          accept="video/*,audio/*,.mkv,.smi,.sami,.vtt,.srt"
          hidden
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
        <div
          className={twJoin(
            "px-4 text-black dark:text-white pointer-events-none",
            !smallScreen && "pb-12",
          )}
        >
          {dragging ? (
            <p className="text-xl font-bold text-center text-gray-50 dark:text-white shadow-gray-600 dark:shadow-black [text-shadow:_0_5px_5px_var(--tw-shadow-color,0.5)]">
              <Trans i18nKey="dragDropArea.dropHere" />
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <PlayCircleIcon className="mb-8 w-24 h-24 text-pink-900 dark:text-pink-700" />
              <p className="mb-4 text-xl text-center font-bold">
                <Trans
                  i18nKey="dragDropArea.mainMessage"
                  components={{
                    u: <span className="text-pink-900 dark:text-pink-700" />,
                  }}
                />
              </p>
              <p className="mb-4 text-lg text-center font-semibold">
                <Trans
                  i18nKey="dragDropArea.subMessage"
                  components={{
                    u: <span className="text-pink-900 dark:text-pink-700" />,
                  }}
                />
              </p>
              {!smallScreen && (
                <p className="text-center text-gray-800 dark:text-gray-300">
                  <Trans i18nKey="dragDropArea.neverStoreYourData" />
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DragDropArea
