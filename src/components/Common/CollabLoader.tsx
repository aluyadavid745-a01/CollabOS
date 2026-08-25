import React from 'react'

interface CollabLoaderProps {
  label?: string
  description?: string
  variant?: 'light' | 'compact'
  fullScreen?: boolean
}

const CollabLoader: React.FC<CollabLoaderProps> = ({
  label = 'Loading CollabOS',
  description = 'Preparing your workspace...',
  variant = 'light',
  fullScreen = false,
}) => {
  const compact = variant === 'compact'

  return (
    <div
      className={`grid place-items-center overflow-hidden px-4 text-slate-950 ${
        fullScreen ? 'min-h-screen bg-[#f7f6f3]' : compact ? 'min-h-[180px] bg-transparent' : 'min-h-[420px] bg-white'
      }`}
    >
      <div className="relative w-full max-w-md text-center">
        <div className="pointer-events-none absolute inset-x-8 top-5 h-24 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto mb-6 h-28 w-44">
          <div className="absolute inset-0 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80" />
          <div className="absolute inset-3 grid place-items-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 px-4">
            <img src="/collabos-logo.png" alt="" className="h-auto w-full object-contain motion-safe:animate-[collab-logo-float_1.8s_ease-in-out_infinite]" />
          </div>
          <div className="absolute -inset-2 rounded-[1.35rem] border-2 border-transparent border-t-blue-700 border-r-emerald-500 motion-safe:animate-[collab-loader-ring_1.1s_linear_infinite]" />
          <div className="absolute -inset-5 rounded-[2rem] border border-blue-100 motion-safe:animate-[collab-loader-pulse_1.8s_ease-in-out_infinite]" />
        </div>

        <h2 className="text-xl font-black tracking-tight text-slate-950">{label}</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">{description}</p>

        <div className="mx-auto mt-6 h-2 w-52 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 rounded-full bg-blue-700 motion-safe:animate-[collab-loader_1.25s_ease-in-out_infinite]" />
        </div>

        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          <span>Tasks</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>Projects</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>AI</span>
        </div>
      </div>
    </div>
  )
}

export default CollabLoader
