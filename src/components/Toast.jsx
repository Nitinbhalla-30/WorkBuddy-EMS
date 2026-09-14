import { useEffect, useState } from 'react'
import { CheckCircle, X, AlertCircle } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
}

const TONES = {
  success: 'toast--success',
  error: 'toast--error',
}

// Auto-dismissing toast that slides up from the bottom-right.
export default function Toast({ message, type = 'success', onDone, duration = 3000 }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Trigger slide-up on mount
    const showTimer = requestAnimationFrame(() => setVisible(true))

    // Auto-dismiss after `duration` ms
    const hideTimer = setTimeout(() => dismiss(), duration)

    return () => {
      cancelAnimationFrame(showTimer)
      clearTimeout(hideTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function dismiss() {
    if (leaving) return
    setLeaving(true)
    // Wait for slide-down animation to finish before calling onDone
    setTimeout(() => onDone?.(), 300)
  }

  const Icon = ICONS[type] || ICONS.success

  return (
    <div className={`toast ${TONES[type] || TONES.success} ${visible && !leaving ? 'toast--visible' : ''} ${leaving ? 'toast--leaving' : ''}`}>
      <Icon size={16} aria-hidden="true" />
      <span className="toast-message">{message}</span>
      <button type="button" className="toast-close" onClick={dismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}
