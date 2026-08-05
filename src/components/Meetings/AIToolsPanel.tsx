import { Sparkles } from 'lucide-react'

const AIToolsPanel = () => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-cyan-200">Live AI summary</p>
      <p className="mt-3 text-sm leading-6 text-slate-100">
        The team agreed to ship workspace analytics first. AI found 5 decisions, 7 action items, and 2 blockers.
      </p>
    </div>
    {['Create Jira tasks', 'Draft follow-up email', 'Translate captions to French', 'Answer a question from transcript'].map((item) => (
      <button key={item} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left text-sm font-bold hover:bg-white/10">
        {item}
        <Sparkles className="h-4 w-4 text-cyan-200" />
      </button>
    ))}
  </div>
)

export default AIToolsPanel
