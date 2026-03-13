import React from "react"
import DragDropArea from "./DragDropArea"
import Footer from "./Footer"
import Header from "./Header"
import type { MediaFile } from "./types/MediaFiles"

interface LandingProps {
  exited: boolean
  goBack: () => void
  setMedia: (files: MediaFile[]) => void
}

const Landing: React.FC<LandingProps> = ({ exited, goBack, setMedia }) => (
  <>
    <Header exited={exited} goBack={goBack} />
    <DragDropArea setMedia={setMedia} />
    <Footer />
  </>
)

export default Landing
