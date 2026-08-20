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
  filterRecordsForStatsPeriod,
  formatClock,
  formatDate,
  formatMinutes,
  isLate,
  resolveJoinDate,
  statusOf,
  todayDateKey,
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
import { downloadExcelXlsx } from '../utils/exportExcel.js'
import { Clock, Download, MoreHorizontal, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const PERIOD_FILTER_OPTS = [
  { value: 'all', label: 'All period' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'ytd', label: 'Year to date' }
]

const CORRECTION_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]

// All attendance records with filters by employee, period, department, and manager.
export default function AttendanceRecords() {
  const { user } = useAuth()
  const settings = getSettings()
  const employees = getEmployees().filter((e) => e.role === 'employee')
  const today = todayDateKey()

  const [tab, setTab] = useState('all')
  const [corrections, setCorrections] = useState(() => getAttendanceCorrections())
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const employeeFilterOpts = useMemo(() => [
    { value: 'all', label: 'All employees' },
    ...employees.map((e) => ({ value: e.id, label: e.name }))
  ], [employees])

  const departmentFilterOpts = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))].sort()
    return [
      { value: 'all', label: 'All departments' },
      ...departments.map((d) => ({ value: d, label: d }))
    ]
  }, [employees])

  const reportsToFilterOpts = useMemo(() => {
    const managerIds = [...new Set(employees.map((e) => e.managerId).filter(Boolean))]
    const named = managerIds
      .map((id) => {
        const m = getEmployeeById(id)
        return m ? { value: id, label: m.name } : null
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label))
    return [
      { value: 'all', label: 'All managers' },
      { value: 'none', label: 'None' },
      ...named
    ]
  }, [employees])

  const allRecords = useMemo(() => getAttendance(), [])

  const joinDateByEmployee = useMemo(() => {
    const map = {}
    for (const emp of employees) {
      map[emp.id] = resolveJoinDate(
        emp,
        allRecords.filter((r) => r.employeeId === emp.id)
      )
    }
    return map
  }, [employees, allRecords])

  const table = useTableControls(allRecords, {
    getSearchText: (r) => {
      const emp = getEmployeeById(r.employeeId)
      const manager = emp?.managerId ? getEmployeeById(emp.managerId) : null
      return [
        r.date, emp?.name, emp?.department, manager?.name,
        formatClock(r.timeIn), formatClock(r.timeOut),
        statusOf(r, settings.officeStartTime, settings.lateGraceMinutes)
      ].join(' ')
    },
    getSortValue: (r, key) => {
      const emp = getEmployeeById(r.employeeId)
      if (key === 'employee') return emp?.name || r.employeeId
      if (key === 'department') return emp?.department || ''
      if (key === 'reportsTo') {
        return emp?.managerId ? (getEmployeeById(emp.managerId)?.name || '') : ''
      }
      if (key === 'worked') return workedMinutes(r)
      if (key === 'break') return totalBreakMinutes(r)
      if (key === 'status') return statusOf(r, settings.officeStartTime, settings.lateGraceMinutes)
      return r[key]
    },
    initialSortKey: 'date',
    initialSortDir: 'desc',
    filterFns: {
      employeeId: (r, val) => r.employeeId === val,
      period: (r, val) => filterRecordsForStatsPeriod([r], val, {
        joinDate: joinDateByEmployee[r.employeeId] || today,
        todayDate: today
      }).length > 0,
      department: (r, val) => getEmployeeById(r.employeeId)?.department === val,
      reportsTo: (r, val) => {
        const managerId = getEmployeeById(r.employeeId)?.managerId
        if (val === 'none') return !managerId
        return managerId === val
      }
    },
    initialFilters: { period: 'all' }
  })

  const correctionsTable = useTableControls(corrections, {
    getSearchText: (c) => {
      const emp = getEmployeeById(c.employeeId)
      return [
        emp?.name, c.date, correctionIssueLabel(c.issueType),
        c.description, statusLabel(c.status)
      ].join(' ')
    },
    getSortValue: (c, key) => {
      if (key === 'employee') return getEmployeeById(c.employeeId)?.name || c.employeeId
      if (key === 'issue') return correctionIssueLabel(c.issueType)
      if (key === 'details') return c.description || ''
      if (key === 'suggested') return `${c.suggestedTimeIn || ''} ${c.suggestedTimeOut || ''}`.trim()
      return c[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc',
    filterFns: {
      employeeId: (c, val) => c.employeeId === val,
      period: (c, val) => filterRecordsForStatsPeriod([{ date: c.date }], val, {
        joinDate: today,
        todayDate: today
      }).length > 0,
      status: (c, val) => c.status === val
    },
    initialFilters: { employeeId: 'all', period: 'all', status: 'all' }
  })
  const {
    items: correctionsPage,
    page: correctionsPageNum,
    totalPages: correctionsTotalPages,
    total: correctionsTotal,
    startIndex: correctionsStart,
    endIndex: correctionsEnd,
    setPage: setCorrectionsPage
  } = usePagination(correctionsTable.rows, 10)

  const {
    items: recordsPage,
    page: recordsPageNum,
    totalPages: recordsTotalPages,
    total: recordsTotal,
    startIndex: recordsStart,
    endIndex: recordsEnd,
    setPage: setRecordsPage
  } = usePagination(table.rows, 10)

  const openCorrection = corrections.find((c) => c.id === openId) || null
  const pendingCorrectionCount = corrections.filter((c) => c.status === 'pending').length

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

  function exportAttendanceExcel() {
    const headers = [
      'Date',
      'Employee',
      'Department',
      'Reports to',
      'Time In',
      'Time Out',
      'Worked',
      'Break',
      'Status'
    ]
    const rows = table.rows.map((r) => {
      const emp = getEmployeeById(r.employeeId)
      const manager = emp?.managerId ? getEmployeeById(emp.managerId) : null
      return [
        r.date,
        emp?.name || r.employeeId,
        emp?.department || '',
        manager?.name || 'None',
        formatClock(r.timeIn),
        formatClock(r.timeOut),
        formatMinutes(workedMinutes(r)),
        formatMinutes(totalBreakMinutes(r)),
        statusOf(r, settings.officeStartTime, settings.lateGraceMinutes)
      ]
    })
    downloadExcelXlsx(`attendance-records-${today}`, headers, rows)
  }

  const hasActiveFilters =
    (table.filters.employeeId && table.filters.employeeId !== 'all') ||
    (table.filters.department && table.filters.department !== 'all') ||
    (table.filters.period && table.filters.period !== 'all')

  const hasActiveCorrectionFilters =
    (correctionsTable.filters.employeeId && correctionsTable.filters.employeeId !== 'all') ||
    (correctionsTable.filters.period && correctionsTable.filters.period !== 'all') ||
    (correctionsTable.filters.status && correctionsTable.filters.status !== 'all')

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Clock size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Attendance Records
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Track daily attendance and manage correction requests</p>
        </div>
        <span className="muted">{tab === 'all' ? `${table.count} records` : `${corrections.length} requests`}</span>
      </div>

      <div className="tabs">
        <button type="button" className={`tab ${tab === 'all' ? 'tab-active' : ''}`} onClick={() => setTab('all')}>
          All records
        </button>
        <button type="button" className={`tab ${tab === 'corrections' ? 'tab-active' : ''}`} onClick={() => setTab('corrections')}>
          Correction requests{pendingCorrectionCount > 0 ? ` (${pendingCorrectionCount})` : ''}
        </button>
      </div>

      {tab === 'all' && (
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          placeholder="Search records..."
          filters={[
            {
              key: 'employeeId',
              label: 'Employee',
              value: table.filters.employeeId || 'all',
              options: employeeFilterOpts
            },
            {
              key: 'period',
              label: 'Period',
              value: table.filters.period || 'all',
              options: PERIOD_FILTER_OPTS
            },
            {
              key: 'department',
              label: 'Department',
              value: table.filters.department || 'all',
              options: departmentFilterOpts
            }
          ]}
          onFilterChange={table.setFilter}
          actions={
            <button
              type="button"
              className="btn btn-primary btn-tiny"
              onClick={exportAttendanceExcel}
              disabled={table.rows.length === 0}
            >
              <Download size={14} style={{ marginRight: 4 }} />Export to Excel
            </button>
          }
        >
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-light btn-tiny table-toolbar-action"
              onClick={() => {
                table.setFilter('employeeId', 'all')
                table.setFilter('period', 'all')
                table.setFilter('department', 'all')
              }}
            >
              Clear filters
            </button>
          )}
        </TableToolbar>
        <table className="table">
          <colgroup>
            <col style={{ width: '14%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Date" keyName="date" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Department" keyName="department" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reports to" keyName="reportsTo" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time In" keyName="timeIn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time Out" keyName="timeOut" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Worked" keyName="worked" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Break" keyName="break" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {recordsTotal === 0 && (
              <TableEmpty colSpan="9" message="No records match your filters." />
            )}
            {recordsPage.map((r) => {
              const emp = getEmployeeById(r.employeeId)
              const manager = emp?.managerId ? getEmployeeById(emp.managerId) : null
              return (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{emp ? emp.name : r.employeeId}</td>
                  <td>{emp?.department || <span className="muted">--</span>}</td>
                  <td>{manager?.name || <span className="muted">None</span>}</td>
                  <td>{formatClock(r.timeIn)}</td>
                  <td>{formatClock(r.timeOut)}</td>
                  <td>{formatMinutes(workedMinutes(r))}</td>
                  <td>{formatMinutes(totalBreakMinutes(r))}</td>
                  <td>
                    <span className={`tag ${isLate(r, settings.officeStartTime, settings.lateGraceMinutes) ? 'tag-late' : 'tag-ok'}`}>
                      {statusOf(r, settings.officeStartTime, settings.lateGraceMinutes)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination
          page={recordsPageNum}
          totalPages={recordsTotalPages}
          total={recordsTotal}
          startIndex={recordsStart}
          endIndex={recordsEnd}
          onPageChange={setRecordsPage}
        />
      </div>
      )}

      {tab === 'corrections' && (
      <div className="card">
        <TableToolbar
          search={correctionsTable.search}
          onSearchChange={correctionsTable.setSearch}
          placeholder="Search correction requests..."
          filters={[
            {
              key: 'employeeId',
              label: 'Employee',
              value: correctionsTable.filters.employeeId || 'all',
              options: employeeFilterOpts
            },
            {
              key: 'period',
              label: 'Period',
              value: correctionsTable.filters.period || 'all',
              options: PERIOD_FILTER_OPTS
            },
            {
              key: 'status',
              label: 'Status',
              value: correctionsTable.filters.status || 'all',
              options: CORRECTION_STATUS_FILTER_OPTS
            }
          ]}
          onFilterChange={correctionsTable.setFilter}
        >
          {hasActiveCorrectionFilters && (
            <button
              type="button"
              className="btn btn-light btn-tiny table-toolbar-action"
              onClick={() => {
                correctionsTable.setFilter('employeeId', 'all')
                correctionsTable.setFilter('period', 'all')
                correctionsTable.setFilter('status', 'all')
              }}
            >
              Clear filters
            </button>
          )}
        </TableToolbar>
        <table className="table table-corrections" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '21.5%' }} />
            <col style={{ width: '13.5%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '7%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Date" keyName="date" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Issue" keyName="issue" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Details" keyName="details" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Suggested" keyName="suggested" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {correctionsTotal === 0 && (
              <TableEmpty colSpan={7} message="No correction requests match your filters." />
            )}
            {correctionsPage.map((c) => {
              const emp = getEmployeeById(c.employeeId)
              return (
                <tr key={c.id}>
                  <td>{emp?.name || c.employeeId}</td>
                  <td>{formatDate(c.date)}</td>
                  <td>{correctionIssueLabel(c.issueType)}</td>
                  <td className="cell-ellipsis" title={c.description || undefined}>{c.description || <span className="muted">--</span>}</td>
                  <td className="small">
                    {c.suggestedTimeIn && c.suggestedTimeOut && `In: ${c.suggestedTimeIn} · Out: ${c.suggestedTimeOut}`}
                    {c.suggestedTimeIn && !c.suggestedTimeOut && `In: ${c.suggestedTimeIn}`}
                    {!c.suggestedTimeIn && c.suggestedTimeOut && `Out: ${c.suggestedTimeOut}`}
                    {!c.suggestedTimeIn && !c.suggestedTimeOut && <span className="muted">--</span>}
                  </td>
                  <td>
                    <span className={`tag ${statusClass(c.status)}`}>
                      {statusLabel(c.status)}
                    </span>
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button corrections-menu-button"
                        onClick={() => toggleMenu(c.id)}
                        aria-label="Correction actions"
                       ><MoreHorizontal size={16} /></button>
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
      )}

      <p className="hint">
        The All records tab shows daily clock-in and clock-out times for every employee.
        Use Correction requests to review and resolve attendance mismatches — employees submit
        these when they forget to clock in or out, or when the recorded time is incorrect.
      </p>

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
                <button type="button" className="btn btn-tiny btn-light" onClick={closeReview} aria-label="Close"><X size={15} /></button>
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
    </div>
  )
}
