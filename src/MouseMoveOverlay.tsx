import { useEffect, useRef, type PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

interface MouseMoveOverlayProps {
  showControls: boolean
  setShowControls: (showControls: boolean) => void
  videoPaused: boolean
  preventAutoHide?: boolean
  delay?: number
}

const MouseMoveOverlay: React.FC<PropsWithChildren<MouseMoveOverlayProps>> = ({
  children,
  showControls,
  setShowControls,
  videoPaused,
  preventAutoHide = false,
  delay = 1000,
}) => {
  const timeoutRef = useRef<number>(undefined)

  useEffect(() => {
    clearTimeout(timeoutRef.current)

    if (videoPaused || preventAutoHide) {
      setShowControls(true)
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, delay)

    return () => clearTimeout(timeoutRef.current)
  }, [videoPaused, preventAutoHide, delay, setShowControls])

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0">
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
          if (document.hasFocus() || videoPaused || preventAutoHide) {
            setShowControls(true)
          } else {
            setShowControls(false)
          }
        }}
        onMouseMove={() => {
          clearTimeout(timeoutRef.current)
          if (document.hasFocus() || videoPaused || preventAutoHide) {
            setShowControls(true)
            if (!videoPaused && !preventAutoHide) {
              timeoutRef.current = window.setTimeout(() => {
                setShowControls(false)
              }, delay)
            }
          } else {
            setShowControls(false)
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default MouseMoveOverlay
