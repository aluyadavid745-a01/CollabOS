import React from 'react'

interface CollabLoaderProps {
  label?: string
  description?: string
  variant?: 'light' | 'compact'
  fullScreen?: boolean
  progress?: number
}

const CollabLoader: React.FC<CollabLoaderProps> = ({
  variant = 'light',
  progress,
}) => {
  const compact = variant === 'compact'
  const normalizedProgress = typeof progress === 'number' ? Math.max(0, Math.min(100, Math.round(progress))) : null

  return (
    <div
      className={`grid min-h-[100svh] place-items-center overflow-hidden px-4 py-10 ${
        compact ? 'bg-transparent text-slate-950' : 'bg-white text-slate-950'
      }`}
    >
      <div className="w-full max-w-sm text-center">
        <h2 className="font-display text-3xl font-black uppercase tracking-[0.16em] text-slate-950 sm:text-4xl">
          COLLABOS
        </h2>

        <div
          className="mx-auto mt-8 h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="CollabOS startup progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress ?? undefined}
        >
          <div
            className={`h-full rounded-full bg-slate-950 transition-[width] duration-150 ease-out ${
              normalizedProgress === null ? 'w-full motion-safe:animate-[collab-loader_1.25s_ease-in-out_infinite]' : ''
            }`}
            style={normalizedProgress === null ? undefined : { width: `${normalizedProgress}%` }}
          />
        </div>

        {normalizedProgress !== null ? (
          <p className="mt-3 font-mono text-xs font-bold text-slate-500">{normalizedProgress}%</p>
        ) : null}
      </div>
    </div>
  )
}

export default CollabLoader
