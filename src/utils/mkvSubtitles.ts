import { ParseResult } from "sami-parser"

const DEFAULT_TIMECODE_SCALE_NS = 1_000_000
const FALLBACK_CUE_DURATION_MS = 3_000

const SEGMENT_ID = 0x18538067
const INFO_ID = 0x1549a966
const TRACKS_ID = 0x1654ae6b
const TRACK_ENTRY_ID = 0xae
const TRACK_NUMBER_ID = 0xd7
const TRACK_TYPE_ID = 0x83
const CODEC_ID = 0x86
const LANGUAGE_ID = 0x22b59c
const TRACK_NAME_ID = 0x536e
const TRACK_DEFAULT_ID = 0x88
const TIMECODE_SCALE_ID = 0x2ad7b1

const CLUSTER_ID = 0x1f43b675
const CLUSTER_TIMECODE_ID = 0xe7
const SIMPLE_BLOCK_ID = 0xa3
const BLOCK_GROUP_ID = 0xa0
const BLOCK_ID = 0xa1
const BLOCK_DURATION_ID = 0x9b

const SUBTITLE_TRACK_TYPE = 0x11

const SUPPORTED_TEXT_SUBTITLE_CODECS = new Set([
  "S_TEXT/UTF8",
  "S_TEXT/ASCII",
  "S_TEXT/ASS",
  "S_TEXT/SSA",
  "S_TEXT/WEBVTT",
])

type Vint = {
  length: number
  value: number
  unknown?: boolean
}

type ElementHeader = {
  id: number
  size: number
  dataOffset: number
  end: number
  unknownSize: boolean
}

type SubtitleTrack = {
  trackNumber: number
  codecId: string
  isDefault: boolean
}

type SubtitleEvent = {
  startUnit: number
  durationUnit?: number
  text: string
}

type ParsedBlock = {
  trackNumber: number
  relativeTimecode: number
  payloadStart: number
  payloadEnd: number
}

const textDecoder = new TextDecoder("utf-8")

const readVint = (bytes: Uint8Array, offset: number, isSize: boolean): Vint | null => {
  if (offset >= bytes.length) {
    return null
  }

  const firstByte = bytes[offset]
  if (firstByte === 0) {
    return null
  }

  let length = 1
  let mask = 0x80
  while (length <= 8 && (firstByte & mask) === 0) {
    mask >>= 1
    length += 1
  }

  if (length > 8 || offset + length > bytes.length) {
    return null
  }

  if (!isSize) {
    let value = 0
    for (let index = 0; index < length; index += 1) {
      value = (value << 8) | bytes[offset + index]
    }
    return { length, value }
  }

  let value = BigInt(firstByte & (mask - 1))
  for (let index = 1; index < length; index += 1) {
    value = (value << 8n) | BigInt(bytes[offset + index])
  }

  const unknownValue = (1n << BigInt(length * 7)) - 1n
  if (value === unknownValue) {
    return { length, value: -1, unknown: true }
  }

  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    return null
  }

  return { length, value: Number(value) }
}

const readElementHeader = (
  bytes: Uint8Array,
  offset: number,
  maxEnd: number,
): ElementHeader | null => {
  const id = readVint(bytes, offset, false)
  if (!id) {
    return null
  }
  const size = readVint(bytes, offset + id.length, true)
  if (!size) {
    return null
  }

  const dataOffset = offset + id.length + size.length
  if (dataOffset > maxEnd) {
    return null
  }

  const elementEnd = size.unknown ? maxEnd : Math.min(dataOffset + size.value, maxEnd)
  if (elementEnd > maxEnd) {
    return null
  }

  return {
    id: id.value,
    size: size.value,
    dataOffset,
    end: elementEnd,
    unknownSize: Boolean(size.unknown),
  }
}

const readUnsignedInt = (bytes: Uint8Array, start: number, end: number): number => {
  if (start >= end) {
    return 0
  }
  let value = 0n
  for (let index = start; index < end; index += 1) {
    value = (value << 8n) | BigInt(bytes[index])
  }
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    return Number.MAX_SAFE_INTEGER
  }
  return Number(value)
}

