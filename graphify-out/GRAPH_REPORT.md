# Graph Report - WorkBuddy EMS  (2026-09-04)

## Corpus Check
- 120 files · ~114,758 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1347 nodes · 4253 edges · 80 communities (64 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `895fe42c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- formatDate
- Settings.jsx
- EmployeeTickets.jsx
- refreshStoreFromSupabase
- profile.js
- EmployeeReimbursements
- usePagination
- store.js
- write
- AdminTasks
- AdminSalary.jsx
- EmployeeTasks
- Celebrations.jsx
- EmployeeTasks.jsx
- getReimbursements
- TaskStatusChart.tsx
- compilerOptions
- App.jsx
- sampleData.js
- notifications.js
- read
- AdminProfiles.jsx
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- origin-button.tsx
- CabManagement.jsx
- TeamTasksPanel
- EmployeeITHelpDesk.jsx
- components.json
- tasks.js
- DriversTab
- TripsTab
- VehiclesTab
- package.json
- getEmployeeById
- useTableControls
- next-themes
- getShiftChangeRequests
- Product
- leaflet
- RequestsTab
- check-leaves.mjs
- tailwind-merge
- AdminOvertime.jsx
- vite.config.js
- formatDateTime
- scripts
- ShiftFormModal
- WorkBuddy EMS — Agent Instructions
- attendance.js
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- public.leaves
- ProfileWizard
- ShiftsTab
- tasks
- AuthContext.jsx
- EmployeeAnnouncements
- public.attendance_corrections
- public.it_issues
- public.tickets
- public.it_issues
- NotificationBell
- MyCab.jsx
- getEmployees
- lucide-react

## God Nodes (most connected - your core abstractions)
1. `write()` - 95 edges
2. `formatDate()` - 74 edges
3. `useTableControls()` - 67 edges
4. `usePagination()` - 65 edges
5. `getEmployeeById()` - 60 edges
6. `useAuth()` - 57 edges
7. `EmployeeDashboard()` - 53 edges
8. `read()` - 42 edges
9. `AttendanceRecords()` - 40 edges
10. `MyCab()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `validateForSubmit()`  [EXTRACTED]
  src/components/ProfileWizard.jsx → src/utils/profile.js
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminReimbursements.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AttendanceRecords.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (80 total, 16 thin omitted)

### Community 0 - "formatDate"
Cohesion: 0.07
Nodes (66): LeaveDocumentList(), LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), getLeaves() (+58 more)

### Community 1 - "Settings.jsx"
Cohesion: 0.16
Nodes (6): saveSettings(), Settings(), detectIp(), handleSave(), checkOfficeNetwork(), fetchPublicIp()

### Community 2 - "EmployeeTickets.jsx"
Cohesion: 0.10
Nodes (27): TicketForm(), TicketThread(), TICKET_STATUSES, addTicketMessage(), getTicketsForHR(), AdminTickets(), closeMenu(), handleClickOutside() (+19 more)

### Community 3 - "refreshStoreFromSupabase"
Cohesion: 0.19
Nodes (22): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceMonths(), ensureAttendanceRange(), fetchAllFromTable(), fetchAttendanceWindow(), flushQueuedRowDeletes() (+14 more)

### Community 4 - "profile.js"
Cohesion: 0.13
Nodes (18): FileField(), handlePick(), todayStr(), DEFAULT_CENTER, MapPicker(), PhotoField(), handlePick(), todayStr() (+10 more)

### Community 5 - "EmployeeReimbursements"
Cohesion: 0.12
Nodes (18): ReimbursementClaimDetail(), ReimbursementThread(), REIMBURSEMENT_STATUSES, AdminReimbursements(), closeMenu(), handleClickOutside(), nameOf(), EmployeeReimbursements() (+10 more)

### Community 6 - "usePagination"
Cohesion: 0.14
Nodes (30): Avatar(), BLANK_FORM, KIND_OPTS, getFocusableElements(), Modal(), focusables(), onKeyDown(), Pagination() (+22 more)

### Community 7 - "store.js"
Cohesion: 0.06
Nodes (47): APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, applyCorrectionToAttendance(), ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, camelToSnake(), CRITICAL_KEYS (+39 more)

### Community 8 - "write"
Cohesion: 0.09
Nodes (26): createCabRequest(), createITIssue(), createTicket(), deleteCabRequest(), getCabRequests(), reopenITIssue(), resetToSampleData(), setITIssueStatus() (+18 more)

### Community 9 - "AdminTasks"
Cohesion: 0.12
Nodes (26): addTaskMessageByAdmin(), approveTaskClosure(), deleteTask(), deleteTaskByAssignee(), deleteTaskByManager(), getTaskById(), getTasks(), getTasksForAssignee() (+18 more)

