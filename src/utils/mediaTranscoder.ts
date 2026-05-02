// Browsers can't natively decode some media formats (e.g. WMA, older FLV).
// We lazy-load ffmpeg.wasm only when one of those is opened, then transcode
// the file in memory and feed the result to the existing <video> element via
// a blob URL.

import type { FFmpeg } from "@ffmpeg/ffmpeg"

// The ffmpeg.wasm module worker loads the core via dynamic import(), so it
// needs the ESM build. The wasm binary is exposed via the "/wasm" subpath.
import coreUrl from "@ffmpeg/core?url"
import wasmUrl from "@ffmpeg/core/wasm?url"

export type TranscodePhase = "loading" | "transcoding"

export type TranscodeStatus =
  | { status: "idle" }
  | { status: "active"; phase: TranscodePhase; progress: number; indeterminate: boolean }
  | { status: "error"; reason?: "incompatible-flv-codec" }

type ProgressCallback = (
  status: Extract<TranscodeStatus, { status: "active" }>,
) => void

export class IncompatibleFlvCodecError extends Error {
  constructor() {
    super("incompatible-flv-codec")
    this.name = "IncompatibleFlvCodecError"
  }
}

let ffmpegInstance: FFmpeg | null = null
let ffmpegLoadPromise: Promise<FFmpeg> | null = null

const transcodedBlobUrlCache = new Map<string, string>()

type InflightTranscode = {
  promise: Promise<string>
  subscribers: Set<ProgressCallback>
}
const inflightTranscodes = new Map<string, InflightTranscode>()

