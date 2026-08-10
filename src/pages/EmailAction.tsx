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
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 md:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-12 inline-flex w-fit items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to CollabOS
        </button>

        <section className="my-auto rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/70 md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white">
            {isSuccess ? (
              <Icon className="h-8 w-8" />
            ) : (
              <Icon className="h-8 w-8 text-red-100" />
            )}
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700">
            <MailCheck className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold">
              Firebase email action
            </span>
          </div>

          <h1 className="text-3xl font-bold md:text-5xl">
            {isSuccess ? copy.successTitle : copy.errorTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
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
