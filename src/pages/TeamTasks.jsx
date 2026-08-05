import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTask,
  deleteTask,
  getTasks,
  getTeamMembers,
  updateTaskStatus
} from '../data/store.js'
import TaskBoard from '../components/TaskBoard.jsx'
import TaskForm from '../components/TaskForm.jsx'

// A manager's board: tasks for the whole team (and the manager). The manager
// can create tasks for any team member or themselves, move them, and remove them.
export default function TeamTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)

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

      <TaskBoard
        tasks={tasks}
        nameOf={nameOf}
        onMove={move}
        onDelete={remove}
        showAssignee
      />

      <h3 className="section-title">Assign a new task</h3>
      <TaskForm people={people} onCreate={handleCreate} />

      <p className="hint">
        You can assign tasks to anyone on your team or to yourself. Team members
        see their own tasks under &ldquo;My Tasks&rdquo;.
      </p>
    </div>
  )
}
