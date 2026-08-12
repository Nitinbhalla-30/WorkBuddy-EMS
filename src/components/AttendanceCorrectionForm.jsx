import { useState } from 'react'
import { ATTENDANCE_CORRECTION_ISSUES } from '../data/sampleData.js'
import TimeInput from './TimeInput.jsx'

// Request HR to fix a wrong attendance record (create or edit).
export default function AttendanceCorrectionForm({
  onSubmit,
  onCancel,
  defaultDate = '',
  initial = null,
  submitLabel = 'Submit request'
}) {
  const isEdit = Boolean(initial)

  const [date, setDate] = useState(initial?.date || defaultDate)
  const [issueType, setIssueType] = useState(initial?.issueType || 'missed_time_in')
  const [description, setDescription] = useState(initial?.description || '')
  const [suggestedTimeIn, setSuggestedTimeIn] = useState(initial?.suggestedTimeIn || '')
  const [suggestedTimeOut, setSuggestedTimeOut] = useState(initial?.suggestedTimeOut || '')
  const [error, setError] = useState('')

  const showTimeIn = issueType === 'missed_time_in' || issueType === 'wrong_times'
  const showTimeOut = issueType === 'missed_time_out' || issueType === 'wrong_times'

  function submit(e) {
    e.preventDefault()
    setError('')

    if (!date) {
      setError('Please choose the date of the attendance record.')
      return
    }
    if (!description.trim()) {
      setError('Please describe what needs to be corrected.')
      return
    }

    onSubmit({
      date,
      issueType,
      description: description.trim(),
      suggestedTimeIn: showTimeIn ? suggestedTimeIn : '',
      suggestedTimeOut: showTimeOut ? suggestedTimeOut : ''
    })

    if (!isEdit) {
      setDate(defaultDate)
      setIssueType('missed_time_in')
      setDescription('')
      setSuggestedTimeIn('')
      setSuggestedTimeOut('')
      setError('')
    }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="error-box first">{error}</div>}

      <div className="two-col">
        <label className="field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field">
          <span>What went wrong?</span>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            {ATTENDANCE_CORRECTION_ISSUES.map((i) => (
              <option key={i.key} value={i.key}>{i.label}</option>
            ))}
          </select>
        </label>
      </div>

      {showTimeIn && (
        <label className="field">
          <span>Suggested time in (optional)</span>
          <TimeInput
            value={suggestedTimeIn}
            onChange={(e) => setSuggestedTimeIn(e.target.value)}
          />
        </label>
      )}

      {showTimeOut && (
        <label className="field">
          <span>Suggested time out (optional)</span>
          <TimeInput
            value={suggestedTimeOut}
            onChange={(e) => setSuggestedTimeOut(e.target.value)}
          />
        </label>
      )}

      <label className="field">
        <span>Details</span>
        <textarea
          className="reply-input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what happened — e.g. forgot to punch out after a client visit"
        />
      </label>

      <p className="hint first">
        HR will review your request and update your attendance if approved.
      </p>

      <div className="button-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
