import { motion } from 'framer-motion'
import { Activity, Hand, Mic } from 'lucide-react'
import { isTrackReference } from '@livekit/components-core'
import { VideoTrack } from '@livekit/components-react'
import type { MeetingParticipant } from './types'

interface ParticipantCardProps {
  participant: MeetingParticipant
  active?: boolean
}

const ParticipantCard = ({ participant, active }: ParticipantCardProps) => {
  const cameraTrack =
    participant.cameraTrack && isTrackReference(participant.cameraTrack) ? participant.cameraTrack : undefined

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`relative min-h-[180px] overflow-hidden rounded-2xl border bg-slate-900 shadow-xl shadow-black/30 ${
        active ? 'border-cyan-300/70 ring-2 ring-cyan-300/20' : 'border-white/10'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_30%),linear-gradient(135deg,rgba(30,41,59,1),rgba(15,23,42,1))]" />
      {cameraTrack ? (
        <VideoTrack
          trackRef={cameraTrack}
          className="absolute inset-0 h-full w-full object-cover"
          muted={cameraTrack.participant.isLocal}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          {!participant.camera ? (
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/10 text-2xl font-black text-white">
              {participant.name.charAt(0)}
            </div>
          ) : (
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-cyan-300 via-indigo-400 to-fuchsia-400 opacity-80" />
          )}
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2">
        <span className="truncate text-sm font-black">{participant.name}</span>
        <span className="flex shrink-0 items-center gap-2 text-slate-300">
          {participant.hand && <Hand className="h-4 w-4 text-amber-300" />}
          {active && <Activity className="h-4 w-4 text-emerald-300" />}
          {!participant.mic && <Mic className="h-4 w-4 text-red-300" />}
        </span>
      </div>
    </motion.article>
  )
}

export default ParticipantCard