### Community 10 - "AdminSalary.jsx"
Cohesion: 0.27
Nodes (13): Payslip(), updateEmployeeSalary(), SummaryTab(), AdminSalary(), closeMenu(), handleClickOutside(), saveEdit(), computeSalary() (+5 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.15
Nodes (13): addTask(), updateTaskByAssignee(), EmployeeTasks(), assignerLabel(), bump(), closeMenu(), confirmDelete(), handleClickOutside() (+5 more)

### Community 12 - "Celebrations.jsx"
Cohesion: 0.07
Nodes (53): CelebrationAdminPanel(), closeForm(), confirmDelete(), handleSubmit(), toggleVisible(), CelebrationCard(), KIND_ICONS, CELEBRATION_EVENT_TYPES (+45 more)

### Community 13 - "EmployeeTasks.jsx"
Cohesion: 0.13
Nodes (20): TaskForm(), TaskThread(), TASK_PRIORITIES, TASK_STATUSES, getTeamMembers(), STORE_KEYS, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS (+12 more)

### Community 14 - "getReimbursements"
Cohesion: 0.13
Nodes (24): addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), markReimbursementPaid(), mergeAttendanceRows(), rejectReimbursementClaim(), retrySyncReimbursementClaim(), savePendingWrites() (+16 more)

