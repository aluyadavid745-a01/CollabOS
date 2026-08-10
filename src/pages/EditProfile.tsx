import React from 'react'
import { ArrowLeft, Camera, Github, Globe, Instagram, Linkedin, Plus, Trash2, Twitter, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import PrivacySettings from '../components/PrivacySettings'
import ProfileHeader from '../components/ProfileHeader'
import { useAuth } from '../context/AuthContext'
import type { ProfileProject, UserProfile } from '../types/profile'
import { createDefaultProfile } from '../types/profile'
import { showToast } from '../utils/toast'

const emptyProject = (): ProfileProject => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  role: '',
  technologies: [],
  link: '',
  status: 'Active',
})

const splitTags = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const socialFields: Array<{
  key: keyof UserProfile['socials']
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'website', label: 'Personal website', icon: Globe },
]

const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
const panelTitleClass = 'text-xl font-bold text-slate-950'
const labelClass = 'text-sm font-bold text-slate-700'
const inputClass =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500'
const uploadClass = 'block rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4'
const uploadTextClass = 'flex items-center gap-2 font-bold text-slate-800'
const removeButtonClass =
  'rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600'

interface ChipEditorProps {
  label: string
  items: string[]
  placeholder: string
  onChange: (items: string[]) => void
}

const ChipEditor: React.FC<ChipEditorProps> = ({ label, items, placeholder, onChange }) => {
  const [value, setValue] = React.useState('')

  const addItem = () => {
    const nextItem = value.trim()
    if (!nextItem || items.includes(nextItem)) return
    onChange([...items, nextItem])
    setValue('')
  }

  return (
    <section className={panelClass}>
      <h2 className={panelTitleClass}>{label}</h2>
      <div className="mt-4 flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addItem()
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={addItem}
          className="grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-white transition-transform hover:scale-105"
          aria-label={`Add ${label}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((current) => current !== item))}
              className="text-slate-500 hover:text-red-600"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </section>
  )
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate()
  const { firebaseUser, profile, loading, saveProfile, uploadProfileAsset } = useAuth()
  const createBlankDraft = React.useCallback(
    () =>
      createDefaultProfile(
        firebaseUser
          ? {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'CollabOS User',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
            }
          : undefined
      ),
    [firebaseUser]
  )
  const [draft, setDraft] = React.useState<UserProfile>(() => profile || createBlankDraft())
  const [saving, setSaving] = React.useState(false)
  const [isDirty, setIsDirty] = React.useState(false)
  const [saveMessage, setSaveMessage] = React.useState('')

  React.useEffect(() => {
    if (!isDirty) setDraft(profile || createBlankDraft())
  }, [createBlankDraft, isDirty, profile])

  const updateDraft = <Key extends keyof UserProfile>(key: Key, value: UserProfile[Key]) => {
    setIsDirty(true)
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleImageUpload = async (file: File | undefined, kind: 'profile' | 'cover') => {
    if (!file) return
    try {
      const url = await uploadProfileAsset(file, kind)
      updateDraft(kind === 'profile' ? 'photoURL' : 'coverURL', url)
      setSaveMessage('Image added. Save your profile to keep it.')
    } catch {
      setSaveMessage('Could not load that image.')
    }
  }

  const handleProjectImageUpload = async (projectId: string, file: File | undefined) => {
    if (!file) return
    try {
      const url = await uploadProfileAsset(file, 'project')
      updateDraft(
        'projects',
        draft.projects.map((project) => (project.id === projectId ? { ...project, imageURL: url } : project))
      )
      setSaveMessage('Project image added. Save your profile to keep it.')
    } catch {
      setSaveMessage('Could not load that project image.')
    }
  }

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault()

    setSaving(true)
    setSaveMessage('')

    try {
      await saveProfile({
        ...draft,
        username: draft.username.replace(/^@/, '').trim() || 'collabosuser',
        name: draft.name.trim(),
        email: draft.email.trim(),
        updatedAt: new Date().toISOString(),
      })
      setIsDirty(false)
      showToast({ message: 'Profile saved locally. Cloud sync continues in the background.', type: 'success' })
      navigate('/profile')
    } catch {
      setSaveMessage('Profile was saved on this device, but cloud sync did not finish. Try again when your connection is stable.')
      showToast({ message: 'Profile saved locally.', type: 'success' })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center text-sm font-bold text-slate-700">
        Syncing your profile...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </button>
          {loading && (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
              Syncing profile...
            </span>
          )}
        </div>

        {saveMessage && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {saveMessage}
          </p>
        )}

        <form onSubmit={saveDraft} className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <ProfileHeader profile={draft} onEdit={() => undefined} />

            <section className={panelClass}>
              <h2 className={panelTitleClass}>Personal information</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Full name</span>
                  <input
                    value={draft.name}
                    onChange={(event) => updateDraft('name', event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Username</span>
                  <input
                    value={draft.username}
                    onChange={(event) => updateDraft('username', event.target.value.replace(/^@/, ''))}
                    className={inputClass}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className={labelClass}>Bio</span>
                  <textarea
                    value={draft.bio}
                    onChange={(event) => updateDraft('bio', event.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Location</span>
                  <input
                    value={draft.location}
                    onChange={(event) => updateDraft('location', event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Website</span>
                  <input
                    value={draft.website}
                    onChange={(event) => {
                      updateDraft('website', event.target.value)
                      updateDraft('socials', { ...draft.socials, website: event.target.value })
                    }}
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            <section className={panelClass}>
              <h2 className={panelTitleClass}>Social links</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {socialFields.map(({ key, label, icon: SocialIcon }) => {
                  return (
                    <label key={key} className="block">
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <SocialIcon className="h-4 w-4" />
                        {label}
                      </span>
                      <input
                        value={draft.socials[key] || ''}
                        onChange={(event) =>
                          updateDraft('socials', {
                            ...draft.socials,
                            [key]: event.target.value,
                          })
                        }
                        className={inputClass}
                        placeholder="https://"
                      />
                    </label>
                  )
                })}
              </div>
            </section>

            <section className={panelClass}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className={panelTitleClass}>Projects showcase</h2>
                <Button type="button" size="sm" onClick={() => updateDraft('projects', [...draft.projects, emptyProject()])}>
                  Add project
                </Button>
              </div>
              <div className="space-y-4">
                {draft.projects.map((project, index) => (
                  <div key={project.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex justify-between gap-3">
                      <p className="font-bold text-slate-900">Project {index + 1}</p>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft(
                            'projects',
                            draft.projects.filter((current) => current.id !== project.id)
                          )
                        }
                        className="text-slate-500 hover:text-red-600"
                        aria-label="Remove project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        ['name', 'Project name'],
                        ['role', 'Role'],
                        ['link', 'Project link'],
                      ].map(([field, label]) => (
                        <label key={field} className="block">
                          <span className={labelClass}>{label}</span>
                          <input
                            value={project[field as keyof ProfileProject] as string}
                            onChange={(event) => {
                              const nextProjects = draft.projects.map((current) =>
                                current.id === project.id ? { ...current, [field]: event.target.value } : current
                              )
                              updateDraft('projects', nextProjects)
                            }}
                            className={inputClass}
                          />
                        </label>
                      ))}
                      <label className="block">
                        <span className={labelClass}>Status</span>
                        <select
                          value={project.status}
                          onChange={(event) => {
                            const nextProjects = draft.projects.map((current) =>
                              current.id === project.id
                                ? { ...current, status: event.target.value as ProfileProject['status'] }
                                : current
                            )
                            updateDraft('projects', nextProjects)
                          }}
                          className={inputClass}
                        >
                          <option>Active</option>
                          <option>Completed</option>
                        </select>
                      </label>
                      <label className="block md:col-span-2">
                        <span className={labelClass}>Description</span>
                        <textarea
                          value={project.description}
                          onChange={(event) => {
                            const nextProjects = draft.projects.map((current) =>
                              current.id === project.id ? { ...current, description: event.target.value } : current
                            )
                            updateDraft('projects', nextProjects)
                          }}
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className={labelClass}>Technologies</span>
                        <input
                          value={project.technologies.join(', ')}
                          onChange={(event) => {
                            const nextProjects = draft.projects.map((current) =>
                              current.id === project.id
                                ? { ...current, technologies: splitTags(event.target.value) }
                                : current
                            )
                            updateDraft('projects', nextProjects)
                          }}
                          className={inputClass}
                          placeholder="React, Firebase, Tailwind"
                        />
                      </label>
                      <label className={`${uploadClass} md:col-span-2`}>
                        <span className={uploadTextClass}>
                          <Camera className="h-4 w-4" />
                          Project image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleProjectImageUpload(project.id, event.target.files?.[0])}
                          className="mt-3 w-full text-sm text-slate-500"
                        />
                        {project.imageURL && (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft(
                                'projects',
                                draft.projects.map((current) =>
                                  current.id === project.id ? { ...current, imageURL: '' } : current
                                )
                              )
                            }
                            className="mt-3 text-sm font-bold text-red-600 hover:text-red-700"
                          >
                            Remove project image
                          </button>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className={panelClass}>
              <h2 className={panelTitleClass}>Profile images</h2>
              <div className="mt-5 space-y-4">
                <label className={uploadClass}>
                  <span className={uploadTextClass}>
                    <Camera className="h-4 w-4" />
                    Upload profile picture
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event.target.files?.[0], 'profile')}
                    className="mt-3 w-full text-sm text-slate-500"
                  />
                </label>
                <label className={uploadClass}>
                  <span className={uploadTextClass}>
                    <Camera className="h-4 w-4" />
                    Change cover image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event.target.files?.[0], 'cover')}
                    className="mt-3 w-full text-sm text-slate-500"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateDraft('photoURL', '')}
                    className={removeButtonClass}
                  >
                    Remove avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft('coverURL', '')}
                    className={removeButtonClass}
                  >
                    Remove cover
                  </button>
                </div>
              </div>
            </section>

            <ChipEditor
              label="Skills"
              items={draft.skills}
              placeholder="Add React, Firebase..."
              onChange={(items) => updateDraft('skills', items)}
            />
            <ChipEditor
              label="Interests"
              items={draft.interests}
              placeholder="Add startups, design..."
              onChange={(items) => updateDraft('interests', items)}
            />
            <PrivacySettings
              settings={draft.privacy}
              onChange={(settings) => updateDraft('privacy', settings)}
            />

            <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  )
}

export default EditProfile
