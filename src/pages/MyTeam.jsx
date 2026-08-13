import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getEmployeeById,
  getLeaves,
  getMyTeamDirectory,
  managerDecideLeave
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import { leaveDays, leaveTypeLabelWithPart } from '../utils/leaves.js'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'

export default function MyTeam() {
  const { user } = useAuth()

  const teammates = useMemo(() => getMyTeamDirectory(user.id), [user.id])

  // Paid-leave requests from this manager's team that are waiting on them.
  function loadTeamLeaves() {
    return getLeaves()
      .filter((lv) =>
        lv.status === 'pending' &&
        lv.stage === 'manager' &&
        getEmployeeById(lv.employeeId)?.managerId === user.id
      )
      .sort((a, b) => String(a.appliedOn).localeCompare(String(b.appliedOn)))
  }
  const [teamLeaves, setTeamLeaves] = useState(loadTeamLeaves)
  const [rejectLeave, setRejectLeave] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  function approveLeave(leaveId) {
    managerDecideLeave(leaveId, user.id, true)
    setTeamLeaves(loadTeamLeaves())
  }

  function openReject(lv) {
    setRejectLeave(lv)
    setRejectReason('')
  }

  function confirmReject() {
    if (!rejectLeave) return
    managerDecideLeave(
      rejectLeave.id,
      user.id,
      false,
      rejectReason.trim() || 'Rejected by manager'
    )
    setRejectLeave(null)
    setTeamLeaves(loadTeamLeaves())
  }

  const table = useTableControls(teammates, {
    getSearchText: (m) => [m.name, m.mobile, m.email, m.designation, m.reportsTo].join(' '),
    getSortValue: (m, key) => m[key],
    initialSortKey: 'name',
    initialSortDir: 'asc'
  })

  const {
    items: pageRows,
    page,
    totalPages,
    total,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows)

  const emptyMessage = user.isManager
    ? 'No team members to show yet.'
    : user.managerId
      ? 'No team members found.'
      : 'You are not assigned to a team yet. Ask HR if this looks wrong.'

  return (
    <div>
      <div className="page-head">
        <h2>My Team</h2>
        <span className="muted">{teammates.length} team member(s)</span>
      </div>

      {user.isManager && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 className="section-title first">Team leave requests</h3>
          <p className="hint first">
            Paid-leave requests from your team come to you first. Approve to send
            them to HR for final approval, or reject with a reason. Requests you
            do not answer in time move to HR automatically.
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teamLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">No leave requests waiting for your approval.</td>
                </tr>
              )}
              {teamLeaves.map((lv) => (
                <tr key={lv.id}>
                  <td>{getEmployeeById(lv.employeeId)?.name || lv.employeeId}</td>
                  <td>{leaveTypeLabelWithPart(lv)}</td>
                  <td>
                    {lv.fromDate === lv.toDate
                      ? formatDate(lv.fromDate)
                      : `${formatDate(lv.fromDate)} – ${formatDate(lv.toDate)}`}
                  </td>
                  <td>{leaveDays(lv)}</td>
                  <td>{lv.reason || <span className="muted">--</span>}</td>
                  <td>
                    <div className="button-row" style={{ marginTop: 0 }}>
                      <button type="button" className="btn btn-tiny btn-primary" onClick={() => approveLeave(lv.id)}>
                        Approve
                      </button>
                      <button type="button" className="btn btn-tiny btn-light" onClick={() => openReject(lv)}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search team members..."
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh
                label="Name"
                keyName="name"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Mobile"
                keyName="mobile"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Email"
                keyName="email"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Designation"
                keyName="designation"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Reports to"
                keyName="reportsTo"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  {teammates.length === 0 ? emptyMessage : 'No team members match your search.'}
                </td>
              </tr>
            )}
            {pageRows.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="person-cell">
                    <Avatar src={m.photoUrl} name={m.name} size={34} />
                    <span>{m.id === user.id ? `${m.name} (me)` : m.name}</span>
                  </div>
                </td>
                <td>
                  {m.mobile
                    ? <a href={`tel:${m.mobile}`} className="phone-link">{m.mobile}</a>
                    : <span className="muted">--</span>}
                </td>
                <td>
                  {m.email
                    ? <a href={`mailto:${m.email}`} className="phone-link">{m.email}</a>
                    : <span className="muted">--</span>}
                </td>
                <td>{m.designation || <span className="muted">--</span>}</td>
                <td>{m.reportsTo || <span className="muted">--</span>}</td>
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

      <p className="hint">
        Contact details come from employee records and verified profiles. If something is missing or wrong, ask HR to update it.
      </p>

      {rejectLeave && (
        <Modal onClose={() => setRejectLeave(null)} title="Reject leave request">
          <div className="modal-form">
            <p className="hint first">
              {getEmployeeById(rejectLeave.employeeId)?.name || rejectLeave.employeeId} —{' '}
              {leaveTypeLabelWithPart(rejectLeave)}, {formatDate(rejectLeave.fromDate)}.
            </p>
            <label className="field">
              <span>Reason</span>
              <textarea
                className="reply-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why is this leave being rejected?"
              />
            </label>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={confirmReject}>Reject request</button>
              <button type="button" className="btn btn-light" onClick={() => setRejectLeave(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
