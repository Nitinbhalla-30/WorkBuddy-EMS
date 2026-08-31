import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  addShift,
  approveShiftChange,
  assignEmployeeShift,
  deleteShift,
  getEmployeeById,
  getEmployees,
  getProfileForEmployee,
  getShiftById,
  getShiftChangeRequests,
  getShifts,
  rejectShiftChange,
  updateShift,
  refreshStoreFromSupabase,
  STORE_KEYS
} from '../data/store.js'
import { formatTime12 } from '../utils/cab.js'
import { profilePhotoUrl } from '../utils/profile.js'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import TimeInput from '../components/TimeInput.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableEmpty from '../components/TableEmpty.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { CircleCheck, CircleX, MoreHorizontal, Pencil, Plus, Shuffle, Trash2, X } from 'lucide-react'

const TABS = ['Shifts', 'Employee Assignments', 'Change Requests']

// Admin page to define shifts, assign them to employees, and handle shift change requests.
export default function AdminShifts() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'change-requests' ? 2 : 0
  const [tab, setTab] = useState(initialTab)
  const [refresh, setRefresh] = useState(0)
  const trigger = () => setRefresh((n) => n + 1)

  // Pull the latest shared data from Supabase so shift change requests
  // submitted by employees show up even if this tab's initial load was stale.
  // Limited to the collections this screen reads.
  useEffect(() => {
    let cancelled = false
    async function refreshData() {
      await refreshStoreFromSupabase([
        STORE_KEYS.shifts,
        STORE_KEYS.shiftChangeRequests,
        STORE_KEYS.shiftHistory,
        STORE_KEYS.employees,
        STORE_KEYS.profiles
      ])
      if (!cancelled) trigger()
    }
    refreshData()
    window.addEventListener('storage', refreshData)
    window.addEventListener('focus', refreshData)
    return () => {
      cancelled = true
      window.removeEventListener('storage', refreshData)
      window.removeEventListener('focus', refreshData)
    }
  }, [])

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Shuffle size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Shift Management
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Define shifts, assign employees, and manage shift change requests</p>
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
            {t === 'Change Requests' ? ` (${getShiftChangeRequests().filter((r) => r.status === 'pending').length})` : ''}
          </button>
        ))}
      </div>

      {tab === 0 && <ShiftsTab key={`shifts-${refresh}`} />}
      {tab === 1 && <AssignmentsTab key={`assign-${refresh}`} />}
      {tab === 2 && <RequestsTab key={`req-${refresh}`} onDecided={trigger} />}

      <p className="hint">
        Define shifts to cover 24-hour operations, assign each employee to a shift,
        and review any shift change requests they submit.
        Changing a shift assignment updates the employee's attendance clock-in expectations immediately.
      </p>
    </div>
  )
}

