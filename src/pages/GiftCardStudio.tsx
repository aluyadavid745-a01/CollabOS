import React from 'react'
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  Image as ImageIcon,
  QrCode,
  Save,
  Send,
  Smartphone,
  Trash2,
  Wifi,
} from 'lucide-react'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'

type Network = 'MTN' | 'Airtel' | 'Glo' | '9mobile'
type DeliveryMode = 'airtime' | 'data' | 'combo'
type StudioStep = 1 | 2 | 3

type GiftCardDraft = {
  title: string
  message: string
  recipientEmail: string
  sender: string
  network: Network
  deliveryMode: DeliveryMode
  airtimeAmount: number
  dataAmountGb: number
  quantity: number
  styleId: string
  imageDataUrl: string
  backNote: string
}

type GiftCardOrder = GiftCardDraft & {
  id: string
  createdAt: string
  total: number
  serviceFee: number
  voucherCode: string
  ussdCode: string
  dummyPaymentRef: string
}

const STORAGE_KEY = 'collabos:dummyGiftCards'
const TEXT_LIMIT = 60
const MESSAGE_LIMIT = 60

const styles = [
  {
    id: 'ceremonial',
    label: 'Ceremonial',
    description: 'Quiet and personal',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)',
    swatch: 'linear-gradient(135deg, #050807 0%, #172019 100%)',
    accent: '#111827',
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    description: 'Warm and intimate',
    background: 'linear-gradient(135deg, #fff7ed 0%, #fdf2f8 100%)',
    swatch: 'linear-gradient(135deg, #541225 0%, #7f1d1d 100%)',
    accent: '#7f1d1d',
  },
  {
    id: 'birthday',
    label: 'Birthday',
    description: 'Bright and playful',
    background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 52%, #ede9fe 100%)',
    swatch: 'linear-gradient(135deg, #fb7185 0%, #ec4899 52%, #8b5cf6 100%)',
    accent: '#be185d',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Simple and direct',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    swatch: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    accent: '#0f172a',
  },
  {
    id: 'photo',
    label: 'Brand promo',
    description: 'Image-led card',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    swatch: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
    accent: '#2563eb',
  },
]

const initialDraft: GiftCardDraft = {
  title: 'A little airtime for you',
  message: 'A little something to keep you talking.',
  recipientEmail: '',
  sender: 'CollabOS',
  network: 'MTN',
  deliveryMode: 'airtime',
  airtimeAmount: 1000,
  dataAmountGb: 2,
  quantity: 10,
  styleId: 'ceremonial',
  imageDataUrl: '',
  backNote: 'Use this simulated voucher code to claim the dummy gift.',
}

const networkPrefixes: Record<Network, string> = {
  MTN: '*555',
  Airtel: '*126',
  Glo: '*123',
  '9mobile': '*232',
}

