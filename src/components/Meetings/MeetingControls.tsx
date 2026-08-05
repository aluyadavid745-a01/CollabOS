import { motion } from 'framer-motion'
import { PhoneOff } from 'lucide-react'
import type { MeetingTool } from './types'

interface MeetingControlsProps {
  tools: MeetingTool[]
  onLeave: () => void
}

const MeetingControls = ({ tools, onLeave }: MeetingControlsProps) => (
  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-black/40">
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
          aria-pressed={item.active}
          className={`grid h-11 w-11 place-items-center rounded-2xl border transition-colors ${
            item.danger
              ? 'border-red-300/30 bg-red-500/15 text-red-100 hover:bg-red-500/25'
              : item.active
                ? 'border-cyan-300/50 bg-cyan-300 text-slate-950'
                : 'border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-300/50 hover:text-cyan-200'
          }`}
        >
          <Icon className="h-5 w-5" />
        </motion.button>
      )
    })}
    <button
      type="button"
      onClick={onLeave}
      className="ml-1 inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-4 text-sm font-black text-white shadow-lg shadow-red-950/40"
    >
      <PhoneOff className="h-5 w-5" />
      Leave
    </button>
  </div>
)

export default MeetingControls
