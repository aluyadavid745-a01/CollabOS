import React from 'react'
import { Copy, GripVertical, Plus, Trash2 } from 'lucide-react'
import ElementRenderer from './ElementRenderer'
import { useWebsiteBuilder } from '../../context/WebsiteBuilderContext'
import type { BuilderElement, BuilderElementType } from '../../types/websiteBuilder'

const widthByBreakpoint = {
  desktop: '100%',
  laptop: '1024px',
  tablet: '768px',
  mobile: '390px',
}

const freeMoveTypes = new Set<BuilderElementType>(['button', 'text', 'paragraph', 'heading', 'link', 'badge', 'quote', 'html'])

const readTranslate = (transform = '') => {
  const match = transform.match(/translate\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)/)
  return {
    x: match ? Number(match[1]) : 0,
    y: match ? Number(match[2]) : 0,
  }
}

const writeTranslate = (transform = '', x: number, y: number) => {
  const nextTranslate = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
  return transform.match(/translate\([^)]*\)/) ? transform.replace(/translate\([^)]*\)/, nextTranslate) : `${nextTranslate} ${transform}`.trim()
}

const BuilderCanvas: React.FC = () => {
  const { state, elements, dispatch } = useWebsiteBuilder()
  const [activeDropIndex, setActiveDropIndex] = React.useState<number | null>(null)
  const [movingElement, setMovingElement] = React.useState<{ id: string; dx: number; dy: number } | null>(null)

  const handleDrop = (event: React.DragEvent, index = elements.length) => {
    event.preventDefault()
    event.stopPropagation()
    const type = event.dataTransfer.getData('component/type') as BuilderElementType
    const from = Number(event.dataTransfer.getData('element/index'))

    if (type) {
      dispatch({ type: 'ADD_ELEMENT', elementType: type, index })
    } else if (!Number.isNaN(from) && from !== index && from + 1 !== index) {
      dispatch({ type: 'MOVE_ELEMENT', from, to: from < index ? index - 1 : index })
    }

    setActiveDropIndex(null)
  }

  const startFreeMove = (event: React.PointerEvent, element: BuilderElement) => {
    if (element.locked || !freeMoveTypes.has(element.type)) return

    const target = event.target as HTMLElement
    if (target.closest('[data-canvas-action="true"]')) return

    event.preventDefault()
    event.stopPropagation()
    dispatch({ type: 'SELECT_ELEMENT', id: element.id, multi: event.shiftKey })

    const startX = event.clientX
    const startY = event.clientY
    const base = readTranslate(element.style.transform)
    let didMove = false
    let currentX = base.x
    let currentY = base.y

    const handleMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / (state.zoom / 100)
      const dy = (moveEvent.clientY - startY) / (state.zoom / 100)
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didMove = true
      currentX = base.x + dx
      currentY = base.y + dy
      setMovingElement({ id: element.id, dx, dy })
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      setMovingElement(null)

      if (didMove) {
        dispatch({
          type: 'UPDATE_ELEMENT',
          id: element.id,
          patch: {
            style: {
              position: 'relative',
              transform: writeTranslate(element.style.transform, currentX, currentY),
            },
          },
        })
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp, { once: true })
  }

  return (
    <section className="flex min-w-0 flex-1 justify-center overflow-auto bg-slate-100 p-6">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(event)}
        className="min-h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xl transition-all"
        style={{
          width: widthByBreakpoint[state.breakpoint],
          transform: `scale(${state.zoom / 100})`,
          transformOrigin: 'top center',
        }}
      >
        {!elements.length && (
          <div
            onDragEnter={() => setActiveDropIndex(0)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, 0)}
            className={`grid min-h-[520px] place-items-center rounded-xl border-2 border-dashed text-center transition-colors ${
              activeDropIndex === 0 ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'
            }`}
          >
            <div>
              <Plus className="mx-auto mb-4 h-10 w-10 text-indigo-500" />
              <p className="text-xl font-black text-slate-950">Drop components here</p>
              <p className="mt-2 text-sm text-slate-500">Drag blocks from the left panel to start building.</p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {elements.length > 0 && (
            <div
              onDragEnter={() => setActiveDropIndex(0)}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setActiveDropIndex(null)}
              onDrop={(event) => handleDrop(event, 0)}
              className={`mb-2 grid h-8 place-items-center rounded-lg border border-dashed text-xs font-bold transition-colors ${
                activeDropIndex === 0 ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-transparent text-slate-300 hover:border-slate-300'
              }`}
            >
              Drop at top
            </div>
          )}
          {elements.map((element, index) => (
            <React.Fragment key={element.id}>
              <div
                className="group relative"
                onDragEnter={() => setActiveDropIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onPointerDown={(event) => startFreeMove(event, element)}
                style={
                  movingElement?.id === element.id
                    ? {
                        transform: `translate(${Math.round(movingElement.dx)}px, ${Math.round(movingElement.dy)}px)`,
                        cursor: 'grabbing',
                      }
                    : freeMoveTypes.has(element.type)
                      ? { cursor: element.locked ? 'not-allowed' : 'grab' }
                      : undefined
                }
              >
                <button
                  type="button"
                  draggable={!element.locked}
                  onDragStart={(event) => {
                    if (element.locked) return
                    event.dataTransfer.setData('element/index', String(index))
                    event.dataTransfer.effectAllowed = 'move'
                  }}
                  className={`absolute -left-10 top-3 z-20 hidden h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors group-hover:grid ${element.locked ? 'cursor-not-allowed opacity-50' : 'cursor-grab hover:text-indigo-600 active:cursor-grabbing'}`}
                  aria-label={`Drag ${element.name}`}
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                {state.selectedIds.includes(element.id) && (
                  <div className="absolute right-3 top-3 z-20 flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <button type="button" data-canvas-action="true" onClick={() => dispatch({ type: 'COPY_SELECTED' })} className="p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600" aria-label="Copy element">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button type="button" data-canvas-action="true" onClick={() => dispatch({ type: 'DUPLICATE_SELECTED' })} className="px-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600">
                      Duplicate
                    </button>
                    <button type="button" data-canvas-action="true" disabled={element.locked} onClick={() => dispatch({ type: 'DELETE_SELECTED' })} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Delete element">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <ElementRenderer
                  element={element}
                  breakpoint={state.breakpoint}
                  selected={state.selectedIds.includes(element.id)}
                  onSelect={(event) => {
                    event.stopPropagation()
                    dispatch({ type: 'SELECT_ELEMENT', id: element.id, multi: event.shiftKey })
                  }}
                />
              </div>
              <div
                onDragEnter={() => setActiveDropIndex(index + 1)}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setActiveDropIndex(null)}
                onDrop={(event) => handleDrop(event, index + 1)}
                className={`my-2 grid h-8 place-items-center rounded-lg border border-dashed text-xs font-bold transition-colors ${
                  activeDropIndex === index + 1
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-transparent text-slate-300 hover:border-slate-300'
                }`}
              >
                Drop here
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BuilderCanvas