const readUtf8String = (bytes: Uint8Array, start: number, end: number) => {
  return textDecoder.decode(bytes.subarray(start, end)).replace(/\0+$/g, "")
}

const splitAfterNthComma = (value: string, commaCount: number) => {
  let seen = 0
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === ",") {
      seen += 1
      if (seen === commaCount) {
        return value.slice(index + 1)
      }
    }
  }
  return value
}

const normalizeSubtitleText = (value: string) => {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\u0000")
    .join("")
    .trim()
}

const parseAssOrSsaText = (value: string) => {
  let normalized = value.trim()
  const usesDialogueSyntax = normalized.startsWith("Dialogue:")
  if (normalized.startsWith("Dialogue:")) {
    normalized = normalized.slice("Dialogue:".length).trimStart()
  }
  const textField = splitAfterNthComma(normalized, usesDialogueSyntax ? 9 : 8)
  const cleanedText = textField
    .replace(/\{[^}]*\}/g, "")
    .replace(/\\[Nn]/g, "\n")
    .replace(/\\h/g, " ")
    .replace(/\\[A-Za-z]+\d*(?:\([^)]*\))?/g, "")
    .replace(/\}/g, "")
    .replace(/^\d+\)/, "")
  return normalizeSubtitleText(cleanedText)
}

const decodeSubtitlePayload = (codecId: string, payload: Uint8Array) => {
  const rawText = readUtf8String(payload, 0, payload.length)
  if (!rawText) {
    return ""
  }
  if (codecId === "S_TEXT/ASS" || codecId === "S_TEXT/SSA") {
    return parseAssOrSsaText(rawText)
  }
  return normalizeSubtitleText(rawText)
}

const parseTrackEntry = (bytes: Uint8Array, start: number, end: number): SubtitleTrack | null => {
  let trackNumber = 0
  let trackType = 0
  let codecId = ""
  let isDefault = true

  let offset = start
  while (offset < end) {
    const element = readElementHeader(bytes, offset, end)
    if (!element) {
      break
    }

    if (element.id === TRACK_NUMBER_ID) {
      trackNumber = readUnsignedInt(bytes, element.dataOffset, element.end)
    } else if (element.id === TRACK_TYPE_ID) {
      trackType = readUnsignedInt(bytes, element.dataOffset, element.end)
    } else if (element.id === CODEC_ID) {
      codecId = readUtf8String(bytes, element.dataOffset, element.end)
    } else if (element.id === TRACK_DEFAULT_ID) {
      isDefault = readUnsignedInt(bytes, element.dataOffset, element.end) !== 0
    } else if (element.id === LANGUAGE_ID || element.id === TRACK_NAME_ID) {
      // Kept for compatibility with future track-selection UI.
      readUtf8String(bytes, element.dataOffset, element.end)
    }

    if (element.end <= offset) {
      break
    }
    offset = element.end
  }

  if (
    trackNumber <= 0 ||
    trackType !== SUBTITLE_TRACK_TYPE ||
    !SUPPORTED_TEXT_SUBTITLE_CODECS.has(codecId)
  ) {
    return null
  }

  return {
    trackNumber,
    codecId,
    isDefault,
  }
}

const parseInfo = (bytes: Uint8Array, start: number, end: number) => {
  let timecodeScale = DEFAULT_TIMECODE_SCALE_NS
  let offset = start
  while (offset < end) {
    const element = readElementHeader(bytes, offset, end)
    if (!element) {
      break
    }
    if (element.id === TIMECODE_SCALE_ID) {
      timecodeScale = readUnsignedInt(bytes, element.dataOffset, element.end)
    }
    if (element.end <= offset) {
      break
    }
    offset = element.end
  }
  return timecodeScale
}

const parseTracks = (bytes: Uint8Array, start: number, end: number) => {
  const tracks: SubtitleTrack[] = []
  let offset = start
  while (offset < end) {
    const element = readElementHeader(bytes, offset, end)
    if (!element) {
      break
    }
    if (element.id === TRACK_ENTRY_ID) {
      const track = parseTrackEntry(bytes, element.dataOffset, element.end)
      if (track) {
        tracks.push(track)
      }
    }
    if (element.end <= offset) {
      break
    }
    offset = element.end
  }
  return tracks
}

