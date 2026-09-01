# Graph Report - WorkBuddy EMS  (2026-08-31)

## Corpus Check
- 108 files · ~98,337 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1230 nodes · 3915 edges · 74 communities (63 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a000b8c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- formatDate
- Settings
- EmployeeTickets
- EmployeeRecords
- CabManagement.jsx
- EmployeeReimbursements
- ensureAttendanceMonths
- store.js
- NotificationBell
- AdminTasks.jsx
- getEmployeeById
- EmployeeTasks.jsx
- ChatSection
- TeamChat.jsx
- AdminSalary
- origin-button.tsx
- compilerOptions
- TripsTab
- MessagesTab
- ShiftsTab
- write
- writeLocal
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- profile.js
- MapPicker.jsx
- TeamTasksPanel
- todayKey
- components.json
- tasks.js
- next-themes
- EmployeeITHelpDesk.jsx
- App.jsx
- package.json
- framer-motion
- AttendanceRecords.jsx
- TeamTasks.jsx
- attendance.js
- Product
- leaflet
- notifications.js
- check-leaves.mjs
- RequestsTab
- tailwind-merge
- DriversTab
- vite.config.js
- updateTaskStatusByEmployee
- scripts
- AdminAnnouncements
- VehiclesTab
- WorkBuddy EMS — Agent Instructions
- EmployeeDashboard
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- getOvertimeRequests
- AttendanceRecords
- getDriverRunSheet
- EmployeeDashboard.jsx
- OvertimeTable
- ProfileWizard
- downloadExcelXlsx
- getEmployees
- Layout.jsx
- getAttendance
- read
- public.attendance_corrections

## God Nodes (most connected - your core abstractions)
1. `write()` - 90 edges
2. `formatDate()` - 65 edges
3. `useTableControls()` - 64 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 59 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 53 edges
8. `AttendanceRecords()` - 40 edges
9. `read()` - 39 edges
10. `MyCab()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `validateForSubmit()`  [EXTRACTED]
  src/components/ProfileWizard.jsx → src/utils/profile.js
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminLeaves.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminReimbursements.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (74 total, 11 thin omitted)

### Community 0 - "formatDate"
Cohesion: 0.07
Nodes (64): LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), getLeaves(), getLeavesForEmployee() (+56 more)

### Community 1 - "Settings"
Cohesion: 0.18
Nodes (3): saveSettings(), Settings(), handleSave()

### Community 2 - "EmployeeTickets"
Cohesion: 0.13
Nodes (14): addTicketMessage(), createTicket(), getTickets(), getTicketsForEmployee(), updateTicket(), withdrawTicket(), handleReply(), EmployeeTickets() (+6 more)

### Community 3 - "EmployeeRecords"
Cohesion: 0.20
Nodes (11): reviewProfileUpdateRequest(), updateEmployeeTeam(), EmployeeRecords(), approveUpdateRequest(), closeEdit(), closeMenu(), denyUpdateRequest(), handleClickOutside() (+3 more)

### Community 4 - "CabManagement.jsx"
Cohesion: 0.05
Nodes (90): Avatar(), getFocusableElements(), Modal(), focusables(), onKeyDown(), Pagination(), ReimbursementForm(), SortableTh() (+82 more)

### Community 5 - "EmployeeReimbursements"
Cohesion: 0.08
Nodes (35): ReimbursementClaimDetail(), ReimbursementThread(), REIMBURSEMENT_STATUSES, addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), getReimbursementsForEmployee(), markReimbursementPaid() (+27 more)

### Community 6 - "ensureAttendanceMonths"
Cohesion: 0.21
Nodes (20): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceForDate(), ensureAttendanceMonths(), ensureAttendanceRange(), fetchAllFromTable(), fetchAttendanceWindow() (+12 more)

### Community 7 - "store.js"
Cohesion: 0.07
Nodes (32): APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, camelToSnake(), CRITICAL_KEYS, dataReadyPromise (+24 more)

### Community 8 - "NotificationBell"
Cohesion: 0.27
Nodes (11): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onTeamMessage(), refresh(), dismissAllNotifications() (+3 more)

### Community 9 - "AdminTasks.jsx"
Cohesion: 0.14
Nodes (20): addTask(), addTaskMessageByAdmin(), deleteTask(), getTasks(), getTasksForAssignee(), updateTaskByAdmin(), updateTaskStatus(), AdminTasks() (+12 more)

### Community 10 - "getEmployeeById"
Cohesion: 0.10
Nodes (33): handleLogout(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), getMyTeamDirectory(), getMyTeammates() (+25 more)

### Community 11 - "EmployeeTasks.jsx"
Cohesion: 0.14
Nodes (19): TaskStatusChart(), ASSIGNED_DURING_FILTER_OPTS, EmployeeTasks(), assignerLabel(), closeMenu(), handleClickOutside(), nameOf(), statusCell() (+11 more)

### Community 12 - "ChatSection"
Cohesion: 0.50
Nodes (3): ChatSection(), handleKeyDown(), send()

### Community 13 - "TeamChat.jsx"
Cohesion: 0.25
Nodes (13): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+5 more)

### Community 14 - "AdminSalary"
Cohesion: 0.14
Nodes (23): Payslip(), getOvertimeRequestsByMonth(), requestOvertime(), updateEmployeeSalary(), SummaryTab(), AdminSalary(), closeMenu(), handleClickOutside() (+15 more)

### Community 15 - "origin-button.tsx"
Cohesion: 0.16
Nodes (16): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, DonutChart, DonutChartProps, DonutChartSegment (+8 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "TripsTab"
Cohesion: 0.24
Nodes (9): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), normalize(), submitAdd() (+1 more)

### Community 18 - "MessagesTab"
Cohesion: 0.23
Nodes (12): addCabMessage(), clearCabChatAdmin(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), MessagesTab() (+4 more)

### Community 19 - "ShiftsTab"
Cohesion: 0.12
Nodes (28): addShift(), approveShiftChange(), deleteShift(), getShiftChangeRequests(), getShifts(), rejectShiftChange(), requestShiftChange(), updateShift() (+20 more)

### Community 20 - "write"
Cohesion: 0.13
Nodes (20): clearCabChat(), createCabRequest(), deleteCabRequest(), getCabClearedAt(), getCabRequests(), getCabRequestsForEmployee(), markAnnouncementAsRead(), resetToSampleData() (+12 more)

### Community 21 - "writeLocal"
Cohesion: 0.23
Nodes (12): mergeAttendanceRows(), pushKeyToSupabase(), retrySyncReimbursementClaim(), savePendingWrites(), scheduleRetryPush(), submitReimbursementClaimSynced(), supabaseSeen(), syncClaimRow() (+4 more)

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, html2pdf.js, jszip, lucide-react, dependencies, clsx, html2pdf.js, jszip (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "profile.js"
Cohesion: 0.14
Nodes (19): FileField(), handlePick(), todayStr(), LeaveDocumentList(), PhotoField(), handlePick(), todayStr(), ProfileView() (+11 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.13
Nodes (13): addTaskMessage(), approveTaskClosure(), getTeamMembers(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), confirmDelete() (+5 more)

### Community 28 - "todayKey"
Cohesion: 0.19
Nodes (19): getProfileForEmployee(), requestProfileUpdate(), reviewProfile(), saveProfileDraft(), submitProfile(), todayKey(), upsertProfile(), profileOf() (+11 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.17
Nodes (19): TaskBoard(), STATUS_COLORS, TaskForChart, TaskStatusKey, TASK_STATUSES, canManagerApproveDone(), closureNotice(), EMPLOYEE_ASSIGNED_STATUSES (+11 more)

### Community 32 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.06
Nodes (34): DropdownSelect(), ITIssueThread(), addITIssueComment(), assignITIssue(), createITIssue(), getITStaff(), getITStaffById(), reopenITIssue() (+26 more)

### Community 33 - "App.jsx"
Cohesion: 0.14
Nodes (13): App(), Home(), Protected(), ThemeProvider(), AnimatedThemeToggle(), SPRING, SUN_PATHS, useAuth() (+5 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 36 - "AttendanceRecords.jsx"
Cohesion: 0.14
Nodes (20): AttendanceCorrectionThread(), CORRECTION_STATUS_FILTER_OPTS, monthFilterOptions(), PERIOD_FILTER_OPTS, STATUS_FILTER_OPTS, VALID_TABS, correctionIssueLabel(), filterRecordsForStatsPeriod() (+12 more)

### Community 37 - "TeamTasks.jsx"
Cohesion: 0.18
Nodes (9): TaskForm(), TaskThread(), TASK_PRIORITIES, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, statusCell(), canManagerChangeStatus(), managerStatusOptions() (+1 more)

### Community 38 - "attendance.js"
Cohesion: 0.23
Nodes (22): getEmployeeShiftStartTime(), getSettings(), getShiftForEmployee(), AdminDashboard(), todayKey(), recordStatus(), clockMinutesFromIso(), computeAttendanceAverages() (+14 more)

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 41 - "notifications.js"
Cohesion: 0.28
Nodes (19): getAnnouncementsForEmployee(), getITIssues(), getITIssuesForEmployee(), getProfiles(), getShiftById(), getShiftChangeRequestsForEmployee(), isAnnouncementRead(), bestTime() (+11 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 43 - "RequestsTab"
Cohesion: 0.70
Nodes (5): setCabRequestStatus(), RequestsTab(), decide(), handleApprove(), handleReject()

### Community 45 - "DriversTab"
Cohesion: 0.23
Nodes (11): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), bump(), DriversTab(), confirmDelete() (+3 more)

### Community 50 - "updateTaskStatusByEmployee"
Cohesion: 0.23
Nodes (12): deleteTaskByAssignee(), getTaskById(), isSelfAssignedTask(), updateTaskByAssignee(), updateTaskStatusByEmployee(), updateTaskStatusByManager(), bump(), confirmDelete() (+4 more)

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 52 - "AdminAnnouncements"
Cohesion: 0.18
Nodes (8): createAnnouncement(), deleteAnnouncement(), getAnnouncements(), AdminAnnouncements(), closeMenu(), confirmDelete(), handleClickOutside(), handleSubmit()

### Community 53 - "VehiclesTab"
Cohesion: 0.13
Nodes (17): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), handleClickOutside(), TodayTab(), closeMenu(), handleClickOutside() (+9 more)

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "EmployeeDashboard"
Cohesion: 0.12
Nodes (21): addAttendanceCorrectionMessage(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), submitAttendanceCorrection(), updateAttendanceCorrection(), upsertRecord(), withdrawAttendanceCorrection(), handleReply() (+13 more)

### Community 61 - "getOvertimeRequests"
Cohesion: 0.23
Nodes (13): approveOvertime(), getOvertimeRequests(), otStage(), rejectOvertime(), updateOvertimeRequest(), AdminOvertime(), RequestsTab(), closeMenu() (+5 more)

### Community 62 - "AttendanceRecords"
Cohesion: 0.20
Nodes (10): attendanceMonthsLoaded(), resolveAttendanceCorrection(), AttendanceRecords(), approveCorrection(), closeMenu(), closeReview(), confirmApprove(), handleClickOutside() (+2 more)

### Community 63 - "getDriverRunSheet"
Cohesion: 0.29
Nodes (8): getCabCancellationForEmployee(), getCabCancellations(), getCabCancellationsForDate(), getDriverRunSheet(), buildStops(), personInfo(), setCabCancellation(), toggleCancellation()

### Community 64 - "EmployeeDashboard.jsx"
Cohesion: 0.23
Nodes (8): AttendanceCorrectionForm(), ATTENDANCE_CORRECTION_ISSUES, TAB_SLUGS, TABS, detectIp(), ATTENDANCE_STATS_PERIODS, checkOfficeNetwork(), fetchPublicIp()

### Community 65 - "OvertimeTable"
Cohesion: 0.33
Nodes (8): getOvertimeRequestsForEmployee(), withdrawOvertimeRequest(), bump(), OvertimeTable(), closeMenu(), handleClickOutside(), handleWithdraw(), refreshRequests()

### Community 67 - "downloadExcelXlsx"
Cohesion: 0.32
Nodes (5): exportSalariesExcel(), exportAttendanceExcel(), dateToExcelSerial(), displayValue(), downloadExcelXlsx()

### Community 68 - "getEmployees"
Cohesion: 0.43
Nodes (6): assignEmployeeShift(), getEmployees(), AssignmentsTab(), confirmChange(), CabManagement(), nameOf()

### Community 69 - "Layout.jsx"
Cohesion: 0.60
Nodes (5): Layout(), readNavCollapsed(), getTeamUnreadCount(), getUnreadAnnouncementCount(), profilePhotoUrl()

### Community 70 - "getAttendance"
Cohesion: 0.33
Nodes (6): applyCorrectionToAttendance(), findOrCreateAttendanceRecord(), getAttendance(), getAttendanceForEmployee(), getTodayRecord(), combineDateAndTime()

### Community 71 - "read"
Cohesion: 0.33
Nodes (6): getDismissedNotificationIds(), getReadAnnouncements(), getReadNotificationIds(), read(), getEmployeeNotificationFeed(), getNotificationFeed()

## Knowledge Gaps
- **187 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `EmployeeTickets`, `EmployeeRecords`, `CabManagement.jsx`, `EmployeeReimbursements`, `AdminTasks.jsx`, `getEmployeeById`, `EmployeeTasks.jsx`, `ShiftsTab`, `write`, `profile.js`, `TeamTasksPanel`, `todayKey`, `tasks.js`, `EmployeeITHelpDesk.jsx`, `App.jsx`, `AttendanceRecords.jsx`, `TeamTasks.jsx`, `attendance.js`, `RequestsTab`, `AdminAnnouncements`, `EmployeeDashboard`, `AttendanceRecords`, `EmployeeDashboard.jsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `CabManagement.jsx` to `formatDate`, `EmployeeTickets`, `EmployeeRecords`, `EmployeeReimbursements`, `AdminTasks.jsx`, `getEmployeeById`, `EmployeeTasks.jsx`, `AdminSalary`, `TripsTab`, `ShiftsTab`, `write`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `App.jsx`, `AttendanceRecords.jsx`, `TeamTasks.jsx`, `attendance.js`, `RequestsTab`, `DriversTab`, `AdminAnnouncements`, `VehiclesTab`, `EmployeeDashboard`, `getOvertimeRequests`, `AttendanceRecords`, `EmployeeDashboard.jsx`, `OvertimeTable`, `getEmployees`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `CabManagement.jsx` to `formatDate`, `EmployeeTickets`, `EmployeeRecords`, `EmployeeReimbursements`, `AdminTasks.jsx`, `getEmployeeById`, `EmployeeTasks.jsx`, `AdminSalary`, `TripsTab`, `ShiftsTab`, `write`, `TeamTasksPanel`, `EmployeeITHelpDesk.jsx`, `App.jsx`, `AttendanceRecords.jsx`, `TeamTasks.jsx`, `attendance.js`, `DriversTab`, `AdminAnnouncements`, `VehiclesTab`, `EmployeeDashboard`, `getOvertimeRequests`, `AttendanceRecords`, `EmployeeDashboard.jsx`, `OvertimeTable`, `getEmployees`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `formatDate` be split into smaller, more focused modules?**
  _Cohesion score 0.0680379746835443 - nodes in this community are weakly interconnected._
- **Should `EmployeeTickets` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._