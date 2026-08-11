// Circular avatar: photo when available, otherwise initials.
export default function Avatar({ src, name = '', size = 32, className = '' }) {
  const initials = String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const style = {
    width: size,
    height: size,
    fontSize: Math.max(11, Math.round(size * 0.36))
  }

  if (src) {
    return (
      <img
        className={`avatar ${className}`.trim()}
        src={src}
        alt=""
        style={style}
      />
    )
  }

  return (
    <span className={`avatar avatar-fallback ${className}`.trim()} style={style} aria-hidden="true">
      <span className="avatar-initials">{initials}</span>
    </span>
  )
}