function readOrders(): GiftCardOrder[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeOrders(orders: GiftCardOrder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function money(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}

function makeCode(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`
}

function limitText(value: string, limit: number) {
  return value.slice(0, limit)
}

const StepMeter = ({ step }: { step: StudioStep }) => (
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((item) => (
        <span
          key={item}
          className={`h-2 rounded-full transition-all ${item === step ? 'w-10 bg-sky-500' : 'w-6 bg-slate-300'}`}
        />
      ))}
    </div>
    <span className="text-sm font-bold text-slate-500">Step {step} of 3</span>
  </div>
)

const GiftCardStudio: React.FC = () => {
  const { profile, firebaseUser } = useAuth()
  const [draft, setDraft] = React.useState<GiftCardDraft>(() => ({
    ...initialDraft,
    recipientEmail: firebaseUser?.email || '',
    sender: profile?.name || initialDraft.sender,
  }))
  const [orders, setOrders] = React.useState<GiftCardOrder[]>(() => readOrders())
  const [step, setStep] = React.useState<StudioStep>(1)
  const [activeSide, setActiveSide] = React.useState<'front' | 'back'>('front')
  const [status, setStatus] = React.useState('')
  const latestOrder = orders[0]
  const selectedStyle = styles.find((item) => item.id === draft.styleId) || styles[0]

  const subtotal =
    (draft.deliveryMode === 'data' ? 0 : draft.airtimeAmount * draft.quantity) +
    (draft.deliveryMode === 'airtime' ? 0 : draft.dataAmountGb * 450 * draft.quantity)
  const serviceFee = 0
  const total = subtotal + serviceFee

  const updateDraft = <Key extends keyof GiftCardDraft>(key: Key, value: GiftCardDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      updateDraft('imageDataUrl', typeof reader.result === 'string' ? reader.result : '')
    }
    reader.readAsDataURL(file)
  }

  const createOrder = () => {
    const voucherCode = makeCode('GIFT')
    const ussdCode = `${networkPrefixes[draft.network]}*${voucherCode.replace(/-/g, '').slice(-10)}#`
    const order: GiftCardOrder = {
      ...draft,
      id: makeCode('CARD'),
      createdAt: new Date().toISOString(),
      total,
      serviceFee,
      voucherCode,
      ussdCode,
      dummyPaymentRef: makeCode('PAY'),
    }
    const nextOrders = [order, ...orders].slice(0, 8)
    setOrders(nextOrders)
    writeOrders(nextOrders)
    setStatus('Dummy payment approved. Gift card codes generated.')
  }

  const copyOrder = async (order: GiftCardOrder | null) => {
    if (!order) return

    const text = `${order.title}\n${order.message}\nCards: ${order.quantity} x ${money(order.airtimeAmount)}\nVoucher: ${order.voucherCode}\nUSSD: ${order.ussdCode}\nDummy payment: ${order.dummyPaymentRef}`
    await navigator.clipboard.writeText(text)
    setStatus('Gift card details copied.')
  }

  const downloadOrder = (order: GiftCardOrder | null) => {
    if (!order) return

    const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${order.title.toLowerCase().replace(/\W+/g, '-')}-dummy-gift-card.json`
    link.click()
    URL.revokeObjectURL(url)
    setStatus('Dummy card file downloaded.')
  }

  const clearOrders = () => {
    setOrders([])
    writeOrders([])
    setStatus('Saved dummy cards cleared.')
  }

  const resetDraft = () => {
    setDraft({
      ...initialDraft,
      recipientEmail: firebaseUser?.email || '',
      sender: profile?.name || initialDraft.sender,
    })
    setStep(1)
    setActiveSide('front')
    setStatus('')
  }

  const previewOrder = latestOrder || {
    ...draft,
    voucherCode: 'GIFT-PREVIEW-CODE',
    ussdCode: `${networkPrefixes[draft.network]}*0000000000#`,
    dummyPaymentRef: 'PAY-PREVIEW',
  }

  const nextStep = () => setStep((current) => (current === 1 ? 2 : current === 2 ? 3 : 3))
  const previousStep = () => setStep((current) => (current === 3 ? 2 : current === 2 ? 1 : 1))

  return (
    <main className="min-h-screen bg-white pb-36 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-2xl font-black">
            <Gift className="h-6 w-6 text-sky-500" />
            <span className="bg-gradient-to-r from-fuchsia-600 to-amber-400 bg-clip-text text-transparent">Airtify</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <a href="#created-cards" className="hover:text-slate-950">Orders</a>
            <button type="button" onClick={resetDraft} className="hover:text-slate-950">Reset</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[742px] px-4 py-7">
        {status && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            <BadgeCheck className="h-4 w-4" />
            {status}
          </div>
        )}

        <section>
          <article
            className="relative aspect-[1.9/1] w-full overflow-hidden rounded-xl border border-slate-200 bg-[#f4f5f7] p-8 shadow-sm"
            style={{ background: selectedStyle.background }}
          >
            {activeSide === 'front' ? (
              <div className="relative flex h-full min-w-0 flex-col justify-between">
                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-700">A gift for you</p>
                    <h1
                      className="mt-4 max-w-[13ch] text-4xl font-black leading-[0.98] text-slate-950 md:text-[40px]"
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      {draft.title || 'Any text you want'}
                    </h1>
                    {draft.message && (
                      <p
                        className="mt-4 max-w-[30ch] text-sm font-semibold leading-6 text-slate-500"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {draft.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="rounded-lg border border-slate-300 bg-white/70 px-4 py-3 font-mono text-base font-black tracking-[0.42em] text-slate-950">
                      .... .... ....
                    </div>
                    <p className="text-4xl font-black text-slate-500">{money(draft.airtimeAmount).replace('NGN', 'N').replace(/\d[\d,]*/, '--')}</p>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500">
                    Dial *258*PIN# to load or redeem at airtify.app/redeem
                  </p>
                </div>
                {draft.imageDataUrl && (
                  <div className="absolute right-0 top-0 h-full w-[36%] overflow-hidden rounded-lg border border-white/70 bg-white/50">
                    <img src={draft.imageDataUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid h-full gap-5 md:grid-cols-[1fr_190px]">
                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: selectedStyle.accent }}>
                      Dummy claim details
                    </p>
                    <h2 className="mt-3 text-3xl font-black text-slate-950">{previewOrder.network} {previewOrder.deliveryMode} gift</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{draft.backNote}</p>
                  </div>
                  <div className="space-y-2 text-sm font-bold text-slate-700">
                    <p>Voucher: <span className="font-black text-slate-950">{previewOrder.voucherCode}</span></p>
                    <p>USSD: <span className="font-black text-slate-950">{previewOrder.ussdCode}</span></p>
                    <p>Ref: <span className="font-black text-slate-950">{previewOrder.dummyPaymentRef}</span></p>
                  </div>
                </div>
                <div className="grid place-items-center rounded-lg border border-slate-200 bg-white/80 p-4 text-center">
                  <QrCode className="h-24 w-24 text-slate-950" />
                  <p className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500">Preview QR</p>
                </div>
              </div>
            )}
          </article>
          <p className="mt-3 text-sm font-bold text-slate-500">Choose a style, enter any text, add a photo if you want.</p>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <StepMeter step={step} />
            <button type="button" onClick={resetDraft} className="text-sm font-bold text-slate-500 hover:text-slate-950">Reset</button>
          </div>

          {step === 1 && (
            <div className="mt-8">
              <h2 className="text-2xl font-black">Design the card</h2>
              <div className="mt-6">
                <p className="text-sm font-black text-slate-500">Choose a style</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {styles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateDraft('styleId', item.id)}
                      className={`overflow-hidden rounded-lg border text-left transition ${
                        draft.styleId === item.id ? 'border-slate-950 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="block h-[66px]" style={{ background: item.swatch }} />
                      <span className="block px-3 py-3">
                        <span className="block text-sm font-black text-slate-900">{item.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500">{selectedStyle.description}</p>
              </div>

              <div className="mt-7 space-y-5">
                <label className="block">
                  <span className="flex justify-between text-sm font-black text-slate-500">
                    <span>Headline</span>
                    <span>{draft.title.length}/{TEXT_LIMIT}</span>
                  </span>
                  <textarea
                    value={draft.title}
                    maxLength={TEXT_LIMIT}
                    onChange={(event) => updateDraft('title', limitText(event.target.value, TEXT_LIMIT))}
                    rows={2}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-4 text-lg font-bold text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Any short headline"
                  />
                  <span className="mt-2 block text-sm font-bold text-slate-500">Two lines work best. Long text is capped so the card stays fixed.</span>
                </label>

                <label className="block">
                  <span className="flex justify-between text-sm font-black text-slate-500">
                    <span>Message</span>
                    <span>{draft.message.length}/{MESSAGE_LIMIT}</span>
                  </span>
                  <textarea
                    value={draft.message}
                    maxLength={MESSAGE_LIMIT}
                    onChange={(event) => updateDraft('message', limitText(event.target.value, MESSAGE_LIMIT))}
                    rows={2}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-4 text-lg font-bold text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Any short message"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-500">Photo <span className="font-bold">(optional)</span></span>
                  <span className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-slate-300 px-5 py-5 hover:bg-slate-50">
                    <span className="grid h-16 w-16 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <ImageIcon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block text-base font-black text-slate-950">Drag a photo here, or click to browse</span>
                      <span className="mt-1 block text-sm font-bold text-slate-500">JPEG, PNG, or WebP. The preview crops it neatly inside the card image panel.</span>
                    </span>
                    <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8">
              <h2 className="text-2xl font-black">Choose the gift value</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-500">
                  Network
                  <select value={draft.network} onChange={(event) => updateDraft('network', event.target.value as Network)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-4 text-base font-bold text-slate-950 outline-none focus:border-sky-500">
                    <option>MTN</option>
                    <option>Airtel</option>
                    <option>Glo</option>
                    <option>9mobile</option>
                  </select>
                </label>
                <label className="block text-sm font-black text-slate-500">
                  Number of cards
                  <input type="number" min="1" max="100" value={draft.quantity} onChange={(event) => updateDraft('quantity', Math.max(1, Number(event.target.value)))} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-4 text-base font-bold text-slate-950 outline-none focus:border-sky-500" />
                </label>
                <label className="block text-sm font-black text-slate-500">
                  Airtime per card
                  <input type="number" min="0" step="100" value={draft.airtimeAmount} onChange={(event) => updateDraft('airtimeAmount', Math.max(0, Number(event.target.value)))} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-4 text-base font-bold text-slate-950 outline-none focus:border-sky-500" />
                </label>
                <label className="block text-sm font-black text-slate-500">
                  Data per card in GB
                  <input type="number" min="0" step="0.5" value={draft.dataAmountGb} onChange={(event) => updateDraft('dataAmountGb', Math.max(0, Number(event.target.value)))} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-4 text-base font-bold text-slate-950 outline-none focus:border-sky-500" />
                </label>
              </div>
              <div className="mt-6">
                <p className="text-sm font-black text-slate-500">Gift type</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    ['airtime', Smartphone],
                    ['data', Wifi],
                    ['combo', Gift],
                  ].map(([mode, Icon]) => {
                    const Component = Icon as React.ComponentType<{ className?: string }>
                    return (
                      <button key={String(mode)} type="button" onClick={() => updateDraft('deliveryMode', mode as DeliveryMode)} className={`rounded-lg border p-4 text-center text-sm font-black capitalize ${draft.deliveryMode === mode ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
                        <Component className="mx-auto mb-2 h-5 w-5" />
                        {String(mode)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8">
              <h2 className="text-2xl font-black">Where should we send them?</h2>
              <label className="mt-6 block text-sm font-black text-slate-500">
                Your email
                <input
                  type="email"
                  value={draft.recipientEmail}
                  onChange={(event) => updateDraft('recipientEmail', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-4 text-xl font-bold text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="you@email.com"
                />
              </label>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                The order follows this address. This is still a local dummy checkout, not a real provider transaction.
              </p>
              <div className="mt-8 border-t border-slate-200 pt-7">
                <div className="grid gap-3 text-base md:grid-cols-[1fr_auto]">
                  <span className="font-bold text-slate-500">Style</span>
                  <strong>{selectedStyle.label}</strong>
                  <span className="font-bold text-slate-500">Cards</span>
                  <strong>{draft.quantity} x {money(draft.airtimeAmount)}</strong>
                  <span className="font-bold text-slate-500">Delivery</span>
                  <strong className="capitalize">{draft.network} {draft.deliveryMode}</strong>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="created-cards" className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Created cards</h2>
              <p className="text-sm text-slate-500">Local dummy records only. No airtime, data, payment, or provider transaction is created.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={clearOrders} disabled={!orders.length}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{order.network} dummy card</p>
                <h3 className="mt-1 font-black">{order.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{order.quantity} card{order.quantity === 1 ? '' : 's'} · {money(order.total)}</p>
                <p className="mt-3 break-all rounded-lg bg-slate-50 p-2 text-xs font-bold text-slate-600">{order.voucherCode}</p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => copyOrder(order)}>
                    <Send className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => downloadOrder(order)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </article>
            ))}
            {!orders.length && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm font-bold text-slate-500">
                Continue to payment to generate your first dummy card.
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-2xl shadow-slate-300/60 backdrop-blur">
        <div className="mx-auto max-w-[742px]">
          {step === 1 ? (
            <button type="button" onClick={nextStep} className="inline-flex h-[72px] w-full items-center justify-center rounded-lg bg-sky-500 text-lg font-black text-white hover:bg-sky-600">
              Next
            </button>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-bold text-slate-500">{draft.quantity} x {money(draft.airtimeAmount)}</p>
                <p className="text-sm font-black text-emerald-700">No fees. You pay exactly the face value.</p>
              </div>
              <p className="text-right text-4xl font-black text-slate-950">{money(total)}</p>
              <div className="flex gap-3 sm:col-span-2">
                <button type="button" onClick={previousStep} className="inline-flex h-16 items-center gap-2 rounded-lg border border-slate-200 px-7 text-base font-black text-slate-700 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                {step < 3 ? (
                  <button type="button" onClick={nextStep} className="inline-flex h-16 flex-1 items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 text-lg font-black text-white hover:bg-sky-600">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={createOrder} className="inline-flex h-16 flex-1 items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 text-lg font-black text-white hover:bg-sky-600">
                    <CreditCard className="h-5 w-5" />
                    Continue to payment
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </footer>
    </main>
  )
}

export default GiftCardStudio
