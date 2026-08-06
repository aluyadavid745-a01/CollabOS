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
import { LiveKitRoom, RoomAudioRenderer, useDataChannel, useLocalParticipant, useParticipants, useRoomContext, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import '@livekit/components-styles'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import {
  createMeetingRoom,
  isMeetingApiConfigured,
  joinMeetingRoom,
  scheduleMeetingRoom,
  type CreateMeetingResponse,
} from '../services/livekitMeetings'
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

const meetings = [
  { title: 'Product Review', time: '09:30', meta: '12 people · Team meeting', tone: 'from-indigo-500 to-cyan-500' },
  { title: 'Investor Webinar', time: '13:00', meta: 'Webinar mode · Recording on', tone: 'from-fuchsia-500 to-rose-500' },
  { title: 'Design Huddle', time: '15:45', meta: 'Recurring · Whiteboard ready', tone: 'from-emerald-500 to-teal-500' },
]

const recordings = [
  { title: 'Growth Weekly', length: '48 min', detail: 'Transcript, chapters, 7 action items' },
  { title: 'Engineering Sync', length: '32 min', detail: 'Searchable recording, shared with Core Team' },
]

const templates = ['Executive Standup', 'Client Demo', 'Sprint Planning', 'Interview Loop']

const quickActions = [
  { label: 'New Meeting', icon: Plus },
  { label: 'Join Meeting', icon: MonitorUp },
  { label: 'Schedule Meeting', icon: CalendarClock },
  { label: 'Start Instant Meeting', icon: Radio },
]

const chatTopic = 'meeting-chat'
const chatEncoder = new TextEncoder()
const chatDecoder = new TextDecoder()

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

const getAuthToken = async (user: unknown) => {
  const tokenUser = user as { getIdToken?: () => Promise<string> } | null
  return tokenUser?.getIdToken ? tokenUser.getIdToken() : undefined
}

const getDefaultScheduleTime = () => {
  const next = new Date(Date.now() + 10 * 60 * 1000)
  const date = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
  const time = `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`

  return { date, time }
}

const createSelfParticipant = (
  participantName: string,
  state: { mic: boolean; camera: boolean; hand: boolean }
): MeetingParticipant => ({
  id: 'local-user',
  name: participantName,
  role: 'Host',
  quality: 'Excellent',
  speaking: state.mic,
  mic: state.mic,
  camera: state.camera,
  hand: state.hand,
})

const MetricCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) => (
  <motion.article
    whileHover={{ y: -4 }}
    className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-black text-white">{value}</p>
      </div>
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/10 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.article>
)

