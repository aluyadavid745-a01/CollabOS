import type { BuilderElement, BuilderElementType, WebsiteProject, WebsiteSeo, WebsiteTheme } from '../types/websiteBuilder'

export const defaultTheme: WebsiteTheme = {
  brandColor: '#4f46e5',
  accentColor: '#06b6d4',
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  fontFamily: 'Inter, system-ui, sans-serif',
  headingFont: 'Inter, system-ui, sans-serif',
  buttonRadius: '12px',
  cardRadius: '16px',
  shadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
  spacing: '24px',
}

export const defaultSeo: WebsiteSeo = {
  title: 'Untitled Website',
  description: 'A professional website built visually in CollabOS.',
  keywords: 'website, portfolio, business',
  openGraphImage: '',
  favicon: '',
  canonicalUrl: '',
}

export const templateCatalog = [
  { id: 'saas-launch', name: 'SaaS Launch', description: 'Hero, features, pricing, FAQ, and conversion-focused contact section.', accent: 'from-indigo-600 to-cyan-600' },
  { id: 'portfolio-pro', name: 'Portfolio Pro', description: 'Personal brand homepage for designers, developers, and creators.', accent: 'from-emerald-600 to-teal-600' },
  { id: 'agency-studio', name: 'Agency Studio', description: 'Premium agency website with services, proof, testimonials, and lead capture.', accent: 'from-rose-600 to-orange-600' },
  { id: 'ecommerce-shop', name: 'Ecommerce Shop', description: 'Product hero, product grid, reviews, cart, and checkout-ready sections.', accent: 'from-slate-900 to-emerald-600' },
  { id: 'restaurant', name: 'Restaurant', description: 'Restaurant homepage with menu highlights, gallery, location, and reservations.', accent: 'from-red-600 to-amber-500' },
  { id: 'hotel', name: 'Hotel', description: 'Hospitality template with rooms, amenities, testimonials, and booking inquiry.', accent: 'from-sky-700 to-teal-500' },
  { id: 'blog', name: 'Blog', description: 'Editorial homepage for articles, guides, newsletters, and author profiles.', accent: 'from-zinc-900 to-violet-600' },
  { id: 'landing-page', name: 'Landing Page', description: 'Fast single-page campaign with hero, proof, CTA, FAQ, and lead capture.', accent: 'from-violet-600 to-fuchsia-600' },
]

const componentLabels: Partial<Record<BuilderElementType, string>> = {
  navbar: 'Navbar',
  hero: 'Hero',
  features: 'Features',
  pricing: 'Pricing',
  faq: 'FAQ',
  contact: 'Contact Form',
  footer: 'Footer',
  gallery: 'Gallery',
  testimonials: 'Testimonials',
  productGrid: 'Product Grid',
  reviews: 'Reviews',
  checkout: 'Checkout',
  statistics: 'Statistics',
  quote: 'Quote',
  html: 'HTML Code',
}

const createItems = (label: string) => [
  { title: `${label} One`, description: 'Describe the value your website visitors should understand.' },
  { title: `${label} Two`, description: 'Keep the content focused, useful, and easy to scan.' },
  { title: `${label} Three`, description: 'Add proof, clarity, and a strong reason to act.' },
]

const elementId = (type: BuilderElementType) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createBuilderElementCore = (type: BuilderElementType): BuilderElement => {
  const name = componentLabels[type] || type
  const element: BuilderElement = {
    id: elementId(type),
    type,
    name,
    content: {
      text: 'Edit this content from the properties panel.',
      title: 'Build a better website',
      subtitle: 'Create beautiful pages visually with CollabOS.',
      buttonText: 'Get started',
      link: '#',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      html: '<section class="custom-html-section"><h2>Custom HTML section</h2><p>Edit this HTML in the properties panel.</p><a href="#">Call to action</a></section><style>.custom-html-section{padding:48px;border-radius:18px;background:#eef2ff;color:#0f172a}.custom-html-section h2{font-size:36px;margin:0 0 12px;font-weight:800}.custom-html-section p{font-size:16px;line-height:1.7}.custom-html-section a{display:inline-flex;margin-top:16px;padding:12px 18px;border-radius:12px;background:#4f46e5;color:white;text-decoration:none;font-weight:700}</style>',
      css: '',
      js: '',
      items: createItems('Feature'),
    },
    style: {
      color: '#0f172a',
      background: '#ffffff',
      fontFamily: defaultTheme.fontFamily,
      fontSize: type === 'heading' ? '42px' : '16px',
      fontWeight: type === 'heading' ? '800' : '500',
      lineHeight: '1.5',
      letterSpacing: '0',
      borderColor: '#e2e8f0',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '16px',
      shadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
      width: '100%',
      height: type === 'spacer' ? '64px' : 'auto',
      padding: type === 'divider' ? '0' : '32px',
      margin: '0 0 16px 0',
      gap: '16px',
      alignment: 'left',
      display: 'block',
      position: 'relative',
      opacity: '1',
      animation: 'none',
      responsive: {
        laptop: { padding: '28px' },
        tablet: { padding: '24px' },
        mobile: { padding: '18px', fontSize: type === 'heading' ? '30px' : '15px' },
      },
    },
  }

  if (type === 'navbar') {
    element.content = { title: 'Brand', buttonText: 'Contact', link: '#' }
    element.style = { ...element.style, background: '#0f172a', color: '#ffffff', padding: '18px 28px' }
  }
  if (type === 'hero') element.style = { ...element.style, background: '#eef2ff', padding: '72px 48px', alignment: 'center' }
  if (type === 'button') element.style = { ...element.style, background: '#4f46e5', color: '#ffffff', width: 'fit-content', padding: '14px 22px', borderRadius: '12px' }
  if (type === 'quote') element.style = { ...element.style, borderWidth: '0 0 0 4px', borderColor: '#4f46e5', background: '#f8fafc' }
  if (type === 'html') element.style = { ...element.style, padding: '0', borderWidth: '0', shadow: 'none', background: 'transparent' }
  if (['features', 'testimonials', 'pricing', 'faq', 'gallery', 'statistics', 'reviews', 'productGrid'].includes(type)) {
    element.content.items = createItems(name)
  }
  return element
}

