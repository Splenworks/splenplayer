export type AudioTagMetadata = {
  title: string | null
  artist: string | null
  album: string | null
}

export type AudioOnlineMetadata = {
  title: string | null
  artist: string | null
  album: string | null
  artworkUrl: string | null
}

export type AudioDisplayMetadata = {
  title: string
  artist: string | null
  album: string | null
  artworkUrl: string | null
}

const MAX_ID3V2_READ_BYTES = 2 * 1024 * 1024

const latin1Decoder = new TextDecoder("iso-8859-1")
const utf8Decoder = new TextDecoder("utf-8")
const utf16LeDecoder = new TextDecoder("utf-16le")

const EMPTY_TAGS: AudioTagMetadata = {
  title: null,
  artist: null,
  album: null,
}

const sanitizeTagValue = (value: string | null | undefined) => {
  if (!value) {
    return null
  }
  const sanitizedValue = value.split("\u0000").join(" ").replace(/\s+/g, " ").trim()
  return sanitizedValue.length > 0 ? sanitizedValue : null
}

const normalizeForMatch = (value: string | null | undefined) => {
  return (
    value
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim() || ""
  )
}

const readSynchsafeInt = (bytes: Uint8Array, offset: number) => {
  return (
    ((bytes[offset] & 0x7f) << 21) |
    ((bytes[offset + 1] & 0x7f) << 14) |
    ((bytes[offset + 2] & 0x7f) << 7) |
    (bytes[offset + 3] & 0x7f)
  )
}

const readUInt32 = (bytes: Uint8Array, offset: number) => {
  return (
    bytes[offset] * 0x1000000 +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  )
}

const swapUtf16ByteOrder = (bytes: Uint8Array) => {
  const evenLength = bytes.length - (bytes.length % 2)
  const swappedBytes = new Uint8Array(evenLength)
  for (let index = 0; index < evenLength; index += 2) {
    swappedBytes[index] = bytes[index + 1]
    swappedBytes[index + 1] = bytes[index]
  }
  return swappedBytes
}

const decodeUtf16 = (bytes: Uint8Array, littleEndian: boolean) => {
  const bytesToDecode = littleEndian ? bytes : swapUtf16ByteOrder(bytes)
  return utf16LeDecoder.decode(bytesToDecode)
}

const decodeTextFrame = (bytes: Uint8Array) => {
  if (bytes.length === 0) {
    return null
  }

  const encoding = bytes[0]
  const payload = bytes.subarray(1)

  if (payload.length === 0) {
    return null
  }

  if (encoding === 0) {
    return sanitizeTagValue(latin1Decoder.decode(payload))
  }
  if (encoding === 1) {
    if (payload.length >= 2) {
      if (payload[0] === 0xff && payload[1] === 0xfe) {
        return sanitizeTagValue(decodeUtf16(payload.subarray(2), true))
      }
      if (payload[0] === 0xfe && payload[1] === 0xff) {
        return sanitizeTagValue(decodeUtf16(payload.subarray(2), false))
      }
    }
    return sanitizeTagValue(decodeUtf16(payload, true))
  }
  if (encoding === 2) {
    return sanitizeTagValue(decodeUtf16(payload, false))
  }
  return sanitizeTagValue(utf8Decoder.decode(payload))
}

const applyParsedFrame = (tags: AudioTagMetadata, frameId: string, frameData: Uint8Array) => {
  const value = decodeTextFrame(frameData)
  if (!value) {
    return
  }

  if (frameId === "TIT2" || frameId === "TT2") {
    tags.title = tags.title || value
  } else if (frameId === "TPE1" || frameId === "TP1") {
    tags.artist = tags.artist || value
  } else if (frameId === "TALB" || frameId === "TAL") {
    tags.album = tags.album || value
  }
}

