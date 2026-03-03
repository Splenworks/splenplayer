import { forwardRef, useEffect, useState } from "react"
import type { MediaFile } from "./types/MediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ mediaFiles, currentIndex }, videoRef) => {
    const media = mediaFiles[currentIndex]
    const [localVideoSrc, setLocalVideoSrc] = useState<string | null>(null)

    useEffect(() => {
      if (!media || media.source === "url") {
        return
      }

      const objectUrl = URL.createObjectURL(media.file)
      // The object URL has to be created after commit; doing it during render causes
      // a throwaway StrictMode render in dev to produce a revoked blob request.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalVideoSrc(objectUrl)

      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }, [media])

    const videoSrc =
      media?.source === "url"
        ? media.url
        : localVideoSrc ?? undefined

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
