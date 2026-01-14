import { PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

interface MouseMoveOverlayProps {
  showControls: boolean
  setShowControls: (showControls: boolean) => void
  mouseMoveTimeoutRef: React.RefObject<number | null>
  videoPaused: boolean
  delay?: number
}

const MouseMoveOverlay: React.FC<PropsWithChildren<MouseMoveOverlayProps>> = ({
  children,
  showControls,
  setShowControls,
  mouseMoveTimeoutRef,
  videoPaused,
  delay = 1000,
}) => {
  return (
    <div
      className={twMerge(
        "absolute inset-0 text-white transition-opacity duration-300 ease-in-out",
        showControls ? "cursor-auto opacity-100" : "cursor-none opacity-0",
      )}
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,75%), rgba(0,0,0,0%), rgba(0,0,0,0%), rgba(0,0,0,75%)",
      }}
      onMouseEnter={() => {
        if (document.hasFocus() || videoPaused) {
          setShowControls(true)
        } else {
          setShowControls(false)
        }
      }}
      onMouseMove={() => {
        if (mouseMoveTimeoutRef.current) {
          clearTimeout(mouseMoveTimeoutRef.current)
        }
        if (document.hasFocus() || videoPaused) {
          setShowControls(true)
          mouseMoveTimeoutRef.current = window.setTimeout(() => {
            if (!videoPaused) {
              setShowControls(false)
            }
          }, delay)
        } else {
          setShowControls(false)
        }
      }}
    >
      {children}
    </div>
  )
}

export default MouseMoveOverlay
