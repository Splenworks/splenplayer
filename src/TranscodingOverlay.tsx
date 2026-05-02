import { useTranslation } from "react-i18next"
import type { TranscodePhase } from "./utils/mediaTranscoder"

interface TranscodingOverlayProps {
  phase: TranscodePhase
  progress: number
  indeterminate: boolean
}

const TranscodingOverlay: React.FC<TranscodingOverlayProps> = ({
  phase,
  progress,
  indeterminate,
}) => {
  const { t } = useTranslation()
  const clampedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0
  const percent = Math.round(clampedProgress * 100)
  const messageKey = phase === "loading" ? "transcoding.loading" : "transcoding.message"

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/70 text-white">
      <div className="flex w-72 max-w-[80%] flex-col items-center gap-4 rounded-xl border border-white/10 bg-zinc-900/70 px-6 py-5 backdrop-blur-md">
        <p className="text-base font-semibold">{t(messageKey)}</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          {indeterminate ? (
            <div className="h-full w-full animate-pulse rounded-full bg-pink-500" />
          ) : (
            <div
              className="h-full rounded-full bg-pink-500 transition-[width] duration-150 ease-linear"
              style={{ width: `${percent}%` }}
            />
          )}
        </div>
        <p className="text-xs text-white/70">
          {indeterminate ? t("transcoding.preparing") : t("transcoding.percent", { percent })}
        </p>
      </div>
    </div>
  )
}

export default TranscodingOverlay
