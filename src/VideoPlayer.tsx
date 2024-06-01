import { forwardRef } from "react"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ mediaFiles, currentIndex }, videoRef) => {
    const blob = new Blob([mediaFiles[currentIndex].file], {
      type:
        mediaFiles[currentIndex].type === "audio" ? "audio/mpeg" : "video/mp4",
    })
    const videoSrc = URL.createObjectURL(blob)

    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="max-h-full max-w-full min-h-full min-w-full"
          src={videoSrc}
        />
      </div>
    )
  },
)

export default VideoPlayer
