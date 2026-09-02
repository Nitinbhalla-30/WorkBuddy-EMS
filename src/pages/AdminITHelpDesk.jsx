import { useEffect, useMemo, useState } from 'react'
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
import { IT_ISSUE_STATUS_FILTER_OPTS, itIssueCategoryLabel, itIssueDisplayStatus, itIssueStatusClass, itIssueStatusLabel } from '../utils/itIssues.js'
import ITIssueThread from '../components/ITIssueThread.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { Eye, MoreVertical, Wrench, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'

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
  const [viewId, setViewId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  // Three kinds of viewer, and only the first two own the help desk:
  //   IT staff  — work their own queue.
  //   IT Manager — sees everything and assigns it.
  //   HR/Admin — reads the whole list, changes nothing.
  const isITUser = user?.department === 'IT Support'
  const isITStaff = isITUser && !user.isManager
  const canAssign = isITUser && !!user.isManager

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
      return [employee?.name, i.issue, i.description, itIssueCategoryLabel(i.category), i.priority, i.status, itIssueDisplayStatus(i), assigned?.name, i.estimatedTime, i.createdOn].join(' ')
    },
    getSortValue: (i, key) => {
      if (key === 'employee') return getEmployeeById(i.employeeId)?.name || i.employeeId
      if (key === 'assigned') return i.assignedTo || ''
      // Sort on the words the cell shows, so Reopened rows group together instead
      // of being buried inside Open.
      if (key === 'status') return itIssueStatusLabel(itIssueDisplayStatus(i))
      return i[key]
    },
    initialSortKey: 'createdOn',
    initialSortDir: 'desc',
    filterFns: {
      // Choosing "Open" now leaves out the re-opened ones, which have their own
      // entry — the filter reads the row exactly as the Status column does.
      status: (i, val) => itIssueDisplayStatus(i) === val,
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

  // The IT Manager sets the assignee and the response time straight from the row,
  // so each change saves on its own — there is no edit mode to enter or leave.
  function handleAssigneeChange(issue, assignedTo) {
    assignITIssue(issue.id, assignedTo || null, issue.estimatedTime || null)
    setRefresh((n) => n + 1)
  }

  function handleResponseTimeCommit(issue, rawValue) {
    const value = rawValue.trim()
    // Blur after typing nothing new must not rewrite the issue or bump its
    // "updated" stamp.
    if (value === (issue.estimatedTime || '')) return
    assignITIssue(issue.id, issue.assignedTo || null, value || null)
    setRefresh((n) => n + 1)
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

  function toggleMenu(issueId) {
    setOpenMenuId(openMenuId === issueId ? null : issueId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  // Close the row menu on any click outside it — same convention as every other
  // table's three-dot menu in the app.
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

  const openCount = allIssues.filter((i) => i.status === 'open').length

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Wrench size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />IT Issues
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>
            {isITUser
              ? 'Track, assign, and resolve employee IT support requests'
              : 'Every employee IT support request — the IT team assigns and resolves them'}
          </p>
        </div>
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
            { key: 'category', label: 'Category', value: table.filters.category || 'all', options: IT_CATEGORY_FILTER_OPTS },
            { key: 'priority', label: 'Priority', value: table.filters.priority || 'all', options: IT_PRIORITY_FILTER_OPTS },
            { key: 'status', label: 'Status', value: table.filters.status || 'all', options: IT_ISSUE_STATUS_FILTER_OPTS },
            { key: 'assigned', label: 'Assigned To', value: table.filters.assigned || 'all', options: assignedFilterOpts }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table table-compact" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '12%' }} /> {/* Employee */}
            <col style={{ width: '16%' }} /> {/* Issue */}
            <col style={{ width: '9%' }} />  {/* Category */}
            <col style={{ width: '8%' }} />  {/* Priority */}
            <col style={{ width: '13%' }} /> {/* Status */}
            <col style={{ width: '13%' }} /> {/* Assigned To — holds a dropdown */}
            <col style={{ width: '11%' }} /> {/* Response Time — holds a text box */}
            <col style={{ width: '10%' }} /> {/* Reported On */}
            {/* The Actions column only exists for the IT Manager, so its col is
                left out for everyone else — an orphan 8% col would strand dead
                space on the right of the table. The rest sum to 92 and the
                browser scales them to fill the gap. */}
            {canAssign && <col style={{ width: '8%' }} />}
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Issue" keyName="issue" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned To" keyName="assigned" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Response Time" keyName="estimatedTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Reported On" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              {canAssign && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty
                colSpan={canAssign ? 9 : 8}
                message={isITStaff ? 'No IT issues are assigned to you right now.' : 'No IT issues match your filters.'}
              />
            )}
            {pageRows.map((issue) => {
              const employee = getEmployeeById(issue.employeeId)
              const assignedStaff = issue.assignedTo ? itStaff.find((s) => s.id === issue.assignedTo) : null

              return (
                <tr key={issue.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar src={employee?.photoUrl} name={employee?.name} size={34} />
                      {/* The narrow column ellipsizes the name, so keep it readable. */}
                      <span title={employee?.name || issue.employeeId}>{employee?.name || issue.employeeId}</span>
                    </div>
                  </td>
                  <td>
                    <button type="button" className="issue-link" onClick={() => setViewId(issue.id)} title="Open issue details and discussion">
                      <strong>{issue.issue}</strong>
                    </button>
                    {issue.description && (
                      <div className="muted small cell-ellipsis" title={issue.description}>{issue.description}</div>
                    )}
                  </td>
                  <td>{itIssueCategoryLabel(issue.category)}</td>
                  <td>
                    <span className={`tag ${getPriorityClass(issue.priority)}`}>
                      {getPriorityLabel(issue.priority)}
                    </span>
                  </td>
                  <td>
                    {isITUser ? (
                      <select
                        value={itIssueDisplayStatus(issue)}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                        className="btn-tiny"
                        aria-label="Status"
                      >
                        {/* A re-opened issue is still stage 'open' in the data, but the
                            one thing IT has to see is the word saying the fix was
                            rejected. This entry is disabled, so it can be read and
                            never picked — and choosing any real stage below sets the
                            status and clears the reopen flag at the same time. */}
                        {itIssueDisplayStatus(issue) === 'reopened' && (
                          <option value="reopened" disabled>{itIssueStatusLabel('reopened')}</option>
                        )}
                        {IT_ISSUE_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    ) : (
                      /* HR/Admin read the status instead of setting it — moving
                         an issue along is the IT team's call. Same plain tag the
                         employee sees on their own IT Issues page. */
                      <span className={`tag ${itIssueStatusClass(itIssueDisplayStatus(issue))}`}>
                        {itIssueStatusLabel(itIssueDisplayStatus(issue))}
                      </span>
                    )}
                  </td>
                  <td>
                    {canAssign ? (
                      /* The manager picks the person here directly — one choice,
                         saved immediately, no round trip through a menu. */
                      <select
                        value={issue.assignedTo || ''}
                        onChange={(e) => handleAssigneeChange(issue, e.target.value)}
                        className="btn-tiny"
                        aria-label="Assigned to"
                      >
                        <option value="">Unassigned</option>
                        {itStaff.map((staff) => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </select>
                    ) : assignedStaff ? (
                      <div>
                        <div>{assignedStaff.name}</div>
                        <div className="muted small">{assignedStaff.mobile}</div>
                      </div>
                    ) : (
                      <span className="muted">Not assigned</span>
                    )}
                  </td>
                  <td>
                    {canAssign ? (
                      /* Uncontrolled on purpose: the manager types freely and only
                         the finished value is written, so the list refreshing
                         under them cannot interrupt the half-typed text. Enter or
                         clicking away commits it. */
                      <input
                        type="text"
                        defaultValue={issue.estimatedTime || ''}
                        onBlur={(e) => handleResponseTimeCommit(issue, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                        placeholder="e.g., 2 hours"
                        className="btn-tiny"
                        aria-label="Expected response time"
                      />
                    ) : (
                      issue.estimatedTime || <span className="muted">--</span>
                    )}
                  </td>
                  <td>{formatDate(issue.createdOn)}</td>
                  {canAssign && (
                    <td>
                      {/* Only Open is left in here now that the assignee and the
                          response time are edited in their own columns. */}
                      <div className="task-menu-container">
                        <button
                          type="button"
                          className="btn btn-tiny btn-light task-menu-button"
                          onClick={() => toggleMenu(issue.id)}
                          aria-label="Issue actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === issue.id && (
                          <div className="task-menu-dropdown">
                            <button
                              type="button"
                              className="task-menu-item"
                              onClick={() => { setViewId(issue.id); closeMenu() }}
                            >
                              <Eye size={14} aria-hidden="true" />Open
                            </button>
                          </div>
                        )}
                      </div>
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
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setViewId(null)} aria-label="Close"><X size={15} /></button>
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
                <strong>{itIssueStatusLabel(itIssueDisplayStatus(viewIssue))}</strong>
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
              /* A message posted here is stamped as coming from IT, so HR/Admin
                 read the thread but cannot write to it — the employee would
                 otherwise think IT had replied. */
              onReply={isITUser ? (text) => handleViewReply(viewIssue.id, text) : undefined}
            />
          </div>
        </Modal>
      )}

      <p className="hint">
        {isITStaff
          ? 'These are the IT issues assigned to you. Update the status as you work on each issue.'
          : canAssign
            ? 'Assign issues to your team and keep their status up to date — every change in a row saves as soon as you make it. Employees can see the assigned person\u2019s name and contact details.'
            : 'Read-only view of every IT issue in the organisation. Assigning work and updating status belong to the IT team.'}
      </p>
    </div>
  )
}
