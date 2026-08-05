import {
  AlignJustify,
  Badge,
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronRight,
  Columns,
  CreditCard,
  FileCode,
  FileQuestion,
  FormInput,
  GalleryHorizontal,
  Heading1,
  Image,
  LayoutGrid,
  Link,
  Menu,
  MessageSquare,
  MousePointerClick,
  Navigation,
  PanelLeft,
  PanelTop,
  PlaySquare,
  Quote,
  Rows,
  Send,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Text,
  ToggleLeft,
  Type,
  Users,
} from 'lucide-react'
import type { BuilderElement, BuilderElementType } from '../types/websiteBuilder'
import { createStarterWebsite, createWebsiteFromTemplate, defaultSeo, defaultTheme, templateCatalog } from './websiteProjectFactory'

export { createStarterWebsite, createWebsiteFromTemplate, defaultSeo, defaultTheme }

export const builderComponents: Array<{
  type: BuilderElementType
  label: string
  category: 'Layout' | 'Navigation' | 'Typography' | 'Media' | 'Interactive' | 'Marketing' | 'Forms' | 'E-commerce'
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { type: 'section', label: 'Section', category: 'Layout', description: 'Full-width page area', icon: Rows },
  { type: 'container', label: 'Container', category: 'Layout', description: 'Centered content wrapper', icon: PanelTop },
  { type: 'grid', label: 'Grid', category: 'Layout', description: 'CSS grid layout', icon: LayoutGrid },
  { type: 'flex', label: 'Flex', category: 'Layout', description: 'Flexible row or column', icon: AlignJustify },
  { type: 'columns', label: 'Columns', category: 'Layout', description: 'Multi-column layout', icon: Columns },
  { type: 'stack', label: 'Stack', category: 'Layout', description: 'Vertical content stack', icon: Rows },
  { type: 'spacer', label: 'Spacer', category: 'Layout', description: 'Responsive spacing', icon: Type },
  { type: 'divider', label: 'Divider', category: 'Layout', description: 'Visual separator', icon: AlignJustify },
  { type: 'navbar', label: 'Navbar', category: 'Navigation', description: 'Top navigation bar', icon: Navigation },
  { type: 'sidebar', label: 'Sidebar', category: 'Navigation', description: 'Side navigation', icon: PanelLeft },
  { type: 'megaMenu', label: 'Mega Menu', category: 'Navigation', description: 'Large navigation dropdown', icon: Menu },
  { type: 'footer', label: 'Footer', category: 'Navigation', description: 'Footer navigation', icon: Rows },
  { type: 'breadcrumb', label: 'Breadcrumb', category: 'Navigation', description: 'Page path trail', icon: ChevronRight },
  { type: 'heading', label: 'Heading', category: 'Typography', description: 'Large title text', icon: Heading1 },
  { type: 'paragraph', label: 'Paragraph', category: 'Typography', description: 'Long-form copy', icon: Text },
  { type: 'text', label: 'Text', category: 'Typography', description: 'Small text block', icon: Text },
  { type: 'link', label: 'Link', category: 'Typography', description: 'Clickable text link', icon: Link },
  { type: 'quote', label: 'Quote', category: 'Typography', description: 'Pull quote block', icon: Quote },
  { type: 'badge', label: 'Badge', category: 'Typography', description: 'Small status label', icon: Badge },
  { type: 'image', label: 'Image', category: 'Media', description: 'Visual media', icon: Image },
  { type: 'gallery', label: 'Gallery', category: 'Media', description: 'Image gallery', icon: GalleryHorizontal },
  { type: 'video', label: 'Video', category: 'Media', description: 'Embedded video', icon: PlaySquare },
  { type: 'icon', label: 'Icon', category: 'Media', description: 'Simple icon block', icon: Star },
  { type: 'svg', label: 'SVG', category: 'Media', description: 'Vector graphic', icon: FileCode },
  { type: 'lottie', label: 'Lottie', category: 'Media', description: 'Animation placeholder', icon: Sparkles },
  { type: 'html', label: 'HTML Code', category: 'Media', description: 'Custom HTML and CSS', icon: FileCode },
  { type: 'button', label: 'Button', category: 'Interactive', description: 'Clickable action', icon: MousePointerClick },
  { type: 'accordion', label: 'Accordion', category: 'Interactive', description: 'Collapsible content', icon: FileQuestion },
  { type: 'tabs', label: 'Tabs', category: 'Interactive', description: 'Tabbed content', icon: PanelTop },
  { type: 'carousel', label: 'Carousel', category: 'Interactive', description: 'Sliding cards', icon: GalleryHorizontal },
  { type: 'slider', label: 'Slider', category: 'Interactive', description: 'Range control', icon: SlidersHorizontal },
  { type: 'modal', label: 'Modal', category: 'Interactive', description: 'Dialog layout', icon: MessageSquare },
  { type: 'tooltip', label: 'Tooltip', category: 'Interactive', description: 'Context hint', icon: MessageSquare },
  { type: 'popover', label: 'Popover', category: 'Interactive', description: 'Floating content', icon: MessageSquare },
  { type: 'hero', label: 'Hero', category: 'Marketing', description: 'Landing section', icon: Sparkles },
  { type: 'features', label: 'Features', category: 'Marketing', description: 'Feature grid', icon: LayoutGrid },
  { type: 'testimonials', label: 'Testimonials', category: 'Marketing', description: 'Social proof', icon: Quote },
  { type: 'pricing', label: 'Pricing', category: 'Marketing', description: 'Plan cards', icon: CreditCard },
  { type: 'faq', label: 'FAQ', category: 'Marketing', description: 'Questions list', icon: FileQuestion },
  { type: 'cta', label: 'CTA', category: 'Marketing', description: 'Conversion banner', icon: MousePointerClick },
  { type: 'team', label: 'Team', category: 'Marketing', description: 'People grid', icon: Users },
  { type: 'logos', label: 'Logos', category: 'Marketing', description: 'Brand strip', icon: Rows },
  { type: 'statistics', label: 'Statistics', category: 'Marketing', description: 'Metric cards', icon: BarChart3 },
  { type: 'contact', label: 'Contact Form', category: 'Forms', description: 'Lead form section', icon: Send },
  { type: 'input', label: 'Input', category: 'Forms', description: 'Text input', icon: FormInput },
  { type: 'textarea', label: 'Textarea', category: 'Forms', description: 'Long text input', icon: FormInput },
  { type: 'select', label: 'Select', category: 'Forms', description: 'Dropdown field', icon: FormInput },
  { type: 'checkbox', label: 'Checkbox', category: 'Forms', description: 'Checkbox field', icon: CheckSquare },
  { type: 'radio', label: 'Radio', category: 'Forms', description: 'Radio option', icon: CheckSquare },
  { type: 'switch', label: 'Switch', category: 'Forms', description: 'Toggle input', icon: ToggleLeft },
  { type: 'datePicker', label: 'Date Picker', category: 'Forms', description: 'Date input', icon: Calendar },
  { type: 'productCard', label: 'Product Card', category: 'E-commerce', description: 'Single product block', icon: ShoppingCart },
  { type: 'productGrid', label: 'Product Grid', category: 'E-commerce', description: 'Product collection', icon: LayoutGrid },
  { type: 'cart', label: 'Cart', category: 'E-commerce', description: 'Cart summary', icon: ShoppingCart },
  { type: 'checkout', label: 'Checkout', category: 'E-commerce', description: 'Checkout form', icon: CreditCard },
  { type: 'reviews', label: 'Reviews', category: 'E-commerce', description: 'Product reviews', icon: Star },
]

