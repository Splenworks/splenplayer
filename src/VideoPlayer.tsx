import type { MediaPlayerClass } from "dashjs"
import Hls from "hls.js"
import { forwardRef, useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react"
import type { MediaFile } from "./types/MediaFiles"
import {
  getMediaSourceKey,
  isFlvLocalMediaFile,
  isWmaLocalMediaFile,
} from "./utils/getMediaFiles"
import {
  getCachedTranscodedUrl,
  IncompatibleFlvCodecError,
  transcodeFlvToMp4,
  transcodeWmaToMp3,
  type TranscodeStatus,
} from "./utils/mediaTranscoder"

interface VideoPlayerProps {
  mediaFiles: MediaFile[]
  currentIndex: number
  onTimeUpdate?: (event: SyntheticEvent<HTMLVideoElement>) => void
  onLoadedMetadata?: (event: SyntheticEvent<HTMLVideoElement>) => void
  onEnded?: (event: SyntheticEvent<HTMLVideoElement>) => void
  onTranscodeStatusChange?: (status: TranscodeStatus) => void
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    { mediaFiles, currentIndex, onTimeUpdate, onLoadedMetadata, onEnded, onTranscodeStatusChange },
    videoRef,
  ) => {
    const media = mediaFiles[currentIndex]
    const [localVideoSrc, setLocalVideoSrc] = useState<{
      sourceKey: string
      url: string
    } | null>(null)
    const internalVideoRef = useRef<HTMLVideoElement | null>(null)
    const hlsRef = useRef<Hls | null>(null)
    const dashPlayerRef = useRef<MediaPlayerClass | null>(null)

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

    const destroyDash = useCallback(() => {
      dashPlayerRef.current?.reset()
      dashPlayerRef.current = null
    }, [])

    const destroyStreamingPlayers = useCallback(() => {
      destroyHls()
      destroyDash()
    }, [destroyDash, destroyHls])

    const mediaSourceKey = media ? getMediaSourceKey(media) : null

    useEffect(() => {
      if (!media || media.source === "url") {
        return
      }

      const sourceKey = getMediaSourceKey(media)

      const transcodeFn = isWmaLocalMediaFile(media)
        ? transcodeWmaToMp3
        : isFlvLocalMediaFile(media)
          ? transcodeFlvToMp4
          : null

      if (transcodeFn) {
        const cachedUrl = getCachedTranscodedUrl(sourceKey)
        if (cachedUrl) {
          setLocalVideoSrc({ sourceKey, url: cachedUrl })
          onTranscodeStatusChange?.({ status: "idle" })
          return
        }

        let cancelled = false
        transcodeFn(media.file, sourceKey, (status) => {
          if (cancelled) return
          onTranscodeStatusChange?.(status)
        })
          .then((blobUrl) => {
            if (cancelled) return
            setLocalVideoSrc({ sourceKey, url: blobUrl })
            onTranscodeStatusChange?.({ status: "idle" })
          })
          .catch((error: unknown) => {
            if (cancelled) return
            console.error("Failed to transcode media file:", error)
            const reason =
              error instanceof IncompatibleFlvCodecError ? "incompatible-flv-codec" : undefined
            onTranscodeStatusChange?.({ status: "error", reason })
          })

        return () => {
          cancelled = true
        }
      }

      const objectUrl = URL.createObjectURL(media.file)
      // The object URL has to be created after commit; doing it during render causes
      // a throwaway StrictMode render in dev to produce a revoked blob request.
      setLocalVideoSrc({
        sourceKey,
        url: objectUrl,
      })

      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }, [media, onTranscodeStatusChange])

    const videoSrc =
      media?.source === "url"
        ? media.url
        : localVideoSrc?.sourceKey === mediaSourceKey
          ? localVideoSrc.url
          : undefined

    useEffect(() => {
      const video = internalVideoRef.current
      if (!video) {
        return
      }

      destroyStreamingPlayers()

      if (!videoSrc) {
        video.removeAttribute("src")
        video.load()
        return
      }

      const isHlsUrl =
        media?.source === "url" && new URL(media.url).pathname.toLowerCase().endsWith(".m3u8")
      const isDashUrl =
        media?.source === "url" && new URL(media.url).pathname.toLowerCase().endsWith(".mpd")

      if (isHlsUrl) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoSrc
          return
        }

        if (Hls.isSupported()) {
          video.removeAttribute("src")
          video.load()
          const hls = new Hls()
          hlsRef.current = hls
          hls.loadSource(videoSrc)
          hls.attachMedia(video)
          return () => {
            destroyStreamingPlayers()
          }
        }
      }

      if (isDashUrl) {
        let isCancelled = false
        video.removeAttribute("src")
        video.load()
        void import("dashjs")
          .then((dashjs) => {
            if (isCancelled) {
              return
            }

            const dashPlayer = dashjs.MediaPlayer().create()
            dashPlayerRef.current = dashPlayer
            dashPlayer.initialize(video, videoSrc, false)
          })
          .catch((error: unknown) => {
            if (!isCancelled) {
              console.error("Failed to initialize DASH playback:", error)
            }
          })
        return () => {
          isCancelled = true
          destroyStreamingPlayers()
        }
      }

      video.src = videoSrc

      return () => {
        destroyStreamingPlayers()
      }
    }, [destroyStreamingPlayers, media, videoSrc])

    return (
      <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black">
        <video
          ref={setVideoElementRef}
          className="max-h-full min-h-full min-w-full max-w-full"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />
      </div>
    )
  },
)

export default VideoPlayer
