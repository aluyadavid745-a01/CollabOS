import type React from 'react'
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core'

export interface MeetingParticipant {
  id: string
  name: string
  role: string
  quality: string
  speaking: boolean
  mic: boolean
  camera: boolean
  screenShare: boolean
  hand: boolean
  cameraTrack?: TrackReferenceOrPlaceholder
  screenShareTrack?: TrackReferenceOrPlaceholder
}

export interface MeetingChatMessage {
  id: string
  author: string
  text: string
  timestamp: number
  local?: boolean
}

export type RoomMode = 'speaker' | 'gallery' | 'spotlight' | 'pip'

export interface MeetingTool {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  danger?: boolean
  onClick?: () => void
  disabled?: boolean
}
