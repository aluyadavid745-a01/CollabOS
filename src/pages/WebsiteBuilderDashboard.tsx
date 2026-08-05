import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import {
  createAiWebsiteProjectInstant,
  createCodeWebsiteProjectInstant,
  createWebsiteVersion,
  createWebsiteProjectInstant,
  createWebsiteProjectFromTemplateInstant,
  deleteWebsiteProject,
  duplicateWebsiteProject,
  exportWebsiteProject,
  getPublicWebsiteUrl,
  getWebsiteStorageTarget,
  listCachedWebsiteProjects,
  listWebsiteProjects,
  saveWebsiteProject,
} from '../utils/websiteBuilderStorage'
import type { WebsiteProject } from '../types/websiteBuilder'
import { useAuth } from '../context/AuthContext'
import { templateCatalog } from '../data/websiteProjectFactory'
import type { AiWebsiteStyle } from '../data/aiWebsiteGenerator'
import { prefetchRoute, prefetchRoutes, prefetchRoutesOnIdle } from '../utils/prefetch'

const aiPromptExamples = [
  'Modern SaaS landing page for a team productivity app',
  'Premium portfolio website for a full-stack developer',
  'Restaurant website for a cozy Italian kitchen',
]

const aiStyles: Array<{ value: AiWebsiteStyle; label: string }> = [
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'premium', label: 'Premium' },
]

const WebsiteBuilderDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const [websites, setWebsites] = React.useState<WebsiteProject[]>(() => listCachedWebsiteProjects())
  const [loading, setLoading] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState('Modern SaaS landing page for a team productivity app')
  const [aiStyle, setAiStyle] = React.useState<AiWebsiteStyle>('modern')
  const [error, setError] = React.useState('')
  const [notice, setNotice] = React.useState('')
  const [storageTarget, setStorageTarget] = React.useState<'cloud' | 'local'>('local')

  const getSignedInOwnerId = () => {
    if (!firebaseUser) {
      setError('Sign in before creating or editing websites.')
      return null
    }

    return firebaseUser.uid
  }

  const loadWebsites = React.useCallback(async () => {
    setLoading(true)
    try {
      const [projects, target] = await Promise.all([listWebsiteProjects(), getWebsiteStorageTarget()])
      setWebsites(projects)
      setStorageTarget(target)
      setError('')
    } catch {
      setError('Could not load websites.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const runSync = () => loadWebsites()

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(runSync, { timeout: 1800 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = globalThis.setTimeout(runSync, 800)
    return () => globalThis.clearTimeout(timeoutId)
  }, [loadWebsites])

  React.useEffect(() => prefetchRoutesOnIdle(['websiteEditor', 'websitePreview', 'codeBuilder', 'aiBuilder'], 1200), [])

  const createSite = async () => {
    setCreating(true)
    setError('')
    setNotice('')

    try {
      const ownerId = getSignedInOwnerId()
      if (!ownerId) return
      const project = createWebsiteProjectInstant(ownerId)
      navigate(`/builder/${project.id}`)
    } catch {
      setError('Could not create a website. Check Firebase rules or try again.')
    } finally {
      setCreating(false)
    }
  }

  const createFromTemplate = async (templateId: string) => {
    setCreating(true)
    setError('')
    setNotice('')

    try {
      const ownerId = getSignedInOwnerId()
      if (!ownerId) return
      const project = createWebsiteProjectFromTemplateInstant(templateId, ownerId)
      navigate(`/builder/${project.id}`)
    } catch {
      setError('Could not create a website from this template. Try again.')
    } finally {
      setCreating(false)
    }
  }

  const generateAiWebsite = () => {
    const prompt = aiPrompt.trim()

    if (!prompt) {
      setError('Describe the website you want AI to create.')
      return
    }

    setCreating(true)
    setError('')
    setNotice('')

    try {
      const ownerId = getSignedInOwnerId()
      if (!ownerId) return
      const project = createAiWebsiteProjectInstant(prompt, aiStyle, ownerId)
      navigate(`/builder/${project.id}/ai`)
    } catch {
      setError('Could not generate this website. Try a shorter prompt.')
    } finally {
      setCreating(false)
    }
  }

  const generateFirebaseAiWebsite = () => {
    const prompt = aiPrompt.trim()

    if (!prompt) {
      setError('Describe the website you want AI to create.')
      return
    }

    setCreating(true)
    setError('')
    setNotice('')

    try {
      const ownerId = getSignedInOwnerId()
      if (!ownerId) return
      const project = createAiWebsiteProjectInstant(prompt, aiStyle, ownerId)
      navigate(`/builder/${project.id}/ai?enhance=1&style=${aiStyle}&prompt=${encodeURIComponent(prompt)}`)
    } catch {
      setError('Could not start the AI builder. Try a shorter prompt.')
    } finally {
      setCreating(false)
    }
  }

  const createCodeWebsite = () => {
    setCreating(true)
    setError('')
    setNotice('')

    try {
      const ownerId = getSignedInOwnerId()
      if (!ownerId) return
      const project = createCodeWebsiteProjectInstant(ownerId)
      navigate(`/builder/${project.id}/code`)
    } catch {
      setError('Could not create a code website. Try again.')
    } finally {
      setCreating(false)
    }
  }

  const togglePublish = async (project: WebsiteProject) => {
    const action = project.status === 'published' ? 'unpublish' : 'publish'
    if (!window.confirm(`Are you sure you want to ${action} "${project.name}"?`)) return

    await saveWebsiteProject({
      ...project,
      status: project.status === 'published' ? 'draft' : 'published',
      publishedAt: project.status === 'published' ? undefined : new Date().toISOString(),
    })
    loadWebsites()
  }

  const copyShareLink = async (project: WebsiteProject) => {
    let nextProject = project
    if (project.status !== 'published') {
      nextProject = {
        ...project,
        status: 'published',
        publishedAt: new Date().toISOString(),
      }
      await saveWebsiteProject(nextProject)
    }

    const url = getPublicWebsiteUrl(nextProject.id)
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Public website link copied.')
    } catch {
      setNotice(url)
    }
    loadWebsites()
  }

  const saveRestorePoint = async (project: WebsiteProject) => {
    await createWebsiteVersion(project, `Dashboard restore point ${new Date().toLocaleString()}`)
    setNotice('Restore point saved.')
    loadWebsites()
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">Dashboard → Website Builder</p>
            <h1 className="mt-2 text-4xl font-black">Create a website</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Start with AI, a template, or custom code, then edit, preview, publish, and export from one workspace.</p>
            <p className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
              {storageTarget === 'cloud' ? 'Saving website projects to Firebase' : 'Saving website projects locally on this device'}
            </p>
          </div>
          <Button type="button" onClick={createSite} disabled={creating}>
            {creating ? 'Creating...' : 'Create website'}
          </Button>
        </div>

        {loading && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
            Syncing website projects...
          </div>
        )}

        {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{notice}</p>}
        {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}

        <section className="mb-8 overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-5 md:p-7">
              <p className="text-sm font-black uppercase tracking-wider text-indigo-600">AI Website Builder</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Generate a website from one prompt</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Phase 1 uses a fast local generator, so it works instantly without an API key. The result opens in the drag-and-drop editor.
              </p>

              <textarea
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                className="mt-5 min-h-[112px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-indigo-400 focus:bg-white"
                placeholder="Describe the website you want to build..."
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {aiStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setAiStyle(style.value)}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${aiStyle === style.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={generateAiWebsite}
                  disabled={creating}
                  onMouseEnter={() => prefetchRoute('aiBuilder')}
                  onFocus={() => prefetchRoute('aiBuilder')}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Fast draft
                </button>
                <Button type="button" onClick={generateFirebaseAiWebsite} disabled={creating} onMouseEnter={() => prefetchRoute('aiBuilder')} onFocus={() => prefetchRoute('aiBuilder')}>
                  {creating ? 'Generating...' : 'Generate with Firebase AI'}
                </Button>
              </div>
            </div>

            <div className="border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 md:p-7 lg:border-l lg:border-t-0">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Try prompts</p>
              <div className="mt-3 grid gap-3">
                {aiPromptExamples.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setAiPrompt(prompt)}
                    className="rounded-2xl border border-white bg-white/80 p-4 text-left text-sm font-bold leading-6 text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-300/60">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-5 md:p-7">
              <p className="text-sm font-black uppercase tracking-wider text-cyan-300">Code Website Builder</p>
              <h2 className="mt-2 text-3xl font-black">Build with HTML, CSS, and JavaScript</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Write custom code inside CollabOS, preview it live, save it to your websites, publish it, and export one complete HTML file.
              </p>
              <Button type="button" className="mt-5" onClick={createCodeWebsite} disabled={creating} onMouseEnter={() => prefetchRoute('codeBuilder')} onFocus={() => prefetchRoute('codeBuilder')}>
                {creating ? 'Creating...' : 'Start coding'}
              </Button>
            </div>
            <div className="border-t border-white/10 bg-black/20 p-5 md:p-7 lg:border-l lg:border-t-0">
              <pre className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{`<section class="hero">
  <h1>Your custom site</h1>
  <button id="cta">Launch</button>
</section>

<script>
  cta.onclick = () => alert("Built in CollabOS")
</script>`}
              </pre>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Start from a template</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a professional layout, then edit every section in the builder.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {templateCatalog.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => createFromTemplate(template.id)}
                onMouseEnter={() => prefetchRoute('websiteEditor')}
                onFocus={() => prefetchRoute('websiteEditor')}
                disabled={creating}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className={`grid aspect-video place-items-center bg-gradient-to-br ${template.accent} text-white`}>
                  <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider">Template</span>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-slate-950">{template.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
                  <span className="mt-4 inline-flex text-sm font-bold text-indigo-600">Use template →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {!websites.length ? (
          <section className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div>
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white">
                <span className="text-xl font-black">W</span>
              </div>
              <h2 className="text-2xl font-black">No websites yet</h2>
              <p className="mt-2 text-slate-600">Start with a professional starter website and customize it visually.</p>
              <Button type="button" className="mt-6" onClick={createSite} disabled={creating}>
                {creating ? 'Creating...' : 'Create your first website'}
              </Button>
            </div>
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {websites.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                <div className="grid aspect-video place-items-center bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-100">Website</span>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">{project.name}</h2>
                      <p className="text-sm text-slate-500">{project.description}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${project.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Last edited {new Date(project.updatedAt).toLocaleDateString()}</p>
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    <button type="button" onMouseEnter={() => prefetchRoutes(['websiteEditor', 'websitePreview'])} onFocus={() => prefetchRoutes(['websiteEditor', 'websitePreview'])} onClick={() => navigate(`/builder/${project.id}`)} className="rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Edit</button>
                    <button type="button" onMouseEnter={() => prefetchRoute('websitePreview')} onFocus={() => prefetchRoute('websitePreview')} onClick={() => navigate(`/preview/${project.id}`)} className="rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Preview</button>
                    <button type="button" onClick={async () => { await duplicateWebsiteProject(project); loadWebsites() }} className="rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Copy</button>
                    <button type="button" onClick={() => exportWebsiteProject(project)} className="rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Export</button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button type="button" size="sm" onClick={() => togglePublish(project)}>{project.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
                    <Button type="button" variant="secondary" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => copyShareLink(project)}>Share</Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => saveRestorePoint(project)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                      Save version
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return
                        await deleteWebsiteProject(project.id)
                        loadWebsites()
                      }}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default WebsiteBuilderDashboard
