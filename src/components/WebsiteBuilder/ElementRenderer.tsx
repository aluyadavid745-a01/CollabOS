import React from 'react'
import { Mail, Play, Star } from 'lucide-react'
import type { BuilderBreakpoint, BuilderElement } from '../../types/websiteBuilder'

interface ElementRendererProps {
  element: BuilderElement
  breakpoint?: BuilderBreakpoint
  selected?: boolean
  preview?: boolean
  onSelect?: (event: React.MouseEvent) => void
}

const mergeResponsiveStyle = (element: BuilderElement, breakpoint: BuilderBreakpoint) => ({
  ...element.style,
  ...(element.style.responsive?.[breakpoint] || {}),
})

const styleFor = (element: BuilderElement, breakpoint: BuilderBreakpoint): React.CSSProperties => {
  const style = mergeResponsiveStyle(element, breakpoint)
  return {
    color: style.color,
    background: style.backgroundGradient || style.background,
    backgroundImage: style.backgroundImage,
    backgroundSize: style.backgroundSize,
    backgroundPosition: style.backgroundPosition,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight as React.CSSProperties['fontWeight'],
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    textDecoration: style.textDecoration,
    textShadow: style.textShadow,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderStyle: style.borderStyle || (style.borderWidth ? 'solid' : undefined),
    borderRadius: style.borderRadius,
    outline: style.outline,
    boxShadow: style.shadow,
    width: style.width,
    height: style.height,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    minHeight: style.minHeight,
    maxHeight: style.maxHeight,
    padding: style.padding,
    margin: style.margin,
    gap: style.gap,
    overflow: style.overflow,
    position: style.position,
    zIndex: style.zIndex ? Number(style.zIndex) : undefined,
    textAlign: style.alignment,
    display: style.display,
    flexDirection: style.flexDirection,
    flexWrap: style.flexWrap,
    justifyContent: style.justifyContent,
    alignItems: style.alignItems,
    alignContent: style.alignContent,
    order: style.order ? Number(style.order) : undefined,
    flexGrow: style.flexGrow ? Number(style.flexGrow) : undefined,
    flexShrink: style.flexShrink ? Number(style.flexShrink) : undefined,
    gridTemplateColumns: style.gridColumns,
    gridTemplateRows: style.gridRows,
    gridAutoFlow: style.gridAutoFlow,
    columnGap: style.columnGap,
    rowGap: style.rowGap,
    gridColumn: style.gridColumn,
    gridRow: style.gridRow,
    opacity: style.opacity,
    filter: style.filter,
    transform: [style.transform, style.rotate ? `rotate(${style.rotate})` : '', style.scale ? `scale(${style.scale})` : ''].filter(Boolean).join(' ') || undefined,
  }
}

const ItemsGrid: React.FC<{ element: BuilderElement; breakpoint: BuilderBreakpoint }> = ({ element, breakpoint }) => (
  <section style={styleFor(element, breakpoint)}>
    <h2 className="mb-3 text-3xl font-black">{element.content.title || element.name}</h2>
    <p className="mb-6 text-slate-600">{element.content.subtitle || element.content.text}</p>
    <div className="grid gap-4 md:grid-cols-3">
      {(element.content.items || []).map((item) => (
        <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Star className="mb-3 h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-950">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
        </article>
      ))}
    </div>
  </section>
)

const sanitizeUrl = (url = '#') => {
  const value = Array.from(url.trim())
    .filter((char) => {
      const code = char.charCodeAt(0)
      return code > 31 && code !== 127 && !/\s/.test(char)
    })
    .join('')
  const lower = value.toLowerCase()

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('#') ||
    lower.startsWith('/') ||
    lower.startsWith('./') ||
    lower.startsWith('../') ||
    lower.startsWith('data:image/')
  ) {
    return value
  }

  return '#'
}

