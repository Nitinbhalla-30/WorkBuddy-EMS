import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addAttendanceCorrectionMessage,
  getAttendanceCorrectionsForEmployee,
  getAttendanceForEmployee,
  getEmployeeById,
  getSettings,
  getTodayRecord,
  submitAttendanceCorrection,
  updateAttendanceCorrection,
  upsertRecord,
  withdrawAttendanceCorrection
} from '../data/store.js'
import { checkOfficeNetwork } from '../utils/network.js'
import {
  ATTENDANCE_STATS_PERIODS,
  computeAttendanceAverages,
  correctionIssueLabel,
  currentState,
  filterRecordsForStatsPeriod,
  formatClock,
  formatDate,
  formatMinutes,
  isLate,
  monthKey,
  monthLabel,
  resolveJoinDate,
  statsPeriodLabel,
  statusOf,
  totalBreakMinutes,
  workedMinutes
} from '../utils/attendance.js'
import { ATTENDANCE_CORRECTION_ISSUES } from '../data/sampleData.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import AttendanceCorrectionForm from '../components/AttendanceCorrectionForm.jsx'
import AttendanceCorrectionThread from '../components/AttendanceCorrectionThread.jsx'
import { formatTime12 } from '../utils/cab.js'
import { Briefcase, Clock, Coffee, Download, Eye, LogIn, LogOut, MoreHorizontal, Pencil, Trash2, Undo2, X } from 'lucide-react'
import { downloadExcelXlsx } from '../utils/exportExcel.js'
import TableEmpty from '../components/TableEmpty.jsx'

const TABS = ['Today', 'Attendance History', 'Correction Request']

