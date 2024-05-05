import { useState } from "react"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import VideoPlayer from "./VideoPlayer"
import Header from "./Header"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import enTranslation from "./assets/translations/en.json"
import koTranslation from "./assets/translations/ko.json"
import { MediaFile } from "./utils/getMediaFiles"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ko: {
        translation: koTranslation,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })

function App() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [subtitleFiles, setSubtitleFiles] = useState<File[]>([])

  const exit = () => {
    setMediaFiles([])
    setSubtitleFiles([])
  }

  if (mediaFiles.length > 0) {
    return (
      <VideoPlayer
        mediaFiles={mediaFiles}
        subtitleFile={subtitleFiles[0]}
        exit={exit}
      />
    )
  }

  return (
    <>
      <Header />
      <DragDropArea
        setMediaFiles={setMediaFiles}
        setSubtitleFiles={setSubtitleFiles}
      />
      <Footer />
    </>
  )
}

export default App
