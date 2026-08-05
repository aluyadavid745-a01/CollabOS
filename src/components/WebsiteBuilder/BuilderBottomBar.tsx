import React from 'react'
import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { useWebsiteBuilder } from '../../context/WebsiteBuilderContext'
import type { BuilderBreakpoint } from '../../types/websiteBuilder'

const breakpoints: Array<{ key: BuilderBreakpoint; icon: React.ComponentType<{ className?: string }>; label: string }> = [
  { key: 'desktop', icon: Monitor, label: 'Desktop' },
  { key: 'laptop', icon: Monitor, label: 'Laptop' },
  { key: 'tablet', icon: Tablet, label: 'Tablet' },
  { key: 'mobile', icon: Smartphone, label: 'Mobile' },
]

const BuilderBottomBar: React.FC = () => {
  const { state, dispatch } = useWebsiteBuilder()

  return (
    <footer className="flex min-h-[48px] flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 text-sm text-slate-600">
      <div>Status: <span className="font-bold capitalize text-slate-900">{state.status}</span></div>
      <div className="flex items-center gap-2">
        {breakpoints.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => dispatch({ type: 'SET_BREAKPOINT', breakpoint: item.key })}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-bold ${state.breakpoint === item.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </div>
      <label className="flex items-center gap-2">
        Zoom
        <input type="range" min={50} max={120} value={state.zoom} onChange={(event) => dispatch({ type: 'SET_ZOOM', zoom: Number(event.target.value) })} />
        <span className="w-10 font-bold">{state.zoom}%</span>
      </label>
    </footer>
  )
}

export default BuilderBottomBar
