import React from 'react'
import { Copy, Eye, EyeOff, Layers, Lock, Sparkles, Trash2, Unlock } from 'lucide-react'
import { useWebsiteBuilder } from '../../context/WebsiteBuilderContext'
import type { BuilderElementStyle, BuilderResponsiveStyle } from '../../types/websiteBuilder'

const fieldClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500'

const textFields = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textShadow']
const layoutFields = ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'padding', 'margin', 'gap', 'zIndex']
const borderFields = ['borderWidth', 'borderRadius', 'outline', 'shadow']
const transformFields = ['opacity', 'filter', 'transform', 'rotate', 'scale', 'backgroundImage', 'backgroundPosition']

const PropertiesPanel: React.FC = () => {
  const { selectedElement, state, dispatch } = useWebsiteBuilder()
  const project = state.project

  const updateTheme = (key: string, value: string) => dispatch({ type: 'UPDATE_THEME', patch: { [key]: value } })
  const updateSeo = (key: string, value: string) => dispatch({ type: 'UPDATE_SEO', patch: { [key]: value } })
  const applyCrispTheme = () => {
    dispatch({
      type: 'UPDATE_THEME',
      patch: {
        brandColor: '#2563eb',
        accentColor: '#0891b2',
        backgroundColor: '#f8fafc',
        textColor: '#0f172a',
        buttonRadius: '10px',
        cardRadius: '8px',
        shadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
      },
    })
  }
  const addAiSection = () => dispatch({ type: 'ADD_ELEMENT', elementType: 'cta' })

  if (!selectedElement) {
    return (
      <aside className="w-full overflow-auto border-l border-slate-200 bg-white lg:w-96">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Project</p>
          <h2 className="text-lg font-black text-slate-950">Theme & SEO</h2>
        </div>
        <div className="space-y-5 p-4">
          <section className="space-y-3">
            <h3 className="font-bold text-slate-950">Theme Manager</h3>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
              <p className="mb-3 flex items-center gap-2 text-sm font-black text-indigo-700">
                <Sparkles className="h-4 w-4" />
                AI Assistant
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={applyCrispTheme} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:text-indigo-700">
                  Clean theme
                </button>
                <button type="button" onClick={addAiSection} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:text-indigo-700">
                  Add CTA
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['brandColor', 'Brand'],
                ['accentColor', 'Accent'],
                ['backgroundColor', 'Page'],
                ['textColor', 'Text'],
              ].map(([key, label]) => (
                <label key={key} className={labelClass}>
                  {label}
                  <input type="color" value={String(project?.theme?.[key as keyof typeof project.theme] || '#ffffff')} onChange={(event) => updateTheme(key, event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200" />
                </label>
              ))}
            </div>
            {['fontFamily', 'headingFont', 'buttonRadius', 'cardRadius', 'shadow', 'spacing'].map((field) => (
              <label key={field} className={labelClass}>
                {field}
                <input value={String(project?.theme?.[field as keyof typeof project.theme] || '')} onChange={(event) => updateTheme(field, event.target.value)} className={fieldClass} />
              </label>
            ))}
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-5">
            <h3 className="font-bold text-slate-950">SEO</h3>
            {['title', 'description', 'keywords', 'openGraphImage', 'favicon', 'canonicalUrl'].map((field) => (
              <label key={field} className={labelClass}>
                {field}
                <input value={String(project?.seo?.[field as keyof typeof project.seo] || '')} onChange={(event) => updateSeo(field, event.target.value)} className={fieldClass} />
              </label>
            ))}
          </section>

          <div className="grid min-h-[180px] place-items-center rounded-xl border border-dashed border-slate-300 text-center">
            <div>
              <Layers className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="font-bold text-slate-900">Select an element</p>
              <p className="mt-1 px-5 text-sm text-slate-500">Then edit content, layout, typography, effects, and responsive behavior.</p>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  const updateContent = (key: string, value: string) => {
    dispatch({ type: 'UPDATE_ELEMENT', id: selectedElement.id, patch: { content: { [key]: value } } })
  }

  const updateStyle = (key: string, value: string) => {
    dispatch({ type: 'UPDATE_ELEMENT', id: selectedElement.id, patch: { style: { [key]: value } as Partial<BuilderElementStyle> } })
  }

  const updateResponsiveStyle = (key: string, value: string) => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      id: selectedElement.id,
      patch: {
        style: {
          responsive: {
            ...selectedElement.style.responsive,
            [state.breakpoint]: {
              ...(selectedElement.style.responsive?.[state.breakpoint] || {}),
              [key]: value,
            },
          },
        },
      },
    })
  }

  const improveSelectedCopy = () => {
    const title = selectedElement.content.title || selectedElement.content.text || selectedElement.name
    const subtitle = selectedElement.content.subtitle || selectedElement.content.text || ''
    dispatch({
      type: 'UPDATE_ELEMENT',
      id: selectedElement.id,
      patch: {
        content: {
          title: title ? `${title.replace(/[.!?]+$/, '')}` : 'Build something people remember',
          subtitle: subtitle
            ? `${subtitle.replace(/[.!?]+$/, '')}. Clear, useful, and ready to launch.`
            : 'A sharper section with clearer value, stronger structure, and a direct next step.',
          buttonText: selectedElement.content.buttonText || 'Get started',
        },
      },
    })
  }

  const makeSelectedMobileFriendly = () => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      id: selectedElement.id,
      patch: {
        style: {
          responsive: {
            ...selectedElement.style.responsive,
            mobile: {
              ...(selectedElement.style.responsive?.mobile || {}),
              padding: '32px 18px',
              gridColumns: '1fr',
              flexDirection: 'column',
              gap: '18px',
              alignment: 'center',
              fontSize: selectedElement.type === 'hero' ? '36px' : selectedElement.style.fontSize,
            },
          },
        },
      },
    })
  }

  return (
    <aside className="w-full overflow-auto border-l border-slate-200 bg-white lg:w-96">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Properties</p>
        <input
          value={selectedElement.name}
          onChange={(event) => dispatch({ type: 'RENAME_ELEMENT', id: selectedElement.id, name: event.target.value })}
          className="w-full text-lg font-black text-slate-950 outline-none"
        />
        <p className="text-xs text-slate-500">{selectedElement.type}</p>
      </div>

      <div className="space-y-5 p-4">
        <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
          <p className="mb-3 flex items-center gap-2 text-sm font-black text-indigo-700">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={improveSelectedCopy} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:text-indigo-700">
              Improve copy
            </button>
            <button type="button" onClick={makeSelectedMobileFriendly} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:text-indigo-700">
              Mobile fit
            </button>
            <button type="button" onClick={applyCrispTheme} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:text-indigo-700">
              Clean theme
            </button>
            <button type="button" onClick={addAiSection} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:text-indigo-700">
              Add CTA
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => dispatch({ type: 'TOGGLE_ELEMENT_HIDDEN', id: selectedElement.id })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            {selectedElement.hidden ? <EyeOff className="mr-2 inline h-4 w-4" /> : <Eye className="mr-2 inline h-4 w-4" />}
            {selectedElement.hidden ? 'Hidden' : 'Visible'}
          </button>
          <button type="button" onClick={() => dispatch({ type: 'TOGGLE_ELEMENT_LOCK', id: selectedElement.id })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            {selectedElement.locked ? <Lock className="mr-2 inline h-4 w-4" /> : <Unlock className="mr-2 inline h-4 w-4" />}
            {selectedElement.locked ? 'Locked' : 'Unlocked'}
          </button>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-950">Content</h3>
          {selectedElement.type === 'html' && (
            <div className="space-y-3">
              {[
                ['html', 'HTML', '<section><h1>Hello</h1></section>'],
                ['css', 'CSS', 'h1 { color: #4f46e5; }'],
                ['js', 'JavaScript', 'console.log("Hello from CollabOS");'],
              ].map(([field, label, placeholder]) => (
                <label key={field} className={labelClass}>
                  {label}
                  <textarea
                    value={String(selectedElement.content[field as keyof typeof selectedElement.content] || '')}
                    onChange={(event) => updateContent(field, event.target.value)}
                    spellCheck={false}
                    className="mt-1 min-h-[180px] w-full resize-y rounded-lg border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-indigo-400"
                    placeholder={placeholder}
                  />
                </label>
              ))}
            </div>
          )}
          {['eyebrow', 'title', 'subtitle', 'text', 'buttonText', 'link', 'imageUrl', 'videoUrl'].map((field) => (
            <label key={field} className={labelClass}>
              {field}
              <input value={String(selectedElement.content[field as keyof typeof selectedElement.content] || '')} onChange={(event) => updateContent(field, event.target.value)} className={fieldClass} />
            </label>
          ))}
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-slate-950">Colors & Background</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['color', 'Text'],
              ['background', 'Background'],
              ['borderColor', 'Border'],
              ['hoverBackground', 'Hover bg'],
              ['hoverColor', 'Hover text'],
            ].map(([key, label]) => (
              <label key={key} className={labelClass}>
                {label}
                <input type="color" value={String(selectedElement.style[key as keyof typeof selectedElement.style] || '#ffffff')} onChange={(event) => updateStyle(key, event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200" />
              </label>
            ))}
          </div>
          <label className={labelClass}>
            backgroundGradient
            <input value={selectedElement.style.backgroundGradient || ''} onChange={(event) => updateStyle('backgroundGradient', event.target.value)} className={fieldClass} placeholder="linear-gradient(...)" />
          </label>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-slate-950">Typography</h3>
          {textFields.map((field) => (
            <label key={field} className={labelClass}>
              {field}
              <input value={String(selectedElement.style[field as keyof typeof selectedElement.style] || '')} onChange={(event) => updateStyle(field, event.target.value)} className={fieldClass} />
            </label>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Transform
              <select value={selectedElement.style.textTransform || 'none'} onChange={(event) => updateStyle('textTransform', event.target.value)} className={fieldClass}>
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </label>
            <label className={labelClass}>
              Decoration
              <select value={selectedElement.style.textDecoration || 'none'} onChange={(event) => updateStyle('textDecoration', event.target.value)} className={fieldClass}>
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Line through</option>
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-slate-950">Layout</h3>
          {layoutFields.map((field) => (
            <label key={field} className={labelClass}>
              {field}
              <input value={String(selectedElement.style[field as keyof typeof selectedElement.style] || '')} onChange={(event) => updateStyle(field, event.target.value)} className={fieldClass} />
            </label>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Display
              <select value={selectedElement.style.display || 'block'} onChange={(event) => updateStyle('display', event.target.value)} className={fieldClass}>
                <option value="block">Block</option>
                <option value="flex">Flex</option>
                <option value="grid">Grid</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className={labelClass}>
              Position
              <select value={selectedElement.style.position || 'relative'} onChange={(event) => updateStyle('position', event.target.value)} className={fieldClass}>
                <option value="static">Static</option>
                <option value="relative">Relative</option>
                <option value="absolute">Absolute</option>
                <option value="sticky">Sticky</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
          </div>
          <label className={labelClass}>
            Overflow
            <select value={selectedElement.style.overflow || 'visible'} onChange={(event) => updateStyle('overflow', event.target.value)} className={fieldClass}>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="auto">Auto</option>
              <option value="scroll">Scroll</option>
            </select>
          </label>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-slate-950">Flex & Grid</h3>
          {['flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent', 'order', 'flexGrow', 'flexShrink', 'gridColumns', 'gridRows', 'gridAutoFlow', 'columnGap', 'rowGap', 'gridColumn', 'gridRow'].map((field) => (
            <label key={field} className={labelClass}>
              {field}
              <input value={String(selectedElement.style[field as keyof typeof selectedElement.style] || '')} onChange={(event) => updateStyle(field, event.target.value)} className={fieldClass} />
            </label>
          ))}
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-slate-950">Border, Effects & Animation</h3>
          {borderFields.concat(transformFields).map((field) => (
            <label key={field} className={labelClass}>
              {field}
              <input value={String(selectedElement.style[field as keyof typeof selectedElement.style] || '')} onChange={(event) => updateStyle(field, event.target.value)} className={fieldClass} />
            </label>
          ))}
          <label className={labelClass}>
            Animation
            <select value={selectedElement.style.animation || 'none'} onChange={(event) => updateStyle('animation', event.target.value)} className={fieldClass}>
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide-up">Slide up</option>
              <option value="scale">Scale</option>
            </select>
          </label>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-slate-950">Responsive ({state.breakpoint})</h3>
          {['width', 'height', 'fontSize', 'padding', 'margin', 'display'].map((field) => (
            <label key={field} className={labelClass}>
              {field}
              <input value={String(selectedElement.style.responsive?.[state.breakpoint]?.[field as keyof BuilderResponsiveStyle] || '')} onChange={(event) => updateResponsiveStyle(field, event.target.value)} className={fieldClass} />
            </label>
          ))}
        </section>

        <section className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-5">
          <button type="button" onClick={() => dispatch({ type: 'COPY_SELECTED' })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Copy className="mx-auto h-4 w-4" />
          </button>
          <button type="button" onClick={() => dispatch({ type: 'DUPLICATE_SELECTED' })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Duplicate
          </button>
          <button type="button" onClick={() => dispatch({ type: 'DELETE_SELECTED' })} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
            <Trash2 className="mx-auto h-4 w-4" />
          </button>
        </section>
      </div>
    </aside>
  )
}

export default PropertiesPanel
