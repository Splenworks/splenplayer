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
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [audioFiles, setAudioFiles] = useState<File[]>([])
  const [subtitleFiles, setSubtitleFiles] = useState<File[]>([])

  const exit = () => {
    setVideoFiles([])
    setAudioFiles([])
    setSubtitleFiles([])
  }

  if (videoFiles.length > 0 || audioFiles.length > 0) {
    return (
      <VideoPlayer
        videoFile={videoFiles[0] || audioFiles[0]}
        isAudio={videoFiles.length === 0}
        subtitleFile={subtitleFiles[0]}
        exit={exit}
      />
    )
  }

  return (
    <>
      <Header />
      <DragDropArea
        setVideoFiles={setVideoFiles}
        setAudioFiles={setAudioFiles}
        setSubtitleFiles={setSubtitleFiles}
      />
      <Footer />
    </>
  )
}

export default App
