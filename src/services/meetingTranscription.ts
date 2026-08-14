export interface MeetingTranscriptEntry {
  id: string
  speaker: string
  text: string
  timestamp: number
}

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0?: {
    transcript?: string
  }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResultLike
  }
}

type SpeechRecognitionErrorEventLike = {
  error?: string
  message?: string
}

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null

  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null
}

export const canTranscribeMeetingInBrowser = () => Boolean(getSpeechRecognitionConstructor())

export const createMeetingTranscriber = ({
  speaker,
  onFinalTranscript,
  onInterimTranscript,
  onError,
  onEnd,
}: {
  speaker: string
  onFinalTranscript: (entry: MeetingTranscriptEntry) => void
  onInterimTranscript: (text: string) => void
  onError: (message: string) => void
  onEnd: () => void
}) => {
  const SpeechRecognition = getSpeechRecognitionConstructor()
  if (!SpeechRecognition) {
    throw new Error('Live transcript is not available in this browser. Use Chrome or Edge for speech recognition.')
  }

  const recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = navigator.language || 'en-US'

  recognition.onresult = (event) => {
    let interimTranscript = ''

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index]
      const transcript = result?.[0]?.transcript?.trim()
      if (!transcript) continue

      if (result.isFinal) {
        onFinalTranscript({
          id: `transcript-${Date.now()}-${index}`,
          speaker,
          text: transcript,
          timestamp: Date.now(),
        })
      } else {
        interimTranscript = `${interimTranscript} ${transcript}`.trim()
      }
    }

    onInterimTranscript(interimTranscript)
  }

  recognition.onerror = (event) => {
    const message = event.message || event.error || 'Live transcript could not continue.'
    onError(message)
  }

  recognition.onend = onEnd

  return recognition
}
