import { useState } from 'react'
import { LEAVE_TYPES } from '../data/sampleData.js'
import { countLeaveDays, isPartialLeaveType, leaveDayFraction, SICK_LEAVE_DOC_ACCEPT, sickLeaveRequiresDocument } from '../utils/leaves.js'
import FileField from './FileField.jsx'

// Form to apply for leave.
// onApply({ type, fromDate, toDate, reason, supportingDocuments }).
export default function LeaveForm({ onApply, onCancel, initial = null, submitLabel = 'Send request' }) {
  const [type, setType] = useState(initial?.type || 'casual')
  const [halfDayPart, setHalfDayPart] = useState(initial?.halfDayPart || '')
  const [fromDate, setFromDate] = useState(initial?.fromDate || '')
  const [toDate, setToDate] = useState(initial?.toDate || '')
  const [reason, setReason] = useState(initial?.reason || '')
  const [supportingDocuments, setSupportingDocuments] = useState(
    initial?.supportingDocuments || []
  )
  const [error, setError] = useState('')

  const partial = isPartialLeaveType(type)
  const effectiveToDate = partial ? fromDate : toDate
  const requestedDays = countLeaveDays(fromDate, effectiveToDate) * leaveDayFraction(type)
  const sickLeave = sickLeaveRequiresDocument(type)

  function changeType(nextType) {
    setType(nextType)
    if (nextType !== 'halfday') setHalfDayPart('')
    if (!sickLeaveRequiresDocument(nextType)) {
      setSupportingDocuments([])
    }
  }

  function submit(e) {
    e.preventDefault()
    setError('')

    if (partial && !fromDate) {
      setError('Please choose a date.')
      return
    }
    if (!partial && (!fromDate || !toDate)) {
      setError('Please choose both a start and end date.')
      return
    }
    if (type === 'halfday' && !halfDayPart) {
      setError('Please choose whether the half day is the first half or the second half.')
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

    const applyError = onApply({
      type,
      fromDate,
      toDate: effectiveToDate,
      halfDayPart: type === 'halfday' ? halfDayPart : null,
      reason,
      supportingDocuments: sickLeave ? supportingDocuments : []
    })
    if (applyError) {
      setError(applyError)
      return
    }

    if (!initial) {
      setType('casual')
      setHalfDayPart('')
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
            {LEAVE_TYPES.filter((t) => t.key !== 'unpaid').map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
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
        {type === 'halfday' && (
          <label className="field">
            <span>Half of the day</span>
            <select value={halfDayPart} onChange={(e) => setHalfDayPart(e.target.value)}>
              <option value="">-- choose --</option>
              <option value="first">First half</option>
              <option value="second">Second half</option>
            </select>
          </label>
        )}
        <label className="field">
          <span>{partial ? 'Date' : 'From date'}</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        {!partial && (
          <label className="field">
            <span>To date</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
        )}
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
          This equals <strong>{requestedDays}</strong> working day(s) — weekends are excluded automatically.
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
