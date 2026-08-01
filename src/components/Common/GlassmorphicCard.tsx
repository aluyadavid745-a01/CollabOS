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
        'glass-effect backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl transition-all duration-300',
        hover && 'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20',
        className
      )}
      {...props}
    />
  )
)
GlassmorphicCard.displayName = 'GlassmorphicCard'

export { GlassmorphicCard }
