import React from 'react'

interface CollabLoaderProps {
  label?: string
  description?: string
  variant?: 'dark' | 'light'
  fullScreen?: boolean
}

const CollabLoader: React.FC<CollabLoaderProps> = ({
  label = 'Loading CollabOS',
  description = 'Preparing your workspace...',
  variant = 'dark',
  fullScreen = false,
}) => {
  const isDark = variant === 'dark'

  return (
    <div
      className={`grid place-items-center px-4 ${
        fullScreen ? 'min-h-screen' : 'min-h-[420px]'
      } ${isDark ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white' : 'bg-white text-slate-950'}`}
    >
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-2xl shadow-indigo-500/30" />
          <div className="absolute inset-3 grid place-items-center rounded-2xl bg-slate-950 text-3xl font-black text-white">
            C
          </div>
          <div className="absolute -inset-2 animate-spin rounded-[2rem] border-2 border-transparent border-t-cyan-300 border-r-indigo-400" />
          <div className="absolute -inset-5 rounded-full border border-cyan-400/20" />
        </div>

        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{label}</h2>
        <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>

        <div className="mx-auto mt-5 flex w-40 justify-center gap-2">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="h-2 w-2 animate-pulse rounded-full bg-cyan-300"
              style={{ animationDelay: `${item * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CollabLoader
