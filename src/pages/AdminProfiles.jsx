import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addEmployee,
  deactivateEmployee,
  getAttendanceForEmployee,
  getEmployees,
  getProfileForEmployee,
  getShifts,
  isEmployeeActive,
  reactivateEmployee,
  reviewProfile,
  reviewProfileUpdateRequest,
  updateEmployeeTeam
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import { profileStatusLabel, profileStatusTagClass } from '../utils/profile.js'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import ProfileView from '../components/ProfileView.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { Calendar, Contact, Eye, MoreVertical, UserPlus, UserX, RotateCcw, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'
import Toast from '../components/Toast.jsx'

const ROLE_FILTER_OPTS = [
  { value: 'all', label: 'All roles' },
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'HR / Admin' }
]

const RECORD_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Not submitted' },
  { value: 'submitted', label: 'Submitted (awaiting review)' },
  { value: 'verified', label: 'Verified' },
  { value: 'returned', label: 'Returned for correction' },
  { value: 'update_requested', label: 'Update requested (awaiting HR)' },
  { value: 'update_approved', label: 'Update approved — please edit' },
  { value: 'none', label: 'No record' },
  { value: 'deactivated', label: 'Deactivated' }
]

// Combined "Employee Records" page. It shows the staff directory with team
// info (who is a manager, who reports to whom) AND each person's onboarding
// record, which HR can open to verify or return for correction.
export default function EmployeeRecords() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)

  // Profile reviewing
  const [openId, setOpenId] = useState(null)
  const [note, setNote] = useState('')

  const [openMenuId, setOpenMenuId] = useState(null)

  // Add employee modal
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    id: '',
    department: '',
    designation: '',
    isManager: false,
    managerId: '',
    dateJoined: '',
    basic: '',
    hra: '',
    other: '',
    tdsMonthly: '',
    shiftId: '',
    weekOffDays: []
  })
  const [addError, setAddError] = useState('')
  const [newDept, setNewDept] = useState('')
  const [addingDept, setAddingDept] = useState(false)
  const dateJoinedRef = useRef(null)

  // Deactivation modal
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [deactivateForm, setDeactivateForm] = useState({ reason: 'Resigned', date: '', note: '' })
  const [deactivateError, setDeactivateError] = useState('')

  // Reactivation confirmation
  const [showReactivate, setShowReactivate] = useState(false)
  const [reactivateTarget, setReactivateTarget] = useState(null)

  // Show inactive toggle
  const [showInactive, setShowInactive] = useState(false)

  const [toast, setToast] = useState(null)

  const employees = useMemo(() => getEmployees(), [refresh])

  // Filter out inactive employees unless "Show inactive" is enabled
  const visibleEmployees = useMemo(() => {
    if (showInactive) return employees
    return employees.filter((e) => isEmployeeActive(e))
  }, [employees, showInactive])

  // Only real employees can be picked as a manager.
  const managers = employees
    .filter((e) => e.role === 'employee' && e.isManager)
    .sort((a, b) => a.name.localeCompare(b.name))

  const departmentFilterOpts = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))].sort()
    return [
      { value: 'all', label: 'All departments' },
      ...departments.map((d) => ({ value: d, label: d }))
    ]
  }, [employees])

  const reportsToFilterOpts = useMemo(() => {
    const named = managers.map((m) => ({ value: m.id, label: m.name }))
    return [
      { value: 'all', label: 'All managers' },
      { value: 'none', label: 'None' },
      ...named
    ]
  }, [managers])

  const table = useTableControls(visibleEmployees, {
    getSearchText: (e) => {
      const profile = e.role === 'employee' ? getProfileForEmployee(e.id) : null
      const manager = e.managerId ? employees.find((m) => m.id === e.managerId) : null
      return [
        e.id, e.name, e.department, e.designation || '', e.role,
        e.isManager ? 'manager' : '',
        manager?.name,
        profile ? profileStatusLabel(profile.status) : 'No record'
      ].join(' ')
    },
    getSortValue: (e, key) => {
      if (key === 'designation') return e.designation || ''
      if (key === 'role') return e.role === 'admin' ? 'HR / Admin' : 'Employee'
      if (key === 'isManager') return e.isManager ? 1 : 0
      if (key === 'manager') return e.managerId ? (employees.find((m) => m.id === e.managerId)?.name || '') : ''
      if (key === 'dateJoined') return e.dateJoined || ''
      if (key === 'record') {
        const profile = e.role === 'employee' ? getProfileForEmployee(e.id) : null
        return profile ? profileStatusLabel(profile.status) : 'No record'
      }
      return e[key]
    },
    initialSortKey: 'name',
    initialSortDir: 'asc',
    filterFns: {
      department: (e, val) => e.department === val,
      role: (e, val) => e.role === val,
      reportsTo: (e, val) => {
        if (val === 'none') return !e.managerId
        return e.managerId === val
      },
      record: (e, val) => {
        if (val === 'deactivated') return !isEmployeeActive(e)
        if (e.role !== 'employee') return val === 'none'
        const profile = getProfileForEmployee(e.id)
        return (profile?.status || 'draft') === val
      }
    }
  })
  const {
    items: recordsPage,
    page: recordsPageNum,
    totalPages: recordsTotalPages,
    total: recordsTotal,
    startIndex: recordsStart,
    endIndex: recordsEnd,
    setPage: setRecordsPage
  } = usePagination(table.rows)

  // Profile for a given employee (only real employees onboard).
  function profileOf(emp) {
    return emp.role === 'employee' ? getProfileForEmployee(emp.id) : null
  }

  const openEmp = employees.find((e) => e.id === openId) || null
  const openProfile = openEmp ? getProfileForEmployee(openEmp.id) : null

  function toggleMenu(employeeId) {
    setOpenMenuId(openMenuId === employeeId ? null : employeeId)
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

  // ---- inline team editing ----
  function toggleManager(emp) {
    updateEmployeeTeam(emp.id, {
      isManager: !emp.isManager,
      managerId: emp.managerId
    })
    setRefresh((n) => n + 1)
    setToast({ message: `${emp.name} is now ${emp.isManager ? 'no longer a manager' : 'a manager'}.`, type: 'success' })
  }

  function changeReportsTo(emp, managerId) {
    updateEmployeeTeam(emp.id, {
      isManager: emp.isManager,
      managerId: managerId || null
    })
    setRefresh((n) => n + 1)
    const managerName = managerId ? employees.find((m) => m.id === managerId)?.name : null
    setToast({ message: `${emp.name} now reports to ${managerName || 'no one'}.`, type: 'success' })
  }

  // ---- profile reviewing ----
  function openReview(emp) {
    setOpenId(emp.id)
    setNote('')
    closeMenu()
  }

  function closeReview() {
    setOpenId(null)
    setNote('')
  }

  function scrollModalToTop() {
    // The modal body (.modal-content) is the scroll container; scroll it so
    // the status change message at the top is visible after an action.
    requestAnimationFrame(() => {
      const el = document.querySelector('.modal-content')
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  function verify(employeeId) {
    reviewProfile(employeeId, 'verified', user.id, '')
    setRefresh((n) => n + 1)
    scrollModalToTop()
    const name = employees.find((e) => e.id === employeeId)?.name || 'Employee'
    setToast({ message: `${name}'s record has been verified.`, type: 'success' })
  }

  function returnForFix(employeeId) {
    if (!note.trim()) return
    reviewProfile(employeeId, 'returned', user.id, note.trim())
    setNote('')
    setRefresh((n) => n + 1)
    scrollModalToTop()
    setToast({ message: 'Record returned to the employee for correction.', type: 'success' })
  }

  function approveUpdateRequest(employeeId) {
    reviewProfileUpdateRequest(employeeId, true, user.id, note.trim())
    setNote('')
    setRefresh((n) => n + 1)
    setToast({ message: 'Update request approved — the employee can now edit their details.', type: 'success' })
  }

  function denyUpdateRequest(employeeId) {
    if (!note.trim()) return
    reviewProfileUpdateRequest(employeeId, false, user.id, note.trim())
    setNote('')
    setRefresh((n) => n + 1)
    setToast({ message: 'Update request denied.', type: 'success' })
  }

  // ---- add employee ----
  function getNextEmployeeId() {
    const empIds = employees
      .map((e) => e.id)
      .filter((id) => /^EMP\d+$/.test(id))
      .map((id) => parseInt(id.replace('EMP', ''), 10))
    const nextNum = empIds.length > 0 ? Math.max(...empIds) + 1 : 1
    return 'EMP' + String(nextNum).padStart(3, '0')
  }

  const departmentOpts = useMemo(() => {
    const depts = new Set(employees.map((e) => e.department).filter(Boolean))
    // Include the currently selected department (e.g. a newly typed one)
    if (addForm.department) depts.add(addForm.department)
    return [...depts].sort().map((d) => ({ value: d, label: d }))
  }, [employees, addForm.department])

  function openAddEmployee() {
    setAddForm({ name: '', id: getNextEmployeeId(), department: '', designation: '', isManager: false, managerId: '', dateJoined: '', email: '', basic: '', hra: '', other: '', tdsMonthly: '', shiftId: '', weekOffDays: [] })
    setAddError('')
    setShowAdd(true)
  }

  function closeAddEmployee() {
    setShowAdd(false)
    setAddError('')
    setAddingDept(false)
    setNewDept('')
  }

  function handleAddEmployee() {
    if (!addForm.name.trim() || !addForm.id.trim() || !addForm.department.trim() || !addForm.designation.trim() || !addForm.email.trim()) {
      setAddError('Name, ID, department, designation, and email are required.')
      return
    }
    const email = addForm.email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAddError('Please enter a valid email address (e.g. name@company.com). It is used for password reset.')
      return
    }
    const result = addEmployee({
      id: addForm.id.trim(),
      name: addForm.name.trim(),
      department: addForm.department.trim(),
      designation: addForm.designation.trim(),
      isManager: addForm.isManager,
      managerId: addForm.managerId || null,
      dateJoined: addForm.dateJoined,
      email,
      shiftId: addForm.shiftId || null,
      weekOffDays: addForm.weekOffDays,
      salary: {
        basic: Number(addForm.basic) || 0,
        hra: Number(addForm.hra) || 0,
        other: Number(addForm.other) || 0,
        tdsMonthly: Number(addForm.tdsMonthly) || 0
      }
    })
    if (!result) {
      setAddError('An employee with this ID already exists.')
      return
    }
    const addedName = addForm.name.trim()
    closeAddEmployee()
    setRefresh((n) => n + 1)
    setToast({ message: `${addedName} has been added. Share their ID and default PIN 1234.`, type: 'success' })
  }

  // ---- deactivate employee ----
  function openDeactivate(emp) {
    setDeactivateTarget(emp)
    setDeactivateForm({ reason: 'Resigned', date: '', note: '' })
    setDeactivateError('')
    setShowDeactivate(true)
  }

  function closeDeactivate() {
    setShowDeactivate(false)
    setDeactivateTarget(null)
    setDeactivateForm({ reason: 'Resigned', date: '', note: '' })
    setDeactivateError('')
  }

  function handleDeactivate() {
    if (!deactivateForm.date) {
      setDeactivateError('Separation date is required.')
      return
    }
    if (deactivateForm.reason === 'Other' && !deactivateForm.note.trim()) {
      setDeactivateError('Please provide a reason for "Other".')
      return
    }
    deactivateEmployee(deactivateTarget.id, {
      reason: deactivateForm.reason,
      date: deactivateForm.date,
      note: deactivateForm.reason === 'Other' ? deactivateForm.note.trim() : ''
    })
    const deactivatedName = deactivateTarget.name
    closeDeactivate()
    setRefresh((n) => n + 1)
    setToast({ message: `${deactivatedName} has been deactivated.`, type: 'success' })
  }

  // ---- reactivate employee ----
  function openReactivate(emp) {
    setReactivateTarget(emp)
    setShowReactivate(true)
  }

  function closeReactivate() {
    setShowReactivate(false)
    setReactivateTarget(null)
  }

  function handleReactivate() {
    reactivateEmployee(reactivateTarget.id)
    const reactivatedName = reactivateTarget.name
    closeReactivate()
    setRefresh((n) => n + 1)
    setToast({ message: `${reactivatedName} has been reactivated and can log in again.`, type: 'success' })
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}><Contact size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Employee Records</h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Manage teams, reporting lines, and onboarding records</p>
        </div>
        <span className="muted">{employees.length} people</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search employees..."
          filters={[
            {
              key: 'department',
              label: 'Department',
              value: table.filters.department || 'all',
              options: departmentFilterOpts
            },
            {
              key: 'reportsTo',
              label: 'Reports to',
              value: table.filters.reportsTo || 'all',
              options: reportsToFilterOpts
            },
            {
              key: 'record',
              label: 'Record Status',
              value: table.filters.record || 'all',
              options: RECORD_FILTER_OPTS
            }
          ]}
          onFilterChange={(key, value) => {
            if (key === 'record' && value === 'deactivated') setShowInactive(true)
            table.setFilter(key, value)
          }}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label className="checkbox-row" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
                <span>Show inactive</span>
              </label>
              <button type="button" className="btn btn-primary" onClick={openAddEmployee}>
                <UserPlus size={14} aria-hidden="true" style={{ marginRight: 6 }} />Add Employee
              </button>
            </div>
          }
        />
        <table className="table table-profiles" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Name" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="ID" keyName="id" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Department" keyName="department" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Designation" keyName="designation" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Manager" keyName="isManager" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reports to" keyName="manager" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} className="th-wrap" />
              <SortableTh label="Date of Joining" keyName="dateJoined" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Record Status" keyName="record" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={9} message={table.total === 0 ? 'No employees yet.' : 'No employees found.'} />
            )}
            {recordsPage.map((e) => {
              const profile = profileOf(e)
              const statusText = !isEmployeeActive(e)
                ? (profile ? profileStatusLabel(profile.status) : 'No record')
                : `${e.separationReason || 'Inactive'}${e.separationDate ? ` (${e.separationDate})` : ''}`
              return (
                <tr key={e.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar src={e.photoUrl} name={e.name} size={34} />
                      <strong>{e.name}</strong>
                    </div>
                  </td>
                  <td>{e.id}</td>
                  <td className="cell-ellipsis" title={e.department || undefined}>{e.department}</td>
                  <td className="cell-ellipsis" title={e.designation || undefined}>{e.designation || <span className="muted">--</span>}</td>
                  <td>
                    {e.role === 'employee' ? (
                      <label className="toggle-switch" title={e.isManager ? 'Manager' : 'Not a manager'}>
                        <input
                          type="checkbox"
                          checked={!!e.isManager}
                          onChange={() => toggleManager(e)}
                        />
                        <span className="toggle-track">
                          <span className="toggle-thumb" />
                        </span>
                      </label>
                    ) : (
                      <span className="muted">--</span>
                    )}
                  </td>
                  <td>
                    {e.role === 'employee' ? (
                      <select
                        className="inline-select"
                        value={e.managerId || ''}
                        onChange={(ev) => changeReportsTo(e, ev.target.value)}
                        title="Reports to"
                      >
                        <option value="">-- None --</option>
                        {managers
                          .filter((m) => m.id !== e.id)
                          .map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                      </select>
                    ) : (
                      <span className="muted">--</span>
                    )}
                  </td>
                  <td>
                    {e.dateJoined
                      ? (() => {
                          const d = new Date(e.dateJoined)
                          const day = String(d.getDate()).padStart(2, '0')
                          const month = String(d.getMonth() + 1).padStart(2, '0')
                          const year = d.getFullYear()
                          return `${day}/${month}/${year}`
                        })()
                      : <span className="muted">--</span>}
                  </td>
                  <td className="cell-record-status cell-ellipsis" title={statusText}>
                    {!isEmployeeActive(e) ? (
                      <span className="tag tag-absent">
                        {e.separationReason || 'Inactive'}
                        {e.separationDate && <span className="muted" style={{ marginLeft: 6 }}>{e.separationDate}</span>}
                      </span>
                    ) : profile ? (
                      <span className={`tag ${profileStatusTagClass(profile.status)}`}>
                        {profileStatusLabel(profile.status)}
                      </span>
                    ) : (
                      <span className="tag tag-absent">No record</span>
                    )}
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(e.id)}
                        aria-label="Employee actions"
                       ><MoreVertical size={16} /></button>
                      {openMenuId === e.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            disabled={!profile || profile.status === 'draft'}
                            onClick={() => openReview(e)}
                          >
                            <Eye size={14} aria-hidden="true" />
                            {!profile || profile.status === 'draft' ? 'Not filled' : 'Open'}
                          </button>
                          {isEmployeeActive(e) && e.role !== 'admin' && (
                            <button
                              type="button"
                              className="task-menu-item"
                              onClick={() => { closeMenu(); openDeactivate(e) }}
                            >
                              <UserX size={14} aria-hidden="true" />
                              Deactivate
                            </button>
                          )}
                          {!isEmployeeActive(e) && (
                            <button
                              type="button"
                              className="task-menu-item"
                              onClick={() => { closeMenu(); openReactivate(e) }}
                            >
                              <RotateCcw size={14} aria-hidden="true" />
                              Reactivate
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
          page={recordsPageNum}
          totalPages={recordsTotalPages}
          total={recordsTotal}
          startIndex={recordsStart}
          endIndex={recordsEnd}
          onPageChange={setRecordsPage}
        />
      </div>

      {openEmp && openProfile && (
        <Modal onClose={closeReview} title="Employee record">
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>{openEmp.name}</h3>
                <div className="muted small">
                  Submitted {openProfile.submittedOn ? formatDate(openProfile.submittedOn) : '--'}
                  {' — '}Reviewed {openProfile.reviewedOn ? formatDate(openProfile.reviewedOn) : '--'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${profileStatusTagClass(openProfile.status)}`}>
                  {profileStatusLabel(openProfile.status)}
                </span>
                <button type="button" className="btn btn-tiny btn-light" onClick={closeReview} aria-label="Close"><X size={15} /></button>
              </div>
            </div>

            {openProfile.status === 'returned' && openProfile.reviewNote && (
              <div className="info-box first">
                Returned to the employee with note: &ldquo;{openProfile.reviewNote}&rdquo;
              </div>
            )}

            {openProfile.status === 'update_requested' && (
              <div className="info-box first">
                <strong>Update request</strong> — sent on{' '}
                {formatDate(openProfile.updateRequestedOn)}.
                {openProfile.updateRequestNote
                  ? <> Reason: &ldquo;{openProfile.updateRequestNote}&rdquo;</>
                  : ' No reason was given.'}
                Approve to let the employee edit their details, then verify after they submit.
              </div>
            )}

            {openProfile.status === 'update_approved' && (
              <div className="info-box first">
                Update approved on {formatDate(openProfile.reviewedOn)}. The employee
                is editing their details and will submit for your verification.
              </div>
            )}

            <ProfileView profile={openProfile} />

            {openProfile.status === 'update_requested' ? (
              <>
                <h3 className="section-title">Update request</h3>
                <label className="field">
                  <span>Note to employee (optional when approving, required when denying)</span>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Approved — please update your bank details only"
                  />
                </label>
                <div className="button-row">
                  <button type="button" className="btn btn-primary" onClick={() => approveUpdateRequest(openEmp.id)}>
                    Approve update
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={!note.trim()}
                    onClick={() => denyUpdateRequest(openEmp.id)}
                  >
                    Deny request
                  </button>
                </div>
              </>
            ) : openProfile.status === 'submitted' ? (
              <>
                <h3 className="section-title">Review decision</h3>
                <label className="field">
                  <span>Note (needed only if you return it for correction)</span>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. PAN number does not match the uploaded card"
                  />
                </label>
                <div className="button-row">
                  <button type="button" className="btn btn-primary" onClick={() => verify(openEmp.id)}>
                    Mark verified
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={!note.trim()}
                    onClick={() => returnForFix(openEmp.id)}
                  >
                    Return for correction
                  </button>
                </div>
              </>
            ) : (
              <div className="button-row">
                <label className="field inline" style={{ flex: 1 }}>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Reason to reopen"
                    style={{ width: '100%' }}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => returnForFix(openEmp.id)}
                  disabled={!note.trim()}
                >
                  Reopen for correction
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal onClose={closeAddEmployee} title="Add Employee">
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>New Employee</h3>
                <p className="hint first">Add a new employee to the organization. Fill in their personal details, role, and department to set up their account.</p>
              </div>
              <button type="button" className="btn btn-tiny btn-light" onClick={closeAddEmployee} aria-label="Close"><X size={15} /></button>
            </div>

            {addError && <div className="error-box">{addError}</div>}

            <div className="two-col">
              <label className="field">
                <span>Employee name *</span>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                />
              </label>
              <label className="field">
                <span>Employee ID (auto-generated)</span>
                <input
                  value={addForm.id}
                  readOnly
                  style={{ color: 'var(--muted)', cursor: 'default' }}
                />
              </label>
            </div>

            <label className="field">
              <span>Work email *</span>
              <input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="e.g. priya.sharma@company.com"
              />
              <span className="hint">We use this address for signing in and for password reset, so it must be correct.</span>
            </label>

            <div className="two-col">
              <label className="field">
                <span>Department *</span>
                {addingDept ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      placeholder="Type new department name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newDept.trim()) {
                          const dept = newDept.trim()
                          setAddForm((f) => ({ ...f, department: dept }))
                          setNewDept('')
                          setAddingDept(false)
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-light btn-tiny"
                      onClick={() => {
                        const dept = newDept.trim()
                        if (dept) {
                          setAddForm((f) => ({ ...f, department: dept }))
                          setNewDept('')
                        }
                        setAddingDept(false)
                      }}
                      style={{ flexShrink: 0 }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-tiny"
                      onClick={() => { setAddingDept(false); setNewDept('') }}
                      style={{ flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <select
                    value={addForm.department}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setAddingDept(true)
                        setNewDept('')
                      } else {
                        setAddForm({ ...addForm, department: e.target.value })
                      }
                    }}
                  >
                    <option value="">-- Select department --</option>
                    <option value="__add_new__">+ Add new department</option>
                    {departmentOpts.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                )}
              </label>
              <label className="field">
                <span>Designation *</span>
                <input
                  value={addForm.designation}
                  onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                  placeholder="e.g. Sales Executive"
                />
              </label>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={addForm.isManager}
                onChange={(e) => setAddForm({ ...addForm, isManager: e.target.checked })}
              />
              <span>This person is a Manager / Team Leader</span>
            </label>

            <label className="field">
              <span>Reports to (their manager)</span>
              <select
                value={addForm.managerId}
                onChange={(e) => setAddForm({ ...addForm, managerId: e.target.value })}
              >
                <option value="">-- None --</option>
                {managers
                  .filter((m) => m.id !== addForm.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </select>
            </label>

            <label className="field">
              <span>Date of joining</span>
              <input
                ref={dateJoinedRef}
                type="date"
                value={addForm.dateJoined}
                onChange={(e) => setAddForm({ ...addForm, dateJoined: e.target.value })}
              />
            </label>

            <div className="two-col">
              <label className="field">
                <span>Shift</span>
                <select
                  value={addForm.shiftId}
                  onChange={(e) => setAddForm({ ...addForm, shiftId: e.target.value })}
                >
                  <option value="">-- No shift assigned --</option>
                  {getShifts().map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.startTime}–{s.endTime})</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Weekly off days</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 4 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, idx) => (
                    <label key={idx} className="checkbox-row" style={{ margin: 0, fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={addForm.weekOffDays.includes(idx)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...addForm.weekOffDays, idx]
                            : addForm.weekOffDays.filter((d) => d !== idx)
                          setAddForm({ ...addForm, weekOffDays: next })
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>

            <p className="sub-title" style={{ margin: '16px 0 8px' }}>Salary structure</p>
            <div className="two-col">
              <label className="field">
                <span>Basic</span>
                <input
                  type="number"
                  min="0"
                  value={addForm.basic}
                  onChange={(e) => setAddForm({ ...addForm, basic: e.target.value })}
                  placeholder="e.g. 25000"
                />
              </label>
              <label className="field">
                <span>HRA</span>
                <input
                  type="number"
                  min="0"
                  value={addForm.hra}
                  onChange={(e) => setAddForm({ ...addForm, hra: e.target.value })}
                  placeholder="e.g. 10000"
                />
              </label>
            </div>
            <div className="two-col">
              <label className="field">
                <span>Other allowances</span>
                <input
                  type="number"
                  min="0"
                  value={addForm.other}
                  onChange={(e) => setAddForm({ ...addForm, other: e.target.value })}
                  placeholder="e.g. 5000"
                />
              </label>
              <label className="field">
                <span>TDS per month</span>
                <input
                  type="number"
                  min="0"
                  value={addForm.tdsMonthly}
                  onChange={(e) => setAddForm({ ...addForm, tdsMonthly: e.target.value })}
                  placeholder="e.g. 2000"
                />
              </label>
            </div>

            <div className="info-box" style={{ marginTop: 8 }}>
              The employee will be assigned a default PIN of <strong>1234</strong>. Share the Employee ID and PIN so they can log in and fill in their details under &ldquo;My Details&rdquo;.
            </div>

            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={handleAddEmployee}>Add Employee</button>
              <button type="button" className="btn btn-light" onClick={closeAddEmployee}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivation modal */}
      {showDeactivate && deactivateTarget && (
        <Modal onClose={closeDeactivate} title={`Deactivate — ${deactivateTarget.name}`}>
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>Deactivate employee</h3>
                <div className="muted small">{deactivateTarget.name} ({deactivateTarget.id})</div>
              </div>
              <button type="button" className="btn btn-tiny btn-light" onClick={closeDeactivate} aria-label="Close"><X size={15} /></button>
            </div>

            {deactivateError && <div className="error-box">{deactivateError}</div>}

            <div className="info-box" style={{ marginBottom: 16 }}>
              This will block the employee from logging in. Their historical records (attendance, leaves, salary) will be preserved.
            </div>

            <label className="field">
              <span>Reason *</span>
              <select
                value={deactivateForm.reason}
                onChange={(e) => setDeactivateForm({ ...deactivateForm, reason: e.target.value })}
              >
                <option value="Resigned">Resigned</option>
                <option value="Retired">Retired</option>
                <option value="Terminated">Terminated</option>
                <option value="Other">Other</option>
              </select>
            </label>

            {deactivateForm.reason === 'Other' && (
              <label className="field">
                <span>Custom reason *</span>
                <input
                  value={deactivateForm.note}
                  onChange={(e) => setDeactivateForm({ ...deactivateForm, note: e.target.value })}
                  placeholder="e.g. Contract ended, Relocated, etc."
                />
              </label>
            )}

            <label className="field">
              <span>Separation date *</span>
              <input
                type="date"
                value={deactivateForm.date}
                onChange={(e) => setDeactivateForm({ ...deactivateForm, date: e.target.value })}
              />
            </label>

            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={handleDeactivate} style={{ backgroundColor: 'var(--danger, #dc3545)' }}>Deactivate</button>
              <button type="button" className="btn btn-light" onClick={closeDeactivate}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reactivation confirmation modal */}
      {showReactivate && reactivateTarget && (
        <Modal onClose={closeReactivate} title={`Reactivate — ${reactivateTarget.name}`}>
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>Reactivate employee</h3>
                <div className="muted small">{reactivateTarget.name} ({reactivateTarget.id})</div>
              </div>
              <button type="button" className="btn btn-tiny btn-light" onClick={closeReactivate} aria-label="Close"><X size={15} /></button>
            </div>

            <div className="info-box" style={{ marginBottom: 16 }}>
              Are you sure you want to reactivate <strong>{reactivateTarget.name}</strong>? They will be able to log in again.
              {reactivateTarget.separationReason && (
                <div style={{ marginTop: 8 }}>
                  Previous separation: <strong>{reactivateTarget.separationReason}</strong>
                  {reactivateTarget.separationDate && ` on ${reactivateTarget.separationDate}`}
                </div>
              )}
            </div>

            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={handleReactivate}>Reactivate</button>
              <button type="button" className="btn btn-light" onClick={closeReactivate}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      <p className="hint">
        Click &ldquo;Add Employee&rdquo; to create a new employee record. Share their ID and PIN (default: 1234) so they can log in.
        Toggle the switch to make someone a Manager. Use the dropdown to set who they report to.
        Employees fill in their own onboarding details under &ldquo;My Details&rdquo;. Once verified,
        employees must request HR permission before making changes. Open a record to approve
        submissions or update requests.
      </p>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
