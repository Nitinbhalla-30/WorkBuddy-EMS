import { useState } from 'react'
import { LEAVE_TYPES } from '../data/sampleData.js'
import { countLeaveDays, SICK_LEAVE_DOC_ACCEPT, sickLeaveRequiresDocument } from '../utils/leaves.js'
import FileField from './FileField.jsx'

// Form to apply for leave.
// onApply({ type, fromDate, toDate, reason, supportingDocuments }).
export default function LeaveForm({ onApply, onCancel, initial = null, submitLabel = 'Send request' }) {
  const [type, setType] = useState(initial?.type || 'casual')
  const [fromDate, setFromDate] = useState(initial?.fromDate || '')
  const [toDate, setToDate] = useState(initial?.toDate || '')
  const [reason, setReason] = useState(initial?.reason || '')
  const [supportingDocuments, setSupportingDocuments] = useState(
    initial?.supportingDocuments || []
  )
  const [error, setError] = useState('')

  const requestedDays = countLeaveDays(fromDate, toDate)
  const sickLeave = sickLeaveRequiresDocument(type)

  function changeType(nextType) {
    setType(nextType)
    if (!sickLeaveRequiresDocument(nextType)) {
      setSupportingDocuments([])
    }
  }

  function submit(e) {
    e.preventDefault()
    setError('')

    if (!fromDate || !toDate) {
      setError('Please choose both a start and end date.')
      return
    }
    if (requestedDays <= 0) {
      setError('The dates are not valid (end date is before start, or only weekends).')
      return
    }
    if (sickLeave && supportingDocuments.length === 0) {
      setError('Please upload a supporting document for sick leave (e.g. medical certificate).')
      return
    }

    onApply({
      type,
      fromDate,
      toDate,
      reason,
      supportingDocuments: sickLeave ? supportingDocuments : []
    })

    if (!initial) {
      setType('casual')
      setFromDate('')
      setToDate('')
      setReason('')
      setSupportingDocuments([])
      setError('')
    }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="error-box first">{error}</div>}

      <div className="two-col">
        <label className="field">
          <span>Leave type</span>
          <select value={type} onChange={(e) => changeType(e.target.value)}>
            {LEAVE_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}{t.paid ? '' : ' (no pay)'}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Reason (optional)</span>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Family function"
          />
        </label>
      </div>

      <div className="two-col">
        <label className="field">
          <span>From date</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="field">
          <span>To date</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
      </div>

      {sickLeave && (
        <FileField
          label="Supporting document"
          hint="Upload a medical certificate or other proof required by the company (PDF or image)."
          required
          multiple
          accept={SICK_LEAVE_DOC_ACCEPT}
          addLabel="Add file"
          chooseLabel="Choose file"
          replaceLabel="Replace file"
          files={supportingDocuments}
          onChange={setSupportingDocuments}
        />
      )}

      {requestedDays > 0 && (
        <p className="hint first">
          This request is for <strong>{requestedDays}</strong> working day(s). Weekends are not counted.
        </p>
      )}

      <div className="button-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
