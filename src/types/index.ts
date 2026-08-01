export interface NavItem {
  label: string
  href: string
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export interface Plan {
  id: string
  name: string
  price: number | string
  description: string
  features: string[]
  featured?: boolean
  cta: string
}

export interface Testimonial {
  id: string
  name: string
  title: string
  company: string
  content: string
  avatar: string
  rating: number
}

export interface FAQ {
  id: string
  question: string
  answer: string
}
