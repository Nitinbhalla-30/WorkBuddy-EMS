# Graph Report - WorkBuddy EMS  (2026-08-27)

## Corpus Check
- 104 files · ~89,179 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1117 nodes · 3698 edges · 50 communities (43 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Leave Management Module
- Salary, Overtime & Attendance
- Attendance Correction
- Admin Profiles & Documents
- Shared UI Components
- Reimbursement Module
- Ticket Management
- Data Store Core
- IT Help Desk
- App Shell & Routing
- Auth Context & Team Data
- Task & Cab Store Operations
- My Cab & Driver View
- Notifications & Team Chat
- Employee Data Queries
- Dashboard Charts
- React Ref Utilities
- Cab Management Core
- Cab Management Trips
- Supabase Client & Config
- Shift Management
- Task Utilities
- Package Dev Config
- Package Dependencies
- Sample Data Definitions
- Cab Management Routes
- Employee Tasks Page
- Team Tasks Page
- Admin Tasks Page
- Component Aliases
- Task Utility Helpers
- Store Write Operations
- Cab Management Schedule
- Store Field Mapping
- Build & Dev Scripts
- Cab Management Drivers
- Reimbursement Thread
- Employee Dashboard
- Store Leave Operations
- Modal & Overlay Components
- Leaflet Map Dependencies
- Next.js Dependencies
- React Router Dependencies
- React DOM Dependencies
- Tailwind CSS Config
- Shift Scheduling
- Vite Build Config

## God Nodes (most connected - your core abstractions)
1. `write()` - 92 edges
2. `formatDate()` - 69 edges
3. `useTableControls()` - 64 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 59 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 46 edges
8. `todayKey()` - 42 edges
9. `MyCab()` - 39 edges
10. `read()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `refreshData()` --calls--> `refreshStoreFromSupabase()`  [EXTRACTED]
  src/pages/AdminShifts.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AttendanceRecords.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/EmployeeDashboard.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/TeamTasks.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (50 total, 7 thin omitted)

### Community 0 - "Leave Management Module"
Cohesion: 0.07
Nodes (63): LeaveForm(), changeType(), LeaveThread(), LEAVE_TYPES, addLeaveMessage(), applyLeave(), getLeaves(), getLeavesForEmployee() (+55 more)

### Community 1 - "Salary, Overtime & Attendance"
Cohesion: 0.06
Nodes (56): Payslip(), approveOvertime(), getApprovedOvertimeForMonth(), getAttendance(), getOvertimeRequests(), getOvertimeRequestsByMonth(), getSettings(), otStage() (+48 more)

### Community 2 - "Attendance Correction"
Cohesion: 0.06
Nodes (59): AttendanceCorrectionForm(), AttendanceCorrectionThread(), ATTENDANCE_CORRECTION_ISSUES, addAttendanceCorrectionMessage(), applyCorrectionToAttendance(), findOrCreateAttendanceRecord(), getTodayRecord(), resolveAttendanceCorrection() (+51 more)

### Community 3 - "Admin Profiles & Documents"
Cohesion: 0.05
Nodes (50): FileField(), handlePick(), todayStr(), LeaveDocumentList(), DEFAULT_CENTER, MapPicker(), PhotoField(), handlePick() (+42 more)

### Community 4 - "Shared UI Components"
Cohesion: 0.16
Nodes (27): Avatar(), Modal(), Pagination(), SortableTh(), TableEmpty(), TableToolbar(), AuthContext, usePagination() (+19 more)

### Community 5 - "Reimbursement Module"
Cohesion: 0.09
Nodes (40): ReimbursementForm(), REIMBURSEMENT_CATEGORIES, REIMBURSEMENT_STATUSES, addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), getReimbursementsForEmployee(), markReimbursementPaid() (+32 more)

### Community 6 - "Ticket Management"
Cohesion: 0.10
Nodes (27): TicketForm(), TicketThread(), TICKET_STATUSES, addTicketMessage(), getTicketsForHR(), AdminTickets(), closeMenu(), handleClickOutside() (+19 more)

### Community 7 - "Data Store Core"
Cohesion: 0.09
Nodes (38): APP_TO_DB_FIELD, batchedInsert(), camelToSnake(), DB_TO_APP_FIELD, DEFAULTS, dismissAllNotifications(), fetchAllFromTable(), getAttendanceCorrectionById() (+30 more)

### Community 8 - "IT Help Desk"
Cohesion: 0.08
Nodes (27): ITIssueThread(), addITIssueComment(), createITIssue(), getITStaffById(), reopenITIssue(), updateITIssue(), withdrawITIssue(), handleViewReply() (+19 more)

### Community 9 - "App Shell & Routing"
Cohesion: 0.09
Nodes (19): App(), Home(), Protected(), Layout(), ThemeProvider(), CinematicThemeSwitcher(), useAuth(), getTeamUnreadCount() (+11 more)

### Community 10 - "Auth Context & Team Data"
Cohesion: 0.10
Nodes (32): handleLogout(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), getMyTeamDirectory(), managerDecideLeave() (+24 more)

### Community 11 - "Task & Cab Store Operations"
Cohesion: 0.09
Nodes (31): approveTaskClosure(), assignITIssue(), createCabRequest(), createTicket(), deleteCabRequest(), deleteTask(), deleteTaskByAssignee(), getCabRequests() (+23 more)

### Community 12 - "My Cab & Driver View"
Cohesion: 0.14
Nodes (26): getCabRequestsForEmployee(), StopCard(), MyCab(), closeMenu(), confirmWithdraw(), handleClickOutside(), handleEditRequest(), handleOpenRequest() (+18 more)

### Community 13 - "Notifications & Team Chat"
Cohesion: 0.12
Nodes (23): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onTeamMessage(), refresh(), TeamChat() (+15 more)

### Community 14 - "Employee Data Queries"
Cohesion: 0.18
Nodes (27): getAnnouncementsForEmployee(), getAttendanceCorrections(), getAttendanceCorrectionsForEmployee(), getDismissedNotificationIds(), getITIssues(), getITIssuesForEmployee(), getOvertimeRequestsForEmployee(), getProfileForEmployee() (+19 more)

### Community 15 - "Dashboard Charts"
Cohesion: 0.12
Nodes (22): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusChart() (+14 more)

### Community 16 - "React Ref Utilities"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "Cab Management Core"
Cohesion: 0.13
Nodes (17): addVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), handleClickOutside(), TodayTab(), closeMenu(), handleClickOutside() (+9 more)

### Community 18 - "Cab Management Trips"
Cohesion: 0.18
Nodes (13): TimeInput(), addCabMessage(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), getCabUnreadByEmployee(), markCabThreadRead(), EMPTY_TRIP_FORM (+5 more)

### Community 19 - "Supabase Client & Config"
Cohesion: 0.18
Nodes (18): approveShiftChange(), getShiftChangeRequests(), getShiftChangeRequestsForEmployee(), rejectShiftChange(), requestShiftChange(), updateShiftChangeRequest(), withdrawShiftChangeRequest(), AdminShifts() (+10 more)

### Community 20 - "Shift Management"
Cohesion: 0.19
Nodes (15): addShift(), deleteShift(), getEmployeeShiftStartTime(), getShiftById(), getShiftForEmployee(), getShifts(), updateShift(), closeMenu() (+7 more)

### Community 21 - "Task Utilities"
Cohesion: 0.18
Nodes (17): ASSIGNED_DURING_FILTER_OPTS, statusCell(), inAssignedDuring(), TASK_PRIORITY_FILTER_OPTS, TASK_STATUS_FILTER_OPTS, statusCell(), canEmployeeAskQuestion(), canEmployeeDeleteTask() (+9 more)

### Community 22 - "Package Dev Config"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+9 more)

### Community 23 - "Package Dependencies"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, html2pdf.js, jszip, lucide-react, dependencies, clsx, framer-motion (+9 more)

### Community 24 - "Sample Data Definitions"
Cohesion: 0.15
Nodes (13): TaskForm(), ANNOUNCEMENT_TYPES, DEFAULT_SETTINGS, DEFAULT_SHIFTS, IT_ISSUE_CATEGORIES, IT_ISSUE_PRIORITIES, IT_ISSUE_STATUSES, SHIFT_CHANGE_STATUSES (+5 more)

### Community 25 - "Cab Management Routes"
Cohesion: 0.19
Nodes (13): addDriver(), clearCabChatAdmin(), deleteDriver(), getDrivers(), setDriverPin(), updateDriver(), bump(), DriversTab() (+5 more)

### Community 26 - "Employee Tasks Page"
Cohesion: 0.16
Nodes (12): addTaskMessage(), EmployeeTasks(), assignerLabel(), bump(), closeMenu(), confirmDelete(), handleClickOutside(), handleCreate() (+4 more)

### Community 27 - "Team Tasks Page"
Cohesion: 0.15
Nodes (11): TeamTasksPanel(), bump(), closeMenu(), confirmDelete(), handleApproveClosure(), handleClickOutside(), move(), nameOf() (+3 more)

### Community 28 - "Admin Tasks Page"
Cohesion: 0.17
Nodes (12): addTask(), addTaskMessageByAdmin(), updateTaskByAdmin(), AdminTasks(), bump(), closeMenu(), handleCreate(), handleEdit() (+4 more)

### Community 29 - "Component Aliases"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "Task Utility Helpers"
Cohesion: 0.30
Nodes (12): TaskBoard(), TASK_STATUSES, EMPLOYEE_ASSIGNED_STATUSES, EMPLOYEE_SELF_STATUSES, groupByStatus(), isOverdue(), isTaskComplete(), MANAGER_ASSIGNED_STATUSES (+4 more)

### Community 31 - "Store Write Operations"
Cohesion: 0.16
Nodes (13): getCabAssignmentForEmployee(), getCabAssignments(), getCabCancellationForEmployee(), getCabCancellations(), getCabCancellationsForDate(), getDriverRunSheet(), buildStops(), personInfo() (+5 more)

### Community 32 - "Cab Management Schedule"
Cohesion: 0.24
Nodes (9): addTrip(), deleteTrip(), getTrips(), updateTrip(), TripsTab(), confirmDelete(), normalize(), submitAdd() (+1 more)

### Community 33 - "Store Field Mapping"
Cohesion: 0.15
Nodes (13): clearCabChat(), createAnnouncement(), deleteAnnouncement(), getAnnouncements(), getCabClearedAt(), getITStaff(), getReadAnnouncements(), markAnnouncementAsRead() (+5 more)

### Community 34 - "Build & Dev Scripts"
Cohesion: 0.20
Nodes (9): description, name, private, scripts, build, dev, preview, type (+1 more)

### Community 35 - "Cab Management Drivers"
Cohesion: 0.31
Nodes (10): getEmployees(), getMyTeammates(), getTeamMembers(), setCabRequestStatus(), CabManagement(), nameOf(), RequestsTab(), decide() (+2 more)

### Community 36 - "Reimbursement Thread"
Cohesion: 0.28
Nodes (3): ReimbursementThread(), TaskThread(), formatDate()

### Community 37 - "Employee Dashboard"
Cohesion: 0.25
Nodes (8): submitAttendanceCorrection(), updateAttendanceCorrection(), withdrawAttendanceCorrection(), confirmCorrectionWithdraw(), handleCorrectionEdit(), handleCorrectionReply(), handleCorrectionSubmit(), refreshCorrections()

### Community 38 - "Store Leave Operations"
Cohesion: 0.40
Nodes (5): assignEmployeeShift(), getShiftHistory(), getShiftHistoryForEmployee(), AssignmentsTab(), confirmChange()

### Community 39 - "Modal & Overlay Components"
Cohesion: 0.67
Nodes (3): getFocusableElements(), focusables(), onKeyDown()

## Knowledge Gaps
- **135 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTableControls()` connect `Shared UI Components` to `Leave Management Module`, `Salary, Overtime & Attendance`, `Attendance Correction`, `Admin Profiles & Documents`, `Reimbursement Module`, `Ticket Management`, `IT Help Desk`, `App Shell & Routing`, `Auth Context & Team Data`, `My Cab & Driver View`, `Cab Management Core`, `Cab Management Trips`, `Supabase Client & Config`, `Shift Management`, `Task Utilities`, `Sample Data Definitions`, `Cab Management Routes`, `Employee Tasks Page`, `Team Tasks Page`, `Admin Tasks Page`, `Store Write Operations`, `Cab Management Schedule`, `Store Leave Operations`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `formatDate()` connect `Reimbursement Thread` to `Leave Management Module`, `Attendance Correction`, `Admin Profiles & Documents`, `Shared UI Components`, `Reimbursement Module`, `Ticket Management`, `IT Help Desk`, `App Shell & Routing`, `Auth Context & Team Data`, `My Cab & Driver View`, `Cab Management Trips`, `Supabase Client & Config`, `Task Utilities`, `Sample Data Definitions`, `Employee Tasks Page`, `Team Tasks Page`, `Admin Tasks Page`, `Task Utility Helpers`, `Cab Management Drivers`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `usePagination()` connect `Shared UI Components` to `Leave Management Module`, `Salary, Overtime & Attendance`, `Attendance Correction`, `Admin Profiles & Documents`, `Reimbursement Module`, `Ticket Management`, `IT Help Desk`, `App Shell & Routing`, `Auth Context & Team Data`, `My Cab & Driver View`, `Cab Management Core`, `Cab Management Trips`, `Supabase Client & Config`, `Shift Management`, `Task Utilities`, `Sample Data Definitions`, `Cab Management Routes`, `Employee Tasks Page`, `Team Tasks Page`, `Admin Tasks Page`, `Store Write Operations`, `Cab Management Schedule`, `Cab Management Drivers`, `Store Leave Operations`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Leave Management Module` be split into smaller, more focused modules?**
  _Cohesion score 0.06751054852320675 - nodes in this community are weakly interconnected._
- **Should `Salary, Overtime & Attendance` be split into smaller, more focused modules?**
  _Cohesion score 0.05860805860805861 - nodes in this community are weakly interconnected._