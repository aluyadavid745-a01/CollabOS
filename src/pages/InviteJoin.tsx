import React from 'react'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { joinSharedInvite } from '../services/teamChat'

const InviteJoin: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useParams()
  const { firebaseUser, profile, loading } = useAuth()
  const [message, setMessage] = React.useState('Validating secure invitation...')

  React.useEffect(() => {
    if (loading) return
    if (!profile) {
      setMessage('Sign in or create an account to join this workspace.')
      return
    }

    if (!token) {
      setMessage('This invitation is invalid, expired, or has been disabled.')
      return
    }

    let cancelled = false
    const finishJoin = async () => {
      const authToken = await firebaseUser?.getIdToken().catch(() => undefined)
      const result = await joinSharedInvite(token, profile, authToken)
      if (cancelled) return

      if (!result.workspace) {
        setMessage(result.error)
        return
      }

      if (!result.synced) {
        setMessage(result.error)
        return
      }

      setMessage(`Joined ${result.workspace.name}. Redirecting to your secure workspace...`)
      const timeoutId = window.setTimeout(() => navigate('/workspace'), 900)
      return () => window.clearTimeout(timeoutId)
    }

    void finishJoin()
    return () => {
      cancelled = true
    }
  }, [firebaseUser, loading, navigate, profile, token])

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-300 text-slate-950">
          {profile ? <ShieldCheck className="h-8 w-8" /> : <UserPlus className="h-8 w-8" />}
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-cyan-200">CollabOS invitation</p>
        <h1 className="mt-2 text-3xl font-black">Join secure workspace</h1>
        <p className="mt-3 text-slate-300">{message}</p>
        {!profile && !loading && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/signin')}>Sign in</Button>
            <Button type="button" onClick={() => navigate('/get-started')}>Create account</Button>
          </div>
        )}
      </section>
    </main>
  )
}

export default InviteJoin
