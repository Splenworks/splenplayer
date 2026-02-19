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

  const formattedOffset = t("others.subtitleOffsetWithUnit", {
    offsetValue: formatSubtitleOffset(offsetTime),
  })

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
      <div
        className="animate-actionPulse [animation-fill-mode:forwards] rounded-xl border border-white/10 bg-zinc-900/50 px-5 py-3 text-xl font-semibold tracking-tight text-white backdrop-blur-md md:px-7 md:py-4"
        onAnimationEnd={onHidden}
      >
        {t("others.subtitleDelay", { offsetTime: formattedOffset })}
      </div>
    </div>
  )
}

export default SubtitleDelayToast
