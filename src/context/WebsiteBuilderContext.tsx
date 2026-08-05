import React from 'react'
import type { BuilderBreakpoint, BuilderElement, BuilderElementType, WebsiteAsset, WebsiteProject, WebsiteSeo, WebsiteTheme } from '../types/websiteBuilder'
import { createBuilderElementCore as createBuilderElement, defaultSeo, defaultTheme } from '../data/websiteProjectFactory'

interface BuilderHistoryEntry {
  pageId: string
  elements: BuilderElement[]
}

interface BuilderState {
  project: WebsiteProject | null
  activePageId: string
  selectedIds: string[]
  copiedElement: BuilderElement | null
  history: BuilderHistoryEntry[]
  future: BuilderHistoryEntry[]
  breakpoint: BuilderBreakpoint
  zoom: number
  status: 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
  saveTarget: 'unknown' | 'cloud' | 'local'
}

type BuilderAction =
  | { type: 'LOAD_PROJECT'; project: WebsiteProject }
  | { type: 'ADD_ELEMENT'; elementType: BuilderElementType; index?: number }
  | { type: 'SELECT_ELEMENT'; id: string; multi?: boolean }
  | { type: 'UPDATE_ELEMENT'; id: string; patch: Partial<BuilderElement> }
  | { type: 'RENAME_ELEMENT'; id: string; name: string }
  | { type: 'TOGGLE_ELEMENT_LOCK'; id: string }
  | { type: 'TOGGLE_ELEMENT_HIDDEN'; id: string }
  | { type: 'DELETE_SELECTED' }
  | { type: 'DUPLICATE_SELECTED' }
  | { type: 'COPY_SELECTED' }
  | { type: 'PASTE_ELEMENT' }
  | { type: 'MOVE_ELEMENT'; from: number; to: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_BREAKPOINT'; breakpoint: BuilderBreakpoint }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_STATUS'; status: BuilderState['status']; saveTarget?: BuilderState['saveTarget'] }
  | { type: 'UPDATE_PROJECT_META'; patch: Partial<WebsiteProject> }
  | { type: 'SET_PROJECT'; project: WebsiteProject; status?: BuilderState['status'] }
  | { type: 'ADD_PAGE' }
  | { type: 'SET_ACTIVE_PAGE'; id: string }
  | { type: 'DELETE_PAGE'; id: string }
  | { type: 'DUPLICATE_PAGE'; id: string }
  | { type: 'RENAME_PAGE'; id: string; name: string }
  | { type: 'SET_HOMEPAGE'; id: string }
  | { type: 'UPDATE_THEME'; patch: Partial<WebsiteTheme> }
  | { type: 'UPDATE_SEO'; patch: Partial<WebsiteSeo> }
  | { type: 'ADD_ASSET'; asset: WebsiteAsset }

interface WebsiteBuilderContextValue {
  state: BuilderState
  elements: BuilderElement[]
  selectedElement: BuilderElement | null
  dispatch: React.Dispatch<BuilderAction>
}

const WebsiteBuilderContext = React.createContext<WebsiteBuilderContextValue | null>(null)

