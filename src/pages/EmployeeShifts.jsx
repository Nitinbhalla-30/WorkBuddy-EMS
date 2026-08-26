import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSearchParams } from 'react-router-dom'
import {
  getEmployeeById,
  getShiftById,
  getShiftChangeRequestsForEmployee,
  getShiftForEmployee,
  getShifts,
  requestShiftChange,
  updateShiftChangeRequest,
  withdrawShiftChangeRequest
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import { formatTime12 } from '../utils/cab.js'
import Modal from '../components/Modal.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableEmpty from '../components/TableEmpty.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { CircleCheck, CircleX, MoreHorizontal, Pencil, Shuffle, Undo2, X } from 'lucide-react'

const TABS = ['My Shift', 'Change Requests']

// Employee's own shift management page.
export default function EmployeeShifts() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'change-requests' ? 1 : 0
  const [tab, setTab] = useState(initialTab)

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Shuffle size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Shifts
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>View your shift and manage shift change requests</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab ${i === tab ? 'tab-active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <MyShiftTab userId={user.id} />}
      {tab === 1 && <ChangeRequestsTab userId={user.id} />}

      <p className="hint">
        Your shift determines when you are expected to clock in and out.
        If you need a different shift, submit a request from the Change Requests tab.
        You can edit or withdraw a pending request at any time.
      </p>
    </div>
  )
}

