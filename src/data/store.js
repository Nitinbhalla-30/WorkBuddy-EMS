// The app's data store. When Supabase is configured (.env) it is the source
// of truth: everything is loaded from Supabase at startup and every change
// is written back to it. localStorage doubles as an offline cache. Without
// Supabase the app falls back to the old localStorage-only mode.

import { supabase } from './supabaseClient.js'
import {
  DEFAULT_SETTINGS,
  SAMPLE_EMPLOYEES,
  SAMPLE_ATTENDANCE,
  SAMPLE_LEAVES,
  SAMPLE_TASKS,
  SAMPLE_PROFILES,
  SAMPLE_TICKETS,
  SAMPLE_VEHICLES,
  SAMPLE_DRIVERS,
  SAMPLE_TRIPS,
  SAMPLE_CAB_ASSIGNMENTS,
  SAMPLE_CAB_REQUESTS,
  SAMPLE_CAB_MESSAGES,
  SAMPLE_IT_ISSUES,
  SAMPLE_IT_STAFF,
  SAMPLE_ANNOUNCEMENTS,
  SAMPLE_REIMBURSEMENTS,
  SAMPLE_ATTENDANCE_CORRECTIONS
} from './sampleData.js'
import { blankProfile } from '../utils/profile.js'
import { combineDateAndTime } from '../utils/attendance.js'
import { isManagerLeaveExpired } from '../utils/leaves.js'

const KEYS = {
  employees: 'hr_employees',
  attendance: 'hr_attendance',
  leaves: 'hr_leaves',
  settings: 'hr_settings',
  tasks: 'hr_tasks',
  profiles: 'hr_profiles',
  tickets: 'hr_tickets',
  vehicles: 'hr_vehicles',
  drivers: 'hr_drivers',
  trips: 'hr_trips',
  cabAssignments: 'hr_cab_assignments',
  cabRequests: 'hr_cab_requests',
  cabMessages: 'hr_cab_messages',
  cabCancellations: 'hr_cab_cancellations',
  itIssues: 'hr_it_issues',
  itStaff: 'hr_it_staff',
  announcements: 'hr_announcements',
  readAnnouncements: 'hr_read_announcements',
  reimbursements: 'hr_reimbursements',
  attendanceCorrections: 'hr_attendance_corrections',
  notificationReads: 'hr_notification_reads'
}

// In-memory cache of every collection; reads hit this first.
const mem = {}
let remoteReady = false
let initPromise = null
const pendingPush = {}

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeLocal(key, value) {
  mem[key] = value
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded (the load-test dataset is larger than the browser's
    // ~5 MB limit): keep working from the in-memory copy instead of failing.
  }
}

function read(key, fallback) {
  if (key in mem) return mem[key]
  return readLocal(key, fallback)
}

// Save a collection locally and sync it to Supabase (debounced per key so a
// burst of changes becomes one upsert).
function write(key, value) {
  writeLocal(key, value)
  if (!supabase || !remoteReady) return
  clearTimeout(pendingPush[key])
  pendingPush[key] = setTimeout(() => {
    supabase
      .from('app_store')
      .upsert({ key, value: mem[key], updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.warn(`Supabase write failed for ${key}:`, error.message)
      })
  }, 250)
}

// Defaults used to seed a brand-new store (sample data for most keys).
const DEFAULTS = {
  [KEYS.employees]: SAMPLE_EMPLOYEES,
  [KEYS.attendance]: SAMPLE_ATTENDANCE,
  [KEYS.leaves]: SAMPLE_LEAVES,
  [KEYS.settings]: DEFAULT_SETTINGS,
  [KEYS.tasks]: SAMPLE_TASKS,
  [KEYS.profiles]: SAMPLE_PROFILES,
  [KEYS.tickets]: SAMPLE_TICKETS,
  [KEYS.vehicles]: SAMPLE_VEHICLES,
  [KEYS.drivers]: SAMPLE_DRIVERS,
  [KEYS.trips]: SAMPLE_TRIPS,
  [KEYS.cabAssignments]: SAMPLE_CAB_ASSIGNMENTS,
  [KEYS.cabRequests]: SAMPLE_CAB_REQUESTS,
  [KEYS.cabMessages]: SAMPLE_CAB_MESSAGES,
  [KEYS.itIssues]: SAMPLE_IT_ISSUES,
  [KEYS.itStaff]: SAMPLE_IT_STAFF,
  [KEYS.announcements]: SAMPLE_ANNOUNCEMENTS,
  [KEYS.readAnnouncements]: {},
  [KEYS.reimbursements]: SAMPLE_REIMBURSEMENTS,
  [KEYS.attendanceCorrections]: SAMPLE_ATTENDANCE_CORRECTIONS,
  [KEYS.notificationReads]: {}
}

// Bootstrap the store before the app renders. With Supabase: load every
// collection from app_store, or upload the local data the first time.
// Always resolves; on any failure the app keeps working from localStorage.
export function initStore() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    if (!supabase) {
      seedIfEmpty()
      return
    }
    try {
      const { data, error } = await supabase.from('app_store').select('key,value')
      if (error) throw error
      remoteReady = true
      if (data && data.some((row) => row.key === KEYS.employees)) {
        // A real dataset is present — trust it fully. Overwrite every local
        // copy (including stale sample data seeded after a failed load) so
        // the browser can never drift away from what Supabase holds.
        for (const row of data) {
          mem[row.key] = row.value
          try {
            localStorage.setItem(row.key, JSON.stringify(row.value))
          } catch {
            // Storage quota exceeded: keep the value in memory only so the
            // app still runs on the full dataset for this session.
          }
        }
        for (const key of Object.values(KEYS)) {
          if (!(key in mem)) localStorage.removeItem(key)
        }
      } else if (data && data.length > 0) {
        // First run on this project: migrate whatever this browser already
        // has (or the sample data when there is nothing) up to Supabase.
        seedIfEmpty()
        const rows = Object.values(KEYS)
          .map((key) => ({
            key,
            value: key in mem ? mem[key] : readLocal(key, null),
            updated_at: new Date().toISOString()
          }))
          .filter((r) => r.value !== null && r.value !== undefined)
        const { error: upErr } = await supabase.from('app_store').upsert(rows)
        if (upErr) throw upErr
      }
      // Cover keys introduced by newer versions of the app.
      seedIfEmpty()
    } catch (err) {
      console.warn('Supabase is not reachable; continuing with local storage.', err)
      remoteReady = false
      seedIfEmpty()
    }
  })()
  return initPromise
}

