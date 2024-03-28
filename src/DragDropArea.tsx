import React, { useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { getVideoFiles } from "./utils/getVideoFiles"
import { getSubtitleFiles } from "./utils/getSubtitleFiles"
import { getAudioFiles } from "./utils/getAudioFiles"

interface DragDropAreaProps {
  setVideoFiles: React.Dispatch<React.SetStateAction<File[]>>
  setAudioFiles: React.Dispatch<React.SetStateAction<File[]>>
  setSubtitleFiles: React.Dispatch<React.SetStateAction<File[]>>
}

const DragDropArea: React.FC<DragDropAreaProps> = ({
  setVideoFiles,
  setAudioFiles,
  setSubtitleFiles,
}) => {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    const videoFiles = getVideoFiles(files)
    const audioFiles = getAudioFiles(files)
    const subtitleFiles = getSubtitleFiles(files)
    setVideoFiles(videoFiles)
    setAudioFiles(audioFiles)
    setSubtitleFiles(subtitleFiles)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || [])
    const videoFiles = getVideoFiles(files)
    const audioFiles = getAudioFiles(files)
    const subtitleFiles = getSubtitleFiles(files)
    setVideoFiles(videoFiles)
    setAudioFiles(audioFiles)
    setSubtitleFiles(subtitleFiles)
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-4">
      <div
        className={twJoin(
          "absolute inset-10 rounded-xl border-dashed border-4 border-gray-300 cursor-pointer flex flex-col items-center justify-center transition-colors duration-300 ease-in-out",
          dragging && "border-blue-500 bg-blue-100",
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
          hidden
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
        <div className="px-4">
          {dragging ? (
            <p className="text-xl font-bold text-center">Drop here</p>
          ) : (
            <>
              <p className="mb-4 text-xl font-bold text-center">
                Drag and drop any <u>video</u> or <u>audio</u> files here!
              </p>
              <p className="mb-4 text-lg text-center">
                You can even drop subtitle(.smi) files too.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DragDropArea
