import { useEffect, useRef } from 'react'
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
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const cleanup = callbackRef.current()
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
    // This hook intentionally lets callers control when GSAP setup re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options?.dependencies || [])
}

export default useGSAP