// ---- Tab 1: Define Shifts ----
function ShiftsTab() {
  const [shifts, setShifts] = useState(() => getShifts())
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const editShift = shifts.find((s) => s.id === editId) || null

  const table = useTableControls(shifts, {
    getSearchText: (s) => s.name,
    getSortValue: (s, key) => {
      if (key === 'name') return s.name
      if (key === 'startTime') return s.startTime
      if (key === 'endTime') return s.endTime
      if (key === 'employees') return getEmployees().filter((e) => e.shiftId === s.id).length
      return s[key]
    },
    initialSortKey: 'name',
    initialSortDir: 'asc'
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

  function handleAdd(data) {
    addShift(data)
    setShifts(getShifts())
    setShowForm(false)
  }

  function handleEdit(data) {
    if (!editId) return
    updateShift(editId, data)
    setShifts(getShifts())
    setEditId(null)
  }

  function handleDelete() {
    if (!deleteId) return
    deleteShift(deleteId)
    setShifts(getShifts())
    setDeleteId(null)
  }

  return (
    <>
      <div className="card">
        <TableToolbar
          showSearch={false}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          actions={
            <button type="button" className="btn btn-primary btn-tiny" onClick={() => setShowForm(true)}>
              <Plus size={14} style={{ marginRight: 4 }} />Add shift
            </button>
          }
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '30%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Shift name" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Start time" keyName="startTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="End time" keyName="endTime" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Employees" keyName="employees" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={5} message="No shifts defined yet." />
            )}
            {page.map((s) => {
              const empCount = getEmployees().filter((e) => e.shiftId === s.id).length
              return (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{formatTime12(s.startTime)}</td>
                  <td>{formatTime12(s.endTime)}</td>
                  <td>{empCount}</td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(s.id)}
                        aria-label="Shift actions"
                      ><MoreHorizontal size={16} /></button>
                      {openMenuId === s.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => { setEditId(s.id); closeMenu() }}
                          >
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            onClick={() => { setDeleteId(s.id); closeMenu() }}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            Delete
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

      {showForm && (
        <ShiftFormModal
          title="Add new shift"
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editShift && (
        <ShiftFormModal
          title="Edit shift"
          initial={editShift}
          onSubmit={handleEdit}
          onCancel={() => setEditId(null)}
        />
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} title="Delete shift">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Delete shift</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setDeleteId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Are you sure you want to delete <strong>{getShiftById(deleteId)?.name}</strong>?
              Any employees currently assigned to this shift will have their assignment removed.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button type="button" className="btn btn-light" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// Shared form modal for adding/editing a shift.
function ShiftFormModal({ title, initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [startTime, setStartTime] = useState(initial?.startTime || '09:00')
  const [endTime, setEndTime] = useState(initial?.endTime || '18:00')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), startTime, endTime })
  }

  return (
    <Modal onClose={onCancel} title={title}>
      <div className="modal-form">
        <div className="modal-header">
          <h3 className="section-title first">{title}</h3>
          <button type="button" className="btn btn-tiny btn-light" onClick={onCancel} aria-label="Close"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Shift name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning Shift" required />
          </label>
          <div className="two-col">
            <label className="field">
              <span>Start time</span>
              <TimeInput value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </label>
            <label className="field">
              <span>End time</span>
              <TimeInput value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </label>
          </div>
          <p className="hint">
            Times are in 24-hour format. For overnight shifts (e.g. 10 PM to 6 AM), set start later than end.
          </p>
          <div className="button-row">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

// ---- Tab 2: Employee Assignments ----
function AssignmentsTab() {
  const shifts = getShifts()
  const employees = getEmployees().filter((e) => e.role === 'employee')
  const [changeConfirm, setChangeConfirm] = useState(null)

  const table = useTableControls(employees, {
    getSearchText: (e) => [e.name, e.id, e.department, e.designation].join(' '),
    getSortValue: (e, key) => {
      if (key === 'name') return e.name
      if (key === 'department') return e.department
      if (key === 'designation') return e.designation || ''
      if (key === 'shift') {
        const shift = getShiftById(e.shiftId)
        return shift?.name || ''
      }
      return e[key]
    },
    initialSortKey: 'name',
    initialSortDir: 'asc',
    filterFns: {
      shift: (e, val) => {
        if (val === 'all') return true
        if (val === 'unassigned') return !e.shiftId
        return e.shiftId === val
      },
      department: (e, val) => e.department === val
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

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees]
  )

  const shiftFilterOptions = [
    { value: 'all', label: 'All shifts' },
    { value: 'unassigned', label: 'Unassigned' },
    ...shifts.map((s) => ({ value: s.id, label: s.name }))
  ]

  const deptFilterOptions = [
    { value: 'all', label: 'All departments' },
    ...departments.map((d) => ({ value: d, label: d }))
  ]

  function handleShiftChange(emp, newShiftId) {
    setChangeConfirm({ employeeId: emp.id, empName: emp.name, newShiftId, oldShiftId: emp.shiftId })
  }

  function confirmChange() {
    if (!changeConfirm) return
    assignEmployeeShift(changeConfirm.employeeId, changeConfirm.newShiftId, 'admin')
    setChangeConfirm(null)
  }

  return (
    <>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search employees..."
          filters={[
            {
              key: 'shift',
              label: 'Shift',
              value: table.filters.shift || 'all',
              options: shiftFilterOptions
            },
            {
              key: 'department',
              label: 'Department',
              value: table.filters.department || 'all',
              options: deptFilterOptions
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '25%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '30%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Employee ID" keyName="id" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Department" keyName="department" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Designation" keyName="designation" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Current shift" keyName="shift" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={5} message="No employees found." />
            )}
            {page.map((e) => {
              const currentShift = getShiftById(e.shiftId)
              const photoUrl = profilePhotoUrl(getProfileForEmployee(e.id))
              return (
                <tr key={e.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar src={photoUrl} name={e.name} size={34} />
                      <strong>{e.name}</strong>
                    </div>
                  </td>
                  <td>{e.id}</td>
                  <td>{e.department}</td>
                  <td>{e.designation || <span className="muted">--</span>}</td>
                  <td>
                    <select
                      className="shift-select"
                      value={e.shiftId || ''}
                      onChange={(ev) => handleShiftChange(e, ev.target.value || null)}
                      style={{ width: '100%' }}
                    >
                      <option value="">-- No shift --</option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({formatTime12(s.startTime)} - {formatTime12(s.endTime)})
                        </option>
                      ))}
                    </select>
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

      {changeConfirm && (
        <Modal onClose={() => setChangeConfirm(null)} title="Confirm shift change">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Change shift</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setChangeConfirm(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Change <strong>{changeConfirm.empName}</strong>'s shift from{' '}
              <strong>{getShiftById(changeConfirm.oldShiftId)?.name || 'None'}</strong> to{' '}
              <strong>{getShiftById(changeConfirm.newShiftId)?.name || 'None'}</strong>?
              The employee will be notified.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={confirmChange}>Confirm</button>
              <button type="button" className="btn btn-light" onClick={() => setChangeConfirm(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---- Tab 3: Shift Change Requests ----
function RequestsTab({ onDecided }) {
  const [requests, setRequests] = useState(() => getShiftChangeRequests())
  const [approveId, setApproveId] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)

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

  const table = useTableControls(requests, {
    getSearchText: (r) => {
      const emp = getEmployeeById(r.employeeId)
      const toShift = getShiftById(r.toShiftId)
      return [emp?.name, emp?.id, toShift?.name, r.reason, r.status].join(' ')
    },
    getSortValue: (r, key) => {
      if (key === 'employee') return getEmployeeById(r.employeeId)?.name || ''
      if (key === 'fromShift') return getShiftById(r.fromShiftId)?.name || ''
      if (key === 'toShift') return getShiftById(r.toShiftId)?.name || ''
      if (key === 'reason') return r.reason || ''
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

  function handleApprove(id) {
    approveShiftChange(id, 'admin')
    setRequests(getShiftChangeRequests())
    onDecided()
  }

  function handleReject() {
    if (!rejectId) return
    if (!rejectReason.trim()) return
    rejectShiftChange(rejectId, 'admin', rejectReason.trim())
    setRequests(getShiftChangeRequests())
    setRejectId(null)
    setRejectReason('')
    onDecided()
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
            <col style={{ width: '18%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="From shift" keyName="fromShift" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="To shift" keyName="toShift" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={6} message="No shift change requests." />
            )}
            {page.map((r) => {
              const emp = getEmployeeById(r.employeeId)
              const fromShift = getShiftById(r.fromShiftId)
              const toShift = getShiftById(r.toShiftId)
              const statusClass = r.status === 'approved' ? 'tag-ok' : r.status === 'rejected' ? 'tag-late' : r.status === 'withdrawn' ? 'tag-absent' : 'tag-pending'
              const photoUrl = emp ? profilePhotoUrl(getProfileForEmployee(emp.id)) : ''
              return (
                <tr key={r.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar src={photoUrl} name={emp?.name || r.employeeId} size={34} />
                      <div>
                        <strong>{emp?.name || r.employeeId}</strong>
                        <div className="muted small">{r.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{fromShift?.name || <span className="muted">None</span>}</td>
                  <td>{toShift?.name || <span className="muted">--</span>}</td>
                  <td className="cell-ellipsis" title={r.reason || undefined}>{r.reason || <span className="muted">--</span>}</td>
                  <td>
                    <span className={`tag ${statusClass}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
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
                            onClick={() => { setApproveId(r.id); closeMenu() }}
                          >
                            <CircleCheck size={14} aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            disabled={r.status !== 'pending'}
                            onClick={() => { setRejectId(r.id); closeMenu() }}
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
              <h3 className="section-title first">Approve request</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setApproveId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">Are you sure you want to approve this shift change request? The employee will be notified.</p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={() => { handleApprove(approveId); setApproveId(null) }}>Approve</button>
              <button type="button" className="btn btn-light" onClick={() => setApproveId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {rejectId && (
        <Modal onClose={() => setRejectId(null)} title="Reject shift change request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Reject request</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setRejectId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <label className="field">
              <span>Reason</span>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Tell the employee why the request was rejected..." required />
            </label>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={handleReject} disabled={!rejectReason.trim()}>Reject</button>
              <button type="button" className="btn btn-light" onClick={() => setRejectId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