// Put sample data in place the first time the app runs.
export function seedIfEmpty() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (!(key in mem) && localStorage.getItem(key) === null) {
      writeLocal(key, value)
    }
  }
}

// Wipe everything and load fresh sample data (handy while testing).
export function resetToSampleData() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    write(key, value)
  }
}

// ---- employees ----
export function getEmployees() {
  return read(KEYS.employees, [])
}

export function getEmployeeById(id) {
  return getEmployees().find((e) => e.id === id) || null
}

// Update one employee's salary structure. `salary` = { basic, hra, other, tdsMonthly }.
export function updateEmployeeSalary(employeeId, salary) {
  const all = getEmployees()
  const idx = all.findIndex((e) => e.id === employeeId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], salary: { ...all[idx].salary, ...salary } }
  write(KEYS.employees, all)
  return all[idx]
}

// Update one employee's team info. `team` = { isManager, managerId }.
export function updateEmployeeTeam(employeeId, team) {
  const all = getEmployees()
  const idx = all.findIndex((e) => e.id === employeeId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...team }
  write(KEYS.employees, all)
  return all[idx]
}

// The people who report to a given manager (only real employees).
export function getTeamMembers(managerId) {
  return getEmployees().filter(
    (e) => e.role === 'employee' && e.managerId === managerId
  )
}

// Full team roster for the My Team screen: manager/lead plus everyone on the same team.
export function getMyTeammates(employeeId) {
  const emp = getEmployees().find((e) => e.id === employeeId)
  if (!emp || emp.role !== 'employee') return []

  if (emp.isManager) {
    const members = getTeamMembers(employeeId)
    return [emp, ...members]
  }

  if (!emp.managerId) return []

  const manager = getEmployeeById(emp.managerId)
  const peers = getEmployees().filter(
    (e) => e.role === 'employee' && e.managerId === emp.managerId
  )
  return manager ? [manager, ...peers] : peers
}

// Teammate rows with contact details for the My Team directory.
export function getMyTeamDirectory(employeeId) {
  return getMyTeammates(employeeId).map((e) => {
    const profile = getProfileForEmployee(e.id)
    const manager = e.managerId ? getEmployeeById(e.managerId) : null
    return {
      id: e.id,
      name: e.name,
      photoUrl: profile?.personal?.photo?.dataUrl || '',
      mobile: profile?.personal?.contactNumber || '',
      email: e.email || '',
      designation: e.designation || e.department || '',
      reportsTo: manager?.name || ''
    }
  })
}

// ---- settings ----
export function getSettings() {
  // Merge with defaults so new settings (added in later phases) always exist,
  // even for people who saved settings before those fields were added.
  const saved = read(KEYS.settings, {})
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    leaveAllowance: {
      ...DEFAULT_SETTINGS.leaveAllowance,
      ...(saved.leaveAllowance || {})
    },
    salary: {
      ...DEFAULT_SETTINGS.salary,
      ...(saved.salary || {})
    },
    lunchPolicy: {
      ...DEFAULT_SETTINGS.lunchPolicy,
      ...(saved.lunchPolicy || {})
    },
    companyHolidays: saved.companyHolidays ?? DEFAULT_SETTINGS.companyHolidays
  }
}

export function saveSettings(next) {
  write(KEYS.settings, next)
  return next
}

// ---- attendance ----
export function getAttendance() {
  return read(KEYS.attendance, [])
}

export function getAttendanceForEmployee(employeeId) {
  return getAttendance()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

function todayKey() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Find today's record for an employee, or make a blank one.
export function getTodayRecord(employeeId) {
  const all = getAttendance()
  const today = todayKey()
  let rec = all.find((r) => r.employeeId === employeeId && r.date === today)
  if (!rec) {
    rec = {
      id: `ATT${Date.now()}`,
      employeeId,
      date: today,
      timeIn: null,
      timeOut: null,
      breaks: []
    }
  }
  return rec
}

// Save (insert or update) a record.
export function upsertRecord(record) {
  const all = getAttendance()
  const idx = all.findIndex((r) => r.id === record.id)
  if (idx >= 0) {
    all[idx] = record
  } else {
    all.push(record)
  }
  write(KEYS.attendance, all)
  return record
}

// ---- attendance correction requests ----
export function getAttendanceCorrections() {
  return read(KEYS.attendanceCorrections, [])
}

export function getAttendanceCorrectionsForEmployee(employeeId) {
  return getAttendanceCorrections()
    .filter((c) => c.employeeId === employeeId)
    .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1))
}

export function submitAttendanceCorrection({
  employeeId,
  date,
  issueType,
  description,
  suggestedTimeIn = '',
  suggestedTimeOut = ''
}) {
  const all = getAttendanceCorrections()
  const request = {
    id: `ACR${Date.now()}`,
    employeeId,
    date,
    issueType,
    description: description || '',
    suggestedTimeIn: suggestedTimeIn || '',
    suggestedTimeOut: suggestedTimeOut || '',
    status: 'pending',
    appliedOn: todayKey(),
    decidedBy: null,
    decidedOn: null,
    reviewNote: '',
    messages: []
  }
  all.push(request)
  write(KEYS.attendanceCorrections, all)
  return request
}

export function getAttendanceCorrectionById(id) {
  return getAttendanceCorrections().find((c) => c.id === id) || null
}

