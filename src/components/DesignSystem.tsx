import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'

export const designTokens = {
  colors: {
    page: 'bg-[#f7f9fc]',
    surface: 'bg-white',
    surfaceMuted: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-950',
    textMuted: 'text-slate-600',
    brand: 'text-blue-700',
    brandBg: 'bg-blue-700',
  },
  radius: {
    control: 'rounded-lg',
    panel: 'rounded-xl',
  },
  shadow: {
    panel: 'shadow-sm shadow-slate-200/70',
    elevated: 'shadow-2xl shadow-slate-900/20',
  },
  transition: 'transition duration-200',
}

export const surface = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2'
export const inputClass = `min-h-[46px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`

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

export const Card = ({
  children,
  className,
  as: Component = 'article',
}: {
  children: React.ReactNode
  className?: string
  as?: 'article' | 'section' | 'div'
}) => <Component className={cn(surface, 'p-5', className)}>{children}</Component>

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

export const ErrorState = ({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-5">
    <h2 className="text-lg font-black text-red-900">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-red-800">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const Skeleton = ({ className }: { className?: string }) => (
  <span className={cn('block animate-pulse rounded-lg bg-slate-200', className)} aria-hidden="true" />
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

export const Badge = StatusPill

export const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) => (
  <label className="block">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <div className="mt-2">{children}</div>
    {hint && !error && <span className="mt-1 block text-xs font-semibold text-slate-500">{hint}</span>}
    {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
  </label>
)

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputClass, className)} {...props} />
)
TextInput.displayName = 'TextInput'

export const SelectInput = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(inputClass, className)} {...props} />
)
SelectInput.displayName = 'SelectInput'

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn('w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10', className)} {...props} />
)
TextArea.displayName = 'TextArea'

export const Tabs = <Value extends string>({
  value,
  options,
  onChange,
}: {
  value: Value
  options: Array<{ value: Value; label: string }>
  onChange: (value: Value) => void
}) => (
  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="tablist">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="tab"
        aria-selected={value === option.value}
        onClick={() => onChange(option.value)}
        className={cn('min-h-[38px] rounded-md px-3 text-sm font-bold transition', value === option.value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-950')}
      >
        {option.label}
      </button>
    ))}
  </div>
)

export const Dialog = ({
  title,
  description,
  children,
  footer,
  onClose,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  onClose: () => void
}) => (
  <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/30 p-3 sm:place-items-center" role="presentation">
    <section className={cn(surface, 'w-full max-w-lg p-5 shadow-2xl shadow-slate-900/20')} role="dialog" aria-modal="true" aria-labelledby="collabos-dialog-title">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 id="collabos-dialog-title" className="text-2xl font-black text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        <button type="button" onClick={onClose} className={cn('grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100', focusRing)} aria-label="Close dialog">
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
      {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
    </section>
  </div>
)
