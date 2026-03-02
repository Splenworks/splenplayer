import type { DroppedFile } from "../types/Files"

const normalizeDisplayPath = (path: string) => {
  return path
    .replace(/^\/+/, "")
    .split("/")
    .filter((segment) => segment.length > 0)
    .join(" / ")
}

export const getDisplayName = (file: File) => {
  return normalizeDisplayPath(file.webkitRelativePath) || file.name
}

const readEntriesPromise = async (directoryReader: FileSystemDirectoryReader) => {
  try {
    return await new Promise<FileSystemEntry[]>((resolve, reject) => {
      directoryReader.readEntries(resolve, reject)
    })
  } catch (error) {
    console.error("Failed to read dropped directory entries:", error)
    return []
  }
}

const readAllDirectoryEntries = async (directoryReader: FileSystemDirectoryReader) => {
  const entries: FileSystemEntry[] = []
  let readEntries = await readEntriesPromise(directoryReader)

  while (readEntries.length > 0) {
    entries.push(...readEntries)
    readEntries = await readEntriesPromise(directoryReader)
  }

  return entries
}

const getFileFromEntry = async (entry: FileSystemFileEntry) => {
  try {
    return await new Promise<DroppedFile | null>((resolve, reject) => {
      entry.file(
        (file) => {
          resolve({
            file,
            displayName: normalizeDisplayPath(entry.fullPath) || file.name,
          })
        },
        reject,
      )
    })
  } catch (error) {
    console.error("Failed to read dropped file entry:", error)
    return null
  }
}

const getAllFileEntries = async (dataTransferItemList: DataTransferItemList) => {
  const fileEntries: FileSystemFileEntry[] = []
  const queue: FileSystemEntry[] = []

  for (let i = 0; i < dataTransferItemList.length; i++) {
    const entry = dataTransferItemList[i].webkitGetAsEntry?.()
    if (entry) {
      queue.push(entry)
    }
  }

  while (queue.length > 0) {
    const entry = queue.shift()

    if (!entry) {
      continue
    }

    if (entry.isFile) {
      fileEntries.push(entry as FileSystemFileEntry)
      continue
    }

    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      queue.push(...(await readAllDirectoryEntries(reader)))
    }
  }

  return fileEntries
}

export const getDroppedFiles = async (dataTransfer: DataTransfer) => {
  const fileEntries = await getAllFileEntries(dataTransfer.items)

  if (fileEntries.length === 0) {
    return Array.from(dataTransfer.files).map((file) => ({
      file,
      displayName: getDisplayName(file),
    }))
  }

  const files = await Promise.all(fileEntries.map((entry) => getFileFromEntry(entry)))
  return files.filter((file): file is DroppedFile => file !== null)
}