const sanitizeHtml = (html = '') => {
  if (typeof document === 'undefined') return ''

  const allowedTags = new Set([
    'A',
    'ABBR',
    'B',
    'BLOCKQUOTE',
    'BR',
    'CODE',
    'DIV',
    'EM',
    'FIGCAPTION',
    'FIGURE',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HR',
    'I',
    'IMG',
    'LI',
    'OL',
    'P',
    'PRE',
    'SECTION',
    'SMALL',
    'SPAN',
    'STRONG',
    'UL',
  ])
  const allowedAttributes = new Set(['alt', 'aria-label', 'class', 'href', 'rel', 'src', 'target', 'title'])
  const urlAttributes = new Set(['href', 'src'])
  const template = document.createElement('template')
  template.innerHTML = html

  const cleanElement = (element: Element) => {
    Array.from(element.children).forEach(cleanElement)

    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      if (name.startsWith('on') || !allowedAttributes.has(name)) {
        element.removeAttribute(attribute.name)
        return
      }

      if (urlAttributes.has(name)) {
        element.setAttribute(attribute.name, sanitizeUrl(attribute.value))
      }
    })

    if (element.tagName === 'A') {
      element.setAttribute('rel', 'noopener noreferrer')
    }
  }

  Array.from(template.content.children).forEach(cleanElement)
  return template.innerHTML
}

