import React from 'react'
import { ArrowLeft, Link2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import Activity from '../components/Activity'
import Footer from '../components/Footer/Footer'
import Navbar from '../components/Navbar/Navbar'
import PrivacySettings from '../components/PrivacySettings'
import ProfileHeader from '../components/ProfileHeader'
import Projects from '../components/Projects'
import Skills from '../components/Skills'
import { useAuth } from '../context/AuthContext'
import { getPublicProfileUrl } from '../utils/publicProfileStorage'
import type { AuthMode, AuthUser } from './AuthPage'

interface ProfilePageProps {
  rememberedUser?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
  onLogout: () => void
  onChangePassword: () => void
  onCustomizeProfile: () => void
}

const Profile: React.FC<ProfilePageProps> = ({
  rememberedUser,
  onNavigate,
  onLogout,
  onChangePassword,
  onCustomizeProfile,
}) => {
  const navigate = useNavigate()
  const { profile, loading, saveProfile } = useAuth()
  const [shareNotice, setShareNotice] = React.useState('')

  const copyProfileLink = async () => {
    if (!profile) return
    const url = getPublicProfileUrl(profile.username)
    try {
      await navigator.clipboard.writeText(url)
      setShareNotice('Public profile link copied.')
    } catch {
      setShareNotice(url)
    }
    window.setTimeout(() => setShareNotice(''), 2400)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar
        rememberedUser={rememberedUser}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onChangePassword={onChangePassword}
        onCustomizeProfile={onCustomizeProfile}
      />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 md:px-8 lg:px-16">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to CollabOS
        </button>

        {loading && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
            Syncing profile...
          </div>
        )}

        {!profile && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/60">
            <h1 className="text-3xl font-bold text-slate-950">{loading ? 'Preparing profile' : 'No profile found'}</h1>
            <p className="mt-2 text-slate-600">
              {loading ? 'Your profile will appear here as soon as it syncs.' : 'Sign in or create an account to customize your CollabOS profile.'}
            </p>
          </section>
        )}

        {profile && (
          <div className="space-y-6">
            {shareNotice && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {shareNotice}
              </p>
            )}
            <ProfileHeader profile={profile} onEdit={() => navigate('/profile/edit')} />
            <section className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-indigo-600">Public creator page</p>
                <p className="mt-1 text-sm text-slate-600">{getPublicProfileUrl(profile.username)}</p>
              </div>
              <Button type="button" size="sm" onClick={copyProfileLink}>
                <Link2 className="mr-2 h-4 w-4" />
                Copy profile link
              </Button>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                <Projects projects={profile.projects} />
                <Activity activity={profile.activity} />
              </div>
              <aside className="space-y-6">
                <Skills title="Skills" items={profile.skills} />
                <Skills title="Interests" items={profile.interests} tone="cyan" />
                <PrivacySettings
                  settings={profile.privacy}
                  onChange={(settings) => saveProfile({ ...profile, privacy: settings })}
                />
              </aside>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Profile
