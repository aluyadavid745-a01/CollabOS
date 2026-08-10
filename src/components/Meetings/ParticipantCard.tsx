import { motion } from 'framer-motion'
import { Activity, Hand, Mic, MonitorUp } from 'lucide-react'
import { isTrackReference } from '@livekit/components-core'
import { VideoTrack } from '@livekit/components-react'
import type { MeetingParticipant } from './types'

interface ParticipantCardProps {
  participant: MeetingParticipant
  active?: boolean
  featured?: boolean
}

const ParticipantCard = ({ participant, active, featured }: ParticipantCardProps) => {
  const cameraTrack =
    participant.cameraTrack && isTrackReference(participant.cameraTrack) ? participant.cameraTrack : undefined
  const screenShareTrack =
    participant.screenShareTrack && isTrackReference(participant.screenShareTrack) ? participant.screenShareTrack : undefined
  const visibleTrack = screenShareTrack || cameraTrack

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`relative min-h-[180px] overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-200/70 ${
        featured ? 'min-h-[420px] md:min-h-[520px]' : ''
      } ${
        active ? 'border-slate-950 ring-2 ring-slate-300' : 'border-slate-200'
      }`}
    >
      <div className="absolute inset-0 bg-slate-100" />
      {visibleTrack ? (
        <VideoTrack
          trackRef={visibleTrack}
          className={`absolute inset-0 h-full w-full ${screenShareTrack ? 'object-contain' : 'object-cover'}`}
          muted={visibleTrack.participant.isLocal}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          {!participant.camera ? (
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-2xl font-black text-slate-950 shadow-sm">
              {participant.name.charAt(0)}
            </div>
          ) : (
            <div className="h-28 w-28 rounded-full bg-slate-300 opacity-80" />
          )}
        </div>
      )}
      {screenShareTrack && (
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
          <MonitorUp className="h-4 w-4" />
          {participant.name} is presenting
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 px-3 py-2">
        <span className="truncate text-sm font-black">{participant.name}</span>
        <span className="flex shrink-0 items-center gap-2 text-slate-600">
          {participant.screenShare && <MonitorUp className="h-4 w-4 text-slate-700" />}
          {participant.hand && <Hand className="h-4 w-4 text-amber-300" />}
          {active && <Activity className="h-4 w-4 text-emerald-300" />}
          {!participant.mic && <Mic className="h-4 w-4 text-red-300" />}
        </span>
      </div>
    </motion.article>
  )
}

export default ParticipantCard
