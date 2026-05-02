import React, { useRef, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { twJoin } from "tailwind-merge"
import { useMediaQuery } from "usehooks-ts"
import DirectMediaUrlForm from "./DirectMediaUrlForm"
import GradientPlayCircleIcon from "./GradientPlayCircleIcon"
import type { MediaFile } from "./types/MediaFiles"
import { isSafari } from "./utils/browser"
import { getDisplayName, getDroppedFiles } from "./utils/getDroppedFiles"
import { getMediaFiles } from "./utils/getMediaFiles"

interface DragDropAreaProps {
  setMedia: (files: MediaFile[]) => void
}

const DragDropArea: React.FC<DragDropAreaProps> = ({ setMedia }) => {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const smallScreen = useMediaQuery("(max-width: 640px), (max-height: 640px)")
  const acceptedFileTypes = isSafari
    ? "video/*,audio/*,.wma,.flv,.opus,.smi,.sami,.vtt,.srt"
    : "video/*,audio/*,.mkv,.wma,.flv,.opus,.smi,.sami,.vtt,.srt"

  const isFileDrag = (e: React.DragEvent<HTMLDivElement>) =>
    Array.from(e.dataTransfer.types).includes("Files")

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isFileDrag(e)) {
      return
    }

    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isFileDrag(e)) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const leftDropZone =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom

    if (!leftDropZone) {
      return
    }

    setDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(e)) {
      return
    }

    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const { dataTransfer } = e
    const files = await getDroppedFiles(dataTransfer)
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
    const files = Array.from(e.target.files || []).map((file) => ({
      file,
      displayName: getDisplayName(file),
    }))
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
          "absolute inset-x-8 inset-y-0 flex flex-col items-center justify-center rounded-xl border-4 ff:border-2 sf:border-2 border-dashed border-gray-300 transition-colors duration-300 ease-in-out md:inset-x-16",
          "hover:bg-gradient-to-r hover:from-transparent hover:to-transparent hover:bg-[length:200%_100%] hover:animate-shimmer",
          "hover:via-pink-200/50 dark:hover:via-pink-800/20",
          dragging &&
          "border-pink-800 bg-gray-300 dark:border-pink-600 dark:bg-neutral-600",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(event) => void handleDrop(event)}
      >
        <input
          type="file"
          multiple
          accept={acceptedFileTypes}
          hidden
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
        <div className="flex w-full max-w-4xl flex-col items-center px-4 text-black dark:text-white">
          {dragging ? (
            <p className="pointer-events-none text-center text-xl font-bold text-white shadow-gray-700 [text-shadow:_0_5px_5px_var(--tw-shadow-color,0.5)] dark:shadow-black">
              <Trans i18nKey="dragDropArea.dropHere" />
            </p>
          ) : (
            <>
              <div
                className={twJoin(
                  "pointer-events-none flex flex-col items-center justify-center",
                  !smallScreen && "pb-10",
                )}
              >
                <button
                  type="button"
                  onClick={handleClick}
                  className="pointer-events-auto cursor-pointer border-0 bg-transparent p-0"
                >
                  <GradientPlayCircleIcon className="h-24 w-24" />
                </button>
                <p className="mt-8 mb-4 text-center text-xl font-bold">
                  <Trans
                    i18nKey="dragDropArea.mainMessage"
                    components={{
                      u: <span className="text-pink-800 dark:text-pink-600" />,
                    }}
                  />
                </p>
                <p className="mb-4 text-center text-lg font-semibold">
                  <Trans
                    i18nKey={isSafari ? "dragDropArea.subMessageSafari" : "dragDropArea.subMessage"}
                    components={{
                      u: <span className="text-pink-800 dark:text-pink-600" />,
                    }}
                  />
                </p>
              </div>
              <DirectMediaUrlForm setMedia={setMedia} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DragDropArea
