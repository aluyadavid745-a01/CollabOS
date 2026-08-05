import React from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import { Button } from '../components/Common/Button'
import { getCookie, hasCookieConsent } from '../utils/cookies'

export type AuthMode = 'signin' | 'signup'

export interface AuthUser {
  name: string
  email: string
  workspace: string
  verifiedAt: string
}

interface AuthPageProps {
  mode: AuthMode
  rememberedUser?: AuthUser | null
  createdAccount?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
  onAuthenticated: (user: AuthUser) => void
  onSignupVerified: (user: AuthUser) => void
}

const loadFirebaseAuthModules = () =>
  Promise.all([import('firebase/auth'), import('../firebase/config')]).then(async ([firebaseAuth, config]) => ({
    ...firebaseAuth,
    auth: await config.getConfiguredAuth(),
    isFirebaseConfigured: config.isFirebaseConfigured,
  }))

let firebaseAuthPromise: ReturnType<typeof loadFirebaseAuthModules> | null = null

const getFirebaseAuthModules = () => {
  firebaseAuthPromise ||= loadFirebaseAuthModules()
  return firebaseAuthPromise
}

const getFirebaseErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''

  if (code.includes('email-already-in-use')) return 'That email already has a CollabOS account. Sign in instead.'
  if (code.includes('invalid-email')) return 'Enter a valid email address.'
  if (code.includes('weak-password')) return 'Use a stronger password with at least 6 characters.'
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'The email or password is incorrect.'
  }
  if (code.includes('popup-closed-by-user')) return 'Google sign-in was closed before it finished.'
  if (code.includes('operation-not-allowed')) {
    return 'Google sign-in is not enabled yet. Enable Google under Firebase Authentication > Sign-in method.'
  }
  if (code.includes('account-exists-with-different-credential')) {
    return 'An account already exists with this email using another sign-in method.'
  }
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a moment and try again.'

  return 'Firebase could not complete that request. Try again.'
}

