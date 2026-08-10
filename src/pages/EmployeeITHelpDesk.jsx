import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createITIssue,
  getITIssuesForEmployee,
  getITStaffById
} from '../data/store.js'
import { IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'

const IT_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...IT_ISSUE_STATUSES.map((s) => ({ value: s.key, label: s.label }))
]
const IT_PRIORITY_FILTER_OPTS = [
  { value: 'all', label: 'All priorities' },
  ...IT_ISSUE_PRIORITIES.map((p) => ({ value: p.key, label: p.label }))
]

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
  const table = useTableControls(issues, {
    getSearchText: (i) =>
      [i.issue, i.description, i.priority, i.status, i.estimatedTime, i.createdOn].join(' '),
    getSortValue: (i, key) => {
      if (key === 'assigned') return i.assignedTo || ''
      return i[key]
    },
    initialSortKey: 'createdOn',
    initialSortDir: 'desc',
    filterFns: {
      status: (i, val) => i.status === val,
      priority: (i, val) => i.priority === val
    }
  })
  const {
    items: issuesPage,
    page: issuesPageNum,
    totalPages: issuesTotalPages,
    total: issuesTotal,
    startIndex: issuesStart,
    endIndex: issuesEnd,
    setPage: setIssuesPage
  } = usePagination(table.rows)

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
        <Modal onClose={() => setShowForm(false)} title="Report IT Issue">
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
        </Modal>
      )}

      {/* My IT Issues */}
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search IT issues..."
          filters={[
            { key: 'status', label: 'Status', value: table.filters.status || 'all', options: IT_STATUS_FILTER_OPTS },
            { key: 'priority', label: 'Priority', value: table.filters.priority || 'all', options: IT_PRIORITY_FILTER_OPTS }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Issue" keyName="issue" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned To" keyName="assigned" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Est. Time" keyName="estimatedTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reported On" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={6} className="muted">No IT issues match your filters.</td></tr>
            )}
            {issuesPage.map((issue) => {
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
        <Pagination
          page={issuesPageNum}
          totalPages={issuesTotalPages}
          total={issuesTotal}
          startIndex={issuesStart}
          endIndex={issuesEnd}
          onPageChange={setIssuesPage}
        />
      </div>

      <p className="hint">
        Report your computer-related issues here. You can see which IT team member
        is assigned to fix your problem along with their contact details.
      </p>
    </div>
  )
}