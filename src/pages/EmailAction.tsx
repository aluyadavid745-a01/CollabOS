import React from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, MailCheck } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import CollabLoader from '../components/Common/CollabLoader'
import { getConfiguredAuth, isFirebaseConfigured } from '../firebase/config'

type ActionState = 'loading' | 'success' | 'error'

const getActionCopy = (mode: string | null) => {
  if (mode === 'verifyEmail') {
    return {
      loading: 'Verifying your email address...',
      successTitle: 'Email verified',
      successMessage: 'Your CollabOS email address has been verified. You can continue to your workspace.',
      errorTitle: 'Verification failed',
      errorMessage: 'This verification link is invalid, expired, or has already been used.',
    }
  }

  return {
    loading: 'Checking this Firebase action...',
    successTitle: 'Action completed',
    successMessage: 'Firebase completed this account action successfully.',
    errorTitle: 'Action unavailable',
    errorMessage: 'This link is missing a supported Firebase action.',
  }
}

const EmailAction: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const oobCode = searchParams.get('oobCode')
  const [state, setState] = React.useState<ActionState>('loading')
  const [message, setMessage] = React.useState('')
  const copy = React.useMemo(() => getActionCopy(mode), [mode])

  React.useEffect(() => {
    let mounted = true

    const applyEmailAction = async () => {
      const auth = await getConfiguredAuth()

      if (!isFirebaseConfigured || !auth) {
        if (!mounted) return
        setState('error')
        setMessage('Firebase is not configured. Check your .env.local values and restart Vite.')
        return
      }

      if (mode !== 'verifyEmail' || !oobCode) {
        if (!mounted) return
        setState('error')
        setMessage(copy.errorMessage)
        return
      }

      try {
        const { applyActionCode } = await import('firebase/auth')
        await applyActionCode(auth, oobCode)
        if (!mounted) return
        setState('success')
        setMessage(copy.successMessage)
      } catch {
        if (!mounted) return
        setState('error')
        setMessage(copy.errorMessage)
      }
    }

    applyEmailAction()

    return () => {
      mounted = false
    }
  }, [copy.errorMessage, copy.successMessage, mode, oobCode])

  const isLoading = state === 'loading'
  const isSuccess = state === 'success'
  const Icon = isSuccess ? CheckCircle2 : AlertCircle

  if (isLoading) {
    return (
      <CollabLoader
        fullScreen
        label={copy.loading}
        description="Keep this page open while CollabOS confirms the link from your email."
      />
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-600/20 to-cyan-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gradient-to-l from-cyan-600/20 to-emerald-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 md:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-12 inline-flex w-fit items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to CollabOS
        </button>

        <section className="my-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl shadow-indigo-950/30 backdrop-blur-xl md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600">
            {isSuccess ? (
              <Icon className="h-8 w-8" />
            ) : (
              <Icon className="h-8 w-8 text-red-100" />
            )}
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 px-4 py-2">
            <MailCheck className="h-4 w-4 text-cyan-300" />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-sm font-semibold text-transparent">
              Firebase email action
            </span>
          </div>

          <h1 className="text-3xl font-bold md:text-5xl">
            {isSuccess ? copy.successTitle : copy.errorTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
            {message}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={() => navigate('/signin')}>
              Go to sign in
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              Return home
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default EmailAction