const withContent = (element: BuilderElement, content: BuilderElement['content'], background?: string) => ({
  ...element,
  content: { ...element.content, ...content },
  style: background ? { ...element.style, background } : element.style,
})

const createProjectShell = (ownerId: string, name: string, description: string, elements: BuilderElement[]): WebsiteProject => {
  const now = new Date().toISOString()
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `site-${Date.now()}`,
    ownerId,
    name,
    description,
    thumbnail: '',
    customDomain: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    theme: defaultTheme,
    seo: { ...defaultSeo, title: name, description },
    assets: [],
    pages: [{ id: 'home', name: 'Home', slug: '/', isHome: true, elements }],
  }
}

export const createStarterWebsite = (ownerId = 'local-user') =>
  createProjectShell(ownerId, 'Untitled Website', 'A professional website built visually in CollabOS.', [
    createBuilderElementCore('navbar'),
    createBuilderElementCore('hero'),
    createBuilderElementCore('features'),
    createBuilderElementCore('footer'),
  ])

export const createCodeWebsite = (ownerId = 'local-user') => {
  const codeElement = createBuilderElementCore('html')
  codeElement.name = 'Code Website'
  codeElement.content = {
    html: '<main class="page">\n  <nav class="nav">\n    <strong>CollabOS Site</strong>\n    <a href="#contact">Contact</a>\n  </nav>\n\n  <section class="hero">\n    <p class="eyebrow">Built with code</p>\n    <h1>Create your website with HTML, CSS, and JavaScript.</h1>\n    <p>Write code on the left and preview it live on the right inside CollabOS.</p>\n    <button id="ctaButton">Click me</button>\n  </section>\n\n  <section id="contact" class="panel">\n    <h2>Ready to launch?</h2>\n    <p>Edit this starter and publish your own custom website.</p>\n  </section>\n</main>',
    css: 'body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #0f172a; }\n.page { min-height: 100vh; padding: 32px; }\n.nav { display: flex; align-items: center; justify-content: space-between; max-width: 1120px; margin: 0 auto 48px; }\n.nav a { color: #4f46e5; font-weight: 700; text-decoration: none; }\n.hero { max-width: 1120px; margin: 0 auto; padding: 72px 48px; border-radius: 28px; background: linear-gradient(135deg, #eef2ff, #ecfeff); box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12); }\n.eyebrow { color: #4f46e5; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }\nh1 { max-width: 780px; font-size: clamp(42px, 7vw, 78px); line-height: .95; margin: 12px 0 24px; }\n.hero p:not(.eyebrow) { max-width: 620px; font-size: 18px; line-height: 1.8; color: #475569; }\nbutton { margin-top: 24px; border: 0; border-radius: 14px; background: #4f46e5; color: white; padding: 14px 22px; font-weight: 800; cursor: pointer; }\n.panel { max-width: 1120px; margin: 24px auto 0; padding: 32px; border-radius: 20px; background: white; border: 1px solid #e2e8f0; }',
    js: 'document.getElementById("ctaButton")?.addEventListener("click", () => {\n  alert("Your custom JavaScript is working inside CollabOS.");\n});',
  }
  codeElement.style = { ...codeElement.style, width: '100%', minHeight: '720px' }

  return createProjectShell(ownerId, 'Custom Code Website', 'A website built with HTML, CSS, and JavaScript inside CollabOS.', [codeElement])
}

