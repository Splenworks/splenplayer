import { useContext } from "react"
import { SubtitleContext } from "../contexts/SubtitleContext"

export function useSubtitles() {
  return useContext(SubtitleContext)
}
