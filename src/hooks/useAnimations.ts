import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useGSAP = (callback: (ctx: gsap.Context) => void, dependencies: any[] = []) => {
  const ctx = useRef<gsap.Context | null>(null)

  useEffect(() => {
    ctx.current = gsap.context(() => {
      callback(ctx.current!)
    })

    return () => ctx.current?.revert()
  }, dependencies)
}

export const useScrollTrigger = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    if (!ref.current) return

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      onEnter: callback,
      once: true,
    })

    return () => trigger.kill()
  }, [ref, callback])
}

export const useInView = (ref: React.RefObject<HTMLElement>) => {
  const [inView, setInView] = React.useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(ref.current!)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref])

  return inView
}