// Employee edits a pending correction request.
export function updateAttendanceCorrection(id, employeeId, {
  date,
  issueType,
  description,
  suggestedTimeIn = '',
  suggestedTimeOut = ''
}) {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null
  const correction = all[idx]
  if (correction.employeeId !== employeeId) return null
  if (correction.status !== 'pending') return null
  all[idx] = {
    ...correction,
    date,
    issueType,
    description: description || '',
    suggestedTimeIn: suggestedTimeIn || '',
    suggestedTimeOut: suggestedTimeOut || '',
    reviewNote: '',
    decidedBy: null,
    decidedOn: null
  }
  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

// Employee withdraws a pending correction request.
export function withdrawAttendanceCorrection(id, employeeId) {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null
  const correction = all[idx]
  if (correction.employeeId !== employeeId) return null
  if (correction.status !== 'pending') return null
  all[idx] = { ...correction, status: 'withdrawn', withdrawnOn: todayKey() }
  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

// Q&A on a pending correction (employee or HR/Admin).
export function addAttendanceCorrectionMessage(id, { byId, byRole, text }) {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null

  const correction = all[idx]
  if (correction.status !== 'pending') return null

  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  if (byRole === 'employee' && byId !== correction.employeeId) return null
  if (byRole !== 'employee' && byRole !== 'admin') return null

  all[idx] = {
    ...correction,
    messages: [
      ...(correction.messages || []),
      {
        id: `ACM${Date.now()}`,
        byId,
        byRole,
        text: trimmed,
        on: todayKey()
      }
    ]
  }
  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

function findOrCreateAttendanceRecord(employeeId, date) {
  const all = getAttendance()
  let rec = all.find((r) => r.employeeId === employeeId && r.date === date)
  if (rec) return rec
  rec = {
    id: `ATT${Date.now()}`,
    employeeId,
    date,
    timeIn: null,
    timeOut: null,
    breaks: []
  }
  all.push(rec)
  write(KEYS.attendance, all)
  return rec
}

function applyCorrectionToAttendance(correction) {
  const rec = findOrCreateAttendanceRecord(correction.employeeId, correction.date)
  const next = { ...rec, breaks: rec.breaks || [] }

  if (correction.suggestedTimeIn) {
    next.timeIn = combineDateAndTime(correction.date, correction.suggestedTimeIn) || next.timeIn
  }
  if (correction.suggestedTimeOut) {
    next.timeOut = combineDateAndTime(correction.date, correction.suggestedTimeOut) || next.timeOut
  }

  upsertRecord(next)
}

export function resolveAttendanceCorrection(id, status, decidedBy, reviewNote = '') {
  const all = getAttendanceCorrections()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return null

  const correction = all[idx]
  all[idx] = {
    ...correction,
    status,
    decidedBy: decidedBy || null,
    decidedOn: todayKey(),
    reviewNote: reviewNote || ''
  }

  if (status === 'approved') {
    applyCorrectionToAttendance(correction)
  }

  write(KEYS.attendanceCorrections, all)
  return all[idx]
}

// ---- leaves ----
export function getLeaves() {
  const all = read(KEYS.leaves, [])
  // Auto-escalate manager-stage requests whose response window has passed.
  const settings = getSettings()
  const today = todayKey()
  let changed = false
  for (const lv of all) {
    if (lv.status === 'pending' && lv.stage === 'manager' && isManagerLeaveExpired(lv, settings)) {
      lv.stage = 'hr'
      lv.managerStatus = 'escalated'
      lv.escalatedOn = today
      changed = true
    }
  }
  if (changed) write(KEYS.leaves, all)
  return all
}

export function getLeavesForEmployee(employeeId) {
  return getLeaves()
    .filter((l) => l.employeeId === employeeId)
    .sort((a, b) => (a.fromDate < b.fromDate ? 1 : -1))
}

// An employee applies for leave. Returns the saved request.
export function applyLeave({
  employeeId,
  type,
  fromDate,
  toDate,
  reason,
  supportingDocuments = [],
  halfDayPart = null
}) {
  const all = getLeaves()
  const employee = getEmployeeById(employeeId)
  const stage = employee?.managerId ? 'manager' : 'hr'
  const request = {
    id: `LV${Date.now()}`,
    employeeId,
    type,
    fromDate,
    toDate,
    halfDayPart: halfDayPart || null,
    reason: reason || '',
    supportingDocuments: Array.isArray(supportingDocuments) ? supportingDocuments : [],
    messages: [],
    rejectionReason: '',
    status: 'pending',
    stage,
    managerStatus: stage === 'manager' ? 'pending' : null,
    managerDecidedBy: null,
    managerDecidedOn: null,
    escalatedOn: null,
    appliedOn: todayKey(),
    decidedBy: null,
    decidedOn: null
  }
  all.push(request)
  write(KEYS.leaves, all)
  return request
}

// Employee withdraws a pending leave request.
export function withdrawLeave(leaveId, employeeId) {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  const leave = all[idx]
  if (leave.employeeId !== employeeId) return null
  if (leave.status !== 'pending') return null
  all[idx] = { ...leave, status: 'withdrawn', withdrawnOn: todayKey() }
  write(KEYS.leaves, all)
  return all[idx]
}

// Employee edits a pending leave request.
export function updateLeave(leaveId, employeeId, {
  type,
  fromDate,
  toDate,
  reason,
  supportingDocuments = [],
  halfDayPart = null
}) {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  const leave = all[idx]
  if (leave.employeeId !== employeeId) return null
  if (leave.status !== 'pending') return null
  all[idx] = {
    ...leave,
    type,
    fromDate,
    toDate,
    halfDayPart: halfDayPart || null,
    reason: reason || '',
    supportingDocuments: Array.isArray(supportingDocuments) ? supportingDocuments : [],
    rejectionReason: '',
    decidedBy: null,
    decidedOn: null
  }
  write(KEYS.leaves, all)
  return all[idx]
}

// The employee's manager approves or rejects a manager-stage leave request.
// Approval moves it to HR for final approval; rejection ends it.
export function managerDecideLeave(leaveId, managerId, approve, rejectionReason = '') {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  const leave = all[idx]
  if (leave.status !== 'pending' || leave.stage !== 'manager') return null
  const employee = getEmployeeById(leave.employeeId)
  if (!employee || employee.managerId !== managerId) return null

  if (approve) {
    all[idx] = {
      ...leave,
      stage: 'hr',
      managerStatus: 'approved',
      managerDecidedBy: managerId,
      managerDecidedOn: todayKey()
    }
  } else {
    all[idx] = {
      ...leave,
      status: 'rejected',
      managerStatus: 'rejected',
      managerDecidedBy: managerId,
      managerDecidedOn: todayKey(),
      rejectionReason,
      decidedBy: managerId,
      decidedOn: todayKey()
    }
  }
  write(KEYS.leaves, all)
  return all[idx]
}

// HR/Admin approves or rejects a request. status is 'approved' or 'rejected'.
export function setLeaveStatus(leaveId, status, decidedBy, rejectionReason = '') {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status,
    decidedBy: decidedBy || null,
    decidedOn: todayKey(),
    rejectionReason: status === 'rejected' ? (rejectionReason || '').trim() : ''
  }
  write(KEYS.leaves, all)
  return all[idx]
}

export function getLeaveById(leaveId) {
  return getLeaves().find((l) => l.id === leaveId) || null
}

// Add a message to a pending leave request thread.
export function addLeaveMessage(leaveId, { byId, byRole, text }) {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null

  const leave = all[idx]
  if (leave.status !== 'pending') return null

  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  if (byRole === 'employee' && byId !== leave.employeeId) return null
  if (byRole !== 'employee' && byRole !== 'admin') return null

  all[idx] = {
    ...leave,
    messages: [
      ...(leave.messages || []),
      {
        id: `LVM${Date.now()}`,
        byId,
        byRole,
        text: trimmed,
        on: todayKey()
      }
    ]
  }
  write(KEYS.leaves, all)
  return all[idx]
}

// ---- reimbursements ----
export function getReimbursements() {
  return read(KEYS.reimbursements, [])
}

export function getReimbursementsForEmployee(employeeId) {
  return getReimbursements()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1))
}

