import { MousePointer2, Palette, Square, StickyNote } from 'lucide-react'
import React from 'react'

const tools = [
  { label: 'Select', icon: MousePointer2 },
  { label: 'Color', icon: Palette },
  { label: 'Sticky note', icon: StickyNote },
  { label: 'Shape', icon: Square },
]

const Whiteboard = () => {
  const [activeTool, setActiveTool] = React.useState('Select')
  const [notes, setNotes] = React.useState(['Launch plan'])
  const [shapes, setShapes] = React.useState(['AI recap'])

  const selectTool = (tool: string) => {
    setActiveTool(tool)
    if (tool === 'Sticky note') setNotes((current) => [...current, `Note ${current.length + 1}`])
    if (tool === 'Shape') setShapes((current) => [...current, `Shape ${current.length + 1}`])
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-4 gap-2">
        {tools.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => selectTool(label)}
            className={`grid h-11 place-items-center rounded-xl ${
              activeTool === label ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
      <div className="mt-4 h-56 overflow-hidden rounded-2xl bg-white text-slate-900">
        <div className="p-4">
          <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Tool: {activeTool}</div>
          <div className="flex flex-wrap gap-3">
            {notes.map((note) => (
              <div key={note} className="h-16 w-36 rounded-xl bg-amber-200 p-3 text-xs font-black shadow-lg">{note}</div>
            ))}
            {shapes.map((shape) => (
              <div key={shape} className="h-16 w-40 rounded-full border-2 border-slate-500 p-4 text-center text-xs font-black">{shape}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Whiteboard
