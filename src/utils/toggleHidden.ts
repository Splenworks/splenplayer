export const toggleHidden = (
  element: Element | null,
  display: "flex" | "block" = "flex",
) => {
  if (!element) {
    return
  }
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden")
    element.classList.add(display)
  } else {
    element.classList.add("hidden")
    element.classList.remove(display)
  }
}

export const hideElement = (element: Element | null) => {
  if (!element) {
    return
  }
  if (!element.classList.contains("hidden")) {
    element.classList.add("hidden")
    element.classList.remove("flex")
    element.classList.remove("block")
  }
}

export const showElement = (
  element: Element | null,
  display: "flex" | "block" = "flex",
) => {
  if (!element) {
    return
  }
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden")
    element.classList.add(display)
  }
}

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
