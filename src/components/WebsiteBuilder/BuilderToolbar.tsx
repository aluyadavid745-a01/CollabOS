import React from 'react'
import { Clock3, Download, Eye, Globe2, Link2, Redo2, Save, Undo2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Common/Button'
import { useWebsiteBuilder } from '../../context/WebsiteBuilderContext'
import {
  createWebsiteVersion,
  exportWebsiteProject,
  getPublicWebsiteUrl,
  restoreWebsiteVersion,
  saveWebsiteProjectWithStatus,
} from '../../utils/websiteBuilderStorage'

const BuilderToolbar: React.FC = () => {
  const navigate = useNavigate()
  const { state, dispatch } = useWebsiteBuilder()
  const project = state.project
  const [versionsOpen, setVersionsOpen] = React.useState(false)
  const [shareMessage, setShareMessage] = React.useState('')

  const save = async () => {
    if (!project) return
    dispatch({ type: 'SET_STATUS', status: 'saving' })
    try {
      const result = await saveWebsiteProjectWithStatus(project)
      dispatch({ type: 'SET_STATUS', status: 'saved', saveTarget: result.target })
    } catch {
      dispatch({ type: 'SET_STATUS', status: 'error' })
    }
  }

  const publish = async () => {
    if (!project) return
    const nextStatus: 'draft' | 'published' = project.status === 'published' ? 'draft' : 'published'
    const nextProject = {
      ...project,
      status: nextStatus,
      publishedAt: nextStatus === 'published' ? new Date().toISOString() : undefined,
    }

    dispatch({ type: 'SET_PROJECT', project: nextProject, status: 'saving' })

    try {
      const result = await saveWebsiteProjectWithStatus(nextProject)
      dispatch({ type: 'SET_STATUS', status: 'saved', saveTarget: result.target })
    } catch {
      dispatch({ type: 'SET_STATUS', status: 'error' })
    }
  }

  const copyPublicUrl = async () => {
    if (!project) return
    let nextProject = project

    if (project.status !== 'published') {
      nextProject = {
        ...project,
        status: 'published',
        publishedAt: new Date().toISOString(),
      }
      dispatch({ type: 'SET_PROJECT', project: nextProject, status: 'saving' })
      const result = await saveWebsiteProjectWithStatus(nextProject)
      dispatch({ type: 'SET_STATUS', status: 'saved', saveTarget: result.target })
    }

    const url = getPublicWebsiteUrl(nextProject.id)
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('Public link copied')
    } catch {
      setShareMessage(url)
    }
    window.setTimeout(() => setShareMessage(''), 2400)
  }

  const saveVersion = async () => {
    if (!project) return
    dispatch({ type: 'SET_STATUS', status: 'saving' })
    try {
      const savedProject = await createWebsiteVersion(project, `Restore point ${new Date().toLocaleString()}`)
      dispatch({ type: 'SET_PROJECT', project: savedProject, status: 'saved' })
    } catch {
      dispatch({ type: 'SET_STATUS', status: 'error' })
    }
  }

  const restoreVersion = async (versionId: string) => {
    if (!project) return
    if (!window.confirm('Restore this version? Current changes will become a draft.')) return
    dispatch({ type: 'SET_STATUS', status: 'saving' })
    try {
      const restored = await restoreWebsiteVersion(project, versionId)
      dispatch({ type: 'SET_PROJECT', project: restored, status: 'saved' })
      setVersionsOpen(false)
    } catch {
      dispatch({ type: 'SET_STATUS', status: 'error' })
    }
  }

  const statusLabel = () => {
    if (state.status === 'saving') return 'Saving...'
    if (state.status === 'dirty') return 'Unsaved changes'
    if (state.status === 'error') return 'Save failed'
    if (state.status === 'saved' && state.saveTarget === 'cloud') return 'Saved to cloud'
    if (state.status === 'saved' && state.saveTarget === 'local') return 'Saved locally'
    return 'Ready'
  }

  return (
    <header className="flex min-h-[64px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
      <div className="min-w-0">
        <input
          value={project?.name || ''}
          onChange={(event) => dispatch({ type: 'UPDATE_PROJECT_META', patch: { name: event.target.value } })}
          className="w-full truncate text-lg font-black text-slate-950 outline-none"
        />
        <p className="text-xs text-slate-500">{project?.status === 'published' ? 'Published' : 'Draft'} · {statusLabel()}{shareMessage ? ` · ${shareMessage}` : ''}</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={() => dispatch({ type: 'UNDO' })} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => dispatch({ type: 'REDO' })} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
        <Button type="button" variant="secondary" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={save}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button type="button" variant="secondary" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => project && navigate(`/preview/${project.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <div className="relative">
          <Button type="button" variant="secondary" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setVersionsOpen((current) => !current)}>
            <Clock3 className="mr-2 h-4 w-4" />
            History
          </Button>
          {versionsOpen && (
            <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200">
              <div className="border-b border-slate-200 p-3">
                <button type="button" onClick={saveVersion} className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                  Save restore point
                </button>
              </div>
              <div className="max-h-72 overflow-auto p-2">
                {project?.versions?.length ? (
                  project.versions.map((version) => (
                    <button key={version.id} type="button" onClick={() => restoreVersion(version.id)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className="block font-bold text-slate-900">{version.label}</span>
                      <span className="text-xs text-slate-500">{new Date(version.createdAt).toLocaleString()}</span>
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-sm font-bold text-slate-500">No restore points yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
        <Button type="button" variant="secondary" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => project && exportWebsiteProject(project)}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button type="button" variant="secondary" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={copyPublicUrl}>
          <Link2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            const action = project?.status === 'published' ? 'unpublish' : 'publish'
            if (window.confirm(`Are you sure you want to ${action} this website?`)) void publish()
          }}
        >
          <Globe2 className="mr-2 h-4 w-4" />
          {project?.status === 'published' ? 'Unpublish' : 'Publish'}
        </Button>
      </div>
    </header>
  )
}

export default BuilderToolbar
