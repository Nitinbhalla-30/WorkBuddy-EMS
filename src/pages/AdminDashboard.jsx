import { useMemo } from 'react'
import {
  getAttendance,
  getEmployees,
  getSettings
} from '../data/store.js'
import {
  formatClock,
  formatMinutes,
  isLate,
  statusOf,
  totalBreakMinutes,
  workedMinutes
} from '../utils/attendance.js'

function todayKey() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// HR/Admin home: today's numbers + a per-employee list for today.
export default function AdminDashboard() {
  const settings = getSettings()
  const employees = useMemo(
    () => getEmployees().filter((e) => e.role === 'employee'),
    []
  )
  const attendance = getAttendance()
  const today = todayKey()

  const rows = employees.map((emp) => {
    const rec = attendance.find(
      (r) => r.employeeId === emp.id && r.date === today
    ) || null
    return { emp, rec }
  })

  const present = rows.filter((r) => r.rec && r.rec.timeIn).length
  const late = rows.filter(
    (r) => r.rec && isLate(r.rec, settings.officeStartTime)
  ).length
  const absent = employees.length - present

  return (
    <div>
      <div className="page-head">
        <h2>Dashboard</h2>
        <span className="muted">Today</span>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{employees.length}</div>
          <div className="stat-label">Employees</div>
        </div>
        <div className="stat-card stat-good">
          <div className="stat-num">{present}</div>
          <div className="stat-label">Present today</div>
        </div>
        <div className="stat-card stat-warn">
          <div className="stat-num">{late}</div>
          <div className="stat-label">Late today</div>
        </div>
        <div className="stat-card stat-bad">
          <div className="stat-num">{absent}</div>
          <div className="stat-label">Not in yet</div>
        </div>
      </div>

      <h3 className="section-title">Today by employee</h3>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Worked</th>
              <th>Break</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ emp, rec }) => (
              <tr key={emp.id}>
                <td>
                  <strong>{emp.name}</strong>
                  <div className="muted small">{emp.id}</div>
                </td>
                <td>{emp.department}</td>
                <td>{formatClock(rec?.timeIn)}</td>
                <td>{formatClock(rec?.timeOut)}</td>
                <td>{rec ? formatMinutes(workedMinutes(rec)) : '--'}</td>
                <td>{rec ? formatMinutes(totalBreakMinutes(rec)) : '--'}</td>
                <td>
                  <span
                    className={`tag ${
                      !rec || !rec.timeIn
                        ? 'tag-absent'
                        : isLate(rec, settings.officeStartTime)
                        ? 'tag-late'
                        : 'tag-ok'
                    }`}
                  >
                    {statusOf(rec, settings.officeStartTime)}
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
