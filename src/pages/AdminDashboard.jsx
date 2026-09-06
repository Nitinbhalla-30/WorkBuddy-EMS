import { useMemo } from 'react'
import {
  getAttendance,
  getEmployees,
  getLeaves,
  getSettings
} from '../data/store.js'
import {
  formatClock,
  formatDate,
  formatMinutes,
  isLate,
  resolveStartTime,
  statusOf,
  totalBreakMinutes,
  workedMinutes
} from '../utils/attendance.js'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import Pagination from '../components/Pagination.jsx'
import { AttendanceTodayChart } from '../components/dashboard/AttendanceTodayChart.tsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'
import { LayoutDashboard, Users, X } from 'lucide-react'

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
    { value: 'On time', label: 'On time' },
    { value: 'Late', label: 'Late' },
    { value: 'Absent', label: 'Absent' },
    { value: 'On leave', label: 'On leave' }
  ]

  const onLeaveIds = useMemo(() => new Set(
    getLeaves()
      .filter((l) => l.status === 'approved' && l.fromDate <= today && today <= l.toDate)
      .map((l) => l.employeeId)
  ), [today])

  const leaveTypeByEmployee = useMemo(() => {
    const map = new Map()
    getLeaves()
      .filter((l) => l.status === 'approved' && l.fromDate <= today && today <= l.toDate)
      .forEach((l) => {
        if (!map.has(l.employeeId)) {
          map.set(l.employeeId, l.type)
        }
      })
    return map
  }, [today])

  const LEAVE_TYPE_LABELS = {
    casual: 'Casual',
    sick: 'Sick',
    earned: 'Earned',
    halfday: 'Half-day',
    short: 'Short'
  }

  const table = useTableControls(allRows, {
    getSearchText: ({ emp, rec }) => {
      const leaveType = leaveTypeByEmployee.get(emp.id) || ''
      return [emp.name, emp.id, emp.department, formatClock(rec?.timeIn), formatClock(rec?.timeOut), onLeaveIds.has(emp.id) && !(rec && rec.timeIn) ? 'On leave' : statusOf(rec, resolveStartTime(emp.id), settings.lateGraceMinutes), leaveType].join(' ')
    },
    getSortValue: ({ emp, rec }, key) => {
      if (key === 'name') return emp.name
      if (key === 'department') return emp.department
      if (key === 'timeIn') return rec?.timeIn || ''
      if (key === 'timeOut') return rec?.timeOut || ''
      if (key === 'worked') return rec ? workedMinutes(rec) : -1
      if (key === 'break') return rec ? totalBreakMinutes(rec) : -1
      if (key === 'status') return onLeaveIds.has(emp.id) && !(rec && rec.timeIn) ? 'On leave' : statusOf(rec, resolveStartTime(emp.id), settings.lateGraceMinutes)
      if (key === 'leaveType') return leaveTypeByEmployee.get(emp.id) || ''
      return ''
    },
    initialSortKey: 'name',
    initialSortDir: 'asc',
    filterFns: {
      department: ({ emp }, val) => emp.department === val,
      status: ({ emp, rec }, val) => {
        if (val === 'On leave') return onLeaveIds.has(emp.id) && !(rec && rec.timeIn)
        if (val === 'Absent') return !onLeaveIds.has(emp.id) && (!rec || !rec.timeIn)
        return statusOf(rec, resolveStartTime(emp.id), settings.lateGraceMinutes) === val
      },
      quick: ({ emp, rec }, val) => {
        if (val === 'ontime') return rec && rec.timeIn && !isLate(rec, resolveStartTime(emp.id), settings.lateGraceMinutes)
        if (val === 'late') return rec && rec.timeIn && isLate(rec, resolveStartTime(emp.id), settings.lateGraceMinutes)
        if (val === 'absent') return !onLeaveIds.has(emp.id) && (!rec || !rec.timeIn)
        if (val === 'onleave') return onLeaveIds.has(emp.id) && !(rec && rec.timeIn)
        return true
      }
    }
  })
  const {
    items: rowsPage,
    page: rowsPageNum,
    totalPages: rowsTotalPages,
    total: rowsTotal,
    startIndex: rowsStart,
    endIndex: rowsEnd,
    setPage: setRowsPage
  } = usePagination(table.rows)

  const present = allRows.filter((r) => r.rec && r.rec.timeIn).length
  const late = allRows.filter(
    (r) => r.rec && isLate(r.rec, resolveStartTime(r.emp.id), settings.lateGraceMinutes)
  ).length
  const onLeave = allRows.filter(({ emp, rec }) => onLeaveIds.has(emp.id) && !(rec && rec.timeIn)).length
  const absent = employees.length - present - onLeave

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <LayoutDashboard size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Dashboard
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Today's attendance overview</p>
        </div>
        <span className="muted">{formatDate(today)}</span>
      </div>

      <AttendanceTodayChart
        employees={employees.length}
        present={present}
        late={late}
        absent={absent}
        onLeave={onLeave}
        activeKey={table.filters.quick || null}
        onToggleKey={(key) => {
          table.setFilter('department', 'all')
          table.setFilter('status', 'all')
          table.setFilter('quick', table.filters.quick === key ? null : key)
          setRowsPage(1)
        }}
      />

      <div className="section-head-row">
        <h3 className="section-title first">
          <Users size={16} style={{ opacity: 0.7, marginRight: 6 }} />
          Today by employee
        </h3>
        <span className="muted small">{table.count} employee{table.count !== 1 ? 's' : ''}</span>
      </div>
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
          onFilterChange={(key, val) => {
            table.setFilter('quick', null)
            table.setFilter(key, val)
            setRowsPage(1)
          }}
          actions={
            table.filters.quick && table.filters.quick !== 'all' ? (
              <button
                type="button"
                className="quick-filter-chip"
                onClick={() => {
                  table.setFilter('quick', null)
                  setRowsPage(1)
                }}
                aria-label={`Clear ${table.filters.quick} filter`}
              >
                {table.filters.quick === 'ontime' ? 'On time' : table.filters.quick === 'late' ? 'Late' : table.filters.quick === 'onleave' ? 'On leave' : 'Absent'}
                <X size={13} aria-hidden="true" />
              </button>
            ) : null
          }
        />
        <table className="table">
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Department" keyName="department" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time In" keyName="timeIn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Time Out" keyName="timeOut" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Worked" keyName="worked" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Break" keyName="break" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Leave Type" keyName="leaveType" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={8} message="No employees match your filters." />
            )}
            {rowsPage.map(({ emp, rec }) => {
              const leaveType = leaveTypeByEmployee.get(emp.id)
              return (
              <tr key={emp.id}>
                <td>
                  <div className="person-cell">
                    <Avatar src={emp.photoUrl} name={emp.name} size={34} />
                    <div>
                      <strong>{emp.name}</strong>
                      <div className="muted small">{emp.id}</div>
                    </div>
                  </div>
                </td>
                <td>{emp.department}</td>
                <td>{formatClock(rec?.timeIn)}</td>
                <td>{formatClock(rec?.timeOut)}</td>
                <td>{rec && workedMinutes(rec) > 0 ? formatMinutes(workedMinutes(rec)) : '--'}</td>
                <td>{rec && totalBreakMinutes(rec) > 0 ? formatMinutes(totalBreakMinutes(rec)) : '--'}</td>
                <td>{leaveType ? LEAVE_TYPE_LABELS[leaveType] || leaveType : '--'}</td>
                <td>
                  <span
                    className={`tag ${
                      onLeaveIds.has(emp.id) && !(rec && rec.timeIn)
                        ? 'tag-absent'
                        : !rec || !rec.timeIn
                          ? 'tag-absent'
                          : isLate(rec, resolveStartTime(emp.id), settings.lateGraceMinutes)
                            ? 'tag-late'
                            : 'tag-ok'
                    }`}
                  >
                    {onLeaveIds.has(emp.id) && !(rec && rec.timeIn) ? 'On leave' : statusOf(rec, resolveStartTime(emp.id), settings.lateGraceMinutes)}
                  </span>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination
          page={rowsPageNum}
          totalPages={rowsTotalPages}
          total={rowsTotal}
          startIndex={rowsStart}
          endIndex={rowsEnd}
          onPageChange={setRowsPage}
        />
      </div>

      <p className="hint">
        <strong>Quick filters:</strong> click the On time, Late, Absent, or On leave cards above to show only those employees; click again to see all.
        Use the filters to narrow by department or status. For detailed daily records, correction requests, or monthly trends,
        go to Attendance Records.
      </p>
    </div>
  )
}
