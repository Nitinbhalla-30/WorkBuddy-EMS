// Shared constants and enums for the application.
// Actual data is loaded from Supabase at runtime.

// Login is kept very simple for this test phase: an ID and a PIN.
// (Real login/security will be added in a later phase.)

export const DEFAULT_SETTINGS = {
  companyName: 'Your Company',       // your company name (change in Settings)
  officeStartTime: '09:30',          // shift start time
  // Minutes after office start before arrival counts as Late (e.g. 20 → start 09:30, late after 09:50).
  lateGraceMinutes: 20,
  standardWorkHours: 8,              // used to show a target per day
  officeIp: '',                      // office internet address (set by admin)
  cabWaitingTime: 20,                // max wait time in minutes for cabs
  // Employees may skip or change today's pickup until this many hours before
  // their shift starts, and today's drop until this many hours before their
  // shift ends. After that the buttons lock so drivers get stable run sheets.
  cabTodayCutoffHours: 3,
  // Monthly amount charged to employees who opt in to the company cab service.
  // Shown in My Details while opting in; the employee must agree to it there.
  // 0 means the service is free of charge.
  cabMonthlyCharge: 1200,
  // Test helper: when true, the office-internet check always passes.
  // Turn this OFF in the real office once officeIp is set.
  pretendOnOfficeNetwork: true,
  // Yearly paid-leave allowance, same for everyone (editable in Settings).
  // Unpaid leave has no limit, so it is not listed here.
  leaveAllowance: {
    casual: 12,
    sick: 8,
    earned: 15,
    halfday: 12,
    short: 6
  },
  // Probation period (months) after dateJoined; paid leave is blocked during it.
  probationMonths: 6,
  // Days a manager has to approve/reject a leave before it auto-escalates to HR.
  leaveManagerDays: 2,
  // Days a manager has to approve/reject an overtime request before it auto-escalates to HR.
  overtimeManagerDays: 2,
  // Salary rules (India). Delhi has no Professional Tax, so PT is not here.
  salary: {
    pfPercent: 12,        // Provident Fund: % of Basic (employee side)
    esiPercent: 0.75,     // ESI: % of gross (employee side)
    esiThreshold: 21000   // ESI only applies when gross is at or below this
  },
  // Lunch break policy shown to all employees on My Attendance.
  lunchPolicy: {
    durationMinutes: 30,
    place: 'Company cafeteria (2nd floor). Lunch at your desk is not allowed.',
    startTime: '13:00',
    endTime: '14:00',
    notes: 'Please take lunch only during the allowed window and return to your workstation on time.'
  },
  // Dates the company observes as holidays. isHoliday = true means a day off for employees.
  companyHolidays: [],
  // Celebrations module: how long someone who joins is still introduced as a
  // new joiner on the Celebrations page. Birthdays and anniversaries are not
  // configured here — they come straight from the employee record.
  newJoinerWindowDays: 7,
  // Entries from the built-in festival/national-day calendar this office does
  // not observe. Holds ids from data/celebrationsData.js.
  celebrationsHiddenSlots: []
}

// Default shifts for a new company. Admin can add, edit, or remove these.
// Each shift has a name, start time, and end time (24-hour format).
export const DEFAULT_SHIFTS = [
  { id: 'SHIFT_MORNING', name: 'Morning Shift', startTime: '06:00', endTime: '14:00' },
  { id: 'SHIFT_AFTERNOON', name: 'Afternoon Shift', startTime: '14:00', endTime: '22:00' },
  { id: 'SHIFT_EVENING', name: 'Evening Shift', startTime: '18:00', endTime: '02:00' },
  { id: 'SHIFT_NIGHT', name: 'Night Shift', startTime: '22:00', endTime: '06:00' }
]

// The statuses a shift change request can have.
export const SHIFT_CHANGE_STATUSES = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' }
]

// The kinds of leave. "paid: true" means it does not cut salary later.
export const LEAVE_TYPES = [
  { key: 'casual', label: 'Casual', paid: true },
  { key: 'sick',   label: 'Sick',   paid: true },
  { key: 'earned', label: 'Earned', paid: true },
  // Partial-day leaves: a single date that consumes half a day. They are
  // paid but are not tracked against the yearly day allowance.
  { key: 'halfday', label: 'Half day', paid: true, partial: true },
  { key: 'short',   label: 'Short leave', paid: true, partial: true }
]

// Expense categories employees can claim for reimbursement.
export const REIMBURSEMENT_CATEGORIES = [
  { key: 'conveyance', label: 'Conveyance / local travel' },
  { key: 'travel', label: 'Travel' },
  { key: 'meals', label: 'Meals & refreshments' },
  { key: 'office', label: 'Office supplies' },
  { key: 'other', label: 'Other' }
]

// Reimbursement claim workflow statuses.
export const REIMBURSEMENT_STATUSES = [
  { key: 'pending', label: 'Pending approval' },
  { key: 'approved_unpaid', label: 'Approved — yet to be paid' },
  { key: 'paid', label: 'Approved and paid' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'withdrawn', label: 'Withdrawn' }
]

