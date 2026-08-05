import type { AiWebsiteStyle } from '../data/aiWebsiteGenerator'
import { generateAiWebsiteProject } from '../data/aiWebsiteGenerator'
import type { BuilderElement, WebsiteProject } from '../types/websiteBuilder'

const AI_MODEL = import.meta.env.VITE_FIREBASE_AI_MODEL || 'gemini-3.5-flash'
const AI_TIMEOUT_MS = 4500
let firebaseAiUnavailable = false

export interface FirebaseAiResult {
  project: WebsiteProject
  source: 'firebase' | 'local'
  reason?: 'unconfigured' | 'unavailable' | 'timeout' | 'invalid-response'
}

const withTimeout = async <T,>(task: Promise<T>, fallback: T, timeoutMs = AI_TIMEOUT_MS) =>
  Promise.race([
    task,
    new Promise<T>((resolve) => {
      globalThis.setTimeout(() => resolve(fallback), timeoutMs)
    }),
  ])

const stripCodeFence = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

const parseProjectJson = (text: string): Partial<WebsiteProject> | null => {
  try {
    return JSON.parse(stripCodeFence(text)) as Partial<WebsiteProject>
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0]) as Partial<WebsiteProject>
    } catch {
      return null
    }
  }
}

const normalizeAiProject = (base: WebsiteProject, aiProject: Partial<WebsiteProject>): WebsiteProject => ({
  ...base,
  ...aiProject,
  id: base.id,
  ownerId: base.ownerId,
  status: base.status,
  publishedAt: base.publishedAt,
  createdAt: base.createdAt,
  updatedAt: new Date().toISOString(),
  theme: { ...base.theme, ...(aiProject.theme || {}) },
  seo: { ...base.seo, ...(aiProject.seo || {}) },
  assets: aiProject.assets || base.assets || [],
  pages: aiProject.pages?.length ? aiProject.pages : base.pages,
})

const getFirebaseAiModel = async () => {
  if (firebaseAiUnavailable) throw new Error('Firebase AI SDK is unavailable.')

  const moduleName = 'firebase/ai'
  const [{ app }, firebaseAi] = await Promise.all([import('../firebase/config'), import(/* @vite-ignore */ moduleName)]).catch((error) => {
    firebaseAiUnavailable = true
    throw error
  })

  if (!app) throw new Error('Firebase is not configured.')
  if (!firebaseAi?.getAI || !firebaseAi?.getGenerativeModel) {
    firebaseAiUnavailable = true
    throw new Error('Firebase AI SDK is unavailable.')
  }

  const ai = firebaseAi.getAI(app, { backend: new firebaseAi.GoogleAIBackend() })
  return firebaseAi.getGenerativeModel(ai, {
    model: AI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })
}

const projectPrompt = (prompt: string, style: AiWebsiteStyle, base: WebsiteProject) => `
You are CollabOS AI Website Builder.
Return only valid JSON for a WebsiteProject-like object. No markdown.

Goal:
${prompt}

Style:
${style}

Rules:
- Create a premium, production-quality website structure.
- Keep it editable in this schema: pages[0].elements[] with element type, name, content, style.
- Use only these element types where possible: navbar, hero, features, pricing, faq, contact, gallery, testimonials, productGrid, reviews, checkout, statistics, quote, footer.
- Include professional copy, clear CTAs, modern colors, responsive padding, and SEO.
- Do not include functions or comments.
- Preserve this id exactly: ${base.id}

Base JSON:
${JSON.stringify(base)}
`

export const generateWebsiteWithFirebaseAi = async (prompt: string, style: AiWebsiteStyle, ownerId: string) => {
  const fallback = generateAiWebsiteProject({ prompt, style, ownerId })
  return refineWebsiteWithFirebaseAi(fallback, prompt, style)
}

export const refineWebsiteWithFirebaseAiResult = async (base: WebsiteProject, prompt: string, style: AiWebsiteStyle): Promise<FirebaseAiResult> => {
  try {
    return withTimeout<FirebaseAiResult>(
      (async () => {
        const model = await getFirebaseAiModel()
        const response = await model.generateContent(projectPrompt(prompt, style, base))
        const text = response.text?.() || response.response?.text?.() || ''
        const aiProject = parseProjectJson(text)
        return aiProject
          ? { project: normalizeAiProject(base, aiProject), source: 'firebase' as const }
          : { project: base, source: 'local' as const, reason: 'invalid-response' as const }
      })(),
      { project: base, source: 'local', reason: 'timeout' } satisfies FirebaseAiResult
    )
  } catch {
    return { project: base, source: 'local', reason: firebaseAiUnavailable ? 'unavailable' : 'unconfigured' }
  }
}

