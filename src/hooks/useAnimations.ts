import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseGSAPOptions {
  scope?: React.RefObject<HTMLElement>
  dependencies?: React.DependencyList
}

export const useGSAP = (
  callback: () => void | (() => void),
  options?: UseGSAPOptions
) => {
  useEffect(() => {
    const cleanup = callback()
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, options?.dependencies || [])
}

export default useGSAP
