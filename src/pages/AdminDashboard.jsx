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
import { AttendanceTodayChart } from '../components/dashboard/AttendanceTodayChart.tsx'
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

  const departmentFilterOpts = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))].sort()
    return [
      { value: 'all', label: 'All departments' },
      ...departments.map((d) => ({ value: d, label: d }))
    ]
  }, [employees])

  const STATUS_FILTER_OPTS = [
    { value: 'all', label: 'All statuses' },
    { value: 'Present', label: 'Present' },
    { value: 'On time', label: 'On time' },
    { value: 'Late', label: 'Late' },
    { value: 'Absent', label: 'Absent' }
  ]

  const table = useTableControls(allRows, {
    getSearchText: ({ emp, rec }) =>
      [emp.name, emp.id, emp.department, formatClock(rec?.timeIn), formatClock(rec?.timeOut), statusOf(rec, settings.officeStartTime, settings.lateGraceMinutes)].join(' '),
    getSortValue: ({ emp, rec }, key) => {
      if (key === 'name') return emp.name
      if (key === 'department') return emp.department
      if (key === 'timeIn') return rec?.timeIn || ''
      if (key === 'timeOut') return rec?.timeOut || ''
      if (key === 'worked') return rec ? workedMinutes(rec) : -1
      if (key === 'break') return rec ? totalBreakMinutes(rec) : -1
      if (key === 'status') return statusOf(rec, settings.officeStartTime, settings.lateGraceMinutes)
      return ''
    },
    initialSortKey: 'name',
    initialSortDir: 'asc',
    filterFns: {
      department: ({ emp }, val) => emp.department === val,
      status: ({ rec }, val) => statusOf(rec, settings.officeStartTime, settings.lateGraceMinutes) === val
    }
  })

  const present = allRows.filter((r) => r.rec && r.rec.timeIn).length
  const late = allRows.filter(
    (r) => r.rec && isLate(r.rec, settings.officeStartTime, settings.lateGraceMinutes)
  ).length
  const absent = employees.length - present

  return (
    <div>
      <div className="page-head">
        <h2>Dashboard</h2>
        <span className="muted">Today</span>
      </div>

      <AttendanceTodayChart
        employees={employees.length}
        present={present}
        late={late}
        absent={absent}
      />

      <h3 className="section-title">Today by employee</h3>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search employees..."
          filters={[
            {
              key: 'department',
              label: 'Department',
              value: table.filters.department || 'all',
              options: departmentFilterOpts
            },
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: STATUS_FILTER_OPTS
            }
          ]}
          onFilterChange={table.setFilter}
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
              <tr><td colSpan={7} className="muted">No employees match your filters.</td></tr>
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
                        : isLate(rec, settings.officeStartTime, settings.lateGraceMinutes)
                        ? 'tag-late'
                        : 'tag-ok'
                    }`}
                  >
                    {statusOf(rec, settings.officeStartTime, settings.lateGraceMinutes)}
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
