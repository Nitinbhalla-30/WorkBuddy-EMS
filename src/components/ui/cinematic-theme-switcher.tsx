import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

// Compact, accessible theme toggle. Sits in the topbar and animates
// between sun (light) and moon (dark) with a sliding knob.
export default function CinematicThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  // SSR-safe placeholder that matches the real size so layout doesn't shift.
  if (!mounted) {
    return (
      <div
        style={{
          width: 56,
          height: 30,
          borderRadius: 15,
          background: '#e2e8f0',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <button
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
        <Sun size={14} className="theme-toggle-icon theme-toggle-icon--sun" />
        <Moon size={14} className="theme-toggle-icon theme-toggle-icon--moon" />
      </span>

      {/* Sliding knob */}
      <span
        className="theme-toggle-knob"
        style={{ transform: isDark ? 'translateX(26px)' : 'translateX(0)' }}
      >
        <span className="theme-toggle-knob-icon" aria-hidden="true">
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </span>
      </span>
    </button>
  )
}
