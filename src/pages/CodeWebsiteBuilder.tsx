import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { getWebsiteProject, saveWebsiteProject } from '../utils/websiteBuilderStorage'
import type { BuilderElement, WebsiteProject } from '../types/websiteBuilder'

type CodeTab = 'html' | 'css' | 'js'
type CodeState = Record<CodeTab, string>

const tabs: CodeTab[] = ['html', 'css', 'js']

const fallbackCode: CodeState = {
  html: '<main class="page">\n  <h1>Custom code website</h1>\n  <p>Start writing HTML, CSS, and JavaScript in CollabOS.</p>\n  <button id="demoButton">Click me</button>\n</main>',
  css: 'body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #0f172a; }\n.page { padding: 64px; }\nbutton { border: 0; border-radius: 12px; padding: 12px 18px; background: #4f46e5; color: white; font-weight: 800; }',
  js: 'document.getElementById("demoButton")?.addEventListener("click", () => alert("JavaScript works."));',
}

const buildSrcDoc = ({ html, css, js }: CodeState) => `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      try {
        ${js}
      } catch (error) {
        document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;left:16px;right:16px;bottom:16px;padding:12px;border-radius:12px;background:#fee2e2;color:#991b1b;white-space:pre-wrap;font-family:monospace;z-index:99999;">JS Error: ' + String(error.message || error) + '</pre>');
      }
    </script>
</body>
</html>`

const getCodeElement = (project: WebsiteProject | null) =>
  project?.pages?.[0]?.elements?.find((element) => element.type === 'html') || project?.pages?.[0]?.elements?.[0]

const createFallbackCodeElement = (): BuilderElement => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `html-${Date.now()}`,
  type: 'html',
  name: 'Code Website',
  content: {},
  style: {},
})

const CodeWebsiteBuilder: React.FC = () => {
  const { siteId } = useParams()
  const [project, setProject] = React.useState<WebsiteProject | null>(null)
  const [activeTab, setActiveTab] = React.useState<CodeTab>('html')
  const [code, setCode] = React.useState<CodeState>(fallbackCode)
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState('idle')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const load = async () => {
      if (!siteId) return
      setLoading(true)
      const nextProject = await getWebsiteProject(siteId)
      const codeElement = getCodeElement(nextProject)

      if (!nextProject) {
        setError('Code website not found.')
        setLoading(false)
        return
      }

      setProject(nextProject)
      setCode({
        html: codeElement?.content?.html || fallbackCode.html,
        css: codeElement?.content?.css || fallbackCode.css,
        js: codeElement?.content?.js || fallbackCode.js,
      })
      setLoading(false)
    }

    load()
  }, [siteId])

  const updateProjectFromCode = React.useCallback(
    (nextCode: CodeState): WebsiteProject | null => {
      if (!project) return null
      const nextProject = structuredClone(project)
      const page = nextProject.pages[0]
      if (!page) return null
      const codeIndex = page.elements.findIndex((element) => element.type === 'html')
      const targetIndex = codeIndex >= 0 ? codeIndex : page.elements.length
      const target = page.elements[targetIndex] || createFallbackCodeElement()

      page.elements[targetIndex] = {
        ...target,
        type: 'html',
        name: 'Code Website',
        content: {
          ...target.content,
          html: nextCode.html,
          css: nextCode.css,
          js: nextCode.js,
        },
        style: {
          ...(target.style || {}),
          width: '100%',
          minHeight: '720px',
          padding: '0',
          background: 'transparent',
          borderWidth: '0',
          shadow: 'none',
        },
      }

      nextProject.updatedAt = new Date().toISOString()
      return nextProject
    },
    [project]
  )

  React.useEffect(() => {
    if (!project || loading) return
    setStatus('editing')
    const timeout = window.setTimeout(async () => {
      const nextProject = updateProjectFromCode(code)
      if (!nextProject) return
      setStatus('saving')
      setProject(nextProject)
      await saveWebsiteProject(nextProject)
      setStatus('saved')
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [code, loading, project, updateProjectFromCode])

  const saveNow = async () => {
    const nextProject = updateProjectFromCode(code)
    if (!nextProject) return
    setStatus('saving')
    setProject(nextProject)
    await saveWebsiteProject(nextProject)
    setStatus('saved')
  }

  const togglePublish = async () => {
    const nextProject = updateProjectFromCode(code)
    if (!nextProject) return
    const published = nextProject.status !== 'published'
    nextProject.status = published ? 'published' : 'draft'
    nextProject.publishedAt = published ? new Date().toISOString() : undefined
    setProject(nextProject)
    await saveWebsiteProject(nextProject)
    setStatus('saved')
  }

  const exportHtml = () => {
    const blob = new Blob([buildSrcDoc(code)], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'collabos-code-site'}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-bold text-slate-500">Opening code builder...</main>
  if (error || !project) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-bold text-slate-600">{error || 'Code website not found.'}</main>

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-950">
      <header className="flex min-h-[64px] flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-indigo-600">HTML CSS JS Builder</p>
          <h1 className="text-lg font-black">{project.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{status}</span>
          <button type="button" onClick={saveNow} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Save</button>
          <button type="button" onClick={togglePublish} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700">{project.status === 'published' ? 'Unpublish' : 'Publish'}</button>
          <button type="button" onClick={exportHtml} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Export HTML</button>
          <Link to={`/builder/${project.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Visual editor</Link>
          <Link to={`/preview/${project.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Preview</Link>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[520px_1fr]">
        <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex border-b border-slate-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-black uppercase tracking-wider ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <textarea
            value={code[activeTab]}
            onChange={(event) => setCode((current) => ({ ...current, [activeTab]: event.target.value }))}
            spellCheck={false}
            className="min-h-0 flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none"
          />
        </section>

        <section className="min-h-0 overflow-auto bg-slate-100 p-4">
          <iframe
            title="Code website preview"
            srcDoc={buildSrcDoc(code)}
            sandbox="allow-scripts allow-forms"
            className="h-full min-h-[720px] w-full rounded-2xl border border-slate-200 bg-white shadow-xl"
          />
        </section>
      </div>
    </main>
  )
}

export default CodeWebsiteBuilder
