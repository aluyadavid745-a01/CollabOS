import React from 'react'
import { Download, ExternalLink, Smartphone, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISSED_KEY = 'collabos:install-prompt-dismissed'

const wasDismissedThisSession = () => {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === 'true'
  } catch {
    return false
  }
}

const rememberDismissal = () => {
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, 'true')
  } catch {
    // The prompt can still be dismissed for the current render.
  }
}

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

const AppInstallPrompt: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [installEvent, setInstallEvent] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalling, setIsInstalling] = React.useState(false)

  React.useEffect(() => {
    if (isStandalone() || wasDismissedThisSession()) return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      setIsOpen(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    const timer = window.setTimeout(() => setIsOpen(true), 900)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const closePrompt = () => {
    rememberDismissal()
    setIsOpen(false)
  }

  const installApp = async () => {
    if (!installEvent) {
      closePrompt()
      return
    }

    setIsInstalling(true)
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    setIsInstalling(false)
    setInstallEvent(null)

    if (choice.outcome === 'accepted') closePrompt()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/30 p-4 sm:items-center" role="presentation">
      <section
        aria-labelledby="install-app-title"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <button
          type="button"
          aria-label="Close download app prompt"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={closePrompt}
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">CollabOS app</p>
            <h2 id="install-app-title" className="text-xl font-bold text-slate-950">Download the app</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep your workspace, meetings, and gift cards one tap away.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={closePrompt} className="order-2 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:order-1">
            Not now
          </button>
          <button type="button" onClick={() => void installApp()} disabled={isInstalling} className="order-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70 sm:order-2">
            {installEvent ? <Download size={16} /> : <ExternalLink size={16} />}
    {isInstalling ? 'Opening...' : installEvent ? 'Download app' : 'Add to home screen'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AppInstallPrompt