const cloneElement = (element: BuilderElement): BuilderElement => ({
  ...JSON.parse(JSON.stringify(element)),
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${element.type}-${Date.now()}`,
  name: `${element.name} Copy`,
})

const activePage = (project: WebsiteProject | null, activePageId: string) => project?.pages.find((page) => page.id === activePageId) || project?.pages[0]

const updateProjectElements = (project: WebsiteProject, activePageId: string, elements: BuilderElement[]) => ({
  ...project,
  pages: project.pages.map((page, index) => (page.id === activePageId || (!activePageId && index === 0) ? { ...page, elements } : page)),
})

const pageSlug = (name: string) => `/${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'}`

const normalizeProject = (project: WebsiteProject): WebsiteProject => ({
  ...project,
  theme: { ...defaultTheme, ...(project.theme || {}) },
  seo: { ...defaultSeo, ...(project.seo || {}), title: project.seo?.title || project.name, description: project.seo?.description || project.description },
  assets: project.assets || [],
  pages: (project.pages?.length ? project.pages : [{ id: 'home', name: 'Home', slug: '/', isHome: true, elements: [] }]).map((page, index) => ({
    ...page,
    isHome: page.isHome ?? index === 0,
    elements: page.elements || [],
  })),
})

const pushHistory = (state: BuilderState) => {
  const page = activePage(state.project, state.activePageId)
  const pageId = page?.id || state.activePageId
  const elements = page?.elements || []
  return {
    ...state,
    history: [...state.history.slice(-24), { pageId, elements: JSON.parse(JSON.stringify(elements)) as BuilderElement[] }],
    future: [],
    status: 'dirty' as const,
  }
}

const reducer = (state: BuilderState, action: BuilderAction): BuilderState => {
  const project = state.project
  const elements = activePage(project, state.activePageId)?.elements || []

  switch (action.type) {
    case 'LOAD_PROJECT':
      return { ...state, project: normalizeProject(action.project), activePageId: normalizeProject(action.project).pages[0]?.id || 'home', selectedIds: [], history: [], future: [], status: 'saved' }
    case 'ADD_ELEMENT': {
      if (!project) return state
      const nextState = pushHistory(state)
      const nextElements = [...elements]
      nextElements.splice(action.index ?? nextElements.length, 0, createBuilderElement(action.elementType))
      return { ...nextState, project: updateProjectElements(project, state.activePageId, nextElements) }
    }
    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedIds: action.multi
          ? state.selectedIds.includes(action.id)
            ? state.selectedIds.filter((id) => id !== action.id)
            : [...state.selectedIds, action.id]
          : [action.id],
      }
    case 'UPDATE_ELEMENT': {
      if (!project) return state
      if (elements.find((element) => element.id === action.id)?.locked) return state
      const nextState = pushHistory(state)
      const nextElements = elements.map((element) =>
        element.id === action.id
          ? {
              ...element,
              ...action.patch,
              content: { ...element.content, ...action.patch.content },
              style: { ...element.style, ...action.patch.style },
            }
          : element
      )
      return { ...nextState, project: updateProjectElements(project, state.activePageId, nextElements) }
    }
    case 'RENAME_ELEMENT': {
      if (!project) return state
      const nextState = pushHistory(state)
      return { ...nextState, project: updateProjectElements(project, state.activePageId, elements.map((element) => (element.id === action.id ? { ...element, name: action.name } : element))) }
    }
    case 'TOGGLE_ELEMENT_LOCK': {
      if (!project) return state
      const nextState = pushHistory(state)
      return { ...nextState, project: updateProjectElements(project, state.activePageId, elements.map((element) => (element.id === action.id ? { ...element, locked: !element.locked } : element))) }
    }
    case 'TOGGLE_ELEMENT_HIDDEN': {
      if (!project) return state
      const nextState = pushHistory(state)
      return { ...nextState, project: updateProjectElements(project, state.activePageId, elements.map((element) => (element.id === action.id ? { ...element, hidden: !element.hidden } : element))) }
    }
    case 'DELETE_SELECTED': {
      if (!project) return state
      const nextState = pushHistory(state)
      return {
        ...nextState,
        selectedIds: [],
        project: updateProjectElements(project, state.activePageId, elements.filter((element) => !state.selectedIds.includes(element.id) || element.locked)),
      }
    }
    case 'DUPLICATE_SELECTED': {
      if (!project) return state
      const nextState = pushHistory(state)
      const duplicates = elements.filter((element) => state.selectedIds.includes(element.id)).map(cloneElement)
      return { ...nextState, project: updateProjectElements(project, state.activePageId, [...elements, ...duplicates]), selectedIds: duplicates.map((item) => item.id) }
    }
    case 'COPY_SELECTED': {
      const selected = elements.find((element) => element.id === state.selectedIds[0])
      return { ...state, copiedElement: selected || null }
    }
    case 'PASTE_ELEMENT': {
      if (!project || !state.copiedElement) return state
      const nextState = pushHistory(state)
      const pasted = cloneElement(state.copiedElement)
      return { ...nextState, project: updateProjectElements(project, state.activePageId, [...elements, pasted]), selectedIds: [pasted.id] }
    }
    case 'MOVE_ELEMENT': {
      if (!project) return state
      if (elements[action.from]?.locked) return state
      const nextState = pushHistory(state)
      const nextElements = [...elements]
      const [moved] = nextElements.splice(action.from, 1)
      nextElements.splice(action.to, 0, moved)
      return { ...nextState, project: updateProjectElements(project, state.activePageId, nextElements) }
    }
    case 'UNDO': {
      if (!project || !state.history.length) return state
      const previous = state.history[state.history.length - 1]
      return {
        ...state,
        project: updateProjectElements(project, previous.pageId, previous.elements),
        activePageId: previous.pageId,
        history: state.history.slice(0, -1),
        future: [{ pageId: state.activePageId, elements }, ...state.future],
        status: 'dirty',
      }
    }
    case 'REDO': {
      if (!project || !state.future.length) return state
      const next = state.future[0]
      return {
        ...state,
        project: updateProjectElements(project, next.pageId, next.elements),
        activePageId: next.pageId,
        history: [...state.history, { pageId: state.activePageId, elements }],
        future: state.future.slice(1),
        status: 'dirty',
      }
    }
    case 'SET_BREAKPOINT':
      return { ...state, breakpoint: action.breakpoint }
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom }
    case 'SET_STATUS':
      return { ...state, status: action.status, saveTarget: action.saveTarget || state.saveTarget }
    case 'SET_PROJECT':
      return { ...state, project: normalizeProject(action.project), activePageId: normalizeProject(action.project).pages[0]?.id || state.activePageId, status: action.status || state.status }
    case 'UPDATE_PROJECT_META':
      return project ? { ...state, project: { ...project, ...action.patch }, status: 'dirty' } : state
    case 'ADD_PAGE': {
      if (!project) return state
      const pageNumber = project.pages.length + 1
      const name = `Page ${pageNumber}`
      const id = `page-${Date.now()}`
      return {
        ...state,
        activePageId: id,
        selectedIds: [],
        project: { ...project, pages: [...project.pages, { id, name, slug: pageSlug(name), elements: [] }] },
        status: 'dirty',
      }
    }
    case 'SET_ACTIVE_PAGE':
      return project?.pages.some((page) => page.id === action.id) ? { ...state, activePageId: action.id, selectedIds: [] } : state
    case 'DELETE_PAGE': {
      if (!project || project.pages.length <= 1) return state
      const pages = project.pages.filter((page) => page.id !== action.id)
      return { ...state, activePageId: pages[0]?.id || '', selectedIds: [], project: { ...project, pages: pages.some((page) => page.isHome) ? pages : [{ ...pages[0], isHome: true }, ...pages.slice(1)] }, status: 'dirty' }
    }
    case 'DUPLICATE_PAGE': {
      if (!project) return state
      const page = project.pages.find((item) => item.id === action.id)
      if (!page) return state
      const copyName = `${page.name} Copy`
      return {
        ...state,
        project: { ...project, pages: [...project.pages, { ...JSON.parse(JSON.stringify(page)), id: `page-${Date.now()}`, name: copyName, slug: pageSlug(copyName), isHome: false }] },
        status: 'dirty',
      }
    }
    case 'RENAME_PAGE': {
      if (!project) return state
      return {
        ...state,
        project: { ...project, pages: project.pages.map((page) => (page.id === action.id ? { ...page, name: action.name, slug: page.isHome ? '/' : pageSlug(action.name) } : page)) },
        status: 'dirty',
      }
    }
    case 'SET_HOMEPAGE':
      return project ? { ...state, project: { ...project, pages: project.pages.map((page) => ({ ...page, isHome: page.id === action.id, slug: page.id === action.id ? '/' : page.slug })) }, status: 'dirty' } : state
    case 'UPDATE_THEME':
      return project ? { ...state, project: { ...project, theme: { ...project.theme, ...action.patch } }, status: 'dirty' } : state
    case 'UPDATE_SEO':
      return project ? { ...state, project: { ...project, seo: { ...project.seo, ...action.patch } }, status: 'dirty' } : state
    case 'ADD_ASSET':
      return project ? { ...state, project: { ...project, assets: [action.asset, ...(project.assets || [])] }, status: 'dirty' } : state
    default:
      return state
  }
}

const initialState: BuilderState = {
  project: null,
  activePageId: '',
  selectedIds: [],
  copiedElement: null,
  history: [],
  future: [],
  breakpoint: 'desktop',
  zoom: 100,
  status: 'idle',
  saveTarget: 'unknown',
}

export const websiteBuilderReducer = reducer
export const createInitialWebsiteBuilderState = (): BuilderState => ({ ...initialState })

export const WebsiteBuilderProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const elements = React.useMemo(
    () => activePage(state.project, state.activePageId)?.elements || [],
    [state.activePageId, state.project]
  )
  const selectedElement = React.useMemo(
    () => elements.find((element) => element.id === state.selectedIds[0]) || null,
    [elements, state.selectedIds]
  )

  const value = React.useMemo(() => ({ state, elements, selectedElement, dispatch }), [elements, selectedElement, state])

  return <WebsiteBuilderContext.Provider value={value}>{children}</WebsiteBuilderContext.Provider>
}

export const useWebsiteBuilder = () => {
  const context = React.useContext(WebsiteBuilderContext)
  if (!context) throw new Error('useWebsiteBuilder must be used inside WebsiteBuilderProvider')
  return context
}
