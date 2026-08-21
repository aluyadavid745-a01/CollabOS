export type BillingCycle = 'monthly' | 'yearly'

export type PlanId = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

export interface PricingPlan {
  id: PlanId
  name: string
  monthlyPriceUsd: number | null
  yearlyPriceUsd: number | null
  monthlyPriceNgn: number | null
  yearlyPriceNgn: number | null
  memberLimit: number | null
  storageGb: number | null
  description: string
  audience: string
  aiActionsPerMonth: number | null
  featured?: boolean
  features: string[]
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    monthlyPriceNgn: 0,
    yearlyPriceNgn: 0,
    memberLimit: 5,
    storageGb: 2,
    description: 'For individuals and very small teams getting started.',
    audience: 'Explore CollabOS without talking to sales.',
    aiActionsPerMonth: 20,
    features: ['Up to 5 members', '3 projects', '2 GB storage', 'Projects and tasks', 'Messages', '20 AI actions/month'],
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPriceUsd: 19,
    yearlyPriceUsd: 182,
    monthlyPriceNgn: 5000,
    yearlyPriceNgn: 48000,
    memberLimit: 10,
    storageGb: 25,
    description: 'For small businesses that need a shared workspace.',
    audience: 'Best for early teams moving away from scattered tools.',
    aiActionsPerMonth: 200,
    features: ['Up to 10 members', 'Unlimited projects', '25 GB storage', 'Task assignment', 'Calendar', '200 AI actions/month'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPriceUsd: 49,
    yearlyPriceUsd: 470,
    monthlyPriceNgn: 15000,
    yearlyPriceNgn: 144000,
    memberLimit: 25,
    storageGb: 100,
    description: 'For growing companies coordinating multiple projects.',
    audience: 'Best for teams that need meetings, files, and AI workflows together.',
    aiActionsPerMonth: 5000,
    featured: true,
    features: ['Up to 25 members', 'Unlimited projects', '100 GB storage', 'Meetings and AI recaps', 'Automation', '5,000 AI actions/month'],
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPriceUsd: 149,
    yearlyPriceUsd: 1430,
    monthlyPriceNgn: 30000,
    yearlyPriceNgn: 288000,
    memberLimit: 100,
    storageGb: 500,
    description: 'For larger organizations that need controls and scale.',
    audience: 'Best for departments and multi-team operations.',
    aiActionsPerMonth: 20000,
    features: ['Up to 100 members', '500 GB storage', 'Admin analytics', 'Role-based access foundations', 'Audit log foundations', '20,000 AI actions/month'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPriceUsd: null,
    yearlyPriceUsd: null,
    monthlyPriceNgn: null,
    yearlyPriceNgn: null,
    memberLimit: null,
    storageGb: null,
    description: 'For organizations with advanced security and procurement needs.',
    audience: 'Custom rollout, security review, and support model.',
    aiActionsPerMonth: null,
    features: ['Custom team limits', 'Custom AI usage', 'Security review', 'Custom data controls', 'Dedicated rollout support', 'Enterprise agreement'],
  },
]

export const aiCreditAddOn = {
  label: 'Additional AI credits',
  description: 'Optional paid add-on for teams that need more workspace automation.',
  configurable: true,
}

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)

export const formatUsd = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)

export const companyLinks = {
  supportEmail: 'support@collabos.dev',
  salesEmail: 'sales@collabos.dev',
  securityEmail: 'security@collabos.dev',
  statusUrl: '/status',
}
