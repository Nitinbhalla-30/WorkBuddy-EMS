import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  approveReimbursementClaim,
  getEmployeeById,
  getReimbursements,
  markReimbursementPaid,
  rejectReimbursementClaim
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import {
  categoryLabel,
  formatAmount,
  statusLabel,
  statusTagClass
} from '../utils/reimbursements.js'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { useTableControls } from '../hooks/useTableControls.js'

export default function AdminReimbursements() {
  const { user } = useAuth()
  const [claims, setClaims] = useState(() => getReimbursements())
  const [filter, setFilter] = useState('pending')
  const [rejectId, setRejectId] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

  const tabFiltered = useMemo(() => {
    let list = [...claims]
    if (filter === 'approved_unpaid') {
      list = list.filter((c) => c.status === 'approved_unpaid')
    } else if (filter === 'paid') {
      list = list.filter((c) => c.status === 'paid')
    } else if (filter !== 'all') {
      list = list.filter((c) => c.status === filter)
    }
    return list
  }, [claims, filter])

  const table = useTableControls(tabFiltered, {
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
    initialSortDir: 'desc'
  })

  const pendingCount = claims.filter((c) => c.status === 'pending').length
  const unpaidCount = claims.filter((c) => c.status === 'approved_unpaid').length

  function refresh() {
    setClaims(getReimbursements())
  }

  function handleApprove(id) {
    approveReimbursementClaim(id, user.id)
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

  const tabs = [
    { key: 'pending', label: `Pending (${pendingCount})` },
    { key: 'approved_unpaid', label: `Approved — unpaid (${unpaidCount})` },
    { key: 'paid', label: 'Paid' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' }
  ]

  return (
    <div>
      <div className="page-head">
        <h2>Reimbursement Claims</h2>
        <span className="muted">{table.count} shown</span>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${filter === t.key ? 'tab-active' : ''}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search claims..."
        />
        <table className="table">
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
            {table.rows.map((c) => {
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
                    {c.status === 'pending' && (
                      <div className="button-row" style={{ marginTop: 0 }}>
                        <button
                          className="btn btn-tiny btn-primary"
                          onClick={() => handleApprove(c.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-tiny btn-light"
                          onClick={() => {
                            setRejectId(c.id)
                            setRejectNote('')
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {c.status === 'approved_unpaid' && (
                      <button
                        className="btn btn-tiny btn-primary"
                        onClick={() => handleMarkPaid(c.id)}
                      >
                        Mark paid
                      </button>
                    )}
                    {c.status !== 'pending' && c.status !== 'approved_unpaid' && (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rejectId && (
        <div className="card">
          <h3 className="section-title first">Reject claim</h3>
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
              className="btn btn-danger"
              disabled={!rejectNote.trim()}
              onClick={() => handleReject(rejectId)}
            >
              Confirm reject
            </button>
            <button
              className="btn btn-light"
              onClick={() => { setRejectId(null); setRejectNote('') }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="hint">
        Approve a claim to mark it as approved but not yet paid. Use Mark paid once the amount
        has been transferred to the employee.
      </p>
    </div>
  )
}
