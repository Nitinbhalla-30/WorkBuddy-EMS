import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addReimbursementMessage,
  getEmployeeById,
  getReimbursementsForEmployee,
  submitReimbursementClaim,
  updateReimbursementClaim,
  withdrawReimbursementClaim
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  categoryLabel,
  formatAmount,
  reimbursementSummary,
  statusLabel,
  statusTagClass,
  canEditReimbursement,
  canWithdrawReimbursement
} from '../utils/reimbursements.js'
import ReimbursementForm from '../components/ReimbursementForm.jsx'
import ReimbursementThread from '../components/ReimbursementThread.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { CircleCheck, Hourglass, MoreHorizontal, Wallet, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'approved_unpaid', label: 'Approved — yet to be paid' },
  { value: 'paid', label: 'Approved and paid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]
const SUBMITTED_DURING_FILTERS = [
  { value: 'all', label: 'All time' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'ytd', label: 'Year to Date' }
]

// Whether a claim's submitted-on date (YYYY-MM-DD) falls inside the chosen
// "Submitted During" window.
function inSubmittedDuring(dateKey, val) {
  if (!val || val === 'all') return true
  if (!dateKey) return false
  const d = new Date(`${dateKey}T00:00:00`)
  const now = new Date()
  if (val === 'this-month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }
  if (val === 'last-month') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth()
  }
  if (val === 'ytd') return d.getFullYear() === now.getFullYear()
  return true
}

export default function EmployeeReimbursements() {
  const { user } = useAuth()
  const [claims, setClaims] = useState(() => getReimbursementsForEmployee(user.id))
  const [showForm, setShowForm] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [withdrawId, setWithdrawId] = useState(null)
  const [message, setMessage] = useState('')

  const summary = useMemo(() => reimbursementSummary(claims), [claims])
  const openClaim = claims.find((c) => c.id === openId) || null
  const editClaim = claims.find((c) => c.id === editId) || null

  function nameOf(id) {
    return getEmployeeById(id)?.name || id
  }

  const table = useTableControls(claims, {
    getSearchText: (c) =>
      [categoryLabel(c.category), c.expenseDate, c.description, c.amount, statusLabel(c.status)].join(' '),
    getSortValue: (c, key) => {
      if (key === 'category') return categoryLabel(c.category)
      if (key === 'amount') return c.amount
      if (key === 'status') return c.status
      return c[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc',
    filterFns: {
      status: (c, val) => c.status === val,
      submittedDuring: (c, val) => inSubmittedDuring(c.appliedOn, val)
    }
  })

  const {
    items: claimsPage,
    page,
    totalPages,
    total,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows)

  function refreshClaims() {
    setClaims(getReimbursementsForEmployee(user.id))
  }

  function handleReply(text) {
    if (!openClaim) return
    addReimbursementMessage(openClaim.id, {
      byId: user.id,
      byRole: 'employee',
      text
    })
    refreshClaims()
  }

  function handleSubmit(data) {
    submitReimbursementClaim({ employeeId: user.id, ...data })
    refreshClaims()
    setShowForm(false)
    setMessage('Your reimbursement claim was sent to HR for review.')
  }

  function handleEdit(data) {
    if (!editClaim) return
    updateReimbursementClaim(editClaim.id, user.id, data)
    refreshClaims()
    setEditId(null)
    setMessage('Your reimbursement claim was updated.')
  }

  function handleWithdraw(claimId) {
    setWithdrawId(claimId)
  }

  function confirmWithdraw() {
    if (withdrawId) {
      withdrawReimbursementClaim(withdrawId, user.id)
      refreshClaims()
      if (openId === withdrawId) setOpenId(null)
      if (editId === withdrawId) setEditId(null)
      setWithdrawId(null)
      setMessage('Your reimbursement claim was withdrawn.')
    }
  }

  function cancelWithdraw() {
    setWithdrawId(null)
  }

  function toggleMenu(claimId) {
    setOpenMenuId(openMenuId === claimId ? null : claimId)
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
        <h2>My Reimbursements</h2>
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => setShowForm(true)}
        >
          Submit claim
        </button>
      </div>

      {message && <div className="info-box">{message}</div>}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Submit reimbursement claim">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Submit reimbursement claim</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setShowForm(false)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Claim expenses the company should cover — travel, conveyance, meals, and similar costs.
            </p>
            <ReimbursementForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </Modal>
      )}

      {editClaim && (
        <Modal onClose={() => setEditId(null)} title="Edit reimbursement claim">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit reimbursement claim</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setEditId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              You can change claim details while it is still pending approval.
            </p>
            <ReimbursementForm
              key={editClaim.id}
              initial={editClaim}
              submitLabel="Save changes"
              onSubmit={handleEdit}
              onCancel={() => setEditId(null)}
            />
          </div>
        </Modal>
      )}

      {openClaim && (
        <Modal onClose={() => setOpenId(null)} title="Reimbursement claim">
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {categoryLabel(openClaim.category)}
                </h3>
                <div className="muted small">
                  Submitted {formatDate(openClaim.appliedOn)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(openClaim.status)}`}>
                  {statusLabel(openClaim.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={() => setOpenId(null)} aria-label="Close"><X size={15} /></button>
              </div>
            </div>
            <ul className="lunch-policy-list first">
              <li>
                <span className="muted">Expense date</span>
                <strong>{formatDate(openClaim.expenseDate)}</strong>
              </li>
              <li>
                <span className="muted">Amount</span>
                <strong>{formatAmount(openClaim.amount)}</strong>
              </li>
            </ul>
            {openClaim.description && (
              <p className="hint"><strong>Description:</strong> {openClaim.description}</p>
            )}
            {openClaim.status === 'rejected' && openClaim.reviewNote && (
              <div className="info-box">Reason: {openClaim.reviewNote}</div>
            )}
            <ReimbursementThread
              claim={openClaim}
              viewerRole="employee"
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleReply}
              onClose={() => setOpenId(null)}
            />
          </div>
        </Modal>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-chip"><Hourglass size={18} aria-hidden="true" /></span>
          <div className="stat-num">{summary.pendingCount}</div>
          <div className="stat-label">
            Pending approval
            <span className="muted"> · {formatAmount(summary.pendingAmount)}</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-chip"><Wallet size={18} aria-hidden="true" /></span>
          <div className="stat-num">{summary.approvedUnpaidCount}</div>
          <div className="stat-label">
            Approved — yet to be paid
            <span className="muted"> · {formatAmount(summary.approvedUnpaidAmount)}</span>
          </div>
        </div>
        <div className="stat-card stat-good">
          <span className="stat-chip"><CircleCheck size={18} aria-hidden="true" /></span>
          <div className="stat-num">{formatAmount(summary.paidThisYear)}</div>
          <div className="stat-label">Paid this year</div>
        </div>
      </div>

      <h3 className="section-title">My claims</h3>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search claims..."
          filters={[
            {
              key: 'submittedDuring',
              label: 'Submitted During',
              value: table.filters.submittedDuring || 'all',
              options: SUBMITTED_DURING_FILTERS
            },
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: STATUS_FILTERS
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '13%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '5%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Expense date" keyName="expenseDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Amount" keyName="amount" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Submitted" keyName="appliedOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={7} message="No claims match your filters." />
            )}
            {claimsPage.map((c) => (
              <tr key={c.id}>
                <td>{categoryLabel(c.category)}</td>
                <td>{formatDate(c.expenseDate)}</td>
                <td><strong>{formatAmount(c.amount)}</strong></td>
                <td>{c.description || <span className="muted">--</span>}</td>
                <td>{formatDate(c.appliedOn)}</td>
                <td>
                  <span className={`tag ${statusTagClass(c.status)}`}>
                    {statusLabel(c.status)}
                  </span>
                  {c.status === 'paid' && c.paidOn && (
                    <div className="muted small">Paid {formatDate(c.paidOn)}</div>
                  )}
                  {c.status === 'rejected' && c.reviewNote && (
                    <div className="muted small">{c.reviewNote}</div>
                  )}
                </td>
                <td>
                  <div className="task-menu-container">
                    <button
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(c.id)}
                      aria-label="Claim actions"
                     ><MoreHorizontal size={16} /></button>
                    {openMenuId === c.id && (
                      <div className="task-menu-dropdown">
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            setOpenId(c.id)
                            closeMenu()
                          }}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="task-menu-item"
                          disabled={!canEditReimbursement(c)}
                          onClick={() => {
                            setEditId(c.id)
                            setOpenId(null)
                            closeMenu()
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="task-menu-item task-menu-item-danger"
                          disabled={!canWithdrawReimbursement(c)}
                          onClick={() => {
                            handleWithdraw(c.id)
                          }}
                        >
                          Withdraw
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </div>

      {withdrawId && (
        <Modal onClose={cancelWithdraw} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelWithdraw} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Are you sure you want to withdraw this reimbursement claim? This action cannot be undone.
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

      <p className="hint">
        Approved claims are paid through salary or bank transfer. You can edit or withdraw
        a claim while it is still pending approval.
      </p>
    </div>
  )
}