const parseBlock = (bytes: Uint8Array, start: number, end: number): ParsedBlock | null => {
  const trackNumberVint = readVint(bytes, start, true)
  if (!trackNumberVint || trackNumberVint.value <= 0 || trackNumberVint.unknown) {
    return null
  }

  const minimumHeaderSize = trackNumberVint.length + 3
  if (start + minimumHeaderSize > end) {
    return null
  }

  const timecodeOffset = start + trackNumberVint.length
  const relativeTimecode = new DataView(
    bytes.buffer,
    bytes.byteOffset + timecodeOffset,
    2,
  ).getInt16(0, false)
  const flags = bytes[timecodeOffset + 2]
  const lacing = (flags & 0b0000_0110) >> 1
  if (lacing !== 0) {
    return null
  }

  return {
    trackNumber: trackNumberVint.value,
    relativeTimecode,
    payloadStart: timecodeOffset + 3,
    payloadEnd: end,
  }
}

const parseBlockGroup = (
  bytes: Uint8Array,
  start: number,
  end: number,
): { block: ParsedBlock | null; durationUnit?: number } => {
  let block: ParsedBlock | null = null
  let durationUnit: number | undefined
  let offset = start

  while (offset < end) {
    const element = readElementHeader(bytes, offset, end)
    if (!element) {
      break
    }
    if (element.id === BLOCK_ID) {
      block = parseBlock(bytes, element.dataOffset, element.end)
    } else if (element.id === BLOCK_DURATION_ID) {
      durationUnit = readUnsignedInt(bytes, element.dataOffset, element.end)
    }
    if (element.end <= offset) {
      break
    }
    offset = element.end
  }

  return { block, durationUnit }
}

const parseClusters = (
  bytes: Uint8Array,
  start: number,
  end: number,
  selectedTrack: SubtitleTrack,
) => {
  const events: SubtitleEvent[] = []

  let offset = start
  while (offset < end) {
    const segmentElement = readElementHeader(bytes, offset, end)
    if (!segmentElement) {
      break
    }
    if (segmentElement.id === CLUSTER_ID) {
      let clusterTimecode = 0
      let clusterOffset = segmentElement.dataOffset
      while (clusterOffset < segmentElement.end) {
        const clusterElement = readElementHeader(bytes, clusterOffset, segmentElement.end)
        if (!clusterElement) {
          break
        }
        if (clusterElement.id === CLUSTER_TIMECODE_ID) {
          clusterTimecode = readUnsignedInt(bytes, clusterElement.dataOffset, clusterElement.end)
        } else if (clusterElement.id === SIMPLE_BLOCK_ID) {
          const block = parseBlock(bytes, clusterElement.dataOffset, clusterElement.end)
          if (block && block.trackNumber === selectedTrack.trackNumber) {
            const text = decodeSubtitlePayload(
              selectedTrack.codecId,
              bytes.subarray(block.payloadStart, block.payloadEnd),
            )
            if (text.length > 0) {
              events.push({
                startUnit: clusterTimecode + block.relativeTimecode,
                text,
              })
            }
          }
        } else if (clusterElement.id === BLOCK_GROUP_ID) {
          const { block, durationUnit } = parseBlockGroup(
            bytes,
            clusterElement.dataOffset,
            clusterElement.end,
          )
          if (block && block.trackNumber === selectedTrack.trackNumber) {
            const text = decodeSubtitlePayload(
              selectedTrack.codecId,
              bytes.subarray(block.payloadStart, block.payloadEnd),
            )
            if (text.length > 0) {
              events.push({
                startUnit: clusterTimecode + block.relativeTimecode,
                durationUnit,
                text,
              })
            }
          }
        }

        if (clusterElement.end <= clusterOffset) {
          break
        }
        clusterOffset = clusterElement.end
      }
    }

    if (segmentElement.end <= offset) {
      break
    }
    offset = segmentElement.end
  }

  return events
}

const findSegment = (bytes: Uint8Array): { start: number; end: number } | null => {
  let offset = 0
  while (offset < bytes.length) {
    const element = readElementHeader(bytes, offset, bytes.length)
    if (!element) {
      break
    }
    if (element.id === SEGMENT_ID) {
      return { start: element.dataOffset, end: element.end }
    }
    if (element.end <= offset) {
      break
    }
    offset = element.end
  }
  return null
}

