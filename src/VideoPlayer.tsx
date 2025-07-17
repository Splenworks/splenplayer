import { forwardRef, useEffect, useMemo } from "react"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ mediaFiles, currentIndex }, videoRef) => {
    const videoSrc = useMemo(() => {
      const blob = new Blob([mediaFiles[currentIndex].file], {
        type:
          mediaFiles[currentIndex].type === "audio" ? "audio/mpeg" : "video/mp4",
      })
      return URL.createObjectURL(blob)
    }, [mediaFiles, currentIndex])

    useEffect(() => {
      return () => {
        URL.revokeObjectURL(videoSrc)
      }
    }, [videoSrc])

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
