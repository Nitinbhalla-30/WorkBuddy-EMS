import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  applyLeave,
  addLeaveMessage,
  getEmployeeById,
  getLeavesForEmployee,
  getSettings,
  refreshStoreFromSupabase,
  STORE_KEYS,
  updateLeave,
  withdrawLeave
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  leaveBalance,
  leaveDays,
  leaveHalfLabel,
  leaveStageLabel,
  leaveTypeLabel,
  leaveTypeLabelWithPart,
  leaveSupportingDocuments,
  paidLeaveApplyError,
  statusTagClass,
  canEditLeave,
  canWithdrawLeave
} from '../utils/leaves.js'
import { leaveDecisionText, leaveStatusLabel } from '../utils/leaveReview.js'
import { getObservedCompanyHolidays } from '../utils/holidays.js'
import LeaveForm from '../components/LeaveForm.jsx'
import LeaveDocumentList from '../components/LeaveDocumentList.jsx'
import LeaveThread from '../components/LeaveThread.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { LEAVE_TYPES } from '../data/sampleData.js'
import { AlarmClock, Award, CalendarDays, Eye, HeartPulse, MoreHorizontal, Pencil, Sun, Timer, Trash2, Undo2, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

// Icon per leave type for the balance cards.
const BALANCE_ICONS = {
  casual: Sun,
  sick: HeartPulse,
  earned: Award,
  halfday: Timer,
  short: AlarmClock
}

const LEAVE_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending-manager', label: 'Pending (Manager)' },
  { value: 'pending-hr', label: 'Pending (HR)' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]
const LEAVE_TYPE_FILTERS = [
  { value: 'all', label: 'All types' },
  ...LEAVE_TYPES.map((t) => ({ value: t.key, label: t.label }))
]

// The employee's leave screen: balance, apply form, and their requests.
export default function EmployeeLeaves() {
  const { user } = useAuth()
  const settings = getSettings()

  const [leaves, setLeaves] = useState(() => getLeavesForEmployee(user.id))
  const [showForm, setShowForm] = useState(false)
  const [showHolidays, setShowHolidays] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [withdrawId, setWithdrawId] = useState(null)
  const [message, setMessage] = useState('')

  // Refresh from Supabase on mount to pick up any data that was saved
  // from another session or that failed to load initially. Only the two
  // collections this screen reads, not the whole store.
  useEffect(() => {
    let cancelled = false
    async function load() {
      await refreshStoreFromSupabase([STORE_KEYS.leaves, STORE_KEYS.settings])
      if (!cancelled) setLeaves(getLeavesForEmployee(user.id))
    }
    load()
    return () => { cancelled = true }
  }, [user.id])

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
      [leaveTypeLabelWithPart(lv), lv.fromDate, lv.toDate, lv.reason, lv.status].join(' '),
    getSortValue: (lv, key) => {
      if (key === 'days') return leaveDays(lv)
      if (key === 'type') return leaveTypeLabelWithPart(lv)
      return lv[key]
    },
    initialSortKey: 'fromDate',
    initialSortDir: 'desc',
    filterFns: {
      status: (lv, val) => {
        if (val === 'pending-manager') return lv.status === 'pending' && lv.stage === 'manager'
        if (val === 'pending-hr') return lv.status === 'pending' && lv.stage === 'hr'
        return lv.status === val
      },
      type: (lv, val) => lv.type === val
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

  const openLeave = leaves.find((lv) => lv.id === openId) || null
  const editLeave = leaves.find((lv) => lv.id === editId) || null

  function nameOf(id) {
    return getEmployeeById(id)?.name || id
  }

  function refreshLeaves() {
    setLeaves(getLeavesForEmployee(user.id))
  }

  function handleApply(data) {
    const err = paidLeaveApplyError({
      employee: user,
      leaves,
      settings,
      type: data.type,
      fromDate: data.fromDate,
      toDate: data.toDate
    })
    if (err) return err
    applyLeave({ employeeId: user.id, ...data })
    refreshLeaves()
    setShowForm(false)
    setMessage(user.managerId
      ? 'Your leave request was sent to your manager for approval.'
      : 'Your leave request was sent to HR/Admin.')
  }

  function handleEdit(data) {
    if (!editLeave) return
    const err = paidLeaveApplyError({
      employee: user,
      leaves,
      settings,
      type: data.type,
      fromDate: data.fromDate,
      toDate: data.toDate
    })
    if (err) return err
    updateLeave(editLeave.id, user.id, data)
    refreshLeaves()
    setEditId(null)
    setMessage('Your leave request was updated.')
  }

  function handleWithdraw(leaveId) {
    setWithdrawId(leaveId)
  }

  function confirmWithdraw() {
    if (withdrawId) {
      withdrawLeave(withdrawId, user.id)
      refreshLeaves()
      if (openId === withdrawId) setOpenId(null)
      if (editId === withdrawId) setEditId(null)
      setWithdrawId(null)
      setMessage('Your leave request was withdrawn.')
    }
  }

  function cancelWithdraw() {
    setWithdrawId(null)
  }

  function handleLeaveReply(text) {
    if (!openLeave) return
    addLeaveMessage(openLeave.id, { byId: user.id, byRole: 'employee', text })
    refreshLeaves()
  }

  function closeLeaveModal() {
    setOpenId(null)
  }

  function toggleMenu(leaveId) {
    setOpenMenuId(openMenuId === leaveId ? null : leaveId)
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

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <CalendarDays size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Leaves
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Apply for leave, track approvals, and view your leave balance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="muted">Year {currentYear}</span>
          <button
            className="btn btn-primary btn-tiny"
            onClick={() => setShowHolidays(true)}
          >
            Company Holidays
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
               aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              These are the official company holidays. You do not need to mark leave for these days.
              Any date not listed here is a regular working day.
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
                 aria-label="Close"><X size={15} /></button>
              </div>
              <LeaveForm
                onApply={handleApply}
                onCancel={() => setShowForm(false)}
              />
              <p className="hint">
                Weekends are excluded. Sick leave requires a medical certificate. Paid leave requires balance and completed probation; manager and HR approval required.
              </p>
            </div>
        </Modal>
      )}

      {editLeave && (
        <Modal onClose={() => setEditId(null)} title="Edit leave request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit leave request</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setEditId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              You can update the dates or details at any time while this request is still pending.
            </p>
            <LeaveForm
              key={editLeave.id}
              initial={editLeave}
              submitLabel="Save changes"
              onApply={handleEdit}
              onCancel={() => setEditId(null)}
            />
          </div>
        </Modal>
      )}

      {/* Balance cards */}
      <div className="stat-grid">
        {balance.map((b) => {
          const Icon = BALANCE_ICONS[b.key] || CalendarDays
          const ratio = b.allowed > 0 ? b.remaining / b.allowed : 0
          const tone = b.remaining === 0 ? ' stat-bad' : ratio <= 0.25 ? ' stat-warn' : ''
          const isActive = table.filters.type === b.key
          return (
            <div
              className={`stat-card${tone}${isActive ? ' task-status-stat-card-active' : ''}`}
              key={b.key}
              onClick={() => table.setFilter('type', isActive ? 'all' : b.key)}
              role="button"
              tabIndex={0}
              aria-label={`Filter by ${b.label} leave`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  table.setFilter('type', isActive ? 'all' : b.key)
                }
              }}
            >
              <span className="stat-chip"><Icon size={18} aria-hidden="true" /></span>
              <div className="stat-num">{b.remaining}</div>
              <div className="stat-label">
                {b.label.toLowerCase().endsWith('leave') ? b.label : `${b.label} leave`} left{' '}
                <span className="muted">/ {b.allowed}</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* My requests */}
      <h3 className="section-title">My requests</h3>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={leavesTotal}
          startIndex={leavesStart}
          endIndex={leavesEnd}
          placeholder="Search leaves..."
          filters={[
            {
              key: 'type',
              label: 'Leave type',
              value: table.filters.type || 'all',
              options: LEAVE_TYPE_FILTERS
            },
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: LEAVE_STATUS_FILTERS
            }
          ]}
          onFilterChange={table.setFilter}
          actions={
            <>
              {table.filters.type && table.filters.type !== 'all' && (
                <button
                  type="button"
                  className="quick-filter-chip"
                  onClick={() => table.setFilter('type', 'all')}
                  aria-label={`Clear ${table.filters.type} filter`}
                >
                  {LEAVE_TYPES.find((t) => t.key === table.filters.type)?.label || table.filters.type}
                  <X size={13} aria-hidden="true" />
                </button>
              )}
              <button
                className="btn btn-primary btn-tiny"
                onClick={() => setShowForm(true)}
              >
                Apply for leave
              </button>
            </>
          }
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="From" keyName="fromDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="To" keyName="toDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Days" keyName="days" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Supporting doc</th>
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={8} message="No leave requests match your filters." />
            )}
            {leavesPage.map((lv) => {
              const docs = lv.type === 'sick' ? leaveSupportingDocuments(lv) : []
              const docNames = docs.map((d) => d.name).join(', ')
              return (
              <tr key={lv.id}>
                <td>{leaveTypeLabelWithPart(lv)}</td>
                <td>{formatDate(lv.fromDate)}</td>
                <td>{formatDate(lv.toDate)}</td>
                <td>{leaveDays(lv)}</td>
                <td className="cell-ellipsis" title={lv.reason || undefined}>{lv.reason || <span className="muted">--</span>}</td>
                <td className="cell-ellipsis" title={docNames || undefined}>
                  {lv.type === 'sick'
                    ? (docNames || <span className="muted">Not uploaded</span>)
                    : <span className="muted">--</span>}
                </td>
                <td>
                  {/* Only the status tag here; stage and decision details
                      are shown in the Open modal from the Action menu. */}
                  <span className={`tag ${statusTagClass(lv.status)}`}>
                    {leaveStatusLabel(lv)}
                  </span>
                </td>
                <td>
                  <div className="task-menu-container">
                    <button
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(lv.id)}
                      aria-label="Leave actions"
                     ><MoreHorizontal size={16} /></button>
                    {openMenuId === lv.id && (
                      <div className="task-menu-dropdown">
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            setOpenId(lv.id)
                            closeMenu()
                          }}
                        >
                          <Eye size={14} aria-hidden="true" />
                          Open
                        </button>
                        <button
                          type="button"
                          className="task-menu-item"
                          disabled={!canEditLeave(lv)}
                          onClick={() => {
                            setEditId(lv.id)
                            setOpenId(null)
                            closeMenu()
                          }}
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="task-menu-item task-menu-item-danger"
                          disabled={!canWithdrawLeave(lv)}
                          onClick={() => {
                            handleWithdraw(lv.id)
                          }}
                        >
                          <Undo2 size={14} aria-hidden="true" />
                          Withdraw
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )})}
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

      <p className="hint">
        <strong>Quick filters:</strong> click a leave balance card above to show only requests of that type; click again to see all.
        Your leave balance updates as requests are approved or rejected. Paid leave needs your
        manager&rsquo;s approval first, then HR&rsquo;s final sign-off. Sick leave does not
        require a balance — just upload a medical certificate if asked.
      </p>

      {openLeave && (
        <Modal onClose={closeLeaveModal} title="Leave request">
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {leaveTypeLabel(openLeave.type)} leave
                </h3>
                <div className="muted small">
                  {openLeave.fromDate === openLeave.toDate
                    ? formatDate(openLeave.fromDate)
                    : `${formatDate(openLeave.fromDate)} – ${formatDate(openLeave.toDate)}`}
                  {leaveHalfLabel(openLeave) && ` · ${leaveHalfLabel(openLeave)}`}
                  {' · '}{leaveDays(openLeave)} day(s)
                  {leaveStageLabel(openLeave) && ` · ${leaveStageLabel(openLeave)}`}
                  {openLeave.managerStatus === 'approved' && ' · Manager approved'}
                  {openLeave.managerStatus === 'escalated' && ' · Auto-escalated to HR'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(openLeave.status)}`}>
                  {leaveStatusLabel(openLeave)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={closeLeaveModal} aria-label="Close"><X size={15} /></button>
              </div>
            </div>

            {openLeave.reason && (
              <p className="hint first"><strong>Reason:</strong> {openLeave.reason}</p>
            )}

            {openLeave.type === 'sick' && (
              <div className="first">
                <div className="muted small" style={{ marginBottom: '6px' }}>Supporting document</div>
                <LeaveDocumentList documents={leaveSupportingDocuments(openLeave)} emptyLabel="Not uploaded" />
              </div>
            )}

            {(() => {
              const decision = leaveDecisionText(openLeave, nameOf)
              if (!decision) return null
              return (
                <div className={`info-box${openLeave.status === 'rejected' ? '' : ''}`}>
                  <strong>{decision.line}</strong>
                  {decision.reason && (
                    <div style={{ marginTop: '6px' }}>Rejection reason: {decision.reason}</div>
                  )}
                </div>
              )
            })()}

            <LeaveThread
              leave={openLeave}
              viewerRole="employee"
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleLeaveReply}
              onClose={closeLeaveModal}
            />
          </div>
        </Modal>
      )}

      {withdrawId && (
        <Modal onClose={cancelWithdraw} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelWithdraw} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will cancel your leave request permanently. You will not be able to restore it afterwards.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmWithdraw}>
                Withdraw
              </button>
              <button type="button" className="btn btn-light" onClick={cancelWithdraw}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
