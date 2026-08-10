import type React from 'react'

interface MeetingRoomProps {
  children: React.ReactNode
}

const MeetingRoom = ({ children }: MeetingRoomProps) => (
  <main className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
    {children}
  </main>
)

export default MeetingRoom
