import { useContext } from "react"
import { FullScreenContext } from "../contexts/FullScreenContext"

export function useFullScreen() {
  const { isFullScreen, toggleFullScreen } = useContext(FullScreenContext)
  return { isFullScreen, toggleFullScreen }
}
