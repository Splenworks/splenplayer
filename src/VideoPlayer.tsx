import { MediaFile } from "./utils/getMediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
  videoRef: React.RefObject<HTMLVideoElement>
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaFiles,
  currentIndex,
  videoRef,
}) => {
  const blob = new Blob([mediaFiles[currentIndex].file], {
    type:
      mediaFiles[currentIndex].type === "audio" ? "audio/mpeg" : "video/mp4",
  })
  const videoSrc = URL.createObjectURL(blob)

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="max-h-full min-h-full min-w-full max-w-full"
        src={videoSrc}
      />
    </div>
  )
}

export default VideoPlayer
