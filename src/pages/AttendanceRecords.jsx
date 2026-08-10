import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAttendance,
  getAttendanceCorrections,
  getEmployeeById,
  getEmployees,
  getSettings,
  resolveAttendanceCorrection
} from '../data/store.js'
import {
  correctionIssueLabel,
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
  const { user } = useAuth()
  const settings = getSettings()
  const employees = getEmployees().filter((e) => e.role === 'employee')

  const [corrections, setCorrections] = useState(() => getAttendanceCorrections())
  const [rejectId, setRejectId] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

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

  const pendingCorrections = corrections.filter((c) => c.status === 'pending')

  function refreshCorrections() {
    setCorrections(getAttendanceCorrections())
  }

  function approveCorrection(id) {
    resolveAttendanceCorrection(id, 'approved', user.id, 'Attendance updated as requested.')
    refreshCorrections()
  }

  function rejectCorrection(id) {
    if (!rejectNote.trim()) return
    resolveAttendanceCorrection(id, 'rejected', user.id, rejectNote.trim())
    setRejectId(null)
    setRejectNote('')
    refreshCorrections()
  }

  const hasDateFilter = table.filters.date && table.filters.date !== 'all'

  return (
    <div>
      <div className="page-head">
        <h2>Attendance Records</h2>
        <span className="muted">{table.count} records</span>
      </div>

      {pendingCorrections.length > 0 && (
        <>
          <h3 className="section-title first">
            Correction requests
            <span className="muted small"> · {pendingCorrections.length} pending</span>
          </h3>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Issue</th>
                  <th>Details</th>
                  <th>Suggested</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingCorrections.map((c) => {
                  const emp = getEmployeeById(c.employeeId)
                  return (
                    <tr key={c.id}>
                      <td>{emp?.name || c.employeeId}</td>
                      <td>{formatDate(c.date)}</td>
                      <td>{correctionIssueLabel(c.issueType)}</td>
                      <td>{c.description}</td>
                      <td className="small">
                        {c.suggestedTimeIn && <>In: {c.suggestedTimeIn}<br /></>}
                        {c.suggestedTimeOut && <>Out: {c.suggestedTimeOut}</>}
                        {!c.suggestedTimeIn && !c.suggestedTimeOut && <span className="muted">--</span>}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn btn-tiny btn-primary"
                            onClick={() => approveCorrection(c.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-tiny btn-danger"
                            onClick={() => { setRejectId(c.id); setRejectNote('') }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {rejectId && (
            <div className="card">
              <h3 className="section-title first">Reject correction</h3>
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
                  onClick={() => rejectCorrection(rejectId)}
                >
                  Confirm reject
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => { setRejectId(null); setRejectNote('') }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <h3 className="section-title">All records</h3>
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