const getMkvSubtitleEvents = (
  bytes: Uint8Array,
): { timecodeScale: number; selectedTrack: SubtitleTrack | null; events: SubtitleEvent[] } => {
  const segment = findSegment(bytes)
  if (!segment) {
    return { timecodeScale: DEFAULT_TIMECODE_SCALE_NS, selectedTrack: null, events: [] }
  }

  let timecodeScale = DEFAULT_TIMECODE_SCALE_NS
  let tracks: SubtitleTrack[] = []

  let metadataOffset = segment.start
  while (metadataOffset < segment.end) {
    const element = readElementHeader(bytes, metadataOffset, segment.end)
    if (!element) {
      break
    }
    if (element.id === INFO_ID) {
      timecodeScale = parseInfo(bytes, element.dataOffset, element.end)
    } else if (element.id === TRACKS_ID) {
      tracks = parseTracks(bytes, element.dataOffset, element.end)
    } else if (element.id === CLUSTER_ID) {
      break
    }
    if (element.end <= metadataOffset) {
      break
    }
    metadataOffset = element.end
  }

  if (tracks.length === 0) {
    return { timecodeScale, selectedTrack: null, events: [] }
  }

  const selectedTrack =
    tracks.find((track) => track.isDefault) ||
    tracks.find((track) => track.codecId === "S_TEXT/UTF8") ||
    tracks[0]

  if (!selectedTrack) {
    return { timecodeScale, selectedTrack: null, events: [] }
  }

  return {
    timecodeScale,
    selectedTrack,
    events: parseClusters(bytes, segment.start, segment.end, selectedTrack),
  }
}

const getEndTime = (
  subtitleEvents: SubtitleEvent[],
  currentIndex: number,
  timeScaleToMs: number,
  startMs: number,
) => {
  const currentEvent = subtitleEvents[currentIndex]
  if (typeof currentEvent.durationUnit === "number") {
    return startMs + currentEvent.durationUnit * timeScaleToMs
  }

  const nextEvent = subtitleEvents[currentIndex + 1]
  if (!nextEvent) {
    return startMs + FALLBACK_CUE_DURATION_MS
  }

  const nextStartMs = nextEvent.startUnit * timeScaleToMs
  if (nextStartMs <= startMs) {
    return startMs + FALLBACK_CUE_DURATION_MS
  }
  return nextStartMs
}

export const extractMkvSubtitleParseResult = async (file: File): Promise<ParseResult> => {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { timecodeScale, selectedTrack, events } = getMkvSubtitleEvents(bytes)
  if (!selectedTrack || events.length === 0) {
    return []
  }

  const orderedEvents = [...events].sort((a, b) => a.startUnit - b.startUnit)
  const timeScaleToMs = timecodeScale / 1_000_000
  const groupedSubtitles = new Map<string, { startTime: number; endTime: number; lines: string[] }>()

  for (let index = 0; index < orderedEvents.length; index += 1) {
    const event = orderedEvents[index]
    const startMs = Math.max(0, event.startUnit * timeScaleToMs)
    const endMs = getEndTime(orderedEvents, index, timeScaleToMs, startMs)
    if (endMs <= startMs || event.text.length === 0) {
      continue
    }

    const startTime = Math.floor(startMs)
    const endTime = Math.ceil(endMs)
    const key = `${startTime}`
    const subtitleGroup = groupedSubtitles.get(key)
    if (!subtitleGroup) {
      groupedSubtitles.set(key, {
        startTime,
        endTime,
        lines: [event.text],
      })
      continue
    }

    subtitleGroup.endTime = Math.max(subtitleGroup.endTime, endTime)
    if (!subtitleGroup.lines.includes(event.text)) {
      subtitleGroup.lines.push(event.text)
    }
  }

  return Array.from(groupedSubtitles.values())
    .sort((a, b) => a.startTime - b.startTime)
    .map((subtitleGroup) => ({
      startTime: subtitleGroup.startTime,
      endTime: subtitleGroup.endTime,
      languages: {
        x: subtitleGroup.lines.join("\n"),
      },
    }))
}
