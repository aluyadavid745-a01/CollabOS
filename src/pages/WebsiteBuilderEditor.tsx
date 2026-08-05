import React from 'react'
import { useParams } from 'react-router-dom'
import { WebsiteBuilderProvider, useWebsiteBuilder } from '../context/WebsiteBuilderContext'
import { getWebsiteProject, saveWebsiteProjectWithStatus } from '../utils/websiteBuilderStorage'

const BuilderBottomBar = React.lazy(() => import('../components/WebsiteBuilder/BuilderBottomBar'))
const BuilderCanvas = React.lazy(() => import('../components/WebsiteBuilder/BuilderCanvas'))
const BuilderSidebar = React.lazy(() => import('../components/WebsiteBuilder/BuilderSidebar'))
const BuilderToolbar = React.lazy(() => import('../components/WebsiteBuilder/BuilderToolbar'))
const PropertiesPanel = React.lazy(() => import('../components/WebsiteBuilder/PropertiesPanel'))

const PanelFallback = ({ label }: { label: string }) => (
  <div className="grid min-h-0 place-items-center bg-white text-xs font-bold text-slate-400">{label}</div>
)

const EditorShell: React.FC = () => {
  const { siteId } = useParams()
  const { state, dispatch } = useWebsiteBuilder()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const load = async () => {
      if (!siteId) return
      setLoading(true)
      const project = await getWebsiteProject(siteId)
      if (project) {
        dispatch({ type: 'LOAD_PROJECT', project })
        setError('')
      } else {
        setError('Website not found.')
      }
      setLoading(false)
    }
    load()
  }, [dispatch, siteId])

  React.useEffect(() => {
    if (!state.project || state.status !== 'dirty') return
    const timeout = window.setTimeout(async () => {
      dispatch({ type: 'SET_STATUS', status: 'saving' })
      try {
        const result = await saveWebsiteProjectWithStatus(state.project!)
        dispatch({ type: 'SET_STATUS', status: 'saved', saveTarget: result.target })
      } catch {
        dispatch({ type: 'SET_STATUS', status: 'error' })
      }
    }, 900)
    return () => window.clearTimeout(timeout)
  }, [dispatch, state.project, state.status])

  React.useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        Boolean(target?.isContentEditable)

      if (isTyping) return

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') dispatch({ type: 'UNDO' })
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') dispatch({ type: 'REDO' })
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c') dispatch({ type: 'COPY_SELECTED' })
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v') dispatch({ type: 'PASTE_ELEMENT' })
      if (event.key === 'Delete' || event.key === 'Backspace') dispatch({ type: 'DELETE_SELECTED' })
    }
    window.addEventListener('keydown', handleKeys)
    return () => window.removeEventListener('keydown', handleKeys)
  }, [dispatch])

  if (error) return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-950"><p className="font-bold">{error}</p></main>

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-950">
      {state.project ? (
        <React.Suspense fallback={<div className="min-h-[64px] border-b border-slate-200 bg-white px-4 py-5 text-sm font-bold text-indigo-600">Opening toolbar...</div>}>
          <BuilderToolbar />
        </React.Suspense>
      ) : (
        <div className="min-h-[64px] border-b border-slate-200 bg-white px-4 py-5 text-sm font-bold text-indigo-600">Opening editor...</div>
      )}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {state.project ? (
          <>
            <React.Suspense fallback={<aside className="w-full border-r border-slate-200 bg-white lg:w-80"><PanelFallback label="Panels..." /></aside>}>
              <BuilderSidebar />
            </React.Suspense>
            <React.Suspense fallback={<div className="grid flex-1 place-items-center text-sm font-bold text-slate-500">Opening canvas...</div>}>
              <BuilderCanvas />
            </React.Suspense>
            <React.Suspense fallback={<aside className="w-full border-l border-slate-200 bg-white lg:w-96"><PanelFallback label="Properties..." /></aside>}>
              <PropertiesPanel />
            </React.Suspense>
          </>
        ) : (
          <div className="grid flex-1 place-items-center text-sm font-bold text-slate-500">
            {loading ? 'Loading canvas...' : 'No canvas loaded.'}
          </div>
        )}
      </div>
      {state.project && (
        <React.Suspense fallback={<div className="min-h-[48px] border-t border-slate-200 bg-white" />}>
          <BuilderBottomBar />
        </React.Suspense>
      )}
    </main>
  )
}

const WebsiteBuilderEditor: React.FC = () => (
  <WebsiteBuilderProvider>
    <EditorShell />
  </WebsiteBuilderProvider>
)

export default WebsiteBuilderEditor
