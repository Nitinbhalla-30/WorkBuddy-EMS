import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  applyLeave,
  addLeaveMessage,
  getEmployeeById,
  getLeavesForEmployee,
  getSettings,
  updateLeave,
  withdrawLeave
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  countLeaveDays,
  leaveBalance,
  leaveTypeLabel,
  leaveSupportingDocuments,
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

const LEAVE_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
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
      status: (lv, val) => lv.status === val,
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
    applyLeave({ employeeId: user.id, ...data })
    refreshLeaves()
    setShowForm(false)
    setMessage('Your leave request was sent to HR/Admin.')
  }

  function handleEdit(data) {
    if (!editLeave) return
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
                For <strong>sick leave</strong>, upload a supporting document such as a medical certificate.
              </p>
              <LeaveForm
                onApply={handleApply}
                onCancel={() => setShowForm(false)}
              />
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
              >
                ✕
              </button>
            </div>
            <p className="hint first">
              You can change dates and details while the request is still pending.
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
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '10%' }} />
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
              <tr><td colSpan={8} className="muted">No leave requests match your filters.</td></tr>
            )}
            {leavesPage.map((lv) => {
              const decision = leaveDecisionText(lv, nameOf)
              return (
              <tr key={lv.id}>
                <td>{leaveTypeLabel(lv.type)}</td>
                <td>{formatDate(lv.fromDate)}</td>
                <td>{formatDate(lv.toDate)}</td>
                <td>{countLeaveDays(lv.fromDate, lv.toDate)}</td>
                <td>{lv.reason || <span className="muted">--</span>}</td>
                <td>
                  {lv.type === 'sick'
                    ? <LeaveDocumentList documents={leaveSupportingDocuments(lv)} emptyLabel="Not uploaded" />
                    : <span className="muted">--</span>}
                </td>
                <td>
                  <span className={`tag ${statusTagClass(lv.status)}`}>
                    {leaveStatusLabel(lv.status)}
                  </span>
                  {decision && (
                    <div className="muted small">{decision.line}</div>
                  )}
                  {decision?.reason && (
                    <div className="muted small">Reason: {decision.reason}</div>
                  )}
                </td>
                <td>
                  <div className="task-menu-container">
                    <button
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(lv.id)}
                      aria-label="Leave actions"
                    >
                      ⋯
                    </button>
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

      {openLeave && (
        <Modal onClose={closeLeaveModal} title="Leave request">
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {leaveTypeLabel(openLeave.type)} leave
                </h3>
                <div className="muted small">
                  {formatDate(openLeave.fromDate)} – {formatDate(openLeave.toDate)}
                  {' · '}{countLeaveDays(openLeave.fromDate, openLeave.toDate)} day(s)
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(openLeave.status)}`}>
                  {leaveStatusLabel(openLeave.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={closeLeaveModal}>✕</button>
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
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelWithdraw}>✕</button>
            </div>
            <p className="hint first">
              Are you sure you want to withdraw this leave request? This action cannot be undone.
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
