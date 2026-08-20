import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addLeaveMessage,
  getEmployeeById,
  getEmployees,
  getLeaves,
  setLeaveStatus
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  leaveDays,
  leaveHalfLabel,
  leaveStageLabel,
  leaveTypeLabel,
  leaveTypeLabelWithPart,
  leaveSupportingDocuments,
  statusTagClass
} from '../utils/leaves.js'
import { leaveDecisionText, leaveStatusLabel } from '../utils/leaveReview.js'
import { LEAVE_TYPES } from '../data/sampleData.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import LeaveDocumentList from '../components/LeaveDocumentList.jsx'
import LeaveThread from '../components/LeaveThread.jsx'
import Modal from '../components/Modal.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { CalendarDays, ClipboardCheck, CircleCheck, CircleX, MoreHorizontal, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]

const TYPE_FILTER_OPTS = [
  { value: 'all', label: 'All types' },
  ...LEAVE_TYPES.map((t) => ({ value: t.key, label: t.label }))
]

// HR/Admin leave screen: review requests, ask questions, approve or reject.
export default function AdminLeaves() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState(() => getLeaves())
  const [openId, setOpenId] = useState(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)

  const employees = useMemo(
    () => getEmployees().filter((e) => e.role === 'employee'),
    []
  )

  const employeeFilterOpts = useMemo(() => [
    { value: 'all', label: 'All employees' },
    ...employees
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((e) => ({ value: e.id, label: e.name }))
  ], [employees])

  const table = useTableControls(leaves, {
    getSearchText: (lv) => {
      const emp = getEmployeeById(lv.employeeId)
      return [
        emp?.name, emp?.department, leaveTypeLabelWithPart(lv),
        lv.fromDate, lv.toDate, lv.reason, leaveStatusLabel(lv.status)
      ].join(' ')
    },
    getSortValue: (lv, key) => {
      if (key === 'employee') return getEmployeeById(lv.employeeId)?.name || lv.employeeId
      if (key === 'type') return leaveTypeLabelWithPart(lv)
      if (key === 'days') return leaveDays(lv)
      if (key === 'doc') {
        if (lv.type !== 'sick') return ''
        const docs = leaveSupportingDocuments(lv)
        return docs.length ? docs.map((d) => d.name || '').join(', ') : 'Not uploaded'
      }
      if (key === 'status') return leaveStatusLabel(lv.status)
      return lv[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc',
    filterFns: {
      employeeId: (lv, val) => lv.employeeId === val,
      type: (lv, val) => lv.type === val,
      status: (lv, val) => lv.status === val
    }
  })

  const {
    items: leavesPage,
    page: leavesPageNum,
    totalPages: leavesTotalPages,
    total: leavesTotal,
    startIndex: leavesStart,
    endIndex: leavesEnd,
    setPage: setLeavesPage
  } = usePagination(table.rows, 10)

  const openLeave = leaves.find((l) => l.id === openId) || null

  function nameOf(id) {
    return getEmployeeById(id)?.name || id
  }

  function refresh() {
    setLeaves(getLeaves())
  }

  function toggleMenu(id) {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  function openReview(id, startReject = false) {
    setOpenId(id)
    setRejectMode(startReject)
    setRejectNote('')
    closeMenu()
  }

  function closeReview() {
    setOpenId(null)
    setRejectMode(false)
    setRejectNote('')
  }

  function handleApprove(id = openLeave?.id) {
    if (!id) return
    setLeaveStatus(id, 'approved', user.id, '')
    refresh()
    closeReview()
    closeMenu()
  }

  function handleReject() {
    if (!openLeave || !rejectNote.trim()) return
    setLeaveStatus(openLeave.id, 'rejected', user.id, rejectNote.trim())
    refresh()
    closeReview()
  }

  function handleReply(text) {
    if (!openLeave) return
    addLeaveMessage(openLeave.id, { byId: user.id, byRole: 'admin', text })
    refresh()
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

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <CalendarDays size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Leave Requests
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Review, approve, or reject employee leave requests</p>
        </div>
        <span className="muted">{table.count} shown</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          placeholder="Search leave requests..."
          filters={[
            {
              key: 'employeeId',
              label: 'Employee',
              value: table.filters.employeeId || 'all',
              options: employeeFilterOpts
            },
            {
              key: 'type',
              label: 'Type',
              value: table.filters.type || 'all',
              options: TYPE_FILTER_OPTS
            },
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: STATUS_FILTER_OPTS
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '6.5%' }} />
            <col style={{ width: '16.5%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '6%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="From" keyName="fromDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="To" keyName="toDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Days" keyName="days" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Supporting doc" keyName="doc" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leavesTotal === 0 && (
              <TableEmpty colSpan={9} message="No requests match your filters." />
            )}
            {leavesPage.map((lv) => {
              const emp = getEmployeeById(lv.employeeId)
              const docs = lv.type === 'sick' ? leaveSupportingDocuments(lv) : []
              const docNames = docs.map((d) => d.name).join(', ')
              return (
                <tr key={lv.id}>
                  <td>
                    <strong>{emp ? emp.name : lv.employeeId}</strong>
                    <div className="muted small">{emp ? emp.department : ''}</div>
                  </td>
                  <td>{leaveTypeLabelWithPart(lv)}</td>
                  <td>{formatDate(lv.fromDate)}</td>
                  <td>{formatDate(lv.toDate)}</td>
                  <td>{leaveDays(lv)}</td>
                  <td className="cell-ellipsis" title={lv.reason || undefined}>{lv.reason || <span className="muted">--</span>}</td>
                  <td className="cell-ellipsis" title={docNames || undefined}>
                    {lv.type === 'sick'
                      ? (docNames || <span className="muted">Not uploaded</span>)
                      : <span className="muted">--</span>}
                  </td>
                  <td>
                    <span className={`tag ${statusTagClass(lv.status)}`}>
                      {leaveStatusLabel(lv.status)}
                    </span>
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(lv.id)}
                        aria-label="Leave actions"
                       ><MoreHorizontal size={16} /></button>
                      {openMenuId === lv.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => openReview(lv.id, false)}
                          >
                            <ClipboardCheck size={14} aria-hidden="true" />
                            Review
                          </button>
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={lv.status !== 'pending'}
                            onClick={() => handleApprove(lv.id)}
                          >
                            <CircleCheck size={14} aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={lv.status !== 'pending'}
                            onClick={() => openReview(lv.id, true)}
                          >
                            <CircleX size={14} aria-hidden="true" />
                            Reject
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
          page={leavesPageNum}
          totalPages={leavesTotalPages}
          total={leavesTotal}
          startIndex={leavesStart}
          endIndex={leavesEnd}
          onPageChange={setLeavesPage}
        />
      </div>

      {openLeave && (
        <Modal onClose={closeReview} title="Review leave request">
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {nameOf(openLeave.employeeId)}
                </h3>
                <div className="muted small">
                  {leaveTypeLabel(openLeave.type)}
                  {leaveHalfLabel(openLeave) && ` · ${leaveHalfLabel(openLeave)}`}
                  {' · '}{openLeave.fromDate === openLeave.toDate
                    ? formatDate(openLeave.fromDate)
                    : `${formatDate(openLeave.fromDate)} – ${formatDate(openLeave.toDate)}`}
                  {' · '}{leaveDays(openLeave)} day(s)
                  {leaveStageLabel(openLeave) && ` · ${leaveStageLabel(openLeave)}`}
                  {openLeave.managerStatus === 'approved' && ' · Manager approved'}
                  {openLeave.managerStatus === 'escalated' && ' · Auto-escalated to HR'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(openLeave.status)}`}>
                  {leaveStatusLabel(openLeave.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={closeReview} aria-label="Close"><X size={15} /></button>
              </div>
            </div>

            {openLeave.reason && (
              <p className="hint first"><strong>Reason:</strong> {openLeave.reason}</p>
            )}

            {openLeave.type === 'sick' && (
              <div className="first">
                <div className="muted small" style={{ marginBottom: '6px' }}>Supporting document</div>
                <LeaveDocumentList documents={leaveSupportingDocuments(openLeave)} emptyLabel="Not uploaded" />
              </div>
            )}

            {(() => {
              const decision = leaveDecisionText(openLeave, nameOf)
              if (!decision) return null
              return (
                <div className="info-box">
                  <strong>{decision.line}</strong>
                  {decision.reason && (
                    <div style={{ marginTop: '6px' }}>Rejection reason: {decision.reason}</div>
                  )}
                </div>
              )
            })()}

            <LeaveThread
              leave={openLeave}
              viewerRole="admin"
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleReply}
              onClose={openLeave.status === 'pending' ? undefined : closeReview}
            />

            {openLeave.status === 'pending' && rejectMode && (
              <div className="first">
                <label className="field">
                  <span>Rejection reason (required)</span>
                  <textarea
                    className="reply-input"
                    rows={3}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Explain why this leave request is being rejected"
                  />
                </label>
                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={!rejectNote.trim()}
                    onClick={handleReject}
                  >
                    Confirm reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeReview}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      <p className="hint">
        Open a leave request to review it, ask questions, then approve or reject.
        The employee will see who made the decision and any rejection reason on their My Leaves page.
      </p>
    </div>
  )
}
