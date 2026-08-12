import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTask,
  addTaskMessage,
  approveTaskClosure,
  deleteTask,
  getEmployeeById,
  getTasks,
  getTeamMembers,
  updateTaskStatusByManager
} from '../data/store.js'
import { TASK_STATUSES, TASK_PRIORITIES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import {
  canManagerApproveDone,
  canManagerChangeStatus,
  closureNotice,
  isOverdue,
  isSelfAssigned,
  managerStatusOptions,
  statusLabel,
  statusTagClass
} from '../utils/tasks.js'
import TaskForm from '../components/TaskForm.jsx'
import TaskThread from '../components/TaskThread.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'

const TASK_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...TASK_STATUSES.map((s) => ({ value: s.key, label: s.label }))
]
const TASK_PRIORITY_FILTER_OPTS = [
  { value: 'all', label: 'All priorities' },
  ...TASK_PRIORITIES.map((p) => ({ value: p.key, label: p.label }))
]

// A manager's board: tasks for the whole team (and the manager). The manager
// can create tasks for any team member, see closure submissions, and approve closure.
export default function TeamTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openTaskId, setOpenTaskId] = useState(null)

  const people = useMemo(() => {
    const members = getTeamMembers(user.id)
    return [{ id: user.id, name: `${user.name} (me)` }, ...members]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, refresh])

  const ids = useMemo(() => people.map((p) => p.id), [people])

  const tasks = useMemo(
    () => getTasks().filter((t) => ids.includes(t.assigneeId)),
    [ids, refresh]
  )

  const table = useTableControls(tasks, {
    getSearchText: (t) => {
      const assignee = people.find((p) => p.id === t.assigneeId)
      return [t.title, t.description, t.priority, t.status, t.dueDate, assignee?.name].join(' ')
    },
    getSortValue: (t, key) => {
      if (key === 'assignee') return people.find((p) => p.id === t.assigneeId)?.name || t.assigneeId
      return t[key]
    },
    initialSortKey: 'dueDate',
    initialSortDir: 'asc',
    filterFns: {
      status: (t, val) => t.status === val,
      priority: (t, val) => t.priority === val
    }
  })
  const {
    items: tasksPage,
    page: tasksPageNum,
    totalPages: tasksTotalPages,
    total: tasksTotal,
    startIndex: tasksStart,
    endIndex: tasksEnd,
    setPage: setTasksPage
  } = usePagination(table.rows)

  const openTask = tasks.find((t) => t.id === openTaskId) || null

  function nameOf(id) {
    const found = people.find((p) => p.id === id)
    if (found) return found.name.replace(' (me)', '')
    const emp = getEmployeeById(id)
    return emp?.name || id
  }

  function bump() {
    setRefresh((n) => n + 1)
  }

  function handleCreate(data) {
    addTask({ ...data, createdById: user.id })
    bump()
    setShowForm(false)
  }

  function move(id, status) {
    updateTaskStatusByManager(id, user.id, status)
    bump()
  }

  function handleApproveClosure(id) {
    approveTaskClosure(id, user.id)
    bump()
  }

  function handleTaskReply(text) {
    if (!openTask) return
    addTaskMessage(openTask.id, { byId: user.id, text })
    bump()
  }

  function remove(id) {
    deleteTask(id)
    bump()
  }

  function getPriorityLabel(key) {
    const p = TASK_PRIORITIES.find((item) => item.key === key)
    return p ? p.label : key
  }

  function getPriorityClass(key) {
    switch (key) {
      case 'high': return 'tag-high'
      case 'medium': return 'tag-medium'
      case 'low': return 'tag-low'
      default: return ''
    }
  }

  function toggleMenu(taskId) {
    setOpenMenuId(openMenuId === taskId ? null : taskId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  function canDeleteTask(task) {
    return task.createdById === user.id
  }

  function statusCell(task) {
    const canChange = canManagerChangeStatus(task, user.id)
    const options = managerStatusOptions(task, user.id)

    if (!canChange) {
      return (
        <div>
          <span className={`tag ${statusTagClass(task.status)}`}>
            {statusLabel(task.status)}
          </span>
          {task.status === 'done' && !isSelfAssigned(task) && task.completedOn && (
            <div className="muted small">
              Employee marked done on {formatDate(task.completedOn)}
            </div>
          )}
          {closureNotice(task, nameOf) && task.status === 'closed' && (
            <div className="muted small">{closureNotice(task, nameOf)}</div>
          )}
        </div>
      )
    }

    return (
      <select
        value={task.status}
        onChange={(e) => move(task.id, e.target.value)}
        className="btn-tiny"
      >
        {options.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
    )
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

  if (!user.isManager) {
    return (
      <div>
        <div className="page-head">
          <h2>Team Tasks</h2>
        </div>
        <div className="card">
          <p className="muted">
            This page is for Managers / Team Leaders. You are not marked as a
            manager, so you do not have a team here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <h2>Team Tasks</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="muted">{people.length - 1} team member(s)</span>
          <button
            className="btn btn-primary btn-tiny"
            onClick={() => setShowForm(true)}
          >
            Assign a task
          </button>
        </div>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Assign a new task">
          <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Assign a new task</h3>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>
              <p className="hint first">
                Assign a task to anyone on your team or to yourself.
              </p>
              <TaskForm
                people={people}
                onCreate={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </div>
        </Modal>
      )}

      {openTask && (
        <Modal onClose={() => setOpenTaskId(null)} title={openTask.title}>
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>{openTask.title}</h3>
                <div className="muted small">
                  Assigned to {nameOf(openTask.assigneeId)} on {openTask.createdOn ? formatDate(openTask.createdOn) : '--'}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setOpenTaskId(null)}
              >
                ✕
              </button>
            </div>
            {openTask.description && (
              <p className="hint first">{openTask.description}</p>
            )}
            {openTask.status === 'done' && !isSelfAssigned(openTask) && openTask.completedOn && (
              <p className="hint">
                {nameOf(openTask.assigneeId)} marked this task done on {formatDate(openTask.completedOn)}.
              </p>
            )}
            {closureNotice(openTask, nameOf) && openTask.status === 'closed' && (
              <p className="hint">{closureNotice(openTask, nameOf)}</p>
            )}
            <TaskThread
              task={openTask}
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleTaskReply}
              onClose={() => setOpenTaskId(null)}
            />
          </div>
        </Modal>
      )}

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={tasksTotal}
          startIndex={tasksStart}
          endIndex={tasksEnd}
          placeholder="Search tasks..."
          filters={[
            {
              key: 'priority',
              label: 'Priority',
              value: table.filters.priority || 'all',
              options: TASK_PRIORITY_FILTER_OPTS
            },
            {
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: TASK_STATUS_FILTER_OPTS
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned To" keyName="assignee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Status</th>
              <SortableTh label="Due Date" keyName="dueDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={7} className="muted">No tasks match your filters.</td></tr>
            )}
            {tasksPage.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong></td>
                <td>{task.description || <span className="muted">--</span>}</td>
                <td>{nameOf(task.assigneeId)}</td>
                <td>
                  <span className={`tag ${getPriorityClass(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </td>
                <td>{statusCell(task)}</td>
                <td className={isOverdue(task) ? 'text-bad' : ''}>
                  {task.dueDate ? formatDate(task.dueDate) : <span className="muted">--</span>}
                  {isOverdue(task) && <span className="muted small"> (Overdue)</span>}
                </td>
                <td>
                  <div className="task-menu-container">
                    <button
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(task.id)}
                    >
                      ⋯
                    </button>
                    {openMenuId === task.id && (
                      <div className="task-menu-dropdown">
                        <button
                          className="task-menu-item"
                          onClick={() => {
                            setOpenTaskId(task.id)
                            closeMenu()
                          }}
                        >
                          Ask question
                        </button>
                        {canManagerApproveDone(task, user.id) && (
                          <button
                            className="task-menu-item"
                            onClick={() => {
                              handleApproveClosure(task.id)
                              closeMenu()
                            }}
                          >
                            Approve closure
                          </button>
                        )}
                        {isSelfAssigned(task) && task.assigneeId === user.id && (
                          <button
                            className="task-menu-item"
                            onClick={() => {
                              move(task.id, 'done')
                              closeMenu()
                            }}
                            disabled={task.status === 'done'}
                          >
                            Mark done
                          </button>
                        )}
                        {canDeleteTask(task) && (
                          <button
                            className="task-menu-item"
                            onClick={() => {
                              remove(task.id)
                              closeMenu()
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={tasksPageNum}
          totalPages={tasksTotalPages}
          total={tasksTotal}
          startIndex={tasksStart}
          endIndex={tasksEnd}
          onPageChange={setTasksPage}
        />
      </div>

      <p className="hint">
        Assign tasks to your team from here. When an employee marks a task done,
        you will see <strong>Done</strong> with the completion date and can approve closure from the <strong>⋯</strong> menu.
        The task becomes <strong>Closed</strong> for the employee only after you approve.
      </p>
    </div>
  )
}
