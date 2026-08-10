import { useMemo } from 'react'
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
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { useTableControls } from '../hooks/useTableControls.js'

// All attendance records with simple filters by employee and date.
export default function AttendanceRecords() {
  const settings = getSettings()
  const employees = getEmployees().filter((e) => e.role === 'employee')

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

  const hasDateFilter = table.filters.date && table.filters.date !== 'all'

  return (
    <div>
      <div className="page-head">
        <h2>Attendance Records</h2>
        <span className="muted">{table.count} records</span>
      </div>

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
