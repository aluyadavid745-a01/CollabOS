export type FlutterwavePaymentStatus = 'successful' | 'completed' | 'cancelled' | 'failed' | string

export type FlutterwavePaymentResponse = {
  amount?: number
  currency?: string
  flw_ref?: string
  status?: FlutterwavePaymentStatus
  tx_ref?: string
  transaction_id?: number
  customer?: {
    email?: string
    name?: string
    phone_number?: string
  }
}

type FlutterwaveCheckoutConfig = {
  public_key: string
  tx_ref: string
  amount: number
  currency: 'NGN'
  payment_options: string
  customer: {
    email: string
    name: string
    phone_number?: string
  }
  customizations: {
    title: string
    description: string
    logo?: string
  }
  meta: Record<string, string | number>
  configurations: {
    session_duration: number
    max_retry_attempt: number
  }
  callback: (payment: FlutterwavePaymentResponse) => void
  onclose: () => void
}

type FlutterwaveModal = {
  close: () => void
}

type FlutterwaveCheckout = (config: FlutterwaveCheckoutConfig) => FlutterwaveModal

declare global {
  interface Window {
    FlutterwaveCheckout?: FlutterwaveCheckout
  }
}

const CHECKOUT_SCRIPT_ID = 'flutterwave-inline-checkout'
const CHECKOUT_SCRIPT_SRC = 'https://checkout.flutterwave.com/v3.js'

export const flutterwavePublicKey = (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '').trim()
export const isFlutterwaveConfigured = Boolean(flutterwavePublicKey)

function loadFlutterwaveInline() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Flutterwave checkout is only available in the browser.'))
  }

  if (window.FlutterwaveCheckout) return Promise.resolve(window.FlutterwaveCheckout)

  const existingScript = document.getElementById(CHECKOUT_SCRIPT_ID) as HTMLScriptElement | null
  if (existingScript) {
    return new Promise<FlutterwaveCheckout>((resolve, reject) => {
      existingScript.addEventListener('load', () => {
        if (window.FlutterwaveCheckout) resolve(window.FlutterwaveCheckout)
        else reject(new Error('Flutterwave checkout loaded without exposing the checkout API.'))
      }, { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Flutterwave checkout could not be loaded.')), { once: true })
    })
  }

  return new Promise<FlutterwaveCheckout>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = CHECKOUT_SCRIPT_ID
    script.src = CHECKOUT_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      if (window.FlutterwaveCheckout) resolve(window.FlutterwaveCheckout)
      else reject(new Error('Flutterwave checkout loaded without exposing the checkout API.'))
    }
    script.onerror = () => reject(new Error('Flutterwave checkout could not be loaded. Check your connection and try again.'))
    document.head.appendChild(script)
  })
}

export async function startFlutterwavePayment({
  txRef,
  amount,
  email,
  name,
  description,
  quantity,
}: {
  txRef: string
  amount: number
  email: string
  name: string
  description: string
  quantity: number
}) {
  if (!isFlutterwaveConfigured) {
    throw new Error('Flutterwave test public key is missing. Add VITE_FLUTTERWAVE_PUBLIC_KEY to .env.local and restart Vite.')
  }

  const checkout = await loadFlutterwaveInline()

  return new Promise<FlutterwavePaymentResponse>((resolve, reject) => {
    let completed = false
    let modal: FlutterwaveModal | null = null

    modal = checkout({
      public_key: flutterwavePublicKey,
      tx_ref: txRef,
      amount,
      currency: 'NGN',
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email,
        name,
      },
      meta: {
        product: 'collabos-gift-cards',
        quantity,
      },
      customizations: {
        title: 'CollabOS Gift Cards',
        description,
        logo: `${window.location.origin}/collabos-icon.svg`,
      },
      configurations: {
        session_duration: 10,
        max_retry_attempt: 3,
      },
      callback: (payment) => {
        completed = true
        window.setTimeout(() => modal?.close(), 250)
        resolve(payment)
      },
      onclose: () => {
        if (!completed) reject(new Error('Payment window closed before payment was completed.'))
      },
    })
  })
}
