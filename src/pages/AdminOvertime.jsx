import { useEffect, useMemo, useState } from 'react'
import {
  approveOvertime,
  getEmployeeById,
  getEmployees,
  getOvertimeRequests,
  getOvertimeRequestsByMonth,
  rejectOvertime
} from '../data/store.js'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableEmpty from '../components/TableEmpty.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { monthKey, monthLabel, listRecentMonths, formatRupees } from '../utils/salary.js'
import {
  overtimeStatusLabel,
  overtimeStatusTagClass,
  calculateOvertimePay,
  totalApprovedOvertimeHours
} from '../utils/overtime.js'
import { CircleCheck, CircleX, MoreHorizontal, Timer, X } from 'lucide-react'

const TABS = ['Requests', 'Summary']

export default function AdminOvertime() {
  const [tab, setTab] = useState(0)
  const [refresh, setRefresh] = useState(0)

  function bump() { setRefresh((n) => n + 1) }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Timer size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Overtime
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Review and approve employee overtime requests</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={t} className={`tab ${i === tab ? 'tab-active' : ''}`} onClick={() => setTab(i)}>
            {t}
            {t === 'Requests' ? ` (${getOvertimeRequests().filter((r) => r.status === 'pending' && r.stage === 'hr').length})` : ''}
          </button>
        ))}
      </div>

      {tab === 0 && <RequestsTab refresh={refresh} onDecided={bump} />}
      {tab === 1 && <SummaryTab refresh={refresh} />}

      <p className="hint">
        Review overtime requests from employees. Approved overtime is paid at twice the normal hourly rate
        and added to the employee's monthly salary.
      </p>
    </div>
  )
}