export function submitReimbursementClaim({
  employeeId,
  category,
  expenseDate,
  amount,
  description
}) {
  const all = getReimbursements()
  const claim = {
    id: `RMB${Date.now()}`,
    employeeId,
    category,
    expenseDate,
    amount,
    description: description || '',
    status: 'pending',
    appliedOn: todayKey(),
    decidedBy: null,
    decidedOn: null,
    paidOn: null,
    reviewNote: ''
  }
  all.push(claim)
  write(KEYS.reimbursements, all)
  return claim
}

// Employee withdraws a pending reimbursement claim.
export function withdrawReimbursementClaim(claimId, employeeId) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  const claim = all[idx]
  if (claim.employeeId !== employeeId) return null
  if (claim.status !== 'pending') return null
  all[idx] = { ...claim, status: 'withdrawn', withdrawnOn: todayKey() }
  write(KEYS.reimbursements, all)
  return all[idx]
}

// Employee edits a pending reimbursement claim.
export function updateReimbursementClaim(claimId, employeeId, {
  category,
  expenseDate,
  amount,
  description
}) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  const claim = all[idx]
  if (claim.employeeId !== employeeId) return null
  if (claim.status !== 'pending') return null
  all[idx] = {
    ...claim,
    category,
    expenseDate,
    amount,
    description: description || '',
    reviewNote: '',
    decidedBy: null,
    decidedOn: null
  }
  write(KEYS.reimbursements, all)
  return all[idx]
}

export function approveReimbursementClaim(claimId, decidedBy) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status: 'approved_unpaid',
    decidedBy: decidedBy || null,
    decidedOn: todayKey(),
    reviewNote: ''
  }
  write(KEYS.reimbursements, all)
  return all[idx]
}

export function rejectReimbursementClaim(claimId, decidedBy, reviewNote = '') {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status: 'rejected',
    decidedBy: decidedBy || null,
    decidedOn: todayKey(),
    reviewNote: reviewNote || '',
    paidOn: null
  }
  write(KEYS.reimbursements, all)
  return all[idx]
}

export function markReimbursementPaid(claimId, decidedBy) {
  const all = getReimbursements()
  const idx = all.findIndex((r) => r.id === claimId)
  if (idx < 0 || all[idx].status !== 'approved_unpaid') return null
  all[idx] = {
    ...all[idx],
    status: 'paid',
    paidOn: todayKey(),
    decidedBy: decidedBy || all[idx].decidedBy
  }
  write(KEYS.reimbursements, all)
  return all[idx]
}

// ---- tasks ----
export function getTasks() {
  return read(KEYS.tasks, [])
}

// Tasks assigned to one person, newest first.
export function getTasksForAssignee(employeeId) {
  return getTasks()
    .filter((t) => t.assigneeId === employeeId)
    .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
}

// Create a new task. Returns the saved task.
export function addTask({ title, description, assigneeId, createdById, dueDate, priority }) {
  const all = getTasks()
  const task = {
    id: `TSK${Date.now()}`,
    title,
    description: description || '',
    assigneeId,
    createdById,
    dueDate: dueDate || '',
    priority: priority || 'medium',
    status: 'todo',
    createdOn: todayKey(),
    messages: []
  }
  all.push(task)
  write(KEYS.tasks, all)
  return task
}

// Move a task to a new status (internal / admin use).
export function updateTaskStatus(taskId, status) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status }
  write(KEYS.tasks, all)
  return all[idx]
}

export function isSelfAssignedTask(task) {
  return task.createdById === task.assigneeId
}

