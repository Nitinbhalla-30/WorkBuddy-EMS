import { useRef } from 'react'

// A <input type="time"> whose clock icon toggles the native picker:
// the first click opens it, the next click closes it (browsers normally
// keep the picker open on a second click).
export default function TimeInput({ onClick, onBlur, onKeyDown, ...props }) {
  const pickerOpen = useRef(false)

  function handleClick(e) {
    const el = e.currentTarget
    if (pickerOpen.current) {
      // Second click: blurring the input closes the native picker.
      pickerOpen.current = false
      e.preventDefault()
      el.blur()
      return
    }
    pickerOpen.current = true
    el.focus()
    try {
      el.showPicker()
    } catch {
      // Picker may already be open or unsupported; the native click still works.
    }
    onClick?.(e)
  }

  return (
    <input
      type="time"
      {...props}
      onClick={handleClick}
      onBlur={(e) => {
        pickerOpen.current = false
        onBlur?.(e)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') pickerOpen.current = false
        onKeyDown?.(e)
      }}
    />
  )
}
