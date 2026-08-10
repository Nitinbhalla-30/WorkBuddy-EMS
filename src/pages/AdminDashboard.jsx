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
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { useTableControls } from '../hooks/useTableControls.js'

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

  const allRows = useMemo(() => employees.map((emp) => {
    const rec = attendance.find(
      (r) => r.employeeId === emp.id && r.date === today
    ) || null
    return { emp, rec }
  }), [employees, attendance, today])

  const table = useTableControls(allRows, {
    getSearchText: ({ emp, rec }) =>
      [emp.name, emp.id, emp.department, formatClock(rec?.timeIn), formatClock(rec?.timeOut), statusOf(rec, settings.officeStartTime)].join(' '),
    getSortValue: ({ emp, rec }, key) => {
      if (key === 'name') return emp.name
      if (key === 'department') return emp.department
      if (key === 'timeIn') return rec?.timeIn || ''
      if (key === 'timeOut') return rec?.timeOut || ''
      if (key === 'worked') return rec ? workedMinutes(rec) : -1
      if (key === 'break') return rec ? totalBreakMinutes(rec) : -1
      if (key === 'status') return statusOf(rec, settings.officeStartTime)
      return ''
    },
    initialSortKey: 'name',
    initialSortDir: 'asc'
  })

  const present = allRows.filter((r) => r.rec && r.rec.timeIn).length
  const late = allRows.filter(
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
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search employees..."
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Department" keyName="department" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time In" keyName="timeIn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time Out" keyName="timeOut" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Worked" keyName="worked" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Break" keyName="break" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={7} className="muted">No employees match your search.</td></tr>
            )}
            {table.rows.map(({ emp, rec }) => (
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
