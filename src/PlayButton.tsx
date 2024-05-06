import React from "react"
import { ReactComponent as PlayIcon } from "./assets/play.svg"
import { ReactComponent as PauseIcon } from "./assets/pause.svg"
import IconButton from "./IconButton"
import { hideElement, showElement } from "./utils/toggleHidden"

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

export const showPlayIcon = () => {
  const playButton = document.querySelector("#playButton")
  const pauseButton = document.querySelector("#pauseButton")
  hideElement(pauseButton)
  showElement(playButton)
}

export const showPauseIcon = () => {
  const playButton = document.querySelector("#playButton")
  const pauseButton = document.querySelector("#pauseButton")
  hideElement(playButton)
  showElement(pauseButton)
}