const createItems = (label: string) => [
  { title: `${label} One`, description: 'Describe the value your website visitors should understand.' },
  { title: `${label} Two`, description: 'Keep the content focused, useful, and easy to scan.' },
  { title: `${label} Three`, description: 'Add proof, clarity, and a strong reason to act.' },
]

const elementId = (type: BuilderElementType) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createBuilderElement = (type: BuilderElementType): BuilderElement => {
  const base: BuilderElement = {
    id: elementId(type),
    type,
    name: builderComponents.find((item) => item.type === type)?.label || type,
    content: {
      text: 'Edit this content from the properties panel.',
      title: 'Build a better website',
      subtitle: 'Create beautiful pages visually with CollabOS.',
      buttonText: 'Get started',
      link: '#',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      html: '<section class="custom-html-section"><h2>Custom HTML section</h2><p>Edit this HTML in the properties panel.</p><a href="#">Call to action</a></section><style>.custom-html-section{padding:48px;border-radius:18px;background:#eef2ff;color:#0f172a}.custom-html-section h2{font-size:36px;margin:0 0 12px;font-weight:800}.custom-html-section p{font-size:16px;line-height:1.7}.custom-html-section a{display:inline-flex;margin-top:16px;padding:12px 18px;border-radius:12px;background:#4f46e5;color:white;text-decoration:none;font-weight:700}</style>',
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
    base.content = { title: 'Brand', buttonText: 'Contact', link: '#' }
    base.style = { ...base.style, background: '#0f172a', color: '#ffffff', padding: '18px 28px' }
  }

  if (type === 'hero') base.style = { ...base.style, background: '#eef2ff', padding: '72px 48px', alignment: 'center' }
  if (type === 'section') base.style = { ...base.style, background: '#f8fafc', padding: '56px 32px' }
  if (type === 'stack') base.style = { ...base.style, display: 'flex', flexDirection: 'column', gap: '16px' }
  if (type === 'grid' || type === 'productGrid') base.style = { ...base.style, display: 'grid', gridColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }
  if (type === 'flex' || type === 'columns') base.style = { ...base.style, display: 'flex', flexDirection: 'row', gap: '16px' }

  if (type === 'button') {
    base.content = { buttonText: 'Click me', link: '#' }
    base.style = { ...base.style, background: '#4f46e5', color: '#ffffff', width: 'fit-content', padding: '14px 22px', borderRadius: '12px' }
  }

  if (type === 'badge') base.style = { ...base.style, width: 'fit-content', padding: '8px 12px', borderRadius: '999px', background: '#eef2ff', color: '#4f46e5' }
  if (type === 'quote') base.style = { ...base.style, borderWidth: '0 0 0 4px', borderColor: '#4f46e5', background: '#f8fafc' }
  if (type === 'html') base.style = { ...base.style, padding: '0', borderWidth: '0', shadow: 'none', background: 'transparent' }
  if (type === 'input' || type === 'textarea' || type === 'select' || type === 'datePicker') base.style = { ...base.style, padding: '14px 16px', borderRadius: '10px', shadow: 'none' }

  if (['features', 'testimonials', 'pricing', 'faq', 'team', 'logos', 'statistics', 'reviews', 'accordion', 'tabs', 'carousel'].includes(type)) {
    base.content.items = createItems(base.name)
  }

  if (type === 'divider') base.style = { ...base.style, height: '1px', background: '#e2e8f0', padding: '0', shadow: 'none' }
  if (type === 'container' || type === 'grid' || type === 'flex' || type === 'columns' || type === 'stack' || type === 'section') base.children = []

  return base
}

export const websiteTemplates = templateCatalog
