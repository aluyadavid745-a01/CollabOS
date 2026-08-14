import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import {
  Activity,
  Bell,
  Bot,
  CalendarClock,
  Camera,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Cloud,
  Copy,
  Download,
  FileText,
  Hand,
  Link2,
  Lock,
  Mic,
  MonitorUp,
  MoreHorizontal,
  Palette,
  PanelRightOpen,
  Play,
  Plus,
  Radio,
  Repeat,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Subtitles,
  Vote,
} from 'lucide-react'
import type { ReceivedDataMessage } from '@livekit/components-core'
import { LiveKitRoom, RoomAudioRenderer, useConnectionState, useDataChannel, useLocalParticipant, useParticipants, useRoomContext, useTracks } from '@livekit/components-react'
import { RoomEvent, Track } from 'livekit-client'
import '@livekit/components-styles'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import {
  createMeetingRoom,
  getMeetingClientSessionId,
  isMeetingApiConfigured,
  joinMeetingRoom,
  listMeetingParticipants,
  scheduleMeetingRoom,
  startRecording,
  stopRecording,
  type CreateMeetingResponse,
  type RecordingResponse,
} from '../services/livekitMeetings'
import {
  downloadMeetingRecordingFile,
  saveMeetingRecordingFile,
  startBrowserMeetingRecording,
  type BrowserMeetingRecording,
} from '../services/meetingRecordingFiles'
import {
  createMeetingSummary,
  readMeetingSummaries,
  saveMeetingSummary,
  type MeetingSummary,
} from '../services/meetingSummaries'
import {
  canTranscribeMeetingInBrowser,
  createMeetingTranscriber,
  type MeetingTranscriptEntry,
} from '../services/meetingTranscription'
import AIToolsPanel from '../components/Meetings/AIToolsPanel'
import ChatPanel from '../components/Meetings/ChatPanel'
import MeetingRoomShell from '../components/Meetings/MeetingRoom'
import MeetingControls from '../components/Meetings/MeetingControls'
import ParticipantsPanel from '../components/Meetings/ParticipantsPanel'
import RecordingIndicator from '../components/Meetings/RecordingIndicator'
import ScreenShare from '../components/Meetings/ScreenShare'
import VideoGrid from '../components/Meetings/VideoGrid'
import Whiteboard from '../components/Meetings/Whiteboard'
import type { MeetingChatMessage, MeetingParticipant, MeetingTool, RoomMode } from '../components/Meetings/types'

type SidebarTab = 'participants' | 'chat' | 'ai' | 'notes' | 'files' | 'polls' | 'whiteboard'
const sidebarTabs: Array<{ id: SidebarTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'chat', label: 'Chat', icon: Send },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'files', label: 'Files', icon: Cloud },
  { id: 'polls', label: 'Polls', icon: Vote },
  { id: 'whiteboard', label: 'Whiteboard', icon: Palette },
]

const templates = ['Executive Standup', 'Client Demo', 'Sprint Planning', 'Interview Loop']

const quickActions = [
  { label: 'New Meeting', icon: Plus },
  { label: 'Join Meeting', icon: MonitorUp },
  { label: 'Schedule Meeting', icon: CalendarClock },
  { label: 'Start Instant Meeting', icon: Radio },
]

const chatTopic = 'meeting-chat'
const meetingEventTopic = 'meeting-events'
const chatEncoder = new TextEncoder()
const chatDecoder = new TextDecoder()
const meetingEventEncoder = new TextEncoder()
const meetingEventDecoder = new TextDecoder()
const meetingActivityStorageKey = 'collabos:meeting-activity'

type StoredMeeting = {
  roomId: string
  title: string
  startsAt?: string
  createdAt: string
  type: 'instant' | 'scheduled' | 'joined'
  inviteUrl?: string
}

type StoredRecording = {
  recordingId: string
  roomId: string
  title: string
  startedAt: string
  stoppedAt?: string
  durationSeconds: number
  status: 'recording' | 'saved'
  downloadable: boolean
  fileSize?: number
}

type MeetingActivityStore = {
  meetingsStarted: number
  meetingsJoined: number
  meetingsScheduled: StoredMeeting[]
  recordings: StoredRecording[]
  actionItems: number
  summaries: MeetingSummary[]
  updatedAt?: string
}

const emptyMeetingActivity = (): MeetingActivityStore => ({
  meetingsStarted: 0,
  meetingsJoined: 0,
  meetingsScheduled: [],
  recordings: [],
  actionItems: 0,
  summaries: [],
})

const readMeetingActivity = (): MeetingActivityStore => {
  if (typeof window === 'undefined') return emptyMeetingActivity()

  try {
    const parsed = JSON.parse(window.localStorage.getItem(meetingActivityStorageKey) || 'null') as Partial<MeetingActivityStore> | null
    return {
      ...emptyMeetingActivity(),
      ...parsed,
      meetingsScheduled: Array.isArray(parsed?.meetingsScheduled) ? parsed.meetingsScheduled : [],
      recordings: Array.isArray(parsed?.recordings) ? parsed.recordings : [],
      summaries: readMeetingSummaries(),
    }
  } catch {
    return emptyMeetingActivity()
  }
}

const writeMeetingActivity = (next: MeetingActivityStore) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(meetingActivityStorageKey, JSON.stringify({ ...next, updatedAt: new Date().toISOString() }))
  window.dispatchEvent(new Event('collabos:meeting-activity-updated'))
}

const updateMeetingActivity = (updater: (current: MeetingActivityStore) => MeetingActivityStore) => {
  const next = updater(readMeetingActivity())
  writeMeetingActivity(next)
  return next
}

const rememberStartedMeeting = (meeting: CreateMeetingResponse) => {
  const startedMeeting: StoredMeeting = {
    roomId: meeting.roomId,
    title: meeting.title || 'CollabOS Meeting',
    createdAt: meeting.createdAt || new Date().toISOString(),
    type: 'instant',
    inviteUrl: meeting.inviteUrl,
  }

  updateMeetingActivity((current) => ({
    ...current,
    meetingsStarted: current.meetingsStarted + 1,
    meetingsScheduled: [
      startedMeeting,
      ...current.meetingsScheduled.filter((item) => item.roomId !== meeting.roomId),
    ].slice(0, 12),
  }))
}

const rememberScheduledMeeting = (meeting: CreateMeetingResponse) => {
  const scheduledMeeting: StoredMeeting = {
    roomId: meeting.roomId,
    title: meeting.title || 'Scheduled meeting',
    startsAt: meeting.startsAt,
    createdAt: meeting.createdAt || new Date().toISOString(),
    type: 'scheduled',
    inviteUrl: meeting.inviteUrl,
  }

  updateMeetingActivity((current) => ({
    ...current,
    meetingsScheduled: [
      scheduledMeeting,
      ...current.meetingsScheduled.filter((item) => item.roomId !== meeting.roomId),
    ].slice(0, 12),
  }))
}

const rememberJoinedMeeting = (roomId: string) => {
  const joinedMeeting: StoredMeeting = {
    roomId,
    title: 'Joined meeting',
    createdAt: new Date().toISOString(),
    type: 'joined',
  }

  updateMeetingActivity((current) => ({
    ...current,
    meetingsJoined: current.meetingsJoined + 1,
    meetingsScheduled: current.meetingsScheduled.some((meeting) => meeting.roomId === roomId)
      ? current.meetingsScheduled
      : [
          joinedMeeting,
          ...current.meetingsScheduled,
        ].slice(0, 12),
  }))
}

const rememberRecordingStarted = (recording: RecordingResponse, title = 'Meeting recording') => {
  const activeRecording: StoredRecording = {
    recordingId: recording.recordingId,
    roomId: recording.roomId,
    title,
    startedAt: recording.startedAt,
    durationSeconds: 0,
    status: 'recording',
    downloadable: false,
  }

  updateMeetingActivity((current) => ({
    ...current,
    recordings: [
      activeRecording,
      ...current.recordings.filter((item) => item.recordingId !== recording.recordingId),
    ].slice(0, 20),
  }))
}

