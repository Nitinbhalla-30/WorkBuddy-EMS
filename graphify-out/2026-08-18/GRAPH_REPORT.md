# Graph Report - WorkBuddy EMS  (2026-08-18)

## Corpus Check
- 94 files · ~70,079 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 961 nodes · 3035 edges · 49 communities (37 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `291b24e4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- attendance.js
- getSettings
- formatDate
- profile.js
- EmployeeITHelpDesk.jsx
- assignITIssue
- EmployeeTickets.jsx
- getEmployeeById
- write
- EmployeeTasks.jsx
- store.js
- TaskStatusChart.tsx
- compilerOptions
- MyCab.jsx
- DriversTab
- notifications.js
- App.jsx
- CabManagement.jsx
- TeamTasksPanel
- devDependencies
- dependencies
- useTableControls
- AdminAnnouncements
- components.json
- TeamTasks.jsx
- NotificationBell.jsx
- TripsTab
- VehiclesTab
- AdminTasks
- getDriverRunSheet
- EmployeeAnnouncements
- package.json
- buildSampleAttendance
- ReimbursementForm.jsx
- AdminTasks.jsx
- AttendanceCorrectionForm.jsx
- WorkBuddy EMS — Agent Instructions
- leaflet
- next-themes
- react-dom
- react-router-dom
- tailwind-merge
- supabase-setup.sql
- vite.config.js
- supabaseClient.js

## God Nodes (most connected - your core abstractions)
1. `write()` - 70 edges
2. `formatDate()` - 66 edges
3. `useAuth()` - 51 edges
4. `useTableControls()` - 50 edges
5. `usePagination()` - 49 edges
6. `getEmployeeById()` - 43 edges
7. `todayKey()` - 43 edges
8. `EmployeeDashboard()` - 42 edges
9. `AttendanceRecords()` - 34 edges
10. `EmployeeLeaves()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `toggleCancellation()` --indirect_call--> `todayKey()`  [INFERRED]
  src/pages/MyCab.jsx → src/data/store.js
- `profileOf()` --calls--> `getProfileForEmployee()`  [EXTRACTED]
  src/pages/AdminProfiles.jsx → src/data/store.js
- `handleSubmit()` --calls--> `createAnnouncement()`  [EXTRACTED]
  src/pages/AdminAnnouncements.jsx → src/data/store.js
- `confirmDelete()` --calls--> `deleteAnnouncement()`  [EXTRACTED]
  src/pages/AdminAnnouncements.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (49 total, 12 thin omitted)

### Community 0 - "attendance.js"
Cohesion: 0.07
Nodes (65): AttendanceCorrectionThread(), addAttendanceCorrectionMessage(), getAttendance(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), getAttendanceForEmployee(), getTodayRecord(), resolveAttendanceCorrection() (+57 more)

### Community 1 - "getSettings"
Cohesion: 0.10
Nodes (23): Payslip(), getLeaveById(), getLeaves(), getSettings(), resetToSampleData(), saveSettings(), AdminSalary(), closeMenu() (+15 more)

### Community 2 - "formatDate"
Cohesion: 0.07
Nodes (61): LeaveDocumentList(), LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), getLeavesForEmployee() (+53 more)

### Community 3 - "profile.js"
Cohesion: 0.06
Nodes (41): Avatar(), FileField(), handlePick(), todayStr(), Layout(), handleLogout(), DEFAULT_CENTER, MapPicker() (+33 more)

### Community 4 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.06
Nodes (34): ITIssueThread(), IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, addITIssueComment(), createITIssue(), getITStaff(), getITStaffById() (+26 more)

### Community 6 - "EmployeeTickets.jsx"
Cohesion: 0.08
Nodes (36): TicketForm(), TicketThread(), TICKET_CATEGORIES, TICKET_STATUSES, addTicketMessage(), createTicket(), getTicketsForHR(), setTicketStatus() (+28 more)

### Community 7 - "getEmployeeById"
Cohesion: 0.08
Nodes (34): getEmployeeById(), getEmployees(), getMyTeamDirectory(), getMyTeammates(), getTeamMembers(), managerDecideLeave(), reviewProfile(), reviewProfileUpdateRequest() (+26 more)

### Community 8 - "write"
Cohesion: 0.29
Nodes (10): createAnnouncement(), deleteAnnouncement(), dismissAllNotifications(), getAnnouncements(), getCabRequests(), read(), setCabRequestStatus(), write() (+2 more)

### Community 9 - "EmployeeTasks.jsx"
Cohesion: 0.10
Nodes (30): TaskStatusChart(), ASSIGNED_DURING_FILTER_OPTS, EmployeeTasks(), assignerLabel(), bump(), closeMenu(), confirmDelete(), handleClickOutside() (+22 more)

### Community 10 - "store.js"
Cohesion: 0.10
Nodes (30): DEFAULT_SETTINGS, SAMPLE_ANNOUNCEMENTS, SAMPLE_ATTENDANCE, SAMPLE_ATTENDANCE_CORRECTIONS, SAMPLE_CAB_ASSIGNMENTS, SAMPLE_CAB_MESSAGES, SAMPLE_CAB_REQUESTS, SAMPLE_DRIVERS (+22 more)

### Community 11 - "TaskStatusChart.tsx"
Cohesion: 0.13
Nodes (20): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusKey (+12 more)

### Community 12 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 13 - "MyCab.jsx"
Cohesion: 0.18
Nodes (23): createCabRequest(), getCabAssignmentForEmployee(), getCabCancellationForEmployee(), getCabRequestsForEmployee(), StopCard(), ChatSection(), MyCab(), RequestForm() (+15 more)