// The employee's own screen: live buttons + their history.
export default function EmployeeDashboard() {
  const { user } = useAuth()
  const settings = getSettings()

  const [today, setToday] = useState(() => getTodayRecord(user.id))
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showLunchPolicy, setShowLunchPolicy] = useState(false)
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [editCorrectionId, setEditCorrectionId] = useState(null)
  const [openCorrectionId, setOpenCorrectionId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [withdrawCorrectionId, setWithdrawCorrectionId] = useState(null)
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(() => monthKey())
  const [statsPeriod, setStatsPeriod] = useState('this-month')
  const [tab, setTab] = useState(0)
  const [corrections, setCorrections] = useState(() =>
    getAttendanceCorrectionsForEmployee(user.id)
  )

  const [, forceTick] = useState(0)
  const state = currentState(today)
  const isLive = state === 'working' || state === 'on-break'

  // Refresh worked/break display every second while the day is active.
  useEffect(() => {
    if (!isLive) return undefined
    const t = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [isLive])

  const allRecords = useMemo(() => {
    const all = getAttendanceForEmployee(user.id)
    const withoutToday = all.filter((r) => r.date !== today.date)
    return [...withoutToday, today]
  }, [user.id, today, isLive])

  const joinDate = useMemo(
    () => resolveJoinDate(user, allRecords),
    [user, allRecords]
  )

  const periodStats = useMemo(() => {
    const filtered = filterRecordsForStatsPeriod(allRecords, statsPeriod, {
      joinDate,
      todayDate: today.date
    })
    return computeAttendanceAverages(filtered)
  }, [allRecords, statsPeriod, joinDate, today.date, isLive])

  const history = useMemo(() => {
    const all = getAttendanceForEmployee(user.id)
    return all.filter((r) => r.date.startsWith(selectedHistoryMonth))
  }, [user.id, selectedHistoryMonth, today])

  const historyMonthOptions = useMemo(() => {
    const keys = new Set(
      getAttendanceForEmployee(user.id).map((r) => r.date.slice(0, 7))
    )
    keys.add(monthKey())
    return [...keys]
      .sort((a, b) => b.localeCompare(a))
      .map((k) => ({ value: k, label: monthLabel(k) }))
  }, [user.id, today.date])

  const historyTable = useTableControls(history, {
    getSortValue: (r, key) => {
      if (key === 'worked') return workedMinutes(r)
      if (key === 'break') return totalBreakMinutes(r)
      if (key === 'status') return statusOf(r, settings.officeStartTime, settings.lateGraceMinutes)
      return r[key]
    },
    initialSortKey: 'date',
    initialSortDir: 'desc',
    filterFns: {
      status: (r, val) => statusOf(r, settings.officeStartTime, settings.lateGraceMinutes).toLowerCase() === val.toLowerCase()
    }
  })

  const {
    items: historyPage,
    page: historyPageNum,
    totalPages: historyTotalPages,
    total: historyTotal,
    startIndex: historyStart,
    endIndex: historyEnd,
    setPage: setHistoryPage
  } = usePagination(historyTable.rows)

  const ATTENDANCE_STATUS_FILTERS = [
    { value: 'all', label: 'All statuses' },
    { value: 'Present', label: 'Present' },
    { value: 'Late', label: 'Late' },
    { value: 'Absent', label: 'Absent' }
  ]

  const CORRECTION_ISSUE_FILTERS = [
    { value: 'all', label: 'All issues' },
    ...ATTENDANCE_CORRECTION_ISSUES.map((i) => ({ value: i.key, label: i.label }))
  ]
  const CORRECTION_STATUS_FILTERS = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ]

  const pendingCorrections = corrections.filter((c) => c.status === 'pending')

  const correctionsTable = useTableControls(corrections, {
    getSearchText: (c) =>
      [correctionIssueLabel(c.issueType), c.date, c.status, c.description || ''].join(' '),
    getSortValue: (c, key) => {
      if (key === 'issue') return correctionIssueLabel(c.issueType)
      if (key === 'approver') return c.decidedBy ? (getEmployeeById(c.decidedBy)?.name || c.decidedBy) : ''
      return c[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc',
    filterFns: {
      issue: (c, val) => c.issueType === val,
      status: (c, val) => c.status === val
    }
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

  function refreshCorrections() {
    setCorrections(getAttendanceCorrectionsForEmployee(user.id))
  }

  async function guard(action) {
    setBusy(true)
    setMessage('')
    const check = await checkOfficeNetwork()
    if (!check.allowed) {
      setMessage(`Blocked: ${check.reason}`)
      setBusy(false)
      return
    }
    action(check)
    setBusy(false)
  }

  function markTimeIn() {
    guard((check) => {
      const rec = { ...today, timeIn: new Date().toISOString() }
      upsertRecord(rec)
      setToday(rec)
      setMessage(`Timed in. ${check.reason}`)
    })
  }

  function startBreak() {
    guard(() => {
      const breaks = [...(today.breaks || []), { start: new Date().toISOString(), end: null }]
      const rec = { ...today, breaks }
      upsertRecord(rec)
      setToday(rec)
      setMessage('Break started.')
    })
  }

  function endBreak() {
    guard(() => {
      const breaks = (today.breaks || []).map((b) =>
        b.start && !b.end ? { ...b, end: new Date().toISOString() } : b
      )
      const rec = { ...today, breaks }
      upsertRecord(rec)
      setToday(rec)
      setMessage('Break ended.')
    })
  }

  function markTimeOut() {
    guard(() => {
      const breaks = (today.breaks || []).map((b) =>
        b.start && !b.end ? { ...b, end: new Date().toISOString() } : b
      )
      const rec = { ...today, breaks, timeOut: new Date().toISOString() }
      upsertRecord(rec)
      setToday(rec)
      setMessage('Timed out. Have a good day!')
    })
  }

  function handleCorrectionSubmit(data) {
    submitAttendanceCorrection({ employeeId: user.id, ...data })
    refreshCorrections()
    setShowCorrectionForm(false)
    setMessage('Your attendance correction request was sent to HR.')
  }

  function handleCorrectionEdit(data) {
    if (!editCorrectionId) return
    updateAttendanceCorrection(editCorrectionId, user.id, data)
    refreshCorrections()
    setEditCorrectionId(null)
    setMessage('Your correction request was updated.')
  }

  function handleCorrectionWithdraw(id) {
    setWithdrawCorrectionId(id)
  }

  function confirmCorrectionWithdraw() {
    if (withdrawCorrectionId) {
      withdrawAttendanceCorrection(withdrawCorrectionId, user.id)
      refreshCorrections()
      setOpenMenuId(null)
      if (openCorrectionId === withdrawCorrectionId) setOpenCorrectionId(null)
      if (editCorrectionId === withdrawCorrectionId) setEditCorrectionId(null)
      setWithdrawCorrectionId(null)
      setMessage('Your correction request was withdrawn.')
    }
  }

  function cancelCorrectionWithdraw() {
    setWithdrawCorrectionId(null)
  }

  function handleCorrectionReply(text) {
    if (!openCorrection) return
    addAttendanceCorrectionMessage(openCorrection.id, {
      byId: user.id,
      byRole: 'employee',
      text
    })
    refreshCorrections()
  }

  function nameOf(id) {
    if (!id) return ''
    if (id === user.id) return user.name
    return getEmployeeById(id)?.name || id
  }

  function correctionStatusLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  function correctionStatusClass(status) {
    if (status === 'approved') return 'tag-ok'
    if (status === 'rejected') return 'tag-late'
    if (status === 'withdrawn') return 'tag-absent'
    return 'tag-absent'
  }

  function toggleMenu(id) {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  const editCorrection = corrections.find((c) => c.id === editCorrectionId) || null
  const openCorrection = corrections.find((c) => c.id === openCorrectionId) || null

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
            <Clock size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Attendance
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Track your daily attendance, history, and correction requests</p>
        </div>
        <span className="muted">{formatDate(today.date)}</span>
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab ${i === tab ? 'tab-active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <div className="card">
            <div className="status-row">
              <div>
                <div className="muted">Right now</div>
                <div className={`state-pill state-${state}`}>
                  {state === 'not-in' && 'Not timed in'}
                  {state === 'working' && 'Working'}
                  {state === 'on-break' && 'On break'}
                  {state === 'done' && 'Timed out'}
                </div>
              </div>
              <div className="today-figures">
                <div>
                  <div className="muted">Time in</div>
                  <strong>{formatClock(today.timeIn)}</strong>
                </div>
                <div>
                  <div className="muted">Time out</div>
                  <strong>{formatClock(today.timeOut)}</strong>
                </div>
                <div>
                  <div className="muted">Worked{isLive ? ' (live)' : ''}</div>
                  <strong>{formatMinutes(workedMinutes(today))}</strong>
                </div>
                <div>
                  <div className="muted">Break{isLive ? ' (live)' : ''}</div>
                  <strong>{formatMinutes(totalBreakMinutes(today))}</strong>
                </div>
              </div>
            </div>

            <div className="button-row">
              <button
                className="btn btn-primary"
                disabled={busy || state !== 'not-in'}
                onClick={markTimeIn}
              >
                Time In
              </button>
              <button
                className="btn"
                disabled={busy || state !== 'working'}
                onClick={startBreak}
              >
                Start Break
              </button>
              <button
                className="btn"
                disabled={busy || state !== 'on-break'}
                onClick={endBreak}
              >
                End Break
              </button>
              <button
                className="btn btn-danger"
                disabled={busy || !(state === 'working' || state === 'on-break')}
                onClick={markTimeOut}
              >
                Time Out
              </button>
            </div>

            {message && <div className="info-box">{message}</div>}

            <p className="hint">
              Your worked hours and break times update automatically while you are clocked in.
              If you forgot to clock in or out, use <strong>Request correction</strong> to fix it.
              For lunch break rules, check the{' '}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => setShowLunchPolicy(true)}
              >
                company lunch policy
              </button>.
            </p>
          </div>

          <div className="section-head-row">
            <h3 className="section-title first">Average attendance</h3>
            <label className="field inline">
              <span className="muted small">Period</span>
              <select value={statsPeriod} onChange={(e) => setStatsPeriod(e.target.value)}>
                {ATTENDANCE_STATS_PERIODS.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="muted small stats-period-hint">
            {statsPeriodLabel(statsPeriod, joinDate)}
            {periodStats.days > 0
              ? ` · ${periodStats.days} day${periodStats.days === 1 ? '' : 's'} counted`
              : ' · no attendance days in this period'}
          </p>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-chip"><LogIn size={18} aria-hidden="true" /></span>
              <div className="stat-num">{periodStats.avgTimeIn}</div>
              <div className="stat-label">Avg time in</div>
            </div>
            <div className="stat-card">
              <span className="stat-chip"><LogOut size={18} aria-hidden="true" /></span>
              <div className="stat-num">{periodStats.avgTimeOut}</div>
              <div className="stat-label">Avg time out</div>
            </div>
            <div className="stat-card">
              <span className="stat-chip"><Coffee size={18} aria-hidden="true" /></span>
              <div className="stat-num">{periodStats.avgBreak}</div>
              <div className="stat-label">Avg break</div>
            </div>
            <div className="stat-card stat-good">
              <span className="stat-chip"><Briefcase size={18} aria-hidden="true" /></span>
              <div className="stat-num">{periodStats.avgWorked}</div>
              <div className="stat-label">Avg hours worked</div>
            </div>
          </div>
        </>
      )}

      {tab === 1 && (
        <>
          <div className="card">
        <TableToolbar
          showSearch={false}
          total={historyTotal}
          startIndex={historyStart}
          endIndex={historyEnd}
          filters={[
            {
              key: 'month',
              label: 'Month',
              value: selectedHistoryMonth,
              options: historyMonthOptions
            },
            {
              key: 'status',
              label: 'Status',
              value: historyTable.filters.status || 'all',
              options: ATTENDANCE_STATUS_FILTERS
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'month') setSelectedHistoryMonth(val)
            else historyTable.setFilter(key, val)
          }}
          actions={
            <button
              type="button"
              className="btn btn-primary btn-tiny"
              onClick={() => {
                const headers = ['Date', 'Time In', 'Time Out', 'Worked', 'Break', 'Status']
                const rows = historyTable.rows.map((r) => [
                  formatDate(r.date),
                  formatClock(r.timeIn),
                  formatClock(r.timeOut),
                  formatMinutes(workedMinutes(r)),
                  formatMinutes(totalBreakMinutes(r)),
                  statusOf(r, settings.officeStartTime, settings.lateGraceMinutes)
                ])
                downloadExcelXlsx(`attendance-history-${selectedHistoryMonth}`, headers, rows)
              }}
              disabled={historyTable.rows.length === 0}
            >
              <Download size={14} style={{ marginRight: 4 }} />Export to Excel
            </button>
          }
        />
        <table className="table table-cols-attendance">
          <colgroup>
            <col className="col-date" />
            <col className="col-time" />
            <col className="col-time" />
            <col className="col-narrow" />
            <col className="col-narrow" />
            <col className="col-status" />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Date" keyName="date" sortKey={historyTable.sortKey} sortDir={historyTable.sortDir} onSort={historyTable.toggleSort} />
              <SortableTh label="Time In" keyName="timeIn" sortKey={historyTable.sortKey} sortDir={historyTable.sortDir} onSort={historyTable.toggleSort} />
              <SortableTh label="Time Out" keyName="timeOut" sortKey={historyTable.sortKey} sortDir={historyTable.sortDir} onSort={historyTable.toggleSort} />
              <SortableTh label="Worked" keyName="worked" sortKey={historyTable.sortKey} sortDir={historyTable.sortDir} onSort={historyTable.toggleSort} />
              <SortableTh label="Break" keyName="break" sortKey={historyTable.sortKey} sortDir={historyTable.sortDir} onSort={historyTable.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={historyTable.sortKey} sortDir={historyTable.sortDir} onSort={historyTable.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {historyTable.count === 0 && (
              <TableEmpty colSpan="6" message={`No attendance records for ${monthLabel(selectedHistoryMonth)}.`} />
            )}
            {historyPage.map((r) => (
              <tr key={r.id}>
                <td>{formatDate(r.date)}</td>
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
            ))}
          </tbody>
        </table>
        <Pagination
          page={historyPageNum}
          totalPages={historyTotalPages}
          total={historyTotal}
          startIndex={historyStart}
          endIndex={historyEnd}
          onPageChange={setHistoryPage}
        />
      </div>
        </>
      )}

      {tab === 2 && (
        <>
          {pendingCorrections.length > 0 && (
            <div className="info-box">
              <strong>{pendingCorrections.length} correction request(s) awaiting HR review.</strong>
            </div>
          )}

          <div className="card">
            <TableToolbar
              search={correctionsTable.search}
              onSearchChange={correctionsTable.setSearch}
              total={correctionsTotal}
              startIndex={correctionsStart}
              endIndex={correctionsEnd}
              placeholder="Search corrections..."
              filters={[
                {
                  key: 'issue',
                  label: 'Issue',
                  value: correctionsTable.filters.issue || 'all',
                  options: CORRECTION_ISSUE_FILTERS
                },
                {
                  key: 'status',
                  label: 'Status',
                  value: correctionsTable.filters.status || 'all',
                  options: CORRECTION_STATUS_FILTERS
                }
              ]}
              onFilterChange={correctionsTable.setFilter}
              actions={
                <button
                  type="button"
                  className="btn btn-primary btn-tiny"
                  onClick={() => setShowCorrectionForm(true)}
                >
                  Request correction
                </button>
              }
            />
            <table className="table" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '27%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr>
                  <SortableTh label="Date" keyName="date" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
                  <SortableTh label="Issue" keyName="issue" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
                  <SortableTh label="Status" keyName="status" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
                  <SortableTh label="Approver" keyName="approver" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
                  <SortableTh label="Submitted" keyName="appliedOn" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {correctionsPage.length === 0 && (
                  <TableEmpty colSpan={6} message="No correction requests." />
                )}
                {correctionsPage.map((c) => (
                  <tr key={c.id}>
                    <td>{formatDate(c.date)}</td>
                    <td>{correctionIssueLabel(c.issueType)}</td>
                    <td>
                      <span className={`tag ${correctionStatusClass(c.status)}`}>
                        {correctionStatusLabel(c.status)}
                      </span>
                    </td>
                    <td>
                      {c.decidedBy
                        ? nameOf(c.decidedBy)
                        : <span className="muted">--</span>}
                    </td>
                    <td>{formatDate(c.appliedOn)}</td>
                    <td>
                      <div className="task-menu-container">
                        <button
                          type="button"
                          className="btn btn-tiny btn-light task-menu-button"
                          onClick={() => toggleMenu(c.id)}
                          aria-label="Correction actions"
                         ><MoreHorizontal size={16} /></button>
                        {openMenuId === c.id && (
                          <div className="task-menu-dropdown">
                            <button
                              type="button"
                              className="task-menu-item"
                              onClick={() => {
                                setOpenCorrectionId(c.id)
                                closeMenu()
                              }}
                            >
                              <Eye size={14} aria-hidden="true" />
                              Open
                            </button>
                            <button
                              type="button"
                              className="task-menu-item"
                              disabled={c.status !== 'pending'}
                              onClick={() => {
                                setEditCorrectionId(c.id)
                                closeMenu()
                              }}
                            >
                              <Pencil size={14} aria-hidden="true" />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="task-menu-item task-menu-item-danger"
                              disabled={c.status !== 'pending'}
                              onClick={() => handleCorrectionWithdraw(c.id)}
                            >
                              <Undo2 size={14} aria-hidden="true" />
                              Withdraw
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
        </>
      )}

      {showCorrectionForm && (
        <Modal onClose={() => setShowCorrectionForm(false)} title="Request attendance correction">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Request correction</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setShowCorrectionForm(false)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Describe what went wrong — for example, you forgot to clock in or the recorded time is incorrect.
              HR will review and fix your attendance record.
            </p>
            <AttendanceCorrectionForm
              defaultDate={today.date}
              onSubmit={handleCorrectionSubmit}
              onCancel={() => setShowCorrectionForm(false)}
            />
          </div>
        </Modal>
      )}

      {editCorrection && (
        <Modal onClose={() => setEditCorrectionId(null)} title="Edit correction request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit correction request</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setEditCorrectionId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              You can edit this request at any time while HR has not yet reviewed it.
            </p>
            <AttendanceCorrectionForm
              key={editCorrection.id}
              initial={editCorrection}
              submitLabel="Save changes"
              onSubmit={handleCorrectionEdit}
              onCancel={() => setEditCorrectionId(null)}
            />
          </div>
        </Modal>
      )}

      {openCorrection && (
        <Modal onClose={() => setOpenCorrectionId(null)} title="Correction request">
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {correctionIssueLabel(openCorrection.issueType)}
                </h3>
                <div className="muted small">
                  {formatDate(openCorrection.date)} · {correctionStatusLabel(openCorrection.status)}
                  {openCorrection.decidedBy && (
                    <> · Reviewed by {nameOf(openCorrection.decidedBy)}</>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setOpenCorrectionId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            {openCorrection.description && (
              <p className="hint first">{openCorrection.description}</p>
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
            <AttendanceCorrectionThread
              correction={openCorrection}
              viewerRole="employee"
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleCorrectionReply}
              onClose={() => setOpenCorrectionId(null)}
            />
          </div>
        </Modal>
      )}

      {withdrawCorrectionId && (
        <Modal onClose={cancelCorrectionWithdraw} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelCorrectionWithdraw} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will cancel your correction request permanently. You will not be able to restore it afterwards.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmCorrectionWithdraw}>
                Withdraw
              </button>
              <button type="button" className="btn btn-light" onClick={cancelCorrectionWithdraw}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showLunchPolicy && (
        <Modal onClose={() => setShowLunchPolicy(false)} title="Lunch policy">
          <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Lunch policy</h3>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={() => setShowLunchPolicy(false)}
                 aria-label="Close"><X size={15} /></button>
              </div>
              <ul className="lunch-policy-list">
                <li>
                  <span className="muted">Duration</span>
                  <strong>{settings.lunchPolicy.durationMinutes} minutes</strong>
                </li>
                <li>
                  <span className="muted">Where to have lunch</span>
                  <strong>{settings.lunchPolicy.place}</strong>
                </li>
                {settings.lunchPolicy.startTime && settings.lunchPolicy.endTime && (
                  <li>
                    <span className="muted">Allowed time</span>
                    <strong>
                      {formatTime12(settings.lunchPolicy.startTime)} – {formatTime12(settings.lunchPolicy.endTime)}
                    </strong>
                  </li>
                )}
              </ul>
              {settings.lunchPolicy.notes?.trim() && (
                <p className="hint">{settings.lunchPolicy.notes.trim()}</p>
              )}
              <div className="button-row">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowLunchPolicy(false)}
                >
                  Close
                </button>
              </div>
            </div>
        </Modal>
      )}

      <p className="hint">
        Clock in and out from the Today tab to track your attendance. Your worked hours and
        break times update automatically. If you forget to clock in or out, use Request
        correction to fix it. The History tab shows your past records.
      </p>
    </div>
  )
}
