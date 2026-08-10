import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { addTask, addTaskMessage, getEmployeeById, getTasksForAssignee, updateTaskStatus } from '../data/store.js'
import { TASK_STATUSES, TASK_PRIORITIES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
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

// The employee's own task board. They can add tasks for themselves and move
// them across the columns.
export default function EmployeeTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openTaskId, setOpenTaskId] = useState(null)

  const tasks = useMemo(
    () => getTasksForAssignee(user.id),
    [user.id, refresh]
  )
  const table = useTableControls(tasks, {
    getSearchText: (t) => {
      const creator = getEmployeeById(t.createdById)
      const creatorName = t.createdById === t.assigneeId ? 'Myself' : creator?.name || ''
      return [t.title, t.description, t.priority, t.status, t.dueDate, t.createdOn, creatorName].join(' ')
    },
    getSortValue: (t, key) => {
      if (key === 'createdBy') {
        if (t.createdById === t.assigneeId) return 'Myself'
        return getEmployeeById(t.createdById)?.name || t.createdById
      }
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
    if (id === user.id) return user.name
    const emp = getEmployeeById(id)
    return emp?.name || id
  }

  function assignerLabel(task) {
    if (task.createdById === task.assigneeId) return 'Myself'
    return nameOf(task.createdById)
  }

  function handleCreate(data) {
    addTask({ ...data, createdById: user.id })
    setRefresh((n) => n + 1)
    setShowForm(false)
  }

  function move(id, status) {
    updateTaskStatus(id, status)
    setRefresh((n) => n + 1)
  }

  function handleTaskReply(text) {
    if (!openTask) return
    addTaskMessage(openTask.id, { byId: user.id, text })
    setRefresh((n) => n + 1)
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

  function getStatusLabel(status) {
    switch (status) {
      case 'todo': return 'To do'
      case 'inprogress': return 'In progress'
      case 'done': return 'Done'
      default: return status
    }
  }

  function isOverdue(task) {
    if (!task.dueDate || task.status === 'done') return false
    return new Date(task.dueDate) < new Date()
  }

  function toggleMenu(taskId) {
    setOpenMenuId(openMenuId === taskId ? null : taskId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  // Close menu when clicking outside
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
      <div className="page-head">
        <h2>My Tasks</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="muted">{tasks.length} task(s)</span>
          <button
            className="btn btn-primary btn-tiny"
            onClick={() => setShowForm(true)}
          >
            Add a task
          </button>
        </div>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Add a task for myself">
          <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Add a task for myself</h3>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>
              <p className="hint first">
                Create a personal task and track it through To do, In progress, and Done.
              </p>
              <TaskForm
                defaultAssigneeId={user.id}
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
                  Assigned by {assignerLabel(openTask)} on {openTask.createdOn ? formatDate(openTask.createdOn) : '--'}
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
              key: 'status',
              label: 'Status',
              value: table.filters.status || 'all',
              options: TASK_STATUS_FILTER_OPTS
            },
            {
              key: 'priority',
              label: 'Priority',
              value: table.filters.priority || 'all',
              options: TASK_PRIORITY_FILTER_OPTS
            }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned by" keyName="createdBy" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned on" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Status</th>
              <SortableTh label="Due Date" keyName="dueDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={8} className="muted">No tasks match your filters.</td></tr>
            )}
            {tasksPage.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong></td>
                <td>{task.description || <span className="muted">--</span>}</td>
                <td>{assignerLabel(task)}</td>
                <td>
                  {task.createdOn ? formatDate(task.createdOn) : <span className="muted">--</span>}
                </td>
                <td>
                  <span className={`tag ${getPriorityClass(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) => move(task.id, e.target.value)}
                    className="btn-tiny"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </td>
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
                        <button
                          className="task-menu-item"
                          onClick={() => {
                            move(task.id, 'done')
                            closeMenu()
                          }}
                          disabled={task.status === 'done'}
                        >
                          Mark Done
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
          page={tasksPageNum}
          totalPages={tasksTotalPages}
          total={tasksTotal}
          startIndex={tasksStart}
          endIndex={tasksEnd}
          onPageChange={setTasksPage}
        />
      </div>

      <p className="hint">
        Change the status dropdown to move tasks between To do, In progress, and Done.
        Use the <strong>⋯</strong> menu and choose <strong>Ask question</strong> to request clarifications,
        access details, or anything else you need from the person who assigned the task.
      </p>
    </div>
  )
}
