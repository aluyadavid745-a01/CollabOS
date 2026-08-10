import { CircleDot } from 'lucide-react'

const RecordingIndicator = () => (
  <span className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-600">
    <CircleDot className="h-4 w-4 animate-pulse" />
    Recording
  </span>
)

export default RecordingIndicator
