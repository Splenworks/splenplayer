export const getDarkmode = (): boolean => {
  return document.documentElement.classList.contains("dark")
}

export const toggleDarkmode = (): void => {
  document.documentElement.classList.toggle("dark")
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  )
}
