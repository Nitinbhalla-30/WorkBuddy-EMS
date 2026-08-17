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
import { MoreHorizontal, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const TASK_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...TASK_STATUSES.map((s) => ({ value: s.key, label: s.label }))
]
const TASK_PRIORITY_FILTER_OPTS = [
  { value: 'all', label: 'All priorities' },
  ...TASK_PRIORITIES.map((p) => ({ value: p.key, label: p.label }))
]

// Team tasks panel shown inside the My Team screen's "My Team Tasks" tab.
// The manager can create tasks for any team member, see closure submissions,
// and approve closure.
export default function TeamTasksPanel() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openTaskId, setOpenTaskId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const people = useMemo(() => {
    const members = getTeamMembers(user.id)
    return [{ id: user.id, name: `${user.name} (me)` }, ...members]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, refresh])

  // Only tasks the manager assigned (to teammates or to themselves).
  // Tasks teammates assigned to themselves stay on their own My Tasks screen.
  const tasks = useMemo(
    () => getTasks().filter((t) => t.createdById === user.id),
    [user.id, refresh]
  )

  const table = useTableControls(tasks, {
    getSearchText: (t) => {
      const assignee = people.find((p) => p.id === t.assigneeId)
      return [t.title, t.description, t.priority, t.status, t.dueDate, assignee?.name].join(' ')
    },
    getSortValue: (t, key) => {
      if (key === 'assignee') return people.find((p) => p.id === t.assigneeId)?.name || t.assigneeId
      if (key === 'status') return statusLabel(t.status)
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

  function handleDelete(id) {
    setDeleteId(id)
  }

  function confirmDelete() {
    if (deleteId) {
      deleteTask(deleteId)
      setDeleteId(null)
      bump()
    }
  }

  function cancelDelete() {
    setDeleteId(null)
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

  return (
    <div>
      <div className="section-head-row first">
        <h3 className="section-title">Team tasks</h3>
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => setShowForm(true)}
        >
          Assign a task
        </button>
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
                 aria-label="Close"><X size={15} /></button>
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
               aria-label="Close"><X size={15} /></button>
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
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned To" keyName="assignee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Due Date" keyName="dueDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={7} message="No tasks match your filters." />
            )}
            {tasksPage.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong></td>
                <td className="cell-ellipsis" title={task.description || undefined}>{task.description || <span className="muted">--</span>}</td>
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
                     aria-label="More actions"><MoreHorizontal size={16} /></button>
                    {openMenuId === task.id && (
                      <div className="task-menu-dropdown">
                        {/* For a task the manager assigned to themself only
                            Delete remains; marking done happens in My Tasks. */}
                        {!isSelfAssigned(task) && (
                          <button
                            className="task-menu-item"
                            onClick={() => {
                              setOpenTaskId(task.id)
                              closeMenu()
                            }}
                          >
                            Ask question
                          </button>
                        )}
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
                        {canDeleteTask(task) && (
                          <button
                            className="task-menu-item task-menu-item-danger"
                            onClick={() => {
                              handleDelete(task.id)
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

      {deleteId && (
        <Modal onClose={cancelDelete} title="Confirm Delete">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Delete</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelDelete} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
              <button type="button" className="btn btn-light" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      <p className="hint">
        Assign tasks to your team from here. When an employee marks a task done,
        you will see <strong>Done</strong> with the completion date and can approve closure from the <strong>three-dot</strong> menu.
        The task becomes <strong>Closed</strong> for the employee only after you approve.
      </p>
    </div>
  )
}
