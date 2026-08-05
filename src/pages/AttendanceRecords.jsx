import { useMemo, useState } from 'react'
import {
  getAttendance,
  getEmployeeById,
  getEmployees,
  getSettings
} from '../data/store.js'
import {
  formatClock,
  formatDate,
  formatMinutes,
  isLate,
  statusOf,
  totalBreakMinutes,
  workedMinutes
} from '../utils/attendance.js'

// All attendance records with simple filters by employee and date.
export default function AttendanceRecords() {
  const settings = getSettings()
  const employees = getEmployees().filter((e) => e.role === 'employee')

  const [empFilter, setEmpFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const records = useMemo(() => {
    let list = getAttendance()
    if (empFilter !== 'all') list = list.filter((r) => r.employeeId === empFilter)
    if (dateFilter) list = list.filter((r) => r.date === dateFilter)
    return list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [empFilter, dateFilter])

  return (
    <div>
      <div className="page-head">
        <h2>Attendance Records</h2>
        <span className="muted">{records.length} records</span>
      </div>

      <div className="card filters">
        <label className="field inline">
          <span>Employee</span>
          <select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}>
            <option value="all">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </label>

        <label className="field inline">
          <span>Date</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </label>

        {(empFilter !== 'all' || dateFilter) && (
          <button
            className="btn btn-light"
            onClick={() => { setEmpFilter('all'); setDateFilter('') }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Worked</th>
              <th>Break</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr><td colSpan="7" className="muted">No records match the filters.</td></tr>
            )}
            {records.map((r) => {
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
