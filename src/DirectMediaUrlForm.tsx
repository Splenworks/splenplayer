import React, { useState } from "react"
import { useTranslation } from "react-i18next"
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
      className="cursor-default z-10 flex w-full max-w-xl flex-col items-center gap-2"
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <p className="text-gray-800 dark:text-gray-300">
        {t("dragDropArea.urlLabel")}
      </p>
      <form
        className="flex w-full items-center gap-2"
        onSubmit={handleUrlSubmit}
      >
        <input
          id="direct-media-url"
          type="url"
          inputMode="url"
          value={mediaUrl}
          placeholder={t("dragDropArea.urlPlaceholder")}
          onChange={(event) => {
            setMediaUrl(event.target.value)
          }}
          className="min-w-0 flex-1 rounded-md border border-gray-300/60 bg-transparent px-3 py-2 text-sm text-black outline-hidden transition placeholder:text-gray-400 focus:border-pink-700 dark:border-white/25 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-pink-500"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-pink-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-600"
        >
          {t("dragDropArea.urlSubmit")}
        </button>
      </form>
    </div>
  )
}

export default DirectMediaUrlForm
