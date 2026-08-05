import React from 'react'
import { Cookie } from 'lucide-react'
import { Button } from './Common/Button'
import { hasCookieChoice, setCookieConsent } from '../utils/cookies'

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = React.useState(() => !hasCookieChoice())

  if (!visible) return null

  const chooseConsent = (accepted: boolean) => {
    setCookieConsent(accepted)
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:px-8 md:pb-6">
      <section className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/95 p-5 text-white shadow-2xl shadow-black/40 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600">
            <Cookie className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold">CollabOS uses cookies</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
              We use cookies to store your CollabOS session, profile preferences, and account state on this device.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" onClick={() => chooseConsent(false)}>
            Do not accept
          </Button>
          <Button type="button" onClick={() => chooseConsent(true)}>
            I accept
          </Button>
        </div>
      </section>
    </div>
  )
}

export default CookieConsent
