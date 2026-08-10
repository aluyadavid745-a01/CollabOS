export interface LiveKitMeetingTokenRequest {
  roomName: string
  participantName: string
  clientSessionId?: string
  metadata?: Record<string, string>
  authToken?: string
}

export interface LiveKitMeetingTokenResponse {
  roomId: string
  participantIdentity: string
  participantName: string
  token: string
  serverUrl: string
  expiresAt: string
}

export interface LiveKitParticipantResponse {
  identity: string
  name: string
  sid: string
}

export interface CreateMeetingResponse {
  roomId: string
  title: string
  mode: string
  createdAt: string
  startsAt?: string
  recordingEnabled: boolean
  waitingRoomEnabled: boolean
  maxParticipants: number
  inviteUrl?: string
  reminderEmail?: string
  reminderSentAt?: string
}

export interface RecordingResponse {
  roomId: string
  recordingId: string
  status: string
  startedAt: string
  stoppedAt?: string
  message: string
}

export interface ScheduleMeetingRequest {
  title: string
  recipientEmail: string
  startsAt: string
}

export class MeetingApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message)
  }
}

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
const apiBaseUrl = configuredApiBaseUrl || (import.meta.env.DEV ? '' : '')

export const isMeetingApiConfigured = Boolean(configuredApiBaseUrl) || import.meta.env.DEV

const apiUrl = (path: string) => `${apiBaseUrl}${path}`
const meetingSessionStorageKey = 'collabos:meeting-session-id'

export const getMeetingClientSessionId = () => {
  if (typeof window === 'undefined') return Math.random().toString(36).slice(2, 14)

  const existing = window.sessionStorage.getItem(meetingSessionStorageKey)
  if (existing) return existing

  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 18)

  window.sessionStorage.setItem(meetingSessionStorageKey, sessionId)
  return sessionId
}

export const startRecording = async (roomId: string, authToken?: string): Promise<RecordingResponse> => {
  if (!isMeetingApiConfigured) throw new MeetingApiError('Meeting API is not configured. Set VITE_API_BASE_URL.')
  if (!authToken) throw new MeetingApiError('You must be signed in to start recording.')

  const response = await fetch(apiUrl('/api/meetings/recording/start'), {
    method: 'POST',
    headers: authHeaders(authToken),
    body: JSON.stringify({ roomId }),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'Recording start failed'), response.status)
  }

  return response.json() as Promise<RecordingResponse>
}

export const stopRecording = async (roomId: string, authToken?: string): Promise<RecordingResponse> => {
  if (!isMeetingApiConfigured) throw new MeetingApiError('Meeting API is not configured. Set VITE_API_BASE_URL.')
  if (!authToken) throw new MeetingApiError('You must be signed in to stop recording.')

  const response = await fetch(apiUrl('/api/meetings/recording/stop'), {
    method: 'POST',
    headers: authHeaders(authToken),
    body: JSON.stringify({ roomId }),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'Recording stop failed'), response.status)
  }

  return response.json() as Promise<RecordingResponse>
}

const authHeaders = (authToken?: string) => ({
  'Content-Type': 'application/json',
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})

const readErrorMessage = async (response: Response, fallback: string) => {
  const text = await response.text().catch(() => '')
  return text ? `${fallback} (${response.status}): ${text}` : `${fallback} (${response.status})`
}

export const createMeetingRoom = async (authToken?: string): Promise<CreateMeetingResponse | null> => {
  if (!isMeetingApiConfigured) throw new MeetingApiError('Meeting API is not configured. Set VITE_API_BASE_URL.')
  if (!authToken) throw new MeetingApiError('You must be signed in before creating a secured meeting.')

  const response = await fetch(apiUrl('/api/meetings/create'), {
    method: 'POST',
    headers: authHeaders(authToken),
    body: JSON.stringify({
      title: 'CollabOS Meeting',
      mode: 'team',
      recordingEnabled: true,
      waitingRoomEnabled: true,
      maxParticipants: 100,
    }),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'Meeting creation failed'), response.status)
  }

  return response.json() as Promise<CreateMeetingResponse>
}

export const scheduleMeetingRoom = async (
  request: ScheduleMeetingRequest,
  authToken?: string
): Promise<CreateMeetingResponse | null> => {
  if (!isMeetingApiConfigured) throw new MeetingApiError('Meeting API is not configured. Set VITE_API_BASE_URL.')
  if (!authToken) throw new MeetingApiError('You must be signed in before scheduling a meeting.')

  const response = await fetch(apiUrl('/api/meetings/schedule'), {
    method: 'POST',
    headers: authHeaders(authToken),
    body: JSON.stringify({
      title: request.title,
      recipientEmail: request.recipientEmail,
      startsAt: request.startsAt,
      mode: 'scheduled',
      recordingEnabled: true,
      waitingRoomEnabled: true,
      maxParticipants: 100,
    }),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'Meeting scheduling failed'), response.status)
  }

  return response.json() as Promise<CreateMeetingResponse>
}

export const requestLiveKitToken = async ({
  roomName,
  participantName,
  authToken,
}: LiveKitMeetingTokenRequest): Promise<string | null> => {
  if (!isMeetingApiConfigured || !authToken) return null

  const response = await fetch(apiUrl('/api/meetings/join'), {
    method: 'POST',
    headers: authHeaders(authToken),
    body: JSON.stringify({
      roomId: roomName,
      displayName: participantName,
      clientSessionId: getMeetingClientSessionId(),
      canPublish: true,
      canSubscribe: true,
    }),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'LiveKit token request failed'), response.status)
  }

  const data = (await response.json()) as LiveKitMeetingTokenResponse
  return data.token
}

export const joinMeetingRoom = async (request: LiveKitMeetingTokenRequest): Promise<LiveKitMeetingTokenResponse | null> => {
  if (!isMeetingApiConfigured || !request.authToken) return null

  const response = await fetch(apiUrl('/api/meetings/join'), {
    method: 'POST',
    headers: authHeaders(request.authToken),
    body: JSON.stringify({
      roomId: request.roomName,
      displayName: request.participantName,
      clientSessionId: request.clientSessionId,
      canPublish: true,
      canSubscribe: true,
    }),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'LiveKit token request failed'), response.status)
  }

  return response.json() as Promise<LiveKitMeetingTokenResponse>
}

export const listMeetingParticipants = async (
  roomId: string,
  authToken?: string
): Promise<LiveKitParticipantResponse[]> => {
  if (!isMeetingApiConfigured || !authToken) return []

  const response = await fetch(apiUrl(`/api/meetings/${encodeURIComponent(roomId)}/participants`), {
    headers: authHeaders(authToken),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'Meeting participant lookup failed'), response.status)
  }

  return response.json() as Promise<LiveKitParticipantResponse[]>
}
