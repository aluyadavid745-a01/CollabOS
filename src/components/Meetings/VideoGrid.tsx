import { AnimatePresence } from 'framer-motion'
import ParticipantCard from './ParticipantCard'
import type { MeetingParticipant, RoomMode } from './types'

interface VideoGridProps {
  participants: MeetingParticipant[]
  mode: RoomMode
}

const gridClassByMode: Record<RoomMode, string> = {
  speaker: 'grid-cols-1 xl:grid-cols-[1.5fr_0.8fr]',
  gallery: 'grid-cols-1 md:grid-cols-2',
  spotlight: 'grid-cols-1',
  pip: 'grid-cols-1 lg:grid-cols-[1fr_280px]',
}

const VideoGrid = ({ participants, mode }: VideoGridProps) => (
  <div className={`grid flex-1 gap-4 ${gridClassByMode[mode]}`}>
    <AnimatePresence>
      {participants.map((participant, index) => (
        <ParticipantCard
          key={participant.id}
          participant={participant}
          active={participant.speaking || (mode === 'spotlight' && index === 0)}
        />
      ))}
    </AnimatePresence>
  </div>
)

export default VideoGrid
