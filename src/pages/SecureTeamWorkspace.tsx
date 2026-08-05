import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  Copy,
  Crown,
  FileText,
  Hash,
  Headphones,
  Image,
  KeyRound,
  Layers,
  Link2,
  Lock,
  Mic,
  MoreHorizontal,
  Paperclip,
  Plus,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  UserPlus,
  Users,
  Video,
  Wand2,
} from 'lucide-react'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import {
  createInvite,
  createLocalMessage,
  createLocalWorkspace,
  createShareableInviteToken,
  listLocalMessages,
  listLocalWorkspaces,
  cacheLocalMessages,
  cacheLocalWorkspace,
  loadSharedMessages,
  loadSharedWorkspace,
  saveLocalMessages,
  updateMemberRole,
  updatePresence,
} from '../services/teamChat'
import type { PresenceState, TeamMessage, TeamRoleName, TeamWorkspace, WorkspacePrivacy } from '../types/teamChat'
import { teamRoles } from '../types/teamChat'

const privacyOptions: WorkspacePrivacy[] = ['InviteOnly', 'Private', 'Public']
const presenceOptions: PresenceState[] = ['Online', 'Away', 'Busy', 'InMeeting', 'DoNotDisturb', 'Offline']

const statusTone: Record<PresenceState, string> = {
  Online: 'bg-emerald-400',
  Away: 'bg-amber-400',
  Busy: 'bg-rose-400',
  Offline: 'bg-slate-500',
  InMeeting: 'bg-violet-400',
  DoNotDisturb: 'bg-red-500',
}

const shellButton =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white'

const glassPanel = 'border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/20 backdrop-blur-xl'

const CreateWorkspaceModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (input: {
    name: string
    description: string
    category: string
    privacy: WorkspacePrivacy
    theme: string
    defaultLanguage: string
  }) => void
}) => {
  const [name, setName] = React.useState('Launch Team')
  const [description, setDescription] = React.useState('Secure encrypted workspace for product, engineering, and operations.')
  const [category, setCategory] = React.useState('Product Engineering')
  const [privacy, setPrivacy] = React.useState<WorkspacePrivacy>('InviteOnly')
  const [theme, setTheme] = React.useState('Midnight Aurora')
  const [defaultLanguage, setDefaultLanguage] = React.useState('English')

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form
        onSubmit={(event) => {
          event.preventDefault()
          onCreate({ name, description, category, privacy, theme, defaultLanguage })
        }}
        className={`w-full max-w-2xl rounded-2xl p-5 text-white ${glassPanel}`}
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.98 }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-cyan-200">Create workspace</p>
            <h2 className="mt-1 text-2xl font-black">Encrypted team command center</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-300">Workspace name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-300">Category</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-300">Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-300">Privacy</span>
            <select value={privacy} onChange={(event) => setPrivacy(event.target.value as WorkspacePrivacy)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300">
              {privacyOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-300">Default language</span>
            <input value={defaultLanguage} onChange={(event) => setDefaultLanguage(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-300">Workspace theme</span>
            <input value={theme} onChange={(event) => setTheme(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create secure workspace</Button>
        </div>
      </motion.form>
    </motion.div>
  )
}

const SecureTeamWorkspace: React.FC = () => {
  const { profile } = useAuth()
  const [workspaces, setWorkspaces] = React.useState<TeamWorkspace[]>(() => listLocalWorkspaces(profile))
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState(() => workspaces[0]?.id || '')
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0]
  const [activeChannelId, setActiveChannelId] = React.useState(() => activeWorkspace?.channels[0]?.id || '')
  const activeChannel = activeWorkspace?.channels.find((channel) => channel.id === activeChannelId) || activeWorkspace?.channels[0]
  const [messages, setMessages] = React.useState<TeamMessage[]>([])
  const [draftMessage, setDraftMessage] = React.useState('')
  const [inviteEmails, setInviteEmails] = React.useState('alex@company.com, sam@company.com')
  const [isCreating, setIsCreating] = React.useState(false)
  const [notice, setNotice] = React.useState('')
  const [typing, setTyping] = React.useState(false)
  const [aiStreaming, setAiStreaming] = React.useState(false)

  React.useEffect(() => {
    const nextWorkspaces = listLocalWorkspaces(profile)
    setWorkspaces(nextWorkspaces)
    setActiveWorkspaceId((current) => current || nextWorkspaces[0]?.id || '')
  }, [profile])

  React.useEffect(() => {
    if (!activeWorkspace) return
    setActiveChannelId((current) => current || activeWorkspace.channels[0]?.id || '')
  }, [activeWorkspace])

  React.useEffect(() => {
    if (!activeWorkspace || !activeChannel) return
    setMessages(listLocalMessages(activeWorkspace, activeChannel.id))

    let cancelled = false
    const refreshSharedMessages = async () => {
      const sharedMessages = await loadSharedMessages(activeWorkspace.id, activeChannel.id, activeWorkspace)
      if (!cancelled && sharedMessages) {
        setMessages((current) => JSON.stringify(current) === JSON.stringify(sharedMessages) ? current : sharedMessages)
        cacheLocalMessages(activeWorkspace.id, activeChannel.id, sharedMessages)
      }
    }

    void refreshSharedMessages()
    const intervalId = window.setInterval(refreshSharedMessages, 3000)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [activeWorkspace, activeChannel])

  React.useEffect(() => {
    if (!activeWorkspace) return

    let cancelled = false
    const refreshSharedWorkspace = async () => {
      const sharedWorkspace = await loadSharedWorkspace(activeWorkspace.id)
      if (cancelled || !sharedWorkspace) return

      cacheLocalWorkspace(sharedWorkspace)
      setWorkspaces((current) => current.map((item) => {
        const existing = item.id === sharedWorkspace.id ? item : null
        return existing && JSON.stringify(existing) === JSON.stringify(sharedWorkspace) ? item : item.id === sharedWorkspace.id ? sharedWorkspace : item
      }))
    }

    void refreshSharedWorkspace()
    const intervalId = window.setInterval(refreshSharedWorkspace, 5000)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [activeWorkspace])

  if (!profile || !activeWorkspace || !activeChannel) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-white">
        <div>
          <Lock className="mx-auto mb-4 h-10 w-10 text-cyan-300" />
          <h1 className="text-2xl font-black">Opening secure team workspace</h1>
          <p className="mt-2 text-slate-400">Sign in and complete your profile to start encrypted collaboration.</p>
        </div>
      </main>
    )
  }

  const updateWorkspace = (workspace: TeamWorkspace) => {
    setWorkspaces((current) => current.map((item) => (item.id === workspace.id ? workspace : item)))
  }

  const sendMessage = async () => {
    const text = draftMessage.trim()
    if (!text) return
    setDraftMessage('')
    const message = await createLocalMessage(activeWorkspace, activeChannel.id, profile, text)
    setMessages((current) => [...current, message])
    setTyping(false)
  }

  const reactToMessage = (messageId: string, reaction: string) => {
    const nextMessages = messages.map((message) => (message.id === messageId ? { ...message, reactions: [...message.reactions, reaction] } : message))
    setMessages(nextMessages)
    saveLocalMessages(activeWorkspace.id, activeChannel.id, nextMessages)
  }

  const pinMessage = (messageId: string) => {
    const nextMessages = messages.map((message) => (message.id === messageId ? { ...message, pinned: !message.pinned } : message))
    setMessages(nextMessages)
    saveLocalMessages(activeWorkspace.id, activeChannel.id, nextMessages)
  }

  const inviteMembers = async () => {
    const emails = inviteEmails.split(',').map((email) => email.trim()).filter(Boolean)
    if (!emails.length) return
    const workspace = createInvite(activeWorkspace, emails)
    updateWorkspace(workspace)
    const link = `${window.location.origin}/invite/${createShareableInviteToken(workspace)}`
    try {
      await navigator.clipboard.writeText(link)
      setNotice('Secure invitation link copied.')
    } catch {
      setNotice(link)
    }
  }

  const copyInviteLink = async () => {
    const workspace = createInvite(activeWorkspace, [])
    updateWorkspace(workspace)
    const link = `${window.location.origin}/invite/${createShareableInviteToken(workspace)}`
    await navigator.clipboard.writeText(link)
    setNotice('Invite link copied.')
  }

  const runAiAssistant = () => {
    setAiStreaming(true)
    const chunks = ['Scanning unread channels', 'Summarizing decisions', 'Checking project blockers', 'Recommended: schedule a launch review']
    let index = 0
    const interval = window.setInterval(() => {
      setNotice(chunks[index])
      index += 1
      if (index >= chunks.length) {
        window.clearInterval(interval)
        setAiStreaming(false)
      }
    }, 650)
  }

  const createWorkspace = (input: Parameters<typeof createLocalWorkspace>[1]) => {
    const workspace = createLocalWorkspace(profile, input)
    setWorkspaces((current) => [workspace, ...current])
    setActiveWorkspaceId(workspace.id)
    setActiveChannelId(workspace.channels[0]?.id || '')
    setIsCreating(false)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.16),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.88),rgba(12,18,31,0.96))]" />
      <div className="relative grid h-screen grid-cols-1 lg:grid-cols-[84px_300px_minmax(0,1fr)_340px]">
        <aside className="hidden border-r border-white/10 bg-black/25 p-3 backdrop-blur-xl lg:block">
          <div className="grid gap-3">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => setActiveWorkspaceId(workspace.id)}
                className={`grid h-14 w-14 place-items-center rounded-2xl border text-lg font-black transition-all ${workspace.id === activeWorkspace.id ? 'border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30' : 'border-white/10 bg-white/10 text-white hover:bg-white/15'}`}
                title={workspace.name}
              >
                {workspace.logoUrl ? <img src={workspace.logoUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : workspace.name[0]}
              </button>
            ))}
            <button type="button" onClick={() => setIsCreating(true)} className="grid h-14 w-14 place-items-center rounded-2xl border border-dashed border-white/20 text-slate-300 hover:border-cyan-300 hover:text-cyan-200" aria-label="Create workspace">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <aside className="hidden min-h-0 border-r border-white/10 bg-white/[0.045] backdrop-blur-2xl lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-black">{activeWorkspace.name}</p>
                <p className="mt-1 text-xs font-bold text-cyan-200">{activeWorkspace.privacy} · {activeWorkspace.theme}</p>
              </div>
              <button type="button" className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10" aria-label="Workspace menu">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <button type="button" onClick={() => setIsCreating(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/15">
              <Plus className="h-4 w-4" />
              New workspace
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3">
            <section>
              <p className="mb-2 px-2 text-xs font-black uppercase tracking-wider text-slate-500">Channels</p>
              {activeWorkspace.channels.map((channel) => (
                <button key={channel.id} type="button" onClick={() => setActiveChannelId(channel.id)} className={`${shellButton} ${channel.id === activeChannel.id ? 'bg-white/12 text-white' : ''}`}>
                  {channel.type === 'Voice' ? <Headphones className="h-4 w-4 text-emerald-300" /> : <Hash className="h-4 w-4 text-cyan-300" />}
                  <span className="min-w-0 flex-1 truncate">{channel.name}</span>
                  {channel.unread > 0 && <span className="rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-black text-slate-950">{channel.unread}</span>}
                </button>
              ))}
            </section>

            <section className="mt-6">
              <p className="mb-2 px-2 text-xs font-black uppercase tracking-wider text-slate-500">Workspace</p>
              {[
                ['Meetings', Video],
                ['Projects', Layers],
                ['Files', FileText],
                ['Whiteboard', Image],
                ['AI Center', Bot],
              ].map(([label, Icon]) => {
                const Component = Icon as React.ComponentType<{ className?: string }>
                return (
                  <button key={String(label)} type="button" className={shellButton}>
                    <Component className="h-4 w-4 text-violet-300" />
                    {String(label)}
                  </button>
                )
              })}
            </section>

            <section className="mt-6">
              <p className="mb-2 px-2 text-xs font-black uppercase tracking-wider text-slate-500">Direct messages</p>
              {activeWorkspace.members.filter((member) => member.userId !== profile.uid).map((member) => (
                <button key={member.userId} type="button" className={shellButton}>
                  <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-xs font-black">
                    {member.displayName[0]}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${statusTone[member.presence]}`} />
                  </span>
                  <span className="min-w-0 truncate">{member.displayName}</span>
                </button>
              ))}
            </section>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-white/10 bg-black/20 px-4 backdrop-blur-xl md:px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-cyan-300" />
                <h1 className="truncate text-xl font-black">{activeChannel.name}</h1>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs font-black text-emerald-200">
                  E2EE
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-400">{activeChannel.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/10" aria-label="Search">
                <Search className="h-5 w-5" />
              </button>
              <button type="button" className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/10" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <Button type="button" size="sm" onClick={runAiAssistant}>
                <Sparkles className="mr-2 h-4 w-4" />
                {aiStreaming ? 'Thinking' : 'AI Brief'}
              </Button>
            </div>
          </header>

          {notice && (
            <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-4 mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 md:mx-6">
              {notice}
            </motion.div>
          )}

          <div className="min-h-0 flex-1 overflow-auto px-4 py-5 md:px-6">
            <div className="mx-auto max-w-4xl space-y-4">
              <div className={`rounded-2xl p-4 ${glassPanel}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-300" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black">Secure channel established</p>
                    <p className="mt-1 text-sm text-slate-400">SignalR-ready channel isolation · key version {activeWorkspace.encryptionKeyId} · presence online</p>
                  </div>
                  <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-slate-950">Protected</span>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.article
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`group rounded-2xl border p-4 ${message.senderUserId === profile.uid ? 'border-cyan-300/20 bg-cyan-300/10' : 'border-white/10 bg-white/[0.06]'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-fuchsia-300 text-sm font-black text-slate-950">
                        {message.senderName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">{message.senderName}</p>
                          <span className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {message.pinned && <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-black text-slate-950">Pinned</span>}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{message.plainText}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {message.reactions.map((reaction, index) => (
                            <span key={`${reaction}-${index}`} className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs font-bold">{reaction}</span>
                          ))}
                          <button type="button" onClick={() => reactToMessage(message.id, 'Secure')} className="rounded-full border border-white/10 px-2 py-1 text-xs font-bold text-slate-400 opacity-100 hover:bg-white/10 hover:text-white md:opacity-0 md:group-hover:opacity-100">
                            React
                          </button>
                          <button type="button" onClick={() => pinMessage(message.id)} className="rounded-full border border-white/10 px-2 py-1 text-xs font-bold text-slate-400 opacity-100 hover:bg-white/10 hover:text-white md:opacity-0 md:group-hover:opacity-100">
                            Pin
                          </button>
                          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-200">
                            <CheckCheck className="h-3.5 w-3.5" />
                            {message.deliveryStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
              {typing && <p className="px-2 text-sm font-bold text-cyan-200">CollabOS AI is typing...</p>}
            </div>
          </div>

          <footer className="border-t border-white/10 bg-black/20 p-4 backdrop-blur-xl md:p-6">
            <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
              <button type="button" className="rounded-xl p-2 text-slate-300 hover:bg-white/10" aria-label="Attach file">
                <Paperclip className="h-5 w-5" />
              </button>
              <textarea
                value={draftMessage}
                onChange={(event) => {
                  setDraftMessage(event.target.value)
                  setTyping(Boolean(event.target.value))
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void sendMessage()
                  }
                }}
                rows={1}
                className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate-500"
                placeholder={`Message #${activeChannel.name}`}
              />
              <button type="button" className="rounded-xl p-2 text-slate-300 hover:bg-white/10" aria-label="Emoji">
                <Smile className="h-5 w-5" />
              </button>
              <Button type="button" onClick={sendMessage} disabled={!draftMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </section>

        <aside className="hidden min-h-0 overflow-auto border-l border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl xl:block">
          <div className="space-y-4">
            <section className={`rounded-2xl p-4 ${glassPanel}`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black">Invitation center</h2>
                <UserPlus className="h-5 w-5 text-cyan-300" />
              </div>
              <textarea value={inviteEmails} onChange={(event) => setInviteEmails(event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-cyan-300" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" size="sm" onClick={inviteMembers}>Invite</Button>
                <Button type="button" size="sm" variant="secondary" onClick={copyInviteLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Link
                </Button>
              </div>
              <p className="mt-3 break-all text-xs text-slate-400">
                Invite code: <span className="font-bold text-cyan-200">{activeWorkspace.inviteCode}</span>
              </p>
            </section>

            <section className={`rounded-2xl p-4 ${glassPanel}`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black">Members</h2>
                <Users className="h-5 w-5 text-violet-300" />
              </div>
              <div className="space-y-3">
                {activeWorkspace.members.map((member) => (
                  <div key={member.userId} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center gap-3">
                      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sm font-black">
                        {member.displayName[0]}
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-slate-950 ${statusTone[member.presence]}`} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{member.displayName}</p>
                        <p className="truncate text-xs text-slate-500">{member.role}</p>
                      </div>
                      {member.role === 'Owner' && <Crown className="h-4 w-4 text-amber-300" />}
                    </div>
                    {member.userId === profile.uid ? (
                      <select
                        value={member.presence}
                        onChange={(event) => updateWorkspace(updatePresence(activeWorkspace, member.userId, event.target.value as PresenceState))}
                        className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 py-2 text-xs font-bold outline-none"
                      >
                        {presenceOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    ) : (
                      <select
                        value={member.role}
                        onChange={(event) => updateWorkspace(updateMemberRole(activeWorkspace, member.userId, event.target.value as TeamRoleName))}
                        className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 py-2 text-xs font-bold outline-none"
                      >
                        {teamRoles.map((role) => <option key={role}>{role}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className={`rounded-2xl p-4 ${glassPanel}`}>
              <h2 className="mb-4 font-black">Live systems</h2>
              <div className="grid gap-2">
                {[
                  ['SignalR WebSockets', Radio, 'primary realtime layer'],
                  ['LiveKit meetings', Video, 'HD calls and screen share'],
                  ['AI streaming', Wand2, 'assistant chunks'],
                  ['Audit logs', Activity, 'role and device events'],
                  ['Secure invites', Link2, 'single-use tokens'],
                  ['Calendar sync', CalendarDays, 'meeting updates'],
                  ['Voice notes', Mic, 'encrypted uploads'],
                  ['Session keys', KeyRound, 'E2EE key rotation'],
                ].map(([label, Icon, detail]) => {
                  const Component = Icon as React.ComponentType<{ className?: string }>
                  return (
                    <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                      <Component className="h-4 w-4 text-cyan-300" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{String(label)}</p>
                        <p className="text-xs text-slate-500">{String(detail)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className={`rounded-2xl p-4 ${glassPanel}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black">Projects & files</h2>
                <MoreHorizontal className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-2">
                {activeWorkspace.projects.map((project) => (
                  <div key={project.id} className="rounded-xl bg-white/[0.05] p-3">
                    <p className="text-sm font-bold">{project.name}</p>
                    <p className="mt-1 text-xs text-cyan-200">{project.status} · {project.owner}</p>
                  </div>
                ))}
                {activeWorkspace.files.map((file) => (
                  <div key={file.id} className="rounded-xl bg-white/[0.05] p-3">
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{file.size} · encrypted</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {isCreating && <CreateWorkspaceModal onClose={() => setIsCreating(false)} onCreate={createWorkspace} />}
      </AnimatePresence>
    </main>
  )
}

export default SecureTeamWorkspace
