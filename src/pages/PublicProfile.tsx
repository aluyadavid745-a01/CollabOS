import React from 'react'
import { ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader'
import Projects from '../components/Projects'
import Skills from '../components/Skills'
import { getPublicProfile } from '../utils/publicProfileStorage'
import { listPublicWebsiteProjects } from '../utils/websiteBuilderStorage'
import type { UserProfile } from '../types/profile'
import type { WebsiteProject } from '../types/websiteBuilder'

const PublicProfile: React.FC = () => {
  const { username } = useParams()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [websites, setWebsites] = React.useState<WebsiteProject[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!username) return
      setLoading(true)
      const nextProfile = await getPublicProfile(username)
      setProfile(nextProfile)
      setWebsites(await listPublicWebsiteProjects(nextProfile?.uid))
      setLoading(false)
    }
    load()
  }, [username])

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-6 text-sm font-bold text-indigo-600">Opening public profile...</main>
  }

  if (!profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center text-slate-950">
        <div>
          <h1 className="text-3xl font-black">Profile not found</h1>
          <p className="mt-2 text-slate-600">This creator profile has not been published yet.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-6">
        <ProfileHeader profile={profile} theme="light" />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Published websites</h2>
              <p className="mt-1 text-sm text-slate-600">Live work shared from this CollabOS profile.</p>
            </div>
          </div>
          {!websites.length ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm font-bold text-slate-500">No published websites yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {websites.map((website) => (
                <Link key={website.id} to={`/sites/${website.id}`} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50">
                  <span className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Published</span>
                  <h3 className="text-lg font-black text-slate-950">{website.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{website.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600">
                    Open site <ExternalLink className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Projects projects={profile.projects} />
          <aside className="space-y-6">
            <Skills title="Skills" items={profile.skills} />
            <Skills title="Interests" items={profile.interests} tone="cyan" />
          </aside>
        </div>
      </div>
    </main>
  )
}

export default PublicProfile
