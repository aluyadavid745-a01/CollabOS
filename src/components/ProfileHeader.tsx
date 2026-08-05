import React from 'react'
import {
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Twitter,
} from 'lucide-react'
import { Button } from './Common/Button'
import type { SocialLinks, UserProfile } from '../types/profile'

interface ProfileHeaderProps {
  profile: UserProfile
  onEdit?: () => void
  theme?: 'light' | 'dark'
}

const socialItems: Array<{
  key: keyof SocialLinks
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'website', label: 'Website', icon: Globe },
]

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onEdit, theme = 'light' }) => {
  const visibleSocials = socialItems.filter((item) => profile.socials[item.key])
  const isDark = theme === 'dark'
  const coverStyle = profile.coverURL
    ? { backgroundImage: `url(${profile.coverURL})` }
    : {
        backgroundImage:
          'linear-gradient(135deg, rgb(79 70 229), rgb(14 165 233) 52%, rgb(15 23 42))',
      }
  const statusTone =
    profile.privacy.showOnlineStatus && profile.status === 'online'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : isDark
        ? 'border-white/10 bg-white/10 text-slate-300'
        : 'border-slate-200 bg-slate-100 text-slate-600'

  return (
    <section
      className={
        isDark
          ? 'overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl'
          : 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70'
      }
    >
      <div
        className="h-44 bg-slate-200 bg-cover bg-center md:h-64"
        style={coverStyle}
      />

      <div className="px-5 pb-6 md:px-8 md:pb-8">
        <div className="-mt-16 flex flex-col gap-5 md:-mt-20 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-600 to-cyan-500 text-4xl font-bold text-white shadow-lg md:h-40 md:w-40">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                initialsFromName(profile.name)
              )}
            </div>

            <div className="pb-1">
              <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${statusTone}`}>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    profile.privacy.showOnlineStatus && profile.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                {profile.privacy.showOnlineStatus ? profile.status : 'Status hidden'}
              </div>
              <h1 className={`text-3xl font-bold tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {profile.name}
              </h1>
              <p className={`mt-1 text-lg font-semibold ${isDark ? 'text-cyan-300' : 'text-indigo-600'}`}>
                @{profile.username}
              </p>
            </div>
          </div>

          {onEdit && (
            <Button onClick={onEdit} className="gap-2 self-start md:self-end">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className={`max-w-3xl text-base leading-7 md:text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {profile.bio}
            </p>
            <div className={`mt-5 flex flex-wrap gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {profile.location && (
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <MapPin className={`h-4 w-4 ${isDark ? 'text-cyan-300' : 'text-slate-500'}`} />
                  {profile.location}
                </span>
              )}
              {profile.privacy.showEmail && (
                <a
                  href={`mailto:${profile.email}`}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${
                    isDark ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Mail className={`h-4 w-4 ${isDark ? 'text-cyan-300' : 'text-slate-500'}`} />
                  {profile.email}
                </a>
              )}
              {profile.privacy.allowMessages && (
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 font-semibold text-cyan-700">
                  <MessageCircle className="h-4 w-4" />
                  Messages open
                </span>
              )}
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`mb-3 text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Connected profiles
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleSocials.length ? (
                visibleSocials.map((item) => {
                  const Icon = item.icon
                  const href = profile.socials[item.key] || '#'
                  return (
                    <a
                      key={item.key}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                        isDark
                          ? 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  )
                })
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No social links connected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfileHeader
