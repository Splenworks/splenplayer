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
    <form
      className="cursor-default z-10 flex w-full max-w-2xl flex-col gap-3 rounded-xl border border-gray-200/80 bg-white/85 p-3 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-neutral-950/75 sm:flex-row sm:items-center"
      onSubmit={handleUrlSubmit}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <label
        htmlFor="direct-media-url"
        className="text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-52 sm:shrink-0"
      >
        {t("dragDropArea.urlLabel")}
      </label>
      <input
        id="direct-media-url"
        type="url"
        inputMode="url"
        value={mediaUrl}
        placeholder={t("dragDropArea.urlPlaceholder")}
        onChange={(event) => {
          setMediaUrl(event.target.value)
        }}
        className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-hidden transition focus:border-pink-700 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:focus:border-pink-500"
      />
      <button
        type="submit"
        className="cursor-pointer rounded-md bg-pink-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-600"
      >
        {t("dragDropArea.urlSubmit")}
      </button>
    </form>
  )
}

export default DirectMediaUrlForm
