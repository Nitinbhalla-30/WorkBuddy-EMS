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

// The employee's own screen: live buttons + their history.
export default function EmployeeDashboard() {
  const { user } = useAuth()
  const settings = getSettings()

  const [today, setToday] = useState(() => getTodayRecord(user.id))
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

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
        <span className="muted">{formatDate(today.date)}</span>
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
        </p>
      </div>

      {/* Past days */}
      <h3 className="section-title">Recent days</h3>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Worked</th>
              <th>Break</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr><td colSpan="6" className="muted">No earlier records.</td></tr>
            )}
            {history.map((r) => (
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
      </div>
    </div>
  )
}
