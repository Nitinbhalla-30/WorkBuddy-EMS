import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addITIssueComment,
  assignITIssue,
  getEmployeeById,
  getITIssues,
  getITStaff,
  setITIssueStatus
} from '../data/store.js'
import { IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import { itIssueCategoryLabel } from '../utils/itIssues.js'
import ITIssueThread from '../components/ITIssueThread.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'

const IT_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...IT_ISSUE_STATUSES.map((s) => ({ value: s.key, label: s.label }))
]
const IT_PRIORITY_FILTER_OPTS = [
  { value: 'all', label: 'All priorities' },
  ...IT_ISSUE_PRIORITIES.map((p) => ({ value: p.key, label: p.label }))
]
const IT_CATEGORY_FILTER_OPTS = [
  { value: 'all', label: 'All categories' },
  ...IT_ISSUE_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
]

export default function AdminITHelpDesk() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [editingIssue, setEditingIssue] = useState(null)
  const [viewId, setViewId] = useState(null)
  const [editForm, setEditForm] = useState({
    assignedTo: '',
    estimatedTime: ''
  })

  // IT Support staff see only the issues assigned to them; the IT Manager
  // sees everything and is the only one who can assign issues to staff.
  const isITStaff = user?.department === 'IT Support' && !user.isManager
  const canAssign = user?.department === 'IT Support' ? !!user.isManager : false

  const allIssues = useMemo(() => {
    const issues = getITIssues()
    return isITStaff ? issues.filter((i) => i.assignedTo === user.id) : issues
  }, [refresh, isITStaff, user.id])

  const viewIssue = allIssues.find((i) => i.id === viewId) || null

  const itStaff = getITStaff()

  // Employee filter lists only the people who appear in the visible issues.
  const employeeFilterOpts = useMemo(() => {
    const ids = [...new Set(allIssues.map((i) => i.employeeId))]
    return [
      { value: 'all', label: 'All employees' },
      ...ids
        .map((id) => ({ value: id, label: getEmployeeById(id)?.name || id }))
        .sort((a, b) => a.label.localeCompare(b.label))
    ]
  }, [allIssues])

  const assignedFilterOpts = [
    { value: 'all', label: 'Everyone' },
    { value: 'unassigned', label: 'Unassigned' },
    ...itStaff.map((s) => ({ value: s.id, label: s.name }))
  ]

  const table = useTableControls(allIssues, {
    getSearchText: (i) => {
      const employee = getEmployeeById(i.employeeId)
      const assigned = i.assignedTo ? getITStaff().find((s) => s.id === i.assignedTo) : null
      return [employee?.name, i.issue, i.description, itIssueCategoryLabel(i.category), i.priority, i.status, assigned?.name, i.estimatedTime, i.createdOn].join(' ')
    },
    getSortValue: (i, key) => {
      if (key === 'employee') return getEmployeeById(i.employeeId)?.name || i.employeeId
      if (key === 'assigned') return i.assignedTo || ''
      return i[key]
    },
    initialSortKey: 'createdOn',
    initialSortDir: 'desc',
    filterFns: {
      status: (i, val) => i.status === val,
      priority: (i, val) => i.priority === val,
      category: (i, val) => (i.category || 'other') === val,
      employee: (i, val) => i.employeeId === val,
      assigned: (i, val) => (val === 'unassigned' ? !i.assignedTo : i.assignedTo === val)
    }
  })

  // Show 10 issues per page.
  const {
    items: pageRows,
    page: pageNum,
    totalPages,
    total,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows, 10)

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

  // IT staff post questions/updates to the issue's discussion thread.
  function handleViewReply(issueId, text) {
    addITIssueComment(issueId, { byId: user.id, byName: user.name, byRole: 'it' }, text)
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

  const openCount = allIssues.filter((i) => i.status === 'open').length

  return (
    <div>
      <div className="page-head">
        <h2>IT Issues</h2>
        <span className="muted">
          {isITStaff ? `${openCount} open issues assigned to you` : `${openCount} open issues`}
        </span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search IT issues..."
          filters={[
            { key: 'employee', label: 'Employee', value: table.filters.employee || 'all', options: employeeFilterOpts },
            { key: 'category', label: 'Category', value: table.filters.category || 'all', options: IT_CATEGORY_FILTER_OPTS },
            { key: 'priority', label: 'Priority', value: table.filters.priority || 'all', options: IT_PRIORITY_FILTER_OPTS },
            { key: 'status', label: 'Status', value: table.filters.status || 'all', options: IT_STATUS_FILTER_OPTS },
            { key: 'assigned', label: 'Assigned To', value: table.filters.assigned || 'all', options: assignedFilterOpts }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '9%' }} />
            <col style={{ width: '32%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Issue" keyName="issue" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Status</th>
              <SortableTh label="Assigned To" keyName="assigned" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Expected Response Time" keyName="estimatedTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reported On" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              {canAssign && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={canAssign ? 9 : 8} className="muted">
                {isITStaff ? 'No IT issues are assigned to you right now.' : 'No IT issues match your filters.'}
              </td></tr>
            )}
            {pageRows.map((issue) => {
              const employee = getEmployeeById(issue.employeeId)
              const assignedStaff = issue.assignedTo ? itStaff.find((s) => s.id === issue.assignedTo) : null
              const isEditing = editingIssue?.id === issue.id

              return (
                <tr key={issue.id}>
                  <td>{employee?.name || issue.employeeId}</td>
                  <td>
                    <button type="button" className="issue-link" onClick={() => setViewId(issue.id)} title="Open issue details and discussion">
                      <strong>{issue.issue}</strong>
                    </button>
                    {issue.description && (
                      <div className="muted small">{issue.description}</div>
                    )}
                  </td>
                  <td>{itIssueCategoryLabel(issue.category)}</td>
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
                  {canAssign && (
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
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination
          page={pageNum}
          totalPages={totalPages}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </div>

      {viewIssue && (
        <Modal onClose={() => setViewId(null)} title={viewIssue.issue}>
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>{viewIssue.issue}</h3>
                <div className="muted small">Reported {formatDate(viewIssue.createdOn)}</div>
              </div>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setViewId(null)}>✕</button>
            </div>
            <ul className="lunch-policy-list first">
              <li>
                <span className="muted">Employee</span>
                <strong>{getEmployeeById(viewIssue.employeeId)?.name || viewIssue.employeeId}</strong>
              </li>
              <li>
                <span className="muted">Category</span>
                <strong>{itIssueCategoryLabel(viewIssue.category)}</strong>
              </li>
              <li>
                <span className="muted">Priority</span>
                <strong>{getPriorityLabel(viewIssue.priority)}</strong>
              </li>
              <li>
                <span className="muted">Status</span>
                <strong>{IT_ISSUE_STATUSES.find((s) => s.key === viewIssue.status)?.label || viewIssue.status}</strong>
              </li>
              <li>
                <span className="muted">Assigned to</span>
                <strong>
                  {viewIssue.assignedTo
                    ? itStaff.find((s) => s.id === viewIssue.assignedTo)?.name || viewIssue.assignedTo
                    : 'Not assigned'}
                </strong>
              </li>
              {viewIssue.estimatedTime && (
                <li>
                  <span className="muted">Expected Response Time</span>
                  <strong>{viewIssue.estimatedTime}</strong>
                </li>
              )}
            </ul>
            {viewIssue.description && (
              <p className="hint"><strong>Description:</strong> {viewIssue.description}</p>
            )}
            {viewIssue.attachment && viewIssue.attachment.dataUrl && (
              <div className="field">
                <span>Error screenshot</span>
                <img
                  src={viewIssue.attachment.dataUrl}
                  alt={viewIssue.attachment.name || 'Error screenshot'}
                  style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, border: '1px solid #d9def0' }}
                />
              </div>
            )}
            <ITIssueThread
              issue={viewIssue}
              viewerRole="it"
              onReply={(text) => handleViewReply(viewIssue.id, text)}
            />
          </div>
        </Modal>
      )}

      <p className="hint">
        {isITStaff
          ? 'These are the IT issues assigned to you. Update the status as you work on them.'
          : 'Manage IT Issues and assign them to team members. Employees can see the assigned person\u2019s name and contact number.'}
      </p>
    </div>
  )
}
