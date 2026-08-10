import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  applyLeave,
  getLeavesForEmployee,
  getSettings
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  countLeaveDays,
  leaveBalance,
  leaveTypeLabel,
  statusTagClass
} from '../utils/leaves.js'
import { getObservedCompanyHolidays } from '../utils/holidays.js'
import LeaveForm from '../components/LeaveForm.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'

const LEAVE_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

// The employee's leave screen: balance, apply form, and their requests.
export default function EmployeeLeaves() {
  const { user } = useAuth()
  const settings = getSettings()

  const [leaves, setLeaves] = useState(() => getLeavesForEmployee(user.id))
  const [showForm, setShowForm] = useState(false)
  const [showHolidays, setShowHolidays] = useState(false)
  const [message, setMessage] = useState('')

  const currentYear = new Date().getFullYear()
  const companyHolidays = useMemo(
    () => getObservedCompanyHolidays(settings.companyHolidays, currentYear),
    [settings.companyHolidays, currentYear]
  )

  const balance = useMemo(
    () => leaveBalance(leaves, settings.leaveAllowance),
    [leaves, settings.leaveAllowance]
  )
  const table = useTableControls(leaves, {
    getSearchText: (lv) =>
      [leaveTypeLabel(lv.type), lv.fromDate, lv.toDate, lv.reason, lv.status].join(' '),
    getSortValue: (lv, key) => {
      if (key === 'days') return countLeaveDays(lv.fromDate, lv.toDate)
      if (key === 'type') return leaveTypeLabel(lv.type)
      return lv[key]
    },
    initialSortKey: 'fromDate',
    initialSortDir: 'desc',
    filterFns: {
      status: (lv, val) => lv.status === val
    }
  })
  const {
    items: leavesPage,
    page: leavesPageNum,
    totalPages: leavesTotalPages,
    total: leavesTotal,
    startIndex: leavesStart,
    endIndex: leavesEnd,
    setPage: setLeavesPage
  } = usePagination(table.rows)

  function handleApply(data) {
    applyLeave({ employeeId: user.id, ...data })
    setLeaves(getLeavesForEmployee(user.id))
    setShowForm(false)
    setMessage('Your leave request was sent to HR/Admin.')
  }

  return (
    <div>
      <div className="page-head">
        <h2>My Leaves</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="muted">Year {currentYear}</span>
          <button
            className="btn btn-primary btn-tiny"
            onClick={() => setShowHolidays(true)}
          >
            Company Holidays
          </button>
          <button
            className="btn btn-primary btn-tiny"
            onClick={() => setShowForm(true)}
          >
            Apply for leave
          </button>
        </div>
      </div>

      {message && <div className="info-box">{message}</div>}

      {showHolidays && (
        <Modal onClose={() => setShowHolidays(false)} title="Company Holidays">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Company Holidays — {currentYear}</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setShowHolidays(false)}
              >
                ✕
              </button>
            </div>
            <p className="hint first">
              Official company holidays when you do not need to work. Other public
              dates not listed here may still be working days for employees.
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Holiday</th>
                </tr>
              </thead>
              <tbody>
                {companyHolidays.length === 0 && (
                  <tr>
                    <td colSpan={2} className="muted">
                      No company holidays have been set for {currentYear}.
                    </td>
                  </tr>
                )}
                {companyHolidays.map((h) => (
                  <tr key={h.id}>
                    <td>{formatDate(h.date)}</td>
                    <td>{h.name || <span className="muted">--</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-row">
              <button type="button" className="btn btn-light" onClick={() => setShowHolidays(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Apply for leave">
          <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Apply for leave</h3>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>
              <p className="hint first">
                Choose your leave type and dates. Weekends are not counted toward your request.
              </p>
              <LeaveForm
                onApply={handleApply}
                onCancel={() => setShowForm(false)}
              />
            </div>
        </Modal>
      )}

      {/* Balance cards */}
      <div className="stat-grid">
        {balance.map((b) => (
          <div className="stat-card" key={b.key}>
            <div className="stat-num">{b.remaining}</div>
            <div className="stat-label">
              {b.label} left <span className="muted">/ {b.allowed}</span>
            </div>
          </div>
        ))}
      </div>

      {/* My requests */}
      <h3 className="section-title">My requests</h3>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search leaves..."
          filters={[{
            key: 'status',
            label: 'Status',
            value: table.filters.status || 'all',
            options: LEAVE_STATUS_FILTERS
          }]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="From" keyName="fromDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="To" keyName="toDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Days" keyName="days" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan="6" className="muted">No leave requests match your filters.</td></tr>
            )}
            {leavesPage.map((lv) => (
              <tr key={lv.id}>
                <td>{leaveTypeLabel(lv.type)}</td>
                <td>{formatDate(lv.fromDate)}</td>
                <td>{formatDate(lv.toDate)}</td>
                <td>{countLeaveDays(lv.fromDate, lv.toDate)}</td>
                <td>{lv.reason || <span className="muted">--</span>}</td>
                <td>
                  <span className={`tag ${statusTagClass(lv.status)}`}>
                    {lv.status.charAt(0).toUpperCase() + lv.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={leavesPageNum}
          totalPages={leavesTotalPages}
          total={leavesTotal}
          startIndex={leavesStart}
          endIndex={leavesEnd}
          onPageChange={setLeavesPage}
        />
      </div>
    </div>
  )
}