// Edit a self-created task (assignee only).
export function updateTaskByAssignee(taskId, employeeId, { title, description, dueDate, priority }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  const task = all[idx]
  if (task.assigneeId !== employeeId) return null
  if (!isSelfAssignedTask(task)) return null
  if (task.status === 'closed') return null
  all[idx] = {
    ...task,
    title: title?.trim() || task.title,
    description: description !== undefined ? description : task.description,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    priority: priority || task.priority
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Edit any task (admin use).
export function updateTaskByAdmin(taskId, { title, description, assigneeId, dueDate, priority }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  const task = all[idx]
  all[idx] = {
    ...task,
    title: title?.trim() || task.title,
    description: description !== undefined ? description : task.description,
    assigneeId: assigneeId || task.assigneeId,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    priority: priority || task.priority
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Remove a task.
export function deleteTask(taskId) {
  const all = getTasks().filter((t) => t.id !== taskId)
  write(KEYS.tasks, all)
}

// Delete only self-created tasks for the assignee.
export function deleteTaskByAssignee(taskId, employeeId) {
  const task = getTaskById(taskId)
  if (!task || task.assigneeId !== employeeId) return false
  if (!isSelfAssignedTask(task)) return false
  deleteTask(taskId)
  return true
}

// Employee status change with self vs manager-assigned rules.
export function updateTaskStatusByEmployee(taskId, employeeId, status) {
  const task = getTaskById(taskId)
  if (!task || task.assigneeId !== employeeId) return null

  if (isSelfAssignedTask(task)) {
    if (!['todo', 'inprogress', 'done'].includes(status)) return null
    return updateTaskStatus(taskId, status)
  }

  if (task.status === 'closed') return null
  if (!['todo', 'inprogress', 'done'].includes(status)) return null

  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  all[idx] = {
    ...task,
    status,
    completedOn: status === 'done' ? todayKey() : ''
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Manager approves after the employee marked a team task as done.
export function approveTaskClosure(taskId, managerId) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  const task = all[idx]
  if (task.status !== 'done') return null
  if (isSelfAssignedTask(task)) return null
  if (task.createdById !== managerId) return null
  all[idx] = {
    ...task,
    status: 'closed',
    closedBy: managerId,
    closedOn: todayKey()
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// Manager status change (team tasks they assigned, or their own self-tasks).
export function updateTaskStatusByManager(taskId, managerId, status) {
  const task = getTaskById(taskId)
  if (!task) return null

  if (isSelfAssignedTask(task) && task.assigneeId === managerId) {
    if (!['todo', 'inprogress', 'done'].includes(status)) return null
    return updateTaskStatus(taskId, status)
  }

  if (task.createdById === managerId && !isSelfAssignedTask(task)) {
    if (task.status === 'done' || task.status === 'closed') return null
    if (!['todo', 'inprogress'].includes(status)) return null
    return updateTaskStatus(taskId, status)
  }

  return null
}

// Admin follow-up message on any task (no participant restriction).
export function addTaskMessageByAdmin(taskId, { byId, text }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null

  const task = all[idx]
  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  all[idx] = {
    ...task,
    messages: [
      ...(task.messages || []),
      { id: `TSM${Date.now()}`, byId, text: trimmed, on: todayKey() }
    ]
  }
  write(KEYS.tasks, all)
  return all[idx]
}

export function getTaskById(taskId) {
  return getTasks().find((t) => t.id === taskId) || null
}

// Add a message to a task Q&A thread (assignee or task creator only).
export function addTaskMessage(taskId, { byId, text }) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null

  const task = all[idx]
  if (byId !== task.assigneeId && byId !== task.createdById) return null

  const trimmed = String(text || '').trim()
  if (!trimmed) return null

  all[idx] = {
    ...task,
    messages: [
      ...(task.messages || []),
      { id: `TSM${Date.now()}`, byId, text: trimmed, on: todayKey() }
    ]
  }
  write(KEYS.tasks, all)
  return all[idx]
}

// ---- onboarding profiles ----
export function getProfiles() {
  return read(KEYS.profiles, [])
}

// Get one employee's profile, or a fresh blank one if none exists yet.
export function getProfileForEmployee(employeeId) {
  const found = getProfiles().find((p) => p.employeeId === employeeId)
  return found || blankProfile(employeeId)
}

// Save or replace a profile in storage.
function upsertProfile(profile) {
  const all = getProfiles()
  const idx = all.findIndex((p) => p.employeeId === profile.employeeId)
  if (idx >= 0) all[idx] = profile
  else all.push(profile)
  write(KEYS.profiles, all)
  return profile
}

// Employee saves progress. Keeps the current editable status.
export function saveProfileDraft(employeeId, data) {
  const current = getProfileForEmployee(employeeId)
  const editableStatuses = ['draft', 'returned', 'update_approved']
  const profile = {
    ...current,
    ...data,
    employeeId,
    status: editableStatuses.includes(current.status) ? current.status : 'draft',
    updatedOn: todayKey()
  }
  return upsertProfile(profile)
}

// Employee submits for review. Becomes locked ('submitted').
export function submitProfile(employeeId, data) {
  const current = getProfileForEmployee(employeeId)
  const profile = {
    ...current,
    ...data,
    employeeId,
    status: 'submitted',
    updatedOn: todayKey(),
    submittedOn: todayKey(),
    reviewNote: '',
    updateRequestedOn: '',
    updateRequestNote: ''
  }
  return upsertProfile(profile)
}

// Verified employee asks HR for permission to update their details.
export function requestProfileUpdate(employeeId, note = '') {
  const current = getProfileForEmployee(employeeId)
  if (current.status !== 'verified') return null
  const profile = {
    ...current,
    status: 'update_requested',
    updateRequestedOn: todayKey(),
    updateRequestNote: String(note || '').trim(),
    reviewNote: ''
  }
  return upsertProfile(profile)
}

// HR approves or denies an employee's request to update their details.
export function reviewProfileUpdateRequest(employeeId, approved, reviewedBy, note = '') {
  const current = getProfileForEmployee(employeeId)
  if (current.status !== 'update_requested') return null
  if (approved) {
    return upsertProfile({
      ...current,
      status: 'update_approved',
      reviewedBy: reviewedBy || '',
      reviewedOn: todayKey(),
      reviewNote: String(note || '').trim()
    })
  }
  return upsertProfile({
    ...current,
    status: 'verified',
    updateRequestedOn: '',
    updateRequestNote: '',
    reviewedBy: reviewedBy || '',
    reviewedOn: todayKey(),
    reviewNote: String(note || '').trim()
  })
}

// HR verifies or returns a profile. decision = 'verified' | 'returned'.
export function reviewProfile(employeeId, decision, reviewedBy, note) {
  const current = getProfileForEmployee(employeeId)
  const profile = {
    ...current,
    status: decision,
    reviewedBy: reviewedBy || '',
    reviewedOn: todayKey(),
    reviewNote: decision === 'returned' ? (note || '') : ''
  }
  return upsertProfile(profile)
}

// ---- queries & grievances (help desk tickets) ----
export function getTickets() {
  return read(KEYS.tickets, [])
}

// One employee's own tickets, newest activity first.
export function getTicketsForEmployee(employeeId) {
  return getTickets()
    .filter((t) => t.employeeId === employeeId)
    .sort((a, b) => (a.updatedOn < b.updatedOn ? 1 : -1))
}

// Tickets HR can see. With a single admin login, HR sees everything.
// The `confidential` flag on grievances is kept so that, once real HR-staff
// vs Internal-Committee roles exist, sensitive tickets can be filtered here.
export function getTicketsForHR() {
  return getTickets().sort((a, b) => (a.updatedOn < b.updatedOn ? 1 : -1))
}

// An employee raises a new query or grievance. Returns the saved ticket.
export function createTicket({ employeeId, kind, category, subject, message, anonymous }) {
  const all = getTickets()
  const now = todayKey()
  const isGrievance = kind === 'grievance'
  const ticket = {
    id: `TKT${Date.now()}`,
    kind,
    category,
    subject: subject || '',
    status: 'open',
    employeeId,
    anonymous: isGrievance ? !!anonymous : false,
    confidential: isGrievance,
    createdOn: now,
    updatedOn: now,
    messages: [
      { id: `MSG${Date.now()}`, byId: employeeId, byRole: 'employee', text: message || '', on: now }
    ]
  }
  all.push(ticket)
  write(KEYS.tickets, all)
  return ticket
}

// Employee withdraws an open or in-progress ticket.
export function withdrawTicket(ticketId, employeeId) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  const t = all[idx]
  if (t.employeeId !== employeeId) return null
  if (!['open', 'inprogress'].includes(t.status)) return null
  all[idx] = { ...t, status: 'withdrawn', updatedOn: todayKey() }
  write(KEYS.tickets, all)
  return all[idx]
}

// Employee edits an open ticket before HR has started working on it.
export function updateTicket(ticketId, employeeId, { kind, category, subject, message, anonymous }) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  const t = all[idx]
  if (t.employeeId !== employeeId) return null
  if (t.status !== 'open') return null

  const isGrievance = kind === 'grievance'
  const messages = [...(t.messages || [])]
  if (messages.length > 0 && messages[0].byRole === 'employee') {
    messages[0] = { ...messages[0], text: message || '' }
  }

  all[idx] = {
    ...t,
    kind,
    category,
    subject: subject || '',
    anonymous: isGrievance ? !!anonymous : false,
    confidential: isGrievance,
    messages,
    updatedOn: todayKey()
  }
  write(KEYS.tickets, all)
  return all[idx]
}

// Add a reply to a ticket. byRole is 'employee' or 'admin'.
// A reply nudges the status forward: an HR reply on an open ticket makes it
// "in progress"; an employee reply on a resolved ticket reopens it.
export function addTicketMessage(ticketId, { byId, byRole, text }) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  const t = all[idx]
  if (t.status === 'withdrawn' || t.status === 'closed') return null
  let status = t.status
  if (byRole === 'admin' && status === 'open') status = 'inprogress'
  if (byRole === 'employee' && status === 'resolved') status = 'inprogress'
  all[idx] = {
    ...t,
    status,
    updatedOn: todayKey(),
    messages: [
      ...t.messages,
      { id: `MSG${Date.now()}`, byId, byRole, text: text || '', on: todayKey() }
    ]
  }
  write(KEYS.tickets, all)
  return all[idx]
}

// HR changes a ticket's status ('open' | 'inprogress' | 'resolved' | 'closed').
export function setTicketStatus(ticketId, status) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status, updatedOn: todayKey() }
  write(KEYS.tickets, all)
  return all[idx]
}

// ---- cab management ----

// Vehicles
export function getVehicles() { return read(KEYS.vehicles, []) }
export function addVehicle({ number, label }) {
  const all = getVehicles()
  const v = { id: `VEH${Date.now()}`, number: number || '', label: label || '' }
  all.push(v); write(KEYS.vehicles, all); return v
}
export function updateVehicle(id, data) {
  const all = getVehicles()
  const idx = all.findIndex((v) => v.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.vehicles, all); return all[idx]
}
export function deleteVehicle(id) {
  write(KEYS.vehicles, getVehicles().filter((v) => v.id !== id))
}

// Drivers
export function getDrivers() { return read(KEYS.drivers, []) }
export function getDriverById(id) {
  return getDrivers().find((d) => d.id === id) || null
}
export function addDriver({ name, mobile, pin }) {
  const all = getDrivers()
  const d = { id: `DRV${Date.now()}`, name: name || '', mobile: mobile || '', pin: pin || '' }
  all.push(d); write(KEYS.drivers, all); return d
}
export function updateDriver(id, data) {
  const all = getDrivers()
  const idx = all.findIndex((d) => d.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.drivers, all); return all[idx]
}
export function setDriverPin(id, pin) {
  return updateDriver(id, { pin: pin || '' })
}
export function deleteDriver(id) {
  write(KEYS.drivers, getDrivers().filter((d) => d.id !== id))
}

// Trips
export function getTrips() { return read(KEYS.trips, []) }
export function addTrip({ vehicleId, driverId, direction, time, officeGate, supervisorName, supervisorMobile, shiftStart, shiftEnd }) {
  const all = getTrips()
  const t = {
    id: `TRP${Date.now()}`,
    vehicleId: vehicleId || '', driverId: driverId || '',
    direction: direction || 'pickup', time: time || '',
    officeGate: officeGate || '',
    supervisorName: supervisorName || '', supervisorMobile: supervisorMobile || '',
    shiftStart: shiftStart || '', shiftEnd: shiftEnd || ''
  }
  all.push(t); write(KEYS.trips, all); return t
}
export function updateTrip(id, data) {
  const all = getTrips()
  const idx = all.findIndex((t) => t.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...data }
  write(KEYS.trips, all); return all[idx]
}
export function deleteTrip(id) {
  write(KEYS.trips, getTrips().filter((t) => t.id !== id))
}

// Cab assignments (employee -> pickup trip + drop trip)
export function getCabAssignments() { return read(KEYS.cabAssignments, []) }
export function getCabAssignmentForEmployee(employeeId) {
  return getCabAssignments().find((a) => a.employeeId === employeeId) || null
}
export function setCabAssignment(employeeId, pickupTripId, dropTripId) {
  const all = getCabAssignments()
  const idx = all.findIndex((a) => a.employeeId === employeeId)
  const entry = { employeeId, pickupTripId: pickupTripId || '', dropTripId: dropTripId || '' }
  if (idx >= 0) all[idx] = entry
  else all.push(entry)
  write(KEYS.cabAssignments, all)
  return entry
}

// Temporary change requests
export function getCabRequests() { return read(KEYS.cabRequests, []) }
export function getCabRequestsForEmployee(employeeId) {
  return getCabRequests()
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => (a.raisedOn < b.raisedOn ? 1 : -1))
}
export function createCabRequest({ employeeId, forDates, newLocation, newGate, newTime, reason }) {
  const all = getCabRequests()
  const req = {
    id: `CABREQ${Date.now()}`,
    employeeId,
    forDates: forDates || [],
    newLocation: newLocation || '',
    newGate: newGate || '',
    newTime: newTime || '',
    reason: reason || '',
    status: 'pending',
    adminNote: '',
    raisedOn: todayKey()
  }
  all.push(req); write(KEYS.cabRequests, all); return req
}
export function setCabRequestStatus(requestId, status, adminNote) {
  const all = getCabRequests()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status, adminNote: adminNote || '' }
  write(KEYS.cabRequests, all); return all[idx]
}

