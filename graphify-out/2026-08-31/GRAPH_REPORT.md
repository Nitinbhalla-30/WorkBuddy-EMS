# Graph Report - WorkBuddy EMS  (2026-08-31)

## Corpus Check
- 107 files · ~97,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1226 nodes · 3916 edges · 60 communities (49 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a000b8c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- formatDate
- Settings
- sampleData.js
- EmployeeRecords
- App.jsx
- EmployeeReimbursements.jsx
- ensureAttendanceMonths
- store.js
- NotificationBell
- AdminTasks.jsx
- getEmployeeById
- EmployeeTasks.jsx
- formatDateTime
- TeamChat.jsx
- AdminOvertime.jsx
- origin-button.tsx
- compilerOptions
- TripsTab
- write
- notifications.js
- MyCab.jsx
- pushKeyToSupabase
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- profile.js
- MapPicker.jsx
- TeamTasksPanel
- getProfileForEmployee
- components.json
- tasks.js
- next-themes
- todayKey
- supabaseClient.js
- package.json
- framer-motion
- TeamTasks.jsx
- Product
- leaflet
- check-leaves.mjs
- CabManagement.jsx
- tailwind-merge
- DriversTab
- vite.config.js
- EmployeeTasks
- scripts
- AdminAnnouncements
- VehiclesTab
- WorkBuddy EMS — Agent Instructions
- attendance.js
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements
- getDriverRunSheet
- ProfileWizard

## God Nodes (most connected - your core abstractions)
1. `write()` - 90 edges
2. `formatDate()` - 65 edges
3. `useTableControls()` - 64 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 59 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 52 edges
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
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/TeamTasks.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (60 total, 11 thin omitted)

### Community 0 - "formatDate"
Cohesion: 0.07
Nodes (64): LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), getLeaves(), getLeavesForEmployee() (+56 more)

### Community 1 - "Settings"
Cohesion: 0.18
Nodes (3): saveSettings(), Settings(), handleSave()

### Community 2 - "sampleData.js"
Cohesion: 0.06
Nodes (39): TicketForm(), TicketThread(), DEFAULT_SETTINGS, DEFAULT_SHIFTS, IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, REIMBURSEMENT_STATUSES (+31 more)

### Community 3 - "EmployeeRecords"
Cohesion: 0.16
Nodes (14): reviewProfile(), reviewProfileUpdateRequest(), updateEmployeeTeam(), EmployeeRecords(), approveUpdateRequest(), closeEdit(), closeMenu(), denyUpdateRequest() (+6 more)

### Community 4 - "App.jsx"
Cohesion: 0.05
Nodes (69): App(), Home(), Protected(), Avatar(), ITIssueThread(), Layout(), readNavCollapsed(), getFocusableElements() (+61 more)

### Community 5 - "EmployeeReimbursements.jsx"
Cohesion: 0.08
Nodes (43): ReimbursementClaimDetail(), ReimbursementForm(), ReimbursementThread(), REIMBURSEMENT_CATEGORIES, addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), getReimbursementsForEmployee() (+35 more)

### Community 6 - "ensureAttendanceMonths"
Cohesion: 0.22
Nodes (20): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceMonths(), fetchAllFromTable(), fetchAttendanceWindow(), initStore(), loadCriticalData() (+12 more)

### Community 7 - "store.js"
Cohesion: 0.06
Nodes (36): APP_STORE_KEYS, APP_TO_DB_FIELD, APP_TO_DB_FIELD_BY_TABLE, applyCorrectionToAttendance(), ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, camelToSnake(), CRITICAL_KEYS (+28 more)

### Community 8 - "NotificationBell"
Cohesion: 0.27
Nodes (11): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onTeamMessage(), refresh(), dismissAllNotifications() (+3 more)

### Community 9 - "AdminTasks.jsx"
Cohesion: 0.14
Nodes (20): addTask(), addTaskMessageByAdmin(), deleteTask(), getTasks(), getTasksForAssignee(), updateTaskByAdmin(), updateTaskStatus(), AdminTasks() (+12 more)

