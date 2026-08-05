// Small helpers for the Tasks (Planner-style) board.

import { TASK_STATUSES, TASK_PRIORITIES } from '../data/sampleData.js'

// Turn a status key into its label ('todo' -> 'To do').
export function statusLabel(key) {
  const found = TASK_STATUSES.find((s) => s.key === key)
  return found ? found.label : key
}

// Turn a priority key into its label ('high' -> 'High').
export function priorityLabel(key) {
  const found = TASK_PRIORITIES.find((p) => p.key === key)
  return found ? found.label : key
}

// A CSS class to colour the priority tag.
export function priorityTagClass(key) {
  if (key === 'high') return 'tag-high'
  if (key === 'medium') return 'tag-medium'
  return 'tag-low'
}

// Split a list of tasks into { todo: [...], inprogress: [...], done: [...] }.
export function groupByStatus(tasks) {
  const groups = {}
  for (const s of TASK_STATUSES) groups[s.key] = []
  for (const t of tasks) {
    if (groups[t.status]) groups[t.status].push(t)
    else groups.todo.push(t)
  }
  return groups
}

// The next column to the right (or null if already at the last one).
export function nextStatus(key) {
  const i = TASK_STATUSES.findIndex((s) => s.key === key)
  return i >= 0 && i < TASK_STATUSES.length - 1 ? TASK_STATUSES[i + 1].key : null
}

// The column to the left (or null if already at the first one).
export function prevStatus(key) {
  const i = TASK_STATUSES.findIndex((s) => s.key === key)
  return i > 0 ? TASK_STATUSES[i - 1].key : null
}

// True if the task's due date has passed and it is not done yet.
export function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(task.dueDate) < today
}
