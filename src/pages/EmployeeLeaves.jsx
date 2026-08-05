import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  applyLeave,
  getLeavesForEmployee,
  getSettings
} from '../data/store.js'
import { LEAVE_TYPES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import {
  countLeaveDays,
  leaveBalance,
  leaveTypeLabel,
  statusTagClass
} from '../utils/leaves.js'

// The employee's leave screen: balance, apply form, and their requests.
export default function EmployeeLeaves() {
  const { user } = useAuth()
  const settings = getSettings()

  const [leaves, setLeaves] = useState(() => getLeavesForEmployee(user.id))
  const [type, setType] = useState('casual')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const balance = useMemo(
    () => leaveBalance(leaves, settings.leaveAllowance),
    [leaves, settings.leaveAllowance]
  )

  const requestedDays = countLeaveDays(fromDate, toDate)

  function handleApply(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!fromDate || !toDate) {
      setError('Please choose both a start and end date.')
      return
    }
    if (requestedDays <= 0) {
      setError('The dates are not valid (end date is before start, or only weekends).')
      return
    }

    applyLeave({ employeeId: user.id, type, fromDate, toDate, reason })
    setLeaves(getLeavesForEmployee(user.id))
    setMessage('Your leave request was sent to HR/Admin.')
    setFromDate('')
    setToDate('')
    setReason('')
  }

  return (
    <div>
      <div className="page-head">
        <h2>My Leaves</h2>
        <span className="muted">Year {new Date().getFullYear()}</span>
      </div>

      {/* Balance cards */}
      <div className="stat-grid">
        {balance.map((b) => (
          <div className="stat-card" key={b.key}>
            <div className="stat-num">{b.remaining}</div>
            <div className="stat-label">
              {b.label} left <span className="muted">/ {b.allowed}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Apply form */}
      <h3 className="section-title">Apply for leave</h3>
      <form className="card" onSubmit={handleApply}>
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
          <p className="hint first">This request is for <strong>{requestedDays}</strong> working day(s). Weekends are not counted.</p>
        )}

        {error && <div className="error-box">{error}</div>}
        {message && <div className="info-box">{message}</div>}

        <div className="button-row">
          <button className="btn btn-primary" type="submit">Send request</button>
        </div>
      </form>

      {/* My requests */}
      <h3 className="section-title">My requests</h3>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 && (
              <tr><td colSpan="6" className="muted">No leave requests yet.</td></tr>
            )}
            {leaves.map((lv) => (
              <tr key={lv.id}>
                <td>{leaveTypeLabel(lv.type)}</td>
                <td>{formatDate(lv.fromDate)}</td>
                <td>{formatDate(lv.toDate)}</td>
                <td>{countLeaveDays(lv.fromDate, lv.toDate)}</td>
                <td>{lv.reason || <span className="muted">--</span>}</td>
                <td>
                  <span className={`tag ${statusTagClass(lv.status)}`}>
                    {lv.status.charAt(0).toUpperCase() + lv.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
