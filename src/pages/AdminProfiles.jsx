import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAttendanceForEmployee,
  getEmployees,
  getProfileForEmployee,
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
import { Contact, Eye, MoreHorizontal, Users, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'

const ROLE_FILTER_OPTS = [
  { value: 'all', label: 'All roles' },
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'HR / Admin' }
]

const RECORD_FILTER_OPTS = [
  { value: 'all', label: 'All records' },
  { value: 'draft', label: 'Not submitted' },
  { value: 'submitted', label: 'Submitted (awaiting review)' },
  { value: 'verified', label: 'Verified' },
  { value: 'returned', label: 'Returned for correction' },
  { value: 'update_requested', label: 'Update requested (awaiting HR)' },
  { value: 'update_approved', label: 'Update approved — please edit' },
  { value: 'none', label: 'No record' }
]

// Combined "Employee Records" page. It shows the staff directory with team
// info (who is a manager, who reports to whom) AND each person's onboarding
// record, which HR can open to verify or return for correction.
export default function EmployeeRecords() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)

  // Team editing
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(null)

  // Profile reviewing
  const [openId, setOpenId] = useState(null)
  const [note, setNote] = useState('')

  const [openMenuId, setOpenMenuId] = useState(null)

  const employees = useMemo(() => getEmployees(), [refresh])

  const departmentFilterOpts = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))].sort()
    return [
      { value: 'all', label: 'All departments' },
      ...departments.map((d) => ({ value: d, label: d }))
    ]
  }, [employees])

  const reportsToFilterOpts = useMemo(() => {
    const managerIds = [...new Set(employees.map((e) => e.managerId).filter(Boolean))]
    const named = managerIds
      .map((id) => {
        const m = employees.find((e) => e.id === id)
        return m ? { value: id, label: m.name } : null
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label))
    return [
      { value: 'all', label: 'All managers' },
      { value: 'none', label: 'None' },
      ...named
    ]
  }, [employees])

  const table = useTableControls(employees, {
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

  // Only real employees can be picked as a manager.
  const managers = employees.filter((e) => e.role === 'employee' && e.isManager)

  function nameOf(id) {
    const found = employees.find((e) => e.id === id)
    return found ? found.name : '--'
  }

  // Profile for a given employee (only real employees onboard).
  function profileOf(emp) {
    return emp.role === 'employee' ? getProfileForEmployee(emp.id) : null
  }

  const openEmp = employees.find((e) => e.id === openId) || null
  const openProfile = openEmp ? getProfileForEmployee(openEmp.id) : null
  const editEmp = employees.find((e) => e.id === editId) || null

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

  // ---- team editing ----
  function startEdit(emp) {
    setOpenId(null)
    setEditId(emp.id)
    setForm({ isManager: !!emp.isManager, managerId: emp.managerId || '' })
    closeMenu()
  }

  function closeEdit() {
    setEditId(null)
    setForm(null)
  }

  function saveEdit() {
    updateEmployeeTeam(editId, {
      isManager: !!form.isManager,
      managerId: form.managerId || null
    })
    closeEdit()
    setRefresh((n) => n + 1)
  }

  // ---- profile reviewing ----
  function openReview(emp) {
    setEditId(null)
    setForm(null)
    setOpenId(emp.id)
    setNote('')
    closeMenu()
  }

  function closeReview() {
    setOpenId(null)
    setNote('')
  }

  function verify(employeeId) {
    reviewProfile(employeeId, 'verified', user.id, '')
    setRefresh((n) => n + 1)
  }

  function returnForFix(employeeId) {
    if (!note.trim()) return
    reviewProfile(employeeId, 'returned', user.id, note.trim())
    setNote('')
    setRefresh((n) => n + 1)
  }

  function approveUpdateRequest(employeeId) {
    reviewProfileUpdateRequest(employeeId, true, user.id, note.trim())
    setNote('')
    setRefresh((n) => n + 1)
  }

  function denyUpdateRequest(employeeId) {
    if (!note.trim()) return
    reviewProfileUpdateRequest(employeeId, false, user.id, note.trim())
    setNote('')
    setRefresh((n) => n + 1)
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
              label: 'Record',
              value: table.filters.record || 'all',
              options: RECORD_FILTER_OPTS
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
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
              <TableEmpty colSpan={9} message="No employees match your filters." />
            )}
            {recordsPage.map((e) => {
              const profile = profileOf(e)
              return (
                <tr key={e.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar src={e.photoUrl} name={e.name} size={34} />
                      <strong>{e.name}</strong>
                    </div>
                  </td>
                  <td>{e.id}</td>
                  <td>{e.department}</td>
                  <td>{e.designation || <span className="muted">--</span>}</td>
                  <td>{e.isManager ? <span className="tag tag-ok">Manager</span> : <span className="muted">--</span>}</td>
                  <td>{e.managerId ? nameOf(e.managerId) : <span className="muted">--</span>}</td>
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
                  <td>
                    {profile ? (
                      <span className={`tag ${profileStatusTagClass(profile.status)}`} style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
                        {(() => {
                          const label = profileStatusLabel(profile.status)
                          const match = label.match(/^(.+?)\s*(\(.*\)$)/)
                          if (match) {
                            return <>{match[1]}<br /><span style={{ opacity: 0.8, fontSize: '0.9em' }}>{match[2]}</span></>
                          }
                          return label
                        })()}
                      </span>
                    ) : (
                      <span className={`tag ${profileStatusTagClass('none')}`}>
                        No record
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(e.id)}
                        aria-label="Employee actions"
                       ><MoreHorizontal size={16} /></button>
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
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => startEdit(e)}
                          >
                            <Users size={14} aria-hidden="true" />
                            Edit team
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
          page={recordsPageNum}
          totalPages={recordsTotalPages}
          total={recordsTotal}
          startIndex={recordsStart}
          endIndex={recordsEnd}
          onPageChange={setRecordsPage}
        />
      </div>

      {editEmp && form && (
        <Modal onClose={closeEdit} title="Edit team">
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>
                  Team settings
                </h3>
                <div className="muted small">{editEmp.name} · {editEmp.id}</div>
              </div>
              <button type="button" className="btn btn-tiny btn-light" onClick={closeEdit} aria-label="Close"><X size={15} /></button>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isManager}
                onChange={(e) => setForm({ ...form, isManager: e.target.checked })}
              />
              <span>This person is a Manager / Team Leader (can assign tasks to their team)</span>
            </label>

            <label className="field">
              <span>Reports to (their manager)</span>
              <select
                value={form.managerId}
                onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              >
                <option value="">-- None --</option>
                {managers
                  .filter((m) => m.id !== editId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </select>
            </label>

            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={saveEdit}>Save</button>
              <button type="button" className="btn btn-light" onClick={closeEdit}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

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

      <p className="hint">
        To set up reporting lines: mark someone as a Manager first, then set their team members&rsquo;
        &ldquo;Reports to&rdquo; to that manager. Employees fill in their own onboarding
        details under &ldquo;My Details&rdquo;. Once verified, employees must request
        HR permission before making changes. Open a record to approve submissions or update requests.
      </p>
    </div>
  )
}
