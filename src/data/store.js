// A small data store backed by the browser's local storage.
// This lets the test buttons save data so it stays after a page refresh.
// In a later phase this will be replaced by a real server + database.

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
  SAMPLE_ANNOUNCEMENTS
} from './sampleData.js'
import { blankProfile } from '../utils/profile.js'

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
  readAnnouncements: 'hr_read_announcements'
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Put sample data in place the first time the app runs.
export function seedIfEmpty() {
  if (localStorage.getItem(KEYS.employees) === null) {
    write(KEYS.employees, SAMPLE_EMPLOYEES)
  }
  if (localStorage.getItem(KEYS.attendance) === null) {
    write(KEYS.attendance, SAMPLE_ATTENDANCE)
  }
  if (localStorage.getItem(KEYS.leaves) === null) {
    write(KEYS.leaves, SAMPLE_LEAVES)
  }
  if (localStorage.getItem(KEYS.settings) === null) {
    write(KEYS.settings, DEFAULT_SETTINGS)
  }
  if (localStorage.getItem(KEYS.tasks) === null) {
    write(KEYS.tasks, SAMPLE_TASKS)
  }
  if (localStorage.getItem(KEYS.profiles) === null) {
    write(KEYS.profiles, SAMPLE_PROFILES)
  }
  if (localStorage.getItem(KEYS.tickets) === null) {
    write(KEYS.tickets, SAMPLE_TICKETS)
  }
  if (localStorage.getItem(KEYS.vehicles) === null) {
    write(KEYS.vehicles, SAMPLE_VEHICLES)
  }
  if (localStorage.getItem(KEYS.drivers) === null) {
    write(KEYS.drivers, SAMPLE_DRIVERS)
  }
  if (localStorage.getItem(KEYS.trips) === null) {
    write(KEYS.trips, SAMPLE_TRIPS)
  }
  if (localStorage.getItem(KEYS.cabAssignments) === null) {
    write(KEYS.cabAssignments, SAMPLE_CAB_ASSIGNMENTS)
  }
  if (localStorage.getItem(KEYS.cabRequests) === null) {
    write(KEYS.cabRequests, SAMPLE_CAB_REQUESTS)
  }
  if (localStorage.getItem(KEYS.cabMessages) === null) {
    write(KEYS.cabMessages, SAMPLE_CAB_MESSAGES)
  }
  if (localStorage.getItem(KEYS.itIssues) === null) {
    write(KEYS.itIssues, SAMPLE_IT_ISSUES)
  }
  if (localStorage.getItem(KEYS.itStaff) === null) {
    write(KEYS.itStaff, SAMPLE_IT_STAFF)
  }
  if (localStorage.getItem(KEYS.announcements) === null) {
    write(KEYS.announcements, SAMPLE_ANNOUNCEMENTS)
  }
  if (localStorage.getItem(KEYS.readAnnouncements) === null) {
    write(KEYS.readAnnouncements, {})
  }
}

// Wipe everything and load fresh sample data (handy while testing).
export function resetToSampleData() {
  write(KEYS.employees, SAMPLE_EMPLOYEES)
  write(KEYS.attendance, SAMPLE_ATTENDANCE)
  write(KEYS.leaves, SAMPLE_LEAVES)
  write(KEYS.settings, DEFAULT_SETTINGS)
  write(KEYS.tasks, SAMPLE_TASKS)
  write(KEYS.profiles, SAMPLE_PROFILES)
  write(KEYS.tickets, SAMPLE_TICKETS)
  write(KEYS.vehicles, SAMPLE_VEHICLES)
  write(KEYS.drivers, SAMPLE_DRIVERS)
  write(KEYS.trips, SAMPLE_TRIPS)
  write(KEYS.cabAssignments, SAMPLE_CAB_ASSIGNMENTS)
  write(KEYS.cabRequests, SAMPLE_CAB_REQUESTS)
  write(KEYS.cabMessages, SAMPLE_CAB_MESSAGES)
  write(KEYS.itIssues, SAMPLE_IT_ISSUES)
  write(KEYS.itStaff, SAMPLE_IT_STAFF)
  write(KEYS.announcements, SAMPLE_ANNOUNCEMENTS)
  write(KEYS.readAnnouncements, {})
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
    }
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

// ---- leaves ----
export function getLeaves() {
  return read(KEYS.leaves, [])
}

export function getLeavesForEmployee(employeeId) {
  return getLeaves()
    .filter((l) => l.employeeId === employeeId)
    .sort((a, b) => (a.fromDate < b.fromDate ? 1 : -1))
}

// An employee applies for leave. Returns the saved request.
export function applyLeave({ employeeId, type, fromDate, toDate, reason }) {
  const all = getLeaves()
  const request = {
    id: `LV${Date.now()}`,
    employeeId,
    type,
    fromDate,
    toDate,
    reason: reason || '',
    status: 'pending',
    appliedOn: todayKey(),
    decidedBy: null,
    decidedOn: null
  }
  all.push(request)
  write(KEYS.leaves, all)
  return request
}

// HR/Admin approves or rejects a request. status is 'approved' or 'rejected'.
export function setLeaveStatus(leaveId, status, decidedBy) {
  const all = getLeaves()
  const idx = all.findIndex((l) => l.id === leaveId)
  if (idx < 0) return null
  all[idx] = {
    ...all[idx],
    status,
    decidedBy: decidedBy || null,
    decidedOn: todayKey()
  }
  write(KEYS.leaves, all)
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
    createdOn: todayKey()
  }
  all.push(task)
  write(KEYS.tasks, all)
  return task
}

// Move a task to a new status ('todo' | 'inprogress' | 'done').
export function updateTaskStatus(taskId, status) {
  const all = getTasks()
  const idx = all.findIndex((t) => t.id === taskId)
  if (idx < 0) return null
  all[idx] = { ...all[idx], status }
  write(KEYS.tasks, all)
  return all[idx]
}

// Remove a task.
export function deleteTask(taskId) {
  const all = getTasks().filter((t) => t.id !== taskId)
  write(KEYS.tasks, all)
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

// Employee saves progress. Stays editable (status becomes 'draft').
export function saveProfileDraft(employeeId, data) {
  const profile = {
    ...getProfileForEmployee(employeeId),
    ...data,
    employeeId,
    status: 'draft',
    updatedOn: todayKey()
  }
  return upsertProfile(profile)
}

// Employee submits for review. Becomes locked ('submitted').
export function submitProfile(employeeId, data) {
  const profile = {
    ...getProfileForEmployee(employeeId),
    ...data,
    employeeId,
    status: 'submitted',
    updatedOn: todayKey(),
    submittedOn: todayKey(),
    reviewNote: ''
  }
  return upsertProfile(profile)
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

// Add a reply to a ticket. byRole is 'employee' or 'admin'.
// A reply nudges the status forward: an HR reply on an open ticket makes it
// "in progress"; an employee reply on a resolved ticket reopens it.
export function addTicketMessage(ticketId, { byId, byRole, text }) {
  const all = getTickets()
  const idx = all.findIndex((t) => t.id === ticketId)
  if (idx < 0) return null
  const t = all[idx]
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
export function createITIssue({ employeeId, issue, description, priority }) {
  const all = getITIssues()
  const newIssue = {
    id: `ITI${Date.now()}`,
    employeeId,
    issue,
    description: description || '',
    priority,
    status: 'open',
    assignedTo: null,
    estimatedTime: null,
    createdOn: todayKey(),
    updatedOn: todayKey()
  }
  all.push(newIssue)
  write(KEYS.itIssues, all)
  return newIssue
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
