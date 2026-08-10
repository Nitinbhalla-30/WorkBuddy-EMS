import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAttendanceForEmployee,
  getSettings,
  getTodayRecord,
  upsertRecord
} from '../data/store.js'
import { checkOfficeNetwork } from '../utils/network.js'
import {
  currentState,
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
import { formatTime12 } from '../utils/cab.js'

// The employee's own screen: live buttons + their history.
export default function EmployeeDashboard() {
  const { user } = useAuth()
  const settings = getSettings()

  const [today, setToday] = useState(() => getTodayRecord(user.id))
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showLunchPolicy, setShowLunchPolicy] = useState(false)

  // Refresh worked-time display every minute while working.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const state = currentState(today)
  const history = useMemo(
    () => getAttendanceForEmployee(user.id).filter((r) => r.date !== today.date),
    [user.id, today]
  )
  const historyTable = useTableControls(history, {
    getSearchText: (r) =>
      [r.date, formatClock(r.timeIn), formatClock(r.timeOut), statusOf(r, settings.officeStartTime)].join(' '),
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

  // Every marking first runs the office-internet check.
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
      // Close any open break first.
      const breaks = (today.breaks || []).map((b) =>
        b.start && !b.end ? { ...b, end: new Date().toISOString() } : b
      )
      const rec = { ...today, breaks, timeOut: new Date().toISOString() }
      upsertRecord(rec)
      setToday(rec)
      setMessage('Timed out. Have a good day!')
    })
  }

  return (
    <div>
      <div className="page-head">
        <h2>My Attendance</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="muted">{formatDate(today.date)}</span>
          <button
            type="button"
            className="btn btn-primary btn-tiny"
            onClick={() => setShowLunchPolicy(true)}
          >
            Lunch policy
          </button>
        </div>
      </div>

      {/* Live status card with the buttons */}
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
              <div className="muted">Worked</div>
              <strong>{formatMinutes(workedMinutes(today))}</strong>
            </div>
            <div>
              <div className="muted">Break</div>
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
          Every button first checks that you are on the office internet.
          In the real office (and later in the phone app) this also uses your
          fingerprint. Test mode can be turned off by HR/Admin in Settings.
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

      {/* Past days */}
      <h3 className="section-title">Recent days</h3>
      <div className="card">
        <TableToolbar
          search={historyTable.search}
          onSearchChange={historyTable.setSearch}
          showing={historyTable.count}
          total={historyTable.total}
          placeholder="Search attendance..."
          filters={[{
            key: 'status',
            label: 'Status',
            value: historyTable.filters.status || 'all',
            options: ATTENDANCE_STATUS_FILTERS
          }]}
          onFilterChange={historyTable.setFilter}
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
              <tr><td colSpan="6" className="muted">No records match your filters.</td></tr>
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
