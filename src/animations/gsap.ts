import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const fadeInUp = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  delay = 0,
  duration = 0.8
) => {
  return gsap.to(element, {
    duration,
    y: 0,
    opacity: 1,
    delay,
    ease: 'power3.out',
  })
}

export const fadeInDown = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  delay = 0,
  duration = 0.8
) => {
  gsap.set(element, { y: -30, opacity: 0 })
  return gsap.to(element, {
    duration,
    y: 0,
    opacity: 1,
    delay,
    ease: 'power3.out',
  })
}

export const fadeIn = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  delay = 0,
  duration = 0.6
) => {
  return gsap.to(element, {
    duration,
    opacity: 1,
    delay,
    ease: 'power3.out',
  })
}

export const scaleIn = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  delay = 0,
  duration = 0.8
) => {
  gsap.set(element, { scale: 0.8, opacity: 0 })
  return gsap.to(element, {
    duration,
    scale: 1,
    opacity: 1,
    delay,
    ease: 'back.out(1.7)',
  })
}

export const staggerFadeInUp = (
  elements: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  delay = 0,
  stagger = 0.1,
  duration = 0.8
) => {
  gsap.set(elements, { y: 30, opacity: 0 })
  return gsap.to(elements, {
    duration,
    y: 0,
    opacity: 1,
    delay,
    stagger,
    ease: 'power3.out',
  })
}

export const scrollTriggerAnimation = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  vars: gsap.TweenVars,
  trigger?: string
) => {
  return gsap.to(element, {
    ...vars,
    scrollTrigger: {
      trigger: trigger || element,
      start: 'top 80%',
      end: 'top 20%',
      scrub: false,
      markers: false,
    },
  })
}

export const parallax = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  speed = 0.5
) => {
  gsap.to(element, {
    y: (i, target) => {
      return gsap.getProperty(target, 'offsetHeight') as number * speed
    },
    scrollTrigger: {
      trigger: element,
      start: 'top center',
      scrub: 1,
      markers: false,
    },
  })
}

export const floatingAnimation = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  duration = 4,
  offset = 20
) => {
  return gsap.to(element, {
    duration,
    y: -offset,
    opacity: 1,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  })
}

export const glowAnimation = (
  element: GSAPTweenVars | HTMLElement[] | HTMLElement | string,
  intensity = 1
) => {
  return gsap.to(element, {
    duration: 2,
    boxShadow: `0 0 ${40 * intensity}px rgba(79, 70, 229, 0.6)`,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

export const revealText = (element: HTMLElement | string) => {
  const tl = gsap.timeline()
  tl.from(element, {
    duration: 1.2,
    opacity: 0,
    y: 50,
    ease: 'power3.out',
  })
  return tl
}

export const splitText = (element: HTMLElement | string) => {
  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (!el) return []
  
  const text = el.textContent || ''
  const chars = text.split('')
  el.innerHTML = chars.map((char) => `<span class="inline-block">${char}</span>`).join('')
  
  return Array.from(el.querySelectorAll('span'))
}

export const animateCounter = (
  element: HTMLElement | string,
  endValue: number,
  duration = 2
) => {
  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (!el) return
  
  gsap.to({ count: 0 }, {
    count: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: function () {
      el.textContent = Math.floor(this.targets()[0].count).toLocaleString()
    },
  })
}