const parseId3v2Tags = (bytes: Uint8Array) => {
  if (
    bytes.length < 10 ||
    bytes[0] !== 0x49 ||
    bytes[1] !== 0x44 ||
    bytes[2] !== 0x33
  ) {
    return { ...EMPTY_TAGS }
  }

  const version = bytes[3]
  if (version !== 2 && version !== 3 && version !== 4) {
    return { ...EMPTY_TAGS }
  }

  const flags = bytes[5]
  const declaredTagSize = readSynchsafeInt(bytes, 6)
  const tagEnd = Math.min(bytes.length, 10 + declaredTagSize)
  const tags: AudioTagMetadata = { ...EMPTY_TAGS }

  let offset = 10
  if ((flags & 0x40) !== 0 && offset + 4 <= tagEnd) {
    if (version === 3) {
      const extendedHeaderSize = readUInt32(bytes, offset)
      offset += 4 + extendedHeaderSize
    } else if (version === 4) {
      const extendedHeaderSize = readSynchsafeInt(bytes, offset)
      offset += extendedHeaderSize <= tagEnd - offset ? extendedHeaderSize : extendedHeaderSize + 4
    }
  }

  if (version === 2) {
    while (offset + 6 <= tagEnd) {
      const frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2])
      if (frameId.charCodeAt(0) === 0) {
        break
      }
      const frameSize = (bytes[offset + 3] << 16) | (bytes[offset + 4] << 8) | bytes[offset + 5]
      offset += 6

      if (frameSize <= 0 || offset + frameSize > tagEnd) {
        break
      }

      applyParsedFrame(tags, frameId, bytes.subarray(offset, offset + frameSize))
      offset += frameSize
    }
    return tags
  }

  while (offset + 10 <= tagEnd) {
    const frameId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    )
    if (frameId.charCodeAt(0) === 0) {
      break
    }

    const frameSize = version === 4 ? readSynchsafeInt(bytes, offset + 4) : readUInt32(bytes, offset + 4)
    const frameDataOffset = offset + 10
    const frameEnd = frameDataOffset + frameSize
    if (frameSize <= 0 || frameEnd > tagEnd) {
      break
    }

    applyParsedFrame(tags, frameId, bytes.subarray(frameDataOffset, frameEnd))
    offset = frameEnd
  }

  return tags
}

const parseId3v1Tags = (bytes: Uint8Array) => {
  if (bytes.length < 128) {
    return { ...EMPTY_TAGS }
  }
  const start = bytes.length - 128
  if (
    bytes[start] !== 0x54 || // T
    bytes[start + 1] !== 0x41 || // A
    bytes[start + 2] !== 0x47 // G
  ) {
    return { ...EMPTY_TAGS }
  }

  const decodeField = (offset: number, length: number) => {
    return sanitizeTagValue(latin1Decoder.decode(bytes.subarray(start + offset, start + offset + length)))
  }

  return {
    title: decodeField(3, 30),
    artist: decodeField(33, 30),
    album: decodeField(63, 30),
  }
}

const mergeTags = (primary: AudioTagMetadata, fallback: AudioTagMetadata): AudioTagMetadata => {
  return {
    title: primary.title || fallback.title,
    artist: primary.artist || fallback.artist,
    album: primary.album || fallback.album,
  }
}

const getFileNameTitleFallback = (fileName: string) => {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "")
  return (
    sanitizeTagValue(
      withoutExtension
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " "),
    ) || "Unknown title"
  )
}

const scoreFieldMatch = (candidateValue: string | null | undefined, expectedValue: string | null, exactScore: number, partialScore: number) => {
  const normalizedCandidate = normalizeForMatch(candidateValue)
  const normalizedExpected = normalizeForMatch(expectedValue)

  if (!normalizedCandidate || !normalizedExpected) {
    return 0
  }
  if (normalizedCandidate === normalizedExpected) {
    return exactScore
  }
  if (normalizedCandidate.includes(normalizedExpected) || normalizedExpected.includes(normalizedCandidate)) {
    return partialScore
  }
  return 0
}

const getPreferredArtworkUrl = (artworkUrl100: string | undefined) => {
  if (!artworkUrl100) {
    return null
  }
  if (artworkUrl100.includes("100x100bb")) {
    return artworkUrl100.replace("100x100bb", "600x600bb")
  }
  return artworkUrl100.replace(/\/\d+x\d+\./, "/600x600bb.")
}

type ItunesTrack = {
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
}

type ItunesSearchResponse = {
  resultCount: number
  results: ItunesTrack[]
}

const pickBestTrack = (results: ItunesTrack[], tags: AudioTagMetadata, titleFallback: string) => {
  return results
    .map((result) => {
      let score = 0
      score += scoreFieldMatch(result.trackName, tags.title || titleFallback, 12, 7)
      score += scoreFieldMatch(result.artistName, tags.artist, 8, 4)
      score += scoreFieldMatch(result.collectionName, tags.album, 5, 2)
      return { result, score }
    })
    .sort((left, right) => right.score - left.score)[0]?.result
}

const getContainingFolderName = (displayName: string) => {
  const pathSegments = displayName
    .split(" / ")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

  if (pathSegments.length < 2) {
    return ""
  }

  return pathSegments[pathSegments.length - 2] || ""
}

