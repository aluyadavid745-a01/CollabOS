import { Sparkles } from 'lucide-react'

interface AIToolsPanelProps {
  onRunAction: (action: string) => void
}

const AIToolsPanel = ({ onRunAction }: AIToolsPanelProps) => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-600">Live AI summary</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        AI summary, decisions, and action items will appear after the meeting has real conversation activity.
      </p>
    </div>
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
