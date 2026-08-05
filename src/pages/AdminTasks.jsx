import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTask,
  deleteTask,
  getEmployees,
  getTasks,
  updateTaskStatus
} from '../data/store.js'
import TaskBoard from '../components/TaskBoard.jsx'
import TaskForm from '../components/TaskForm.jsx'

// HR/Admin view of every task in the company, with a filter by person.
export default function AdminTasks() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [filter, setFilter] = useState('all')  // 'all' or an employee id

  // Everyone who can hold a task (real employees).
  const people = useMemo(
    () => getEmployees().filter((e) => e.role === 'employee'),
    []
  )

  const allTasks = useMemo(() => getTasks(), [refresh])

  const tasks = useMemo(
    () => (filter === 'all' ? allTasks : allTasks.filter((t) => t.assigneeId === filter)),
    [allTasks, filter]
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

  return (
    <div>
      <div className="page-head">
        <h2>Tasks</h2>
        <label className="field inline">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Everyone ({allTasks.length})</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      <TaskBoard
        tasks={tasks}
        nameOf={nameOf}
        onMove={move}
        onDelete={remove}
        showAssignee
      />

      <h3 className="section-title">Create a task for anyone</h3>
      <TaskForm people={people} onCreate={handleCreate} />

      <p className="hint">
        Managers are set on the Employees page. A manager sees their own team
        under &ldquo;Team Tasks&rdquo;; here you can see and manage everyone.
      </p>
    </div>
  )
}
