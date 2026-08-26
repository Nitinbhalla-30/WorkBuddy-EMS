import { useMemo, useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSearchParams } from 'react-router-dom'
import {
  getAttendance,
  getEmployeeById,
  getLeaves,
  getMyTeamDirectory,
  getOvertimeRequests,
  getTasks,
  managerDecideLeave,
  managerDecideOvertime,
  refreshStoreFromSupabase
} from '../data/store.js'
import { computeMonthAverages, computeMonthRawAverages, formatDate } from '../utils/attendance.js'
import { leaveDays, leaveTypeLabel, leaveTypeLabelWithPart } from '../utils/leaves.js'
import { LEAVE_TYPES } from '../data/sampleData.js'
import { overtimeStatusLabel, overtimeStatusTagClass } from '../utils/overtime.js'
import { monthLabel } from '../utils/salary.js'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import TableEmpty from '../components/TableEmpty.jsx'
import TeamChat from '../components/TeamChat.jsx'
import TeamTasksPanel from './TeamTasks.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { CircleCheck, CircleX, MessageCircle, MoreHorizontal, Users, X } from 'lucide-react'

// Merged team module. Managers get three tabs: the team directory, the
// team's tasks, and the team's paid-leave requests waiting for approval.
// Non-manager employees see only the directory (no tab bar).