// ---- Tab 1: Overtime Requests ----
function RequestsTab({ refresh, onDecided }) {
  // Show requests at HR stage (legacy no-stage requests belong to the manager, not HR)
  const [requests, setRequests] = useState(() => getOvertimeRequests().filter((r) => r.stage === 'hr' || r.status !== 'pending'))
  const [approveId, setApproveId] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)

  const table = useTableControls(requests, {
    getSearchText: (r) => {
      const emp = getEmployeeById(r.employeeId)
      return [emp?.name, emp?.id, r.monthKey, r.reason, r.status].join(' ')
    },
    getSortValue: (r, key) => {
      if (key === 'employee') return getEmployeeById(r.employeeId)?.name || ''
      if (key === 'month') return r.monthKey
      if (key === 'status') return r.status
      return r[key]
    },
    initialSortKey: 'requestedOn',
    initialSortDir: 'desc',
    filterFns: {
      status: (r, val) => {
        if (val === 'all') return true
        if (val === 'pending-hr') return r.status === 'pending'
        return r.status === val
      }
    }
  })

  const {
    items: page,
    page: pageNum,
    totalPages,
    total,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows)

  function toggleMenu(id) {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  function closeMenu() {
    setOpenMenuId(null)
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

  useEffect(() => {
    setRequests(getOvertimeRequests().filter((r) => r.stage === 'hr' || r.status !== 'pending'))
  }, [refresh])

  function handleApprove() {
    if (!approveId) return
    approveOvertime(approveId, 'admin')
    setRequests(getOvertimeRequests().filter((r) => r.stage === 'hr' || r.status !== 'pending'))
    setApproveId(null)
    onDecided()
  }

  function handleReject() {
    if (!rejectId) return
    if (!rejectReason.trim()) return
    rejectOvertime(rejectId, 'admin', rejectReason.trim())
    setRequests(getOvertimeRequests().filter((r) => r.stage === 'hr' || r.status !== 'pending'))
    setRejectId(null)
    setRejectReason('')
    onDecided()
  }

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending-hr', label: 'Pending (HR)' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  return (
    <>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search requests..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: STATUS_OPTIONS
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '13%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Month" keyName="month" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Hours" keyName="hours" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={6} message="No overtime requests." />
            )}
            {page.map((r) => {
              const emp = getEmployeeById(r.employeeId)
              const statusClass = overtimeStatusTagClass(r.status)
              const photoUrl = emp ? '' : ''
              return (
                <tr key={r.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar name={emp?.name || r.employeeId} size={34} />
                      <div>
                        <strong>{emp?.name || r.employeeId}</strong>
                        <div className="muted small">{r.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{monthLabel(r.monthKey)}</td>
                  <td><strong>{r.hours}h</strong></td>
                  <td className="cell-ellipsis" title={r.reason || undefined}>{r.reason || <span className="muted">--</span>}</td>
                  <td>
                    <span className={`tag ${statusClass}`}>
                      {overtimeStatusLabel(r)}
                    </span>
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(r.id)}
                        aria-label="Request actions"
                      ><MoreHorizontal size={16} /></button>
                      {openMenuId === r.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={r.status !== 'pending'}
                            onClick={() => {
                              setApproveId(r.id)
                              closeMenu()
                            }}
                          >
                            <CircleCheck size={14} aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={r.status !== 'pending'}
                            onClick={() => {
                              setRejectId(r.id)
                              setRejectReason('')
                              closeMenu()
                            }}
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
          page={pageNum}
          totalPages={totalPages}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </div>

      {approveId && (
        <Modal onClose={() => setApproveId(null)} title="Confirm approval">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm approval</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setApproveId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Are you sure you want to approve this overtime request?
              The employee will be paid at twice their normal hourly rate.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={handleApprove}>Approve</button>
              <button type="button" className="btn btn-light" onClick={() => setApproveId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {rejectId && (
        <Modal onClose={() => setRejectId(null)} title="Reject request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Reject request</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setRejectId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <label className="field">
              <span>Reason</span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. No prior approval was given for these extra hours"
                rows={3}
                required
              />
            </label>
            <div className="button-row">
              <button type="button" className="btn btn-danger" disabled={!rejectReason.trim()} onClick={handleReject}>Reject</button>
              <button type="button" className="btn btn-light" onClick={() => setRejectId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---- Tab 2: Overtime Summary ----
function SummaryTab({ refresh }) {
  const months = listRecentMonths(6)
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey())
  const employees = useMemo(() => getEmployees().filter((e) => e.role === 'employee'), [refresh])

  const summary = useMemo(() => {
    const allRequests = getOvertimeRequestsByMonth(selectedMonth)
    return employees.map((emp) => {
      const approved = allRequests.filter((r) => r.employeeId === emp.id && r.status === 'approved')
      const totalHours = totalApprovedOvertimeHours(approved)
      const totalPay = totalHours > 0 ? calculateOvertimePay(emp, totalHours) : 0
      return {
        employee: emp,
        totalHours,
        totalPay
      }
    }).filter((s) => s.totalHours > 0)
  }, [selectedMonth, employees, refresh])

  const summaryTable = useTableControls(summary, {
    getSearchText: (s) => [s.employee.name, s.employee.id].join(' '),
    getSortValue: (s, key) => {
      if (key === 'name') return s.employee.name
      if (key === 'hours') return s.totalHours
      if (key === 'pay') return s.totalPay
      return s[key]
    },
    initialSortKey: 'pay',
    initialSortDir: 'desc'
  })

  const {
    items: summaryPage,
    page: summaryPageNum,
    totalPages: summaryTotalPages,
    total: summaryTotal,
    startIndex: summaryStart,
    endIndex: summaryEnd,
    setPage: setSummaryPage
  } = usePagination(summaryTable.rows)

  const grandTotalPay = summary.reduce((sum, s) => sum + s.totalPay, 0)

  return (
    <div className="card">
      <div className="section-head-row" style={{ marginTop: 0, marginBottom: 12 }}>
        <h3 className="section-title first">Monthly overtime summary</h3>
        <label className="field inline">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>

      {summary.length === 0 && (
        <p className="muted">No overtime recorded for {monthLabel(selectedMonth)}.</p>
      )}

      {summary.length > 0 && (
        <>
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '50%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead>
              <tr>
                <SortableTh label="Employee" keyName="name" sortKey={summaryTable.sortKey} sortDir={summaryTable.sortDir} onSort={summaryTable.toggleSort} />
                <SortableTh label="Approved hours" keyName="hours" sortKey={summaryTable.sortKey} sortDir={summaryTable.sortDir} onSort={summaryTable.toggleSort} />
                <SortableTh label="Overtime pay" keyName="pay" sortKey={summaryTable.sortKey} sortDir={summaryTable.sortDir} onSort={summaryTable.toggleSort} />
              </tr>
            </thead>
            <tbody>
              {summaryPage.map((s) => (
                <tr key={s.employee.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar name={s.employee.name} size={34} />
                      <div>
                        <strong>{s.employee.name}</strong>
                        <div className="muted small">{s.employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><strong>{s.totalHours}h</strong></td>
                  <td><strong>{formatRupees(s.totalPay)}</strong></td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" style={{ textAlign: 'right' }}><strong>Total</strong></td>
                <td><strong>{formatRupees(grandTotalPay)}</strong></td>
              </tr>
            </tbody>
          </table>
          <Pagination
            page={summaryPageNum}
            totalPages={summaryTotalPages}
            total={summaryTotal}
            startIndex={summaryStart}
            endIndex={summaryEnd}
            onPageChange={setSummaryPage}
          />
        </>
      )}
    </div>
  )
}
