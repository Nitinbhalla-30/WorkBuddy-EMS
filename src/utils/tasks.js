// Small helpers for the Tasks (Planner-style) board.

import { TASK_STATUSES, TASK_PRIORITIES } from '../data/sampleData.js'
import { formatDate } from './attendance.js'

// Three buckets for the employee dashboard chart.
export const TASK_CHART_BUCKETS = [
  { key: 'todo', label: 'To do', statuses: ['todo'] },
  { key: 'inprogress', label: 'In progress', statuses: ['inprogress'] },
  { key: 'done', label: 'Done', statuses: ['done', 'closed'] }
]

export const EMPLOYEE_SELF_STATUSES = ['todo', 'inprogress', 'done']
export const EMPLOYEE_ASSIGNED_STATUSES = ['todo', 'inprogress', 'done']
export const MANAGER_ASSIGNED_STATUSES = ['todo', 'inprogress']

// Labels for the quick-filter cards (To do / In progress / Done / Overdue)
// used by the task stat cards on the employee and admin task pages.
export const QUICK_FILTER_LABELS = {
  todo: 'To do',
  inprogress: 'In progress',
  done: 'Done',
  overdue: 'Overdue only'
}

// Turn a status key into its label ('todo' -> 'To do').
export function statusLabel(key) {
  if (key === 'pending_closure') return 'Done' // legacy sample data
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

export function statusTagClass(key) {
  if (key === 'done' || key === 'closed') return 'tag-ok'
  if (key === 'inprogress' || key === 'pending_closure') return 'tag-late'
  return 'tag-absent'
}

export function isSelfAssigned(task) {
  return task.createdById === task.assigneeId
}

export function isManagerAssignedDone(task) {
  return !isSelfAssigned(task) && task.status === 'done'
}

export function isEmployeeStatusLocked(task) {
  return task.status === 'closed'
}

export function isTaskComplete(task) {
  if (isSelfAssigned(task)) return task.status === 'done'
  return task.status === 'done' || task.status === 'closed'
}

export function chartBucketKey(task) {
  const status = task.status === 'pending_closure' ? 'done' : task.status
  if (isSelfAssigned(task) && status === 'done') return 'done'
  if (!isSelfAssigned(task) && status === 'done') return 'inprogress'
  if (status === 'closed') return 'done'
  if (status === 'inprogress') return 'inprogress'
  return 'todo'
}

export function closureNotice(task, nameOf) {
  if (isManagerAssignedDone(task) && task.completedOn) {
    return `Marked done on ${formatDate(task.completedOn)}. Waiting for ${nameOf(task.createdById)} to approve.`
  }
  if (task.status === 'closed' && task.closedBy) {
    return `Closed by ${nameOf(task.closedBy)} on ${formatDate(task.closedOn)}.`
  }
  return null
}

export function employeeStatusOptions(task) {
  if (isEmployeeStatusLocked(task)) {
    return TASK_STATUSES.filter((s) => s.key === task.status)
  }
  if (isSelfAssigned(task)) {
    return TASK_STATUSES.filter((s) => EMPLOYEE_SELF_STATUSES.includes(s.key))
  }
  return TASK_STATUSES.filter((s) => EMPLOYEE_ASSIGNED_STATUSES.includes(s.key))
}

export function managerStatusOptions(task, managerId) {
  if (isSelfAssigned(task) && task.assigneeId === managerId) {
    return TASK_STATUSES.filter((s) => EMPLOYEE_SELF_STATUSES.includes(s.key))
  }
  if (task.createdById === managerId && !isSelfAssigned(task)) {
    if (task.status === 'done' || task.status === 'closed') {
      return TASK_STATUSES.filter((s) => s.key === task.status)
    }
    return TASK_STATUSES.filter((s) => MANAGER_ASSIGNED_STATUSES.includes(s.key))
  }
  return TASK_STATUSES.filter((s) => s.key === task.status)
}

export function canEmployeeAskQuestion(task) {
  if (isSelfAssigned(task)) return false
  if (task.status === 'done' || task.status === 'closed') return false
  return true
}

export function canEmployeeEditTask(task, employeeId) {
  return task.assigneeId === employeeId && isSelfAssigned(task) && task.status !== 'closed'
}

export function canEmployeeDeleteTask(task, employeeId) {
  return task.assigneeId === employeeId && isSelfAssigned(task)
}

export function canManagerChangeStatus(task, managerId) {
  if (isSelfAssigned(task) && task.assigneeId === managerId) return true
  if (task.createdById === managerId && !isSelfAssigned(task)) {
    return task.status !== 'done' && task.status !== 'closed'
  }
  return false
}

export function canManagerApproveDone(task, managerId) {
  return task.createdById === managerId && isManagerAssignedDone(task)
}

// Split a list of tasks into columns by status key.
export function groupByStatus(tasks) {
  const groups = {}
  for (const s of TASK_STATUSES) groups[s.key] = []
  for (const t of tasks) {
    const key = t.status === 'pending_closure' ? 'done' : t.status
    if (groups[key]) groups[key].push(t)
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

// True if the task's due date has passed and it is not finished yet.
export function isOverdue(task) {
  if (!task.dueDate || isTaskComplete(task)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(task.dueDate) < today
}
