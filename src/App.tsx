import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { createRef, useCallback, useEffect, useState } from "react"
import { initReactI18next } from "react-i18next"
import enTranslation from "./assets/translations/en.json"
import jaTranslation from "./assets/translations/ja.json"
import koTranslation from "./assets/translations/ko.json"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import Header from "./Header"
import { FullScreenProvider } from "./providers/FullScreenProvider"
import { MediaFile } from "./utils/getMediaFiles"
import VideoControlOverlay from "./VideoControlOverlay"
import VideoPlayer from "./VideoPlayer"

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
      ja: {
        translation: jaTranslation,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })

function App() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = createRef<HTMLVideoElement>()

  const exit = () => {
    setMediaFiles([])
  }

  useEffect(() => {
    setCurrentIndex(0)
  }, [mediaFiles])

  const setMedia = useCallback(
    (files: MediaFile[]) => {
      setMediaFiles(files)
      setCurrentIndex(0)
    },
    [setMediaFiles, setCurrentIndex],
  )

  if (mediaFiles.length > 0) {
    return (
      <FullScreenProvider>
        <VideoPlayer
          mediaFiles={mediaFiles}
          currentIndex={currentIndex}
          ref={videoRef}
        />
        <VideoControlOverlay
          mediaFiles={mediaFiles}
          exit={exit}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          videoRef={videoRef}
          setMedia={setMedia}
        />
      </FullScreenProvider>
    )
  }

  return (
    <>
      <Header />
      <DragDropArea setMedia={setMedia} />
      <Footer />
    </>
  )
}

export default App