const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  rememberedUser,
  createdAccount,
  onNavigate,
  onAuthenticated,
  onSignupVerified,
}) => {
  const lastEmail =
    createdAccount?.email || (hasCookieConsent() ? getCookie('collabos:lastEmail') : null) || rememberedUser?.email || ''
  const [step, setStep] = React.useState<'form' | 'verify'>('form')
  const [error, setError] = React.useState('')
  const [notice, setNotice] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [form, setForm] = React.useState({
    name: createdAccount?.name || rememberedUser?.name || '',
    email: lastEmail,
    workspace: createdAccount?.workspace || rememberedUser?.workspace || '',
    password: '',
  })

  const isSignup = mode === 'signup'
  const firstName = rememberedUser?.name.split(' ')[0]
  const hasCreatedAccountReady = Boolean(createdAccount && !isSignup)

  React.useEffect(() => {
    setStep('form')
    setError('')
    setNotice('')
  }, [mode])

  React.useEffect(() => {
    if (!createdAccount || isSignup) return

    setForm((current) => ({
      ...current,
      name: createdAccount.name,
      email: createdAccount.email,
      workspace: createdAccount.workspace,
    }))
  }, [createdAccount, isSignup])

  React.useEffect(() => {
    void getFirebaseAuthModules()
  }, [])

  const updateForm = (field: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setError('')
  }

  const actionCodeSettings = React.useMemo(
    () => ({
      url: `${window.location.origin}/auth/action`,
      handleCodeInApp: true,
    }),
    []
  )

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Enter your email and password to continue.')
      return
    }

    if (isSignup && (!form.name.trim() || !form.workspace.trim())) {
      setError('Add your name and workspace to create your account.')
      return
    }

    setSubmitting(true)

    try {
      const {
        auth,
        createUserWithEmailAndPassword,
        isFirebaseConfigured,
        reload,
        sendEmailVerification,
        signInWithEmailAndPassword,
        signOut,
        updateProfile,
      } = await getFirebaseAuthModules()

      if (!auth || !isFirebaseConfigured) {
        setError('Firebase is not configured. Check .env.local and restart the dev server.')
        return
      }

      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password)
        await updateProfile(credential.user, { displayName: form.name.trim() })
        await sendEmailVerification(credential.user, actionCodeSettings)
        await signOut(auth)
        onSignupVerified({
          name: form.name.trim(),
          email: form.email.trim(),
          workspace: form.workspace.trim(),
          verifiedAt: '',
        })
        setStep('verify')
        setNotice(
          `Verification email sent to ${form.email.trim()}. Open it, verify your email, then sign in. If it is not in your inbox, check Spam or Promotions.`
        )
        return
      }

      const credential = await signInWithEmailAndPassword(auth, form.email.trim(), form.password)
      await reload(credential.user)

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user, actionCodeSettings)
        await signOut(auth)
        setStep('verify')
        setNotice(
          `We sent a fresh verification email to ${form.email.trim()}. Verify it before signing in. If it is not in your inbox, check Spam or Promotions.`
        )
        return
      }

      const matchingCreatedAccount =
        createdAccount?.email.toLowerCase() === form.email.trim().toLowerCase()
          ? createdAccount
          : null

      onAuthenticated({
        name:
          credential.user.displayName ||
          matchingCreatedAccount?.name ||
          rememberedUser?.name ||
          form.email.split('@')[0] ||
          'CollabOS User',
        email: credential.user.email || form.email.trim(),
        workspace:
          matchingCreatedAccount?.workspace ||
          rememberedUser?.workspace ||
          form.workspace ||
          'CollabOS Workspace',
        verifiedAt: new Date().toISOString(),
      })
    } catch (requestError) {
      setError(getFirebaseErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const resendVerification = async () => {
    setError('')
    setNotice('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Enter the same email and password so Firebase can resend the verification email.')
      setStep('form')
      return
    }

    setSubmitting(true)

    try {
      const {
        auth,
        isFirebaseConfigured,
        sendEmailVerification,
        signInWithEmailAndPassword,
        signOut,
      } = await getFirebaseAuthModules()

      if (!auth || !isFirebaseConfigured) {
        setError('Firebase is not configured. Check .env.local and restart the dev server.')
        return
      }

      const credential = await signInWithEmailAndPassword(auth, form.email.trim(), form.password)
      await sendEmailVerification(credential.user, actionCodeSettings)
      await signOut(auth)
      setNotice(`Verification email sent again to ${form.email.trim()}. If it is not in your inbox, check Spam or Promotions.`)
    } catch (requestError) {
      setError(getFirebaseErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const sendPasswordReset = async () => {
    setError('')
    setNotice('')

    if (!form.email.trim()) {
      setError('Enter your email address first so we can send the reset link.')
      return
    }

    setSubmitting(true)

    try {
      const { auth, isFirebaseConfigured, sendPasswordResetEmail } = await getFirebaseAuthModules()

      if (!auth || !isFirebaseConfigured) {
        setError('Firebase is not configured. Check .env.local and restart the dev server.')
        return
      }

      await sendPasswordResetEmail(auth, form.email.trim())
      setNotice(`Password reset link sent to ${form.email.trim()}. If it is not in your inbox, check Spam or Promotions.`)
    } catch (requestError) {
      setError(getFirebaseErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const continueWithGoogle = async () => {
    setError('')
    setNotice('')

    setSubmitting(true)

    try {
      const { auth, GoogleAuthProvider, isFirebaseConfigured, signInWithPopup } = await getFirebaseAuthModules()

      if (!auth || !isFirebaseConfigured) {
        setError('Firebase is not configured. Check .env.local and restart the dev server.')
        return
      }

      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')

      const credential = await signInWithPopup(auth, provider)
      const displayName = credential.user.displayName || credential.user.email?.split('@')[0] || 'CollabOS User'

      onAuthenticated({
        name: displayName,
        email: credential.user.email || '',
        workspace: rememberedUser?.workspace || form.workspace || `${displayName.split(' ')[0] || 'CollabOS'} Workspace`,
        verifiedAt: new Date().toISOString(),
      })
    } catch (requestError) {
      setError(getFirebaseErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setStep('form')
    setError('')
    setNotice('')
    onNavigate(isSignup ? 'signin' : 'signup')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-cyan-600/20 to-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CollabOS
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 items-center min-h-[calc(100vh-140px)]">
          <section>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {isSignup
                  ? 'Start your secure workspace'
                  : hasCreatedAccountReady
                    ? 'Account created. Sign in to continue'
                  : firstName
                    ? `Welcome back, ${firstName}`
                    : 'Secure team access'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {isSignup ? 'Create your CollabOS workspace' : 'Sign in to your workspace'}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
              {isSignup
                ? 'Set up your team hub for messaging, projects, documents, and meetings. Verification keeps every workspace protected from day one.'
                : hasCreatedAccountReady
                  ? 'Your CollabOS workspace is ready. Sign in once to open it on this device.'
                : 'Continue where you left off with remembered workspace details on this device.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-3xl">
              {[
                { icon: ShieldCheck, label: 'Verified access' },
                { icon: Mail, label: 'Email code' },
                { icon: KeyRound, label: 'Remembered login' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="glass-effect rounded-xl p-4 border border-white/10">
                    <Icon className="w-5 h-5 text-cyan-300 mb-3" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="glass-effect rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {step === 'verify' ? 'Check your email' : isSignup ? 'Get started' : 'Sign in'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {step === 'verify'
                    ? `Verification link sent to ${form.email}`
                    : hasCreatedAccountReady
                      ? `Sign in with ${createdAccount?.email}`
                    : rememberedUser && !isSignup
                      ? `Last signed in as ${rememberedUser.email}`
                      : 'Use your work email to continue'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
                {step === 'verify' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
            </div>

            {step === 'form' ? (
              <form onSubmit={submitForm} className="space-y-5">
                <button
                  type="button"
                  onClick={continueWithGoogle}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-400/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-slate-950">
                      G
                    </span>
                  )}
                  {submitting ? 'Opening Google...' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">or</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                {isSignup && (
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-200">Full name</span>
                    <input
                      value={form.name}
                      onChange={updateForm('name')}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                      placeholder="Ada Johnson"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">Work email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateForm('email')}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                    placeholder="you@company.com"
                  />
                </label>

                {isSignup && (
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-200">Workspace name</span>
                    <input
                      value={form.workspace}
                      onChange={updateForm('workspace')}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                      placeholder="Acme Product Team"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                    Password
                    {!isSignup && (
                      <button
                        type="button"
                        onClick={sendPasswordReset}
                        disabled={submitting}
                        className="text-xs font-bold text-cyan-300 transition-colors hover:text-cyan-200 disabled:opacity-60"
                      >
                        Forgot password?
                      </button>
                    )}
                  </span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={updateForm('password')}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {notice && <p className="text-sm text-cyan-200">{notice}</p>}
                {error && <p className="text-sm text-red-300">{error}</p>}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSignup
                    ? 'Create account and send email'
                    : rememberedUser
                      ? 'Continue to workspace'
                      : 'Sign in'}
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4">
                  <div className="flex items-center gap-3 text-cyan-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-sm font-semibold">
                      Firebase sent a verification link to {form.email}. Open the email, verify, then sign in. If it is not in your inbox, check Spam or Promotions.
                    </p>
                  </div>
                </div>

                {notice && <p className="text-sm text-cyan-200">{notice}</p>}
                {error && <p className="text-sm text-red-300">{error}</p>}

                <Button type="button" size="lg" className="w-full" onClick={() => onNavigate('signin')}>
                  I verified. Go to sign in
                </Button>
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={submitting}
                  className="w-full text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  {submitting ? 'Sending...' : 'Send verification email again'}
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                {isSignup ? 'Already have an account? Sign in' : 'New to CollabOS? Get started'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default AuthPage
