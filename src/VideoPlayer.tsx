import { forwardRef, useEffect, useState } from "react"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ mediaFiles, currentIndex }, videoRef) => {
    const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined)

    useEffect(() => {
      const blob = new Blob([mediaFiles[currentIndex].file], {
        type:
          mediaFiles[currentIndex].type === "audio" ? "audio/mpeg" : "video/mp4",
      })
      const newUrl = URL.createObjectURL(blob)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVideoSrc(newUrl)

      return () => {
        URL.revokeObjectURL(newUrl)
      }
    }, [mediaFiles, currentIndex])

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
