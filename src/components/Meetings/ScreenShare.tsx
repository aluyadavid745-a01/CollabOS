import { MonitorUp } from 'lucide-react'

const ScreenShare = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
        <MonitorUp className="h-5 w-5" />
      </div>
      <div>
        <p className="font-black">Presenter controls</p>
        <p className="text-xs text-slate-400">Share entire screen, window, or browser tab.</p>
      </div>
    </div>
  </div>
)

export default ScreenShare