### Community 15 - "TaskStatusChart.tsx"
Cohesion: 0.17
Nodes (15): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusChart() (+7 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "App.jsx"
Cohesion: 0.16
Nodes (18): App(), Home(), Protected(), Layout(), readNavCollapsed(), AnimatedThemeToggle(), SPRING, SUN_PATHS (+10 more)

### Community 18 - "sampleData.js"
Cohesion: 0.18
Nodes (9): ReimbursementForm(), DEFAULT_SETTINGS, DEFAULT_SHIFTS, IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, REIMBURSEMENT_CATEGORIES, SHIFT_CHANGE_STATUSES (+1 more)

### Community 19 - "notifications.js"
Cohesion: 0.17
Nodes (31): getAnnouncementsForEmployee(), getAttendanceCorrectionsForEmployee(), getCabRequestsForEmployee(), getDeletedTasks(), getDismissedNotificationIds(), getITIssues(), getITIssuesForEmployee(), getProfiles() (+23 more)

### Community 20 - "read"
Cohesion: 0.17
Nodes (14): clearCabChat(), getCabCancellationForEmployee(), getCabCancellations(), getCabCancellationsForDate(), getCabClearedAt(), read(), setCabCancellation(), MyCab() (+6 more)

### Community 21 - "AdminProfiles.jsx"
Cohesion: 0.11
Nodes (32): getProfileForEmployee(), requestProfileUpdate(), reviewProfile(), reviewProfileUpdateRequest(), saveProfileDraft(), submitProfile(), todayKey(), updateEmployeeTeam() (+24 more)

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, html2pdf.js, jszip, dependencies, clsx, framer-motion, html2pdf.js (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "origin-button.tsx"
Cohesion: 0.36
Nodes (7): assignRef(), ButtonHTMLAttributesForMotion, FILL_EASE, getCoverDiameter(), hasTextContent(), OriginButton, OriginButtonProps

### Community 26 - "CabManagement.jsx"
Cohesion: 0.18
Nodes (15): addCabMessage(), clearCabChatAdmin(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), EMPTY_TRIP_FORM (+7 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.16
Nodes (10): addTaskMessage(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), handleClickOutside(), handleCreate(), handleTaskReply() (+2 more)

### Community 28 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.07
Nodes (28): DropdownSelect(), ITIssueThread(), addITIssueComment(), assignITIssue(), getITStaff(), getITStaffById(), AdminITHelpDesk(), closeMenu() (+20 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.18
Nodes (21): TaskBoard(), canEmployeeAskQuestion(), canEmployeeDeleteTask(), canEmployeeEditTask(), canManagerApproveDone(), canManagerChangeStatus(), chartBucketKey(), closureNotice() (+13 more)

### Community 31 - "DriversTab"
Cohesion: 0.23
Nodes (11): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), bump(), DriversTab(), confirmDelete() (+3 more)

### Community 32 - "TripsTab"
Cohesion: 0.22
Nodes (10): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), normalize(), submitAdd() (+2 more)

### Community 33 - "VehiclesTab"
Cohesion: 0.22
Nodes (9): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), openEdit(), VehiclesTab(), confirmDelete(), submitAdd() (+1 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 35 - "getEmployeeById"
Cohesion: 0.07
Nodes (41): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+33 more)

### Community 36 - "useTableControls"
Cohesion: 0.33
Nodes (3): useTableControls(), MyShiftTab(), compareValues()

### Community 38 - "getShiftChangeRequests"
Cohesion: 0.18
Nodes (17): approveShiftChange(), getShiftChangeRequests(), getShiftChangeRequestsForEmployee(), rejectShiftChange(), requestShiftChange(), updateShiftChangeRequest(), withdrawShiftChangeRequest(), AdminShifts() (+9 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "RequestsTab"
Cohesion: 0.14
Nodes (17): setCabRequestStatus(), handleClickOutside(), RequestsTab(), changesParts(), decide(), handleApprove(), handleClickOutside(), handleReject() (+9 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 45 - "AdminOvertime.jsx"
Cohesion: 0.11
Nodes (33): approveOvertime(), getOvertimeRequests(), getOvertimeRequestsByMonth(), getOvertimeRequestsForEmployee(), otStage(), rejectOvertime(), requestOvertime(), updateOvertimeRequest() (+25 more)

### Community 50 - "formatDateTime"
Cohesion: 0.40
Nodes (4): ChatSection(), handleKeyDown(), send(), formatDateTime()

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "attendance.js"
Cohesion: 0.05
Nodes (85): AttendanceCorrectionForm(), AttendanceCorrectionThread(), ATTENDANCE_CORRECTION_ISSUES, addAttendanceCorrectionMessage(), attendanceMonthsLoaded(), ensureAttendanceForDate(), getAttendance(), getAttendanceCorrectionById() (+77 more)

### Community 64 - "ShiftsTab"
Cohesion: 0.16
Nodes (16): addShift(), assignEmployeeShift(), deleteShift(), getShifts(), updateShift(), AssignmentsTab(), confirmChange(), closeMenu() (+8 more)

### Community 70 - "AuthContext.jsx"
Cohesion: 0.24
Nodes (9): handleLogout(), ThemeProvider(), AuthContext, AuthProvider(), login(), logout(), getDriverById(), whenDataReady() (+1 more)

### Community 71 - "EmployeeAnnouncements"
Cohesion: 0.15
Nodes (12): createAnnouncement(), deleteAnnouncement(), getAnnouncements(), getReadAnnouncements(), getUnreadAnnouncementCount(), markAnnouncementAsRead(), confirmDelete(), handleSubmit() (+4 more)

### Community 78 - "NotificationBell"
Cohesion: 0.39
Nodes (8): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onStoreRefreshed(), onTeamMessage(), refresh()

### Community 80 - "MyCab.jsx"
Cohesion: 0.16
Nodes (18): TimeInput(), StopCard(), CabLegCard(), REQUEST_STATUS_FILTER_OPTS, requestChangeSummary(), RequestForm(), submit(), TAB_SLUGS (+10 more)

### Community 81 - "getEmployees"
Cohesion: 0.21
Nodes (11): getCabAssignmentForEmployee(), getCabAssignments(), getDriverRunSheet(), buildStops(), personInfo(), getEmployees(), setCabAssignment(), AssignTab() (+3 more)

## Knowledge Gaps
- **196 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `EmployeeTickets.jsx`, `profile.js`, `EmployeeReimbursements`, `usePagination`, `AdminTasks`, `EmployeeTasks`, `Celebrations.jsx`, `EmployeeTasks.jsx`, `read`, `AdminProfiles.jsx`, `CabManagement.jsx`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `tasks.js`, `getEmployeeById`, `getShiftChangeRequests`, `RequestsTab`, `AdminOvertime.jsx`, `attendance.js`, `EmployeeAnnouncements`, `MyCab.jsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `usePagination` to `formatDate`, `EmployeeTickets.jsx`, `EmployeeReimbursements`, `AdminTasks`, `AdminSalary.jsx`, `EmployeeTasks`, `Celebrations.jsx`, `EmployeeTasks.jsx`, `read`, `AdminProfiles.jsx`, `CabManagement.jsx`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `DriversTab`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `useTableControls`, `getShiftChangeRequests`, `RequestsTab`, `AdminOvertime.jsx`, `attendance.js`, `ShiftsTab`, `EmployeeAnnouncements`, `MyCab.jsx`, `getEmployees`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `useTableControls` to `formatDate`, `EmployeeTickets.jsx`, `EmployeeReimbursements`, `usePagination`, `AdminTasks`, `AdminSalary.jsx`, `EmployeeTasks`, `Celebrations.jsx`, `EmployeeTasks.jsx`, `read`, `AdminProfiles.jsx`, `CabManagement.jsx`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `DriversTab`, `TripsTab`, `VehiclesTab`, `getEmployeeById`, `getShiftChangeRequests`, `RequestsTab`, `AdminOvertime.jsx`, `attendance.js`, `ShiftsTab`, `EmployeeAnnouncements`, `MyCab.jsx`, `getEmployees`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `formatDate` be split into smaller, more focused modules?**
  _Cohesion score 0.06523655598001764 - nodes in this community are weakly interconnected._
- **Should `EmployeeTickets.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09634551495016612 - nodes in this community are weakly interconnected._