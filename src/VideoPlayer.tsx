import { forwardRef, useEffect, useMemo } from "react"
import type { MediaFile } from "./types/MediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ mediaFiles, currentIndex }, videoRef) => {
    const media = mediaFiles[currentIndex]
    const videoSrc = useMemo(() => {
      if (!media) {
        return undefined
      }

      if (media.source === "url") {
        return media.url
      }

      const blob = new Blob([media.file], {
        type: media.file.type || (media.type === "audio" ? "audio/mpeg" : "video/mp4"),
      })
      return URL.createObjectURL(blob)
    }, [media])

    useEffect(() => {
      if (!media || media.source === "url" || !videoSrc) {
        return
      }

      return () => {
        URL.revokeObjectURL(videoSrc)
      }
    }, [media, videoSrc])

    return (
      <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="max-h-full min-h-full min-w-full max-w-full"
          src={videoSrc}
        />
      </div>
    )
  },
)

export default VideoPlayer
