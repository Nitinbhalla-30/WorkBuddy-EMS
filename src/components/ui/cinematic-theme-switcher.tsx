import { Sun, Moon } from 'lucide-react'
import { useState, useEffect, useRef, type MouseEvent } from 'react'
import { useTheme } from 'next-themes'

// Compact, accessible theme toggle. Sits in the topbar and animates
// between sun (light) and moon (dark) with a sliding knob.
// Uses the View Transitions API for a circular reveal on theme change.
export default function CinematicThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const btnRef = useRef<HTMLButtonElement>(null)

  const [mounted, setMounted] = useState(false)

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current
    if (!btn) return

    // Capture click origin for the circular reveal
    const rect = btn.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    // Max radius from click point to cover the entire viewport
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const root = document.documentElement
    root.style.setProperty('--reveal-x', `${x}px`)
    root.style.setProperty('--reveal-y', `${y}px`)
    root.style.setProperty('--reveal-r', `${maxRadius}px`)

    const applyTheme = () => setTheme(isDark ? 'light' : 'dark')

    // View Transitions API — circular clip-path reveal
    if (document.startViewTransition) {
      document.startViewTransition(applyTheme)
    } else {
      applyTheme()
    }
  }

  // SSR-safe placeholder that matches the real size so layout doesn't shift.
  if (!mounted) {
    return (
      <div
        style={{
          width: 60,
          height: 32,
          borderRadius: 16,
          background: '#e2e8f0',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <button
      ref={btnRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={handleToggle}
      className="theme-toggle"
      data-theme={isDark ? 'dark' : 'light'}
    >
      {/* Track icons sit behind the knob */}
      <span className="theme-toggle-track" aria-hidden="true">
        <Sun size={15} className="theme-toggle-icon theme-toggle-icon--sun" />
        <Moon size={15} className="theme-toggle-icon theme-toggle-icon--moon" />
      </span>

      {/* Sliding knob */}
      <span
        className="theme-toggle-knob"
        style={{ transform: isDark ? 'translateX(28px)' : 'translateX(0)' }}
      >
        <span className="theme-toggle-knob-icon" aria-hidden="true">
          {isDark ? <Moon size={15} /> : <Sun size={15} />}
        </span>
      </span>
    </button>
  )
}