export const refineWebsiteWithFirebaseAi = async (base: WebsiteProject, prompt: string, style: AiWebsiteStyle) => {
  const result = await refineWebsiteWithFirebaseAiResult(base, prompt, style)
  return result.project
}

const sectionTitle = (type: BuilderElement['type'], projectName: string) => {
  if (type === 'pricing') return 'Flexible plans built for scale'
  if (type === 'faq') return 'Helpful answers before you start'
  if (type === 'testimonials') return 'Trusted by focused teams'
  if (type === 'statistics') return 'Results that speak clearly'
  if (type === 'gallery') return `Explore ${projectName}`
  return `Why ${projectName} works`
}

export const applyLocalPromptEdit = (project: WebsiteProject, instruction: string): WebsiteProject => {
  const lower = instruction.toLowerCase()
  const next = structuredClone(project)
  const home = next.pages[0]

  if (lower.includes('dark')) {
    next.theme = { ...next.theme, backgroundColor: '#0f172a', textColor: '#f8fafc', brandColor: '#38bdf8', accentColor: '#a78bfa' }
  }
  if (lower.includes('emerald') || lower.includes('green')) {
    next.theme = { ...next.theme, brandColor: '#059669', accentColor: '#14b8a6', backgroundColor: '#ecfdf5' }
  }
  if (lower.includes('luxury') || lower.includes('premium')) {
    next.theme = { ...next.theme, brandColor: '#0f172a', accentColor: '#d4af37', backgroundColor: '#fafaf9', cardRadius: '14px' }
  }

  if (lower.includes('pricing') && !home.elements.some((element) => element.type === 'pricing')) {
    const pricing = home.elements.find((element) => element.type === 'features')
    if (pricing) home.elements.splice(home.elements.indexOf(pricing) + 1, 0, { ...pricing, id: `${pricing.id}-pricing-${Date.now()}`, type: 'pricing', name: 'Pricing', content: { ...pricing.content, title: sectionTitle('pricing', next.name) } })
  }

  if (lower.includes('faq') && !home.elements.some((element) => element.type === 'faq')) {
    const base = home.elements.find((element) => element.type === 'features') || home.elements[home.elements.length - 1]
    home.elements.splice(Math.max(home.elements.length - 1, 0), 0, { ...base, id: `${base.id}-faq-${Date.now()}`, type: 'faq', name: 'FAQ', content: { ...base.content, title: sectionTitle('faq', next.name) } })
  }

  home.elements = home.elements.map((element) => {
    if (element.type === 'hero') {
      return {
        ...element,
        content: {
          ...element.content,
          subtitle: instruction,
          buttonText: lower.includes('book') ? 'Book now' : element.content.buttonText || 'Get started',
        },
        style: { ...element.style, background: next.theme.backgroundColor },
      }
    }
    if (['features', 'testimonials', 'statistics', 'gallery'].includes(element.type)) {
      return { ...element, content: { ...element.content, title: sectionTitle(element.type, next.name) } }
    }
    return element
  })

  next.description = `Updated by AI prompt: ${instruction}`
  next.updatedAt = new Date().toISOString()
  return next
}

export const editWebsiteWithFirebaseAiResult = async (project: WebsiteProject, instruction: string): Promise<FirebaseAiResult> => {
  const fallback = applyLocalPromptEdit(project, instruction)

  try {
    return withTimeout<FirebaseAiResult>(
      (async () => {
        const model = await getFirebaseAiModel()
        const response = await model.generateContent(`
You are CollabOS AI Website Editor.
Return only valid JSON for the complete updated WebsiteProject. No markdown.

Instruction:
${instruction}

Current project:
${JSON.stringify(project)}

Rules:
- Preserve project id, ownerId, createdAt, and status.
- Update copy, theme, SEO, and elements based on the instruction.
- Keep output valid for the existing CollabOS WebsiteProject schema.
`)
        const text = response.text?.() || response.response?.text?.() || ''
        const aiProject = parseProjectJson(text)
        return aiProject
          ? { project: normalizeAiProject(project, aiProject), source: 'firebase' as const }
          : { project: fallback, source: 'local' as const, reason: 'invalid-response' as const }
      })(),
      { project: fallback, source: 'local', reason: 'timeout' } satisfies FirebaseAiResult
    )
  } catch {
    return { project: fallback, source: 'local', reason: firebaseAiUnavailable ? 'unavailable' : 'unconfigured' }
  }
}

export const editWebsiteWithFirebaseAi = async (project: WebsiteProject, instruction: string) => {
  const result = await editWebsiteWithFirebaseAiResult(project, instruction)
  return result.project
}
