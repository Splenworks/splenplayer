import React from "react"

interface VideoPlayerProps {
  videoFile: File
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoFile }) => {
  const videoSrc = URL.createObjectURL(videoFile)

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center">
      <video
        src={videoSrc}
        className="object-contain max-w-full max-h-full min-w-full min-h-full"
        autoPlay
      />
    </div>
  )
}

export default VideoPlayer
