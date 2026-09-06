import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'

// Sun → moon morph toggle, adapted from the 21st.dev "animated-theme-toggle"
// by axai-kaizoku. Differences from the original: it is wired to the app's
// real next-themes state (persisted, SSR-safe) instead of local useState, the
// morph is driven by one spring MotionValue so it reads as a real draw-on /
// draw-off instead of a plain crossfade, and the button frame uses the
// WorkBuddy icon-button tokens (.theme-toggle in styles.css).
// Pressing it is a plain theme swap — no page-level transition animation.
// Icon geometry is authored on a 25x25 grid; stroke 2.1 at 18px matches the
// 18px / weight-2 lucide icons it sits next to in the topbar.

const SUN_PATHS = [
  // Disc
  'M12.4058 17.7625C15.1672 17.7625 17.4058 15.5239 17.4058 12.7625C17.4058 10.0011 15.1672 7.76251 12.4058 7.76251C9.64434 7.76251 7.40576 10.0011 7.40576 12.7625C7.40576 15.5239 9.64434 17.7625 12.4058 17.7625Z',
  // Rays
  'M12.4058 1.76251V3.76251',
  'M12.4058 21.7625V23.7625',
  'M4.62598 4.98248L6.04598 6.40248',
  'M18.7656 19.1225L20.1856 20.5425',
  'M1.40576 12.7625H3.40576',
  'M21.4058 12.7625H23.4058',
  'M4.62598 20.5425L6.04598 19.1225',
  'M18.7656 6.40248L20.1856 4.98248',
]

const MOON_PATH =
  'M21.1918 13.2013C21.0345 14.9035 20.3957 16.5257 19.35 17.8781C18.3044 19.2305 16.8953 20.2571 15.2875 20.8379C13.6797 21.4186 11.9398 21.5294 10.2713 21.1574C8.60281 20.7854 7.07479 19.9459 5.86602 18.7371C4.65725 17.5283 3.81774 16.0003 3.4457 14.3318C3.07367 12.6633 3.18451 10.9234 3.76526 9.31561C4.346 7.70783 5.37263 6.29868 6.72501 5.25307C8.07739 4.20746 9.69959 3.56862 11.4018 3.41132C10.4052 4.75958 9.92564 6.42077 10.0503 8.09273C10.175 9.76469 10.8957 11.3364 12.0812 12.5219C13.2667 13.7075 14.8384 14.4281 16.5104 14.5528C18.1823 14.6775 19.8435 14.1979 21.1918 13.2013Z'

const SPRING = { type: 'spring' as const, stiffness: 90, damping: 17, mass: 0.9 }

export default function AnimatedThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const prefersReducedMotion = useReducedMotion()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && (resolvedTheme ?? theme) === 'dark'

  // Single source of truth for the artwork: 0 = sun, 1 = moon.
  const progress = useMotionValue(0)
  const firstSync = useRef(true)

  useEffect(() => {
    if (!mounted) return
    const target = isDark ? 1 : 0

    // Restoring a saved dark theme on load shouldn't morph, and reduced motion
    // means the artwork simply changes state.
    if (firstSync.current || prefersReducedMotion) {
      firstSync.current = false
      progress.set(target)
      return
    }
    // Already on its way there (nothing to restart).
    if (Math.abs(progress.get() - target) < 0.001) return

    const controls = animate(progress, target, SPRING)
    return () => controls.stop()
  }, [isDark, mounted, prefersReducedMotion, progress])

  // Scale + rotate + stroke draw-on, staggered so the sun retracts before the
  // moon finishes drawing in.
  const sunScale = useTransform(progress, [1, 0.45, 0], [0, 0, 1])
  const sunRotate = useTransform(progress, [1, 0], [50, 0])
  const sunPath = useTransform(progress, [1, 0.6, 0], [0, 0, 1])
  const moonScale = useTransform(progress, [0, 0.5, 1], [0, 0, 1])
  const moonRotate = useTransform(progress, [0, 1], [-50, 0])
  const moonPath = useTransform(progress, [0, 0.35, 1], [0, 0, 1])

  const handleToggle = () => setTheme(isDark ? 'light' : 'dark')

  // Same footprint before and after hydration so the topbar never shifts.
  if (!mounted) {
    return <span className="theme-toggle theme-toggle--pending" aria-hidden="true" />
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={handleToggle}
      className="theme-toggle"
    >
      <motion.svg
        width="18"
        height="18"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <motion.g
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ scale: sunScale, rotate: sunRotate }}
        >
          {SUN_PATHS.map((d) => (
            <motion.path key={d} d={d} style={{ pathLength: sunPath }} />
          ))}
        </motion.g>
        <motion.path
          d={MOON_PATH}
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ scale: moonScale, rotate: moonRotate, pathLength: moonPath }}
        />
      </motion.svg>
    </button>
  )
}
