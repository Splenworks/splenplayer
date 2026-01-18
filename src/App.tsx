import { createRef, useCallback, useState } from "react"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import Header from "./Header"
import { FullScreenProvider } from "./providers/FullScreenProvider"
import { MediaFile } from "./utils/getMediaFiles"
import VideoControlOverlay from "./VideoControlOverlay"
import VideoPlayer from "./VideoPlayer"

function App() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = createRef<HTMLVideoElement>()

  const exit = () => {
    setMediaFiles([])
    setCurrentIndex(0)
  }

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
