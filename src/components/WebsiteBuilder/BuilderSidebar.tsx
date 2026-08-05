import React from 'react'
import { Copy, Eye, EyeOff, FileText, GripVertical, Layers, Lock, Package, Palette, Plus, Search, Trash2, Unlock, Upload } from 'lucide-react'
import { builderComponents, createWebsiteFromTemplate, websiteTemplates } from '../../data/builderComponents'
import { useWebsiteBuilder } from '../../context/WebsiteBuilderContext'

type SidebarTab = 'components' | 'layers' | 'assets' | 'pages' | 'templates'

const tabs: Array<{ key: SidebarTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'components', label: 'Components', icon: Package },
  { key: 'layers', label: 'Layers', icon: Layers },
  { key: 'assets', label: 'Assets', icon: Upload },
  { key: 'pages', label: 'Pages', icon: FileText },
  { key: 'templates', label: 'Templates', icon: Palette },
]

const smallButton = 'rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600'

const BuilderSidebar: React.FC = () => {
  const { state, elements, selectedElement, dispatch } = useWebsiteBuilder()
  const [activeTab, setActiveTab] = React.useState<SidebarTab>('components')
  const [query, setQuery] = React.useState('')

  const filteredComponents = builderComponents.filter((item) => {
    const value = `${item.label} ${item.category} ${item.description}`.toLowerCase()
    return value.includes(query.toLowerCase())
  })
  const categories = Array.from(new Set(filteredComponents.map((item) => item.category)))

  const addLocalAsset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const type = file.type.startsWith('video') ? 'video' : file.type.includes('svg') ? 'svg' : file.name.match(/\.(ttf|otf|woff2?)$/i) ? 'font' : 'image'
      dispatch({
        type: 'ADD_ASSET',
        asset: {
          id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `asset-${Date.now()}`,
          name: file.name,
          type,
          url: String(reader.result || ''),
          createdAt: new Date().toISOString(),
        },
      })
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const applyAsset = (url: string, type: string) => {
    if (!selectedElement) return
    const field = type === 'video' ? 'videoUrl' : 'imageUrl'
    dispatch({ type: 'UPDATE_ELEMENT', id: selectedElement.id, patch: { content: { [field]: url } } })
  }

  const applyTemplate = (templateId: string) => {
    if (!state.project) return
    const templateProject = createWebsiteFromTemplate(templateId, state.project.ownerId)
    dispatch({
      type: 'SET_PROJECT',
      status: 'dirty',
      project: {
        ...state.project,
        name: templateProject.name,
        description: templateProject.description,
        seo: templateProject.seo,
        theme: templateProject.theme,
        pages: templateProject.pages,
      },
    })
  }

  return (
    <aside className="w-full border-r border-slate-200 bg-white lg:w-80">
      <div className="border-b border-slate-200 p-3">
        <div className="grid grid-cols-5 gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`grid h-10 place-items-center rounded-lg transition-colors ${activeTab === tab.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                aria-label={tab.label}
                title={tab.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'components' && (
        <>
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-black text-slate-950">Components</h2>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 outline-none" placeholder="Search blocks" />
            </div>
          </div>
          <div className="max-h-[calc(100vh-190px)] overflow-auto p-3">
            {categories.map((category) => (
              <section key={category} className="mb-4">
                <p className="mb-2 px-1 text-xs font-black uppercase tracking-wider text-slate-400">{category}</p>
                <div className="grid gap-2">
                  {filteredComponents.filter((item) => item.category === category).map((component) => {
                    const Icon = component.icon
                    return (
                      <button
                        key={component.type}
                        type="button"
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData('component/type', component.type)}
                        onClick={() => dispatch({ type: 'ADD_ELEMENT', elementType: component.type })}
                        className="group flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50 active:cursor-grabbing"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-bold text-slate-900">{component.label}</span>
                          <span className="line-clamp-1 text-xs text-slate-500">{component.description}</span>
                        </span>
                        <GripVertical className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-400" />
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {activeTab === 'layers' && (
        <div className="max-h-[calc(100vh-132px)] overflow-auto p-4">
          <h2 className="mb-3 text-lg font-black text-slate-950">Layers</h2>
          <div className="grid gap-2">
            {elements.map((element, index) => (
              <div key={element.id} className={`rounded-xl border p-2 ${state.selectedIds.includes(element.id) ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: element.id })}
                    className="min-w-0 flex-1 truncate text-left text-sm font-bold text-slate-900"
                  >
                    {element.name}
                  </button>
                  <button type="button" onClick={() => dispatch({ type: 'TOGGLE_ELEMENT_HIDDEN', id: element.id })} className={smallButton} aria-label="Toggle visibility">
                    {element.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => dispatch({ type: 'TOGGLE_ELEMENT_LOCK', id: element.id })} className={smallButton} aria-label="Toggle lock">
                    {element.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                </div>
                <input
                  value={element.name}
                  onChange={(event) => dispatch({ type: 'RENAME_ELEMENT', id: element.id, name: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-indigo-400"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" disabled={index === 0} onClick={() => dispatch({ type: 'MOVE_ELEMENT', from: index, to: index - 1 })} className="flex-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-40">Up</button>
                  <button type="button" disabled={index === elements.length - 1} onClick={() => dispatch({ type: 'MOVE_ELEMENT', from: index, to: index + 1 })} className="flex-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-40">Down</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="max-h-[calc(100vh-132px)] overflow-auto p-4">
          <h2 className="text-lg font-black text-slate-950">Assets</h2>
          <label className="mt-4 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50">
            <Upload className="mb-2 h-6 w-6 text-indigo-600" />
            Upload image, video, SVG, or font
            <input type="file" accept="image/*,video/*,.svg,.ttf,.otf,.woff,.woff2" className="sr-only" onChange={addLocalAsset} />
          </label>
          <div className="mt-4 grid gap-2">
            {(state.project?.assets || []).map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                {asset.type === 'image' || asset.type === 'svg' ? <img src={asset.url} alt={asset.name} className="h-10 w-10 rounded-lg object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-xs font-bold uppercase">{asset.type}</div>}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{asset.name}</p>
                  <p className="text-xs text-slate-500">{asset.type}</p>
                </div>
                {selectedElement && asset.type !== 'font' && (
                  <button type="button" onClick={() => applyAsset(asset.url, asset.type)} className="ml-auto rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-indigo-100 hover:text-indigo-700">
                    Use
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="max-h-[calc(100vh-132px)] overflow-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Pages</h2>
            <button type="button" onClick={() => dispatch({ type: 'ADD_PAGE' })} className={smallButton} aria-label="Add page"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-2">
            {(state.project?.pages || []).map((page) => (
              <div key={page.id} className={`rounded-xl border bg-white p-3 ${state.activePageId === page.id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', id: page.id })} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-indigo-100 hover:text-indigo-700">
                    Open
                  </button>
                  <input value={page.name} onChange={(event) => dispatch({ type: 'RENAME_PAGE', id: page.id, name: event.target.value })} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm font-bold outline-none focus:border-indigo-400" />
                  <button type="button" onClick={() => dispatch({ type: 'DUPLICATE_PAGE', id: page.id })} className={smallButton} aria-label="Duplicate page"><Copy className="h-4 w-4" /></button>
                  <button type="button" onClick={() => dispatch({ type: 'DELETE_PAGE', id: page.id })} className={smallButton} aria-label="Delete page"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{page.slug}</span>
                  <button type="button" onClick={() => dispatch({ type: 'SET_HOMEPAGE', id: page.id })} className="font-bold text-indigo-600">{page.isHome ? 'Homepage' : 'Set home'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="max-h-[calc(100vh-132px)] overflow-auto p-4">
          <h2 className="mb-3 text-lg font-black text-slate-950">Templates</h2>
          <div className="grid gap-3">
            {websiteTemplates.map((template) => (
              <button key={template.id} type="button" onClick={() => applyTemplate(template.id)} className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                <div className={`h-20 bg-gradient-to-br ${template.accent}`} />
                <div className="p-3">
                  <p className="font-black text-slate-950">{template.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

export default BuilderSidebar