### Community 14 - "DriversTab"
Cohesion: 0.21
Nodes (12): addDriver(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), bump(), DriversTab(), confirmDelete() (+4 more)

### Community 15 - "notifications.js"
Cohesion: 0.30
Nodes (16): getAnnouncementsForEmployee(), getITIssues(), getITIssuesForEmployee(), getProfileForEmployee(), getProfiles(), getTasksForAssignee(), getTickets(), getTicketsForEmployee() (+8 more)

### Community 16 - "App.jsx"
Cohesion: 0.07
Nodes (51): App(), Home(), Protected(), ReimbursementThread(), ThemeProvider(), AuthContext, AuthProvider(), login() (+43 more)

### Community 17 - "CabManagement.jsx"
Cohesion: 0.21
Nodes (12): TimeInput(), addCabMessage(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), CabManagement(), EMPTY_TRIP_FORM (+4 more)

### Community 18 - "TeamTasksPanel"
Cohesion: 0.13
Nodes (13): addTask(), addTaskMessage(), handleCreate(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu(), handleApproveClosure() (+5 more)

### Community 19 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+9 more)

### Community 20 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, html2pdf.js, jszip, lucide-react, dependencies, clsx, framer-motion (+9 more)

### Community 21 - "useTableControls"
Cohesion: 0.16
Nodes (22): getFocusableElements(), Modal(), focusables(), onKeyDown(), Pagination(), SortableTh(), TableEmpty(), TableToolbar() (+14 more)

### Community 22 - "AdminAnnouncements"
Cohesion: 0.20
Nodes (5): AdminAnnouncements(), closeMenu(), confirmDelete(), handleClickOutside(), handleSubmit()

### Community 23 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 24 - "TeamTasks.jsx"
Cohesion: 0.33
Nodes (3): TaskThread(), TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS

### Community 25 - "NotificationBell.jsx"
Cohesion: 0.22
Nodes (13): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), refresh(), getDismissedNotificationIds(), getNotificationReadsMap() (+5 more)

### Community 26 - "TripsTab"
Cohesion: 0.24
Nodes (9): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), normalize(), submitAdd() (+1 more)

### Community 27 - "VehiclesTab"
Cohesion: 0.14
Nodes (16): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), handleClickOutside(), TodayTab(), closeMenu(), handleClickOutside() (+8 more)

### Community 28 - "AdminTasks"
Cohesion: 0.13
Nodes (23): addTaskMessageByAdmin(), approveTaskClosure(), deleteTask(), deleteTaskByAssignee(), getTaskById(), getTasks(), isSelfAssignedTask(), updateTaskByAdmin() (+15 more)

### Community 29 - "getDriverRunSheet"
Cohesion: 0.20
Nodes (11): getCabAssignments(), getCabCancellations(), getCabCancellationsForDate(), getDriverRunSheet(), buildStops(), personInfo(), setCabAssignment(), setCabCancellation() (+3 more)

### Community 30 - "EmployeeAnnouncements"
Cohesion: 0.29
Nodes (4): getReadAnnouncements(), markAnnouncementAsRead(), EmployeeAnnouncements(), handleOpen()

### Community 31 - "package.json"
Cohesion: 0.20
Nodes (9): description, name, private, scripts, build, dev, preview, type (+1 more)

### Community 32 - "buildSampleAttendance"
Cohesion: 0.40
Nodes (6): atTime(), buildSampleAttendance(), dateKey(), dayFromToday(), hasApprovedLeaveOn(), pad()

### Community 34 - "AdminTasks.jsx"
Cohesion: 0.19
Nodes (17): TaskBoard(), TaskForm(), TASK_PRIORITIES, TASK_STATUSES, TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, EMPLOYEE_ASSIGNED_STATUSES, EMPLOYEE_SELF_STATUSES (+9 more)

## Knowledge Gaps
- **124 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatDate()` connect `formatDate` to `attendance.js`, `AdminTasks.jsx`, `profile.js`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets.jsx`, `getEmployeeById`, `write`, `EmployeeTasks.jsx`, `MyCab.jsx`, `App.jsx`, `CabManagement.jsx`, `TeamTasksPanel`, `useTableControls`, `AdminAnnouncements`, `TeamTasks.jsx`, `NotificationBell.jsx`, `AdminTasks`, `EmployeeAnnouncements`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `useTableControls` to `attendance.js`, `getSettings`, `formatDate`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets.jsx`, `getEmployeeById`, `EmployeeTasks.jsx`, `MyCab.jsx`, `DriversTab`, `App.jsx`, `CabManagement.jsx`, `TeamTasksPanel`, `AdminAnnouncements`, `TeamTasks.jsx`, `TripsTab`, `VehiclesTab`, `AdminTasks`, `getDriverRunSheet`, `EmployeeAnnouncements`, `AdminTasks.jsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `useTableControls` to `attendance.js`, `getSettings`, `formatDate`, `EmployeeITHelpDesk.jsx`, `EmployeeTickets.jsx`, `getEmployeeById`, `write`, `EmployeeTasks.jsx`, `MyCab.jsx`, `DriversTab`, `App.jsx`, `CabManagement.jsx`, `TeamTasksPanel`, `AdminAnnouncements`, `TeamTasks.jsx`, `TripsTab`, `VehiclesTab`, `AdminTasks`, `getDriverRunSheet`, `EmployeeAnnouncements`, `AdminTasks.jsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `attendance.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07010710808179163 - nodes in this community are weakly interconnected._
- **Should `getSettings` be split into smaller, more focused modules?**
  _Cohesion score 0.09815078236130868 - nodes in this community are weakly interconnected._