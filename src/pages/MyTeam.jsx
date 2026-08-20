import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAttendance,
  getEmployeeById,
  getLeaves,
  getMyTeamDirectory,
  getTasks,
  managerDecideLeave
} from '../data/store.js'
import { computeMonthAverages, computeMonthRawAverages, formatDate } from '../utils/attendance.js'
import { leaveDays, leaveTypeLabelWithPart } from '../utils/leaves.js'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import TeamTasksPanel from './TeamTasks.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { Users } from 'lucide-react'

// Merged team module. Managers get three tabs: the team directory, the
// team's tasks, and the team's paid-leave requests waiting for approval.
// Non-manager employees see only the directory (no tab bar).
export default function MyTeam() {
  const { user } = useAuth()
  const [tab, setTab] = useState('team')

  const teammates = useMemo(() => getMyTeamDirectory(user.id), [user.id])

  // Per-teammate numbers for the directory table: this month's attendance
  // averages plus how many tasks sit in each status bucket. Managers only;
  // regular employees see just the contact columns.
  const memberStats = useMemo(() => {
    if (!user.isManager) return {}
    const attendance = getAttendance()
    const allTasks = getTasks()
    const stats = {}
    for (const m of teammates) {
      const records = attendance.filter((r) => r.employeeId === m.id)
      const tasks = allTasks.filter((t) => t.assigneeId === m.id)
      stats[m.id] = {
        ...computeMonthAverages(records),
        ...computeMonthRawAverages(records),
        todoCount: tasks.filter((t) => t.status === 'todo').length,
        inprogressCount: tasks.filter((t) => t.status === 'inprogress').length,
        doneCount: tasks.filter((t) => t.status === 'done' || t.status === 'closed').length
      }
    }
    return stats
  }, [teammates, user.isManager])

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
    getSortValue: (m, key) => {
      // Computed columns sort by their raw numbers, not the display strings.
      const st = memberStats[m.id] || {}
      switch (key) {
        case 'avgTimeIn': return st.avgTimeInMins ?? -1
        case 'avgTimeOut': return st.avgTimeOutMins ?? -1
        case 'avgWorked': return st.avgWorkedMins ?? -1
        case 'avgBreak': return st.avgBreakMins ?? -1
        case 'tasks': return (st.todoCount || 0) + (st.inprogressCount || 0) + (st.doneCount || 0)
        default: return m[key]
      }
    },
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
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Users size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />My Team
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>{user.isManager ? 'View your teammates, attendance averages, and task overview' : 'View your teammates and their contact details'}</p>
        </div>
        <span className="muted">{teammates.length} team member(s)</span>
      </div>

      {user.isManager && (
        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'team' ? 'tab-active' : ''}`}
            onClick={() => setTab('team')}
          >
            My Team
          </button>
          <button
            type="button"
            className={`tab ${tab === 'tasks' ? 'tab-active' : ''}`}
            onClick={() => setTab('tasks')}
          >
            My Team Tasks
          </button>
          <button
            type="button"
            className={`tab ${tab === 'leaves' ? 'tab-active' : ''}`}
            onClick={() => setTab('leaves')}
          >
            Team Leave Request
          </button>
        </div>
      )}

      {user.isManager && tab === 'tasks' && <TeamTasksPanel />}

      {user.isManager && tab === 'leaves' && (
        <div className="card">
          <h3 className="section-title first">Team leave requests</h3>
          <p className="hint first">
            Paid-leave requests from your team come to you first as their manager.
            Approve to forward them to HR for final approval, or reject with a reason.
            If you do not respond in time, the request is sent to HR automatically.
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

      {(tab === 'team' || !user.isManager) && (
        <div>
          <div className="card">
            <TableToolbar
              search={table.search}
              onSearchChange={table.setSearch}
              total={total}
              startIndex={startIndex}
              endIndex={endIndex}
              placeholder="Search team members..."
            />
            <table className="table" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                {user.isManager ? (
                  <>
                    <col style={{ width: '11.7%' }} />
                    <col style={{ width: '7.2%' }} />
                    <col style={{ width: '13.5%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '8.1%' }} />
                    <col style={{ width: '7.2%' }} />
                    <col style={{ width: '7.2%' }} />
                    <col style={{ width: '8.1%' }} />
                    <col style={{ width: '8.1%' }} />
                    <col style={{ width: '18.9%' }} />
                  </>
                ) : (
                  <>
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '26%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '18%' }} />
                  </>
                )}
              </colgroup>
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
                  {user.isManager && (
                    <>
                      <SortableTh
                        label="Avg time in"
                        keyName="avgTimeIn"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                      />
                      <SortableTh
                        label="Avg time out"
                        keyName="avgTimeOut"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                      />
                      <SortableTh
                        label="Avg worked hours"
                        keyName="avgWorked"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                      />
                      <SortableTh
                        label="Avg break time"
                        keyName="avgBreak"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                      />
                      <SortableTh
                        label="Tasks"
                        keyName="tasks"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                      />
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {table.count === 0 && (
                  <tr>
                    <td colSpan={user.isManager ? 10 : 5} className="muted">
                      {teammates.length === 0 ? emptyMessage : 'No team members match your search.'}
                    </td>
                  </tr>
                )}
                {pageRows.map((m) => {
                  const st = memberStats[m.id] || {}
                  return (
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
                      {user.isManager && (
                        <>
                          <td>{st.avgTimeIn}</td>
                          <td>{st.avgTimeOut}</td>
                          <td>{st.avgWorked}</td>
                          <td>{st.avgBreak}</td>
                          <td>
                            <div className="team-task-counts">
                              <span className="tag tag-absent">{st.todoCount} To do</span>
                              <span className="tag tag-late">{st.inprogressCount} In progress</span>
                              <span className="tag tag-ok">{st.doneCount} Done</span>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
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
            Contact details are sourced from employee records and verified profiles
            {user.isManager && (
              <>; the attendance averages and task counts reflect this month&rsquo;s data so far</>
            )}.
            If anything looks incorrect, please ask HR to update it.
          </p>
        </div>
      )}

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
