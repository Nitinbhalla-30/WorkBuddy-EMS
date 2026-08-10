import { useMemo, useState } from 'react'
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
import ProfileView from '../components/ProfileView.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { useTableControls } from '../hooks/useTableControls.js'

const ROLE_FILTER_OPTS = [
  { value: 'all', label: 'All roles' },
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'HR / Admin' }
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

  const employees = useMemo(() => getEmployees(), [refresh])

  const table = useTableControls(employees, {
    getSearchText: (e) => {
      const profile = e.role === 'employee' ? getProfileForEmployee(e.id) : null
      const manager = e.managerId ? employees.find((m) => m.id === e.managerId) : null
      return [
        e.id, e.name, e.department, e.role,
        e.isManager ? 'manager' : '',
        manager?.name,
        profile ? profileStatusLabel(profile.status) : ''
      ].join(' ')
    },
    getSortValue: (e, key) => {
      if (key === 'role') return e.role === 'admin' ? 'HR / Admin' : 'Employee'
      if (key === 'isManager') return e.isManager ? 1 : 0
      if (key === 'manager') return e.managerId ? (employees.find((m) => m.id === e.managerId)?.name || '') : ''
      if (key === 'days') return getAttendanceForEmployee(e.id).length
      if (key === 'record') {
        const profile = e.role === 'employee' ? getProfileForEmployee(e.id) : null
        return profile ? profileStatusLabel(profile.status) : ''
      }
      return e[key]
    },
    initialSortKey: 'name',
    initialSortDir: 'asc',
    filterFns: {
      role: (e, val) => e.role === val
    }
  })

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

  // ---- team editing ----
  function startEdit(emp) {
    setOpenId(null)
    setEditId(emp.id)
    setForm({ isManager: !!emp.isManager, managerId: emp.managerId || '' })
  }

  function saveEdit() {
    updateEmployeeTeam(editId, {
      isManager: !!form.isManager,
      managerId: form.managerId || null
    })
    setEditId(null)
    setForm(null)
    setRefresh((n) => n + 1)
  }

  // ---- profile reviewing ----
  function openReview(emp) {
    setEditId(null)
    setForm(null)
    setOpenId(emp.id)
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
        <h2>Employee Records</h2>
        <span className="muted">{employees.length} people</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search employees..."
          filters={[{
            key: 'role',
            label: 'Role',
            value: table.filters.role || 'all',
            options: ROLE_FILTER_OPTS
          }]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="ID" keyName="id" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Name" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Department" keyName="department" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Role" keyName="role" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Manager?" keyName="isManager" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reports to" keyName="manager" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Days" keyName="days" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Record" keyName="record" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={9} className="muted">No employees match your filters.</td></tr>
            )}
            {table.rows.map((e) => {
              const profile = profileOf(e)
              return (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td><strong>{e.name}</strong></td>
                  <td>{e.department}</td>
                  <td>{e.role === 'admin' ? 'HR / Admin' : 'Employee'}</td>
                  <td>{e.isManager ? <span className="tag tag-ok">Manager</span> : <span className="muted">--</span>}</td>
                  <td>{e.managerId ? nameOf(e.managerId) : <span className="muted">--</span>}</td>
                  <td>{getAttendanceForEmployee(e.id).length}</td>
                  <td>
                    {profile ? (
                      <span className={`tag ${profileStatusTagClass(profile.status)}`}>
                        {profileStatusLabel(profile.status)}
                      </span>
                    ) : (
                      <span className="muted">--</span>
                    )}
                  </td>
                  <td>
                    {e.role === 'employee' ? (
                      <div className="row-actions">
                        <button className="btn btn-tiny btn-light" onClick={() => startEdit(e)}>
                          Edit team
                        </button>
                        <button
                          className="btn btn-tiny btn-light"
                          disabled={profile.status === 'draft'}
                          onClick={() => openReview(e)}
                        >
                          {profile.status === 'draft' ? 'Not filled' : 'Open'}
                        </button>
                      </div>
                    ) : (
                      <span className="muted">--</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit team info for one employee */}
      {editId && form && (
        <div className="card">
          <h3 className="section-title first">Team settings — {nameOf(editId)}</h3>

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
            <button className="btn btn-primary" onClick={saveEdit}>Save</button>
            <button className="btn btn-light" onClick={() => { setEditId(null); setForm(null) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Open one onboarding record to review */}
      {openEmp && openProfile && (
        <div className="card">
          <div className="page-head">
            <div>
              <h3 style={{ margin: 0 }}>{openEmp.name}</h3>
              <div className="muted small">
                Submitted {openProfile.submittedOn ? formatDate(openProfile.submittedOn) : '--'}
                {' — '}Reviewed {openProfile.reviewedOn ? formatDate(openProfile.reviewedOn) : '--'}
              </div>
            </div>
            <button className="btn btn-tiny btn-light" onClick={() => setOpenId(null)}>Close</button>
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

          {/* HR decision on update request */}
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
                <button className="btn btn-primary" onClick={() => approveUpdateRequest(openEmp.id)}>
                  Approve update
                </button>
                <button
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
                <button className="btn btn-primary" onClick={() => verify(openEmp.id)}>
                  Mark verified
                </button>
                <button className="btn btn-danger" disabled={!note.trim()} onClick={() => returnForFix(openEmp.id)}>
                  Return for correction
                </button>
              </div>
            </>
          ) : (
            <div className="button-row">
              <button className="btn btn-light" onClick={() => returnForFix(openEmp.id)} disabled={!note.trim()}>
                Reopen for correction
              </button>
              <label className="field inline" style={{ flex: 1 }}>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason to reopen"
                  style={{ width: '100%' }}
                />
              </label>
            </div>
          )}
        </div>
      )}

      <p className="hint">
        Mark someone as a Manager first, then set their team members&rsquo;
        &ldquo;Reports to&rdquo; to that manager. Employees fill their own
        onboarding details under &ldquo;My Details&rdquo;. Verified employees must
        request HR permission before updating. Open a record to approve update
        requests or verify submissions.
      </p>
    </div>
  )
}
