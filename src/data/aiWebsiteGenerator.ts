import type { BuilderElement, WebsiteProject, WebsiteTheme } from '../types/websiteBuilder'
import { createBuilderElementCore, defaultTheme } from './websiteProjectFactory'

export type AiWebsiteStyle = 'modern' | 'minimal' | 'bold' | 'premium'

interface AiWebsiteInput {
  prompt: string
  style: AiWebsiteStyle
  ownerId?: string
}

const palettes: Record<AiWebsiteStyle, Pick<WebsiteTheme, 'brandColor' | 'accentColor' | 'backgroundColor' | 'textColor' | 'buttonRadius' | 'cardRadius' | 'shadow'>> = {
  modern: {
    brandColor: '#4f46e5',
    accentColor: '#06b6d4',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    buttonRadius: '12px',
    cardRadius: '16px',
    shadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
  },
  minimal: {
    brandColor: '#111827',
    accentColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    buttonRadius: '8px',
    cardRadius: '12px',
    shadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
  },
  bold: {
    brandColor: '#e11d48',
    accentColor: '#f59e0b',
    backgroundColor: '#fff7ed',
    textColor: '#111827',
    buttonRadius: '14px',
    cardRadius: '18px',
    shadow: '0 24px 55px rgba(225, 29, 72, 0.16)',
  },
  premium: {
    brandColor: '#0f172a',
    accentColor: '#14b8a6',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    buttonRadius: '10px',
    cardRadius: '16px',
    shadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
  },
}

const industries = [
  { key: 'saas', words: ['saas', 'software', 'app', 'platform', 'dashboard'], label: 'SaaS platform', cta: 'Start free trial', sections: ['features', 'pricing', 'faq', 'contact'] },
  { key: 'portfolio', words: ['portfolio', 'designer', 'developer', 'creator', 'personal'], label: 'Portfolio', cta: 'View my work', sections: ['gallery', 'testimonials', 'contact'] },
  { key: 'agency', words: ['agency', 'studio', 'marketing', 'brand', 'creative'], label: 'Agency', cta: 'Start a project', sections: ['features', 'testimonials', 'contact'] },
  { key: 'shop', words: ['shop', 'store', 'ecommerce', 'product', 'commerce'], label: 'Online store', cta: 'Shop now', sections: ['productGrid', 'reviews', 'checkout'] },
  { key: 'restaurant', words: ['restaurant', 'food', 'cafe', 'kitchen', 'menu'], label: 'Restaurant', cta: 'Book a table', sections: ['gallery', 'features', 'contact'] },
  { key: 'hotel', words: ['hotel', 'travel', 'booking', 'rooms', 'stay'], label: 'Hotel', cta: 'Check availability', sections: ['features', 'testimonials', 'contact'] },
  { key: 'blog', words: ['blog', 'newsletter', 'articles', 'writing', 'media'], label: 'Blog', cta: 'Read latest', sections: ['features', 'quote', 'contact'] },
]

const titleCase = (value: string) =>
  value
    .replace(/[^a-z0-9 ]/gi, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

const inferIndustry = (prompt: string) => {
  const lower = prompt.toLowerCase()
  return industries.find((industry) => industry.words.some((word) => lower.includes(word))) || industries[0]
}

const makeName = (prompt: string, label: string) => {
  const cleaned = titleCase(prompt.replace(/create|build|make|website|landing page|for/gi, ''))
  return cleaned || `AI ${label}`
}

const withContent = (element: BuilderElement, content: BuilderElement['content'], background?: string) => ({
  ...element,
  content: { ...element.content, ...content },
  style: background ? { ...element.style, background } : element.style,
})

export const generateAiWebsiteProject = ({ prompt, style, ownerId = 'local-user' }: AiWebsiteInput): WebsiteProject => {
  const industry = inferIndustry(prompt)
  const name = makeName(prompt, industry.label)
  const theme = { ...defaultTheme, ...palettes[style] }
  const now = new Date().toISOString()
  const background = style === 'bold' ? '#fff7ed' : style === 'premium' ? '#f8fafc' : '#eef2ff'

  const elements: BuilderElement[] = [
    withContent(createBuilderElementCore('navbar'), { title: name, buttonText: industry.cta }),
    withContent(
      createBuilderElementCore('hero'),
      {
        eyebrow: `AI generated ${industry.label}`,
        title: `${name} built for growth`,
        subtitle: prompt || `A polished ${industry.label.toLowerCase()} website generated inside CollabOS and ready to edit visually.`,
        buttonText: industry.cta,
      },
      background
    ),
    ...industry.sections.map((type) => {
      const element = createBuilderElementCore(type as BuilderElement['type'])
      return withContent(element, {
        title:
          type === 'pricing'
            ? 'Simple plans for every stage'
            : type === 'faq'
              ? 'Questions people ask'
              : type === 'contact'
                ? 'Start the conversation'
                : type === 'productGrid'
                  ? 'Featured products'
                  : type === 'checkout'
                    ? 'Ready for checkout'
                    : `Why choose ${name}`,
        subtitle: `Generated from your prompt and ready to customize in the CollabOS editor.`,
      })
    }),
    withContent(createBuilderElementCore('footer'), { title: name }),
  ]

  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `ai-site-${Date.now()}`,
    ownerId,
    name,
    description: `AI-generated ${industry.label.toLowerCase()} website from: ${prompt}`,
    thumbnail: '',
    customDomain: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    theme,
    seo: {
      title: name,
      description: prompt || `A ${industry.label.toLowerCase()} website generated with CollabOS.`,
      keywords: `${industry.label.toLowerCase()}, website, ${name.toLowerCase()}`,
      openGraphImage: '',
      favicon: '',
      canonicalUrl: '',
    },
    assets: [],
    pages: [{ id: 'home', name: 'Home', slug: '/', isHome: true, elements }],
  }
}
