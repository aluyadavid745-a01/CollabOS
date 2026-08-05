import type React from 'react'

interface MeetingRoomProps {
  children: React.ReactNode
}

const MeetingRoom = ({ children }: MeetingRoomProps) => (
  <main className="flex min-h-screen flex-col bg-slate-950 text-white">
    {children}
  </main>
)

export default MeetingRoom
