import { useRef } from 'react'
import { formatFileSize } from '../utils/profile.js'

// A PDF upload control. In this test phase it keeps only the file details
// (name, size), not the actual PDF bytes. Real storage comes with the server.
// Props:
//   label, hint  - shown to the employee
//   multiple     - allow several files
//   required     - show a small "required" mark
//   disabled     - lock it (when the form is submitted/verified)
//   accept       - input accept attribute
//   addLabel     - button label when adding (multiple)
//   chooseLabel  - button label when empty (single)
//   replaceLabel - button label when replacing (single)
//   files        - array of { name, size, type, uploadedOn }
//   onChange     - function(nextFiles)
export default function FileField({
  label,
  hint,
  multiple,
  required,
  disabled,
  accept = '.pdf,application/pdf',
  addLabel = 'Add PDF',
  chooseLabel = 'Choose PDF',
  replaceLabel = 'Replace PDF',
  files,
  onChange
}) {
  const inputRef = useRef(null)
  const list = Array.isArray(files) ? files : []

  function todayStr() {
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }

  function handlePick(e) {
    const picked = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedOn: todayStr()
    }))
    if (picked.length === 0) return
    onChange(multiple ? [...list, ...picked] : [picked[0]])
    // Clear the input so picking the same file again still fires onChange.
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAt(idx) {
    onChange(list.filter((_, i) => i !== idx))
  }

  return (
    <div className="file-field">
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
            {multiple ? addLabel : (list.length ? replaceLabel : chooseLabel)}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={handlePick}
        />
      </div>

      {hint && <div className="file-hint">{hint}</div>}

      {list.length === 0 ? (
        <div className="file-empty muted">No file yet.</div>
      ) : (
        <ul className="file-list">
          {list.map((f, i) => (
            <li className="file-chip" key={`${f.name}-${i}`}>
              <span className="file-chip-name">{f.name}</span>
              <span className="file-chip-size muted">{formatFileSize(f.size)}</span>
              {!disabled && (
                <button type="button" className="file-chip-x" title="Remove" onClick={() => removeAt(i)}>
                  &times;
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