// Cab chat messages (one ongoing thread per employee).
export function getCabMessages() { return read(KEYS.cabMessages, []) }
export function getCabMessagesForEmployee(employeeId) {
  return getCabMessages()
    .filter((m) => m.employeeId === employeeId)
    .sort((a, b) => (a.on > b.on ? 1 : -1)) // oldest first, like a chat
}
export function addCabMessage({ employeeId, byRole, text }) {
  const all = getCabMessages()
  const msg = {
    id: `CABMSG${Date.now()}`,
    employeeId,
    byRole: byRole || 'employee',
    text: text || '',
    on: new Date().toISOString(),
    readByAdmin: byRole === 'admin' // employee messages start unread
  }
  all.push(msg); write(KEYS.cabMessages, all); return msg
}

// Mark every employee message in one employee's thread as read by admin.
export function markCabThreadRead(employeeId) {
  const all = getCabMessages()
  let changed = false
  for (let i = 0; i < all.length; i++) {
    if (all[i].employeeId === employeeId && all[i].byRole === 'employee' && !all[i].readByAdmin) {
      all[i] = { ...all[i], readByAdmin: true }
      changed = true
    }
  }
  if (changed) write(KEYS.cabMessages, all)
}

// Unread count per employee, e.g. { EMP004: 2 }. Only counts employee messages
// the admin has not read yet.
export function getCabUnreadByEmployee() {
  const counts = {}
  for (const m of getCabMessages()) {
    if (m.byRole === 'employee' && !m.readByAdmin) {
      counts[m.employeeId] = (counts[m.employeeId] || 0) + 1
    }
  }
  return counts
}

