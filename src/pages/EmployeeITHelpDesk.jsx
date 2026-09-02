import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addITIssueComment,
  createITIssue,
  getITIssuesForEmployee,
  getITStaffById,
  reopenITIssue,
  updateITIssue,
  withdrawITIssue
} from '../data/store.js'
import { IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES } from '../data/sampleData.js'
import DropdownSelect from '../components/DropdownSelect.jsx'
import { formatDate } from '../utils/attendance.js'
import {
  IT_ISSUE_STATUS_FILTER_OPTS,
  canEditITIssue,
  canReopenITIssue,
  canWithdrawITIssue,
  itIssueCategoryLabel,
  itIssueDisplayStatus,
  itIssueStatusClass,
  itIssueStatusLabel
} from '../utils/itIssues.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import ITIssueThread from '../components/ITIssueThread.jsx'
import Modal from '../components/Modal.jsx'
import { Eye, MoreVertical, Pencil, Plus, RefreshCw, Trash2, Undo2, Wrench, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const IT_PRIORITY_FILTER_OPTS = [
  { value: 'all', label: 'All priorities' },
  ...IT_ISSUE_PRIORITIES.map((p) => ({ value: p.key, label: p.label }))
]
const IT_CATEGORY_FILTER_OPTS = [
  { value: 'all', label: 'All categories' },
  ...IT_ISSUE_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
]

const BLANK_FORM = { issue: '', description: '', category: '', priority: 'medium', attachment: null }

// Screenshot of the error message, stored as a data URL so IT can actually
// see it. Images only, max 2 MB.
function ScreenshotField({ attachment, onChange }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  function handlePick(e) {
    const file = e.target.files && e.target.files[0]
    if (inputRef.current) inputRef.current.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (e.g., a screenshot).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Please choose an image under 2 MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ name: file.name, size: file.size, dataUrl: String(reader.result || '') })
    }
    reader.onerror = () => setError('Could not read that image. Please try another file.')
    reader.readAsDataURL(file)
  }

  return (
    <div className="field">
      <span>Error screenshot</span>
      <div className="button-row">
        <button type="button" className="btn btn-light btn-tiny" onClick={() => inputRef.current && inputRef.current.click()}>
          {attachment ? 'Replace screenshot' : 'Attach screenshot'}
        </button>
        {attachment && (
          <button type="button" className="btn btn-light btn-tiny" onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePick} />
      <div className="file-hint">Attach a screenshot of the error to help IT diagnose and resolve the issue faster.</div>
      {error && <div className="error-box first">{error}</div>}
      {attachment && attachment.dataUrl && (
        <img
          src={attachment.dataUrl}
          alt={attachment.name}
          style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, border: '1px solid #d9def0', marginTop: 8 }}
        />
      )}
    </div>
  )
}

