# Graph Report - WorkBuddy EMS  (2026-09-02)

## Corpus Check
- 114 files · ~105,954 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1282 nodes · 4027 edges · 81 communities (66 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5eec80a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- leaves.js
- EmployeeITHelpDesk.jsx
- EmployeeTickets.jsx
- refreshStoreFromSupabase
- CabManagement.jsx
- EmployeeReimbursements
- EmployeeDashboard.jsx
- store.js
- monthKey
- AdminTasks
- AttendanceRecords
- EmployeeTasks
- RequestsTab
- EmployeeTasks.jsx
- ChangeRequestsTab
- TaskStatusChart.tsx
- compilerOptions
- App.jsx
- write
- notifications.js
- MyCab
- attendance.js
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- resolveStartTime
- MessagesTab
- TeamTasksPanel
- OvertimeTable
- components.json
- tasks.js
- next-themes
- EmployeeITHelpDesk
- profile.js
- package.json
- getEmployeeById
- AdminDashboard
- todayKey
- getEmployees
- Product
- leaflet
- DriversTab
- check-leaves.mjs
- tailwind-merge
- getSettings
- vite.config.js
- EmployeeReimbursements.jsx
- scripts
- TeamChat.jsx
- AssignmentsTab
- WorkBuddy EMS — Agent Instructions
- EmployeeDashboard
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- public.leaves
- framer-motion
- TripsTab
- tasks
- ShiftsTab
- AdminAnnouncements.jsx
- public.attendance_corrections
- public.it_issues
- public.tickets
- public.it_issues
- read
- VehiclesTab
- getAttendanceCorrections
- AssignTab
- ShiftFormModal

## God Nodes (most connected - your core abstractions)
1. `write()` - 92 edges
2. `useTableControls()` - 65 edges
3. `formatDate()` - 65 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 60 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 53 edges
8. `read()` - 41 edges
9. `AttendanceRecords()` - 40 edges
10. `MyCab()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminLeaves.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminReimbursements.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AttendanceRecords.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (81 total, 15 thin omitted)

### Community 0 - "leaves.js"
Cohesion: 0.08
Nodes (44): LeaveForm(), changeType(), setLeaveStatus(), AdminLeaves(), closeMenu(), closeReview(), handleApprove(), handleClickOutside() (+36 more)

### Community 1 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.13
Nodes (14): DropdownSelect(), ITIssueThread(), IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, SHIFT_CHANGE_STATUSES, TICKET_CATEGORIES, IT_CATEGORY_FILTER_OPTS (+6 more)

### Community 2 - "EmployeeTickets.jsx"
Cohesion: 0.10
Nodes (24): TicketForm(), TicketThread(), TICKET_STATUSES, getTicketsForHR(), AdminTickets(), closeMenu(), handleClickOutside(), TICKET_KIND_OPTS (+16 more)

### Community 3 - "refreshStoreFromSupabase"
Cohesion: 0.18
Nodes (23): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceMonths(), fetchAllFromTable(), fetchAttendanceWindow(), flushQueuedRowDeletes(), initStore() (+15 more)

### Community 4 - "CabManagement.jsx"
Cohesion: 0.12
Nodes (36): Avatar(), Pagination(), SortableTh(), TableEmpty(), TableToolbar(), usePagination(), useTableControls(), TAB_SLUGS (+28 more)

### Community 5 - "EmployeeReimbursements"
Cohesion: 0.07
Nodes (40): ReimbursementClaimDetail(), ReimbursementThread(), REIMBURSEMENT_STATUSES, addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), markReimbursementPaid(), rejectReimbursementClaim() (+32 more)

### Community 6 - "EmployeeDashboard.jsx"
Cohesion: 0.16
Nodes (9): AttendanceCorrectionForm(), AttendanceCorrectionThread(), ATTENDANCE_CORRECTION_ISSUES, getAttendanceForEmployee(), TAB_SLUGS, TABS, ATTENDANCE_STATS_PERIODS, currentState() (+1 more)

### Community 7 - "store.js"
Cohesion: 0.05
Nodes (49): DEFAULT_SETTINGS, DEFAULT_SHIFTS, APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, applyCorrectionToAttendance(), ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths (+41 more)

### Community 8 - "monthKey"
Cohesion: 0.29
Nodes (11): ensureAttendanceRange(), monthFilterOptions(), lastMonthKey(), monthKey(), monthKeyOffset(), monthKeysBetween(), monthLabel(), monthsForStatsPeriod() (+3 more)

### Community 9 - "AdminTasks"
Cohesion: 0.15
Nodes (14): addTask(), addTaskMessageByAdmin(), deleteTask(), updateTaskByAdmin(), AdminTasks(), bump(), closeMenu(), confirmDelete() (+6 more)

### Community 10 - "AttendanceRecords"
Cohesion: 0.15
Nodes (14): attendanceMonthsLoaded(), AttendanceRecords(), approveCorrection(), closeMenu(), closeReview(), confirmApprove(), handleClickOutside(), nameOf() (+6 more)

### Community 11 - "EmployeeTasks"
Cohesion: 0.11
Nodes (23): approveTaskClosure(), deleteTaskByAssignee(), getTaskById(), getTasks(), getTasksForAssignee(), isSelfAssignedTask(), updateTaskByAssignee(), updateTaskStatus() (+15 more)

### Community 12 - "RequestsTab"
Cohesion: 0.24
Nodes (10): setCabRequestStatus(), RequestsTab(), decide(), handleApprove(), handleClickOutside(), handleReject(), TodayTab(), closeMenu() (+2 more)

### Community 13 - "EmployeeTasks.jsx"
Cohesion: 0.16
Nodes (18): TaskForm(), TaskStatusChart(), TASK_PRIORITIES, TASK_STATUSES, STORE_KEYS, ASSIGNED_DURING_FILTER_OPTS, statusCell(), TASK_PRIORITY_FILTER_OPTS (+10 more)

### Community 14 - "ChangeRequestsTab"
Cohesion: 0.29
Nodes (9): getEmployeeShiftStartTime(), getShiftChangeRequestsForEmployee(), getShiftForEmployee(), withdrawShiftChangeRequest(), ChangeRequestsTab(), closeMenu(), handleClickOutside(), handleWithdraw() (+1 more)

### Community 15 - "TaskStatusChart.tsx"
Cohesion: 0.13
Nodes (20): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusKey (+12 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "App.jsx"
Cohesion: 0.12
Nodes (21): App(), Home(), Protected(), Layout(), readNavCollapsed(), ProfileView(), AnimatedThemeToggle(), SPRING (+13 more)

### Community 18 - "write"
Cohesion: 0.07
Nodes (39): addTicketMessage(), approveShiftChange(), createITIssue(), createTicket(), deleteCabRequest(), getShiftChangeRequests(), getTickets(), rejectShiftChange() (+31 more)

### Community 19 - "notifications.js"
Cohesion: 0.19
Nodes (30): getAnnouncementsForEmployee(), getCabRequests(), getCabRequestsForEmployee(), getITIssues(), getITIssuesForEmployee(), getLeaves(), getLeavesForEmployee(), getOvertimeRequestsForEmployee() (+22 more)

### Community 20 - "MyCab"
Cohesion: 0.11
Nodes (25): clearCabChat(), getCabClearedAt(), updateCabRequest(), changesParts(), CabLegCard(), MyCab(), closeMenu(), handleClickOutside() (+17 more)

### Community 21 - "attendance.js"
Cohesion: 0.17
Nodes (10): LeaveThread(), TaskThread(), LEAVE_TYPES, STATUS_FILTER_OPTS, TYPE_FILTER_OPTS, BALANCE_ICONS, LEAVE_STATUS_FILTERS, LEAVE_TYPE_FILTERS (+2 more)

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, html2pdf.js, jszip, lucide-react, dependencies, clsx, html2pdf.js, jszip (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "resolveStartTime"
Cohesion: 0.24
Nodes (7): exportSalariesExcel(), exportAttendanceExcel(), recordStatus(), resolveStartTime(), dateToExcelSerial(), displayValue(), downloadExcelXlsx()

### Community 26 - "MessagesTab"
Cohesion: 0.23
Nodes (12): addCabMessage(), clearCabChatAdmin(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), MessagesTab() (+4 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.15
Nodes (11): addTaskMessage(), deleteTaskByManager(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), confirmDelete(), handleClickOutside() (+3 more)

### Community 28 - "OvertimeTable"
Cohesion: 0.36
Nodes (7): withdrawOvertimeRequest(), bump(), OvertimeTable(), closeMenu(), handleClickOutside(), handleWithdraw(), refreshRequests()

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.18
Nodes (21): TaskBoard(), canEmployeeAskQuestion(), canEmployeeDeleteTask(), canEmployeeEditTask(), canManagerApproveDone(), canManagerChangeStatus(), chartBucketKey(), closureNotice() (+13 more)

### Community 32 - "EmployeeITHelpDesk"
Cohesion: 0.08
Nodes (21): addITIssueComment(), assignITIssue(), getITStaff(), getITStaffById(), AdminITHelpDesk(), closeMenu(), handleAssigneeChange(), handleClickOutside() (+13 more)

### Community 33 - "profile.js"
Cohesion: 0.05
Nodes (49): FileField(), handlePick(), todayStr(), LeaveDocumentList(), DEFAULT_CENTER, MapPicker(), PhotoField(), handlePick() (+41 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 35 - "getEmployeeById"
Cohesion: 0.09
Nodes (32): handleLogout(), ThemeProvider(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), getMyTeamDirectory() (+24 more)

### Community 36 - "AdminDashboard"
Cohesion: 0.24
Nodes (15): AdminDashboard(), todayKey(), clockMinutesFromIso(), computeAttendanceAverages(), computeMonthAverages(), computeMonthRawAverages(), formatAverageClock(), formatClock() (+7 more)

### Community 37 - "todayKey"
Cohesion: 0.15
Nodes (15): addLeaveMessage(), applyLeave(), createCabRequest(), getTodayRecord(), setCabCancellation(), todayKey(), updateLeave(), withdrawLeave() (+7 more)

### Community 38 - "getEmployees"
Cohesion: 0.24
Nodes (10): getDriverRunSheet(), buildStops(), personInfo(), getEmployees(), getMyTeammates(), getTeamMembers(), updateEmployeeSalary(), saveEdit() (+2 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "DriversTab"
Cohesion: 0.19
Nodes (13): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), bump(), DriversTab(), confirmDelete() (+5 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 45 - "getSettings"
Cohesion: 0.06
Nodes (41): Payslip(), approveOvertime(), getApprovedOvertimeForMonth(), getAttendance(), getOvertimeRequests(), getOvertimeRequestsByMonth(), getSettings(), otStage() (+33 more)

### Community 50 - "EmployeeReimbursements.jsx"
Cohesion: 0.18
Nodes (9): getFocusableElements(), Modal(), focusables(), onKeyDown(), ReimbursementForm(), TimeInput(), REIMBURSEMENT_CATEGORIES, CATEGORY_FILTERS (+1 more)

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 52 - "TeamChat.jsx"
Cohesion: 0.12
Nodes (24): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onStoreRefreshed(), onTeamMessage(), refresh() (+16 more)

### Community 53 - "AssignmentsTab"
Cohesion: 0.40
Nodes (5): assignEmployeeShift(), getShiftHistory(), getShiftHistoryForEmployee(), AssignmentsTab(), confirmChange()

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "EmployeeDashboard"
Cohesion: 0.19
Nodes (10): upsertRecord(), EmployeeDashboard(), closeMenu(), endBreak(), guard(), handleClickOutside(), markTimeIn(), markTimeOut() (+2 more)

### Community 64 - "TripsTab"
Cohesion: 0.22
Nodes (10): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), handleClickOutside(), normalize() (+2 more)

### Community 70 - "ShiftsTab"
Cohesion: 0.22
Nodes (13): addShift(), deleteShift(), getShifts(), updateShift(), closeMenu(), handleClickOutside(), toggleMenu(), ShiftsTab() (+5 more)

### Community 71 - "AdminAnnouncements.jsx"
Cohesion: 0.20
Nodes (9): ANNOUNCEMENT_TYPES, AdminAnnouncements(), closeMenu(), handleClickOutside(), ANNOUNCEMENT_TYPE_OPTS, ANNOUNCEMENT_TYPE_OPTS, READ_FILTER_OPTS, announcementTypeLabel() (+1 more)

### Community 78 - "read"
Cohesion: 0.15
Nodes (19): dismissAllNotifications(), flushRowDeletes(), getDeletedTasks(), getDismissedNotificationIds(), getNotificationReadsMap(), getReadNotificationIds(), healDeletedTaskRows(), markAllNotificationsRead() (+11 more)

### Community 79 - "VehiclesTab"
Cohesion: 0.20
Nodes (10): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), openEdit(), VehiclesTab(), confirmDelete(), handleClickOutside() (+2 more)

### Community 82 - "getAttendanceCorrections"
Cohesion: 0.21
Nodes (13): addAttendanceCorrectionMessage(), getAttendanceCorrectionById(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), submitAttendanceCorrection(), updateAttendanceCorrection(), withdrawAttendanceCorrection(), handleReply() (+5 more)

### Community 86 - "AssignTab"
Cohesion: 0.67
Nodes (3): setCabAssignment(), AssignTab(), save()

## Knowledge Gaps
- **193 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `attendance.js` to `leaves.js`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets.jsx`, `CabManagement.jsx`, `EmployeeReimbursements`, `EmployeeDashboard.jsx`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `RequestsTab`, `EmployeeTasks.jsx`, `ChangeRequestsTab`, `App.jsx`, `MyCab`, `TeamTasksPanel`, `tasks.js`, `EmployeeITHelpDesk`, `profile.js`, `getEmployeeById`, `AdminDashboard`, `EmployeeDashboard`, `AdminAnnouncements.jsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `CabManagement.jsx` to `leaves.js`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets.jsx`, `EmployeeReimbursements`, `EmployeeDashboard.jsx`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `RequestsTab`, `EmployeeTasks.jsx`, `ChangeRequestsTab`, `App.jsx`, `write`, `MyCab`, `attendance.js`, `TeamTasksPanel`, `OvertimeTable`, `EmployeeITHelpDesk`, `profile.js`, `getEmployeeById`, `AdminDashboard`, `DriversTab`, `getSettings`, `EmployeeReimbursements.jsx`, `AssignmentsTab`, `EmployeeDashboard`, `TripsTab`, `ShiftsTab`, `AdminAnnouncements.jsx`, `VehiclesTab`, `AssignTab`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `CabManagement.jsx` to `leaves.js`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets.jsx`, `EmployeeReimbursements`, `EmployeeDashboard.jsx`, `AdminTasks`, `AttendanceRecords`, `EmployeeTasks`, `RequestsTab`, `EmployeeTasks.jsx`, `ChangeRequestsTab`, `App.jsx`, `write`, `MyCab`, `attendance.js`, `TeamTasksPanel`, `OvertimeTable`, `EmployeeITHelpDesk`, `profile.js`, `getEmployeeById`, `AdminDashboard`, `DriversTab`, `getSettings`, `EmployeeReimbursements.jsx`, `AssignmentsTab`, `EmployeeDashboard`, `TripsTab`, `ShiftsTab`, `AdminAnnouncements.jsx`, `VehiclesTab`, `AssignTab`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `leaves.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07676767676767676 - nodes in this community are weakly interconnected._
- **Should `EmployeeITHelpDesk.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1341991341991342 - nodes in this community are weakly interconnected._