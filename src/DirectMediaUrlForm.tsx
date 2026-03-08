import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { twJoin } from "tailwind-merge"
import type { MediaFile } from "./types/MediaFiles"
import { createUrlMediaFile } from "./utils/getMediaFiles"

interface DirectMediaUrlFormProps {
  setMedia: (files: MediaFile[]) => void
}

const DirectMediaUrlForm: React.FC<DirectMediaUrlFormProps> = ({ setMedia }) => {
  const [mediaUrl, setMediaUrl] = useState("")
  const { t } = useTranslation()

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextMediaFile = createUrlMediaFile(mediaUrl.trim())
    if (!nextMediaFile) {
      alert(t("dragDropArea.invalidMediaUrl"))
      return
    }

    setMedia([nextMediaFile])
    setMediaUrl("")
  }

  return (
    <div
      className="z-10 flex w-full max-w-lg flex-col items-center gap-2 cursor-default"
    >
      <p className="text-gray-800 dark:text-gray-300">
        {t("dragDropArea.urlLabel")}
      </p>
      <form
        className="pointer-events-auto flex w-full items-center gap-2"
        onSubmit={handleUrlSubmit}
      >
        <input
          type="url"
          inputMode="url"
          value={mediaUrl}
          placeholder={t("dragDropArea.urlPlaceholder")}
          onChange={(event) => {
            setMediaUrl(event.target.value)
          }}
          className="min-w-0 flex-1 rounded-md border border-gray-300/60 px-3 py-2 text-sm text-black outline-hidden transition placeholder:text-gray-400 focus:border-pink-700 dark:border-white/25 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-pink-500 bg-white dark:bg-neutral-900"
        />
        <button
          type="submit"
          className={twJoin(
            "cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-white transition",
            "bg-gradient-to-r from-pink-700 to-pink-900 dark:from-pink-700 dark:to-pink-500",
          )}
        >
          {t("dragDropArea.urlSubmit")}
        </button>
      </form>
    </div>
  )
}

export default DirectMediaUrlForm
