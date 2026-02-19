import { type FC } from "react"

interface SubtitleDelayToastProps {
  message: string | null
}

const SubtitleDelayToast: FC<SubtitleDelayToastProps> = ({ message }) => {
  if (!message) {
    return null
  }

  return (
    <div className="pointer-events-none absolute top-20 left-1/2 z-30 -translate-x-1/2 rounded-md bg-zinc-900/80 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
      {message}
    </div>
  )
}

export default SubtitleDelayToast
