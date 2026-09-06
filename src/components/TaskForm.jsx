import { useState } from 'react'
import { TASK_PRIORITIES } from '../data/sampleData.js'

// A form to create or edit a task.
// Props:
//   people    - list of { id, name } who can be picked as assignee.
//               If null/empty, the task is assigned to defaultAssigneeId (self).
//   defaultAssigneeId - who to assign to when there is no picker.
//   initial   - optional existing task fields for edit mode.
//   submitLabel - button label (default "Add task").
//   onCreate  - function({ title, description, assigneeId, dueDate, priority })
export default function TaskForm({
  people,
  defaultAssigneeId,
  initial,
  submitLabel = 'Add task',
  onCreate,
  onCancel
}) {
  const hasPicker = Array.isArray(people) && people.length > 0
  const isEdit = Boolean(initial)

  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [assigneeId, setAssigneeId] = useState(
    initial?.assigneeId || defaultAssigneeId || (hasPicker ? people[0].id : '')
  )
  const [dueDate, setDueDate] = useState(initial?.dueDate || '')
  const [priority, setPriority] = useState(initial?.priority || 'medium')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Please type a task title.')
      return
    }
    onCreate({
      title: title.trim(),
      description: description.trim(),
      assigneeId: hasPicker ? assigneeId : defaultAssigneeId,
      dueDate,
      priority
    })
    if (!isEdit) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
    }
  }

  return (
    <form className={onCancel ? undefined : 'card'} onSubmit={handleSubmit}>
      {error && <div className="error-box first">{error}</div>}

      <div className="two-col">
        <label className="field">
          <span>Task title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Prepare monthly report"
          />
        </label>
        {hasPicker && !isEdit && (
          <label className="field">
            <span>Assign to</span>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="field">
        <span>Details (optional)</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short note about the task"
        />
      </label>

      <div className="two-col">
        <label className="field">
          <span>Due date (optional)</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="button-row">
        <button className="btn btn-primary" type="submit">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
