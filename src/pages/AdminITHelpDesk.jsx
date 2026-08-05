import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  assignITIssue,
  getEmployeeById,
  getITIssues,
  getITStaff,
  setITIssueStatus
} from '../data/store.js'
import { IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'

export default function AdminITHelpDesk() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [editingIssue, setEditingIssue] = useState(null)
  const [editForm, setEditForm] = useState({
    assignedTo: '',
    estimatedTime: ''
  })

  const issues = useMemo(() => {
    return getITIssues().filter((i) => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false
      return true
    })
  }, [statusFilter, priorityFilter, refresh])

  const itStaff = getITStaff()

  function handleEdit(issue) {
    setEditingIssue(issue)
    setEditForm({
      assignedTo: issue.assignedTo || '',
      estimatedTime: issue.estimatedTime || ''
    })
  }

  function handleSaveAssignment() {
    if (!editingIssue) return

    assignITIssue(
      editingIssue.id,
      editForm.assignedTo || null,
      editForm.estimatedTime || null
    )

    setEditingIssue(null)
    setEditForm({ assignedTo: '', estimatedTime: '' })
    setRefresh((n) => n + 1)
  }

  function handleCancelEdit() {
    setEditingIssue(null)
    setEditForm({ assignedTo: '', estimatedTime: '' })
  }

  function handleStatusChange(issueId, newStatus) {
    setITIssueStatus(issueId, newStatus)
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

  const openCount = getITIssues().filter((i) => i.status === 'open').length

  return (
    <div>
      <div className="page-head">
        <h2>IT Issues</h2>
        <span className="muted">{openCount} open issues</span>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filters">
          <label className="field inline">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              {IT_ISSUE_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="field inline">
            <span>Priority</span>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All</option>
              {IT_ISSUE_PRIORITIES.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* IT Issues Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Est. Time</th>
              <th>Reported On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 && (
              <tr><td colSpan={8} className="muted">No IT issues match these filters.</td></tr>
            )}
            {issues.map((issue) => {
              const employee = getEmployeeById(issue.employeeId)
              const assignedStaff = issue.assignedTo ? itStaff.find((s) => s.id === issue.assignedTo) : null
              const isEditing = editingIssue?.id === issue.id

              return (
                <tr key={issue.id}>
                  <td>{employee?.name || issue.employeeId}</td>
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
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      className="btn-tiny"
                    >
                      {IT_ISSUE_STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.assignedTo}
                        onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                        className="btn-tiny"
                      >
                        <option value="">Unassigned</option>
                        {itStaff.map((staff) => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </select>
                    ) : (
                      assignedStaff ? (
                        <div>
                          <div>{assignedStaff.name}</div>
                          <div className="muted small">{assignedStaff.mobile}</div>
                        </div>
                      ) : (
                        <span className="muted">Not assigned</span>
                      )
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.estimatedTime}
                        onChange={(e) => setEditForm({ ...editForm, estimatedTime: e.target.value })}
                        placeholder="e.g., 2 hours"
                        className="btn-tiny"
                      />
                    ) : (
                      issue.estimatedTime || <span className="muted">--</span>
                    )}
                  </td>
                  <td>{formatDate(issue.createdOn)}</td>
                  <td>
                    {isEditing ? (
                      <div>
                        <button
                          className="btn btn-tiny btn-primary"
                          onClick={handleSaveAssignment}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-tiny btn-light"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-tiny btn-light"
                        onClick={() => handleEdit(issue)}
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="hint">
        Manage IT Issues and assign them to team members. Employees can see
        the assigned person's name and contact number.
      </p>
    </div>
  )
}