import { forwardRef, useEffect, useMemo, useRef } from "react"
import { MediaFile } from "./utils/getMediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ mediaFiles, currentIndex }, videoRef) => {
    const urlRef = useRef<string | null>(null)

    const videoSrc = useMemo(() => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
      }

      const blob = new Blob([mediaFiles[currentIndex].file], {
        type:
          mediaFiles[currentIndex].type === "audio" ? "audio/mpeg" : "video/mp4",
      })
      const newUrl = URL.createObjectURL(blob)
      urlRef.current = newUrl
      return newUrl
    }, [mediaFiles, currentIndex])

    useEffect(() => {
      return () => {
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current)
          urlRef.current = null
        }
      }
    }, [])

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
