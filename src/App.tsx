import { useState } from "react"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import VideoPlayer from "./VideoPlayer"

function App() {
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [subtitleFiles, setSubtitleFiles] = useState<File[]>([])

  const exit = () => {
    setVideoFiles([])
    setSubtitleFiles([])
  }

  if (videoFiles.length > 0) {
    return (
      <VideoPlayer
        videoFile={videoFiles[0]}
        subtitleFile={subtitleFiles[0]}
        exit={exit}
      />
    )
  }

  return (
    <>
      <DragDropArea
        setVideoFiles={setVideoFiles}
        setSubtitleFiles={setSubtitleFiles}
      />
      <Footer />
    </>
  )
}

export default App
