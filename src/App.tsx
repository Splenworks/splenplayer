import { useEffect, useState } from "react"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import VideoPlayer from "./VideoPlayer"
import Header from "./Header"

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
