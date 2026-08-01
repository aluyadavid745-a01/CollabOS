import { motion } from 'framer-motion'

interface GlassmorphicCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  className = '',
  hover = true,
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -10 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        glass-effect rounded-2xl border border-white/10 backdrop-blur-xl
        p-6 transition-all duration-300
        ${hover && 'hover:border-indigo-500/50 hover:shadow-glow'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
