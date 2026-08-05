export interface LiveKitMeetingTokenRequest {
  roomName: string
  participantName: string
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

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const isMeetingApiConfigured = Boolean(apiBaseUrl)

const apiUrl = (path: string) => `${apiBaseUrl}${path}`

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
      canPublish: true,
      canSubscribe: true,
    }),
  })

  if (!response.ok) {
    throw new MeetingApiError(await readErrorMessage(response, 'LiveKit token request failed'), response.status)
  }

  return response.json() as Promise<LiveKitMeetingTokenResponse>
}