function ITIssueForm({ formData, onChange, onSubmit, onCancel, submitLabel = 'Submit Issue' }) {
  return (
    <form onSubmit={onSubmit}>
      <label className="field">
        <span>Issue *</span>
        <input
          type="text"
          value={formData.issue}
          onChange={(e) => onChange({ ...formData, issue: e.target.value })}
          placeholder="e.g., Computer not starting"
          required
        />
      </label>
      <label className="field">
        <span>Description</span>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Describe the problem in detail..."
        />
      </label>
      <div className="field">
        <span>Category *</span>
        <DropdownSelect
          value={formData.category}
          options={[
            { value: '', label: '-- choose --' },
            ...IT_ISSUE_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
          ]}
          onChange={(v) => onChange({ ...formData, category: v })}
          ariaLabel="Category"
        />
      </div>
      <div className="field">
        <span>Priority</span>
        <DropdownSelect
          value={formData.priority}
          options={IT_ISSUE_PRIORITIES.map((p) => ({ value: p.key, label: p.label }))}
          onChange={(v) => onChange({ ...formData, priority: v })}
          ariaLabel="Priority"
        />
      </div>
      <ScreenshotField
        attachment={formData.attachment}
        onChange={(attachment) => onChange({ ...formData, attachment })}
      />
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
  const [reopenId, setReopenId] = useState(null)
  const [formData, setFormData] = useState(BLANK_FORM)

  const issues = useMemo(
    () => getITIssuesForEmployee(user.id),
    [user.id, refresh]
  )
  const editIssue = issues.find((i) => i.id === editId) || null
  const openIssue = issues.find((i) => i.id === openId) || null
  // The confirm box names the issue it is about, so this is looked up from the id
  // held in state rather than passed around.
  const reopenIssue = issues.find((i) => i.id === reopenId) || null

  const table = useTableControls(issues, {
    getSearchText: (i) =>
      // Both the stored stage and the shown one, so "open" and "reopened" each
      // find the rows a person would expect them to.
      [i.issue, i.description, itIssueCategoryLabel(i.category), i.priority, i.status, itIssueDisplayStatus(i), i.estimatedTime, i.createdOn].join(' '),
    getSortValue: (i, key) => {
      if (key === 'assigned') return i.assignedTo || ''
      // Sort by the words actually in the cell, so Reopened rows group together
      // instead of hiding inside Open.
      if (key === 'status') return itIssueStatusLabel(itIssueDisplayStatus(i))
      return i[key]
    },
    initialSortKey: 'createdOn',
    initialSortDir: 'desc',
    filterFns: {
      // 'open' now means "open, never re-opened" and 'reopened' is its own
      // bucket — the same reading the Status column uses, so the filter and the
      // cell can never disagree. 'all' still shows everything.
      status: (i, val) => itIssueDisplayStatus(i) === val,
      priority: (i, val) => i.priority === val,
      category: (i, val) => (i.category || 'other') === val
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
      category: issue.category || '',
      priority: issue.priority || 'medium',
      attachment: issue.attachment || null
    })
    setShowForm(false)
    setEditId(issue.id)
  }

  function handleCreateSubmit(e) {
    e.preventDefault()
    if (!formData.issue.trim() || !formData.category) return

    createITIssue({
      employeeId: user.id,
      issue: formData.issue,
      description: formData.description,
      priority: formData.priority,
      category: formData.category,
      attachment: formData.attachment
    })

    setFormData(BLANK_FORM)
    setShowForm(false)
    setRefresh((n) => n + 1)
  }

  function handleEditSubmit(e) {
    e.preventDefault()
    if (!editIssue || !formData.issue.trim() || !formData.category) return

    updateITIssue(editIssue.id, user.id, {
      issue: formData.issue,
      description: formData.description,
      priority: formData.priority,
      category: formData.category,
      attachment: formData.attachment
    })

    setEditId(null)
    setFormData(BLANK_FORM)
    setRefresh((n) => n + 1)
  }

  // Sending an issue back to IT is a decision, so both doors — the row menu and
  // the issue detail — ask first, the same way Withdraw does. The detail panel is
  // closed as the box opens so only one dialog is ever on screen; from the row
  // menu it is already closed, which makes this a no-op there.
  function handleReopen(issueId) {
    setReopenId(issueId)
    setOpenId(null)
  }

  function confirmReopen() {
    if (!reopenId) return
    reopenITIssue(reopenId, user.id)
    setReopenId(null)
    setRefresh((n) => n + 1)
  }

  function cancelReopen() {
    setReopenId(null)
  }

  function handleReply(issueId, text) {
    addITIssueComment(issueId, { byId: user.id, byName: user.name, byRole: 'employee' }, text)
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
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Wrench size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My IT Issues
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Report and track your IT support requests</p>
        </div>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Report IT Issue">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Report IT Issue</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowForm(false)} aria-label="Close"><X size={15} /></button>
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
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setEditId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              You can edit the issue details while it is still open and has not been assigned to IT staff yet.
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
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setOpenId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <ul className="lunch-policy-list first">
              <li>
                <span className="muted">Category</span>
                <strong>{itIssueCategoryLabel(openIssue.category)}</strong>
              </li>
              <li>
                <span className="muted">Priority</span>
                <strong>{getPriorityLabel(openIssue.priority)}</strong>
              </li>
              <li>
                <span className="muted">Status</span>
                <strong>{itIssueStatusLabel(itIssueDisplayStatus(openIssue))}</strong>
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
                  <span className="muted">Expected Response Time</span>
                  <strong>{openIssue.estimatedTime}</strong>
                </li>
              )}
            </ul>
            {openIssue.description && (
              <p className="hint"><strong>Description:</strong> {openIssue.description}</p>
            )}
            {openIssue.attachment && openIssue.attachment.dataUrl && (
              <div className="field">
                <span>Error screenshot</span>
                <img
                  src={openIssue.attachment.dataUrl}
                  alt={openIssue.attachment.name || 'Error screenshot'}
                  style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, border: '1px solid #d9def0' }}
                />
              </div>
            )}
            {canReopenITIssue(openIssue) && (
              <div className="button-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReopen(openIssue.id)}
                >
                  Re-Open issue
                </button>
              </div>
            )}
            <ITIssueThread
              issue={openIssue}
              viewerRole="employee"
              onReply={(text) => handleReply(openIssue.id, text)}
              onClose={() => setOpenId(null)}
            />
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
            { key: 'category', label: 'Category', value: table.filters.category || 'all', options: IT_CATEGORY_FILTER_OPTS },
            { key: 'priority', label: 'Priority', value: table.filters.priority || 'all', options: IT_PRIORITY_FILTER_OPTS },
            { key: 'status', label: 'Status', value: table.filters.status || 'all', options: IT_ISSUE_STATUS_FILTER_OPTS }
          ]}
          onFilterChange={table.setFilter}
          actions={
            <button
              className="btn btn-primary btn-tiny"
              onClick={openCreateForm}
            >
              {/* The icon follows the action: plus when it opens the form, cross when it closes it */}
              {showForm
                ? <X size={14} style={{ marginRight: 4 }} aria-hidden="true" />
                : <Plus size={14} style={{ marginRight: 4 }} aria-hidden="true" />}
              {showForm ? 'Close' : 'Report Issue'}
            </button>
          }
        />
        <table className="table table-compact" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '5%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Issue" keyName="issue" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Assigned To" keyName="assigned" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Expected Response Time" keyName="estimatedTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Reported On" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={8} message="No IT issues match your filters." />
            )}
            {issuesPage.map((issue) => {
              const assignedStaff = issue.assignedTo ? getITStaffById(issue.assignedTo) : null
              return (
                <tr key={issue.id}>
                  <td>
                    <strong>{issue.issue}</strong>
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
                    <span className={`tag ${itIssueStatusClass(itIssueDisplayStatus(issue))}`}>
                      {itIssueStatusLabel(itIssueDisplayStatus(issue))}
                    </span>
                  </td>
                  <td>
                    {assignedStaff ? (
                      <div>
                        <div>{assignedStaff.name}</div>
                        {assignedStaff.mobile
                          ? <a href={`tel:${assignedStaff.mobile}`} className="phone-link small">({assignedStaff.mobile})</a>
                          : null}
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
                       ><MoreVertical size={16} /></button>
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
                            <Eye size={14} aria-hidden="true" />
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
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={!canReopenITIssue(issue)}
                            onClick={() => {
                              handleReopen(issue.id)
                              closeMenu()
                            }}
                          >
                            <RefreshCw size={14} aria-hidden="true" />
                            Re-Open
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={!canWithdrawITIssue(issue)}
                            onClick={() => {
                              handleWithdraw(issue.id)
                            }}
                          >
                            <Undo2 size={14} aria-hidden="true" />
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

      {reopenId && (
        <Modal onClose={cancelReopen} title="Confirm Re-Open">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Re-Open</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelReopen} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              <strong>{reopenIssue?.issue}</strong> will go back to the IT team as an open request,
              and they will be told that you re-opened it because the problem is still there.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={confirmReopen}>
                Re-Open
              </button>
              <button type="button" className="btn btn-light" onClick={cancelReopen}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {withdrawId && (
        <Modal onClose={cancelWithdraw} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelWithdraw} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will cancel your IT issue permanently. You will not be able to restore it afterwards.
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
        Use this page to report computer or software issues. You can edit or withdraw your request
        while it is still open. Once IT staff are assigned, please contact them directly for any changes.
      </p>
    </div>
  )
}