// ---- cab cancellations (skip pickup / drop for today) ----
// Stored as an array of { employeeId, date, skipPickup, skipDrop }.
// One record per employee per date; upserted on every save.
export function getCabCancellations() {
  return read(KEYS.cabCancellations, [])
}

export function getCabCancellationForEmployee(employeeId, date) {
  return getCabCancellations().find(
    (c) => c.employeeId === employeeId && c.date === date
  ) || null
}

// date is a YYYY-MM-DD string (today). skipPickup / skipDrop are booleans.
export function setCabCancellation(employeeId, date, skipPickup, skipDrop) {
  const all = getCabCancellations()
  const idx = all.findIndex((c) => c.employeeId === employeeId && c.date === date)
  const entry = { employeeId, date, skipPickup: !!skipPickup, skipDrop: !!skipDrop }
  if (idx >= 0) all[idx] = entry
  else all.push(entry)
  write(KEYS.cabCancellations, all)
  return entry
}

// All cancellations for a specific date (for the admin / driver view).
export function getCabCancellationsForDate(date) {
  return getCabCancellations().filter((c) => c.date === date)
}

// ---- driver run sheet ----
// Builds the complete pickup + drop list for a driver on a given date.
// Returns { driver, pickupStops, dropStops } where each stop is:
//   { employee, trip, vehicle, profile, cancelled }
// cancelled = true means the employee opted out for today.
export function getDriverRunSheet(driverId, date) {
  const drivers    = getDrivers()
  const driver     = drivers.find((d) => d.id === driverId) || null
  if (!driver) return null

  const trips       = getTrips()
  const vehicles    = getVehicles()
  const assignments = getCabAssignments()
  const employees   = getEmployees()
  const cancels     = getCabCancellationsForDate(date)

  // Helper: get profile personal data for an employee
  function personInfo(empId) {
    const profile = getProfileForEmployee(empId)
    const p = profile?.personal || {}
    return {
      address:      p.address       || '--',
      homeGate:     p.homeGate      || '--',
      mobile:       p.contactNumber || '--',
      pickupPoint:  p.pickupPoint   || null,
      dropPoint:    p.dropSameAsPickup !== false ? (p.pickupPoint || null) : (p.dropPoint || null)
    }
  }

  // All trips belonging to this driver
  const driverTrips = trips.filter((t) => t.driverId === driverId)
  const pickupTrips = driverTrips.filter((t) => t.direction === 'pickup')
  const dropTrips   = driverTrips.filter((t) => t.direction === 'drop')

  function buildStops(tripList, direction) {
    const stops = []
    for (const trip of tripList) {
      const vehicle = vehicles.find((v) => v.id === trip.vehicleId) || null
      // Find all employees on this trip
      const assigned = assignments.filter((a) =>
        direction === 'pickup'
          ? a.pickupTripId === trip.id
          : a.dropTripId === trip.id
      )
      for (const a of assigned) {
        const emp = employees.find((e) => e.id === a.employeeId) || { id: a.employeeId, name: a.employeeId }
        const cancel = cancels.find((c) => c.employeeId === a.employeeId) || null
        const cancelled = direction === 'pickup'
          ? !!(cancel?.skipPickup)
          : !!(cancel?.skipDrop)
        stops.push({
          employee:  emp,
          trip,
          vehicle,
          info: personInfo(a.employeeId),
          cancelled
        })
      }
    }
    // Sort by trip time
    stops.sort((a, b) => (a.trip.time < b.trip.time ? -1 : 1))
    return stops
  }

  return {
    driver,
    pickupStops: buildStops(pickupTrips, 'pickup'),
    dropStops:   buildStops(dropTrips, 'drop')
  }
}

