import React, { useRef, useEffect } from "react"

interface VideoPlayerProps {
  videoFile: File
}

// const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoFile }) => {
//   const videoSrc = URL.createObjectURL(videoFile)
//   const videoRef = React.useRef<HTMLVideoElement>(null)

//   return (<>
//     <div className="fixed top-0 left-0 right-0 bottom-0">
//       <p>playTime: {videoRef.current?.currentTime}</p>
//     </div>
//     <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black">
//       <video
//         ref={videoRef}
//         src={videoSrc}
//         className="object-contain max-w-full max-h-full min-w-full min-h-full"
//         autoPlay
//         controls
//       >
//         <source src={videoSrc} type={videoFile.type} />
//       </video>
//     </div>
//     </>
//   )
// }

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoFile }) => {
  const videoSrc = URL.createObjectURL(videoFile)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playButtonRef = useRef<HTMLButtonElement>(null)
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const totalTimeRef = useRef<HTMLSpanElement>(null)
  const seekRef = useRef<HTMLInputElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        if (playButtonRef.current) {
          playButtonRef.current.innerText = "Pause"
        }
      } else {
        videoRef.current.pause()
        if (playButtonRef.current) {
          playButtonRef.current.innerText = "Play"
        }
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.ontimeupdate = () => {
        if (currentTimeRef.current) {
          currentTimeRef.current.innerText = video.currentTime.toFixed(2)
        }
        if (seekRef.current) {
          seekRef.current.value =
            (video.currentTime / video.duration) * 100 + ""
        }
      }
      video.onloadedmetadata = () => {
        if (totalTimeRef.current) {
          totalTimeRef.current.innerText = video.duration.toFixed(2)
        }
        if (volumeRef.current) {
          volumeRef.current.value = "0.5"
        }
        if (seekRef.current) {
          seekRef.current.value = "0"
        }
      }
    }
  }, [videoRef])

  const handleVolumeChange = () => {
    const volumeControl = volumeRef.current
    const video = videoRef.current
    if (volumeControl && video) {
      video.volume = Number(volumeControl.value)
    }
  }

  const handleSeek = () => {
    const seekControl = seekRef.current
    const video = videoRef.current
    if (seekControl && video) {
      const seekTime = (video.duration / 100) * Number(seekControl.value)
      video.currentTime = seekTime
    }
  }

  const toggleFullScreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
        )
      })
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className="video-player">
      <video ref={videoRef} src={videoSrc} autoPlay />
      <button ref={playButtonRef} onClick={togglePlayPause}>
        Pause
      </button>
      <div>
        Current time: <span ref={currentTimeRef}></span>/ Total time:{" "}
        <span ref={totalTimeRef}></span>
      </div>
      Seek:{" "}
      <input
        ref={seekRef}
        type="range"
        min="0"
        max="100"
        onChange={handleSeek}
      />
      <br />
      Volumen:{" "}
      <input
        ref={volumeRef}
        type="range"
        min="0"
        max="1"
        step="0.1"
        onChange={handleVolumeChange}
      />
      <br />
      <button onClick={toggleFullScreen}>Fullscreen</button>
    </div>
  )
}

export default VideoPlayer
