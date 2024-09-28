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

  useEffect(() => {
    const initializeCastApi = () => {
      console.log("initializeCastApi")
      const context = window.cast.framework.CastContext.getInstance()
      context.setOptions({
        receiverApplicationId:
          window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,

        // Auto join policy can be one of the following three:
        // ORIGIN_SCOPED - Auto connect from same appId and page origin
        // TAB_AND_ORIGIN_SCOPED - Auto connect from same appId, page origin, and tab
        // PAGE_SCOPED - No auto connect
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,

        // The following flag enables Cast Connect(requires Chrome 87 or higher)
        androidReceiverCompatible: true,
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event: any) => {
          switch (event.sessionState) {
            case window.cast.framework.SessionState.SESSION_STARTED:
            case window.cast.framework.SessionState.SESSION_RESUMED:
              console.log("Cast session started or resumed")
              break
            case window.cast.framework.SessionState.SESSION_ENDED:
              console.log("Cast session ended")
              break
            default:
              break
          }
        },
      )
    }

    if (
      !window.chrome ||
      !window.chrome.cast ||
      !window.chrome.cast.isAvailable
    ) {
      window["__onGCastApiAvailable"] = (isAvailable: boolean) => {
        if (isAvailable) {
          initializeCastApi()
        }
      }
    } else {
      initializeCastApi()
    }
  }, [])

  if (mediaFiles.length > 0) {
    return (
      <div id="fullscreenSection">
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
      </div>
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
