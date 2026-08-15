import React from 'react'
import {
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Download,
  Gift,
  Image as ImageIcon,
  Paintbrush,
  QrCode,
  Receipt,
  RotateCcw,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Wifi,
} from 'lucide-react'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'

type Network = 'MTN' | 'Airtel' | 'Glo' | '9mobile'
type DeliveryMode = 'airtime' | 'data' | 'combo'

type GiftCardDraft = {
  title: string
  message: string
  recipient: string
  sender: string
  network: Network
  deliveryMode: DeliveryMode
  airtimeAmount: number
  dataAmountGb: number
  quantity: number
  background: string
  accent: string
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

const gradients = [
  { label: 'Confetti', value: 'linear-gradient(135deg, #f8fafc 0%, #fef3c7 48%, #dbeafe 100%)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 45%, #e0f2fe 100%)' },
  { label: 'Mint', value: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 42%, #fef9c3 100%)' },
  { label: 'Slate', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #ffffff 100%)' },
]

const accents = ['#0f172a', '#2563eb', '#059669', '#be123c', '#7c3aed', '#d97706']

const initialDraft: GiftCardDraft = {
  title: 'Happy Birthday',
  message: 'Wishing you joy, love, and a little something for your phone.',
  recipient: 'Friend',
  sender: 'CollabOS',
  network: 'MTN',
  deliveryMode: 'combo',
  airtimeAmount: 1000,
  dataAmountGb: 2,
  quantity: 5,
  background: gradients[0].value,
  accent: '#0f172a',
  imageDataUrl: '',
  backNote: 'Dial the dummy USSD code below or use the voucher code to claim this simulated gift.',
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

const GiftCardStudio: React.FC = () => {
  const { profile } = useAuth()
  const [draft, setDraft] = React.useState<GiftCardDraft>(() => ({
    ...initialDraft,
    sender: profile?.name || initialDraft.sender,
  }))
  const [orders, setOrders] = React.useState<GiftCardOrder[]>(() => readOrders())
  const [activeSide, setActiveSide] = React.useState<'front' | 'back'>('front')
  const [status, setStatus] = React.useState('')
  const latestOrder = orders[0]

  const serviceFee = Math.max(250, Math.round((draft.airtimeAmount * draft.quantity + draft.dataAmountGb * 450 * draft.quantity) * 0.04))
  const subtotal =
    (draft.deliveryMode === 'data' ? 0 : draft.airtimeAmount * draft.quantity) +
    (draft.deliveryMode === 'airtime' ? 0 : draft.dataAmountGb * 450 * draft.quantity)
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

    const text = `${order.title}\nTo: ${order.recipient}\n${order.message}\nVoucher: ${order.voucherCode}\nUSSD: ${order.ussdCode}\nDummy payment: ${order.dummyPaymentRef}`
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

  const previewOrder = latestOrder || {
    ...draft,
    voucherCode: 'GIFT-PREVIEW-CODE',
    ussdCode: `${networkPrefixes[draft.network]}*0000000000#`,
    dummyPaymentRef: 'PAY-PREVIEW',
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-emerald-700">
              <Gift className="h-4 w-4" />
              Dummy airtime and data cards
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">Gift Card Studio</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Design a front and back card, attach simulated airtime or data, run a dummy checkout, and generate fake USSD and voucher codes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setDraft({ ...initialDraft, sender: profile?.name || initialDraft.sender })}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset draft
            </Button>
            <Button type="button" onClick={createOrder}>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay dummy {money(total)}
            </Button>
          </div>
        </header>

        {status && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            <BadgeCheck className="h-4 w-4" />
            {status}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[360px_1fr_360px]">
          <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
            <div className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-black">Design</h2>
            </div>

            <label className="block text-sm font-bold text-slate-700">
              Card title
              <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Recipient
              <input value={draft.recipient} onChange={(event) => updateDraft('recipient', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Sender
              <input value={draft.sender} onChange={(event) => updateDraft('sender', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Message
              <textarea value={draft.message} onChange={(event) => updateDraft('message', event.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>

            <div>
              <p className="text-sm font-bold text-slate-700">Background</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {gradients.map((item) => (
                  <button key={item.label} type="button" onClick={() => updateDraft('background', item.value)} className={`h-12 rounded-lg border ${draft.background === item.value ? 'border-slate-950' : 'border-slate-200'}`} style={{ background: item.value }} aria-label={item.label} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700">Accent</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {accents.map((item) => (
                  <button key={item} type="button" onClick={() => updateDraft('accent', item)} className={`h-9 w-9 rounded-full border-2 ${draft.accent === item ? 'border-slate-950' : 'border-white'} shadow`} style={{ backgroundColor: item }} aria-label={`Use ${item}`} />
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <ImageIcon className="h-4 w-4" />
              Upload card image
              <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
            </label>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                {(['front', 'back'] as const).map((side) => (
                  <button key={side} type="button" onClick={() => setActiveSide(side)} className={`rounded-md px-4 py-2 text-sm font-black capitalize ${activeSide === side ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                    {side}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => copyOrder(latestOrder)} disabled={!latestOrder}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => downloadOrder(latestOrder)} disabled={!latestOrder}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="mx-auto grid w-full max-w-2xl place-items-center rounded-lg bg-slate-100 p-4 sm:p-8">
              <article className="relative aspect-[1.58/1] w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/70" style={{ background: draft.background }}>
                {activeSide === 'front' ? (
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider" style={{ color: draft.accent }}>For {draft.recipient}</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-5xl">{draft.title}</h2>
                      </div>
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/80 text-slate-950 shadow-sm">
                        <Gift className="h-7 w-7" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[1fr_150px] sm:items-end">
                      <p className="text-base font-semibold leading-7 text-slate-700">{draft.message}</p>
                      <div className="min-h-28 overflow-hidden rounded-lg border border-white/80 bg-white/70">
                        {draft.imageDataUrl ? (
                          <img src={draft.imageDataUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-28 place-items-center text-slate-400">
                            <Sparkles className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-600">From {draft.sender}</p>
                  </div>
                ) : (
                  <div className="grid h-full gap-4 sm:grid-cols-[1fr_150px]">
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider" style={{ color: draft.accent }}>Dummy claim details</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-950">{previewOrder.network} {previewOrder.deliveryMode} gift</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-700">{draft.backNote}</p>
                      </div>
                      <div className="space-y-2 text-sm font-bold text-slate-700">
                        <p>Voucher: <span className="font-black text-slate-950">{previewOrder.voucherCode}</span></p>
                        <p>USSD: <span className="font-black text-slate-950">{previewOrder.ussdCode}</span></p>
                        <p>Ref: <span className="font-black text-slate-950">{previewOrder.dummyPaymentRef}</span></p>
                      </div>
                    </div>
                    <div className="grid place-items-center rounded-lg border border-slate-200 bg-white/80 p-4 text-center">
                      <QrCode className="h-20 w-20 text-slate-950" />
                      <p className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500">Preview QR</p>
                    </div>
                  </div>
                )}
              </article>
            </div>
          </section>

          <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-black">Dummy value</h2>
            </div>

            <label className="block text-sm font-bold text-slate-700">
              Network
              <select value={draft.network} onChange={(event) => updateDraft('network', event.target.value as Network)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400">
                <option>MTN</option>
                <option>Airtel</option>
                <option>Glo</option>
                <option>9mobile</option>
              </select>
            </label>

            <div>
              <p className="text-sm font-bold text-slate-700">Gift type</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  ['airtime', Smartphone],
                  ['data', Wifi],
                  ['combo', Gift],
                ].map(([mode, Icon]) => {
                  const Component = Icon as React.ComponentType<{ className?: string }>
                  return (
                    <button key={String(mode)} type="button" onClick={() => updateDraft('deliveryMode', mode as DeliveryMode)} className={`rounded-lg border p-3 text-center text-xs font-black capitalize ${draft.deliveryMode === mode ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
                      <Component className="mx-auto mb-2 h-4 w-4" />
                      {String(mode)}
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="block text-sm font-bold text-slate-700">
              Airtime per card
              <input type="number" min="0" step="100" value={draft.airtimeAmount} onChange={(event) => updateDraft('airtimeAmount', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Data per card in GB
              <input type="number" min="0" step="0.5" value={draft.dataAmountGb} onChange={(event) => updateDraft('dataAmountGb', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Number of cards
              <input type="number" min="1" max="100" value={draft.quantity} onChange={(event) => updateDraft('quantity', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Back instructions
              <textarea value={draft.backNote} onChange={(event) => updateDraft('backNote', event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400" />
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500">
                <Receipt className="h-4 w-4" />
                Dummy checkout
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Gift value</span><strong>{money(subtotal)}</strong></div>
                <div className="flex justify-between"><span>Service fee</span><strong>{money(serviceFee)}</strong></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><span>Total</span><strong>{money(total)}</strong></div>
              </div>
              <Button type="button" className="mt-4 w-full" onClick={createOrder}>
                <Check className="mr-2 h-4 w-4" />
                Approve dummy payment
              </Button>
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Created cards</h2>
              <p className="text-sm text-slate-500">These are local dummy records only. No airtime, data, or provider transaction is created.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={clearOrders} disabled={!orders.length}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-slate-200 p-4">
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
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm font-bold text-slate-500">
                Run a dummy payment to generate your first card.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default GiftCardStudio
