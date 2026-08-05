import { MousePointer2, Palette, Square, StickyNote } from 'lucide-react'

const Whiteboard = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
    <div className="grid grid-cols-4 gap-2">
      {[MousePointer2, Palette, StickyNote, Square].map((Icon, index) => (
        <button key={index} className="grid h-11 place-items-center rounded-xl bg-white/10 text-cyan-200 hover:bg-white/15">
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
    <div className="mt-4 h-56 rounded-2xl bg-white text-slate-900">
      <div className="p-4">
        <div className="h-16 w-36 rounded-xl bg-amber-200 p-3 text-xs font-black shadow-lg">Launch plan</div>
        <div className="ml-28 mt-5 h-16 w-40 rounded-full border-2 border-cyan-500 p-4 text-center text-xs font-black">AI recap</div>
      </div>
    </div>
  </div>
)

export default Whiteboard
