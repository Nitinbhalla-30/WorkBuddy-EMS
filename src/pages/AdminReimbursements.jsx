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
import { REIMBURSEMENT_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
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
import ReimbursementThread from '../components/ReimbursementThread.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'

const STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...REIMBURSEMENT_STATUSES.map((s) => ({ value: s.key, label: s.label }))
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
      status: (c, val) => c.status === val
    },
    initialFilters: { status: 'pending' }
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
        <h2>Reimbursement Claims</h2>
        <span className="muted">{table.count} shown</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search claims..."
          filters={[{
            key: 'status',
            label: 'Status',
            value: table.filters.status || 'all',
            options: STATUS_FILTER_OPTS
          }]}
          onFilterChange={table.setFilter}
        />
        <table className="table table-compact">
          <colgroup>
            <col style={{ width: '11.65%' }} />
            <col style={{ width: '11.6%' }} />
            <col style={{ width: '11.6%' }} />
            <col style={{ width: '11.6%' }} />
            <col style={{ width: '21.35%' }} />
            <col style={{ width: '11.6%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '5.6%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Expense date" keyName="expenseDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Amount" keyName="amount" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Submitted" keyName="appliedOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={8} className="muted">No claims match your filters.</td></tr>
            )}
            {claimsPage.map((c) => {
              const emp = getEmployeeById(c.employeeId)
              return (
                <tr key={c.id}>
                  <td>
                    <strong>{emp?.name || c.employeeId}</strong>
                    <div className="muted small">{emp?.department || '--'}</div>
                  </td>
                  <td>{categoryLabel(c.category)}</td>
                  <td>{formatDate(c.expenseDate)}</td>
                  <td><strong>{formatAmount(c.amount)}</strong></td>
                  <td className="cell-ellipsis" title={c.description || ''}>
                    {c.description || <span className="muted">--</span>}
                  </td>
                  <td>{formatDate(c.appliedOn)}</td>
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
                      >
                        ⋯
                      </button>
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
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  {categoryLabel(openClaim.category)}
                </h3>
                <div className="muted small">
                  {getEmployeeById(openClaim.employeeId)?.name || openClaim.employeeId}
                  {' · '}Submitted {formatDate(openClaim.appliedOn)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(openClaim.status)}`}>
                  {statusLabel(openClaim.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={() => setOpenId(null)}>✕</button>
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
              {openClaim.status === 'paid' && openClaim.paidOn && (
                <li>
                  <span className="muted">Paid on</span>
                  <strong>{formatDate(openClaim.paidOn)}</strong>
                </li>
              )}
            </ul>
            {openClaim.description && (
              <p className="hint"><strong>Description:</strong> {openClaim.description}</p>
            )}
            {openClaim.status === 'rejected' && openClaim.reviewNote && (
              <div className="info-box">Reason: {openClaim.reviewNote}</div>
            )}

            {openClaim.status === 'pending' && (
              <div className="button-row first">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setApproveId(openClaim.id)
                    setOpenId(null)
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setRejectId(openClaim.id)
                    setRejectNote('')
                    setOpenId(null)
                  }}
                >
                  Reject
                </button>
              </div>
            )}

            <ReimbursementThread
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
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setApproveId(null)}>✕</button>
            </div>
            <p className="hint first">Are you sure you want to approve this reimbursement claim?</p>
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
              <button type="button" className="btn btn-tiny btn-light" onClick={() => { setRejectId(null); setRejectNote('') }}>✕</button>
            </div>
            <p className="hint first">Please give a short reason so the employee knows why the claim was rejected.</p>
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
        Approve a claim to mark it as approved but not yet paid. Use Mark paid once the amount
        has been transferred to the employee.
      </p>
    </div>
  )
}
