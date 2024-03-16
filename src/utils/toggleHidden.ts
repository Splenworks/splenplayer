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
