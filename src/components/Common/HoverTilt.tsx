import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface HoverTiltProps {
  children: React.ReactNode
  scale?: number
  rotationFactor?: number
}

export const HoverTilt: React.FC<HoverTiltProps> = ({
  children,
  scale = 1.05,
  rotationFactor = 10,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()

    const x = (clientY - top - height / 2) / height
    const y = (clientX - left - width / 2) / width

    setRotation({
      x: x * rotationFactor,
      y: y * rotationFactor,
    })
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      whileHover={{ scale }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