// ---- tasks (Planner-style) ----
// Task lifecycle statuses (self-assigned: done is final; manager-assigned: done → manager approves → closed).
export const TASK_STATUSES = [
  { key: 'todo',       label: 'To do' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'done',       label: 'Done' },
  { key: 'closed',     label: 'Closed' }
]

// Task priority levels.
export const TASK_PRIORITIES = [
  { key: 'low',    label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high',   label: 'High' }
]

// ---- IT Help Desk ----
// IT issue priority levels.
export const IT_ISSUE_PRIORITIES = [
  { key: 'low',    label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high',   label: 'High' }
]

// The stages an IT issue moves through.
export const IT_ISSUE_STATUSES = [
  { key: 'open',       label: 'Open' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'resolved',   label: 'Resolved' },
  { key: 'closed',     label: 'Closed' },
  { key: 'withdrawn',  label: 'Withdrawn' }
]

// Issue categories — help the IT manager route the issue to the right person.
export const IT_ISSUE_CATEGORIES = [
  { key: 'hardware', label: 'Hardware' },
  { key: 'software', label: 'Software' },
  { key: 'network',  label: 'Network Access' },
  { key: 'email',    label: 'Email & Accounts' },
  { key: 'other',    label: 'Other' }
]

// ---- Company Announcements ----
// Announcement types for categorization
export const ANNOUNCEMENT_TYPES = [
  { key: 'general', label: 'General' },
  { key: 'policy', label: 'Policy Update' },
  { key: 'event', label: 'Event' },
  { key: 'job', label: 'Internal Job Posting' },
  { key: 'urgent', label: 'Urgent' }
]

// ---- queries & grievances (HR help desk) ----
// Every ticket is one of two kinds:
//   query     -> a routine question (payslip, leave, PF, policy, IT, etc.)
//   grievance -> a serious concern; treated as confidential.
// POSH (harassment) complaints are flagged so the screens can show the legal
// note that, by law in India, they must go to an Internal Committee (IC).
export const TICKET_CATEGORIES = [
  // Queries
  { key: 'payslip',        label: 'Payslip / salary doubt',                    kind: 'query' },
  { key: 'leave',          label: 'Leave balance / approval',                  kind: 'query' },
  { key: 'pfuan',          label: 'PF / UAN issue',                            kind: 'query' },
  { key: 'form16',         label: 'Form 16 / TDS certificate',                 kind: 'query' },
  { key: 'policy',         label: 'Policy question (WFH, notice, holidays)',    kind: 'query' },
  { key: 'itasset',        label: 'ID card / email / IT asset request',        kind: 'query' },
  { key: 'query_other',    label: 'Other query',                               kind: 'query' },
  // Grievances
  { key: 'against_person', label: 'Complaint against a manager / colleague',    kind: 'grievance' },
  { key: 'posh',           label: 'Harassment / POSH complaint',               kind: 'grievance', posh: true },
  { key: 'compensation',   label: 'Compensation / promotion dispute',          kind: 'grievance' },
  { key: 'disciplinary',   label: 'Disciplinary matter',                       kind: 'grievance' },
  { key: 'grievance_other',label: 'Other grievance',                           kind: 'grievance' }
]

// The stages a ticket moves through. HR controls this.
export const TICKET_STATUSES = [
  { key: 'open',       label: 'Open' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'resolved',   label: 'Resolved' },
  { key: 'closed',     label: 'Closed' },
  { key: 'withdrawn',  label: 'Withdrawn' }
]

// ---- employee onboarding profile ----
// The documents a new employee uploads. All should be PDF and self-signed.
//   multiple -> can hold several files (e.g. many certificates)
//   required -> must be present before the employee can submit
export const DOCUMENT_TYPES = [
  { key: 'panCard',     label: 'PAN card',                          multiple: false, required: true },
  { key: 'aadhaarCard', label: 'Aadhaar card',                      multiple: false, required: true },
  { key: 'educational', label: 'Educational certificates',          multiple: true,  required: true },
  { key: 'experience',  label: 'Experience / relieving letters',    multiple: true,  required: false,
    hint: 'From previous employers, if you have any.' },
  { key: 'form12b',     label: 'Form 12B',                          multiple: false, required: false,
    hint: 'Only if you joined in the middle of the financial year.' },
  { key: 'bankProof',   label: 'Bank proof (cancelled cheque / passbook)', multiple: false, required: false }
]

export const ATTENDANCE_CORRECTION_ISSUES = [
  { key: 'missed_time_in', label: 'Forgot to time in' },
  { key: 'missed_time_out', label: 'Forgot to time out' },
  { key: 'wrong_times', label: 'Wrong time in / time out' },
  { key: 'wrong_break', label: 'Break recorded incorrectly' },
  { key: 'other', label: 'Other' }
]