const VALID_TABS = ['team', 'tasks', 'leaves', 'overtime']
export default function MyTeam() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = VALID_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'team'
  const [tab, setTab] = useState(initialTab)

  // React to URL tab parameter changes (e.g., clicking a notification while
  // already on the MyTeam module but on a different tab).
  const prevTabParam = useRef(searchParams.get('tab'))
  const tabParam = searchParams.get('tab')
  useEffect(() => {
    // Only switch tabs when the URL parameter itself changes, not when the
    // user clicks a different tab manually.
    if (tabParam !== prevTabParam.current && VALID_TABS.includes(tabParam)) {
      setTab(tabParam)
    }
    prevTabParam.current = tabParam
  }, [tabParam])

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
  const [approveLeaveId, setApproveLeaveId] = useState(null)
  const [rejectLeave, setRejectLeave] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [openChatId, setOpenChatId] = useState(null)
  const [chatRefresh, setChatRefresh] = useState(0)

  // Overtime requests from this manager's team that are waiting on them.
  function loadTeamOvertime() {
    return getOvertimeRequests()
      .filter((r) =>
        r.status === 'pending' &&
        // Accept both explicit 'manager' stage and requests without stage (backwards compatibility)
        (r.stage === 'manager' || !r.stage) &&
        getEmployeeById(r.employeeId)?.managerId === user.id
      )
      .sort((a, b) => String(a.requestedOn).localeCompare(String(b.requestedOn)))
  }
  const [teamOvertime, setTeamOvertime] = useState(loadTeamOvertime)
  const [approveOvertimeId, setApproveOvertimeId] = useState(null)
  const [rejectOvertimeId, setRejectOvertimeId] = useState(null)
  const [rejectOvertimeReason, setRejectOvertimeReason] = useState('')

  // Keep the leave and overtime queues fresh. Before reading, pull the latest
  // shared data from Supabase so an employee's freshly submitted request shows
  // up even if this page's initial load fell back to stale local storage.
  useEffect(() => {
    let cancelled = false
    async function refreshQueues() {
      await refreshStoreFromSupabase()
      if (cancelled) return
      setTeamLeaves(loadTeamLeaves())
      setTeamOvertime(loadTeamOvertime())
    }
    refreshQueues()
    window.addEventListener('storage', refreshQueues)
    window.addEventListener('focus', refreshQueues)
    return () => {
      cancelled = true
      window.removeEventListener('storage', refreshQueues)
      window.removeEventListener('focus', refreshQueues)
    }
  }, [tab, user.id])

  // Open chat panel when navigating from a team message notification.
  useEffect(() => {
    const chatPeerId = searchParams.get('chat')
    if (chatPeerId) {
      setOpenChatId(chatPeerId)
      // Clear the query parameter so it doesn't re-open on every render.
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function openApproveLeave(lv) {
    setApproveLeaveId(lv.id)
  }

  function approveLeave(leaveId) {
    managerDecideLeave(leaveId, user.id, true)
    setApproveLeaveId(null)
    setTeamLeaves(loadTeamLeaves())
  }

  function openReject(lv) {
    setRejectLeave(lv)
    setRejectReason('')
  }

  function confirmReject() {
    if (!rejectLeave || !rejectReason.trim()) return
    managerDecideLeave(
      rejectLeave.id,
      user.id,
      false,
      rejectReason.trim()
    )
    setRejectLeave(null)
    setTeamLeaves(loadTeamLeaves())
  }

  function openApproveOvertime(req) {
    setApproveOvertimeId(req.id)
  }

  function approveOvertime(requestId) {
    managerDecideOvertime(requestId, user.id, true)
    setApproveOvertimeId(null)
    setTeamOvertime(loadTeamOvertime())
  }

  function openRejectOvertime(req) {
    setRejectOvertimeId(req.id)
    setRejectOvertimeReason('')
  }

  function confirmRejectOvertime() {
    if (!rejectOvertimeId) return
    managerDecideOvertime(
      rejectOvertimeId,
      user.id,
      false,
      rejectOvertimeReason.trim() || 'Rejected by manager'
    )
    setRejectOvertimeId(null)
    setRejectOvertimeReason('')
    setTeamOvertime(loadTeamOvertime())
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
    initialSortDir: 'asc',
    filterFns: {
      designation: (m, val) => m.designation === val
    }
  })

  const designationOptions = useMemo(() => {
    const set = new Set(teammates.map((m) => m.designation).filter(Boolean))
    return [
      { value: 'all', label: 'All designations' },
      ...[...set].sort().map((d) => ({ value: d, label: d }))
    ]
  }, [teammates])

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

  function refreshTeam() {
    // Force re-render to pick up new messages.
    setChatRefresh((n) => n + 1)
  }

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
            My Team Leave Request{teamLeaves.length > 0 ? ` (${teamLeaves.length})` : ''}
          </button>
          <button
            type="button"
            className={`tab ${tab === 'overtime' ? 'tab-active' : ''}`}
            onClick={() => setTab('overtime')}
          >
            My Team Overtime{teamOvertime.length > 0 ? ` (${teamOvertime.length})` : ''}
          </button>
        </div>
      )}

      {user.isManager && tab === 'tasks' && <TeamTasksPanel />}

      {user.isManager && tab === 'leaves' && <TeamLeavesTab
        teamLeaves={teamLeaves}
        openApproveLeave={openApproveLeave}
        openReject={openReject}
      />}

      {user.isManager && tab === 'overtime' && <TeamOvertimeTab
        teamOvertime={teamOvertime}
        openApproveOvertime={openApproveOvertime}
        openRejectOvertime={openRejectOvertime}
      />}

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
              filters={[{
                key: 'designation',
                label: 'Designation',
                value: table.filters.designation || 'all',
                options: designationOptions
              }]}
              onFilterChange={table.setFilter}
            />
            <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ tableLayout: 'fixed', minWidth: 1500 }}>
              <colgroup>
                {user.isManager ? (
                  <>
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '260px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '130px' }} />
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '190px' }} />
                  </>
                ) : (
                  <>
                    <col style={{ width: '220px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '280px' }} />
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '160px' }} />
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
                  <th>Message</th>
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
                        className="th-wrap"
                      />
                      <SortableTh
                        label="Avg time out"
                        keyName="avgTimeOut"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                        className="th-wrap"
                      />
                      <SortableTh
                        label="Avg worked hours"
                        keyName="avgWorked"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                        className="th-wrap"
                      />
                      <SortableTh
                        label="Avg break time"
                        keyName="avgBreak"
                        sortKey={table.sortKey}
                        sortDir={table.sortDir}
                        onSort={table.toggleSort}
                        className="th-wrap"
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
                    <td colSpan={user.isManager ? 11 : 6} className="muted">
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
                      <td className="team-msg-cell">
                        <button
                          type="button"
                          className="team-msg-btn"
                          onClick={() => setOpenChatId(m.id)}
                          aria-label={`Message ${m.name}`}
                          title={`Message ${m.name}`}
                        >
                          <MessageCircle size={16} />
                        </button>
                      </td>
                      <td className="cell-nowrap">
                        {m.mobile
                          ? <a href={`tel:${m.mobile}`} className="phone-link">{m.mobile}</a>
                          : <span className="muted">--</span>}
                      </td>
                      <td className="cell-ellipsis">
                        {m.email
                          ? <a href={`mailto:${m.email}`} className="phone-link">{m.email}</a>
                          : <span className="muted">--</span>}
                      </td>
                      <td className="cell-ellipsis">{m.designation || <span className="muted">--</span>}</td>
                      <td className="cell-ellipsis">{m.reportsTo || <span className="muted">--</span>}</td>
                      {user.isManager && (
                        <>
                          <td className="cell-nowrap">{st.avgTimeIn}</td>
                          <td className="cell-nowrap">{st.avgTimeOut}</td>
                          <td className="cell-nowrap">{st.avgWorked}</td>
                          <td className="cell-nowrap">{st.avgBreak}</td>
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
            </div>
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

      {openChatId && (
        <div className="team-chat-overlay" onClick={() => setOpenChatId(null)}>
          <div className="team-chat-slide" onClick={(e) => e.stopPropagation()}>
            <TeamChat
              peerId={openChatId}
              currentUser={user}
              onClose={() => setOpenChatId(null)}
              refresh={refreshTeam}
            />
          </div>
        </div>
      )}

      {approveLeaveId && (
        <Modal onClose={() => setApproveLeaveId(null)} title="Confirm approval">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm approval</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setApproveLeaveId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              {getEmployeeById(teamLeaves.find((lv) => lv.id === approveLeaveId)?.employeeId)?.name || 'Employee'} —{' '}
              {leaveTypeLabelWithPart(teamLeaves.find((lv) => lv.id === approveLeaveId))},{' '}
              {formatDate(teamLeaves.find((lv) => lv.id === approveLeaveId)?.fromDate)}.
            </p>
            <p className="hint first">
              Are you sure you want to approve this leave request?
              It will be forwarded to HR for final approval.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={() => approveLeave(approveLeaveId)}>Approve</button>
              <button type="button" className="btn btn-light" onClick={() => setApproveLeaveId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {rejectLeave && (
        <Modal onClose={() => setRejectLeave(null)} title="Reject leave request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Reject leave request</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setRejectLeave(null)} aria-label="Close"><X size={15} /></button>
            </div>
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
              <button type="button" className="btn btn-primary" onClick={confirmReject} disabled={!rejectReason.trim()}>Reject request</button>
              <button type="button" className="btn btn-light" onClick={() => setRejectLeave(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {approveOvertimeId && (
        <Modal onClose={() => setApproveOvertimeId(null)} title="Confirm approval">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm approval</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setApproveOvertimeId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              {getEmployeeById(teamOvertime.find((r) => r.id === approveOvertimeId)?.employeeId)?.name || 'Employee'} —{' '}
              {teamOvertime.find((r) => r.id === approveOvertimeId)?.hours}h for {monthLabel(teamOvertime.find((r) => r.id === approveOvertimeId)?.monthKey)}.
            </p>
            <p className="hint first">
              Are you sure you want to approve this overtime request?
              It will be forwarded to HR for final approval.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={() => approveOvertime(approveOvertimeId)}>Approve</button>
              <button type="button" className="btn btn-light" onClick={() => setApproveOvertimeId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {rejectOvertimeId && (
        <Modal onClose={() => setRejectOvertimeId(null)} title="Reject overtime request">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Reject overtime request</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setRejectOvertimeId(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              {getEmployeeById(teamOvertime.find((r) => r.id === rejectOvertimeId)?.employeeId)?.name || 'Employee'} —{' '}
              {teamOvertime.find((r) => r.id === rejectOvertimeId)?.hours}h for {monthLabel(teamOvertime.find((r) => r.id === rejectOvertimeId)?.monthKey)}.
            </p>
            <label className="field">
              <span>Reason</span>
              <textarea
                className="reply-input"
                rows={3}
                value={rejectOvertimeReason}
                onChange={(e) => setRejectOvertimeReason(e.target.value)}
                placeholder="Why is this overtime being rejected?"
              />
            </label>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={confirmRejectOvertime}>Reject request</button>
              <button type="button" className="btn btn-light" onClick={() => setRejectOvertimeId(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---- Team Leaves Tab Component ----
function TeamLeavesTab({ teamLeaves, openApproveLeave, openReject }) {
  const [openMenuId, setOpenMenuId] = useState(null)

  const table = useTableControls(teamLeaves, {
    getSearchText: (lv) => {
      const emp = getEmployeeById(lv.employeeId)
      return [emp?.name, emp?.id, leaveTypeLabelWithPart(lv), lv.reason].join(' ')
    },
    getSortValue: (lv, key) => {
      if (key === 'employee') return getEmployeeById(lv.employeeId)?.name || ''
      if (key === 'type') return leaveTypeLabelWithPart(lv)
      if (key === 'fromDate') return lv.fromDate
      if (key === 'days') return leaveDays(lv)
      return lv[key]
    },
    initialSortKey: 'fromDate',
    initialSortDir: 'asc',
    filterFns: {
      type: (lv, val) => lv.type === val
    }
  })

  const {
    items: pageRows,
    page,
    totalPages,
    total,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows, 10)

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

  return (
    <div>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search team leaves..."
          filters={[
            {
              key: 'type',
              label: 'Type',
              value: table.filters.type || 'all',
              options: [
                { value: 'all', label: 'All types' },
                ...LEAVE_TYPES.filter((t) => t.key !== 'unpaid').map((t) => ({ value: t.key, label: t.label }))
              ]
            }
          ]}
          onFilterChange={table.setFilter}
        />
      <table className="table" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '17%' }} />
        </colgroup>
        <thead>
          <tr>
            <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            <SortableTh label="Dates" keyName="fromDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            <SortableTh label="Days" keyName="days" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {table.count === 0 && (
            <TableEmpty colSpan={6} message="No leave requests waiting for your approval." />
          )}
          {pageRows.map((lv) => (
            <tr key={lv.id}>
              <td>
                <div className="person-cell">
                  <Avatar name={getEmployeeById(lv.employeeId)?.name || lv.employeeId} size={34} />
                  <span>{getEmployeeById(lv.employeeId)?.name || lv.employeeId}</span>
                </div>
              </td>
              <td>{leaveTypeLabelWithPart(lv)}</td>
              <td>
                {lv.fromDate === lv.toDate
                  ? formatDate(lv.fromDate)
                  : `${formatDate(lv.fromDate)} – ${formatDate(lv.toDate)}`}
              </td>
              <td>{leaveDays(lv)}</td>
              <td className="cell-ellipsis">{lv.reason || <span className="muted">--</span>}</td>
              <td>
                <div className="task-menu-container">
                  <button
                    type="button"
                    className="btn btn-tiny btn-light task-menu-button"
                    onClick={() => toggleMenu(lv.id)}
                    aria-label="Actions"
                  ><MoreHorizontal size={16} /></button>
                  {openMenuId === lv.id && (
                    <div className="task-menu-dropdown">
                      <button
                        type="button"
                        className="task-menu-item"
                        onClick={() => { openApproveLeave(lv); closeMenu() }}
                      >
                        <CircleCheck size={14} aria-hidden="true" />
                        Approve
                      </button>
                      <button
                        type="button"
                        className="task-menu-item task-menu-item-danger"
                        onClick={() => { openReject(lv); closeMenu() }}
                      >
                        <CircleX size={14} aria-hidden="true" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </td>
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
        Review and respond to leave requests from your team members.
        Approved requests are forwarded to HR for final approval.
      </p>
    </div>
  )
}

// ---- Team Overtime Tab Component ----
function TeamOvertimeTab({ teamOvertime, openApproveOvertime, openRejectOvertime }) {
  const [openMenuId, setOpenMenuId] = useState(null)

  const table = useTableControls(teamOvertime, {
    getSearchText: (r) => {
      const emp = getEmployeeById(r.employeeId)
      return [emp?.name, emp?.id, monthLabel(r.monthKey), r.reason].join(' ')
    },
    getSortValue: (r, key) => {
      if (key === 'employee') return getEmployeeById(r.employeeId)?.name || ''
      if (key === 'month') return r.monthKey
      if (key === 'hours') return r.hours
      return r[key]
    },
    initialSortKey: 'requestedOn',
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

  return (
    <div>
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search team overtime..."
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '23%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Month" keyName="month" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Hours" keyName="hours" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Reason" keyName="reason" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={5} message="No overtime requests waiting for your approval." />
            )}
            {pageRows.map((r) => {
              const emp = getEmployeeById(r.employeeId)
              return (
                <tr key={r.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar name={emp?.name || r.employeeId} size={34} />
                      <div>
                        <strong>{emp?.name || r.employeeId}</strong>
                        <div className="muted small">{r.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{monthLabel(r.monthKey)}</td>
                  <td><strong>{r.hours}h</strong></td>
                  <td className="cell-ellipsis">{r.reason || <span className="muted">--</span>}</td>
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
                            onClick={() => {
                              openApproveOvertime(r)
                              closeMenu()
                            }}
                          >
                            <CircleCheck size={14} aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            onClick={() => {
                              openRejectOvertime(r)
                              closeMenu()
                            }}
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
          page={page}
          totalPages={totalPages}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </div>
      <p className="hint">
        Review and respond to overtime requests from your team members.
        Approved overtime is paid at twice the normal hourly rate.
      </p>
    </div>
  )
}
