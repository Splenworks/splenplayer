import { PlayCircleIcon } from "@heroicons/react/24/solid"
import React, { useRef, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { twJoin } from "tailwind-merge"
import { useMediaQuery } from "usehooks-ts"
import { MediaFile, getMediaFiles } from "./utils/getMediaFiles"

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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const mediaFiles = getMediaFiles(files)
    if (mediaFiles.length === 0) {
      alert(t("dragDropArea.noMediaFilesFound"))
    } else {
      setMedia(mediaFiles)
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 top-16 bg-white dark:bg-neutral-900">
      <div
        className={twJoin(
          "absolute inset-x-8 inset-y-0 flex cursor-pointer flex-col items-center justify-center rounded-xl border-4 border-dashed border-gray-300 transition-colors duration-300 ease-in-out md:inset-x-16",
          dragging &&
            "border-pink-900 bg-neutral-200 dark:border-pink-700 dark:bg-neutral-600",
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
            "pointer-events-none px-4 text-black dark:text-white",
            !smallScreen && "pb-12",
          )}
        >
          {dragging ? (
            <p className="text-center text-xl font-bold text-gray-50 shadow-gray-600 [text-shadow:_0_5px_5px_var(--tw-shadow-color,0.5)] dark:text-white dark:shadow-black">
              <Trans i18nKey="dragDropArea.dropHere" />
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <PlayCircleIcon className="mb-8 h-24 w-24 text-pink-900 dark:text-pink-700" />
              <p className="mb-4 text-center text-xl font-bold">
                <Trans
                  i18nKey="dragDropArea.mainMessage"
                  components={{
                    u: <span className="text-pink-900 dark:text-pink-700" />,
                  }}
                />
              </p>
              <p className="mb-4 text-center text-lg font-semibold">
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
