import React from 'react'
import { cn } from '../../utils/cn'

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const GlassmorphicCard = React.forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ className, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'glass-effect rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 md:p-8',
        hover && 'hover:border-slate-300 hover:shadow-md',
        className
      )}
      {...props}
    />
  )
)
GlassmorphicCard.displayName = 'GlassmorphicCard'

export { GlassmorphicCard }
