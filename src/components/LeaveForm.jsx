import { useState } from 'react'
import { LEAVE_TYPES } from '../data/sampleData.js'
import { countLeaveDays } from '../utils/leaves.js'

// Form to apply for leave.
// onApply({ type, fromDate, toDate, reason }).
export default function LeaveForm({ onApply, onCancel }) {
  const [type, setType] = useState('casual')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const requestedDays = countLeaveDays(fromDate, toDate)

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

    onApply({ type, fromDate, toDate, reason })

    setType('casual')
    setFromDate('')
    setToDate('')
    setReason('')
    setError('')
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="error-box first">{error}</div>}

      <div className="two-col">
        <label className="field">
          <span>Leave type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
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

      {requestedDays > 0 && (
        <p className="hint first">
          This request is for <strong>{requestedDays}</strong> working day(s). Weekends are not counted.
        </p>
      )}

      <div className="button-row">
        <button type="submit" className="btn btn-primary">Send request</button>
        {onCancel && (
          <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
