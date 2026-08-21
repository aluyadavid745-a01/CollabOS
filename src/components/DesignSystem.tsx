import React from 'react'
import { cn } from '../utils/cn'

export const surface = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2'

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) => (
  <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="text-sm font-black uppercase tracking-wider text-blue-700">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>
)

export const Panel = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <section className={cn(surface, className)}>{children}</section>

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
    {icon && <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>}
    <h2 className="text-xl font-black text-slate-950">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
)

export const StatusPill = ({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'blue'
}) => {
  const tones = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
  }

  return <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-black', tones[tone])}>{children}</span>
}

export const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <label className="block">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
)