const templateElements: Record<string, () => BuilderElement[]> = {
  'saas-launch': () => [
    withContent(createBuilderElementCore('navbar'), { title: 'LaunchOS', buttonText: 'Book demo' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'Productivity platform', title: 'Launch your SaaS with a website that converts', subtitle: 'Show your product, explain your value, and turn visitors into qualified leads.', buttonText: 'Start free trial' }, '#eef2ff'),
    createBuilderElementCore('features'),
    createBuilderElementCore('pricing'),
    createBuilderElementCore('faq'),
    createBuilderElementCore('contact'),
    withContent(createBuilderElementCore('footer'), { title: 'LaunchOS' }),
  ],
  'portfolio-pro': () => [
    withContent(createBuilderElementCore('navbar'), { title: 'David Aluya', buttonText: 'Hire me' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'Independent builder', title: 'I design and build polished digital products', subtitle: 'A focused portfolio for case studies, services, testimonials, and contact.', buttonText: 'View work' }, '#ecfdf5'),
    createBuilderElementCore('gallery'),
    createBuilderElementCore('testimonials'),
    createBuilderElementCore('contact'),
    withContent(createBuilderElementCore('footer'), { title: 'Portfolio Pro' }),
  ],
  'agency-studio': () => [
    withContent(createBuilderElementCore('navbar'), { title: 'North Studio', buttonText: 'Start project' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'Creative agency', title: 'We build brands, websites, and campaigns that move markets', subtitle: 'A high-trust agency layout for services, proof, pricing, and inbound leads.', buttonText: 'Start a project' }, '#fff7ed'),
    createBuilderElementCore('features'),
    createBuilderElementCore('testimonials'),
    createBuilderElementCore('contact'),
    withContent(createBuilderElementCore('footer'), { title: 'North Studio' }),
  ],
  'ecommerce-shop': () => [
    withContent(createBuilderElementCore('navbar'), { title: 'Modern Goods', buttonText: 'Shop now' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'New collection', title: 'Premium products designed for everyday work', subtitle: 'Showcase products, reviews, and purchase paths in a polished store layout.', buttonText: 'Browse products' }, '#f0fdf4'),
    createBuilderElementCore('productGrid'),
    createBuilderElementCore('reviews'),
    createBuilderElementCore('checkout'),
    withContent(createBuilderElementCore('footer'), { title: 'Modern Goods' }),
  ],
  restaurant: () => [
    withContent(createBuilderElementCore('navbar'), { title: 'Mesa Kitchen', buttonText: 'Reserve' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'Fresh dining', title: 'Seasonal food, warm service, memorable nights', subtitle: 'A refined restaurant layout for menus, reservations, and location details.', buttonText: 'Book a table' }, '#fff7ed'),
    createBuilderElementCore('gallery'),
    createBuilderElementCore('features'),
    createBuilderElementCore('contact'),
    withContent(createBuilderElementCore('footer'), { title: 'Mesa Kitchen' }),
  ],
  hotel: () => [
    withContent(createBuilderElementCore('navbar'), { title: 'Harbor Hotel', buttonText: 'Book stay' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'Boutique stay', title: 'A calm base for business trips and weekend escapes', subtitle: 'Present rooms, amenities, location, and booking requests in one elegant site.', buttonText: 'Check availability' }, '#f0f9ff'),
    createBuilderElementCore('features'),
    createBuilderElementCore('testimonials'),
    createBuilderElementCore('contact'),
    withContent(createBuilderElementCore('footer'), { title: 'Harbor Hotel' }),
  ],
  blog: () => [
    withContent(createBuilderElementCore('navbar'), { title: 'Field Notes', buttonText: 'Subscribe' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'Ideas and essays', title: 'Sharp writing for builders, teams, and creative operators', subtitle: 'A clean editorial layout for posts, categories, quotes, and newsletter capture.', buttonText: 'Read latest' }, '#faf5ff'),
    createBuilderElementCore('features'),
    createBuilderElementCore('quote'),
    createBuilderElementCore('contact'),
    withContent(createBuilderElementCore('footer'), { title: 'Field Notes' }),
  ],
  'landing-page': () => [
    withContent(createBuilderElementCore('navbar'), { title: 'Signal', buttonText: 'Join waitlist' }),
    withContent(createBuilderElementCore('hero'), { eyebrow: 'Coming soon', title: 'The fastest way to validate your startup idea', subtitle: 'Capture early demand, explain the product, and build a launch audience.', buttonText: 'Join the waitlist' }, '#f5f3ff'),
    createBuilderElementCore('statistics'),
    createBuilderElementCore('faq'),
    createBuilderElementCore('contact'),
    withContent(createBuilderElementCore('footer'), { title: 'Signal' }),
  ],
}

export const createWebsiteFromTemplate = (templateId: string, ownerId = 'local-user') => {
  const template = templateCatalog.find((item) => item.id === templateId) || templateCatalog[0]
  return createProjectShell(ownerId, template.name, template.description, (templateElements[template.id] || templateElements['saas-launch'])())
}
