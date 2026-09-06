import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addReimbursementMessage,
  approveReimbursementClaim,
  getEmployeeById,
  getReimbursements,
  markReimbursementPaid,
  rejectReimbursementClaim
} from '../data/store.js'
import { REIMBURSEMENT_CATEGORIES } from '../data/sampleData.js'
import { formatDateDDMMYYYY } from '../utils/attendance.js'
import {
  categoryLabel,
  formatAmount,
  statusLabel,
  statusTagClass
} from '../utils/reimbursements.js'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import ReimbursementClaimDetail from '../components/ReimbursementClaimDetail.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { CircleCheck, CircleX, Eye, ReceiptText, MoreVertical, Banknote, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'

// The status column groups both approved states under a single "Approved"
// label (statusLabel) and color, so the filter matches that: one "Approved"
// option that includes both yet-to-pay and paid claims.
const STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]
const CATEGORY_FILTER_OPTS = [
  { value: 'all', label: 'All categories' },
  ...REIMBURSEMENT_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
]

export default function AdminReimbursements() {
  const { user } = useAuth()
  const [claims, setClaims] = useState(() => getReimbursements())
  const [rejectId, setRejectId] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [approveId, setApproveId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openId, setOpenId] = useState(null)

  const table = useTableControls(claims, {
    getSearchText: (c) => {
      const emp = getEmployeeById(c.employeeId)
      return [
        emp?.name, emp?.department, categoryLabel(c.category),
        c.expenseDate, c.description, c.amount, statusLabel(c.status)
      ].join(' ')
    },
    getSortValue: (c, key) => {
      if (key === 'employee') return getEmployeeById(c.employeeId)?.name || c.employeeId
      if (key === 'category') return categoryLabel(c.category)
      if (key === 'amount') return c.amount
      if (key === 'status') return c.status
      return c[key]
    },
    initialSortKey: 'appliedOn',
    initialSortDir: 'desc',
    filterFns: {
      category: (c, val) => c.category === val,
      status: (c, val) => {
        if (val === 'approved') return c.status === 'approved_unpaid' || c.status === 'paid'
        return c.status === val
      }
    }
  })
  const {
    items: claimsPage,
    page: claimsPageNum,
    totalPages: claimsTotalPages,
    total: claimsTotal,
    startIndex: claimsStart,
    endIndex: claimsEnd,
    setPage: setClaimsPage
  } = usePagination(table.rows)

  function refresh() {
    setClaims(getReimbursements())
  }

  const openClaim = openId ? claims.find((c) => c.id === openId) : null

  function nameOf(id) {
    return getEmployeeById(id)?.name || id
  }

  function handleReply(text) {
    if (!openClaim) return
    addReimbursementMessage(openClaim.id, {
      byId: user.id,
      byRole: 'admin',
      text
    })
    refresh()
  }

  function handleApprove(id) {
    approveReimbursementClaim(id, user.id)
    setApproveId(null)
    refresh()
  }

  function handleReject(id) {
    if (!rejectNote.trim()) return
    rejectReimbursementClaim(id, user.id, rejectNote.trim())
    setRejectId(null)
    setRejectNote('')
    refresh()
  }

  function handleMarkPaid(id) {
    markReimbursementPaid(id, user.id)
    refresh()
  }

  function toggleMenu(claimId) {
    setOpenMenuId(openMenuId === claimId ? null : claimId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  // Close menu when clicking outside
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
            <ReceiptText size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Reimbursement Claims
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Approve or reject employee reimbursement claims</p>
        </div>
        <span className="muted">{table.count} shown</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search claims..."
          filters={[
            {
              key: 'category',
              label: 'Category',
              value: table.filters.category || 'all',
              options: CATEGORY_FILTER_OPTS
            },
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: STATUS_FILTER_OPTS
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table table-compact" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '5%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Expense date" keyName="expenseDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Amount" keyName="amount" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Submitted" keyName="appliedOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={8} message="No claims match your filters." />
            )}
            {claimsPage.map((c) => {
              const emp = getEmployeeById(c.employeeId)
              return (
                <tr key={c.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar src={emp?.photoUrl} name={emp?.name} size={34} />
                      <div>
                        <strong>{emp?.name || c.employeeId}</strong>
                        <div className="muted small">{emp?.department || '--'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{categoryLabel(c.category)}</td>
                  <td>{formatDateDDMMYYYY(c.expenseDate)}</td>
                  <td><strong>{formatAmount(c.amount)}</strong></td>
                  <td className="cell-ellipsis" title={c.description || ''}>
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
                       ><MoreVertical size={16} /></button>
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
                          {c.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                className="task-menu-item"
                                onClick={() => {
                                  setApproveId(c.id)
                                  closeMenu()
                                }}
                              >
                                <CircleCheck size={14} aria-hidden="true" />
                                Approve
                              </button>
                              <button
                                type="button"
                                className="task-menu-item task-menu-item-danger"
                                onClick={() => {
                                  setRejectId(c.id)
                                  setRejectNote('')
                                  closeMenu()
                                }}
                              >
                                <CircleX size={14} aria-hidden="true" />
                                Reject
                              </button>
                            </>
                          )}
                          {c.status === 'approved_unpaid' && (
                            <button
                              type="button"
                              className="task-menu-item"
                              onClick={() => {
                                handleMarkPaid(c.id)
                                closeMenu()
                              }}
                            >
                              <Banknote size={14} aria-hidden="true" />
                              Mark paid
                            </button>
                          )}
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
          page={claimsPageNum}
          totalPages={claimsTotalPages}
          total={claimsTotal}
          startIndex={claimsStart}
          endIndex={claimsEnd}
          onPageChange={setClaimsPage}
        />
      </div>

      {openClaim && (
        <Modal onClose={() => setOpenId(null)} title="Reimbursement claim">
          <div className="modal-form modal-form-wide">
            <ReimbursementClaimDetail
              claim={openClaim}
              viewerRole="admin"
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleReply}
              onClose={() => setOpenId(null)}
            />
          </div>
        </Modal>
      )}

      {approveId && (
        <Modal onClose={() => setApproveId(null)} title="Confirm approval">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Approve claim</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setApproveId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">Are you sure you want to approve this reimbursement claim? The employee will be notified.</p>
            <div className="button-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleApprove(approveId)}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setApproveId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {rejectId && (
        <Modal onClose={() => { setRejectId(null); setRejectNote('') }} title="Reject claim">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Reject claim</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => { setRejectId(null); setRejectNote('') }} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">Please provide a short reason so the employee understands why the claim was rejected.</p>
            <label className="field">
              <span>Reason</span>
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Receipt not attached / not a reimbursable expense"
              />
            </label>
            <div className="button-row">
              <button
                type="button"
                className="btn btn-danger"
                disabled={!rejectNote.trim()}
                onClick={() => handleReject(rejectId)}
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
        </Modal>
      )}

      <p className="hint">
        Approve a claim to mark it as accepted but not yet paid. Use &ldquo;Mark paid&rdquo;
        once the amount has been transferred to the employee.
      </p>
    </div>
  )
}
