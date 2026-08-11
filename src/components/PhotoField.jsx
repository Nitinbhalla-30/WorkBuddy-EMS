import { useRef, useState } from 'react'
import { formatFileSize } from '../utils/profile.js'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_BYTES = 2 * 1024 * 1024

// Required profile photo upload with live preview.
export default function PhotoField({
  label = 'Profile picture',
  hint = 'Upload a clear face photo (JPG, PNG, or WebP). Required for your profile.',
  required = true,
  disabled = false,
  photo,
  onChange
}) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  function todayStr() {
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }

  function handlePick(e) {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    if (!file) return

    setError('')
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, or WebP).')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Please choose a photo under 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedOn: todayStr(),
        dataUrl: String(reader.result || '')
      })
    }
    reader.onerror = () => setError('Could not read that image. Please try another file.')
    reader.readAsDataURL(file)
  }

  function clear() {
    setError('')
    onChange(null)
  }

  return (
    <div className="photo-field">
      <div className="file-field-head">
        <span className="file-label">
          {label} {required && <span className="req">*</span>}
        </span>
        {!disabled && (
          <button
            type="button"
            className="btn btn-tiny btn-light"
            onClick={() => inputRef.current && inputRef.current.click()}
          >
            {photo?.dataUrl ? 'Replace photo' : 'Upload photo'}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={handlePick}
        />
      </div>

      {hint && <div className="file-hint">{hint}</div>}
      {error && <div className="error-box first">{error}</div>}

      {photo?.dataUrl ? (
        <div className="photo-preview-row">
          <img className="photo-preview" src={photo.dataUrl} alt="Profile preview" />
          <div>
            <div className="file-chip-name">{photo.name}</div>
            <div className="muted small">{formatFileSize(photo.size)}</div>
            {!disabled && (
              <button type="button" className="btn btn-tiny btn-light" onClick={clear}>
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="file-empty muted">No profile picture yet.</div>
      )}
    </div>
  )
}
