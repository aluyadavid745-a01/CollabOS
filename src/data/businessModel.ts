export type BillingCycle = 'monthly' | 'yearly'

export type PlanId = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

export interface PricingPlan {
  id: PlanId
  name: string
  monthlyPriceNgn: number | null
  yearlyPriceNgn: number | null
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
    monthlyPriceNgn: 0,
    yearlyPriceNgn: 0,
    description: 'For individuals and very small teams getting started.',
    audience: 'Explore CollabOS without talking to sales.',
    aiActionsPerMonth: 20,
    features: ['1 workspace', 'Up to 3 team members', 'Projects and tasks', 'Messages', 'Basic files', '20 AI actions/month'],
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPriceNgn: 5000,
    yearlyPriceNgn: 48000,
    description: 'For small businesses that need a shared workspace.',
    audience: 'Best for early teams moving away from scattered tools.',
    aiActionsPerMonth: 200,
    features: ['Up to 10 team members', 'Team projects', 'Task assignment', 'Calendar', 'File organization', '200 AI actions/month'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPriceNgn: 15000,
    yearlyPriceNgn: 144000,
    description: 'For growing companies coordinating multiple projects.',
    audience: 'Best for teams that need meetings, files, and AI workflows together.',
    aiActionsPerMonth: 1000,
    featured: true,
    features: ['Up to 50 team members', 'Advanced project activity', 'Meetings and recaps', 'Priority workspace support', 'Team file hub', '1,000 AI actions/month'],
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPriceNgn: 30000,
    yearlyPriceNgn: 288000,
    description: 'For larger organizations that need controls and scale.',
    audience: 'Best for departments and multi-team operations.',
    aiActionsPerMonth: 5000,
    features: ['Up to 150 team members', 'Admin analytics', 'Role-based access foundations', 'Audit log foundations', 'Higher storage limits', '5,000 AI actions/month'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPriceNgn: null,
    yearlyPriceNgn: null,
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

export const companyLinks = {
  supportEmail: 'support@collabos.dev',
  salesEmail: 'sales@collabos.dev',
  securityEmail: 'security@collabos.dev',
  statusUrl: '/status',
}