const fetchWithProgress = async (
  url: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ffmpeg-core wasm: ${response.status}`)
  }
  const total = Number(response.headers.get("Content-Length") || "0")
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      received += value.byteLength
      if (total > 0) {
        onProgress?.(received / total)
      }
    }
  }

  const merged = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new Blob([merged.buffer], { type: "application/wasm" })
}

const loadFFmpeg = async (
  onLoadingProgress?: (progress: number, indeterminate: boolean) => void,
): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance
  }
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg")
      const instance = new FFmpeg()

      // Surface ffmpeg's stdout/stderr in the devtools console for diagnostics.
      instance.on("log", ({ message }) => {
        console.debug("[ffmpeg]", message)
      })

      // Pre-fetch the wasm with progress so the user gets feedback during the
      // ~32MB download. Falls back to indeterminate progress when the server
      // does not advertise Content-Length.
      let lastReported = 0
      const wasmBlob = await fetchWithProgress(wasmUrl, (progress) => {
        // Throttle to ~2% steps to avoid React re-renders on every chunk.
        if (progress - lastReported >= 0.02 || progress === 1) {
          lastReported = progress
          onLoadingProgress?.(progress, false)
        }
      })
      const wasmBlobUrl = URL.createObjectURL(wasmBlob)

      // Vite's served core URL works in browser scopes but the module worker's
      // dynamic import() can hang silently against it (path resolution +
      // dev-server transforms). Fetch the core JS into a same-origin blob URL
      // so the worker imports a clean ES-module URL.
      onLoadingProgress?.(1, true)
      const { toBlobURL } = await import("@ffmpeg/util")
      const coreBlobUrl = await toBlobURL(coreUrl, "text/javascript")

      await instance.load({ coreURL: coreBlobUrl, wasmURL: wasmBlobUrl })

      ffmpegInstance = instance
      return instance
    })().catch((error: unknown) => {
      ffmpegLoadPromise = null
      throw error
    })
  }
  return ffmpegLoadPromise
}

export const getCachedTranscodedUrl = (cacheKey: string): string | null =>
  transcodedBlobUrlCache.get(cacheKey) ?? null

type TranscodeJob = {
  inputName: string
  outputName: string
  outputMime: string
  // ffmpeg args between `-i INPUT` and OUTPUT. e.g. ["-vn", "-c:a", "libmp3lame", "-q:a", "2"].
  args: string[]
  // When set, a non-zero ffmpeg exit code throws this instead of a generic error.
  // Used for FLV remux: if `-c copy` fails we know the codecs don't fit MP4.
  exitErrorOverride?: () => Error
}

const runTranscode = async (
  file: File,
  cacheKey: string,
  job: TranscodeJob,
  onProgress?: ProgressCallback,
): Promise<string> => {
  const cached = transcodedBlobUrlCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Dedupe concurrent transcodes for the same file (e.g. React StrictMode
  // double-invoking effects in dev). Late subscribers attach to the in-flight
  // run instead of starting a fresh ffmpeg pass.
  const existing = inflightTranscodes.get(cacheKey)
  if (existing) {
    if (onProgress) {
      existing.subscribers.add(onProgress)
      onProgress({ status: "active", phase: "loading", progress: 0, indeterminate: true })
    }
    return existing.promise
  }

  const subscribers = new Set<ProgressCallback>()
  if (onProgress) {
    subscribers.add(onProgress)
  }
  const broadcast = (status: Extract<TranscodeStatus, { status: "active" }>) => {
    subscribers.forEach((cb) => cb(status))
  }

  const promise = (async (): Promise<string> => {
    broadcast({ status: "active", phase: "loading", progress: 0, indeterminate: true })

    const ffmpeg = await loadFFmpeg((progress, indeterminate) => {
      broadcast({ status: "active", phase: "loading", progress, indeterminate })
    })

    broadcast({ status: "active", phase: "transcoding", progress: 0, indeterminate: false })

    const handleProgress = ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress))
      broadcast({
        status: "active",
        phase: "transcoding",
        progress: clamped,
        indeterminate: !Number.isFinite(progress) || progress < 0,
      })
    }
    ffmpeg.on("progress", handleProgress)

    try {
      const buffer = new Uint8Array(await file.arrayBuffer())
      await ffmpeg.writeFile(job.inputName, buffer)
      const exitCode = await ffmpeg.exec([
        "-i",
        job.inputName,
        ...job.args,
        job.outputName,
      ])
      if (exitCode !== 0) {
        throw job.exitErrorOverride?.() ?? new Error(`ffmpeg exited with code ${exitCode}`)
      }
      const data = await ffmpeg.readFile(job.outputName)
      const dataBytes =
        typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data)
      const blob = new Blob([dataBytes.buffer], { type: job.outputMime })
      const blobUrl = URL.createObjectURL(blob)
      transcodedBlobUrlCache.set(cacheKey, blobUrl)
      return blobUrl
    } finally {
      ffmpeg.off("progress", handleProgress)
      try {
        await ffmpeg.deleteFile(job.inputName)
      } catch {
        // Ignore cleanup failures — the in-memory FS is small and reused.
      }
      try {
        await ffmpeg.deleteFile(job.outputName)
      } catch {
        // Same as above.
      }
    }
  })().finally(() => {
    inflightTranscodes.delete(cacheKey)
  })

  inflightTranscodes.set(cacheKey, { promise, subscribers })
  return promise
}

export const transcodeWmaToMp3 = (
  file: File,
  cacheKey: string,
  onProgress?: ProgressCallback,
): Promise<string> =>
  runTranscode(
    file,
    cacheKey,
    {
      inputName: "input.wma",
      outputName: "output.mp3",
      outputMime: "audio/mpeg",
      args: ["-vn", "-c:a", "libmp3lame", "-q:a", "2"],
    },
    onProgress,
  )

// Remux-only path: copies streams from FLV into MP4 without re-encoding.
// Works for the modern (~95% of) FLVs that hold H.264 + AAC/MP3. Fails fast
// for old codecs (Sorenson Spark, VP6, Speex, Nellymoser); we surface that as
// IncompatibleFlvCodecError so the UI can show a clear message instead of
// trying a slow re-encode.
export const transcodeFlvToMp4 = (
  file: File,
  cacheKey: string,
  onProgress?: ProgressCallback,
): Promise<string> =>
  runTranscode(
    file,
    cacheKey,
    {
      inputName: "input.flv",
      outputName: "output.mp4",
      outputMime: "video/mp4",
      args: ["-c", "copy", "-movflags", "+faststart"],
      exitErrorOverride: () => new IncompatibleFlvCodecError(),
    },
    onProgress,
  )

export const releaseTranscodedBlob = (cacheKey: string) => {
  const url = transcodedBlobUrlCache.get(cacheKey)
  if (!url) return
  URL.revokeObjectURL(url)
  transcodedBlobUrlCache.delete(cacheKey)
}
