import { type FC } from "react"
import { useTranslation } from "react-i18next"
import { formatSubtitleOffset } from "./utils/subtitleOffset"

interface SubtitleDelayToastProps {
  offsetTime: number | null
  onHidden: () => void
}

const SubtitleDelayToast: FC<SubtitleDelayToastProps> = ({ offsetTime, onHidden }) => {
  const { t } = useTranslation()

  if (offsetTime === null) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
      <div
        className="animate-actionPulse [animation-fill-mode:forwards] rounded-2xl border border-white/10 bg-zinc-900/50 px-5 py-3 text-xl font-semibold tracking-tight text-white backdrop-blur-md sm:px-7 sm:py-4 sm:text-2xl md:text-3xl"
        onAnimationEnd={onHidden}
      >
        {t("others.subtitleDelay", { offsetTime: formatSubtitleOffset(offsetTime) })}
      </div>
    </div>
  )
}

export default SubtitleDelayToast
