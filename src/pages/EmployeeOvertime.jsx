import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getOvertimeRequestsForEmployee,
  requestOvertime,
  withdrawOvertimeRequest,
  updateOvertimeRequest
} from '../data/store.js'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableEmpty from '../components/TableEmpty.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { formatDate } from '../utils/attendance.js'
import { monthKey, monthLabel, listRecentMonths } from '../utils/salary.js'
import {
  overtimeStatusLabel,
  overtimeStatusTagClass,
  calculateOvertimePay
} from '../utils/overtime.js'
import { MoreHorizontal, Pencil, Plus, Timer, Undo2, X } from 'lucide-react'

export default function EmployeeOvertime() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)

  function bump() { setRefresh((n) => n + 1) }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Timer size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Overtime
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Log extra hours worked and track your overtime requests</p>
        </div>
      </div>

      <OvertimeTable userId={user.id} refresh={refresh} bump={bump} showForm={showForm} setShowForm={setShowForm} />

      <p className="hint">
        Log the extra hours you worked beyond your shift. Your manager will review first, and if approved,
        it goes to HR for final approval. Approved overtime is paid at twice your normal hourly rate and added to your monthly salary.
      </p>
    </div>
  )
}

// ---- Overtime Table ----
function OvertimeTable({ userId, refresh, bump, showForm, setShowForm }) {
  const [requests, setRequests] = useState(() => getOvertimeRequestsForEmployee(userId))
  const [editId, setEditId] = useState(null)
  const [withdrawId, setWithdrawId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [message, setMessage] = useState('')

  const table = useTableControls(requests, {
    getSearchText: (r) => [r.monthKey, r.reason, r.status].join(' '),
    getSortValue: (r, key) => {
      if (key === 'month') return r.monthKey
      if (key === 'status') return r.status
      return r[key]
    },
    initialSortKey: 'requestedOn',
    initialSortDir: 'desc',
    filterFns: {
      status: (r, val) => {
        if (val === 'all') return true
        if (val === 'pending-manager') return r.status === 'pending' && r.stage === 'manager'
        if (val === 'pending-hr') return r.status === 'pending' && r.stage === 'hr'
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

  function refreshRequests() {
    setRequests(getOvertimeRequestsForEmployee(userId))
  }

  useEffect(() => {
    refreshRequests()
  }, [refresh])

  function handleWithdraw() {
    if (!withdrawId) return
    withdrawOvertimeRequest(withdrawId, userId)
    refreshRequests()
    setWithdrawId(null)
    setMessage('Your overtime request was withdrawn.')
    setTimeout(() => setMessage(''), 4000)
  }

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending-manager', label: 'Pending (Manager)' },
    { value: 'pending-hr', label: 'Pending (HR)' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ]

  return (
    <>
      {message && <div className="info-box" style={{ marginBottom: '16px' }}>{message}</div>}

      {showForm && (
        <SubmitModal
          userId={userId}
          onClose={() => setShowForm(false)}
          onSubmitted={() => {
            bump()
            setShowForm(false)
            setMessage('Your overtime request was submitted. Your manager will review it.')
            setTimeout(() => setMessage(''), 4000)
          }}
        />
      )}

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
          actions={
            <button
              className="btn btn-primary btn-tiny"
              onClick={() => setShowForm(true)}
            >
              <Plus size={14} style={{ marginRight: 4 }} />Add request
            </button>
          }
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Month" keyName="month" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Hours" keyName="hours" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={5} message="No overtime requests yet." />
            )}
            {page.map((r) => {
              const statusClass = overtimeStatusTagClass(r.status)
              return (
                <tr key={r.id}>
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
                            disabled={r.status !== 'pending' || r.managerStatus === 'approved' || r.managerStatus === 'rejected'}
                            onClick={() => {
                              setEditId(r)
                              closeMenu()
                            }}
                          >
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={r.status !== 'pending'}
                            onClick={() => {
                              setWithdrawId(r.id)
                              closeMenu()
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

      {editId && (
        <EditModal
          request={editId}
          onClose={() => setEditId(null)}
          onSaved={() => {
            refreshRequests()
            setEditId(null)
            setMessage('Your overtime request was updated.')
            setTimeout(() => setMessage(''), 4000)
          }}
        />
      )}

      {withdrawId && (
        <Modal onClose={() => setWithdrawId(null)} title="Withdraw request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Withdraw request</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setWithdrawId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Are you sure you want to withdraw this overtime request? This cannot be undone.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={handleWithdraw}>Withdraw</button>
              <button type="button" className="btn btn-light" onClick={() => setWithdrawId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---- Edit Modal ----
function EditModal({ request, onClose, onSaved }) {
  const [form, setForm] = useState({
    hours: request.hours,
    reason: request.reason
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.hours || Number(form.hours) <= 0) return
    updateOvertimeRequest(request.id, request.employeeId, {
      hours: Number(form.hours),
      reason: form.reason.trim()
    })
    onSaved()
  }

  return (
    <Modal onClose={onClose} title="Edit overtime request">
      <div className="modal-form">
        <div className="modal-header">
          <h3 className="section-title first">Edit overtime request</h3>
          <button type="button" className="btn btn-tiny btn-light" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <label className="field">
          <span>Month</span>
          <input value={monthLabel(request.monthKey)} disabled />
        </label>
        <label className="field">
          <span>Extra hours worked</span>
          <input
            type="number"
            min="0.5"
            max="50"
            step="0.5"
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Reason</span>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            required
          />
        </label>
        <div className="button-row">
          <button type="submit" className="btn btn-primary" onClick={handleSubmit} disabled={!form.hours || Number(form.hours) <= 0}>
            Save changes
          </button>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

// ---- Submit Modal ----
function SubmitModal({ userId, onClose, onSubmitted }) {
  const months = listRecentMonths(3)
  const [form, setForm] = useState({
    monthKey: monthKey(),
    hours: '',
    reason: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.hours || Number(form.hours) <= 0) return
    requestOvertime(userId, form.monthKey, Number(form.hours), form.reason.trim())
    onSubmitted()
  }

  return (
    <Modal onClose={onClose} title="Submit overtime request">
      <div className="modal-form">
        <div className="modal-header">
          <h3 className="section-title first">Submit overtime request</h3>
          <button type="button" className="btn btn-tiny btn-light" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <label className="field">
              <span>Month</span>
              <select value={form.monthKey} onChange={(e) => setForm({ ...form, monthKey: e.target.value })}>
                {months.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Extra hours worked</span>
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                placeholder="e.g. 4"
                required
              />
            </label>
          </div>
          <label className="field">
            <span>Reason</span>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Stayed late to finish the monthly report"
              rows={3}
              required
            />
          </label>
          <div className="button-row">
            <button type="submit" className="btn btn-primary" disabled={!form.hours || Number(form.hours) <= 0}>
              <Timer size={14} style={{ marginRight: 4 }} />Submit request
            </button>
            <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
