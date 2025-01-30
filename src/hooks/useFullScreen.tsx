import { useContext } from "react"
import { FullScreenContext } from "../providers/FullScreenProvider"

export const useFullScreen = () => {
  const { isFullScreen, toggleFullScreen } = useContext(FullScreenContext)
  return { isFullScreen, toggleFullScreen }
}
