import React from 'react'
import { ArrowLeft, CalendarClock, Clock, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { readLocalProjects } from '../utils/localProjects'
import { recordLocalActivity } from '../utils/localActivity'
import { syncBeginnerWorkspaceToCloud } from '../utils/beginnerWorkspaceSync'
import { createLocalCalendarEvent, readLocalCalendarEvents, writeLocalCalendarEvents } from '../utils/localWorkspace'
import { showToast } from '../utils/toast'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const CalendarPage: React.FC = () => {
  const navigate = useNavigate()
  const [events, setEvents] = React.useState(() => readLocalCalendarEvents())
  const [title, setTitle] = React.useState('')
  const [date, setDate] = React.useState('')
  const [time, setTime] = React.useState('')
  const [projectId, setProjectId] = React.useState('')
  const [projects] = React.useState(() => readLocalProjects())

  const addEvent = () => {
    if (!title.trim() || !date) {
      showToast({ message: 'Add a meeting name and date first.', type: 'warning' })
      return
    }

    const event = createLocalCalendarEvent({ title, date, time: time || '09:00', projectId: projectId || undefined })
    if (!writeLocalCalendarEvents([event, ...events])) {
      showToast({ message: "We couldn't save this meeting. Please try again.", type: 'error' })
      return
    }
    setEvents(readLocalCalendarEvents())
    setTitle('')
    setDate('')
    setTime('')
    setProjectId('')
    recordLocalActivity({ type: 'calendar', title: 'Meeting added', detail: event.title, route: '/calendar' })
    void syncBeginnerWorkspaceToCloud()
    showToast({ message: 'Meeting added', type: 'success' })
  }

  const deleteEvent = (eventId: string) => {
    const nextEvents = events.filter((event) => event.id !== eventId)
    if (!writeLocalCalendarEvents(nextEvents)) {
      showToast({ message: "We couldn't delete this meeting. Please try again.", type: 'error' })
      return
    }
    setEvents(nextEvents)
    recordLocalActivity({ type: 'calendar', title: 'Meeting deleted', detail: 'A meeting was removed', route: '/calendar' })
    void syncBeginnerWorkspaceToCloud()
    showToast({ message: 'Meeting deleted', type: 'success' })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate('/home')} className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>
        <header className="mb-6">
          <h1 className="text-3xl font-black sm:text-4xl">Calendar</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Schedule meetings and important dates without opening the advanced meeting room first.</p>
        </header>

        <section className={`${panel} mb-5 p-4 sm:p-5`}>
          <h2 className="text-xl font-black">Add a meeting</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_170px_140px_180px_auto]">
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Weekly check-in" />
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 bg-white px-3 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" aria-label="Project">
              <option value="">No project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <Button type="button" onClick={addEvent} className="min-h-[48px] gap-2"><Plus className="h-4 w-4" />Add</Button>
          </div>
        </section>

        <section className={`${panel} overflow-hidden`}>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-black">Upcoming</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {events.length ? events.map((event) => (
              <article key={event.id} className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{event.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-500"><Clock className="h-4 w-4" />{new Date(`${event.date}T${event.time}`).toLocaleString()}</p>
                  {event.projectId && <p className="mt-1 text-xs font-bold text-slate-400">{projects.find((project) => project.id === event.projectId)?.name || 'Project'}</p>}
                </div>
                <button type="button" onClick={() => deleteEvent(event.id)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete meeting">
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            )) : (
              <div className="p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-black">No meetings yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Add your first meeting so the dashboard calendar number becomes real.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default CalendarPage