const buildSearchTerms = (fileName: string, displayName: string, tags: AudioTagMetadata) => {
  const titleFallback = getFileNameTitleFallback(fileName)
  const folderName = sanitizeTagValue(getContainingFolderName(displayName))
  const searchTerms = new Set<string>()

  if (tags.title && tags.artist) {
    searchTerms.add(`${tags.title} ${tags.artist}`)
  }
  if (tags.title && tags.album) {
    searchTerms.add(`${tags.title} ${tags.album}`)
  }
  if (tags.title && folderName) {
    searchTerms.add(`${tags.title} ${folderName}`)
  }
  if (tags.title) {
    searchTerms.add(tags.title)
  }
  if (tags.artist && tags.album) {
    searchTerms.add(`${tags.artist} ${tags.album}`)
  }
  if (tags.artist && folderName) {
    searchTerms.add(`${tags.artist} ${folderName}`)
  }
  if (titleFallback && folderName) {
    searchTerms.add(`${titleFallback} ${folderName}`)
  }
  if (folderName) {
    searchTerms.add(folderName)
  }
  searchTerms.add(titleFallback)

  return Array.from(searchTerms).filter((term) => term.trim().length > 0)
}

export const getAudioFileCacheKey = (file: File) => {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export const readAudioTagMetadata = async (file: File): Promise<AudioTagMetadata> => {
  const fileHeaderBytes = new Uint8Array(await file.slice(0, 10).arrayBuffer())
  let parsedTags: AudioTagMetadata = { ...EMPTY_TAGS }

  if (
    fileHeaderBytes.length >= 10 &&
    fileHeaderBytes[0] === 0x49 &&
    fileHeaderBytes[1] === 0x44 &&
    fileHeaderBytes[2] === 0x33
  ) {
    const declaredTagSize = readSynchsafeInt(fileHeaderBytes, 6)
    const bytesToRead = Math.min(file.size, 10 + declaredTagSize, MAX_ID3V2_READ_BYTES)
    const id3v2Bytes = new Uint8Array(await file.slice(0, bytesToRead).arrayBuffer())
    parsedTags = parseId3v2Tags(id3v2Bytes)
  }

  if (!parsedTags.title || !parsedTags.artist || !parsedTags.album) {
    const id3v1Bytes = new Uint8Array(await file.slice(Math.max(0, file.size - 128)).arrayBuffer())
    parsedTags = mergeTags(parsedTags, parseId3v1Tags(id3v1Bytes))
  }

  return parsedTags
}

export const fetchAudioMetadataFromInternet = async (
  fileName: string,
  displayName: string,
  tags: AudioTagMetadata,
  signal?: AbortSignal,
): Promise<AudioOnlineMetadata | null> => {
  const titleFallback = getFileNameTitleFallback(fileName)
  const searchTerms = buildSearchTerms(fileName, displayName, tags)

  for (const searchTerm of searchTerms) {
    const requestUrl = new URL("https://itunes.apple.com/search")
    requestUrl.searchParams.set("term", searchTerm)
    requestUrl.searchParams.set("media", "music")
    requestUrl.searchParams.set("entity", "song")
    requestUrl.searchParams.set("limit", "20")

    const response = await fetch(requestUrl.toString(), { signal })
    if (!response.ok) {
      continue
    }

    const payload = (await response.json()) as ItunesSearchResponse
    if (!Array.isArray(payload.results) || payload.results.length === 0) {
      continue
    }

    const bestTrack = pickBestTrack(payload.results, tags, titleFallback)
    if (!bestTrack) {
      continue
    }

    return {
      title: sanitizeTagValue(bestTrack.trackName),
      artist: sanitizeTagValue(bestTrack.artistName),
      album: sanitizeTagValue(bestTrack.collectionName),
      artworkUrl: getPreferredArtworkUrl(bestTrack.artworkUrl100),
    }
  }

  return null
}

export const buildAudioDisplayMetadata = (
  fileName: string,
  tags: AudioTagMetadata,
  onlineMetadata: AudioOnlineMetadata | null,
): AudioDisplayMetadata => {
  const titleFallback = getFileNameTitleFallback(fileName)
  return {
    title: onlineMetadata?.title || tags.title || titleFallback,
    artist: onlineMetadata?.artist || tags.artist || null,
    album: onlineMetadata?.album || tags.album || null,
    artworkUrl: onlineMetadata?.artworkUrl || null,
  }
}
