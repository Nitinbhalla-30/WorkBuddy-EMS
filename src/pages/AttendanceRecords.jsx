import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addAttendanceCorrectionMessage,
  attendanceMonthsLoaded,
  ensureAttendanceMonths,
  getAttendance,
  getAttendanceCorrections,
  getEmployeeById,
  getEmployees,
  getLeaves,
  getSettings,
  resolveAttendanceCorrection
} from '../data/store.js'
import {
  correctionIssueLabel,
  filterRecordsForStatsPeriod,
  formatClock,
  formatDate,
  formatMinutes,
  isLate,
  monthKey,
  monthKeyOffset,
  monthLabel,
  monthsForStatsPeriod,
  resolveJoinDate,
  resolveStartTime,
  statusOf,
  todayDateKey,
  totalBreakMinutes,
  workedMinutes
} from '../utils/attendance.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import AttendanceCorrectionThread from '../components/AttendanceCorrectionThread.jsx'
import { downloadExcelXlsx } from '../utils/exportExcel.js'
import { CircleCheck, CircleX, Clock, Download, Eye, MessageCircleQuestionMark, MoreVertical, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'

const PERIOD_FILTER_OPTS = [
  { value: 'all', label: 'All period' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'ytd', label: 'Year to date' }
]

const STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'On time', label: 'On time' },
  { value: 'Late', label: 'Late' },
  { value: 'Absent', label: 'Absent' },
  { value: 'On leave', label: 'On leave' }
]

const CORRECTION_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]

// How far back the Month picker reaches. Only the rolling window is cached at
// startup, so choosing one of these pulls that month from Supabase on demand.
const HISTORY_MONTH_RANGE = 24

function monthFilterOptions() {
  const keys = []
  for (let i = 0; i < HISTORY_MONTH_RANGE; i++) keys.push(monthKeyOffset(i))
  return [
    { value: 'all', label: 'Cached months' },
    ...keys.map((k) => ({ value: k, label: monthLabel(k) }))
  ]
}