### Community 10 - "getEmployeeById"
Cohesion: 0.09
Nodes (35): handleLogout(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), getMyTeamDirectory(), getMyTeammates() (+27 more)

### Community 11 - "EmployeeTasks.jsx"
Cohesion: 0.20
Nodes (17): TaskStatusChart(), ASSIGNED_DURING_FILTER_OPTS, statusCell(), TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, statusCell(), canEmployeeAskQuestion(), canEmployeeDeleteTask() (+9 more)

### Community 12 - "formatDateTime"
Cohesion: 0.40
Nodes (4): ChatSection(), handleKeyDown(), send(), formatDateTime()

### Community 13 - "TeamChat.jsx"
Cohesion: 0.27
Nodes (12): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+4 more)

### Community 14 - "AdminOvertime.jsx"
Cohesion: 0.08
Nodes (50): Payslip(), approveOvertime(), getEmployees(), getOvertimeRequests(), getOvertimeRequestsByMonth(), getOvertimeRequestsForEmployee(), otStage(), rejectOvertime() (+42 more)

### Community 15 - "origin-button.tsx"
Cohesion: 0.16
Nodes (16): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, DonutChart, DonutChartProps, DonutChartSegment (+8 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "TripsTab"
Cohesion: 0.23
Nodes (11): addTrip(), deleteTrip(), getTrips(), updateTrip(), CabManagement(), bump(), TripsTab(), confirmDelete() (+3 more)

### Community 18 - "write"
Cohesion: 0.14
Nodes (22): addCabMessage(), clearCabChat(), clearCabChatAdmin(), createCabRequest(), deleteCabRequest(), getCabClearedAt(), getCabClearedAtAdmin(), getCabMessages() (+14 more)

### Community 19 - "notifications.js"
Cohesion: 0.06
Nodes (62): addShift(), approveShiftChange(), assignITIssue(), createITIssue(), deleteShift(), getAnnouncementsForEmployee(), getDismissedNotificationIds(), getITIssues() (+54 more)

### Community 20 - "MyCab.jsx"
Cohesion: 0.16
Nodes (22): StopCard(), MyCab(), closeMenu(), handleClickOutside(), handleEditRequest(), handleOpenRequest(), handleWithdrawRequest(), REQUEST_STATUS_FILTER_OPTS (+14 more)

### Community 21 - "pushKeyToSupabase"
Cohesion: 0.50
Nodes (5): pushKeyToSupabase(), savePendingWrites(), scheduleRetryPush(), supabaseSeen(), writeImmediate()

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
Cohesion: 0.15
Nodes (18): FileField(), handlePick(), todayStr(), LeaveDocumentList(), PhotoField(), handlePick(), todayStr(), ProfileView() (+10 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.13
Nodes (13): addTaskMessage(), approveTaskClosure(), getTeamMembers(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), confirmDelete() (+5 more)

### Community 28 - "getProfileForEmployee"
Cohesion: 0.22
Nodes (16): getProfileForEmployee(), getProfiles(), requestProfileUpdate(), saveProfileDraft(), submitProfile(), upsertProfile(), profileOf(), EmployeeProfile() (+8 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.20
Nodes (16): TaskBoard(), STATUS_COLORS, TaskForChart, TaskStatusKey, TASK_STATUSES, EMPLOYEE_ASSIGNED_STATUSES, EMPLOYEE_SELF_STATUSES, groupByStatus() (+8 more)

### Community 32 - "todayKey"
Cohesion: 0.25
Nodes (8): assignEmployeeShift(), setITIssueStatus(), todayKey(), withdrawITIssue(), handleStatusChange(), AssignmentsTab(), confirmChange(), confirmWithdraw()

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 37 - "TeamTasks.jsx"
Cohesion: 0.19
Nodes (8): TaskForm(), TaskThread(), TASK_PRIORITIES, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, canManagerApproveDone(), closureNotice(), isManagerAssignedDone()

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 43 - "CabManagement.jsx"
Cohesion: 0.18
Nodes (11): DropdownSelect(), TimeInput(), setCabRequestStatus(), EMPTY_TRIP_FORM, RequestsTab(), decide(), handleApprove(), handleReject() (+3 more)

### Community 45 - "DriversTab"
Cohesion: 0.13
Nodes (18): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), DriversTab(), confirmDelete(), handleClickOutside() (+10 more)

### Community 50 - "EmployeeTasks"
Cohesion: 0.13
Nodes (18): deleteTaskByAssignee(), getTaskById(), isSelfAssignedTask(), updateTaskByAssignee(), updateTaskStatusByEmployee(), updateTaskStatusByManager(), EmployeeTasks(), assignerLabel() (+10 more)

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 52 - "AdminAnnouncements"
Cohesion: 0.13
Nodes (12): createAnnouncement(), deleteAnnouncement(), getAnnouncements(), getReadAnnouncements(), getUnreadAnnouncementCount(), markAnnouncementAsRead(), AdminAnnouncements(), closeMenu() (+4 more)

### Community 53 - "VehiclesTab"
Cohesion: 0.22
Nodes (9): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), openEdit(), VehiclesTab(), confirmDelete(), submitAdd() (+1 more)

### Community 54 - "WorkBuddy EMS — Agent Instructions"
Cohesion: 0.50
Nodes (3): Deploying — pushing to `main` is the deploy, Graphify knowledge graph (query-first), WorkBuddy EMS — Agent Instructions

### Community 55 - "attendance.js"
Cohesion: 0.05
Nodes (86): AttendanceCorrectionForm(), AttendanceCorrectionThread(), ATTENDANCE_CORRECTION_ISSUES, addAttendanceCorrectionMessage(), attendanceMonthsLoaded(), getAttendance(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee() (+78 more)

### Community 63 - "getDriverRunSheet"
Cohesion: 0.16
Nodes (13): getCabAssignmentForEmployee(), getCabAssignments(), getCabCancellationForEmployee(), getCabCancellations(), getCabCancellationsForDate(), getDriverRunSheet(), buildStops(), personInfo() (+5 more)

## Knowledge Gaps
- **186 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+181 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `sampleData.js`, `EmployeeRecords`, `App.jsx`, `EmployeeReimbursements.jsx`, `TeamTasks.jsx`, `AdminTasks.jsx`, `getEmployeeById`, `CabManagement.jsx`, `EmployeeTasks.jsx`, `EmployeeTasks`, `notifications.js`, `AdminAnnouncements`, `MyCab.jsx`, `attendance.js`, `profile.js`, `TeamTasksPanel`, `getProfileForEmployee`, `tasks.js`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `App.jsx` to `formatDate`, `sampleData.js`, `EmployeeRecords`, `EmployeeReimbursements.jsx`, `AdminTasks.jsx`, `getEmployeeById`, `EmployeeTasks.jsx`, `AdminOvertime.jsx`, `TripsTab`, `notifications.js`, `MyCab.jsx`, `TeamTasksPanel`, `todayKey`, `TeamTasks.jsx`, `CabManagement.jsx`, `DriversTab`, `EmployeeTasks`, `AdminAnnouncements`, `VehiclesTab`, `attendance.js`, `getDriverRunSheet`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `App.jsx` to `formatDate`, `sampleData.js`, `EmployeeRecords`, `EmployeeReimbursements.jsx`, `AdminTasks.jsx`, `getEmployeeById`, `EmployeeTasks.jsx`, `AdminOvertime.jsx`, `TripsTab`, `notifications.js`, `MyCab.jsx`, `TeamTasksPanel`, `todayKey`, `TeamTasks.jsx`, `CabManagement.jsx`, `DriversTab`, `EmployeeTasks`, `AdminAnnouncements`, `VehiclesTab`, `attendance.js`, `getDriverRunSheet`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `formatDate` be split into smaller, more focused modules?**
  _Cohesion score 0.0680379746835443 - nodes in this community are weakly interconnected._
- **Should `sampleData.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06397306397306397 - nodes in this community are weakly interconnected._