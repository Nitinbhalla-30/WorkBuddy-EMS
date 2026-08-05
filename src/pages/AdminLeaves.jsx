import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getEmployeeById,
  getLeaves,
  setLeaveStatus
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  countLeaveDays,
  leaveTypeLabel,
  statusTagClass
} from '../utils/leaves.js'

// HR/Admin leave screen: see all requests and approve or reject them.
export default function AdminLeaves() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState(() => getLeaves())
  const [filter, setFilter] = useState('pending')

  const shown = useMemo(() => {
    let list = [...leaves]
    if (filter !== 'all') list = list.filter((l) => l.status === filter)
    return list.sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1))
  }, [leaves, filter])

  const pendingCount = leaves.filter((l) => l.status === 'pending').length

  function decide(id, status) {
    setLeaveStatus(id, status, user.id)
    setLeaves(getLeaves())
  }

  const tabs = [
    { key: 'pending', label: `Pending (${pendingCount})` },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' }
  ]

  return (
    <div>
      <div className="page-head">
        <h2>Leave Requests</h2>
        <span className="muted">{shown.length} shown</span>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${filter === t.key ? 'tab-active' : ''}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan="8" className="muted">No requests here.</td></tr>
            )}
            {shown.map((lv) => {
              const emp = getEmployeeById(lv.employeeId)
              return (
                <tr key={lv.id}>
                  <td>
                    <strong>{emp ? emp.name : lv.employeeId}</strong>
                    <div className="muted small">{emp ? emp.department : ''}</div>
                  </td>
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
                  <td>
                    {lv.status === 'pending' ? (
                      <div className="row-actions">
                        <button className="btn btn-tiny btn-primary" onClick={() => decide(lv.id, 'approved')}>
                          Approve
                        </button>
                        <button className="btn btn-tiny btn-danger" onClick={() => decide(lv.id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="muted small">Done</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="hint">
        Approved paid leave will not cut salary later. Unpaid leave will reduce
        pay when the salary module is built.
      </p>
    </div>
  )
}
