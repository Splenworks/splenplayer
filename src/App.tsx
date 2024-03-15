import { useState } from "react"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import VideoPlayer from "./VideoPlayer"

function App() {
  const [videoFiles, setVideoFiles] = useState<File[]>([])

  if (videoFiles.length > 0) {
    return (
      <VideoPlayer videoFile={videoFiles[0]} exit={() => setVideoFiles([])} />
    )
  }

  return (
    <>
      <DragDropArea setVideoFiles={setVideoFiles} />
      <Footer />
    </>
  )
}

export default App
