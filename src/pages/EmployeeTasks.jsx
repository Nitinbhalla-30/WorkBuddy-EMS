import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTask,
  addTaskMessage,
  deleteTaskByAssignee,
  getEmployeeById,
  getTasksForAssignee,
  updateTaskByAssignee,
  updateTaskStatusByEmployee
} from '../data/store.js'
import { TASK_STATUSES, TASK_PRIORITIES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import {
  QUICK_FILTER_LABELS,
  canEmployeeAskQuestion,
  canEmployeeDeleteTask,
  canEmployeeEditTask,
  chartBucketKey,
  closureNotice,
  employeeStatusOptions,
  isEmployeeStatusLocked,
  isOverdue,
  isSelfAssigned,
  statusLabel,
  statusTagClass
} from '../utils/tasks.js'
import TaskForm from '../components/TaskForm.jsx'
import TaskThread from '../components/TaskThread.jsx'
import { TaskStatusChart } from '../components/tasks/TaskStatusChart.tsx'
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
const ASSIGNED_DURING_FILTER_OPTS = [
  { value: 'all', label: 'All time' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'ytd', label: 'Year to Date' }
]

// Whether a task's assigned-on date (YYYY-MM-DD) falls inside the chosen
// "Assigned During" window.
function inAssignedDuring(dateKey, val) {
  if (!val || val === 'all') return true
  if (!dateKey) return false
  const d = new Date(`${dateKey}T00:00:00`)
  const now = new Date()
  if (val === 'this-month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }
  if (val === 'last-month') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth()
  }
  if (val === 'ytd') return d.getFullYear() === now.getFullYear()
  return true
}

// The employee's own task board. Self-created tasks can be edited and deleted;
// manager-assigned tasks follow a submit-for-closure → manager approval flow.
export default function EmployeeTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editTaskId, setEditTaskId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openTaskId, setOpenTaskId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

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
      if (key === 'status') return statusLabel(t.status)
      return t[key]
    },
    initialSortKey: 'dueDate',
    initialSortDir: 'asc',
    filterFns: {
      status: (t, val) => t.status === val,
      priority: (t, val) => t.priority === val,
      assignedDuring: (t, val) => inAssignedDuring(t.createdOn, val),
      quick: (t, val) => (val === 'overdue' ? isOverdue(t) : chartBucketKey(t) === val)
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
  const editTask = tasks.find((t) => t.id === editTaskId) || null

  function nameOf(id) {
    if (id === user.id) return user.name
    const emp = getEmployeeById(id)
    return emp?.name || id
  }

  function assignerLabel(task) {
    if (task.createdById === task.assigneeId) return 'Myself'
    return nameOf(task.createdById)
  }

  function bump() {
    setRefresh((n) => n + 1)
  }

  function handleCreate(data) {
    addTask({ ...data, createdById: user.id })
    bump()
    setShowForm(false)
  }

  function handleEdit(data) {
    if (!editTask) return
    updateTaskByAssignee(editTask.id, user.id, data)
    bump()
    setEditTaskId(null)
  }

  function move(id, status) {
    updateTaskStatusByEmployee(id, user.id, status)
    bump()
  }

  function handleDelete(id) {
    setDeleteId(id)
  }

  function confirmDelete() {
    if (deleteId) {
      deleteTaskByAssignee(deleteId, user.id)
      setDeleteId(null)
      bump()
    }
  }

  function cancelDelete() {
    setDeleteId(null)
  }

  function handleTaskReply(text) {
    if (!openTask) return
    addTaskMessage(openTask.id, { byId: user.id, text })
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

  function statusCell(task) {
    const options = employeeStatusOptions(task)

    if (isEmployeeStatusLocked(task)) {
      return (
        <div>
          <span className={`tag ${statusTagClass(task.status)}`}>
            {statusLabel(task.status)}
          </span>
          {closureNotice(task, nameOf) && (
            <div className="muted small">{closureNotice(task, nameOf)}</div>
          )}
        </div>
      )
    }

    return (
      <div>
        <select
          value={task.status}
          onChange={(e) => move(task.id, e.target.value)}
          className="btn-tiny"
        >
          {options.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        {closureNotice(task, nameOf) && (
          <div className="muted small">{closureNotice(task, nameOf)}</div>
        )}
      </div>
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

      <TaskStatusChart
        tasks={tasks}
        activeKey={table.filters.quick && table.filters.quick !== 'all' ? table.filters.quick : null}
        onToggleKey={(key) =>
          table.setFilter('quick', table.filters.quick === key ? 'all' : key)
        }
      />

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Add a task for myself">
          <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Add a task for myself</h3>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={() => setShowForm(false)}
                 aria-label="Close"><X size={15} /></button>
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

      {editTask && (
        <Modal onClose={() => setEditTaskId(null)} title="Edit task">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit task</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setEditTaskId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <TaskForm
              defaultAssigneeId={user.id}
              initial={editTask}
              submitLabel="Save changes"
              onCreate={handleEdit}
              onCancel={() => setEditTaskId(null)}
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
               aria-label="Close"><X size={15} /></button>
            </div>
            {openTask.description && (
              <p className="hint first">{openTask.description}</p>
            )}
            {closureNotice(openTask, nameOf) && (
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
              key: 'assignedDuring',
              label: 'Assigned During',
              value: table.filters.assignedDuring || 'all',
              options: ASSIGNED_DURING_FILTER_OPTS
            },
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
          actions={
            table.filters.quick && table.filters.quick !== 'all' ? (
              <button
                type="button"
                className="quick-filter-chip"
                onClick={() => table.setFilter('quick', 'all')}
                aria-label={`Clear ${QUICK_FILTER_LABELS[table.filters.quick]} filter`}
              >
                {QUICK_FILTER_LABELS[table.filters.quick]}
                <X size={13} aria-hidden="true" />
              </button>
            ) : null
          }
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '17%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned by" keyName="createdBy" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Assigned on" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Due Date" keyName="dueDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={8} message="No tasks match your filters." />
            )}
            {tasksPage.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong></td>
                <td className="cell-ellipsis" title={task.description || undefined}>{task.description || <span className="muted">--</span>}</td>
                <td>{assignerLabel(task)}</td>
                <td>
                  {task.createdOn ? formatDate(task.createdOn) : <span className="muted">--</span>}
                </td>
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
                        {!isSelfAssigned(task) && (
                          <button
                            className="task-menu-item"
                            onClick={() => {
                              setOpenTaskId(task.id)
                              closeMenu()
                            }}
                            disabled={!canEmployeeAskQuestion(task)}
                          >
                            Ask question
                          </button>
                        )}
                        {canEmployeeEditTask(task, user.id) && (
                          <button
                            className="task-menu-item"
                            onClick={() => {
                              setEditTaskId(task.id)
                              closeMenu()
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {canEmployeeDeleteTask(task, user.id) && (
                          <button
                            className="task-menu-item task-menu-item-danger"
                            onClick={() => {
                              handleDelete(task.id)
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
        Tip: click the To do, In progress, Done, or Overdue cards above to show only those tasks; click again to see everything.
        Tasks you create for yourself can be edited, deleted, and marked done from the status dropdown.
        Tasks from your manager can be marked done from the status dropdown when finished, and changed back to To do or In progress if needed.
        Your manager must approve before the task is closed.
        Use the <strong>three-dot</strong> menu on manager-assigned tasks to ask questions while the task is still open.
      </p>
    </div>
  )
}
