import { useEffect, useState, type FC } from "react"
import PauseIcon from "./assets/icons/pause.svg?react"
import PlayIcon from "./assets/icons/play.svg?react"

interface ActionOverlayProps {
  isPaused: boolean
}

const ActionOverlay: FC<ActionOverlayProps> = ({ isPaused }) => {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsActive(true)
  }, [isPaused])

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div
        className={[
          "flex items-center justify-center rounded-full bg-black/50 p-5 sm:p-6 md:p-7 opacity-0",
          isActive && "animate-actionPulse",
        ].join(" ")}
        onAnimationEnd={() => {
          if (isActive) {
            setIsActive(false)
          }
        }}
      >
        {!isPaused ? (
          <PlayIcon className="h-14 w-14 text-white sm:h-16 sm:w-16 md:h-20 md:w-20" />
        ) : (
          <PauseIcon className="h-14 w-14 text-white sm:h-16 sm:w-16 md:h-20 md:w-20" />
        )}
      </div>
    </div>
  )
}

export default ActionOverlay
