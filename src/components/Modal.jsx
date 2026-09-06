import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
  })
}

export default function Modal({ onClose, children, title }) {
  const contentRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    const previousFocus = document.activeElement

    function focusables() {
      return getFocusableElements(root)
    }

    // Focus the first control only when the modal opens — not on every parent re-render.
    const timer = window.setTimeout(() => {
      const els = focusables()
      if (els.length > 0) {
        els[0].focus()
      } else {
        root.focus()
      }
    }, 0)

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current?.()
        return
      }

      if (e.key !== 'Tab') return

      const els = focusables()
      if (els.length === 0) {
        e.preventDefault()
        return
      }

      const first = els[0]
      const last = els[els.length - 1]
      const active = document.activeElement
      const index = els.indexOf(active)

      e.preventDefault()

      if (e.shiftKey) {
        if (index <= 0) {
          last.focus()
        } else {
          els[index - 1].focus()
        }
      } else if (index === -1 || index >= els.length - 1) {
        first.focus()
      } else {
        els[index + 1].focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKeyDown, true)
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus()
      }
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={() => onCloseRef.current?.()}>
      <div
        className="modal-content"
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
