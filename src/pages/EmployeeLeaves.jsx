import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  applyLeave,
  getLeavesForEmployee,
  getSettings
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  countLeaveDays,
  leaveBalance,
  leaveTypeLabel,
  statusTagClass
} from '../utils/leaves.js'
import LeaveForm from '../components/LeaveForm.jsx'

// The employee's leave screen: balance, apply form, and their requests.
export default function EmployeeLeaves() {
  const { user } = useAuth()
  const settings = getSettings()

  const [leaves, setLeaves] = useState(() => getLeavesForEmployee(user.id))
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const balance = useMemo(
    () => leaveBalance(leaves, settings.leaveAllowance),
    [leaves, settings.leaveAllowance]
  )

  function handleApply(data) {
    applyLeave({ employeeId: user.id, ...data })
    setLeaves(getLeavesForEmployee(user.id))
    setShowForm(false)
    setMessage('Your leave request was sent to HR/Admin.')
  }

  return (
    <div>
      <div className="page-head">
        <h2>My Leaves</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="muted">Year {new Date().getFullYear()}</span>
          <button
            className="btn btn-primary btn-tiny"
            onClick={() => setShowForm(true)}
          >
            Apply for leave
          </button>
        </div>
      </div>

      {message && <div className="info-box">{message}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Apply for leave</h3>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>
              <p className="hint first">
                Choose your leave type and dates. Weekends are not counted toward your request.
              </p>
              <LeaveForm
                onApply={handleApply}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

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
