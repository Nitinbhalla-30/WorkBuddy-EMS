// Circular avatar: photo when available, otherwise initials.
// Seed data ships placeholder "photos" as SVG data URLs while real uploads
// are raster images (JPG/PNG/WebP/GIF). Placeholders fall back to the brand
// initials avatar so everyone without a real photo looks consistent.
export default function Avatar({ src, name = '', size = 32, className = '' }) {
  const isPlaceholderPhoto = typeof src === 'string' && src.startsWith('data:image/svg')
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

  if (src && !isPlaceholderPhoto) {
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