const codeSrcDoc = (element: BuilderElement) => `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${element.content.css || ''}</style>
  </head>
  <body>
    ${element.content.html || element.content.text || ''}
    <script>
      try {
        ${element.content.js || ''}
      } catch (error) {
        document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;left:16px;right:16px;bottom:16px;padding:12px;border-radius:12px;background:#fee2e2;color:#991b1b;white-space:pre-wrap;font-family:monospace;z-index:99999;">JS Error: ' + String(error.message || error) + '</pre>');
      }
    </script>
  </body>
</html>`

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, breakpoint = 'desktop', selected, preview, onSelect }) => {
  if (preview && element.hidden) return null

  const wrapperClass = preview
    ? ''
    : `relative cursor-pointer rounded-xl transition-all ${element.hidden ? 'opacity-40' : ''} ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-2 hover:ring-cyan-300'}`

  const content = (() => {
    if (element.type === 'navbar') {
      return (
        <nav style={styleFor(element, breakpoint)} className="flex items-center justify-between">
          <strong>{element.content.title || 'Brand'}</strong>
          <div className="hidden gap-5 text-sm md:flex">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <a href={sanitizeUrl(element.content.link || '#')} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-950">
            {element.content.buttonText || 'Contact'}
          </a>
        </nav>
      )
    }

    if (element.type === 'hero') {
      return (
        <section style={styleFor(element, breakpoint)}>
          <p className="mb-4 text-sm font-bold uppercase tracking-wider text-indigo-600">{element.content.eyebrow || 'Premium website'}</p>
          <h1 className="mx-auto max-w-3xl text-5xl font-black leading-tight text-slate-950">{element.content.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">{element.content.subtitle}</p>
          <a href={sanitizeUrl(element.content.link || '#')} className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">
            {element.content.buttonText || 'Get started'}
          </a>
        </section>
      )
    }

    if (element.type === 'heading') return <h2 style={styleFor(element, breakpoint)}>{element.content.text || element.content.title}</h2>
    if (element.type === 'text' || element.type === 'paragraph') return <p style={styleFor(element, breakpoint)}>{element.content.text}</p>
    if (element.type === 'link') return <a href={sanitizeUrl(element.content.link || '#')} style={styleFor(element, breakpoint)} className="font-bold text-indigo-600">{element.content.text || 'Link text'}</a>
    if (element.type === 'badge') return <span style={styleFor(element, breakpoint)} className="inline-flex font-bold">{element.content.text || element.content.title}</span>
    if (element.type === 'quote') return <blockquote style={styleFor(element, breakpoint)} className="text-xl font-bold italic">{element.content.text || element.content.title}</blockquote>
    if (element.type === 'button') {
      return (
        <a href={sanitizeUrl(element.content.link || '#')} style={styleFor(element, breakpoint)} className="inline-flex font-bold">
          {element.content.buttonText || element.content.text}
        </a>
      )
    }
    if (element.type === 'image') return <img src={sanitizeUrl(element.content.imageUrl)} alt={element.name} style={styleFor(element, breakpoint)} className="object-cover" />
    if (element.type === 'html') {
      if (element.content.css || element.content.js) {
        return (
          <iframe
            title={element.name}
            srcDoc={codeSrcDoc(element)}
            sandbox="allow-scripts allow-forms"
            style={styleFor(element, breakpoint)}
            className="min-h-[720px] w-full bg-white"
          />
        )
      }
      return <div style={styleFor(element, breakpoint)} dangerouslySetInnerHTML={{ __html: sanitizeHtml(element.content.html || element.content.text) }} />
    }
    if (element.type === 'video') {
      return (
        <div style={styleFor(element, breakpoint)} className="grid aspect-video place-items-center bg-slate-900 text-white">
          <Play className="mb-2 h-8 w-8" />
          <span className="text-sm">Video embed</span>
        </div>
      )
    }
    if (element.type === 'icon' || element.type === 'svg' || element.type === 'lottie') return <div style={styleFor(element, breakpoint)}><Star className="h-10 w-10 text-indigo-600" /></div>
    if (element.type === 'card') {
      return (
        <article style={styleFor(element, breakpoint)}>
          <h3 className="text-2xl font-bold">{element.content.title}</h3>
          <p className="mt-3 text-slate-600">{element.content.text}</p>
        </article>
      )
    }
    if (['features', 'testimonials', 'pricing', 'faq', 'gallery', 'team', 'logos', 'statistics', 'reviews', 'accordion', 'tabs', 'carousel', 'productGrid'].includes(element.type)) return <ItemsGrid element={element} breakpoint={breakpoint} />
    if (element.type === 'contact') {
      return (
        <section id="contact" style={styleFor(element, breakpoint)}>
          <h2 className="mb-3 text-3xl font-black">{element.content.title || 'Contact us'}</h2>
          <div className="grid gap-3">
            <input className="rounded-lg border border-slate-200 px-4 py-3" placeholder="Name" />
            <input className="rounded-lg border border-slate-200 px-4 py-3" placeholder="Email" />
            <textarea className="rounded-lg border border-slate-200 px-4 py-3" placeholder="Message" />
            <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-bold text-white">
              <Mail className="h-4 w-4" />
              Send
            </button>
          </div>
        </section>
      )
    }
    if (element.type === 'divider') return <div style={styleFor(element, breakpoint)} />
    if (element.type === 'spacer') return <div style={styleFor(element, breakpoint)} />
    if (['input', 'datePicker'].includes(element.type)) return <input type={element.type === 'datePicker' ? 'date' : 'text'} placeholder={element.content.text || element.name} style={styleFor(element, breakpoint)} />
    if (element.type === 'textarea') return <textarea placeholder={element.content.text || element.name} style={styleFor(element, breakpoint)} />
    if (element.type === 'select') return <select style={styleFor(element, breakpoint)}><option>{element.content.text || 'Select option'}</option></select>
    if (['checkbox', 'radio', 'switch'].includes(element.type)) return <label style={styleFor(element, breakpoint)} className="flex items-center gap-2"><input type={element.type === 'radio' ? 'radio' : 'checkbox'} />{element.content.text || element.name}</label>
    if (['section', 'container', 'grid', 'flex', 'columns', 'stack', 'sidebar', 'megaMenu', 'breadcrumb', 'cta', 'modal', 'tooltip', 'popover', 'productCard', 'cart', 'checkout'].includes(element.type)) {
      return (
        <section style={styleFor(element, breakpoint)}>
          <h3 className="text-2xl font-bold">{element.content.title || element.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{element.content.subtitle || element.content.text}</p>
          {element.type === 'checkout' && <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white">Continue</button>}
        </section>
      )
    }
    if (element.type === 'footer') return <footer style={styleFor(element, breakpoint)} className="text-center text-sm text-slate-500">© 2026 {element.content.title || 'Your brand'}</footer>

    return (
      <section style={styleFor(element, breakpoint)}>
        <h3 className="font-bold">{element.name}</h3>
        <p className="text-sm text-slate-600">{element.content.text}</p>
      </section>
    )
  })()

  return (
    <div className={wrapperClass} onClick={onSelect}>
      {!preview && selected && <span className="absolute -top-3 left-3 z-10 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">{element.name}</span>}
      {content}
    </div>
  )
}

export default ElementRenderer
