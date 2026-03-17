import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import Landing from "./Landing"
import Player from "./Player"
import type { MediaFile } from "./types/MediaFiles"
import { isMkvMediaFile } from "./utils/getMediaFiles"
import { isSafari } from "./utils/browser"

const App: React.FC = () => {
  const { t } = useTranslation()
  const [exitedSession, setExitedSession] = useState<{
    mediaFiles: MediaFile[]
    currentIndex: number
  } | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const exit = useCallback(() => {
    setExitedSession({ mediaFiles, currentIndex })
    setMediaFiles([])
    setCurrentIndex(0)
  }, [currentIndex, mediaFiles])

  const setMedia = useCallback((files: MediaFile[]) => {
    const playableFiles = isSafari ? files.filter((file) => !isMkvMediaFile(file)) : files
    if (playableFiles.length !== files.length) {
      alert(t("dragDropArea.safariMkvUnsupported"))
    }
    if (playableFiles.length === 0) return
    setExitedSession(null)
    setMediaFiles(playableFiles)
    setCurrentIndex(0)
  }, [t])

  const goBack = useCallback(() => {
    if (!exitedSession || exitedSession.mediaFiles.length === 0) return
    setMediaFiles(exitedSession.mediaFiles)
    setCurrentIndex(Math.min(exitedSession.currentIndex, exitedSession.mediaFiles.length - 1))
    setExitedSession(null)
  }, [exitedSession])

  if (mediaFiles.length > 0) {
    return (
      <Player
        mediaFiles={mediaFiles}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        exit={exit}
        setMedia={setMedia}
      />
    )
  }

  return <Landing exited={Boolean(exitedSession)} goBack={goBack} setMedia={setMedia} />
}

export default App
