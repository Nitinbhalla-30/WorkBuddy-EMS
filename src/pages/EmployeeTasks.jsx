import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { addTask, getTasksForAssignee, updateTaskStatus } from '../data/store.js'
import TaskBoard from '../components/TaskBoard.jsx'
import TaskForm from '../components/TaskForm.jsx'

// The employee's own task board. They can add tasks for themselves and move
// them across the columns.
export default function EmployeeTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)

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

  return (
    <div>
      <div className="page-head">
        <h2>My Tasks</h2>
        <span className="muted">{tasks.length} task(s)</span>
      </div>

      <TaskBoard tasks={tasks} onMove={move} />

      <h3 className="section-title">Add a task for myself</h3>
      <TaskForm defaultAssigneeId={user.id} onCreate={handleCreate} />

      <p className="hint">
        Use the arrow buttons on a card to move it from To do to In progress to
        Done.
      </p>
    </div>
  )
}
