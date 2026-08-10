const databaseName = 'collabos-meeting-recordings'
const databaseVersion = 1
const storeName = 'recording-files'
const memoryRecordings = new Map<string, Blob>()

export interface BrowserMeetingRecording {
  recordingId: string
  stop: () => Promise<Blob>
}

export const canRecordMeetingInBrowser = () =>
  typeof window !== 'undefined' &&
  'MediaRecorder' in window &&
  Boolean(navigator.mediaDevices?.getDisplayMedia)

const getSupportedMimeType = () => {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || ''
}

export const startBrowserMeetingRecording = async (recordingId: string): Promise<BrowserMeetingRecording> => {
  if (!canRecordMeetingInBrowser()) {
    throw new Error('This browser cannot create downloadable meeting recordings.')
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  })
  const chunks: Blob[] = []
  const mimeType = getSupportedMimeType()
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  })
  recorder.start(1000)

  return {
    recordingId,
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.addEventListener(
          'stop',
          () => {
            stream.getTracks().forEach((track) => track.stop())
            resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }))
          },
          { once: true }
        )

        if (recorder.state === 'inactive') {
          stream.getTracks().forEach((track) => track.stop())
          resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }))
          return
        }

        recorder.stop()
      }),
  }
}

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available.'))
      return
    }

    const request = indexedDB.open(databaseName, databaseVersion)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Recording storage could not be opened.'))
  })

export const saveMeetingRecordingFile = async (recordingId: string, blob: Blob) => {
  memoryRecordings.set(recordingId, blob)

  try {
    const database = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite')
      transaction.objectStore(storeName).put(blob, recordingId)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error || new Error('Recording file could not be saved.'))
    })
    database.close()
  } catch {
    // Keep the in-memory copy so the same browser session can still download.
  }
}

export const getMeetingRecordingFile = async (recordingId: string) => {
  const memoryBlob = memoryRecordings.get(recordingId)
  if (memoryBlob) return memoryBlob

  const database = await openDatabase()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(recordingId)
    request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null)
    request.onerror = () => reject(request.error || new Error('Recording file could not be loaded.'))
  })
  database.close()
  return blob
}

export const downloadMeetingRecordingFile = async (recordingId: string, filename: string) => {
  const blob = await getMeetingRecordingFile(recordingId)
  if (!blob) throw new Error('Recording file is not available in this browser.')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.webm') ? filename : `${filename}.webm`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
