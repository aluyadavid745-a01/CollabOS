import React from 'react'
import type { ActionCodeSettings, User as FirebaseUser } from 'firebase/auth'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
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
  if (code.includes('popup-blocked')) return 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.'
  if (code.includes('unauthorized-domain')) {
    return `Firebase does not allow this hosted domain yet. Add ${window.location.hostname} in Firebase Authentication > Settings > Authorized domains.`
  }
  if (code.includes('unauthorized-continue-uri') || code.includes('invalid-continue-uri')) {
    return `Firebase does not allow this verification link domain yet. Add ${window.location.hostname} in Firebase Authentication > Settings > Authorized domains.`
  }
  if (code.includes('operation-not-allowed')) {
    return 'This Firebase sign-in method is not enabled yet. Enable Email/Password and Google under Firebase Authentication > Sign-in method.'
  }
  if (code.includes('account-exists-with-different-credential')) {
    return 'An account already exists with this email using another sign-in method.'
  }
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a moment and try again.'
  if (code.includes('network-request-failed')) return 'Firebase could not reach the network. Check your connection and try again.'

  return 'Firebase could not complete that request. Try again.'
}

const shouldRetryVerificationWithoutContinueUrl = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  return code.includes('unauthorized-continue-uri') || code.includes('invalid-continue-uri') || code.includes('unauthorized-domain')
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
  const [signupStep, setSignupStep] = React.useState(0)
  const [goals, setGoals] = React.useState<string[]>([])
  const [teamSize, setTeamSize] = React.useState('2-5')
  const [inviteEmails, setInviteEmails] = React.useState('')
  const [startChoice, setStartChoice] = React.useState('Create a project')
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
    setSignupStep(0)
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

  const sendVerificationEmail = React.useCallback(async (
    sendEmailVerification: (user: FirebaseUser, actionCodeSettings?: ActionCodeSettings) => Promise<void>,
    user: FirebaseUser
  ) => {
    try {
      await sendEmailVerification(user, actionCodeSettings)
    } catch (verificationError) {
      if (!shouldRetryVerificationWithoutContinueUrl(verificationError)) throw verificationError
      await sendEmailVerification(user)
      setNotice(
        `Firebase has not authorized ${window.location.hostname} for email action links yet, so we sent a standard verification email instead.`
      )
    }
  }, [actionCodeSettings])

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
        await sendVerificationEmail(sendEmailVerification, credential.user)
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
        await sendVerificationEmail(sendEmailVerification, credential.user)
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
      await sendVerificationEmail(sendEmailVerification, credential.user)
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
    setSignupStep(0)
    onNavigate(isSignup ? 'signin' : 'signup')
  }

  const workspaceSlug = (form.workspace || 'your-workspace')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const nameParts = form.name.trim().split(/\s+/).filter(Boolean)
  const signupFirstName = nameParts[0] || ''
  const signupLastName = nameParts.slice(1).join(' ')

  const updateSignupName = (part: 'first' | 'last') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    const nextFirst = part === 'first' ? value : signupFirstName
    const nextLast = part === 'last' ? value : signupLastName
    setForm((current) => ({ ...current, name: `${nextFirst.trim()} ${nextLast.trim()}`.trim() }))
    setError('')
  }

  const toggleGoal = (goal: string) => {
    setGoals((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal])
  }

  const nextSignupStep = () => {
    setError('')
    if (signupStep === 1 && (!signupFirstName.trim() || !signupLastName.trim())) {
      setError('Enter your first and last name so your workspace feels personal.')
      return
    }
    if (signupStep === 4 && !form.workspace.trim()) {
      setError('Enter a workspace name to continue.')
      return
    }
    setSignupStep((current) => Math.min(current + 1, 7))
  }

  const signupWizard = (
    <div className="space-y-5 text-slate-100 [&_h3]:text-white [&_p]:text-slate-400 [&_label_span]:text-slate-300 [&_input]:border-white/10 [&_input]:bg-[#09090a] [&_input]:text-white [&_input]:placeholder:text-slate-600 [&_textarea]:border-white/10 [&_textarea]:bg-[#09090a] [&_textarea]:text-white [&_textarea]:placeholder:text-slate-600">
      <div className="mb-2 flex items-center gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= signupStep ? 'bg-[#52c3f1]' : 'bg-white/10'}`} />
        ))}
      </div>

      {signupStep === 0 && (
        <div>
          <h3 className="text-2xl font-black">Welcome to CollabOS</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Let&apos;s set up your workspace. Projects, tasks, communication, files, meetings, and AI will connect in one simple place.</p>
          <Button type="button" size="lg" className="mt-6 w-full bg-white text-black hover:bg-slate-100" onClick={nextSignupStep}>Continue</Button>
        </div>
      )}

      {signupStep === 1 && (
        <div>
          <h3 className="text-2xl font-black">What should we call you?</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">First name</span>
              <input value={signupFirstName} onChange={updateSignupName('first')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" placeholder="Ada" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Last name</span>
              <input value={signupLastName} onChange={updateSignupName('last')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" placeholder="Johnson" />
            </label>
          </div>
          <Button type="button" size="lg" className="mt-6 w-full bg-white text-black hover:bg-slate-100" onClick={nextSignupStep}>Continue</Button>
        </div>
      )}

      {signupStep === 2 && (
        <div>
          <h3 className="text-2xl font-black">What are you here to accomplish?</h3>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {['Manage a team', 'Manage projects', 'Organize my work', 'Run a business', 'Collaborate remotely', 'Other'].map((goal) => (
              <button key={goal} type="button" onClick={() => toggleGoal(goal)} className={`min-h-[48px] rounded-lg border px-3 text-left text-sm font-bold ${goals.includes(goal) ? 'border-[#52c3f1] bg-[#52c3f1]/15 text-[#7ad5f6]' : 'border-white/10 bg-[#09090a] text-slate-300 hover:bg-white/5'}`}>
                {goal}
              </button>
            ))}
          </div>
          <Button type="button" size="lg" className="mt-6 w-full bg-white text-black hover:bg-slate-100" onClick={nextSignupStep}>Continue</Button>
        </div>
      )}

      {signupStep === 3 && (
        <div>
          <h3 className="text-2xl font-black">What's your team size?</h3>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {['1', '2-5', '6-10', '11-25', '26-100', '100+'].map((size) => (
              <button key={size} type="button" onClick={() => setTeamSize(size)} className={`min-h-[48px] rounded-lg border px-3 text-sm font-bold ${teamSize === size ? 'border-[#52c3f1] bg-[#52c3f1] text-black' : 'border-white/10 bg-[#09090a] text-slate-300 hover:bg-white/5'}`}>
                {size}
              </button>
            ))}
          </div>
          <Button type="button" size="lg" className="mt-6 w-full bg-white text-black hover:bg-slate-100" onClick={nextSignupStep}>Continue</Button>
        </div>
      )}

      {signupStep === 4 && (
        <div>
          <h3 className="text-2xl font-black">Create your workspace</h3>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Workspace name</span>
            <input value={form.workspace} onChange={updateForm('workspace')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" placeholder="Acme Studio" />
          </label>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Workspace URL preview</p>
            <p className="mt-1 text-sm font-bold text-slate-300">collabos.com/{workspaceSlug || 'your-workspace'}</p>
          </div>
          <Button type="button" size="lg" className="mt-6 w-full bg-white text-black hover:bg-slate-100" onClick={nextSignupStep}>Continue</Button>
        </div>
      )}

      {signupStep === 5 && (
        <div>
          <h3 className="text-2xl font-black">Invite your team</h3>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Email addresses</span>
            <textarea value={inviteEmails} onChange={(event) => setInviteEmails(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" placeholder="david@company.com, sarah@company.com" />
          </label>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="secondary" size="lg" className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5" onClick={nextSignupStep}>Skip for now</Button>
            <Button type="button" size="lg" className="bg-white text-black hover:bg-slate-100" onClick={nextSignupStep}>Continue</Button>
          </div>
        </div>
      )}

      {signupStep === 6 && (
        <div>
          <h3 className="text-2xl font-black">What would you like to start with?</h3>
          <div className="mt-5 grid gap-2">
            {['Create a project', 'Create a task', 'Start a team', 'Import existing work', 'Explore CollabOS'].map((choice) => (
              <button key={choice} type="button" onClick={() => setStartChoice(choice)} className={`min-h-[48px] rounded-lg border px-3 text-left text-sm font-bold ${startChoice === choice ? 'border-[#52c3f1] bg-[#52c3f1]/15 text-[#7ad5f6]' : 'border-white/10 bg-[#09090a] text-slate-300 hover:bg-white/5'}`}>
                {choice}
              </button>
            ))}
          </div>
          <Button type="button" size="lg" className="mt-6 w-full bg-white text-black hover:bg-slate-100" onClick={nextSignupStep}>Continue</Button>
        </div>
      )}

      {signupStep === 7 && (
        <form onSubmit={submitForm} className="space-y-5">
          <div>
            <h3 className="text-2xl font-black">Your workspace is ready.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create secure account access for {form.workspace || 'your workspace'}. We will send a verification email before opening protected workspace data.</p>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Work email</span>
            <input type="email" value={form.email} onChange={updateForm('email')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" placeholder="you@company.com" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <div className="relative mt-2">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateForm('password')} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" placeholder="Enter password" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-400">
            <p><strong>Purpose:</strong> {goals.length ? goals.join(', ') : 'Explore CollabOS'}</p>
            <p><strong>Team size:</strong> {teamSize}</p>
            <p><strong>Start with:</strong> {startChoice}</p>
            {inviteEmails.trim() && <p><strong>Invites prepared:</strong> {inviteEmails.split(',').filter(Boolean).length}</p>}
          </div>
          {notice && <p className="text-sm text-emerald-700">{notice}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="secondary" size="lg" className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5" onClick={() => setSignupStep(6)}>Back</Button>
            <Button type="submit" size="lg" className="bg-white text-black hover:bg-slate-100" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create account
            </Button>
          </div>
        </form>
      )}

      {signupStep > 0 && signupStep < 7 && (
        <button type="button" onClick={() => setSignupStep((current) => Math.max(current - 1, 0))} className="w-full text-sm font-bold text-slate-500 hover:text-white">
          Back
        </button>
      )}

      {error && signupStep < 7 && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
  const isCompactSignin = !isSignup && step === 'form'

  return (
    <main
      className="relative h-screen overflow-hidden bg-[#050506] px-4 py-4 text-white sm:px-6"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.075) 1px, transparent 1px), radial-gradient(circle at center, rgba(82,195,241,0.08), transparent 36%), linear-gradient(#050506, #050506)',
        backgroundPosition: 'center top',
        backgroundSize: '56px 56px, 56px 56px, 100% 100%, 100% 100%',
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,0.92)_0%,rgba(5,5,6,0.25)_34%,rgba(5,5,6,0.25)_66%,rgba(5,5,6,0.92)_100%)]" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex min-h-[36px] w-fit items-center gap-2 rounded-lg px-2 text-sm font-black uppercase tracking-[0.28em] text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          CollabOS
        </button>

        <section className="flex min-h-0 flex-1 items-center justify-center py-3">
          <div className={`w-full max-w-[620px] rounded-[28px] border border-white/10 bg-[#111113]/95 shadow-2xl shadow-black/60 backdrop-blur ${isCompactSignin ? 'p-5 sm:p-7' : 'p-6 md:p-10'}`}>
            <div className={isCompactSignin ? 'mb-5' : 'mb-8'}>
              <p className="text-sm font-black uppercase tracking-[0.38em] text-[#52c3f1]">
                {step === 'verify' ? 'Verify Email' : isSignup ? 'Get Started' : 'Access Workspace'}
              </p>
              <h1 className={`${isCompactSignin ? 'mt-3 text-3xl sm:text-4xl' : 'mt-5 text-4xl sm:text-5xl'} font-black leading-tight tracking-normal text-white`}>
                {step === 'verify'
                  ? 'Check your email'
                  : isSignup
                    ? 'Start CollabOS'
                    : 'Sign in to CollabOS'}
              </h1>
              <p className={`${isCompactSignin ? 'mt-2 text-base leading-6' : 'mt-4 text-base leading-7 sm:text-lg'} text-slate-400`}>
                {step === 'verify'
                  ? `Verification link sent to ${form.email}.`
                  : isSignup
                    ? 'Create the workspace your team will use for projects, files, meetings, messages, and AI.'
                    : hasCreatedAccountReady
                      ? 'Your workspace is ready. Sign in once to open it on this device.'
                      : firstName
                        ? `Welcome back, ${firstName}. Pick up where your team left off.`
                        : 'Welcome back. Pick up where your team left off.'}
              </p>
            </div>

            <section>
            <div className={`${isCompactSignin ? 'mb-4' : 'mb-8'} flex items-center justify-between gap-4`}>
              <div>
                <h2 className="sr-only">
                  {step === 'verify' ? 'Email verification' : isSignup ? 'Get started' : 'Sign in'}
                </h2>
                <p className="text-sm text-slate-500">
                  {step === 'verify'
                    ? `Verification link sent to ${form.email}`
                    : hasCreatedAccountReady
                      ? `Sign in with ${createdAccount?.email}`
                    : rememberedUser && !isSignup
                      ? `Last signed in as ${rememberedUser.email}`
                      : 'Use your work email to continue'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white">
                {step === 'verify' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
            </div>

            {step === 'form' ? (
              isSignup ? signupWizard : (
              <form onSubmit={submitForm} className={isCompactSignin ? 'space-y-4' : 'space-y-5'}>
                <button
                  type="button"
                  onClick={continueWithGoogle}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#52c3f1]/70 bg-[#52c3f1] px-4 py-3 text-base font-bold text-white transition-colors hover:bg-[#62caf3] disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
                      />
                    </svg>
                  )}
                  {submitting ? 'Opening Google...' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">or email</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                {isSignup && (
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Full name</span>
                    <input
                      value={form.name}
                      onChange={updateForm('name')}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 outline-none focus:border-slate-500"
                      placeholder="Ada Johnson"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Work email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateForm('email')}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#09090a] px-5 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-[#52c3f1] focus:ring-2 focus:ring-[#52c3f1]/15 sm:py-4"
                    placeholder="you@company.com"
                  />
                </label>

                {isSignup && (
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Workspace name</span>
                    <input
                      value={form.workspace}
                      onChange={updateForm('workspace')}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 outline-none focus:border-slate-500"
                      placeholder="Acme Product Team"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                    Password
                    {!isSignup && (
                      <button
                        type="button"
                        onClick={sendPasswordReset}
                        disabled={submitting}
                        className="tracking-normal text-[#52c3f1] transition-colors hover:text-[#7ad5f6] disabled:opacity-60"
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
                      className="w-full rounded-xl border border-white/10 bg-[#09090a] px-5 py-3 pr-12 text-white placeholder:text-slate-600 outline-none transition focus:border-[#52c3f1] focus:ring-2 focus:ring-[#52c3f1]/15 sm:py-4"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {notice && <p className="text-sm text-emerald-300">{notice}</p>}
                {error && <p className="text-sm text-red-300">{error}</p>}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-lg font-semibold text-black transition-all duration-200 hover:bg-[#52c3f1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52c3f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113] disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSignup
                    ? 'Create account and send email'
                    : rememberedUser
                      ? 'Continue to workspace'
                      : 'Sign in'}
                </button>
              </form>
              )
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <div className="flex items-center gap-3 text-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-sm font-semibold">
                      Firebase sent a verification link to {form.email}. Open the email, verify, then sign in. If it is not in your inbox, check Spam or Promotions.
                    </p>
                  </div>
                </div>

                {notice && <p className="text-sm text-emerald-300">{notice}</p>}
                {error && <p className="text-sm text-red-300">{error}</p>}

                <Button type="button" size="lg" className="w-full rounded-xl bg-white text-black hover:bg-slate-100" onClick={() => onNavigate('signin')}>
                  I verified. Go to sign in
                </Button>
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={submitting}
                  className="w-full text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {submitting ? 'Sending...' : 'Send verification email again'}
                </button>
              </div>
            )}

            <div className={`${isCompactSignin ? 'mt-5 pt-4' : 'mt-8 pt-6'} border-t border-white/10 text-center`}>
              <button
                type="button"
                onClick={switchMode}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {isSignup ? 'Already have an account? ' : 'New to CollabOS? '}
                <span className="font-bold text-[#52c3f1]">{isSignup ? 'Sign in' : 'Get started'}</span>
              </button>
            </div>

            {!isCompactSignin && <div className="mt-6 grid gap-3 text-xs font-semibold text-slate-500 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: 'Verified access' },
                { icon: Mail, label: 'Email code' },
                { icon: KeyRound, label: 'Secure recovery' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex min-h-[40px] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </div>
                )
              })}
            </div>}
          </section>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthPage
