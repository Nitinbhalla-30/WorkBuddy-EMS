import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addReimbursementMessage,
  getEmployeeById,
  getReimbursementsForEmployee,
  submitReimbursementClaimSynced,
  retrySyncReimbursementClaim,
  updateReimbursementClaim,
  withdrawReimbursementClaim
} from '../data/store.js'
import { formatDateDDMMYYYY } from '../utils/attendance.js'
import { REIMBURSEMENT_CATEGORIES } from '../data/sampleData.js'
import {
  categoryLabel,
  formatAmount,
  statusLabel,
  statusTagClass,
  canEditReimbursement,
  canWithdrawReimbursement
} from '../utils/reimbursements.js'
import ReimbursementForm from '../components/ReimbursementForm.jsx'
import ReimbursementClaimDetail from '../components/ReimbursementClaimDetail.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { Eye, MoreHorizontal, Pencil, ReceiptText, Trash2, Undo2, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]
const CATEGORY_FILTERS = [
  { value: 'all', label: 'All categories' },
  ...REIMBURSEMENT_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
]

export default function EmployeeReimbursements() {
  const { user } = useAuth()
  const [claims, setClaims] = useState(() => getReimbursementsForEmployee(user.id))
  const [showForm, setShowForm] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [withdrawId, setWithdrawId] = useState(null)
  const [message, setMessage] = useState('')
  // Holds a claim that was saved locally but failed to reach the server, so we
  // can show a "Failed — tap to retry" banner instead of silently losing it.
  const [syncError, setSyncError] = useState(null)
  const [retrying, setRetrying] = useState(false)

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
      status: (c, val) => {
        if (val === 'approved') return c.status === 'approved_unpaid' || c.status === 'paid'
        return c.status === val
      },
      category: (c, val) => c.category === val
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

  async function handleSubmit(data) {
    setMessage('')
    setSyncError(null)
    const result = await submitReimbursementClaimSynced({ employeeId: user.id, ...data })
    refreshClaims()
    setShowForm(false)
    if (result.ok) {
      setMessage(
        result.offline
          ? 'Your claim was saved on this device (no server configured).'
          : 'Your reimbursement claim was sent to HR for review.'
      )
    } else {
      setSyncError({ claim: result.claim, reason: result.error })
    }
  }

  async function handleRetry() {
    if (!syncError) return
    setRetrying(true)
    const res = await retrySyncReimbursementClaim(syncError.claim)
    setRetrying(false)
    if (res.ok) {
      setSyncError(null)
      setMessage('Saved. Your claim is now up to date for HR.')
      refreshClaims()
    } else {
      setSyncError({ ...syncError, reason: res.error })
    }
  }

  async function handleEdit(data) {
    if (!editClaim) return
    const res = await updateReimbursementClaim(editClaim.id, user.id, data)
    refreshClaims()
    setEditId(null)
    if (!res) return
    if (res.ok) {
      setSyncError(null)
      setMessage('Your reimbursement claim was updated.')
    } else {
      setMessage('')
      setSyncError({ claim: res.claim, reason: res.error })
    }
  }

  function handleWithdraw(claimId) {
    setWithdrawId(claimId)
  }

  async function confirmWithdraw() {
    if (!withdrawId) return
    const id = withdrawId
    const res = await withdrawReimbursementClaim(id, user.id)
    refreshClaims()
    if (openId === id) setOpenId(null)
    if (editId === id) setEditId(null)
    setWithdrawId(null)
    if (!res) return
    if (res.ok) {
      setSyncError(null)
      setMessage('Your reimbursement claim was withdrawn.')
    } else {
      setMessage('')
      setSyncError({ claim: res.claim, reason: res.error })
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
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <ReceiptText size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Reimbursements
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Submit and track your reimbursement claims</p>
        </div>
      </div>

      {message && <div className="info-box">{message}</div>}

      {syncError && (
        <div
          className="info-box"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <span>
            <strong>Your latest change is saved on this device but didn't reach the server.</strong>{' '}
            HR can't see the update yet. Check your internet connection and retry.
            {syncError.reason ? <span className="muted"> ({syncError.reason})</span> : null}
          </span>
          <button
            type="button"
            className="btn btn-tiny btn-primary"
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? 'Retrying…' : 'Retry now'}
          </button>
        </div>
      )}

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
              You can update the claim details at any time while it is still pending approval.
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
          <ReimbursementClaimDetail
            claim={openClaim}
            viewerRole="employee"
            viewerId={user.id}
            nameOf={nameOf}
            onReply={handleReply}
            onClose={() => setOpenId(null)}
          />
        </Modal>
      )}

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
              key: 'category',
              label: 'Category',
              value: table.filters.category || 'all',
              options: CATEGORY_FILTERS
            },
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: STATUS_FILTERS
            }
          ]}
          onFilterChange={table.setFilter}
          actions={
            <button
              className="btn btn-primary btn-tiny"
              onClick={() => setShowForm(true)}
            >
              Submit claim
            </button>
          }
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '13%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '32%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '8%' }} />
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
                <td>{formatDateDDMMYYYY(c.expenseDate)}</td>
                <td><strong>{formatAmount(c.amount)}</strong></td>
                <td className="cell-ellipsis" title={c.description || undefined}>
                  {c.description || <span className="muted">--</span>}
                </td>
                <td>{formatDateDDMMYYYY(c.appliedOn)}</td>
                <td>
                  <span className={`tag ${statusTagClass(c.status)}`}>
                    {statusLabel(c.status)}
                  </span>
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
                          <Eye size={14} aria-hidden="true" />
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
                          <Pencil size={14} aria-hidden="true" />
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
                          <Undo2 size={14} aria-hidden="true" />
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
