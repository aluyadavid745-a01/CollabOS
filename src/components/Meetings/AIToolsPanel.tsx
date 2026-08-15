import { Sparkles } from 'lucide-react'
import type { MeetingSummary } from '../../services/meetingSummaries'

interface AIToolsPanelProps {
  onRunAction: (action: string) => void
  onCreateSummary?: () => void
  summaryNotice?: string
  liveSummary?: MeetingSummary | null
  interimTranscript?: string
  localSpeakerName?: string
}

const AIToolsPanel = ({
  onRunAction,
  onCreateSummary,
  summaryNotice,
  liveSummary,
  interimTranscript,
  localSpeakerName,
}: AIToolsPanelProps) => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-600">Live AI summary</p>
      {liveSummary ? (
        <div className="mt-3 space-y-4">
          <p className="text-sm leading-6 text-slate-700">{liveSummary.overview}</p>
          {interimTranscript && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm italic leading-6 text-slate-500">
              <span className="font-black text-slate-700">{localSpeakerName || 'Speaker'}:</span> {interimTranscript}
            </p>
          )}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Decisions</p>
            <ul className="mt-2 space-y-2">
              {liveSummary.decisions.slice(0, 3).map((decision) => (
                <li key={decision} className="text-sm leading-6 text-slate-700">{decision}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Assignments</p>
            {liveSummary.actionItems.length ? (
              <ul className="mt-2 space-y-2">
                {liveSummary.actionItems.slice(0, 4).map((item) => (
                  <li key={item.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700">
                    {item.text}
                    {(item.owner || item.due) && (
                      <span className="mt-1 block text-xs font-bold text-slate-500">
                        {[item.owner ? `Owner: ${item.owner}` : '', item.due ? `Due: ${item.due}` : ''].filter(Boolean).join(' | ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-500">No assignments detected yet.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Press Live Captions and start talking. The summary, decisions, and assignments will update here as speech is captured.
        </p>
      )}
      {summaryNotice && (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          {summaryNotice}
        </p>
      )}
    </div>
    {onCreateSummary && (
      <button
        type="button"
        onClick={onCreateSummary}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-950 bg-slate-950 p-4 text-left text-sm font-bold text-white hover:bg-slate-800"
      >
        Generate meeting recap
        <Sparkles className="h-4 w-4" />
      </button>
    )}
    {['Create Jira tasks', 'Draft follow-up email', 'Translate captions to French', 'Answer a question from transcript'].map((item) => (
      <button
        key={item}
        type="button"
        onClick={() => onRunAction(item)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        {item}
        <Sparkles className="h-4 w-4 text-slate-600" />
      </button>
    ))}
  </div>
)

export default AIToolsPanel
