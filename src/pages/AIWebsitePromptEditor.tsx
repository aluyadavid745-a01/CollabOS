import React from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ElementRenderer from '../components/WebsiteBuilder/ElementRenderer'
import { applyLocalPromptEdit, editWebsiteWithFirebaseAiResult, refineWebsiteWithFirebaseAiResult } from '../services/firebaseAiWebsite'
import type { AiWebsiteStyle } from '../data/aiWebsiteGenerator'
import type { WebsiteProject } from '../types/websiteBuilder'
import { getWebsiteProject, saveWebsiteProject } from '../utils/websiteBuilderStorage'

const starterPrompts = [
  'Make this feel like a premium SaaS homepage with sharper copy.',
  'Change it into a luxury hotel website with elegant colors.',
  'Add pricing and FAQ sections with confident conversion copy.',
  'Make the design minimal, clean, and more professional.',
]

const AIWebsitePromptEditor: React.FC = () => {
  const { siteId } = useParams()
  const [searchParams] = useSearchParams()
  const [project, setProject] = React.useState<WebsiteProject | null>(null)
  const [instruction, setInstruction] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [refining, setRefining] = React.useState(false)
  const [error, setError] = React.useState('')
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: 'Tell me what to change. I will update the website design, copy, layout, SEO, and sections from your prompt.' },
  ])
  const enhancedOnce = React.useRef(false)

  React.useEffect(() => {
    const loadProject = async () => {
      if (!siteId) return
      setLoading(true)
      const nextProject = await getWebsiteProject(siteId)
      setProject(nextProject)
      setError(nextProject ? '' : 'Website not found.')
      setLoading(false)
    }

    loadProject()
  }, [siteId])

  React.useEffect(() => {
    const shouldEnhance = searchParams.get('enhance') === '1'
    const prompt = searchParams.get('prompt') || ''
    const style = (searchParams.get('style') || 'modern') as AiWebsiteStyle

    if (!project || !shouldEnhance || !prompt || enhancedOnce.current) return
    enhancedOnce.current = true

    setRefining(true)
    setMessages((current) => [...current, { role: 'user', text: prompt }, { role: 'ai', text: 'I opened a premium draft instantly. I will apply Firebase AI upgrades automatically when the Firebase AI SDK is available.' }])

    refineWebsiteWithFirebaseAiResult(project, prompt, style)
      .then(async ({ project: updatedProject, source }) => {
        if (source === 'local') {
          setProject(updatedProject)
          void saveWebsiteProject(updatedProject)
          setMessages((current) => [...current, { role: 'ai', text: 'Firebase AI was unavailable, so I kept the fast local draft ready for editing.' }])
        } else if (updatedProject.updatedAt !== project.updatedAt) {
          setProject(updatedProject)
          void saveWebsiteProject(updatedProject)
          setMessages((current) => [...current, { role: 'ai', text: 'Firebase AI refinement finished. The preview has been upgraded.' }])
        } else {
          setMessages((current) => [...current, { role: 'ai', text: 'Your editable premium draft is ready.' }])
        }
      })
      .catch(() => {
        setMessages((current) => [...current, { role: 'ai', text: 'Your editable premium draft is ready.' }])
      })
      .finally(() => setRefining(false))
  }, [project, searchParams])

  const runEdit = async (nextInstruction = instruction) => {
    const cleanInstruction = nextInstruction.trim()
    if (!project || !cleanInstruction) return

    const localProject = applyLocalPromptEdit(project, cleanInstruction)
    setProject(localProject)
    void saveWebsiteProject(localProject)
    setRefining(true)
    setInstruction('')
    setMessages((current) => [...current, { role: 'user', text: cleanInstruction }, { role: 'ai', text: 'Applied the update instantly.' }])

    editWebsiteWithFirebaseAiResult(localProject, cleanInstruction)
      .then(({ project: updatedProject, source }) => {
        if (source === 'local') {
          setProject(updatedProject)
          void saveWebsiteProject(updatedProject)
          setMessages((current) => [...current, { role: 'ai', text: 'Firebase AI was unavailable, so the local update remains applied and ready to edit.' }])
        } else if (updatedProject.updatedAt !== localProject.updatedAt) {
          setProject(updatedProject)
          void saveWebsiteProject(updatedProject)
          setMessages((current) => [...current, { role: 'ai', text: 'Done. Firebase AI finished the premium version.' }])
        } else {
          setMessages((current) => [...current, { role: 'ai', text: 'The website is updated and ready to keep editing.' }])
        }
      })
      .catch(() => {
        setMessages((current) => [...current, { role: 'ai', text: 'The website is updated and ready to keep editing.' }])
      })
      .finally(() => setRefining(false))
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-bold text-slate-500">Opening AI builder...</main>
  }

  if (!project || error) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-bold text-slate-600">{error || 'Website not found.'}</main>
  }

  const elements = project.pages[0]?.elements || []

  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-950 lg:grid-cols-[420px_1fr]">
      <aside className="flex max-h-screen flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-indigo-600">Firebase AI Website Builder</p>
          <h1 className="mt-2 text-2xl font-black">{project.name}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Edit this website with prompts. The visual editor is still available when you need precise manual control.</p>
          <div className="mt-4 flex gap-2">
            <Link to={`/builder/${project.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Visual editor</Link>
            <Link to={`/preview/${project.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Preview</Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`rounded-2xl p-3 text-sm leading-6 ${message.role === 'user' ? 'ml-8 bg-indigo-600 text-white' : 'mr-8 border border-slate-200 bg-slate-50 text-slate-700'}`}>
              {message.text}
            </div>
          ))}
          {refining && <div className="mr-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-sm font-bold text-indigo-700">Checking for Firebase AI upgrade...</div>}
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => runEdit(prompt)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">
                {prompt}
              </button>
            ))}
          </div>
          <textarea
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') runEdit()
            }}
            className="min-h-[104px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-indigo-400 focus:bg-white"
            placeholder="Example: Make it a premium fintech landing page with trust badges, pricing, and stronger CTA copy."
          />
          <button type="button" onClick={() => runEdit()} disabled={!instruction.trim()} className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {refining ? 'Apply another prompt' : 'Update with AI'}
          </button>
        </div>
      </aside>

      <section className="max-h-screen overflow-auto bg-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/70">
          {elements.map((element) => (
            <ElementRenderer key={element.id} element={element} breakpoint="desktop" preview />
          ))}
        </div>
      </section>
    </main>
  )
}

export default AIWebsitePromptEditor
