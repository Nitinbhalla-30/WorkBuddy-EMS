import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createITIssue,
  getITIssuesForEmployee,
  getITStaffById
} from '../data/store.js'
import { IT_ISSUE_PRIORITIES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'

export default function EmployeeITHelpDesk() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    issue: '',
    description: '',
    priority: 'medium'
  })

  const issues = useMemo(
    () => getITIssuesForEmployee(user.id),
    [user.id, refresh]
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.issue.trim()) return

    createITIssue({
      employeeId: user.id,
      issue: formData.issue,
      description: formData.description,
      priority: formData.priority
    })

    setFormData({ issue: '', description: '', priority: 'medium' })
    setShowForm(false)
    setRefresh((n) => n + 1)
  }

  function getPriorityLabel(key) {
    const p = IT_ISSUE_PRIORITIES.find((item) => item.key === key)
    return p ? p.label : key
  }

  function getPriorityClass(key) {
    switch (key) {
      case 'high': return 'tag-high'
      case 'medium': return 'tag-medium'
      case 'low': return 'tag-low'
      default: return ''
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'open': return 'Open'
      case 'inprogress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case 'open': return 'tag-high'
      case 'inprogress': return 'tag-medium'
      case 'resolved': return 'tag-low'
      case 'closed': return ''
      default: return ''
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>My IT Issues</h2>
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? 'Close' : 'Report Issue'}
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Report IT Issue</h3>
                <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Issue *</label>
                  <input
                    type="text"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    placeholder="e.g., Computer not starting"
                    required
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the problem in detail..."
                  />
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {IT_ISSUE_PRIORITIES.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="button-row">
                  <button type="submit" className="btn btn-primary">Submit Issue</button>
                  <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* My IT Issues */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Est. Time</th>
              <th>Reported On</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 && (
              <tr><td colSpan={6} className="muted">You have not reported any IT issues yet.</td></tr>
            )}
            {issues.map((issue) => {
              const assignedStaff = issue.assignedTo ? getITStaffById(issue.assignedTo) : null
              return (
                <tr key={issue.id}>
                  <td>
                    <strong>{issue.issue}</strong>
                    {issue.description && (
                      <div className="muted small">{issue.description}</div>
                    )}
                  </td>
                  <td>
                    <span className={`tag ${getPriorityClass(issue.priority)}`}>
                      {getPriorityLabel(issue.priority)}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${getStatusClass(issue.status)}`}>
                      {getStatusLabel(issue.status)}
                    </span>
                  </td>
                  <td>
                    {assignedStaff ? (
                      <div>
                        <div>{assignedStaff.name}</div>
                        <div className="muted small">{assignedStaff.mobile}</div>
                      </div>
                    ) : (
                      <span className="muted">Not assigned</span>
                    )}
                  </td>
                  <td>
                    {issue.estimatedTime || <span className="muted">--</span>}
                  </td>
                  <td>{formatDate(issue.createdOn)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="hint">
        Report your computer-related issues here. You can see which IT team member
        is assigned to fix your problem along with their contact details.
      </p>
    </div>
  )
}