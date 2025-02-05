import { useContext } from "react"
import { FullScreenContext } from "../context/FullScreenContext"

export const useFullScreen = () => {
  const { isFullScreen, toggleFullScreen } = useContext(FullScreenContext)
  return { isFullScreen, toggleFullScreen }
}
