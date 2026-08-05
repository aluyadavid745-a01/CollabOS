import React from 'react'
import { useParams } from 'react-router-dom'
import ElementRenderer from '../components/WebsiteBuilder/ElementRenderer'
import { getPublicWebsiteProject } from '../utils/websiteBuilderStorage'
import type { WebsiteProject } from '../types/websiteBuilder'

const PublicWebsite: React.FC = () => {
  const { siteId } = useParams()
  const [project, setProject] = React.useState<WebsiteProject | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!siteId) return
      setLoading(true)
      setProject(await getPublicWebsiteProject(siteId))
      setLoading(false)
    }
    load()
  }, [siteId])

  if (loading) {
    return <main className="min-h-screen bg-white px-4 py-6 text-sm font-bold text-indigo-600">Opening published site...</main>
  }

  if (!project) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center text-slate-950">
        <div>
          <h1 className="text-3xl font-black">Published website not found</h1>
          <p className="mt-2 text-slate-600">This site may still be a draft or the share link is no longer active.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {project.pages.find((page) => page.isHome)?.elements.map((element) => (
        <ElementRenderer key={element.id} element={element} preview />
      ))}
    </main>
  )
}

export default PublicWebsite