const rememberRecordedMeeting = (recording: RecordingResponse, startedAt: string, title = 'Meeting recording', fileSize?: number) => {
  const stoppedAt = recording.stoppedAt || new Date().toISOString()
  const durationSeconds = Math.max(1, Math.round((new Date(stoppedAt).getTime() - new Date(startedAt).getTime()) / 1000))
  const savedRecording: StoredRecording = {
    recordingId: recording.recordingId,
    roomId: recording.roomId,
    title,
    startedAt,
    stoppedAt,
    durationSeconds,
    status: 'saved',
    downloadable: Boolean(fileSize),
    fileSize,
  }

  updateMeetingActivity((current) => ({
    ...current,
    recordings: [
      savedRecording,
      ...current.recordings.filter((item) => item.recordingId !== recording.recordingId),
    ].slice(0, 20),
  }))
}

const rememberMeetingSummary = (summary: MeetingSummary) => {
  saveMeetingSummary(summary)
  updateMeetingActivity((current) => ({
    ...current,
    summaries: readMeetingSummaries(),
    actionItems: Math.max(current.actionItems, summary.actionItems.length),
  }))
}

const formatRecordingLength = (seconds: number) => {
  if (seconds <= 0) return 'Recording now'
  const minutes = Math.max(1, Math.round(seconds / 60))
  return minutes === 1 ? '1 min' : `${minutes} min`
}

const formatMeetingTime = (isoDate?: string) => {
  if (!isoDate) return 'Now'
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(isoDate))
}

const createRecordingFilename = (recording: StoredRecording) => {
  const safeTitle = recording.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'meeting-recording'
  const date = new Date(recording.startedAt).toISOString().slice(0, 10)
  return `${safeTitle}-${date}.webm`
}

const isToday = (isoDate?: string) => {
  if (!isoDate) return false
  const date = new Date(isoDate)
  const today = new Date()
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
}

type MeetingActivityNotice = {
  id: string
  text: string
}

type MeetingEventMessage = {
  id: string
  type: 'hand'
  participantIdentity: string
  participantName: string
  raised: boolean
  timestamp: number
}

const parseChatMessage = (message: ReceivedDataMessage<typeof chatTopic>): MeetingChatMessage | null => {
  try {
    const parsed = JSON.parse(chatDecoder.decode(message.payload)) as Partial<MeetingChatMessage>
    if (!parsed.id || !parsed.text) return null

    return {
      id: parsed.id,
      author: parsed.author || message.from?.name || message.from?.identity || 'Guest',
      text: parsed.text,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
    }
  } catch {
    return null
  }
}

const parseMeetingEventMessage = (message: ReceivedDataMessage<typeof meetingEventTopic>): MeetingEventMessage | null => {
  try {
    const parsed = JSON.parse(meetingEventDecoder.decode(message.payload)) as Partial<MeetingEventMessage>
    if (!parsed.id || parsed.type !== 'hand' || !parsed.participantIdentity) return null

    return {
      id: parsed.id,
      type: 'hand',
      participantIdentity: parsed.participantIdentity,
      participantName: parsed.participantName || message.from?.name || message.from?.identity || 'Guest',
      raised: Boolean(parsed.raised),
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
    }
  } catch {
    return null
  }
}

const getAuthToken = async (user: unknown) => {
  const tokenUser = user as { getIdToken?: () => Promise<string> } | null
  return tokenUser?.getIdToken ? tokenUser.getIdToken() : undefined
}

const firstDisplayName = (...names: Array<string | null | undefined>) =>
  names.map((name) => name?.trim()).find(Boolean) || 'CollabOS User'

const getDefaultScheduleTime = () => {
  const next = new Date(Date.now() + 10 * 60 * 1000)
  const date = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
  const time = `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`

  return { date, time }
}

const createSelfParticipant = (
  participantName: string,
  state: { mic: boolean; camera: boolean; screenShare: boolean; hand: boolean }
): MeetingParticipant => ({
  id: 'local-user',
  name: participantName,
  role: 'Host',
  quality: 'Excellent',
  speaking: state.mic,
  mic: state.mic,
  camera: state.camera,
  screenShare: state.screenShare,
  hand: state.hand,
})

const MetricCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) => (
  <motion.article
    whileHover={{ y: -4 }}
    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      </div>
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.article>
)

