import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTask,
  deleteTask,
  getTasks,
  getTeamMembers,
  updateTaskStatus
} from '../data/store.js'
import { TASK_STATUSES, TASK_PRIORITIES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import TaskForm from '../components/TaskForm.jsx'

// A manager's board: tasks for the whole team (and the manager). The manager
// can create tasks for any team member or themselves, move them, and remove them.
export default function TeamTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [openMenuId, setOpenMenuId] = useState(null)

  // The team plus the manager themselves (they can own tasks too).
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

  function nameOf(id) {
    const found = people.find((p) => p.id === id)
    return found ? found.name : id
  }

  function handleCreate(data) {
    addTask({ ...data, createdById: user.id })
    setRefresh((n) => n + 1)
  }

  function move(id, status) {
    updateTaskStatus(id, status)
    setRefresh((n) => n + 1)
  }

  function remove(id) {
    deleteTask(id)
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

  // Only managers should reach this page.
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
        <span className="muted">{people.length - 1} team member(s)</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr><td colSpan={7} className="muted">No tasks yet.</td></tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong></td>
                <td>{task.description || <span className="muted">--</span>}</td>
                <td>{nameOf(task.assigneeId)}</td>
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
                        <button
                          className="task-menu-item"
                          onClick={() => {
                            remove(task.id)
                            closeMenu()
                          }}
                        >
                          Delete
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

      <h3 className="section-title">Assign a new task</h3>
      <TaskForm people={people} onCreate={handleCreate} />

      <p className="hint">
        You can assign tasks to anyone on your team or to yourself. Team members
        see their own tasks under &ldquo;My Tasks&rdquo;.
      </p>
    </div>
  )
}
