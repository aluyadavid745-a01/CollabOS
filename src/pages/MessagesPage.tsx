import React from 'react'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { createDefaultProfile } from '../types/profile'
import { readLocalProjects } from '../utils/localProjects'
import { recordLocalActivity } from '../utils/localActivity'
import { createLocalMessage, readLocalMessages, writeLocalMessages } from '../utils/localWorkspace'
import { showToast } from '../utils/toast'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const MessagesPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const activeProfile = profile || createDefaultProfile({ name: 'CollabOS User', email: '' })
  const [messages, setMessages] = React.useState(() => readLocalMessages())
  const [projects] = React.useState(() => readLocalProjects())
  const [draft, setDraft] = React.useState('')
  const [projectId, setProjectId] = React.useState('')

  const sendMessage = () => {
    const text = draft.trim()
    if (!text) {
      showToast({ message: 'Type a message first.', type: 'warning' })
      return
    }

    const message = createLocalMessage({ text, sender: activeProfile.name, projectId: projectId || undefined })
    if (!writeLocalMessages([message, ...messages])) {
      showToast({ message: "We couldn't send your message. Please try again.", type: 'error' })
      return
    }

    setMessages([message, ...messages])
    setDraft('')
    setProjectId('')
    recordLocalActivity({ type: 'message', title: 'Message sent', detail: message.text, route: '/messages' })
    showToast({ message: 'Message sent', type: 'success' })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate('/home')} className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>
        <header className="mb-6">
          <h1 className="text-3xl font-black sm:text-4xl">Messages</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Send quick updates your team can understand. Keep it simple and clear.</p>
        </header>

        <section className={`${panel} mb-5 p-4 sm:p-5`}>
          <h2 className="text-xl font-black">Send a message</h2>
          <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_180px_auto]">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              className="min-h-[48px] min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              placeholder="Write an update, like Design files are ready"
              aria-label="Message"
              autoFocus
            />
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 bg-white px-3 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" aria-label="Project">
              <option value="">No project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <Button type="button" onClick={sendMessage} className="min-h-[48px] gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </section>

        <section className={`${panel} overflow-hidden`}>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-black">Team updates</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {messages.length ? messages.map((message) => (
              <article key={message.id} className="p-4">
                <p className="font-bold">{message.text}</p>
                {message.projectId && <p className="mt-1 text-xs font-bold text-slate-400">{projects.find((project) => project.id === message.projectId)?.name || 'Project'}</p>}
                <p className="mt-2 text-sm font-semibold text-slate-500">{message.sender} - {new Date(message.createdAt).toLocaleString()}</p>
              </article>
            )) : (
              <div className="p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-black">No messages yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Messages help your team share updates and decisions without getting lost.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default MessagesPage
