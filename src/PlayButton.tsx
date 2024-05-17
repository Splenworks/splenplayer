import React from "react"
import PlayIcon from "./assets/play.svg?react"
import PauseIcon from "./assets/pause.svg?react"
import IconButton from "./IconButton"

interface PlayButtonProps {
  onClick: () => void
}

const PlayButton: React.FC<PlayButtonProps> = ({ onClick }) => {
  return (
    <>
      <IconButton
        id="playButton"
        className="hidden pl-0.5"
        svgIcon={PlayIcon}
        onClick={onClick}
      />
      <IconButton id="pauseButton" svgIcon={PauseIcon} onClick={onClick} />
    </>
  )
}

export default PlayButton
