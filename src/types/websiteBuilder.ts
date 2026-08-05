export type BuilderBreakpoint = 'desktop' | 'laptop' | 'tablet' | 'mobile'
export type BuilderElementType =
  | 'section'
  | 'navbar'
  | 'sidebar'
  | 'megaMenu'
  | 'breadcrumb'
  | 'hero'
  | 'footer'
  | 'button'
  | 'text'
  | 'paragraph'
  | 'heading'
  | 'link'
  | 'quote'
  | 'badge'
  | 'image'
  | 'video'
  | 'icon'
  | 'svg'
  | 'lottie'
  | 'html'
  | 'card'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'team'
  | 'logos'
  | 'statistics'
  | 'contact'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'datePicker'
  | 'gallery'
  | 'grid'
  | 'flex'
  | 'columns'
  | 'stack'
  | 'container'
  | 'divider'
  | 'spacer'
  | 'accordion'
  | 'tabs'
  | 'carousel'
  | 'slider'
  | 'modal'
  | 'tooltip'
  | 'popover'
  | 'productCard'
  | 'productGrid'
  | 'cart'
  | 'checkout'
  | 'reviews'

export interface BuilderResponsiveStyle {
  width?: string
  height?: string
  minWidth?: string
  maxWidth?: string
  minHeight?: string
  maxHeight?: string
  padding?: string
  margin?: string
  gap?: string
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll'
  fontSize?: string
  lineHeight?: string
  letterSpacing?: string
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration?: 'none' | 'underline' | 'line-through'
  display?: 'block' | 'flex' | 'grid' | 'none'
  position?: 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed'
  zIndex?: string
  alignment?: 'left' | 'center' | 'right'
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline'
  alignContent?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'space-between'
  order?: string
  flexGrow?: string
  flexShrink?: string
  gridColumns?: string
  gridRows?: string
  gridAutoFlow?: 'row' | 'column' | 'dense'
  columnGap?: string
  rowGap?: string
  gridColumn?: string
  gridRow?: string
  opacity?: string
  backgroundImage?: string
  backgroundSize?: 'auto' | 'cover' | 'contain'
  backgroundPosition?: string
  transform?: string
  rotate?: string
  scale?: string
}

export interface BuilderElementStyle extends BuilderResponsiveStyle {
  color?: string
  background?: string
  backgroundGradient?: string
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  borderColor?: string
  borderWidth?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none'
  borderRadius?: string
  outline?: string
  shadow?: string
  textShadow?: string
  filter?: string
  hoverBackground?: string
  hoverColor?: string
  animation?: 'none' | 'fade' | 'slide-up' | 'scale'
  responsive?: Partial<Record<BuilderBreakpoint, BuilderResponsiveStyle>>
}

export interface BuilderElement {
  id: string
  type: BuilderElementType
  name: string
  locked?: boolean
  hidden?: boolean
  groupId?: string
  content: {
    text?: string
    eyebrow?: string
    title?: string
    subtitle?: string
    buttonText?: string
    link?: string
    imageUrl?: string
    videoUrl?: string
    html?: string
    css?: string
    js?: string
    items?: Array<{ title: string; description: string }>
  }
  style: BuilderElementStyle
  children?: BuilderElement[]
}

export interface WebsiteTheme {
  brandColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  headingFont: string
  buttonRadius: string
  cardRadius: string
  shadow: string
  spacing: string
}

export interface WebsiteSeo {
  title: string
  description: string
  keywords: string
  openGraphImage: string
  favicon: string
  canonicalUrl: string
}

export interface WebsiteAsset {
  id: string
  name: string
  type: 'image' | 'video' | 'icon' | 'svg' | 'font'
  url: string
  createdAt: string
}

export interface WebsiteVersion {
  id: string
  label: string
  createdAt: string
  project: Omit<WebsiteProject, 'versions'>
}

export interface WebsitePage {
  id: string
  name: string
  slug: string
  isHome?: boolean
  elements: BuilderElement[]
}

export interface WebsiteProject {
  id: string
  ownerId: string
  name: string
  description: string
  thumbnail: string
  customDomain: string
  status: 'draft' | 'published'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  theme: WebsiteTheme
  seo: WebsiteSeo
  assets: WebsiteAsset[]
  pages: WebsitePage[]
  versions?: WebsiteVersion[]
}