// ---- IT Help Desk ----
export function getITIssues() {
  return read(KEYS.itIssues, [])
}

export function getITIssuesForEmployee(employeeId) {
  return getITIssues()
    .filter((i) => i.employeeId === employeeId)
    .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
}

export function getITStaff() {
  return read(KEYS.itStaff, [])
}

export function getITStaffById(id) {
  return getITStaff().find((s) => s.id === id) || null
}

// Create a new IT issue. Returns the saved issue.
export function createITIssue({ employeeId, issue, description, priority, category, attachment }) {
  const all = getITIssues()
  const newIssue = {
    id: `ITI${Date.now()}`,
    employeeId,
    issue,
    description: description || '',
    category: category || 'other',
    priority,
    status: 'open',
    assignedTo: null,
    estimatedTime: null,
    attachment: attachment || null,
    comments: [],
    createdOn: todayKey(),
    updatedOn: todayKey()
  }
  all.push(newIssue)
  write(KEYS.itIssues, all)
  return newIssue
}

// Employee withdraws an open or in-progress IT issue.
export function withdrawITIssue(issueId, employeeId) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const issue = all[idx]
  if (issue.employeeId !== employeeId) return null
  if (!['open', 'inprogress'].includes(issue.status)) return null
  all[idx] = { ...issue, status: 'withdrawn', updatedOn: todayKey() }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Employee edits an open IT issue that has not been assigned yet.
export function updateITIssue(issueId, employeeId, { issue, description, priority, category, attachment }) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const row = all[idx]
  if (row.employeeId !== employeeId) return null
  if (row.status !== 'open' || row.assignedTo) return null
  all[idx] = {
    ...row,
    issue,
    description: description || '',
    priority,
    category: category || row.category || 'other',
    attachment: attachment === undefined ? row.attachment || null : (attachment || null),
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Assign an IT issue to a staff member and set estimated time
export function assignITIssue(issueId, assignedTo, estimatedTime) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    assignedTo,
    estimatedTime,
    status: 'inprogress',
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Update IT issue status
export function setITIssueStatus(issueId, status) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status,
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Employee re-opens an issue that was marked resolved/closed but is not
// actually fixed. It goes back to open so IT picks it up again.
export function reopenITIssue(issueId, employeeId) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const issue = all[idx]
  if (issue.employeeId !== employeeId) return null
  if (!['resolved', 'closed'].includes(issue.status)) return null
  all[idx] = { ...issue, status: 'open', updatedOn: todayKey() }
  write(KEYS.itIssues, all)
  return all[idx]
}

// Add a comment to an IT issue's thread. author = { byId, byName, byRole }
// where byRole is 'employee' or 'it'.
export function addITIssueComment(issueId, author, text) {
  const all = getITIssues()
  const idx = all.findIndex((i) => i.id === issueId)
  if (idx < 0) return null
  const issue = all[idx]
  const comment = {
    id: `ITIC${Date.now()}`,
    byId: author.byId,
    byName: author.byName,
    byRole: author.byRole,
    text,
    on: todayKey()
  }
  all[idx] = {
    ...issue,
    comments: [...(issue.comments || []), comment],
    updatedOn: todayKey()
  }
  write(KEYS.itIssues, all)
  return comment
}

// ---- Company Announcements ----
export function getAnnouncements() {
  return read(KEYS.announcements, [])
}

// Get announcements for a specific employee (excludes those where employee is in excludedEmployees list)
export function getAnnouncementsForEmployee(employeeId) {
  const all = getAnnouncements()
  return all
    .filter((a) => !a.excludedEmployees.includes(employeeId))
    .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
}

// Create a new announcement. Returns the saved announcement.
export function createAnnouncement({ title, content, type, createdBy, excludedEmployees }) {
  const all = getAnnouncements()
  const announcement = {
    id: `ANN${Date.now()}`,
    title,
    content: content || '',
    type,
    createdBy,
    createdOn: todayKey(),
    excludedEmployees: excludedEmployees || []
  }
  all.push(announcement)
  write(KEYS.announcements, all)
  return announcement
}

// Delete an announcement
export function deleteAnnouncement(announcementId) {
  const all = getAnnouncements()
  const filtered = all.filter((a) => a.id !== announcementId)
  write(KEYS.announcements, filtered)
  return filtered
}

// Get read announcements tracking data
function getReadAnnouncements() {
  return read(KEYS.readAnnouncements, {})
}

// Count unread announcements for an employee
export function getUnreadAnnouncementCount(employeeId) {
  const readData = getReadAnnouncements()
  const readIds = readData[employeeId] || []
  const allAnnouncements = getAnnouncements()
  const availableToEmployee = allAnnouncements.filter((a) => 
    !a.excludedEmployees.includes(employeeId)
  )
  return availableToEmployee.filter((a) => !readIds.includes(a.id)).length
}

// Mark an announcement as read for an employee
export function markAnnouncementAsRead(employeeId, announcementId) {
  const readData = getReadAnnouncements()
  if (!readData[employeeId]) {
    readData[employeeId] = []
  }
  if (!readData[employeeId].includes(announcementId)) {
    readData[employeeId].push(announcementId)
    write(KEYS.readAnnouncements, readData)
  }
}

export function isAnnouncementRead(employeeId, announcementId) {
  const readData = getReadAnnouncements()
  return (readData[employeeId] || []).includes(announcementId)
}

// ---- employee notification reads ----
function getNotificationReadsMap() {
  return read(KEYS.notificationReads, {})
}

export function getReadNotificationIds(employeeId) {
  return getNotificationReadsMap()[employeeId] || []
}

export function markNotificationRead(employeeId, notificationId) {
  const all = getNotificationReadsMap()
  const list = all[employeeId] || []
  if (list.includes(notificationId)) return
  all[employeeId] = [...list, notificationId]
  write(KEYS.notificationReads, all)
}

export function markAllNotificationsRead(employeeId, notificationIds) {
  const all = getNotificationReadsMap()
  const existing = new Set(all[employeeId] || [])
  for (const id of notificationIds) existing.add(id)
  all[employeeId] = [...existing]
  write(KEYS.notificationReads, all)
}
