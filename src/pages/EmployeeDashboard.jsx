import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAttendanceCorrectionsForEmployee,
  getAttendanceForEmployee,
  getSettings,
  getTodayRecord,
  submitAttendanceCorrection,
  upsertRecord
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
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import AttendanceCorrectionForm from '../components/AttendanceCorrectionForm.jsx'
import { formatTime12 } from '../utils/cab.js'

// The employee's own screen: live buttons + their history.
export default function EmployeeDashboard() {
  const { user } = useAuth()
  const settings = getSettings()

  const [today, setToday] = useState(() => getTodayRecord(user.id))
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showLunchPolicy, setShowLunchPolicy] = useState(false)
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(() => monthKey())
  const [statsPeriod, setStatsPeriod] = useState('this-month')
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
      if (key === 'status') return statusOf(r, settings.officeStartTime)
      return r[key]
    },
    initialSortKey: 'date',
    initialSortDir: 'desc',
    filterFns: {
      status: (r, val) => statusOf(r, settings.officeStartTime).toLowerCase() === val.toLowerCase()
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

  const pendingCorrections = corrections.filter((c) => c.status === 'pending')

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

  return (
    <div>
      <div className="page-head">
        <h2>My Attendance</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="muted">{formatDate(today.date)}</span>
          <button
            type="button"
            className="btn btn-primary btn-tiny"
            onClick={() => setShowCorrectionForm(true)}
          >
            Request correction
          </button>
          <button
            type="button"
            className="btn btn-primary btn-tiny"
            onClick={() => setShowLunchPolicy(true)}
          >
            Lunch policy
          </button>
        </div>
      </div>

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
          Worked and break times update in real time while you are timed in.
          Use <strong>Request correction</strong> if you forgot to time in or out.
          Before a lunch break, see the{' '}
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
          <div className="stat-num">{periodStats.avgTimeIn}</div>
          <div className="stat-label">Avg time in</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{periodStats.avgTimeOut}</div>
          <div className="stat-label">Avg time out</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{periodStats.avgBreak}</div>
          <div className="stat-label">Avg break</div>
        </div>
        <div className="stat-card stat-good">
          <div className="stat-num">{periodStats.avgWorked}</div>
          <div className="stat-label">Avg hours worked</div>
        </div>
      </div>

      {pendingCorrections.length > 0 && (
        <div className="info-box">
          <strong>{pendingCorrections.length} correction request(s) awaiting HR review.</strong>
        </div>
      )}

      {corrections.length > 0 && (
        <>
          <h3 className="section-title">My correction requests</h3>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {corrections.slice(0, 5).map((c) => (
                  <tr key={c.id}>
                    <td>{formatDate(c.date)}</td>
                    <td>{correctionIssueLabel(c.issueType)}</td>
                    <td>
                      <span className={`tag ${c.status === 'approved' ? 'tag-ok' : c.status === 'rejected' ? 'tag-late' : 'tag-absent'}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                      {c.reviewNote && (
                        <div className="muted small">{c.reviewNote}</div>
                      )}
                    </td>
                    <td>{formatDate(c.appliedOn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              >
                ✕
              </button>
            </div>
            <p className="hint first">
              Tell HR if you forgot to time in or out, or if your attendance record looks wrong.
            </p>
            <AttendanceCorrectionForm
              defaultDate={today.date}
              onSubmit={handleCorrectionSubmit}
              onCancel={() => setShowCorrectionForm(false)}
            />
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
                >
                  ✕
                </button>
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

      <h3 className="section-title">Attendance history</h3>
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
              <tr><td colSpan="6" className="muted">No attendance records for {monthLabel(selectedHistoryMonth)}.</td></tr>
            )}
            {historyPage.map((r) => (
              <tr key={r.id}>
                <td>{formatDate(r.date)}</td>
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
    </div>
  )
}
