import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createITIssue,
  getITIssuesForEmployee,
  getITStaffById,
  updateITIssue,
  withdrawITIssue
} from '../data/store.js'
import { IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import {
  canEditITIssue,
  canWithdrawITIssue,
  itIssueStatusClass,
  itIssueStatusLabel
} from '../utils/itIssues.js'
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

const BLANK_FORM = { issue: '', description: '', priority: 'medium' }

function ITIssueForm({ formData, onChange, onSubmit, onCancel, submitLabel = 'Submit Issue' }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label>Issue *</label>
        <input
          type="text"
          value={formData.issue}
          onChange={(e) => onChange({ ...formData, issue: e.target.value })}
          placeholder="e.g., Computer not starting"
          required
        />
      </div>
      <div className="field">
        <label>Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Describe the problem in detail..."
        />
      </div>
      <div className="field">
        <label>Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => onChange({ ...formData, priority: e.target.value })}
        >
          {IT_ISSUE_PRIORITIES.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="button-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}

export default function EmployeeITHelpDesk() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [withdrawId, setWithdrawId] = useState(null)
  const [formData, setFormData] = useState(BLANK_FORM)

  const issues = useMemo(
    () => getITIssuesForEmployee(user.id),
    [user.id, refresh]
  )
  const editIssue = issues.find((i) => i.id === editId) || null
  const openIssue = issues.find((i) => i.id === openId) || null

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

  function openCreateForm() {
    setFormData(BLANK_FORM)
    setEditId(null)
    setShowForm((s) => !s)
  }

  function openEditForm(issue) {
    setFormData({
      issue: issue.issue,
      description: issue.description || '',
      priority: issue.priority || 'medium'
    })
    setShowForm(false)
    setEditId(issue.id)
  }

  function handleCreateSubmit(e) {
    e.preventDefault()
    if (!formData.issue.trim()) return

    createITIssue({
      employeeId: user.id,
      issue: formData.issue,
      description: formData.description,
      priority: formData.priority
    })

    setFormData(BLANK_FORM)
    setShowForm(false)
    setRefresh((n) => n + 1)
  }

  function handleEditSubmit(e) {
    e.preventDefault()
    if (!editIssue || !formData.issue.trim()) return

    updateITIssue(editIssue.id, user.id, {
      issue: formData.issue,
      description: formData.description,
      priority: formData.priority
    })

    setEditId(null)
    setFormData(BLANK_FORM)
    setRefresh((n) => n + 1)
  }

  function handleWithdraw(issueId) {
    setWithdrawId(issueId)
  }

  function confirmWithdraw() {
    if (withdrawId) {
      withdrawITIssue(withdrawId, user.id)
      if (editId === withdrawId) setEditId(null)
      if (openId === withdrawId) setOpenId(null)
      setWithdrawId(null)
      setRefresh((n) => n + 1)
    }
  }

  function cancelWithdraw() {
    setWithdrawId(null)
  }

  function toggleMenu(issueId) {
    setOpenMenuId(openMenuId === issueId ? null : issueId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

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

  return (
    <div>
      <div className="page-head">
        <h2>My IT Issues</h2>
        <button
          className="btn btn-primary btn-tiny"
          onClick={openCreateForm}
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
            <ITIssueForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </Modal>
      )}

      {editIssue && (
        <Modal onClose={() => setEditId(null)} title="Edit IT issue">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit IT issue</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setEditId(null)}>✕</button>
            </div>
            <p className="hint first">
              You can edit an issue while it is open and not yet assigned to IT staff.
            </p>
            <ITIssueForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditId(null)}
              submitLabel="Save changes"
            />
          </div>
        </Modal>
      )}

      {openIssue && (
        <Modal onClose={() => setOpenId(null)} title={openIssue.issue}>
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>{openIssue.issue}</h3>
                <div className="muted small">Reported {formatDate(openIssue.createdOn)}</div>
              </div>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setOpenId(null)}>✕</button>
            </div>
            <ul className="lunch-policy-list first">
              <li>
                <span className="muted">Priority</span>
                <strong>{getPriorityLabel(openIssue.priority)}</strong>
              </li>
              <li>
                <span className="muted">Status</span>
                <strong>{itIssueStatusLabel(openIssue.status)}</strong>
              </li>
              <li>
                <span className="muted">Assigned to</span>
                <strong>
                  {openIssue.assignedTo
                    ? getITStaffById(openIssue.assignedTo)?.name || openIssue.assignedTo
                    : 'Not assigned'}
                </strong>
              </li>
              {openIssue.estimatedTime && (
                <li>
                  <span className="muted">Est. time</span>
                  <strong>{openIssue.estimatedTime}</strong>
                </li>
              )}
            </ul>
            {openIssue.description && (
              <p className="hint"><strong>Description:</strong> {openIssue.description}</p>
            )}
            <div className="button-row">
              {canEditITIssue(openIssue) && (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    openEditForm(openIssue)
                    setOpenId(null)
                  }}
                >
                  Edit issue
                </button>
              )}
              {canWithdrawITIssue(openIssue) && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleWithdraw(openIssue.id)}
                >
                  Withdraw issue
                </button>
              )}
              <button type="button" className="btn btn-light" onClick={() => setOpenId(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={issuesTotal}
          startIndex={issuesStart}
          endIndex={issuesEnd}
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={7} className="muted">No IT issues match your filters.</td></tr>
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
                    <span className={`tag ${itIssueStatusClass(issue.status)}`}>
                      {itIssueStatusLabel(issue.status)}
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
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(issue.id)}
                        aria-label="IT issue actions"
                      >
                        ⋯
                      </button>
                      {openMenuId === issue.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => {
                              setOpenId(issue.id)
                              closeMenu()
                            }}
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={!canEditITIssue(issue)}
                            onClick={() => {
                              openEditForm(issue)
                              setOpenId(null)
                              closeMenu()
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={!canWithdrawITIssue(issue)}
                            onClick={() => {
                              handleWithdraw(issue.id)
                            }}
                          >
                            Withdraw
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
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

      {withdrawId && (
        <Modal onClose={cancelWithdraw} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelWithdraw}>✕</button>
            </div>
            <p className="hint first">
              Are you sure you want to withdraw this IT issue? This action cannot be undone.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmWithdraw}>
                Withdraw
              </button>
              <button type="button" className="btn btn-light" onClick={cancelWithdraw}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      <p className="hint">
        Report computer-related issues here. You can edit or withdraw a request while it is
        still open. Once IT staff are assigned, contact them directly for changes.
      </p>
    </div>
  )
}
