import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { addTask, getTasksForAssignee, updateTaskStatus } from '../data/store.js'
import { TASK_STATUSES, TASK_PRIORITIES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import TaskForm from '../components/TaskForm.jsx'

// The employee's own task board. They can add tasks for themselves and move
// them across the columns.
export default function EmployeeTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [openMenuId, setOpenMenuId] = useState(null)

  const tasks = useMemo(
    () => getTasksForAssignee(user.id),
    [user.id, refresh]
  )

  function handleCreate(data) {
    addTask({ ...data, createdById: user.id })
    setRefresh((n) => n + 1)
  }

  function move(id, status) {
    updateTaskStatus(id, status)
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
        <span className="muted">{tasks.length} task(s)</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr><td colSpan={6} className="muted">No tasks yet.</td></tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong></td>
                <td>{task.description || <span className="muted">--</span>}</td>
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
      </div>

      <h3 className="section-title">Add a task for myself</h3>
      <TaskForm defaultAssigneeId={user.id} onCreate={handleCreate} />

      <p className="hint">
        Change the status dropdown to move tasks between To do, In progress, and Done.
      </p>
    </div>
  )
}
