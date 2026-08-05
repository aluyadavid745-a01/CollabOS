import { Activity, Hand, MoreHorizontal } from 'lucide-react'
import type { MeetingParticipant } from './types'

interface ParticipantsPanelProps {
  participants: MeetingParticipant[]
}

const ParticipantsPanel = ({ participants }: ParticipantsPanelProps) => (
  <div className="space-y-3">
    {participants.map((participant) => (
      <div key={participant.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-black">
              {participant.name.charAt(0)}
            </div>
            <div>
              <p className="font-black">{participant.name}</p>
              <p className="text-xs text-slate-400">{participant.role} · {participant.quality}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            {participant.hand && <Hand className="h-4 w-4 text-amber-300" />}
            {participant.speaking && <Activity className="h-4 w-4 text-emerald-300" />}
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold">
          <button className="rounded-lg bg-white/10 py-2 hover:bg-white/15">Mute</button>
          <button className="rounded-lg bg-white/10 py-2 hover:bg-white/15">Presenter</button>
          <button className="rounded-lg bg-red-500/10 py-2 text-red-200 hover:bg-red-500/20">Remove</button>
        </div>
      </div>
    ))}
  </div>
)

export default ParticipantsPanel