// All attendance records with filters by employee, period, department, and manager.
export default function AttendanceRecords() {
  const { user } = useAuth()
  const settings = getSettings()
  const employees = getEmployees().filter((e) => e.role === 'employee')
  const today = todayDateKey()

  const [tab, setTab] = useState('all')
  const [corrections, setCorrections] = useState(() => getAttendanceCorrections())
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  // Bumped whenever extra attendance months land in the cache, so the memos
  // below re-read them. `historyPending` keeps the table honest while a fetch
  // for an older month is still in flight.
  const [attendanceTick, setAttendanceTick] = useState(0)
  const [historyPending, setHistoryPending] = useState(false)

  const employeeFilterOpts = useMemo(() => [
    { value: 'all', label: 'All employees' },
    ...employees.map((e) => ({ value: e.id, label: `${e.name} (${e.id})` }))
  ], [employees])

  const departmentFilterOpts = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))].sort()
    return [
      { value: 'all', label: 'All departments' },
      ...departments.map((d) => ({ value: d, label: d }))
    ]
  }, [employees])

  const reportsToFilterOpts = useMemo(() => {
    const managerIds = [...new Set(employees.map((e) => e.managerId).filter(Boolean))]
    const named = managerIds
      .map((id) => {
        const m = getEmployeeById(id)
        return m ? { value: id, label: m.name } : null
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label))
    return [
      { value: 'all', label: 'All managers' },
      { value: 'none', label: 'None' },
      ...named
    ]
  }, [employees])

  const monthFilterOpts = useMemo(() => monthFilterOptions(), [])

  const rawRecords = useMemo(() => getAttendance(), [attendanceTick])

  const allRecords = useMemo(() => {
    // Build a set of dates that have at least one real record
    const datesWithRecords = new Set(rawRecords.map((r) => r.date))

    // For each date that has records, also generate synthetic absent records
    // for employees who have no record on that date
    const syntheticAbsent = []
    let nextId = 1000000

    for (const date of datesWithRecords) {
      const empIdsWithRecord = new Set(
        rawRecords.filter((r) => r.date === date).map((r) => r.employeeId)
      )

      for (const emp of employees) {
        if (!empIdsWithRecord.has(emp.id)) {
          syntheticAbsent.push({
            id: `synthetic-${nextId++}`,
            employeeId: emp.id,
            date,
            timeIn: null,
            timeOut: null,
            breaks: [],
            createdAt: null
          })
        }
      }
    }

    return [...rawRecords, ...syntheticAbsent]
  }, [employees])

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

  function recordStatus(r) {
    if (onLeaveIds.has(r.employeeId) && !r.timeIn) return 'On leave'
    return statusOf(r, resolveStartTime(r.employeeId), settings.lateGraceMinutes)
  }

  const joinDateByEmployee = useMemo(() => {
    const map = {}
    for (const emp of employees) {
      map[emp.id] = resolveJoinDate(
        emp,
        rawRecords.filter((r) => r.employeeId === emp.id)
      )
    }
    return map
  }, [employees, rawRecords])

  const table = useTableControls(allRecords, {
    getSearchText: (r) => {
      const emp = getEmployeeById(r.employeeId)
      const manager = emp?.managerId ? getEmployeeById(emp.managerId) : null
      const leaveType = leaveTypeByEmployee.get(r.employeeId) || ''
      return [
        r.date, emp?.name, emp?.department, manager?.name,
        formatClock(r.timeIn), formatClock(r.timeOut),
        recordStatus(r), leaveType
      ].join(' ')
    },
    getSortValue: (r, key) => {
      const emp = getEmployeeById(r.employeeId)
      if (key === 'employee') return emp?.name || r.employeeId
      if (key === 'department') return emp?.department || ''
      if (key === 'reportsTo') {
        return emp?.managerId ? (getEmployeeById(emp.managerId)?.name || '') : ''
      }
      if (key === 'worked') return workedMinutes(r)
      if (key === 'break') return totalBreakMinutes(r)
      if (key === 'status') return recordStatus(r)
      if (key === 'leaveType') return leaveTypeByEmployee.get(r.employeeId) || ''
      return r[key]
    },
    initialSortKey: 'date',
    initialSortDir: 'desc',
    filterFns: {
      employeeId: (r, val) => r.employeeId === val,
      period: (r, val) => filterRecordsForStatsPeriod([r], val, {
        joinDate: joinDateByEmployee[r.employeeId] || today,
        todayDate: today
      }).length > 0,
      month: (r, val) => val === 'all' || String(r.date || '').startsWith(val),
      department: (r, val) => getEmployeeById(r.employeeId)?.department === val,
      reportsTo: (r, val) => {
        const managerId = getEmployeeById(r.employeeId)?.managerId
        if (val === 'none') return !managerId
        return managerId === val
      },
      status: (r, val) => {
        if (val === 'all') return true
        return recordStatus(r) === val
      }
    },
    initialFilters: { period: 'all', month: 'all' }
  })

  // Only a rolling window of attendance is cached after login. When the admin
  // asks for an older period or month, fetch just those months from Supabase
  // instead of the whole history, then bump the tick so the table re-reads.
  const selectedPeriod = table.filters.period || 'all'
  const selectedMonth = table.filters.month || 'all'

  useEffect(() => {
    const wanted = []
    if (selectedPeriod !== 'all') wanted.push(...monthsForStatsPeriod(selectedPeriod, { todayDate: today }))
    if (selectedMonth !== 'all') wanted.push(selectedMonth)
    if (wanted.length === 0) return undefined
    if (wanted.every((m) => attendanceMonthsLoaded().includes(m))) return undefined
    let cancelled = false
    setHistoryPending(true)
    ensureAttendanceMonths(wanted).then((ok) => {
      if (cancelled) return
      setHistoryPending(false)
      if (ok) setAttendanceTick((n) => n + 1)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedMonth, today])

  const correctionsTable = useTableControls(corrections, {
    getSearchText: (c) => {
      const emp = getEmployeeById(c.employeeId)
      return [
        emp?.name, c.date, correctionIssueLabel(c.issueType),
        c.description, statusLabel(c.status)
      ].join(' ')
    },
    getSortValue: (c, key) => {
      if (key === 'employee') return getEmployeeById(c.employeeId)?.name || c.employeeId
      if (key === 'issue') return correctionIssueLabel(c.issueType)
      if (key === 'details') return c.description || ''
      if (key === 'suggested') return `${c.suggestedTimeIn || ''} ${c.suggestedTimeOut || ''}`.trim()
      return c[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc',
    filterFns: {
      employeeId: (c, val) => c.employeeId === val,
      period: (c, val) => filterRecordsForStatsPeriod([{ date: c.date }], val, {
        joinDate: today,
        todayDate: today
      }).length > 0,
      status: (c, val) => c.status === val
    },
    initialFilters: { employeeId: 'all', period: 'all', status: 'all' }
  })
  const {
    items: correctionsPage,
    page: correctionsPageNum,
    totalPages: correctionsTotalPages,
    total: correctionsTotal,
    startIndex: correctionsStart,
    endIndex: correctionsEnd,
    setPage: setCorrectionsPage
  } = usePagination(correctionsTable.rows, 10)

  const {
    items: recordsPage,
    page: recordsPageNum,
    totalPages: recordsTotalPages,
    total: recordsTotal,
    startIndex: recordsStart,
    endIndex: recordsEnd,
    setPage: setRecordsPage
  } = usePagination(table.rows, 10)

  const openCorrection = corrections.find((c) => c.id === openId) || null
  const pendingCorrectionCount = corrections.filter((c) => c.status === 'pending').length

  function nameOf(id) {
    if (!id) return ''
    if (id === user.id) return user.name
    return getEmployeeById(id)?.name || id
  }

  function refreshCorrections() {
    setCorrections(getAttendanceCorrections())
  }

  function openReview(id, startReject = false) {
    setOpenId(id)
    setRejectMode(startReject)
    setRejectNote('')
    setOpenMenuId(null)
  }

  function closeReview() {
    setOpenId(null)
    setRejectMode(false)
    setRejectNote('')
  }

  // Approving an out-of-window correction needs the target month downloaded
  // first, so the store call is async now — wait for it before refreshing.
  async function approveCorrection(id) {
    try {
      await resolveAttendanceCorrection(id, 'approved', user.id, 'Attendance updated as requested.')
      refreshCorrections()
      closeReview()
    } catch (err) {
      console.warn('Could not approve attendance correction', err)
    }
  }

  async function rejectCorrection(id) {
    if (!rejectNote.trim()) return
    try {
      await resolveAttendanceCorrection(id, 'rejected', user.id, rejectNote.trim())
      refreshCorrections()
      closeReview()
    } catch (err) {
      console.warn('Could not reject attendance correction', err)
    }
  }

  function handleReply(text) {
    if (!openCorrection) return
    addAttendanceCorrectionMessage(openCorrection.id, {
      byId: user.id,
      byRole: 'admin',
      text
    })
    refreshCorrections()
  }

  function toggleMenu(id) {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  function statusLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  function statusClass(status) {
    if (status === 'approved') return 'tag-ok'
    if (status === 'rejected') return 'tag-late'
    if (status === 'withdrawn') return 'tag-absent'
    return 'tag-pending' // pending — blue, distinct from the grey withdrawn tag
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  function exportAttendanceExcel() {
    const headers = [
      'Date',
      'Employee',
      'Department',
      'Reports to',
      'Time In',
      'Time Out',
      'Worked',
      'Break',
      'Leave Type',
      'Status'
    ]
    const rows = table.rows.map((r) => {
      const emp = getEmployeeById(r.employeeId)
      const manager = emp?.managerId ? getEmployeeById(emp.managerId) : null
      const leaveType = leaveTypeByEmployee.get(r.employeeId)

      // Convert date string "YYYY-MM-DD" to a UTC Date object for Excel
      let dateObj = ''
      if (r.date) {
        const [y, m, d] = r.date.split('-').map(Number)
        dateObj = new Date(Date.UTC(y, m - 1, d))
      }

      // Convert time ISO strings to Excel time fractions (decimal day)
      // Convert to local time first to match what the web app displays
      function timeToFraction(iso) {
        if (!iso) return ''
        const d = new Date(iso)
        if (isNaN(d.getTime())) return ''
        const h = d.getHours()
        const m = d.getMinutes()
        const s = d.getSeconds()
        return (h * 3600 + m * 60 + s) / 86400
      }

      // Convert minutes to Excel time fraction (decimal day)
      function minutesToFraction(mins) {
        if (!mins || mins <= 0) return ''
        return Math.round(mins) / 1440 // 1440 minutes in a day
      }

      return [
        dateObj,
        emp?.name || r.employeeId,
        emp?.department || '',
        manager?.name || 'None',
        timeToFraction(r.timeIn),
        timeToFraction(r.timeOut),
        minutesToFraction(workedMinutes(r)),
        minutesToFraction(totalBreakMinutes(r)),
        leaveType ? (LEAVE_TYPE_LABELS[leaveType] || leaveType) : '',
        recordStatus(r)
      ]
    })

    downloadExcelXlsx(`attendance-records-${today}`, headers, rows, {
      autoFilter: true,
      colFormats: {
        0: { t: 'd', z: 'yyyy-mm-dd' },
        4: { t: 'n', z: 'hh:mm AM/PM' },
        5: { t: 'n', z: 'hh:mm AM/PM' },
        6: { t: 'n', z: '[h]:mm' },
        7: { t: 'n', z: '[h]:mm' }
      }
    })
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Clock size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Attendance Records
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Track daily attendance and manage correction requests</p>
        </div>
        <span className="muted">{tab === 'all' ? `${table.count} records` : `${corrections.length} requests`}</span>
      </div>

      <div className="tabs">
        <button type="button" className={`tab ${tab === 'all' ? 'tab-active' : ''}`} onClick={() => setTab('all')}>
          All records
        </button>
        <button type="button" className={`tab ${tab === 'corrections' ? 'tab-active' : ''}`} onClick={() => setTab('corrections')}>
          Correction requests{pendingCorrectionCount > 0 ? ` (${pendingCorrectionCount})` : ''}
        </button>
      </div>

      {tab === 'all' && (
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          placeholder="Search records..."
          filters={[
            {
              key: 'employeeId',
              label: 'Employee',
              value: table.filters.employeeId || 'all',
              options: employeeFilterOpts
            },
            {
              key: 'period',
              label: 'Period',
              value: table.filters.period || 'all',
              options: PERIOD_FILTER_OPTS
            },
            {
              key: 'month',
              label: 'Month',
              value: selectedMonth,
              options: monthFilterOpts
            },
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
          actions={
            <button
              type="button"
              className="btn btn-primary btn-tiny"
              onClick={exportAttendanceExcel}
              disabled={table.rows.length === 0}
            >
              <Download size={14} style={{ marginRight: 4 }} />Export to Excel
            </button>
          }
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Date" keyName="date" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Department" keyName="department" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reports to" keyName="reportsTo" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Time In" keyName="timeIn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Time Out" keyName="timeOut" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Worked" keyName="worked" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Break" keyName="break" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Leave Type" keyName="leaveType" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {recordsTotal === 0 && (
              <TableEmpty
                colSpan="10"
                message={historyPending
                  ? 'Loading older attendance records from the server...'
                  : 'No records match your filters.'}
              />
            )}
            {recordsPage.map((r) => {
              const emp = getEmployeeById(r.employeeId)
              const manager = emp?.managerId ? getEmployeeById(emp.managerId) : null
              const leaveType = leaveTypeByEmployee.get(r.employeeId)
              const recStatus = recordStatus(r)
              return (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    <div className="person-cell">
                      <Avatar src={emp?.photoUrl} name={emp?.name} size={34} />
                      <div>
                        <strong>{emp ? emp.name : r.employeeId}</strong>
                        <div className="muted small">{r.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp?.department || <span className="muted">--</span>}</td>
                  <td>{manager?.name || <span className="muted">None</span>}</td>
                  <td>{formatClock(r.timeIn)}</td>
                  <td>{formatClock(r.timeOut)}</td>
                  <td>{r.timeIn ? formatMinutes(workedMinutes(r)) : <span className="muted">--</span>}</td>
                  <td>{r.timeIn ? formatMinutes(totalBreakMinutes(r)) : <span className="muted">--</span>}</td>
                  <td>{leaveType ? (LEAVE_TYPE_LABELS[leaveType] || leaveType) : <span className="muted">--</span>}</td>
                  <td>
                    <span className={`tag ${
                      recStatus === 'On leave' ? 'tag-absent'
                        : recStatus === 'Late' ? 'tag-late'
                        : recStatus === 'Absent' ? 'tag-absent'
                        : 'tag-ok'
                    }`}>
                      {recStatus}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination
          page={recordsPageNum}
          totalPages={recordsTotalPages}
          total={recordsTotal}
          startIndex={recordsStart}
          endIndex={recordsEnd}
          onPageChange={setRecordsPage}
        />
      </div>
      )}

      {tab === 'corrections' && (
      <div className="card">
        <TableToolbar
          search={correctionsTable.search}
          onSearchChange={correctionsTable.setSearch}
          placeholder="Search correction requests..."
          filters={[
            {
              key: 'employeeId',
              label: 'Employee',
              value: correctionsTable.filters.employeeId || 'all',
              options: employeeFilterOpts
            },
            {
              key: 'period',
              label: 'Period',
              value: correctionsTable.filters.period || 'all',
              options: PERIOD_FILTER_OPTS
            },
            {
              key: 'status',
              label: 'Status',
              value: correctionsTable.filters.status || 'all',
              options: CORRECTION_STATUS_FILTER_OPTS
            }
          ]}
          onFilterChange={correctionsTable.setFilter}
        />
        <table className="table table-corrections" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '6%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Date" keyName="date" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Issue" keyName="issue" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Details" keyName="details" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Suggested" keyName="suggested" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={correctionsTable.sortKey} sortDir={correctionsTable.sortDir} onSort={correctionsTable.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {correctionsTotal === 0 && (
              <TableEmpty colSpan={7} message="No correction requests match your filters." />
            )}
            {correctionsPage.map((c) => {
              const emp = getEmployeeById(c.employeeId)
              return (
                <tr key={c.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar src={emp?.photoUrl} name={emp?.name} size={34} />
                      <span>{emp?.name || c.employeeId}</span>
                    </div>
                  </td>
                  <td>{formatDate(c.date)}</td>
                  <td>{correctionIssueLabel(c.issueType)}</td>
                  <td className="cell-ellipsis" title={c.description || undefined}>{c.description || <span className="muted">--</span>}</td>
                  <td className="small">
                    {c.suggestedTimeIn && c.suggestedTimeOut && `In: ${c.suggestedTimeIn} · Out: ${c.suggestedTimeOut}`}
                    {c.suggestedTimeIn && !c.suggestedTimeOut && `In: ${c.suggestedTimeIn}`}
                    {!c.suggestedTimeIn && c.suggestedTimeOut && `Out: ${c.suggestedTimeOut}`}
                    {!c.suggestedTimeIn && !c.suggestedTimeOut && <span className="muted">--</span>}
                  </td>
                  <td>
                    <span className={`tag ${statusClass(c.status)}`}>
                      {statusLabel(c.status)}
                    </span>
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button corrections-menu-button"
                        onClick={() => toggleMenu(c.id)}
                        aria-label="Correction actions"
                       ><MoreVertical size={16} /></button>
                      {openMenuId === c.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => openReview(c.id, false)}
                          >
                            {c.status === 'pending'
                              ? (<><MessageCircleQuestionMark size={14} aria-hidden="true" /> Ask question</>)
                              : (<><Eye size={14} aria-hidden="true" /> View thread</>)}
                          </button>
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={c.status !== 'pending'}
                            onClick={() => {
                              approveCorrection(c.id)
                              closeMenu()
                            }}
                          >
                            <CircleCheck size={14} aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={c.status !== 'pending'}
                            onClick={() => openReview(c.id, true)}
                          >
                            <CircleX size={14} aria-hidden="true" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
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
      )}

      <p className="hint">
        The All records tab shows daily clock-in and clock-out times for every employee.
        Use Correction requests to review and resolve attendance mismatches — employees submit
        these when they forget to clock in or out, or when the recorded time is incorrect.
      </p>

      {openCorrection && (
        <Modal onClose={closeReview} title="Review correction request">
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {nameOf(openCorrection.employeeId)}
                </h3>
                <div className="muted small">
                  {correctionIssueLabel(openCorrection.issueType)} · {formatDate(openCorrection.date)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusClass(openCorrection.status)}`}>
                  {statusLabel(openCorrection.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={closeReview} aria-label="Close"><X size={15} /></button>
              </div>
            </div>

            {openCorrection.description && (
              <p className="hint first"><strong>Details:</strong> {openCorrection.description}</p>
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

            {openCorrection.status === 'pending' && !rejectMode && (
              <div className="button-row first">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => approveCorrection(openCorrection.id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setRejectMode(true)}
                >
                  Reject
                </button>
              </div>
            )}

            {openCorrection.status === 'pending' && rejectMode && (
              <div className="first">
                <label className="field">
                  <span>Reason for employee</span>
                  <textarea
                    className="reply-input"
                    rows={2}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Explain why this correction cannot be applied"
                  />
                </label>
                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={!rejectNote.trim()}
                    onClick={() => rejectCorrection(openCorrection.id)}
                  >
                    Confirm reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => { setRejectMode(false); setRejectNote('') }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <AttendanceCorrectionThread
              correction={openCorrection}
              viewerRole="admin"
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleReply}
              onClose={closeReview}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
