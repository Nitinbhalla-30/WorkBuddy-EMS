import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTask,
  addTaskMessageByAdmin,
  deleteTask,
  getEmployeeById,
  getEmployees,
  getTasks,
  updateTaskByAdmin,
  updateTaskStatus
} from '../data/store.js'
import { TASK_PRIORITIES, TASK_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import {
  QUICK_FILTER_LABELS,
  chartBucketKey,
  isOverdue,
  priorityLabel,
  priorityTagClass,
  statusLabel
} from '../utils/tasks.js'
import TaskForm from '../components/TaskForm.jsx'
import TaskThread from '../components/TaskThread.jsx'
import { TaskStatusChart } from '../components/tasks/TaskStatusChart'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { ListTodo, MessagesSquare, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'

const TASK_STATUS_FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...TASK_STATUSES.map((s) => ({ value: s.key, label: s.label }))
]
const TASK_PRIORITY_FILTER_OPTS = [
  { value: 'all', label: 'All priorities' },
  ...TASK_PRIORITIES.map((p) => ({ value: p.key, label: p.label }))
]

// HR/Admin view of every task in the company, shown as a table with
// filters by person, status and priority, plus a popup to create tasks.
export default function AdminTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editTaskId, setEditTaskId] = useState(null)
  const [followUpId, setFollowUpId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  // Everyone who can hold a task (real employees).
  const people = useMemo(
    () => getEmployees().filter((e) => e.role === 'employee'),
    []
  )

  const allTasks = useMemo(() => getTasks(), [refresh])

  const TASK_ASSIGNEE_FILTER_OPTS = useMemo(
    () => [
      { value: 'all', label: 'Everyone' },
      ...people.map((p) => ({ value: p.id, label: p.name }))
    ],
    [people]
  )

  function nameOf(id) {
    const found = people.find((p) => p.id === id)
    if (found) return found.name
    return getEmployeeById(id)?.name || id
  }

  const table = useTableControls(allTasks, {
    getSearchText: (t) =>
      [t.title, t.description, nameOf(t.assigneeId), statusLabel(t.status), priorityLabel(t.priority), t.dueDate].join(' '),
    getSortValue: (t, key) => {
      if (key === 'assignee') return nameOf(t.assigneeId)
      if (key === 'status') return statusLabel(t.status)
      return t[key]
    },
    initialSortKey: 'dueDate',
    initialSortDir: 'asc',
    filterFns: {
      assignee: (t, val) => t.assigneeId === val,
      status: (t, val) => t.status === val,
      priority: (t, val) => t.priority === val,
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

  const editTask = allTasks.find((t) => t.id === editTaskId) || null
  const followUpTask = allTasks.find((t) => t.id === followUpId) || null

  function bump() {
    setRefresh((n) => n + 1)
  }

  function handleCreate(data) {
    addTask({ ...data, createdById: user.id })
    setShowForm(false)
    bump()
  }

  function handleEdit(data) {
    if (!editTask) return
    updateTaskByAdmin(editTask.id, data)
    setEditTaskId(null)
    bump()
  }

  function handleFollowUpReply(text) {
    if (!followUpTask) return
    addTaskMessageByAdmin(followUpTask.id, { byId: user.id, text })
    bump()
  }

  function move(id, status) {
    updateTaskStatus(id, status)
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

  function toggleMenu(taskId) {
    setOpenMenuId(openMenuId === taskId ? null : taskId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  function handleMenuOutside(event) {
    if (openMenuId && !event.target.closest('.task-menu-container')) {
      closeMenu()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleMenuOutside)
    return () => document.removeEventListener('mousedown', handleMenuOutside)
  }, [openMenuId])

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <ListTodo size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Tasks
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Assign, track, and manage tasks across the company</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="muted">{allTasks.length} task(s)</span>
        </div>
      </div>

      <TaskStatusChart
        tasks={allTasks}
        activeKey={table.filters.quick && table.filters.quick !== 'all' ? table.filters.quick : null}
        onToggleKey={(key) =>
          table.setFilter('quick', table.filters.quick === key ? 'all' : key)
        }
      />

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Create a task for anyone">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Create a task for anyone</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setShowForm(false)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              Assign a task to an employee and track its progress through To do, In progress, and Done.
            </p>
            <TaskForm
              people={people}
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
              key={editTask.id}
              people={people}
              initial={editTask}
              submitLabel="Save changes"
              onCreate={handleEdit}
              onCancel={() => setEditTaskId(null)}
            />
          </div>
        </Modal>
      )}

      {followUpTask && (
        <Modal onClose={() => setFollowUpId(null)} title={followUpTask.title}>
          <div className="modal-form">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>{followUpTask.title}</h3>
                <div className="muted small">
                  Assigned to {nameOf(followUpTask.assigneeId)}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setFollowUpId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            {followUpTask.description && (
              <p className="hint first">{followUpTask.description}</p>
            )}
            <TaskThread
              task={followUpTask}
              viewerId={user.id}
              nameOf={nameOf}
              onReply={handleFollowUpReply}
              onClose={() => setFollowUpId(null)}
              allowPost
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
              key: 'assignee',
              label: 'Assigned to',
              value: table.filters.assignee || 'all',
              options: TASK_ASSIGNEE_FILTER_OPTS
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
            <>
              {table.filters.quick && table.filters.quick !== 'all' ? (
                <button
                  type="button"
                  className="quick-filter-chip"
                  onClick={() => table.setFilter('quick', 'all')}
                  aria-label={`Clear ${QUICK_FILTER_LABELS[table.filters.quick]} filter`}
                >
                  {QUICK_FILTER_LABELS[table.filters.quick]}
                  <X size={13} aria-hidden="true" />
                </button>
              ) : null}
              <button
                className="btn btn-primary btn-tiny"
                onClick={() => setShowForm(true)}
              >
                <Plus size={14} style={{ marginRight: 4 }} aria-hidden="true" />Create a task
              </button>
            </>
          }
        />
        <table className="table">
          <colgroup>
            <col style={{ width: '19%' }} />
            <col style={{ width: '18.5%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '9.5%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '7%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Assigned to" keyName="assignee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Description" keyName="description" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Priority" keyName="priority" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Due Date" keyName="dueDate" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={7} message="No tasks match your filters." />
            )}
            {tasksPage.map((task) => {
              const assignee = getEmployeeById(task.assigneeId)
              return (
              <tr key={task.id}>
                <td>
                  <div className="person-cell">
                    <Avatar src={assignee?.photoUrl} name={nameOf(task.assigneeId)} size={34} />
                    <span>{nameOf(task.assigneeId)}</span>
                  </div>
                </td>
                <td><strong>{task.title}</strong></td>
                <td className="cell-ellipsis" title={task.description || undefined}>{task.description || <span className="muted">--</span>}</td>
                <td>
                  <span className={`tag ${priorityTagClass(task.priority)}`}>
                    {priorityLabel(task.priority)}
                  </span>
                </td>
                <td>
                  <select
                    className="btn-tiny"
                    value={task.status}
                    aria-label={`Set status for ${task.title}`}
                    onChange={(e) => move(task.id, e.target.value)}
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
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(task.id)}
                      aria-label="Task actions"
                     ><MoreVertical size={16} /></button>
                    {openMenuId === task.id && (
                      <div className="task-menu-dropdown">
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            setEditTaskId(task.id)
                            closeMenu()
                          }}
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            setFollowUpId(task.id)
                            closeMenu()
                          }}
                        >
                          <MessagesSquare size={14} aria-hidden="true" />
                          Follow-up
                        </button>
                        <button
                          type="button"
                          className="task-menu-item task-menu-item-danger"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          Delete
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
              This will permanently delete the task and all its conversation. You will not be able to recover it.
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
        <strong>Quick filters:</strong> click the To do, In progress, Done, or Overdue cards above to show only those tasks; click again to see all.
        Managers are assigned on the Employees page. A manager sees their own team under &ldquo;My Team&rdquo;;
        here you can view and manage tasks for all employees across the organisation.
      </p>
    </div>
  )
}
