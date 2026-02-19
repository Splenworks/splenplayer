import { type FC } from "react"
import { useTranslation } from "react-i18next"
import { formatSubtitleOffset } from "./utils/subtitleOffset"

interface SubtitleDelayToastProps {
  offsetTime: number | null
}

const SubtitleDelayToast: FC<SubtitleDelayToastProps> = ({ offsetTime }) => {
  const { t } = useTranslation()

  if (offsetTime === null) {
    return null
  }

  return (
    <div className="pointer-events-none fixed top-20 left-1/2 z-30 -translate-x-1/2 rounded-md bg-zinc-900/80 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
      {t("others.subtitleDelay", { offsetTime: formatSubtitleOffset(offsetTime) })}
    </div>
  )
}

export default SubtitleDelayToast
