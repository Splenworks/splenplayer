import Hls from "hls.js"
import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import type { MediaFile } from "./types/MediaFiles"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ mediaFiles, currentIndex }, videoRef) => {
    const media = mediaFiles[currentIndex]
    const [localVideoSrc, setLocalVideoSrc] = useState<string | null>(null)
    const internalVideoRef = useRef<HTMLVideoElement | null>(null)
    const hlsRef = useRef<Hls | null>(null)

    const setVideoElementRef = useCallback(
      (node: HTMLVideoElement | null) => {
        internalVideoRef.current = node
        if (typeof videoRef === "function") {
          videoRef(node)
        } else if (videoRef) {
          videoRef.current = node
        }
      },
      [videoRef],
    )

    const destroyHls = useCallback(() => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }, [])

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

    useEffect(() => {
      const video = internalVideoRef.current
      if (!video) {
        return
      }

      destroyHls()

      if (!videoSrc) {
        video.removeAttribute("src")
        video.load()
        return
      }

      const isHlsUrl =
        media?.source === "url" && new URL(media.url).pathname.toLowerCase().endsWith(".m3u8")

      if (isHlsUrl) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoSrc
          return
        }

        if (Hls.isSupported()) {
          const hls = new Hls()
          hlsRef.current = hls
          hls.loadSource(videoSrc)
          hls.attachMedia(video)
          return () => {
            destroyHls()
          }
        }
      }

      video.src = videoSrc

      return () => {
        destroyHls()
      }
    }, [destroyHls, media, videoSrc])

    return (
      <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black">
        <video
          ref={setVideoElementRef}
          className="max-h-full min-h-full min-w-full max-w-full"
        />
      </div>
    )
  },
)

export default VideoPlayer