const MeetingsDashboard = () => {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const heroRef = React.useRef<HTMLDivElement>(null)
  const [activity, setActivity] = React.useState(readMeetingActivity)
  const [createError, setCreateError] = React.useState('')
  const [creatingRoom, setCreatingRoom] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [scheduleError, setScheduleError] = React.useState('')
  const [scheduling, setScheduling] = React.useState(false)
  const [scheduledMeeting, setScheduledMeeting] = React.useState<CreateMeetingResponse | null>(null)
  const [dashboardNotice, setDashboardNotice] = React.useState('')
  const [scheduleForm, setScheduleForm] = React.useState(() => ({
    title: 'CollabOS Meeting',
    recipientEmail: firebaseUser?.email || '',
    ...getDefaultScheduleTime(),
  }))

  React.useEffect(() => {
    if (!heroRef.current) return
    const context = gsap.context(() => {
      gsap.from('.meeting-reveal', {
        y: 18,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.06,
      })
    }, heroRef)
    return () => context.revert()
  }, [])

  React.useEffect(() => {
    const refreshActivity = () => setActivity(readMeetingActivity())
    window.addEventListener('storage', refreshActivity)
    window.addEventListener('collabos:meeting-activity-updated', refreshActivity)
    window.addEventListener('collabos:meeting-summaries-updated', refreshActivity)
    return () => {
      window.removeEventListener('storage', refreshActivity)
      window.removeEventListener('collabos:meeting-activity-updated', refreshActivity)
      window.removeEventListener('collabos:meeting-summaries-updated', refreshActivity)
    }
  }, [])

  const todayMeetings = activity.meetingsScheduled.filter((meeting) => isToday(meeting.startsAt || meeting.createdAt))
  const upcomingMeetings = activity.meetingsScheduled.filter((meeting) => meeting.startsAt && new Date(meeting.startsAt) > new Date())
  const openActionItems = activity.summaries.reduce((total, summary) => total + summary.actionItems.filter((item) => item.status === 'open').length, 0)

  const startRoom = async () => {
    if (creatingRoom) return
    setCreateError('')
    setCreatingRoom(true)

    try {
      const authToken = await getAuthToken(firebaseUser)
      const meeting = await createMeetingRoom(authToken)
      if (!meeting) throw new Error('Meeting API did not return a secured room.')
      rememberStartedMeeting(meeting)
      navigate(`/meetings/${meeting.roomId}`)
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create a secured LiveKit meeting.')
    } finally {
      setCreatingRoom(false)
    }
  }

  const joinRoom = () => {
    const roomId = window.prompt('Enter the meeting room ID')
    const normalizedRoomId = roomId?.trim()

    if (normalizedRoomId) {
      rememberJoinedMeeting(normalizedRoomId)
      navigate(`/meetings/${encodeURIComponent(normalizedRoomId)}`)
    }
  }

  const submitSchedule = async (event: React.FormEvent) => {
    event.preventDefault()
    if (scheduling) return
    setScheduleError('')
    setScheduledMeeting(null)
    setScheduling(true)

    try {
      const authToken = await getAuthToken(firebaseUser)
      const selectedDate = new Date(`${scheduleForm.date}T${scheduleForm.time}`)

      if (Number.isNaN(selectedDate.getTime())) {
        setScheduleError('Choose a valid date and time for the meeting reminder.')
        return
      }

      if (selectedDate <= new Date()) {
        setScheduleError('Choose a future date and time for the meeting reminder.')
        return
      }

      const startsAt = selectedDate.toISOString()
      const meeting = await scheduleMeetingRoom(
        {
          title: scheduleForm.title,
          recipientEmail: scheduleForm.recipientEmail,
          startsAt,
        },
        authToken
      )
      if (!meeting) throw new Error('Meeting API did not return a scheduled room.')
      rememberScheduledMeeting(meeting)
      setScheduledMeeting(meeting)
    } catch (error) {
      setScheduleError(error instanceof Error ? error.message : 'Could not schedule this meeting.')
    } finally {
      setScheduling(false)
    }
  }

  const copyScheduledLink = async () => {
    if (!scheduledMeeting?.inviteUrl) return
    await navigator.clipboard.writeText(scheduledMeeting.inviteUrl)
    setDashboardNotice('Scheduled meeting link copied.')
  }

  const openCalendar = () => {
    setScheduleOpen(true)
    setDashboardNotice('Calendar reminder panel opened.')
  }

  const loadTemplate = (template: string) => {
    setScheduleForm((current) => ({
      ...current,
      title: template,
    }))
    setScheduleOpen(true)
    setDashboardNotice(`${template} template loaded.`)
  }

  const downloadRecording = async (recording: StoredRecording) => {
    try {
      await downloadMeetingRecordingFile(recording.recordingId, createRecordingFilename(recording))
      setDashboardNotice(`${recording.title} download started.`)
    } catch (error) {
      setDashboardNotice(error instanceof Error ? error.message : 'Recording file could not be downloaded.')
    }
  }

  return (
    <main ref={heroRef} className="min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-950 md:px-8 lg:px-12">
      <section className="meeting-reveal rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-700">
              <Sparkles className="h-4 w-4" />
              AI-powered LiveKit meetings
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Meetings that turn every conversation into decisions, tasks, and searchable knowledge.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Instant rooms, scheduled sessions, webinars, breakout rooms, AI notes, live captions, translation, recordings, and enterprise controls in one CollabOS workspace.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" onClick={startRoom} disabled={creatingRoom} className="gap-2">
              <Radio className="h-5 w-5" />
              {creatingRoom ? 'Creating...' : 'Start instant meeting'}
            </Button>
            <Button type="button" size="lg" variant="secondary" className="gap-2" onClick={() => setScheduleOpen(true)}>
              <CalendarClock className="h-5 w-5" />
              Schedule
            </Button>
          </div>
        </div>
        {createError && (
          <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {createError}
          </p>
        )}
        {dashboardNotice && (
          <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {dashboardNotice}
          </p>
        )}
      </section>

      <section className="meeting-reveal mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          const clickAction = action.label.includes('Instant')
            ? startRoom
            : action.label.includes('Schedule')
              ? () => setScheduleOpen(true)
              : action.label.includes('Join')
                ? joinRoom
                : startRoom
          return (
            <button
              key={action.label}
              type="button"
              onClick={clickAction}
              disabled={creatingRoom && (action.label.includes('Instant') || action.label.includes('New'))}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3 text-sm font-black text-slate-900">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </span>
                {action.label}
              </span>
              <ChevronRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-slate-950" />
            </button>
          )
        })}
      </section>

      {scheduleOpen && (
        <section className="meeting-reveal mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-600">Schedule meeting</p>
              <h2 className="mt-1 text-2xl font-black">Calendar reminder</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Pick a day and time, enter the email to remind, and CollabOS will send the meeting link when it starts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScheduleOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <form onSubmit={submitSchedule} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_150px_130px_auto]">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Title</span>
              <input
                value={scheduleForm.title}
                onChange={(event) => setScheduleForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-500"
                placeholder="Meeting title"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Reminder email</span>
              <input
                type="email"
                required
                value={scheduleForm.recipientEmail}
                onChange={(event) => setScheduleForm((current) => ({ ...current, recipientEmail: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-500"
                placeholder="friend@email.com"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Date</span>
              <input
                type="date"
                required
                value={scheduleForm.date}
                onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Time</span>
              <input
                type="time"
                required
                value={scheduleForm.time}
                onChange={(event) => setScheduleForm((current) => ({ ...current, time: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-500"
              />
            </label>
            <Button type="submit" className="mt-6 h-12 gap-2" disabled={scheduling}>
              <CalendarClock className="h-5 w-5" />
              {scheduling ? 'Scheduling...' : 'Schedule'}
            </Button>
          </form>

          {scheduleError && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {scheduleError}
            </p>
          )}

          {scheduledMeeting && (
            <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-black text-emerald-800">Scheduled. Reminder will be sent to {scheduledMeeting.reminderEmail}.</p>
              <p className="mt-2 break-all text-sm text-emerald-700">{scheduledMeeting.inviteUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={copyScheduledLink}>Copy link</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => navigate(`/meetings/${scheduledMeeting.roomId}`)}>
                  Open room
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="meeting-reveal mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Upcoming" value={String(upcomingMeetings.length)} icon={CalendarClock} />
        <MetricCard label="Today" value={String(todayMeetings.length)} icon={Activity} />
        <MetricCard label="Recordings" value={String(activity.recordings.length)} icon={Play} />
        <MetricCard label="Action items" value={String(Math.max(activity.actionItems, openActionItems))} icon={ClipboardCheck} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="meeting-reveal rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-600">Today’s meetings</p>
              <h2 className="mt-1 text-2xl font-black">Command center</h2>
            </div>
            <button
              type="button"
              onClick={openCalendar}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              View calendar
            </button>
          </div>
          {todayMeetings.length ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {todayMeetings.map((meeting) => (
              <motion.article
                key={meeting.roomId}
                layout
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className="h-2 bg-slate-950" />
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-400">{formatMeetingTime(meeting.startsAt || meeting.createdAt)}</p>
                  <h3 className="mt-2 text-lg font-black">{meeting.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {meeting.type === 'scheduled' ? 'Scheduled meeting' : meeting.type === 'joined' ? 'Joined room' : 'Instant meeting'}
                  </p>
                  <Button type="button" size="sm" className="mt-5 w-full gap-2" onClick={() => navigate(`/meetings/${meeting.roomId}`)}>
                    Join
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">
              No meetings yet. Start, join, or schedule a meeting and it will appear here.
            </div>
          )}
        </div>

        <div className="meeting-reveal rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Recording center</h2>
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          {activity.recordings.length ? (
            <div className="mt-4 space-y-3">
              {activity.recordings.map((recording) => (
              <article key={recording.recordingId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{recording.title}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-600">
                      {formatRecordingLength(recording.durationSeconds)}
                      {recording.fileSize ? ` · ${(recording.fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {recording.status === 'recording' ? 'Recording in progress' : 'Saved recording'} in {recording.roomId}
                      {recording.stoppedAt ? ` · ${new Date(recording.stoppedAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void downloadRecording(recording)}
                    disabled={!recording.downloadable}
                    className={`rounded-lg p-2 ${
                      recording.downloadable
                        ? 'text-slate-500 hover:bg-white hover:text-slate-950'
                        : 'cursor-not-allowed text-slate-300'
                    }`}
                    aria-label={`Download ${recording.title}`}
                    title={recording.downloadable ? `Download ${recording.title}` : 'Download is available after recording stops'}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">
              No recordings yet. Start recording in a meeting, then stop or leave the room to save it here.
            </div>
          )}
        </div>
      </section>

      <section className="meeting-reveal mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-600">AI meeting recaps</p>
            <h2 className="mt-1 text-2xl font-black">Summaries and assignments</h2>
          </div>
          <ClipboardCheck className="h-6 w-6 text-slate-500" />
        </div>
        {activity.summaries.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {activity.summaries.slice(0, 4).map((summary) => (
              <article key={summary.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{summary.title}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {summary.durationMinutes ? `${summary.durationMinutes} min | ` : ''}
                      {summary.participants.length} participant{summary.participants.length === 1 ? '' : 's'} | {new Date(summary.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-600">
                    {summary.actionItems.length} tasks
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{summary.overview}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Decisions</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {summary.decisions.slice(0, 3).map((decision) => (
                        <li key={decision} className="leading-5">- {decision}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Assignments</p>
                    {summary.actionItems.length ? (
                      <ul className="mt-2 space-y-2 text-sm text-slate-700">
                        {summary.actionItems.slice(0, 3).map((item) => (
                          <li key={item.id} className="leading-5">
                            - {item.text}
                            {item.owner ? ` - ${item.owner}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No explicit assignments captured.</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">
            End a meeting or generate a recap from the Notes tab to save summaries, decisions, assignments, and follow-ups here.
          </div>
        )}
      </section>

      <section className="meeting-reveal mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-xl font-black">Meeting templates</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => loadTemplate(template)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
              >
                <span className="font-bold">{template}</span>
                <Repeat className="h-4 w-4 text-slate-600" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-200" />
            <h2 className="text-xl font-black">Enterprise security</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-emerald-800">
            Waiting room, passwords, role permissions, meeting lock, device verification, and LiveKit-backed room access tokens.
          </p>
        </div>
      </section>
    </main>
  )
}

const SidebarPanel = ({
  activeTab,
  participants,
  chatMessages,
  chatDisabled,
  chatSending,
  recordingNotice,
  meetingNotes,
  transcriptEntries,
  interimTranscript,
  transcriptNotice,
  summaryNotice,
  onSendChat,
  onActivityNotice,
  onMeetingNotesChange,
  onCreateSummary,
  onMuteParticipant,
  onMakePresenter,
  onRemoveParticipant,
}: {
  activeTab: SidebarTab
  participants: MeetingParticipant[]
  chatMessages: MeetingChatMessage[]
  chatDisabled?: boolean
  chatSending?: boolean
  recordingNotice?: string
  meetingNotes: string
  transcriptEntries: MeetingTranscriptEntry[]
  interimTranscript?: string
  transcriptNotice?: string
  summaryNotice?: string
  onSendChat: (message: string) => Promise<void> | void
  onActivityNotice: (message: string) => void
  onMeetingNotesChange: (notes: string) => void
  onCreateSummary: () => void
  onMuteParticipant: (participant: MeetingParticipant) => void
  onMakePresenter: (participant: MeetingParticipant) => void
  onRemoveParticipant: (participant: MeetingParticipant) => void
}) => {
  if (activeTab === 'participants') {
    return (
      <ParticipantsPanel
        participants={participants}
        onMute={onMuteParticipant}
        onMakePresenter={onMakePresenter}
        onRemove={onRemoveParticipant}
      />
    )
  }

  if (activeTab === 'ai') {
    return (
      <AIToolsPanel
        onCreateSummary={onCreateSummary}
        summaryNotice={summaryNotice}
        onRunAction={(action) => {
          onActivityNotice(`${action} queued`)
          if (action.toLowerCase().includes('task')) {
            updateMeetingActivity((current) => ({ ...current, actionItems: current.actionItems + 1 }))
          }
        }}
      />
    )
  }

  if (activeTab === 'whiteboard') {
    return <Whiteboard />
  }

  if (activeTab === 'chat') {
    return <ChatPanel messages={chatMessages} disabled={chatDisabled} sending={chatSending} onSend={onSendChat} />
  }

  if (activeTab === 'files') {
    return <ScreenShare />
  }

  if (activeTab === 'notes') {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-600">Meeting notes</p>
              <p className="mt-1 text-sm text-slate-500">Add outcomes, tasks, names, and deadlines.</p>
            </div>
            <FileText className="h-5 w-5 text-slate-500" />
          </div>
          <textarea
            value={meetingNotes}
            onChange={(event) => onMeetingNotesChange(event.target.value)}
            className="mt-4 h-48 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-900 outline-none focus:border-slate-500"
            placeholder="Example: Decided to launch the beta next Friday. Assign onboarding email to Sarah by Tuesday."
          />
          <button
            type="button"
            onClick={onCreateSummary}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4" />
            Generate recap
          </button>
        </div>
        {summaryNotice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {summaryNotice}
          </div>
        )}
        {transcriptNotice && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
            {transcriptNotice}
          </div>
        )}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-600">Live transcript</p>
          <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
            {transcriptEntries.length || interimTranscript ? (
              <>
                {transcriptEntries.map((entry) => (
                  <div key={entry.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">{entry.speaker}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{entry.text}</p>
                  </div>
                ))}
                {interimTranscript && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm italic leading-6 text-slate-500">
                    {interimTranscript}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                Press Live Captions in the toolbar to capture spoken transcript for the recap.
              </p>
            )}
          </div>
        </div>
        {recordingNotice && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            {recordingNotice}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recordingNotice && (
        <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100">
          {recordingNotice}
        </div>
      )}
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm font-bold text-slate-500">
        Meeting notes, polls, and action items will appear after you create them in this room.
      </div>
    </div>
  )
}

interface LiveMeetingControlsState {
  micEnabled: boolean
  cameraEnabled: boolean
  screenShareEnabled: boolean
  recording?: boolean
  recordingStatus?: 'idle' | 'starting' | 'stopping'
  mediaError?: string
  toggleMic: () => Promise<void>
  toggleCamera: () => Promise<void>
  toggleScreenShare: () => Promise<void>
  toggleRecording?: () => Promise<void>
  setHandRaised?: (raised: boolean) => Promise<void> | void
  leave: () => Promise<void> | void
}

interface LiveMeetingChatState {
  messages: MeetingChatMessage[]
  disabled?: boolean
  sending?: boolean
  sendMessage: (message: string) => Promise<void> | void
}

const MeetingRoomContent = ({
  liveStatus,
  connectionError,
  recordingNotice,
  participantName,
  roomName,
  participantDebug,
  activityNotices,
  roomParticipants,
  liveControls,
  liveChat,
}: {
  liveStatus: string
  connectionError?: string
  recordingNotice?: string
  participantName: string
  roomName?: string
  participantDebug?: string
  activityNotices?: MeetingActivityNotice[]
  roomParticipants?: MeetingParticipant[]
  liveControls?: LiveMeetingControlsState
  liveChat?: LiveMeetingChatState
}) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState<SidebarTab>('ai')
  const [mode, setMode] = React.useState<RoomMode>('gallery')
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0)
  const [previewMic, setPreviewMic] = React.useState(true)
  const [previewCamera, setPreviewCamera] = React.useState(true)
  const [previewScreen, setPreviewScreen] = React.useState(false)
  const [raisedHand, setRaisedHand] = React.useState(false)
  const [captions, setCaptions] = React.useState(false)
  const [backgroundBlur, setBackgroundBlur] = React.useState(false)
  const [reaction, setReaction] = React.useState('')
  const [inviteCopied, setInviteCopied] = React.useState(false)
  const [previewChatMessages, setPreviewChatMessages] = React.useState<MeetingChatMessage[]>([])
  const [previewRecording, setPreviewRecording] = React.useState(false)
  const [previewRecordingStartedAt, setPreviewRecordingStartedAt] = React.useState('')
  const [previewRecordingId, setPreviewRecordingId] = React.useState('')
  const previewBrowserRecordingRef = React.useRef<BrowserMeetingRecording | null>(null)
  const [previewRecordingNotice, setPreviewRecordingNotice] = React.useState('')
  const [previewActivityNotices, setPreviewActivityNotices] = React.useState<MeetingActivityNotice[]>([])
  const [meetingNotes, setMeetingNotes] = React.useState('')
  const [summaryNotice, setSummaryNotice] = React.useState('')
  const [transcriptEntries, setTranscriptEntries] = React.useState<MeetingTranscriptEntry[]>([])
  const [interimTranscript, setInterimTranscript] = React.useState('')
  const [transcriptNotice, setTranscriptNotice] = React.useState('')
  const transcriptRef = React.useRef<ReturnType<typeof createMeetingTranscriber> | null>(null)
  const [mutedParticipantIds, setMutedParticipantIds] = React.useState<string[]>([])
  const [removedParticipantIds, setRemovedParticipantIds] = React.useState<string[]>([])
  const [presenterId, setPresenterId] = React.useState<string | null>(null)

  const pushPreviewNotice = React.useCallback((text: string) => {
    setPreviewActivityNotices((current) => [{ id: `preview-${Date.now()}`, text }, ...current].slice(0, 4))
  }, [])
  const activeParticipants =
    roomParticipants?.length
      ? roomParticipants.filter((participant) => !removedParticipantIds.includes(participant.id)).map((participant) =>
          participant.id === 'local-user' || participant.name === participantName
            ? {
                ...participant,
                role: presenterId === participant.id ? 'Presenter' : 'Host',
                mic: mutedParticipantIds.includes(participant.id) ? false : liveControls?.micEnabled ?? previewMic,
                camera: liveControls?.cameraEnabled ?? previewCamera,
                screenShare: liveControls?.screenShareEnabled ?? previewScreen,
                hand: raisedHand,
              }
            : {
                ...participant,
                role: presenterId === participant.id ? 'Presenter' : participant.role,
                mic: mutedParticipantIds.includes(participant.id) ? false : participant.mic,
              }
        )
      : [
          createSelfParticipant(participantName, {
            mic: liveControls?.micEnabled ?? previewMic,
            camera: liveControls?.cameraEnabled ?? previewCamera,
            screenShare: liveControls?.screenShareEnabled ?? previewScreen,
            hand: raisedHand,
          }),
        ]

  React.useEffect(() => {
    const intervalId = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  React.useEffect(() => {
    if (!reaction) return
    const timeoutId = window.setTimeout(() => setReaction(''), 1800)
    return () => window.clearTimeout(timeoutId)
  }, [reaction])

  React.useEffect(
    () => () => {
      transcriptRef.current?.stop()
      transcriptRef.current = null
    },
    []
  )

  const formatElapsed = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
    const remainder = (seconds % 60).toString().padStart(2, '0')
    return `${minutes}:${remainder}`
  }

  const toggleMic = async () => {
    if (liveControls) {
      await liveControls.toggleMic()
      return
    }

    const nextEnabled = !previewMic
    setPreviewMic(nextEnabled)
  }

  const toggleCamera = async () => {
    if (liveControls) {
      await liveControls.toggleCamera()
      return
    }

    const nextEnabled = !previewCamera
    setPreviewCamera(nextEnabled)
  }

  const toggleScreenShare = async () => {
    if (liveControls) {
      await liveControls.toggleScreenShare()
      return
    }

    const nextEnabled = !previewScreen
    setPreviewScreen(nextEnabled)
  }

  const toggleRecording = async () => {
    if (liveControls?.toggleRecording) {
      await liveControls.toggleRecording()
      return
    }

    const now = new Date().toISOString()

    if (!previewRecording) {
      const recordingId = `preview-recording-${Date.now()}`
      let browserRecording: BrowserMeetingRecording
      try {
        browserRecording = await startBrowserMeetingRecording(recordingId)
      } catch (error) {
        setPreviewRecordingNotice(error instanceof Error ? error.message : 'Browser recording could not start.')
        return
      }
      previewBrowserRecordingRef.current = browserRecording
      setPreviewRecordingId(recordingId)
      setPreviewRecordingStartedAt(now)
      rememberRecordingStarted(
        {
          roomId: roomName || 'preview-meeting',
          recordingId,
          status: 'recording',
          startedAt: now,
          message: 'Preview recording saved locally.',
        },
        'Preview meeting recording'
      )
      setPreviewRecording(true)
      setPreviewRecordingNotice('Preview recording started')
      return
    }

    if (previewRecordingStartedAt) {
      const recordingBlob = await previewBrowserRecordingRef.current?.stop()
      if (recordingBlob && previewRecordingId) {
        await saveMeetingRecordingFile(previewRecordingId, recordingBlob)
      }
      previewBrowserRecordingRef.current = null
      rememberRecordedMeeting(
        {
          roomId: roomName || 'preview-meeting',
          recordingId: previewRecordingId || `preview-recording-${Date.now()}`,
          status: 'stopped',
          startedAt: previewRecordingStartedAt,
          stoppedAt: now,
          message: 'Preview recording saved locally.',
        },
        previewRecordingStartedAt,
        'Preview meeting recording',
        recordingBlob?.size
      )
      setPreviewRecordingStartedAt('')
      setPreviewRecordingId('')
    }

    setPreviewRecording(false)
    setPreviewRecordingNotice('Preview recording stopped')
  }

  const toggleRaiseHand = async () => {
    const nextRaised = !raisedHand
    setRaisedHand(nextRaised)
    await liveControls?.setHandRaised?.(nextRaised)

    if (!liveControls?.setHandRaised) {
      pushPreviewNotice(`${participantName} ${nextRaised ? 'raised' : 'lowered'} their hand`)
    }
  }

  const pushActivityNotice = (message: string) => {
    pushPreviewNotice(message)
  }

  const toggleTranscript = () => {
    if (captions) {
      transcriptRef.current?.stop()
      transcriptRef.current = null
      setCaptions(false)
      setInterimTranscript('')
      setTranscriptNotice('Live transcript stopped.')
      pushActivityNotice('Live transcript stopped')
      return
    }

    if (!canTranscribeMeetingInBrowser()) {
      setTranscriptNotice('Live transcript is not available in this browser. Use Chrome or Edge for speech recognition.')
      setActiveTab('notes')
      return
    }

    try {
      const transcriber = createMeetingTranscriber({
        speaker: participantName,
        onFinalTranscript: (entry) => {
          setTranscriptEntries((current) => [...current, entry].slice(-120))
          setInterimTranscript('')
        },
        onInterimTranscript: setInterimTranscript,
        onError: (message) => {
          setTranscriptNotice(message)
          setCaptions(false)
          transcriptRef.current = null
        },
        onEnd: () => {
          setCaptions(false)
          setInterimTranscript('')
          transcriptRef.current = null
        },
      })

      transcriptRef.current = transcriber
      transcriber.start()
      setCaptions(true)
      setActiveTab('notes')
      setTranscriptNotice('Live transcript started. Keep this tab open while people speak.')
      pushActivityNotice('Live transcript started')
    } catch (error) {
      setTranscriptNotice(error instanceof Error ? error.message : 'Live transcript could not start.')
      setCaptions(false)
      transcriptRef.current = null
    }
  }

  const muteParticipant = (participant: MeetingParticipant) => {
    setMutedParticipantIds((current) => current.includes(participant.id) ? current : [...current, participant.id])
    pushActivityNotice(`${participant.name} muted`)
  }

  const makePresenter = (participant: MeetingParticipant) => {
    setPresenterId(participant.id)
    setMode('speaker')
    pushActivityNotice(`${participant.name} is now presenter`)
  }

  const removeParticipant = (participant: MeetingParticipant) => {
    setRemovedParticipantIds((current) => current.includes(participant.id) ? current : [...current, participant.id])
    pushActivityNotice(`${participant.name} removed from local view`)
  }

  const leaveMeeting = async () => {
    createAndSaveSummary()

    if (!liveControls && previewRecording && previewRecordingStartedAt) {
      const stoppedAt = new Date().toISOString()
      const recordingBlob = await previewBrowserRecordingRef.current?.stop()
      if (recordingBlob && previewRecordingId) {
        await saveMeetingRecordingFile(previewRecordingId, recordingBlob)
      }
      previewBrowserRecordingRef.current = null
      rememberRecordedMeeting(
        {
          roomId: roomName || 'preview-meeting',
          recordingId: previewRecordingId || `preview-recording-${Date.now()}`,
          status: 'stopped',
          startedAt: previewRecordingStartedAt,
          stoppedAt,
          message: 'Preview recording saved locally.',
        },
        previewRecordingStartedAt,
        'Preview meeting recording',
        recordingBlob?.size
      )
    }

    await liveControls?.leave()
    navigate('/meetings')
  }

  const copyInviteLink = async () => {
    const inviteUrl = window.location.href

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setInviteCopied(true)
      window.setTimeout(() => setInviteCopied(false), 1800)
    } catch {
      window.prompt('Copy this meeting link', inviteUrl)
    }
  }

  const sendPreviewChatMessage = (message: string) => {
    setPreviewChatMessages((current) => [
      ...current,
      {
        id: `preview-${Date.now()}`,
        author: participantName,
        text: message,
        timestamp: Date.now(),
        local: true,
      },
    ])
  }

  const chatState: LiveMeetingChatState = liveChat ?? {
    messages: previewChatMessages,
    disabled: liveStatus !== 'Preview mode',
    sendMessage: sendPreviewChatMessage,
  }

  function createAndSaveSummary() {
    const summary = createMeetingSummary({
      roomId: roomName || 'preview-meeting',
      title: 'Product Review - Q3 Workspace',
      participants: activeParticipants.map((participant) => participant.name),
      chatMessages: chatState.messages,
      transcriptEntries,
      notes: meetingNotes,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
    })

    rememberMeetingSummary(summary)
    setSummaryNotice(
      summary.actionItems.length
        ? `Recap saved with ${summary.actionItems.length} assignment${summary.actionItems.length === 1 ? '' : 's'}.`
        : 'Recap saved. No explicit assignments were detected.'
    )
    pushPreviewNotice('AI meeting recap saved')
  }

  const recording = liveControls?.recording ?? previewRecording
  const recordingStatus = liveControls?.recordingStatus ?? 'idle'
  const activeRecordingNotice = recordingNotice ?? previewRecordingNotice
  const visibleActivityNotices = [...previewActivityNotices, ...(activityNotices ?? [])].slice(0, 4)

  const toolbarItems: MeetingTool[] = [
    { label: 'Microphone', icon: Mic, active: liveControls?.micEnabled ?? previewMic, onClick: () => void toggleMic() },
    { label: 'Camera', icon: Camera, active: liveControls?.cameraEnabled ?? previewCamera, onClick: () => void toggleCamera() },
    { label: 'Screen Share', icon: MonitorUp, active: liveControls?.screenShareEnabled ?? previewScreen, onClick: () => void toggleScreenShare() },
    { label: 'Whiteboard', icon: Palette, active: activeTab === 'whiteboard', onClick: () => setActiveTab('whiteboard') },
    { label: 'AI Assistant', icon: Bot, active: activeTab === 'ai', onClick: () => setActiveTab('ai') },
    { label: 'Chat', icon: Send, active: activeTab === 'chat', onClick: () => setActiveTab('chat') },
    { label: 'Participants', icon: Users, active: activeTab === 'participants', onClick: () => setActiveTab('participants') },
    { label: 'Raise Hand', icon: Hand, active: raisedHand, onClick: () => void toggleRaiseHand() },
    { label: 'Reactions', icon: Sparkles, active: Boolean(reaction), onClick: () => setReaction('👏') },
    { label: captions ? 'Stop Live Transcript' : 'Live Captions', icon: Subtitles, active: captions, onClick: toggleTranscript },
    { 
      label: recording ? 'Stop Recording' : 'Start Recording', 
      icon: CircleDot, 
      active: recording, 
      onClick: toggleRecording,
      disabled: recordingStatus !== 'idle'
    },
    { label: 'Backgrounds', icon: PanelRightOpen, active: backgroundBlur, onClick: () => setBackgroundBlur((current) => !current) },
    { label: 'More', icon: MoreHorizontal, onClick: () => setActiveTab('files') },
  ]

  return (
    <MeetingRoomShell>
      <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-600">CollabOS Meeting Room</p>
          <h1 className="mt-1 text-xl font-black md:text-2xl">Product Review · Q3 Workspace</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            Meeting timer {formatElapsed(elapsedSeconds)} · {activeParticipants.length} participant{activeParticipants.length === 1 ? '' : 's'}
          </p>
          {roomName && (
            <p className="mt-1 max-w-full break-all text-[11px] font-bold text-slate-500">
              Room ID: {roomName}
            </p>
          )}
          {participantDebug && (
            <p className="mt-1 max-w-full break-all text-[11px] font-bold text-slate-600">
              {participantDebug}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void copyInviteLink()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 transition-colors hover:bg-slate-100"
          >
            {inviteCopied ? <Copy className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {inviteCopied ? 'Link copied' : 'Copy invite link'}
          </button>
          {(['speaker', 'gallery', 'spotlight', 'pip'] as RoomMode[]).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`rounded-xl px-3 py-2 text-xs font-black capitalize transition-colors ${
                mode === item ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item}
            </button>
          ))}
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100">
            <Lock className="h-4 w-4" />
            {liveStatus}
          </span>
          {recording && <RecordingIndicator />}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <section className="relative flex min-h-[560px] flex-1 flex-col p-4 md:p-6">
          <VideoGrid participants={activeParticipants} mode={mode} />

          {liveControls?.mediaError && (
            <div className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100">
              {liveControls.mediaError}
            </div>
          )}

          {connectionError && (
            <div className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100">
              {connectionError}
            </div>
          )}

          {reaction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-6 py-4 text-5xl shadow-2xl"
            >
              {reaction}
            </motion.div>
          )}

          <div className="pointer-events-none absolute left-6 top-6 max-w-[min(360px,calc(100%-3rem))] space-y-2">
            {visibleActivityNotices.map((notice) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xl"
              >
                <Bell className="mr-2 inline h-4 w-4 text-slate-600" />
                {notice.text}
              </motion.div>
            ))}
          </div>

          <MeetingControls tools={toolbarItems} onLeave={leaveMeeting} />
        </section>

        <aside className="border-t border-slate-200 bg-white p-4 xl:w-[380px] xl:border-l xl:border-t-0">
          <div className="grid grid-cols-4 gap-2">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  title={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className={`grid h-11 place-items-center rounded-xl border text-sm font-bold transition-colors ${
                    activeTab === tab.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="mt-4"
            >
              <SidebarPanel
                activeTab={activeTab}
                participants={activeParticipants}
                chatMessages={chatState.messages}
                chatDisabled={chatState.disabled}
                chatSending={chatState.sending}
                recordingNotice={activeRecordingNotice}
                meetingNotes={meetingNotes}
                transcriptEntries={transcriptEntries}
                interimTranscript={interimTranscript}
                transcriptNotice={transcriptNotice}
                summaryNotice={summaryNotice}
                onSendChat={chatState.sendMessage}
                onActivityNotice={pushActivityNotice}
                onMeetingNotesChange={setMeetingNotes}
                onCreateSummary={createAndSaveSummary}
                onMuteParticipant={muteParticipant}
                onMakePresenter={makePresenter}
                onRemoveParticipant={removeParticipant}
              />
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </MeetingRoomShell>
  )
}

const ConnectedMeetingRoomContent = ({
  liveStatus,
  firebaseUser,
  participantName,
}: {
  liveStatus: string
  firebaseUser: unknown
  participantName: string
}) => {
  const room = useRoomContext()
  const connectionState = useConnectionState(room)
  const local = useLocalParticipant()
  const liveKitParticipants = useParticipants({ room })
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  })
  const screenShareTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: true }], {
    onlySubscribed: false,
  })
  const [participantRevision, setParticipantRevision] = React.useState(0)
  const [cloudParticipants, setCloudParticipants] = React.useState<MeetingParticipant[]>([])
  const [cloudParticipantStatus, setCloudParticipantStatus] = React.useState('not checked')
  const [mediaError, setMediaError] = React.useState('')
  const [chatMessages, setChatMessages] = React.useState<MeetingChatMessage[]>([])
  const [handRaisedByIdentity, setHandRaisedByIdentity] = React.useState<Record<string, boolean>>({})
  const [activityNotices, setActivityNotices] = React.useState<MeetingActivityNotice[]>([])

  const addActivityNotice = React.useCallback((text: string, id = `notice-${Date.now()}-${Math.random().toString(36).slice(2)}`) => {
    setActivityNotices((current) => [{ id, text }, ...current.filter((item) => item.id !== id)].slice(0, 4))
  }, [])

  const addChatMessage = React.useCallback((message: MeetingChatMessage) => {
    setChatMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]))
  }, [])

  const handleDataMessage = React.useCallback(
    (message: ReceivedDataMessage<typeof chatTopic>) => {
      const chatMessage = parseChatMessage(message)
      if (chatMessage) addChatMessage(chatMessage)
    },
    [addChatMessage]
  )

  const { send: sendDataMessage, isSending: chatSending } = useDataChannel(chatTopic, handleDataMessage)

  const handleMeetingEventMessage = React.useCallback(
    (message: ReceivedDataMessage<typeof meetingEventTopic>) => {
      const meetingEvent = parseMeetingEventMessage(message)
      if (!meetingEvent) return

      setHandRaisedByIdentity((current) => ({
        ...current,
        [meetingEvent.participantIdentity]: meetingEvent.raised,
      }))
      addActivityNotice(
        `${meetingEvent.participantName} ${meetingEvent.raised ? 'raised' : 'lowered'} their hand`,
        meetingEvent.id
      )
    },
    [addActivityNotice]
  )

  const { send: sendMeetingEventMessage } = useDataChannel(meetingEventTopic, handleMeetingEventMessage)

  const cameraTracksByIdentity = React.useMemo(
    () => new Map(cameraTracks.map((trackReference) => [trackReference.participant.identity, trackReference])),
    [cameraTracks]
  )
  const screenShareTracksByIdentity = React.useMemo(
    () =>
      new Map(
        screenShareTracks
          .filter((trackReference) => trackReference.publication)
          .map((trackReference) => [trackReference.participant.identity, trackReference])
      ),
    [screenShareTracks]
  )

  React.useEffect(() => {
    const refreshParticipants = () => setParticipantRevision((current) => current + 1)
    const handleParticipantConnected = (participant: { identity: string; name?: string }) => {
      refreshParticipants()
      addActivityNotice(`${firstDisplayName(participant.name, participant.identity, 'Guest')} joined`)
    }
    const handleParticipantDisconnected = (participant: { identity: string; name?: string }) => {
      refreshParticipants()
      setHandRaisedByIdentity((current) => {
        const next = { ...current }
        delete next[participant.identity]
        return next
      })
      addActivityNotice(`${firstDisplayName(participant.name, participant.identity, 'Guest')} left`)
    }

    room
      .on(RoomEvent.ParticipantConnected, handleParticipantConnected)
      .on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
      .on(RoomEvent.ConnectionStateChanged, refreshParticipants)
      .on(RoomEvent.LocalTrackPublished, refreshParticipants)
      .on(RoomEvent.LocalTrackUnpublished, refreshParticipants)
      .on(RoomEvent.TrackPublished, refreshParticipants)
      .on(RoomEvent.TrackUnpublished, refreshParticipants)

    refreshParticipants()

    return () => {
      room
        .off(RoomEvent.ParticipantConnected, handleParticipantConnected)
        .off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
        .off(RoomEvent.ConnectionStateChanged, refreshParticipants)
        .off(RoomEvent.LocalTrackPublished, refreshParticipants)
        .off(RoomEvent.LocalTrackUnpublished, refreshParticipants)
        .off(RoomEvent.TrackPublished, refreshParticipants)
        .off(RoomEvent.TrackUnpublished, refreshParticipants)
    }
  }, [addActivityNotice, room])

  React.useEffect(() => {
    let cancelled = false

    const refreshCloudParticipants = async () => {
      try {
        const authToken = await getAuthToken(firebaseUser)
        const participants = await listMeetingParticipants(room.name, authToken)
        if (cancelled) return
        setCloudParticipantStatus(`ok (${participants.length})`)

        setCloudParticipants(
          participants.map((participant) => ({
            id: participant.identity,
            name: firstDisplayName(participant.name, participant.identity, 'Guest'),
            role: participant.identity === room.localParticipant.identity ? 'Host' : 'Guest',
            quality: 'LiveKit Cloud',
            speaking: false,
            mic: true,
            camera: false,
            screenShare: false,
            hand: false,
          }))
        )
      } catch (error) {
        if (!cancelled) {
          setCloudParticipants([])
          setCloudParticipantStatus(error instanceof Error ? error.message : 'lookup failed')
        }
      }
    }

    void refreshCloudParticipants()
    const intervalId = window.setInterval(() => void refreshCloudParticipants(), 3000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [firebaseUser, room.localParticipant.identity, room.name])

  const sendChatMessage = React.useCallback(
    async (text: string) => {
      const authorName = firstDisplayName(room.localParticipant.name, participantName, room.localParticipant.identity, 'You')
      const message: MeetingChatMessage = {
        id: `${room.localParticipant.identity}-${Date.now()}`,
        author: authorName,
        text,
        timestamp: Date.now(),
        local: true,
      }

      addChatMessage(message)
      await sendDataMessage(chatEncoder.encode(JSON.stringify(message)), { reliable: true })
    },
    [addChatMessage, participantName, room.localParticipant.identity, room.localParticipant.name, sendDataMessage]
  )

  const [isRecording, setIsRecording] = React.useState(false)
  const [recordingStartedAt, setRecordingStartedAt] = React.useState('')
  const [recordingStatus, setRecordingStatus] = React.useState<'idle' | 'starting' | 'stopping'>('idle')
  const [recordingNotice, setRecordingNotice] = React.useState('')
  const browserRecordingRef = React.useRef<BrowserMeetingRecording | null>(null)

  const toggleRecording = async () => {
    if (recordingStatus !== 'idle') return
    
    try {
      setRecordingStatus(isRecording ? 'stopping' : 'starting')
      const authToken = await getAuthToken(firebaseUser)
      
      if (isRecording) {
        const stoppedRecording = await stopRecording(room.name, authToken)
        const recordingBlob = await browserRecordingRef.current?.stop()
        if (recordingBlob) {
          await saveMeetingRecordingFile(stoppedRecording.recordingId, recordingBlob)
        }
        browserRecordingRef.current = null
        rememberRecordedMeeting(stoppedRecording, recordingStartedAt || stoppedRecording.startedAt, 'Meeting recording', recordingBlob?.size)
        setRecordingStartedAt('')
      } else {
        const startedRecording = await startRecording(room.name, authToken)
        let browserRecording: BrowserMeetingRecording
        try {
          browserRecording = await startBrowserMeetingRecording(startedRecording.recordingId)
        } catch (error) {
          await stopRecording(room.name, authToken).catch(() => undefined)
          throw error
        }
        browserRecordingRef.current = browserRecording
        setRecordingStartedAt(startedRecording.startedAt)
        rememberRecordingStarted(startedRecording, 'Meeting recording')
      }
      
      setIsRecording(!isRecording)
      setRecordingNotice(isRecording ? 'Recording stopped' : 'Recording started')
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Recording operation failed')
    } finally {
      setRecordingStatus('idle')
    }
  }

  const liveControls: LiveMeetingControlsState = {
    micEnabled: local.isMicrophoneEnabled,
    cameraEnabled: local.isCameraEnabled,
    screenShareEnabled: local.isScreenShareEnabled,
    recording: isRecording,
    recordingStatus,
    mediaError,
    toggleMic: async () => {
      try {
        setMediaError('')
        await room.localParticipant.setMicrophoneEnabled(!local.isMicrophoneEnabled)
      } catch (error) {
        setMediaError(error instanceof Error ? error.message : 'Microphone could not be enabled.')
      }
    },
    toggleCamera: async () => {
      try {
        setMediaError('')
        await room.localParticipant.setCameraEnabled(!local.isCameraEnabled)
      } catch (error) {
        setMediaError(error instanceof Error ? error.message : 'Camera could not be enabled. Check browser camera permission.')
      }
    },
    toggleScreenShare: async () => {
      try {
        setMediaError('')
        const nextEnabled = !local.isScreenShareEnabled
        await room.localParticipant.setScreenShareEnabled(nextEnabled)
        addActivityNotice(
          `${firstDisplayName(room.localParticipant.name, participantName, room.localParticipant.identity, 'You')} ${
            nextEnabled ? 'started' : 'stopped'
          } sharing their screen`
        )
      } catch (error) {
        setMediaError(error instanceof Error ? error.message : 'Screen sharing could not be started.')
      }
    },
    toggleRecording,
    setHandRaised: async (raised: boolean) => {
      const participantIdentity = room.localParticipant.identity
      const participantDisplayName = firstDisplayName(room.localParticipant.name, participantName, participantIdentity, 'You')
      const eventMessage: MeetingEventMessage = {
        id: `${participantIdentity}-hand-${Date.now()}`,
        type: 'hand',
        participantIdentity,
        participantName: participantDisplayName,
        raised,
        timestamp: Date.now(),
      }

      setHandRaisedByIdentity((current) => ({
        ...current,
        [participantIdentity]: raised,
      }))
      addActivityNotice(`${participantDisplayName} ${raised ? 'raised' : 'lowered'} their hand`, eventMessage.id)
      await sendMeetingEventMessage(meetingEventEncoder.encode(JSON.stringify(eventMessage)), { reliable: true })
    },
    leave: async () => {
      if (isRecording) {
        try {
          setRecordingStatus('stopping')
          const authToken = await getAuthToken(firebaseUser)
          const stoppedRecording = await stopRecording(room.name, authToken)
          const recordingBlob = await browserRecordingRef.current?.stop()
          if (recordingBlob) {
            await saveMeetingRecordingFile(stoppedRecording.recordingId, recordingBlob)
          }
          browserRecordingRef.current = null
          rememberRecordedMeeting(stoppedRecording, recordingStartedAt || stoppedRecording.startedAt, 'Meeting recording', recordingBlob?.size)
        } catch (error) {
          setMediaError(error instanceof Error ? error.message : 'Recording could not be saved before leaving.')
        } finally {
          setIsRecording(false)
          setRecordingStartedAt('')
          setRecordingStatus('idle')
        }
      }

      void room.disconnect()
    },
  }

  const liveParticipants = React.useMemo(
    () => {
      void participantRevision
      return liveKitParticipants.length
        ? liveKitParticipants
        : [room.localParticipant, ...Array.from(room.remoteParticipants.values())]
    },
    [liveKitParticipants, participantRevision, room]
  )

  const roomParticipantsFromContext: MeetingParticipant[] = liveParticipants.map((participant) => {
    const isLocalParticipant = participant.identity === room.localParticipant.identity

    return {
      id: participant.identity,
      name: isLocalParticipant
        ? firstDisplayName(participant.name, participantName, participant.identity)
        : firstDisplayName(participant.name, participant.identity, 'Guest'),
      role: isLocalParticipant ? 'Host' : 'Guest',
      quality: 'Connected',
      speaking: participant.isSpeaking,
      mic: isLocalParticipant ? local.isMicrophoneEnabled : true,
      camera: isLocalParticipant ? local.isCameraEnabled : Boolean(cameraTracksByIdentity.get(participant.identity)?.publication),
      screenShare: Boolean(screenShareTracksByIdentity.get(participant.identity)?.publication),
      hand: Boolean(handRaisedByIdentity[participant.identity]),
      cameraTrack: cameraTracksByIdentity.get(participant.identity),
      screenShareTrack: screenShareTracksByIdentity.get(participant.identity),
    }
  })

  const roomParticipants = React.useMemo(() => {
    const merged = new Map(roomParticipantsFromContext.map((participant) => [participant.id, participant]))

    for (const participant of cloudParticipants) {
      if (!merged.has(participant.id)) merged.set(participant.id, participant)
    }

    return Array.from(merged.values())
  }, [cloudParticipants, roomParticipantsFromContext])

  const participantDebug = `LiveKit ${connectionState} · live: ${liveParticipants.length} · cloud: ${cloudParticipants.length} (${cloudParticipantStatus}) · local: ${room.localParticipant.identity || 'none'} · remote: ${
    liveParticipants
      .filter((participant) => participant.identity !== room.localParticipant.identity)
      .map((participant) => participant.identity)
      .join(', ') || 'none'
  }`

  return (
    <>
      <RoomAudioRenderer />
      <MeetingRoomContent
        liveStatus={liveStatus}
        recordingNotice={recordingNotice}
        participantName={firstDisplayName(room.localParticipant.name, participantName, room.localParticipant.identity)}
        roomName={room.name}
        participantDebug={participantDebug}
        activityNotices={activityNotices}
        roomParticipants={roomParticipants}
        liveControls={liveControls}
        liveChat={{
          messages: chatMessages,
          sending: chatSending,
          sendMessage: sendChatMessage,
        }}
      />
    </>
  )
}

const MeetingRoom = () => {
  const { roomId } = useParams()
  const { profile, firebaseUser } = useAuth()
  const [token, setToken] = React.useState<string | null>(null)
  const [serverUrl, setServerUrl] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState(isMeetingApiConfigured ? 'Connecting securely' : 'Preview mode')
  const [connectionError, setConnectionError] = React.useState('')

  const participantName = firstDisplayName(
    profile?.uid === firebaseUser?.uid ? profile?.name : '',
    firebaseUser?.displayName,
    firebaseUser?.email?.split('@')[0]
  )
  const roomName = roomId || 'collabos-meeting'

  React.useEffect(() => {
    setToken(null)
    setServerUrl(null)
    setConnectionError('')
    setStatus(isMeetingApiConfigured ? 'Connecting securely' : 'Preview mode')
  }, [roomName])

  React.useEffect(() => {
    let cancelled = false

    if (token && serverUrl) {
      return () => {
        cancelled = true
      }
    }

    if (!isMeetingApiConfigured) {
      setStatus('Preview mode')
      setConnectionError('Meeting API is not configured. Set VITE_API_BASE_URL to connect this room to LiveKit.')
      return () => {
        cancelled = true
      }
    }

    if (!firebaseUser) {
      setStatus('Preview mode')
      setConnectionError('Sign in to join this secured LiveKit meeting. Preview controls are available locally.')
      return () => {
        cancelled = true
      }
    }

    setStatus('Connecting securely')

    const connectionTimeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setStatus('Connection delayed')
        setConnectionError('CollabOS is still waiting for a LiveKit token from the meeting API.')
      }
    }, 15000)

    getAuthToken(firebaseUser)
      .then((authToken) =>
        joinMeetingRoom({
          roomName,
          participantName,
          clientSessionId: getMeetingClientSessionId(),
          authToken,
          metadata: {
            product: 'CollabOS Meetings',
          },
        })
      )
      .then((join) => {
        if (cancelled) return
        setToken(join?.token || null)
        setServerUrl(join?.serverUrl || null)
        setStatus(join?.token ? 'Joining LiveKit room' : 'Preview mode')
        window.clearTimeout(connectionTimeoutId)
        if (!join?.token) {
          setConnectionError('The meeting API did not return a LiveKit token, so this room is running in preview mode.')
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus('Preview mode')
          setConnectionError(error instanceof Error ? error.message : 'Could not connect to the secured meeting room.')
        }
      })

    return () => {
      cancelled = true
      window.clearTimeout(connectionTimeoutId)
    }
  }, [firebaseUser, participantName, roomName, serverUrl, token])

  React.useEffect(() => {
    if (!token || !serverUrl || status !== 'Joining LiveKit room') return

    const liveKitTimeoutId = window.setTimeout(() => {
      setStatus('Connection delayed')
      setConnectionError('LiveKit has not confirmed the shared room connection yet. Check the LiveKit URL/key and browser network permissions.')
    }, 15000)

    return () => window.clearTimeout(liveKitTimeoutId)
  }, [serverUrl, status, token])

  if (token && serverUrl) {
    return (
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        audio={false}
        video={false}
        onConnected={() => {
          setStatus('LiveKit connected')
          setConnectionError('')
        }}
        onDisconnected={() => {
          setStatus('Disconnected')
          setConnectionError('This browser is no longer connected to the shared LiveKit room.')
        }}
        onError={(error) => {
          setStatus('Preview mode')
          setConnectionError(error.message || 'LiveKit could not connect this browser to the shared room.')
        }}
      >
        <ConnectedMeetingRoomContent liveStatus={status} firebaseUser={firebaseUser} participantName={participantName} />
      </LiveKitRoom>
    )
  }

  return <MeetingRoomContent liveStatus={status} connectionError={connectionError} participantName={participantName} roomName={roomName} participantDebug="Live participants: not connected" />
}

const MeetingsWorkspace = () => {
  const { roomId } = useParams()
  return roomId ? <MeetingRoom /> : <MeetingsDashboard />
}

export default MeetingsWorkspace
