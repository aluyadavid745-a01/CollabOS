import { motion } from 'framer-motion'
import { PhoneOff } from 'lucide-react'
import type { MeetingTool } from './types'

interface MeetingControlsProps {
  tools: MeetingTool[]
  onLeave: () => Promise<void> | void
}

const MeetingControls = ({ tools, onLeave }: MeetingControlsProps) => (
  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
    {tools.map((item) => {
      const Icon = item.icon
      return (
        <motion.button
          type="button"
          key={item.label}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          title={item.label}
          onClick={item.onClick}
          disabled={item.disabled}
          aria-pressed={item.active}
          className={`grid h-11 w-11 place-items-center rounded-2xl border transition-colors ${
            item.disabled
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              : item.danger
              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              : item.active
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Icon className="h-5 w-5" />
        </motion.button>
      )
    })}
    <button
      type="button"
      onClick={onLeave}
      className="ml-1 inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-black text-white shadow-sm hover:bg-red-700"
    >
      <PhoneOff className="h-5 w-5" />
      Leave
    </button>
  </div>
)

export default MeetingControls
