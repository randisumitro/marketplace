import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Respect the user's reduced-motion preference globally
if (typeof window !== 'undefined') {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  gsap.defaults({ overwrite: 'auto' })
  if (prefersReduced) {
    gsap.globalTimeline.timeScale(50) // effectively instant, keeps code paths simple
  }
}

export { gsap, ScrollTrigger }
