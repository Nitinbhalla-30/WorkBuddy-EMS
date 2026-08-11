import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addAttendanceCorrectionMessage,
  getAttendance,
  getAttendanceCorrections,
  getEmployeeById,
  getEmployees,
  getSettings,
  resolveAttendanceCorrection
} from '../data/store.js'
import {
  correctionIssueLabel,
  formatClock,
  formatDate,
  formatMinutes,
  isLate,
  statusOf,
  totalBreakMinutes,
  workedMinutes
} from '../utils/attendance.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import AttendanceCorrectionThread from '../components/AttendanceCorrectionThread.jsx'

// All attendance records with simple filters by employee and date.
export default function AttendanceRecords() {
  const { user } = useAuth()
  const settings = getSettings()
  const employees = getEmployees().filter((e) => e.role === 'employee')

  const [corrections, setCorrections] = useState(() => getAttendanceCorrections())
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const employeeFilterOpts = useMemo(() => [
    { value: 'all', label: 'All employees' },
    ...employees.map((e) => ({ value: e.id, label: e.name }))
  ], [employees])

  const allRecords = useMemo(() => getAttendance(), [])

  const table = useTableControls(allRecords, {
    getSearchText: (r) => {
      const emp = getEmployeeById(r.employeeId)
      return [
        r.date, emp?.name, emp?.department,
        formatClock(r.timeIn), formatClock(r.timeOut),
        statusOf(r, settings.officeStartTime)
      ].join(' ')
    },
    getSortValue: (r, key) => {
      if (key === 'employee') return getEmployeeById(r.employeeId)?.name || r.employeeId
      if (key === 'worked') return workedMinutes(r)
      if (key === 'break') return totalBreakMinutes(r)
      if (key === 'status') return statusOf(r, settings.officeStartTime)
      return r[key]
    },
    initialSortKey: 'date',
    initialSortDir: 'desc',
    filterFns: {
      employeeId: (r, val) => r.employeeId === val,
      date: (r, val) => r.date === val
    }
  })

  const pendingCount = corrections.filter((c) => c.status === 'pending').length

  const correctionsTable = useTableControls(corrections, {
    getSortValue: (c, key) => {
      if (key === 'employee') return getEmployeeById(c.employeeId)?.name || c.employeeId
      if (key === 'issue') return correctionIssueLabel(c.issueType)
      return c[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc'
  })
  const {
    items: correctionsPage,
    page: correctionsPageNum,
    totalPages: correctionsTotalPages,
    total: correctionsTotal,
    startIndex: correctionsStart,
    endIndex: correctionsEnd,
    setPage: setCorrectionsPage
  } = usePagination(correctionsTable.rows)

  const openCorrection = corrections.find((c) => c.id === openId) || null

  function nameOf(id) {
    if (!id) return ''
    if (id === user.id) return user.name
    return getEmployeeById(id)?.name || id
  }

  function refreshCorrections() {
    setCorrections(getAttendanceCorrections())
  }

  function openReview(id, startReject = false) {
    setOpenId(id)
    setRejectMode(startReject)
    setRejectNote('')
    setOpenMenuId(null)
  }

  function closeReview() {
    setOpenId(null)
    setRejectMode(false)
    setRejectNote('')
  }

  function approveCorrection(id) {
    resolveAttendanceCorrection(id, 'approved', user.id, 'Attendance updated as requested.')
    refreshCorrections()
    closeReview()
  }

  function rejectCorrection(id) {
    if (!rejectNote.trim()) return
    resolveAttendanceCorrection(id, 'rejected', user.id, rejectNote.trim())
    refreshCorrections()
    closeReview()
  }

  function handleReply(text) {
    if (!openCorrection) return
    addAttendanceCorrectionMessage(openCorrection.id, {
      byId: user.id,
      byRole: 'admin',
      text
    })
    refreshCorrections()
  }

  function toggleMenu(id) {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  function statusLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  function statusClass(status) {
    if (status === 'approved') return 'tag-ok'
    if (status === 'rejected') return 'tag-late'
    if (status === 'withdrawn') return 'tag-absent'
    return 'tag-absent'
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

  const hasDateFilter = table.filters.date && table.filters.date !== 'all'

  return (
    <div>
      <div className="page-head">
        <h2>Attendance Records</h2>
        <span className="muted">{table.count} records</span>
      </div>

      <h3 className="section-title first">
        Correction requests
        {pendingCount > 0 && (
          <span className="muted small"> · {pendingCount} pending</span>
        )}
      </h3>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Date" keyName="date" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Issue" keyName="issue" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <th>Details</th>
              <th>Suggested</th>
              <SortableTh label="Status" keyName="status" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {correctionsTotal === 0 && (
              <tr>
                <td colSpan={7} className="muted">No correction requests yet.</td>
              </tr>
            )}
            {correctionsPage.map((c) => {
              const emp = getEmployeeById(c.employeeId)
              return (
                <tr key={c.id}>
                  <td>{emp?.name || c.employeeId}</td>
                  <td>{formatDate(c.date)}</td>
                  <td>{correctionIssueLabel(c.issueType)}</td>
                  <td>{c.description || <span className="muted">--</span>}</td>
                  <td className="small">
                    {c.suggestedTimeIn && <>In: {c.suggestedTimeIn}<br /></>}
                    {c.suggestedTimeOut && <>Out: {c.suggestedTimeOut}</>}
                    {!c.suggestedTimeIn && !c.suggestedTimeOut && <span className="muted">--</span>}
                  </td>
                  <td>
                    <span className={`tag ${statusClass(c.status)}`}>
                      {statusLabel(c.status)}
                    </span>
                    {c.decidedBy && (
                      <div className="muted small">By {nameOf(c.decidedBy)}</div>
                    )}
                    {c.status === 'rejected' && c.reviewNote && (
                      <div className="muted small">Reason: {c.reviewNote}</div>
                    )}
                    {(c.messages || []).length > 0 && (
                      <div className="muted small">
                        {(c.messages || []).length} message(s)
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(c.id)}
                        aria-label="Correction actions"
                      >
                        ⋯
                      </button>
                      {openMenuId === c.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => openReview(c.id, false)}
                          >
                            {c.status === 'pending' ? 'Ask question' : 'View thread'}
                          </button>
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={c.status !== 'pending'}
                            onClick={() => {
                              approveCorrection(c.id)
                              closeMenu()
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={c.status !== 'pending'}
                            onClick={() => openReview(c.id, true)}
                          >
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
          page={correctionsPageNum}
          totalPages={correctionsTotalPages}
          total={correctionsTotal}
          startIndex={correctionsStart}
          endIndex={correctionsEnd}
          onPageChange={setCorrectionsPage}
        />
      </div>

      {openCorrection && (
        <Modal onClose={closeReview} title="Review correction request">
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {nameOf(openCorrection.employeeId)}
                </h3>
                <div className="muted small">
                  {correctionIssueLabel(openCorrection.issueType)} · {formatDate(openCorrection.date)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusClass(openCorrection.status)}`}>
                  {statusLabel(openCorrection.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={closeReview}>
                  ✕
                </button>
              </div>
            </div>

            {openCorrection.description && (
              <p className="hint first"><strong>Details:</strong> {openCorrection.description}</p>
            )}
            {(openCorrection.suggestedTimeIn || openCorrection.suggestedTimeOut) && (
              <p className="muted small">
                Suggested
                {openCorrection.suggestedTimeIn && <> in: {openCorrection.suggestedTimeIn}</>}
                {openCorrection.suggestedTimeOut && <> out: {openCorrection.suggestedTimeOut}</>}
              </p>
            )}

            {openCorrection.status === 'rejected' && openCorrection.reviewNote && (
              <div className="info-box">Reason: {openCorrection.reviewNote}</div>
            )}

            {openCorrection.status === 'pending' && !rejectMode && (
              <div className="button-row first">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => approveCorrection(openCorrection.id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setRejectMode(true)}
                >
                  Reject
                </button>
              </div>
            )}

            {openCorrection.status === 'pending' && rejectMode && (
              <div className="first">
                <label className="field">
                  <span>Reason for employee</span>
                  <textarea
                    className="reply-input"
                    rows={2}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Explain why this correction cannot be applied"
                  />
                </label>
                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={!rejectNote.trim()}
                    onClick={() => rejectCorrection(openCorrection.id)}
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
            )}

            <AttendanceCorrectionThread
              correction={openCorrection}
              viewerRole="admin"
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleReply}
              onClose={closeReview}
            />
          </div>
        </Modal>
      )}

      <h3 className="section-title">All records</h3>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search records..."
          filters={[{
            key: 'employeeId',
            label: 'Employee',
            value: table.filters.employeeId || 'all',
            options: employeeFilterOpts
          }]}
          onFilterChange={table.setFilter}
        >
          <label className="table-toolbar-field table-toolbar-filter">
            <span className="table-toolbar-label">Date</span>
            <input
              type="date"
              value={hasDateFilter ? table.filters.date : ''}
              onChange={(e) => table.setFilter('date', e.target.value || 'all')}
            />
          </label>
          {(table.filters.employeeId && table.filters.employeeId !== 'all' || hasDateFilter) && (
            <button
              type="button"
              className="btn btn-light btn-tiny table-toolbar-action"
              onClick={() => {
                table.setFilter('employeeId', 'all')
                table.setFilter('date', 'all')
              }}
            >
              Clear filters
            </button>
          )}
        </TableToolbar>
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Date" keyName="date" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time In" keyName="timeIn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time Out" keyName="timeOut" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Worked" keyName="worked" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Break" keyName="break" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan="7" className="muted">No records match your filters.</td></tr>
            )}
            {table.rows.map((r) => {
              const emp = getEmployeeById(r.employeeId)
              return (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{emp ? emp.name : r.employeeId}</td>
                  <td>{formatClock(r.timeIn)}</td>
                  <td>{formatClock(r.timeOut)}</td>
                  <td>{formatMinutes(workedMinutes(r))}</td>
                  <td>{formatMinutes(totalBreakMinutes(r))}</td>
                  <td>
                    <span className={`tag ${isLate(r, settings.officeStartTime) ? 'tag-late' : 'tag-ok'}`}>
                      {statusOf(r, settings.officeStartTime)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
