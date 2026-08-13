import { formatFileSize } from '../utils/profile.js'

// Shows uploaded leave supporting documents as read-only chips.
export default function LeaveDocumentList({ documents, emptyLabel = '--' }) {
  const list = Array.isArray(documents) ? documents : []

  if (list.length === 0) {
    return <span className="muted">{emptyLabel}</span>
  }

  return (
    <div className="leave-doc-list">
      {list.map((f, i) => (
        <span className="file-chip static" key={`${f.name}-${i}`}>
          <span className="file-chip-name" title={f.name}>{f.name}</span>
          <span className="file-chip-size muted">{formatFileSize(f.size)}</span>
        </span>
      ))}
    </div>
  )
}
