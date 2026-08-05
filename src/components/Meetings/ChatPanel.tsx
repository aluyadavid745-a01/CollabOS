import React from 'react'
import { Send, Sparkles } from 'lucide-react'
import type { MeetingChatMessage } from './types'

interface ChatPanelProps {
  messages: MeetingChatMessage[]
  disabled?: boolean
  sending?: boolean
  onSend: (message: string) => Promise<void> | void
}

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))

const ChatPanel = ({ messages, disabled, sending, onSend }: ChatPanelProps) => {
  const [draft, setDraft] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || disabled || sending) return

    setDraft('')
    await onSend(text)
  }

  return (
    <div className="flex h-[calc(100vh-190px)] min-h-[360px] flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center gap-2 text-sm font-black text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Meeting chat
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Send a message to everyone in this LiveKit room.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl border p-4 ${
                message.local
                  ? 'ml-6 border-cyan-300/25 bg-cyan-300/10'
                  : 'mr-6 border-white/10 bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-black text-cyan-200">{message.local ? 'You' : message.author}</p>
                <p className="shrink-0 text-[11px] font-bold text-slate-500">{formatTime(message.timestamp)}</p>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{message.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submitMessage} className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
        <input
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          placeholder={disabled ? 'Connect to a meeting to chat...' : 'Message meeting...'}
        />
        <button
          type="submit"
          disabled={!draft.trim() || disabled || sending}
          className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300 text-slate-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
