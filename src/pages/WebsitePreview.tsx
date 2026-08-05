import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ElementRenderer from '../components/WebsiteBuilder/ElementRenderer'
import { getWebsiteProject } from '../utils/websiteBuilderStorage'
import type { WebsiteProject } from '../types/websiteBuilder'

const WebsitePreview: React.FC = () => {
  const navigate = useNavigate()
  const { siteId } = useParams()
  const [project, setProject] = React.useState<WebsiteProject | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!siteId) return
      setProject(await getWebsiteProject(siteId))
      setLoading(false)
    }
    load()
  }, [siteId])

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3">
        <button type="button" onClick={() => navigate(project ? `/builder/${project.id}` : '/dashboard/websites')} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" />
          Back to editor
        </button>
        <span className="text-sm font-bold">{project?.name || 'Website preview'}</span>
      </div>
      {loading && <div className="px-4 py-3 text-sm font-bold text-indigo-600">Rendering preview...</div>}
      {!loading && !project && <div className="grid min-h-[420px] place-items-center">Website not found.</div>}
      {project?.pages[0]?.elements.map((element) => <ElementRenderer key={element.id} element={element} preview />)}
    </main>
  )
}

export default WebsitePreview
