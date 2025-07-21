export type { ParseResult } from "sami-parser"
import type { ParseResult as SamiParseResult } from "sami-parser"

interface VintResult {
  length: number
  value: number
}

const readVint = (view: DataView, offset: number): VintResult => {
  const first = view.getUint8(offset)
  let mask = 0x80
  let length = 1
  while ((first & mask) === 0) {
    mask >>= 1
    length += 1
  }
  let value = first
  for (let i = 1; i < length; i++) {
    value = (value << 8) + view.getUint8(offset + i)
  }
  return { length, value }
}

const readVintValue = (view: DataView, offset: number): VintResult => {
  const { length, value } = readVint(view, offset)
  const mask = 1 << (8 * length - length)
  return { length, value: value - mask }
}

const readUInt = (view: DataView, offset: number, length: number) => {
  let value = 0
  for (let i = 0; i < length; i++) {
    value = value * 256 + view.getUint8(offset + i)
  }
  return value
}

const readInt = (view: DataView, offset: number, length: number) => {
  const uint = readUInt(view, offset, length)
  const signMask = 1 << (length * 8 - 1)
  return uint & signMask ? uint - Math.pow(2, length * 8) : uint
}

const IDS = {
  Segment: 0x18538067,
  Tracks: 0x1654ae6b,
  TrackEntry: 0xae,
  TrackNumber: 0xd7,
  TrackType: 0x83,
  CodecID: 0x86,
  TimecodeScale: 0x2ad7b1,
  Cluster: 0x1f43b675,
  Timecode: 0xe7,
  SimpleBlock: 0xa3,
  BlockGroup: 0xa0,
  Block: 0xa1,
  BlockDuration: 0x9b,
} as const

const SUBTITLE_CODEC = ["S_TEXT/UTF8", "S_TEXT/ASS"]

export async function extractMkvSubtitles(
  file: File,
): Promise<SamiParseResult> {
  const buffer = await file.arrayBuffer()
  const view = new DataView(buffer)
  let offset = 0
  let subtitleTrack = 0
  let timecodeScale = 1000000
  let clusterTime = 0
  const entries: SamiParseResult = []

  const decodeBlock = (
    dataOffset: number,
    dataSize: number,
    withDuration?: number,
  ) => {
    const { value: trackNumber, length: tLen } = readVintValue(view, dataOffset)
    if (trackNumber !== subtitleTrack) return
    const timecode = readInt(view, dataOffset + tLen, 2)
    const payloadOffset = dataOffset + tLen + 3
    const payload = new Uint8Array(buffer, payloadOffset, dataSize - (payloadOffset - dataOffset))
    const text = new TextDecoder().decode(payload).trim()
    const startTime =
      (clusterTime + timecode) * (timecodeScale / 1000000)
    const endTime = withDuration
      ? startTime + withDuration * (timecodeScale / 1000)
      : startTime + 3000
    entries.push({
      startTime,
      endTime,
      languages: { x: text },
    })
  }

  const parseLevel = (end: number) => {
    while (offset < end) {
      const idRes = readVint(view, offset)
      offset += idRes.length
      const sizeRes = readVintValue(view, offset)
      offset += sizeRes.length
      const dataEnd = offset + sizeRes.value
      switch (idRes.value) {
        case IDS.Segment:
          parseLevel(dataEnd)
          break
        case IDS.TimecodeScale:
          timecodeScale = readUInt(view, offset, sizeRes.value)
          break
        case IDS.Tracks:
          parseLevel(dataEnd)
          break
        case IDS.TrackEntry: {
          let trackNum = 0
          let trackType = 0
          let codecId = ""
          const trackEnd = dataEnd
          while (offset < trackEnd) {
            const tId = readVint(view, offset)
            offset += tId.length
            const tSize = readVintValue(view, offset)
            offset += tSize.length
            const tDataEnd = offset + tSize.value
            if (tId.value === IDS.TrackNumber) {
              trackNum = readUInt(view, offset, tSize.value)
            } else if (tId.value === IDS.TrackType) {
              trackType = readUInt(view, offset, tSize.value)
            } else if (tId.value === IDS.CodecID) {
              codecId = new TextDecoder().decode(
                new Uint8Array(buffer, offset, tSize.value),
              )
            }
            offset = tDataEnd
          }
          if (trackType === 0x11 && SUBTITLE_CODEC.includes(codecId)) {
            subtitleTrack = trackNum
          }
          break
        }
        case IDS.Cluster: {
          const savedOffset = offset
          const clusterEnd = dataEnd
          clusterTime = 0
          while (offset < clusterEnd) {
            const cId = readVint(view, offset)
            offset += cId.length
            const cSize = readVintValue(view, offset)
            offset += cSize.length
            const cEnd = offset + cSize.value
            switch (cId.value) {
              case IDS.Timecode:
                clusterTime = readUInt(view, offset, cSize.value)
                break
              case IDS.SimpleBlock:
                decodeBlock(offset, cSize.value)
                break
              case IDS.BlockGroup: {
                const bgEnd = cEnd
                let duration: number | undefined
                let blockOffset = -1
                let blockSize = 0
                while (offset < bgEnd) {
                  const bId = readVint(view, offset)
                  offset += bId.length
                  const bSize = readVintValue(view, offset)
                  offset += bSize.length
                  const bEnd = offset + bSize.value
                  if (bId.value === IDS.Block) {
                    blockOffset = offset
                    blockSize = bSize.value
                  } else if (bId.value === IDS.BlockDuration) {
                    duration = readUInt(view, offset, bSize.value)
                  }
                  offset = bEnd
                }
                if (blockOffset !== -1) {
                  decodeBlock(blockOffset, blockSize, duration)
                }
                break
              }
            }
            offset = cEnd
          }
          offset = savedOffset + sizeRes.value
          break
        }
        default:
          break
      }
      offset = dataEnd
    }
  }

  parseLevel(view.byteLength)
  return entries.sort((a, b) => a.startTime - b.startTime)
}
