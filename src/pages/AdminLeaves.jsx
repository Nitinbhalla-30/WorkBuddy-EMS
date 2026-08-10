import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addLeaveMessage,
  getEmployeeById,
  getLeaves,
  setLeaveStatus
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  countLeaveDays,
  leaveTypeLabel,
  leaveSupportingDocuments,
  statusTagClass
} from '../utils/leaves.js'
import { leaveDecisionText, leaveStatusLabel } from '../utils/leaveReview.js'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import LeaveDocumentList from '../components/LeaveDocumentList.jsx'
import LeaveThread from '../components/LeaveThread.jsx'
import Modal from '../components/Modal.jsx'
import { useTableControls } from '../hooks/useTableControls.js'

// HR/Admin leave screen: review requests, ask questions, approve or reject.
export default function AdminLeaves() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState(() => getLeaves())
  const [filter, setFilter] = useState('pending')
  const [openId, setOpenId] = useState(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const tabFiltered = useMemo(() => {
    let list = [...leaves]
    if (filter !== 'all') list = list.filter((l) => l.status === filter)
    return list
  }, [leaves, filter])

  const table = useTableControls(tabFiltered, {
    getSearchText: (lv) => {
      const emp = getEmployeeById(lv.employeeId)
      return [
        emp?.name, emp?.department, leaveTypeLabel(lv.type),
        lv.fromDate, lv.toDate, lv.reason, lv.status
      ].join(' ')
    },
    getSortValue: (lv, key) => {
      if (key === 'employee') return getEmployeeById(lv.employeeId)?.name || lv.employeeId
      if (key === 'type') return leaveTypeLabel(lv.type)
      if (key === 'days') return countLeaveDays(lv.fromDate, lv.toDate)
      if (key === 'status') return lv.status
      return lv[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc'
  })

  const pendingCount = leaves.filter((l) => l.status === 'pending').length
  const openLeave = leaves.find((l) => l.id === openId) || null

  function nameOf(id) {
    return getEmployeeById(id)?.name || id
  }

  function refresh() {
    setLeaves(getLeaves())
  }

  function openReview(id) {
    setOpenId(id)
    setRejectMode(false)
    setRejectNote('')
  }

  function closeReview() {
    setOpenId(null)
    setRejectMode(false)
    setRejectNote('')
  }

  function handleApprove() {
    if (!openLeave) return
    setLeaveStatus(openLeave.id, 'approved', user.id, '')
    refresh()
    closeReview()
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
        <span className="muted">{table.count} shown</span>
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
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search leave requests..."
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="From" keyName="fromDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="To" keyName="toDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Days" keyName="days" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Supporting doc</th>
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={9} className="muted">No requests match your filters.</td></tr>
            )}
            {table.rows.map((lv) => {
              const emp = getEmployeeById(lv.employeeId)
              const decision = leaveDecisionText(lv, nameOf)
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
                    {lv.type === 'sick'
                      ? <LeaveDocumentList documents={leaveSupportingDocuments(lv)} emptyLabel="Not uploaded" />
                      : <span className="muted">--</span>}
                  </td>
                  <td>
                    <span className={`tag ${statusTagClass(lv.status)}`}>
                      {leaveStatusLabel(lv.status)}
                    </span>
                    {decision && (
                      <div className="muted small">{decision.line}</div>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-tiny btn-light"
                      onClick={() => openReview(lv.id)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
                  {leaveTypeLabel(openLeave.type)} · {formatDate(openLeave.fromDate)} – {formatDate(openLeave.toDate)}
                  {' · '}{countLeaveDays(openLeave.fromDate, openLeave.toDate)} day(s)
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(openLeave.status)}`}>
                  {leaveStatusLabel(openLeave.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={closeReview}>✕</button>
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

            {openLeave.status === 'pending' && (
              <>
                {rejectMode ? (
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
                        onClick={() => { setRejectMode(false); setRejectNote('') }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="button-row">
                    <button type="button" className="btn btn-primary" onClick={handleApprove}>
                      Approve
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => setRejectMode(true)}>
                      Reject
                    </button>
                    <button type="button" className="btn btn-light" onClick={closeReview}>
                      Close
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      <p className="hint">
        Open a request to ask questions, then approve or reject. Employees see who decided
        and any rejection reason on their My Leaves screen.
      </p>
    </div>
  )
}
