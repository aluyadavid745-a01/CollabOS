import { Activity, Hand, MoreHorizontal } from 'lucide-react'
import type { MeetingParticipant } from './types'

interface ParticipantsPanelProps {
  participants: MeetingParticipant[]
  onMute: (participant: MeetingParticipant) => void
  onMakePresenter: (participant: MeetingParticipant) => void
  onRemove: (participant: MeetingParticipant) => void
}

const ParticipantsPanel = ({ participants, onMute, onMakePresenter, onRemove }: ParticipantsPanelProps) => (
  <div className="space-y-3">
    {participants.map((participant) => (
      <div key={participant.id} className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
              {participant.name.charAt(0)}
            </div>
            <div>
              <p className="font-black">{participant.name}</p>
              <p className="text-xs text-slate-400">{participant.role} · {participant.quality}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            {participant.hand && <Hand className="h-4 w-4 text-amber-300" />}
            {participant.speaking && <Activity className="h-4 w-4 text-emerald-300" />}
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold">
          <button type="button" onClick={() => onMute(participant)} className="rounded-lg bg-slate-100 py-2 hover:bg-slate-200">Mute</button>
          <button type="button" onClick={() => onMakePresenter(participant)} className="rounded-lg bg-slate-100 py-2 hover:bg-slate-200">Presenter</button>
          <button type="button" onClick={() => onRemove(participant)} className="rounded-lg bg-red-50 py-2 text-red-600 hover:bg-red-100">Remove</button>
        </div>
      </div>
    ))}
  </div>
)

export default ParticipantsPanel
