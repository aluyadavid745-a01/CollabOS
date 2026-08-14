export interface MeetingSummaryChatMessage {
  author: string
  text: string
  timestamp: number
}

export interface MeetingSummaryActionItem {
  id: string
  text: string
  owner?: string
  due?: string
  status: 'open' | 'done'
}

export interface MeetingSummary {
  id: string
  roomId: string
  title: string
  createdAt: string
  startedAt?: string
  endedAt: string
  durationMinutes: number
  participants: string[]
  overview: string
  decisions: string[]
  actionItems: MeetingSummaryActionItem[]
  followUps: string[]
  transcriptSource: 'chat-and-notes'
}

export interface CreateMeetingSummaryInput {
  roomId: string
  title: string
  participants: string[]
  chatMessages: MeetingSummaryChatMessage[]
  notes: string
  startedAt?: string
  endedAt?: string
}

const summaryStorageKey = 'collabos:meeting-summaries'

const sentenceSplitPattern = /(?<=[.!?])\s+|\n+/g
const taskPattern = /\b(action|todo|to-do|task|assign|assigned|follow up|follow-up|next step|owner|deadline|due)\b/i
const decisionPattern = /\b(decided|decision|agreed|approved|confirmed|resolved|we will|we are going to)\b/i
const followUpPattern = /\b(follow up|follow-up|circle back|check in|next meeting|send|share|review)\b/i
const ownerPattern = /\b(?:owner|assigned to|for|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
const duePattern = /\b(?:due|by|before)\s+([A-Za-z]+day|tomorrow|today|next week|\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2})\b/i

const unique = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))

const cleanLine = (text: string) =>
  text
    .replace(/^[-*\u2022\d.)\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim()

const toSentences = (text: string) =>
  text
    .split(sentenceSplitPattern)
    .map(cleanLine)
    .filter((line) => line.length > 3)

const messageToLine = (message: MeetingSummaryChatMessage) => `${message.author}: ${message.text}`

const getFallbackOverview = (title: string, participants: string[], lineCount: number) => {
  if (lineCount === 0) {
    return `${title} ended without captured notes or chat. Add meeting notes before leaving to generate a richer recap.`
  }

  const participantText = participants.length
    ? ` with ${participants.slice(0, 4).join(', ')}${participants.length > 4 ? ` and ${participants.length - 4} more` : ''}`
    : ''

  return `${title}${participantText} covered ${lineCount} captured note${lineCount === 1 ? '' : 's'} and message${lineCount === 1 ? '' : 's'}.`
}

const extractActionItem = (line: string, index: number): MeetingSummaryActionItem => {
  const owner = line.match(ownerPattern)?.[1]
  const due = line.match(duePattern)?.[1]

  return {
    id: `action-${Date.now()}-${index}`,
    text: cleanLine(line),
    owner,
    due,
    status: 'open',
  }
}

export const createMeetingSummary = ({
  roomId,
  title,
  participants,
  chatMessages,
  notes,
  startedAt,
  endedAt = new Date().toISOString(),
}: CreateMeetingSummaryInput): MeetingSummary => {
  const noteLines = toSentences(notes)
  const chatLines = chatMessages.map(messageToLine).flatMap(toSentences)
  const allLines = [...noteLines, ...chatLines]
  const decisions = unique(allLines.filter((line) => decisionPattern.test(line))).slice(0, 6)
  const followUps = unique(allLines.filter((line) => followUpPattern.test(line))).slice(0, 6)
  const actionItems = unique(allLines.filter((line) => taskPattern.test(line)))
    .slice(0, 10)
    .map(extractActionItem)
  const overviewSource = noteLines.find((line) => line.length > 24) || chatLines.find((line) => line.length > 24)
  const startedTime = startedAt ? new Date(startedAt).getTime() : undefined
  const endedTime = new Date(endedAt).getTime()
  const durationMinutes = startedTime && Number.isFinite(startedTime)
    ? Math.max(1, Math.round((endedTime - startedTime) / 60000))
    : 0

  return {
    id: `summary-${roomId}-${Date.now()}`,
    roomId,
    title,
    createdAt: new Date().toISOString(),
    startedAt,
    endedAt,
    durationMinutes,
    participants: unique(participants),
    overview: overviewSource || getFallbackOverview(title, participants, allLines.length),
    decisions: decisions.length ? decisions : ['No explicit decisions were captured.'],
    actionItems,
    followUps: followUps.length ? followUps : ['Review the recap and add any missing follow-up before sharing.'],
    transcriptSource: 'chat-and-notes',
  }
}

export const readMeetingSummaries = (): MeetingSummary[] => {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(summaryStorageKey) || '[]') as MeetingSummary[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveMeetingSummary = (summary: MeetingSummary) => {
  if (typeof window === 'undefined') return summary

  const summaries = [
    summary,
    ...readMeetingSummaries().filter((item) => item.id !== summary.id && item.roomId !== summary.roomId),
  ].slice(0, 24)
  window.localStorage.setItem(summaryStorageKey, JSON.stringify(summaries))
  window.dispatchEvent(new Event('collabos:meeting-summaries-updated'))

  return summary
}