const MeetingsDashboard = () => {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const heroRef = React.useRef<HTMLDivElement>(null)
  const [createError, setCreateError] = React.useState('')
  const [creatingRoom, setCreatingRoom] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [scheduleError, setScheduleError] = React.useState('')
  const [scheduling, setScheduling] = React.useState(false)
  const [scheduledMeeting, setScheduledMeeting] = React.useState<CreateMeetingResponse | null>(null)
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

  const startRoom = async () => {
    if (creatingRoom) return
    setCreateError('')
    setCreatingRoom(true)

    try {
      const authToken = await getAuthToken(firebaseUser)
      const meeting = await createMeetingRoom(authToken)
      if (!meeting) throw new Error('Meeting API did not return a secured room.')
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
  }

  return (
    <main ref={heroRef} className="min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-white md:px-8 lg:px-12">
      <section className="meeting-reveal rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-5 shadow-2xl shadow-black/40 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-200">
              <Sparkles className="h-4 w-4" />
              AI-powered LiveKit meetings
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Meetings that turn every conversation into decisions, tasks, and searchable knowledge.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
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
          <p className="mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            {createError}
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
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-left shadow-xl shadow-black/20 transition-all hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.08]"
            >
              <span className="flex items-center gap-3 text-sm font-black text-white">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </span>
                {action.label}
              </span>
              <ChevronRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-200" />
            </button>
          )
        })}
      </section>

      {scheduleOpen && (
        <section className="meeting-reveal mt-6 rounded-3xl border border-cyan-300/20 bg-white/[0.055] p-5 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-cyan-200">Schedule meeting</p>
              <h2 className="mt-1 text-2xl font-black">Calendar reminder</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Pick a day and time, enter the email to remind, and CollabOS will send the meeting link when it starts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScheduleOpen(false)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Time</span>
              <input
                type="time"
                required
                value={scheduleForm.time}
                onChange={(event) => setScheduleForm((current) => ({ ...current, time: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              />
            </label>
            <Button type="submit" className="mt-6 h-12 gap-2" disabled={scheduling}>
              <CalendarClock className="h-5 w-5" />
              {scheduling ? 'Scheduling...' : 'Schedule'}
            </Button>
          </form>

          {scheduleError && (
            <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
              {scheduleError}
            </p>
          )}

          {scheduledMeeting && (
            <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-black text-emerald-100">Scheduled. Reminder will be sent to {scheduledMeeting.reminderEmail}.</p>
              <p className="mt-2 break-all text-sm text-emerald-50/80">{scheduledMeeting.inviteUrl}</p>
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
        <MetricCard label="Upcoming" value="18" icon={CalendarClock} />
        <MetricCard label="Today" value="6" icon={Activity} />
        <MetricCard label="Recordings" value="124" icon={Play} />
        <MetricCard label="Action items" value="31" icon={ClipboardCheck} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="meeting-reveal rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-cyan-200">Today’s meetings</p>
              <h2 className="mt-1 text-2xl font-black">Command center</h2>
            </div>
            <button className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">
              View calendar
            </button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <motion.article
                key={meeting.title}
                layout
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70"
              >
                <div className={`h-2 bg-gradient-to-r ${meeting.tone}`} />
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-400">{meeting.time}</p>
                  <h3 className="mt-2 text-lg font-black">{meeting.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{meeting.meta}</p>
                  <Button type="button" size="sm" className="mt-5 w-full gap-2" onClick={startRoom}>
                    Join
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="meeting-reveal rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Recording center</h2>
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {recordings.map((recording) => (
              <article key={recording.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{recording.title}</h3>
                    <p className="mt-1 text-xs font-bold text-cyan-200">{recording.length}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{recording.detail}</p>
                  </div>
                  <Download className="h-5 w-5 text-slate-400" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="meeting-reveal mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 lg:col-span-2">
          <h2 className="text-xl font-black">Meeting templates</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <button key={template} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left hover:bg-white/10">
                <span className="font-bold">{template}</span>
                <Repeat className="h-4 w-4 text-cyan-200" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-200" />
            <h2 className="text-xl font-black">Enterprise security</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-emerald-50/80">
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
  onSendChat,
}: {
  activeTab: SidebarTab
  participants: MeetingParticipant[]
  chatMessages: MeetingChatMessage[]
  chatDisabled?: boolean
  chatSending?: boolean
  onSendChat: (message: string) => Promise<void> | void
}) => {
  if (activeTab === 'participants') {
    return <ParticipantsPanel participants={participants} />
  }

  if (activeTab === 'ai') {
    return <AIToolsPanel />
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

  return (
    <div className="space-y-3">
      {recordingNotice && (
        <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100">
          {recordingNotice}
        </div>
      )}
      {['Live captions enabled', 'Poll: ship priority?', 'Notes synced to workspace', 'Recording chapter created'].map((item) => (
        <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-bold text-slate-200">
          {item}
        </div>
      ))}
    </div>
  )
}

interface LiveMeetingControlsState {
  micEnabled: boolean
  cameraEnabled: boolean
  screenShareEnabled: boolean
  mediaError?: string
  toggleMic: () => Promise<void>
  toggleCamera: () => Promise<void>
  toggleScreenShare: () => Promise<void>
  leave: () => void
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
  participantName,
  roomParticipants,
  liveControls,
  liveChat,
}: {
  liveStatus: string
  connectionError?: string
  participantName: string
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
  const [recording, setRecording] = React.useState(false)
  const [recordingStatus, setRecordingStatus] = React.useState<'idle' | 'starting' | 'stopping'>('idle')
  const [backgroundBlur, setBackgroundBlur] = React.useState(false)
  const [reaction, setReaction] = React.useState('')
  const [inviteCopied, setInviteCopied] = React.useState(false)
  const [previewChatMessages, setPreviewChatMessages] = React.useState<MeetingChatMessage[]>([])
  const activeParticipants =
    roomParticipants?.length
      ? roomParticipants.map((participant) =>
          participant.id === 'local-user' || participant.name === participantName
            ? {
                ...participant,
                role: 'Host',
                mic: liveControls?.micEnabled ?? previewMic,
                camera: liveControls?.cameraEnabled ?? previewCamera,
                hand: raisedHand,
              }
            : participant
        )
      : [
          createSelfParticipant(participantName, {
            mic: liveControls?.micEnabled ?? previewMic,
            camera: liveControls?.cameraEnabled ?? previewCamera,
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

  const leaveMeeting = () => {
    liveControls?.leave()
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

  const [recordingNotice, setRecordingNotice] = React.useState('')

  const toolbarItems: MeetingTool[] = [
    { label: 'Microphone', icon: Mic, active: liveControls?.micEnabled ?? previewMic, onClick: () => void toggleMic() },
    { label: 'Camera', icon: Camera, active: liveControls?.cameraEnabled ?? previewCamera, onClick: () => void toggleCamera() },
    { label: 'Screen Share', icon: MonitorUp, active: liveControls?.screenShareEnabled ?? previewScreen, onClick: () => void toggleScreenShare() },
    { label: 'Whiteboard', icon: Palette, active: activeTab === 'whiteboard', onClick: () => setActiveTab('whiteboard') },
    { label: 'AI Assistant', icon: Bot, active: activeTab === 'ai', onClick: () => setActiveTab('ai') },
    { label: 'Chat', icon: Send, active: activeTab === 'chat', onClick: () => setActiveTab('chat') },
    { label: 'Participants', icon: Users, active: activeTab === 'participants', onClick: () => setActiveTab('participants') },
    { label: 'Raise Hand', icon: Hand, active: raisedHand, onClick: () => setRaisedHand((current) => !current) },
    { label: 'Reactions', icon: Sparkles, active: Boolean(reaction), onClick: () => setReaction('👏') },
    { label: 'Live Captions', icon: Subtitles, active: captions, onClick: () => setCaptions((current) => !current) },
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
      <header className="flex flex-col gap-3 border-b border-white/10 bg-slate-950/95 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-cyan-200">CollabOS Meeting Room</p>
          <h1 className="mt-1 text-xl font-black md:text-2xl">Product Review · Q3 Workspace</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            Meeting timer {formatElapsed(elapsedSeconds)} · {activeParticipants.length} participant{activeParticipants.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void copyInviteLink()}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 transition-colors hover:bg-cyan-300/20"
          >
            {inviteCopied ? <Copy className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {inviteCopied ? 'Link copied' : 'Copy invite link'}
          </button>
          {(['speaker', 'gallery', 'spotlight', 'pip'] as RoomMode[]).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`rounded-xl px-3 py-2 text-xs font-black capitalize transition-colors ${
                mode === item ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
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
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/80 px-6 py-4 text-5xl shadow-2xl"
            >
              {reaction}
            </motion.div>
          )}

          <div className="pointer-events-none absolute left-6 top-6 space-y-2">
            {['Recording started', 'AI summary ready', 'Jordan raised a hand'].map((notice) => (
              <motion.div
                key={notice}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 text-xs font-bold text-slate-200 shadow-xl"
              >
                <Bell className="mr-2 inline h-4 w-4 text-cyan-200" />
                {notice}
              </motion.div>
            ))}
          </div>

          <MeetingControls tools={toolbarItems} onLeave={leaveMeeting} />
        </section>

        <aside className="border-t border-white/10 bg-slate-900/80 p-4 xl:w-[380px] xl:border-l xl:border-t-0">
          <div className="grid grid-cols-4 gap-2">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  title={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className={`grid h-11 place-items-center rounded-xl border text-sm font-bold transition-colors ${
                    activeTab === tab.id ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10'
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
                onSendChat={chatState.sendMessage}
              />
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </MeetingRoomShell>
  )
}

const ConnectedMeetingRoomContent = ({ liveStatus }: { liveStatus: string }) => {
  const room = useRoomContext()
  const local = useLocalParticipant()
  const liveParticipants = useParticipants()
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  })
  const [mediaError, setMediaError] = React.useState('')
  const [chatMessages, setChatMessages] = React.useState<MeetingChatMessage[]>([])

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

  const cameraTracksByIdentity = React.useMemo(
    () => new Map(cameraTracks.map((trackReference) => [trackReference.participant.identity, trackReference])),
    [cameraTracks]
  )

  const sendChatMessage = React.useCallback(
    async (text: string) => {
      const message: MeetingChatMessage = {
        id: `${room.localParticipant.identity}-${Date.now()}`,
        author: room.localParticipant.name || room.localParticipant.identity || 'You',
        text,
        timestamp: Date.now(),
        local: true,
      }

      addChatMessage(message)
      await sendDataMessage(chatEncoder.encode(JSON.stringify(message)), { reliable: true })
    },
    [addChatMessage, room.localParticipant.identity, room.localParticipant.name, sendDataMessage]
  )

  const [isRecording, setIsRecording] = React.useState(false)
  const [recordingStatus, setRecordingStatus] = React.useState<'idle' | 'starting' | 'stopping'>('idle')

  const toggleRecording = async () => {
    if (recordingStatus !== 'idle') return
    
    try {
      setRecordingStatus(isRecording ? 'stopping' : 'starting')
      const authToken = await getAuthToken(firebaseUser)
      
      if (isRecording) {
        await stopRecording(room.name, authToken)
      } else {
        await startRecording(room.name, authToken)
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
        await room.localParticipant.setScreenShareEnabled(!local.isScreenShareEnabled)
      } catch (error) {
        setMediaError(error instanceof Error ? error.message : 'Screen sharing could not be started.')
      }
    },
    toggleRecording,
    leave: () => {
      void room.disconnect()
    },
  }

  const roomParticipants: MeetingParticipant[] = liveParticipants.map((participant) => ({
    id: participant.identity,
    name: participant.name || participant.identity || 'Guest',
    role: participant.identity === room.localParticipant.identity ? 'Host' : 'Guest',
    quality: 'Connected',
    speaking: participant.isSpeaking,
    mic: participant.identity === room.localParticipant.identity ? local.isMicrophoneEnabled : true,
    camera:
      participant.identity === room.localParticipant.identity
        ? local.isCameraEnabled
        : Boolean(cameraTracksByIdentity.get(participant.identity)?.publication),
    hand: false,
    cameraTrack: cameraTracksByIdentity.get(participant.identity),
  }))

  return (
    <>
      <RoomAudioRenderer />
      <MeetingRoomContent
        liveStatus={liveStatus}
        participantName={room.localParticipant.name || room.localParticipant.identity || 'CollabOS User'}
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

  const participantName =
    firebaseUser?.displayName ||
    (profile?.uid === firebaseUser?.uid ? profile?.name : '') ||
    firebaseUser?.email?.split('@')[0] ||
    'CollabOS Guest'
  const roomName = roomId || 'collabos-meeting'

  React.useEffect(() => {
    let cancelled = false

    setToken(null)
    setServerUrl(null)
    setConnectionError('')

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

    getAuthToken(firebaseUser)
      .then((authToken) =>
        joinMeetingRoom({
          roomName,
          participantName,
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
        setStatus(join?.token ? 'LiveKit secured' : 'Preview mode')
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
    }
  }, [firebaseUser, participantName, roomName])

  if (token && serverUrl) {
    return (
      <LiveKitRoom serverUrl={serverUrl} token={token} connect audio video>
        <ConnectedMeetingRoomContent liveStatus={status} />
      </LiveKitRoom>
    )
  }

  return <MeetingRoomContent liveStatus={status} connectionError={connectionError} participantName={participantName} />
}

const MeetingsWorkspace = () => {
  const { roomId } = useParams()
  return roomId ? <MeetingRoom /> : <MeetingsDashboard />
}

export default MeetingsWorkspace