function MyShiftTab({ userId }) {
  const currentShift = getShiftForEmployee(userId)
  const allShifts = getShifts()

  const table = useTableControls(allShifts, {
    getSearchText: (s) => [s.name, formatTime12(s.startTime), formatTime12(s.endTime)].join(' '),
    getSortValue: (s, key) => {
      if (key === 'name') return s.name
      if (key === 'startTime') return s.startTime
      if (key === 'endTime') return s.endTime
      return s[key]
    },
    initialSortKey: 'name',
    initialSortDir: 'asc'
  })

  const { items: page, pageNum, totalPages, total, startIndex, endIndex, setPage } = usePagination(table.rows)

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Shuffle size={18} style={{ opacity: 0.7 }} />
        <div>
          <div className="muted small">Your current shift</div>
          {currentShift ? (
            <div>
              <strong>{currentShift.name}</strong>
              <span className="muted" style={{ marginLeft: '8px' }}>
                {formatTime12(currentShift.startTime)} – {formatTime12(currentShift.endTime)}
              </span>
            </div>
          ) : (
            <div><strong>No shift assigned</strong></div>
          )}
        </div>
      </div>

      <h3 className="section-title first">Available shifts</h3>
      <table className="table" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '40%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '30%' }} />
        </colgroup>
        <thead>
          <tr>
            <SortableTh label="Shift name" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            <SortableTh label="Start time" keyName="startTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            <SortableTh label="End time" keyName="endTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
          </tr>
        </thead>
        <tbody>
          {page.length === 0 && (
            <TableEmpty colSpan={3} message="No shifts available." />
          )}
          {page.map((s) => (
            <tr key={s.id} style={currentShift?.id === s.id ? { background: 'var(--hover)' } : undefined}>
              <td>
                <strong>{s.name}</strong>
                {currentShift?.id === s.id && <span className="tag tag-ok" style={{ marginLeft: '8px' }}>Current</span>}
              </td>
              <td>{formatTime12(s.startTime)}</td>
              <td>{formatTime12(s.endTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <Pagination current={pageNum} total={totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}

function ChangeRequestsTab({ userId }) {
  const [requests, setRequests] = useState(() => getShiftChangeRequestsForEmployee(userId))
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [editRequest, setEditRequest] = useState(null)
  const [withdrawId, setWithdrawId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [message, setMessage] = useState('')

  const currentShift = getShiftForEmployee(userId)
  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const hasPending = pendingRequests.length > 0

  const table = useTableControls(requests, {
    getSearchText: (r) => {
      const toShift = getShiftById(r.toShiftId)
      return [toShift?.name, r.reason, r.status].join(' ')
    },
    getSortValue: (r, key) => {
      if (key === 'toShift') return getShiftById(r.toShiftId)?.name || ''
      if (key === 'status') return r.status
      return r[key]
    },
    initialSortKey: 'requestedOn',
    initialSortDir: 'desc',
    filterFns: {
      status: (r, val) => {
        if (val === 'all') return true
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
    setRequests(getShiftChangeRequestsForEmployee(userId))
  }

  function handleWithdraw() {
    if (!withdrawId) return
    withdrawShiftChangeRequest(withdrawId, userId)
    refreshRequests()
    setWithdrawId(null)
    setMessage('Your shift change request was withdrawn.')
  }

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ]

  return (
    <>
      {message && <div className="info-box" style={{ marginBottom: '16px' }}>{message}</div>}

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
              type="button"
              className="btn btn-primary btn-tiny"
              disabled={hasPending}
              onClick={() => setShowRequestForm(true)}
            >
              <Shuffle size={14} style={{ marginRight: 4 }} />Request shift change
            </button>
          }
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="To shift" keyName="toShift" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Requested" keyName="requestedOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={5} message="No shift change requests." />
            )}
            {page.map((r) => {
              const toShift = getShiftById(r.toShiftId)
              const statusClass = r.status === 'approved' ? 'tag-ok' : r.status === 'rejected' ? 'tag-late' : r.status === 'withdrawn' ? 'tag-absent' : 'tag-pending'
              return (
                <tr key={r.id}>
                  <td>{toShift?.name || <span className="muted">--</span>}</td>
                  <td className="cell-ellipsis" title={r.reason || undefined}>{r.reason || <span className="muted">--</span>}</td>
                  <td>
                    <span className={`tag ${statusClass}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatDate(r.requestedOn)}</td>
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
                            onClick={() => { setEditRequest(r); closeMenu() }}
                          >
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={r.status !== 'pending'}
                            onClick={() => { setWithdrawId(r.id); closeMenu() }}
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

      {showRequestForm && (
        <ShiftRequestModal
          currentShift={currentShift}
          onSubmit={(data) => {
            requestShiftChange(userId, data.toShiftId, data.reason)
            refreshRequests()
            setShowRequestForm(false)
            setMessage('Your shift change request has been sent to HR.')
          }}
          onCancel={() => setShowRequestForm(false)}
        />
      )}

      {editRequest && (
        <ShiftRequestModal
          initial={editRequest}
          currentShift={currentShift}
          onSubmit={(data) => {
            updateShiftChangeRequest(editRequest.id, userId, data)
            refreshRequests()
            setEditRequest(null)
            setMessage('Your shift change request was updated.')
          }}
          onCancel={() => setEditRequest(null)}
        />
      )}

      {withdrawId && (
        <Modal onClose={() => setWithdrawId(null)} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setWithdrawId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will cancel your shift change request permanently. You will not be able to restore it afterwards.
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

function ShiftRequestModal({ initial, currentShift, onSubmit, onCancel }) {
  const allShifts = getShifts()
  const [toShiftId, setToShiftId] = useState(initial?.toShiftId || '')
  const [reason, setReason] = useState(initial?.reason || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!toShiftId) return
    onSubmit({ toShiftId, reason: reason.trim() })
  }

  return (
    <Modal onClose={onCancel} title={initial ? 'Edit shift change request' : 'Request shift change'}>
      <div className="modal-form">
        <div className="modal-header">
          <h3 className="section-title first">{initial ? 'Edit request' : 'Request shift change'}</h3>
          <button type="button" className="btn btn-tiny btn-light" onClick={onCancel} aria-label="Close"><X size={15} /></button>
        </div>
        <p className="hint first">
          {currentShift
            ? `You are currently on ${currentShift.name} (${formatTime12(currentShift.startTime)} – ${formatTime12(currentShift.endTime)}).`
            : 'You are not currently assigned to any shift.'}
          {' '}Select the shift you would like to move to and give a reason.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Requested shift</span>
            <select value={toShiftId} onChange={(e) => setToShiftId(e.target.value)} required>
              <option value="">-- Select a shift --</option>
              {allShifts.filter((s) => !currentShift || s.id !== currentShift.id).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatTime12(s.startTime)} – {formatTime12(s.endTime)})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Reason</span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why do you need a shift change?" />
          </label>
          <div className="button-row">
            <button type="submit" className="btn btn-primary" disabled={!toShiftId}>
              {initial ? 'Save changes' : 'Submit request'}
            </button>
            <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
