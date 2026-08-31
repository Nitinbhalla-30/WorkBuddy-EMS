# Graph Report - WorkBuddy EMS  (2026-08-31)

## Corpus Check
- 108 files · ~96,074 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1224 nodes · 3911 edges · 61 communities (50 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b499240e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- leaves.js
- AdminSalary.jsx
- attendance.js
- profile.js
- App.jsx
- EmployeeReimbursements
- EmployeeTickets
- store.js
- EmployeeITHelpDesk.jsx
- AdminAnnouncements
- getEmployeeById
- getTasks
- MyCab.jsx
- TeamChat.jsx
- notifications.js
- TaskStatusChart.tsx
- compilerOptions
- TripsTab
- MessagesTab
- getShiftChangeRequests
- ShiftsTab
- EmployeeTasks
- devDependencies
- dependencies
- Design System: WorkBuddy EMS
- DriversTab
- ensureAttendanceMonths
- TeamTasksPanel
- AdminTasks
- components.json
- tasks.js
- CabManagement.jsx
- todayKey
- read
- package.json
- write
- NotificationBell
- EmployeeRecords
- getEmployees
- Product
- leaflet
- next-themes
- check-leaves.mjs
- origin-button.tsx
- tailwind-merge
- ProfileWizard
- vite.config.js
- perf-probe.mjs
- scripts
- ChatSection
- MapPicker.jsx
- WorkBuddy EMS — Agent Instructions
- framer-motion
- @supabase/supabase-js
- supabase-setup.sql
- public.reimbursements

## God Nodes (most connected - your core abstractions)
1. `write()` - 90 edges
2. `formatDate()` - 65 edges
3. `useTableControls()` - 64 edges
4. `usePagination()` - 63 edges
5. `getEmployeeById()` - 59 edges
6. `useAuth()` - 55 edges
7. `EmployeeDashboard()` - 52 edges
8. `read()` - 39 edges
9. `MyCab()` - 39 edges
10. `AttendanceRecords()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `validateForSubmit()`  [EXTRACTED]
  src/components/ProfileWizard.jsx → src/utils/profile.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminLeaves.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminReimbursements.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/AdminTasks.jsx → src/data/store.js
- `nameOf()` --calls--> `getEmployeeById()`  [EXTRACTED]
  src/pages/EmployeeLeaves.jsx → src/data/store.js

## Import Cycles
- None detected.

## Communities (61 total, 11 thin omitted)

### Community 0 - "leaves.js"
Cohesion: 0.06
Nodes (55): LeaveForm(), changeType(), addLeaveMessage(), applyLeave(), getLeavesForEmployee(), setLeaveStatus(), updateLeave(), withdrawLeave() (+47 more)

### Community 1 - "AdminSalary.jsx"
Cohesion: 0.06
Nodes (53): Payslip(), approveOvertime(), getApprovedOvertimeForMonth(), getEmployeeShiftStartTime(), getLeaveById(), getLeaves(), getOvertimeRequests(), getOvertimeRequestsByMonth() (+45 more)

### Community 2 - "attendance.js"
Cohesion: 0.05
Nodes (85): AttendanceCorrectionForm(), AttendanceCorrectionThread(), ATTENDANCE_CORRECTION_ISSUES, addAttendanceCorrectionMessage(), applyCorrectionToAttendance(), attendanceMonthsLoaded(), ensureAttendanceForDate(), findOrCreateAttendanceRecord() (+77 more)

### Community 3 - "profile.js"
Cohesion: 0.15
Nodes (18): FileField(), handlePick(), todayStr(), LeaveDocumentList(), PhotoField(), handlePick(), todayStr(), ProfileView() (+10 more)

### Community 4 - "App.jsx"
Cohesion: 0.06
Nodes (83): App(), Home(), Protected(), Avatar(), LeaveThread(), getFocusableElements(), Modal(), focusables() (+75 more)

### Community 5 - "EmployeeReimbursements"
Cohesion: 0.07
Nodes (38): ReimbursementClaimDetail(), ReimbursementThread(), REIMBURSEMENT_STATUSES, addReimbursementMessage(), approveReimbursementClaim(), getReimbursements(), markReimbursementPaid(), rejectReimbursementClaim() (+30 more)

### Community 6 - "EmployeeTickets"
Cohesion: 0.07
Nodes (30): TicketForm(), TICKET_CATEGORIES, addTicketMessage(), createTicket(), getTicketsForHR(), setTicketStatus(), updateTicket(), withdrawTicket() (+22 more)

### Community 7 - "store.js"
Cohesion: 0.07
Nodes (33): DEFAULT_SETTINGS, DEFAULT_SHIFTS, APP_STORE_KEYS, APP_TO_DB_FIELD, ATTENDANCE_WINDOW_MONTHS, attendanceLoadedMonths, camelToSnake(), CRITICAL_KEYS (+25 more)

### Community 8 - "EmployeeITHelpDesk.jsx"
Cohesion: 0.06
Nodes (34): DropdownSelect(), ITIssueThread(), addITIssueComment(), assignITIssue(), createITIssue(), getITStaff(), getITStaffById(), reopenITIssue() (+26 more)

### Community 9 - "AdminAnnouncements"
Cohesion: 0.17
Nodes (7): createAnnouncement(), deleteAnnouncement(), AdminAnnouncements(), closeMenu(), confirmDelete(), handleClickOutside(), handleSubmit()

### Community 10 - "getEmployeeById"
Cohesion: 0.09
Nodes (33): handleLogout(), ThemeProvider(), AuthProvider(), login(), logout(), getDriverById(), getEmployeeById(), getMyTeamDirectory() (+25 more)

### Community 11 - "getTasks"
Cohesion: 0.27
Nodes (13): approveTaskClosure(), deleteTaskByAssignee(), getTaskById(), getTasks(), isSelfAssignedTask(), updateTaskByAssignee(), updateTaskStatus(), updateTaskStatusByEmployee() (+5 more)

### Community 12 - "MyCab.jsx"
Cohesion: 0.12
Nodes (31): getCabAssignmentForEmployee(), getCabCancellationForEmployee(), getCabCancellations(), getCabClearedAt(), setCabCancellation(), StopCard(), MyCab(), closeMenu() (+23 more)

### Community 13 - "TeamChat.jsx"
Cohesion: 0.27
Nodes (11): TeamChat(), handleClearChat(), handleKeyDown(), handlePickFiles(), loadMessages(), send(), addTeamMessage(), clearTeamConversation() (+3 more)

### Community 14 - "notifications.js"
Cohesion: 0.22
Nodes (23): getAnnouncementsForEmployee(), getITIssues(), getITIssuesForEmployee(), getOvertimeRequestsForEmployee(), getProfiles(), getReimbursementsForEmployee(), getShiftById(), getTasksForAssignee() (+15 more)

### Community 15 - "TaskStatusChart.tsx"
Cohesion: 0.17
Nodes (15): AttendanceChartKey, AttendanceTodayChart(), AttendanceTodayChartProps, CHART_BUCKETS, STATUS_COLORS, STATUS_COLORS, TaskForChart, TaskStatusChart() (+7 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, allowJs, baseUrl (+16 more)

### Community 17 - "TripsTab"
Cohesion: 0.10
Nodes (22): deleteTrip(), deleteVehicle(), updateVehicle(), bump(), handleClickOutside(), TodayTab(), closeMenu(), handleClickOutside() (+14 more)

### Community 18 - "MessagesTab"
Cohesion: 0.26
Nodes (11): addCabMessage(), clearCabChatAdmin(), getCabClearedAtAdmin(), getCabMessages(), getCabMessagesForEmployee(), markCabThreadRead(), MessagesTab(), chooseEmployee() (+3 more)

### Community 19 - "getShiftChangeRequests"
Cohesion: 0.21
Nodes (16): approveShiftChange(), getShiftChangeRequests(), getShiftChangeRequestsForEmployee(), rejectShiftChange(), requestShiftChange(), updateShiftChangeRequest(), withdrawShiftChangeRequest(), RequestsTab() (+8 more)

### Community 20 - "ShiftsTab"
Cohesion: 0.24
Nodes (12): addShift(), deleteShift(), getShifts(), updateShift(), closeMenu(), handleClickOutside(), ShiftsTab(), handleAdd() (+4 more)

### Community 21 - "EmployeeTasks"
Cohesion: 0.13
Nodes (18): EmployeeTasks(), assignerLabel(), closeMenu(), handleClickOutside(), nameOf(), statusCell(), inAssignedDuring(), statusCell() (+10 more)

### Community 22 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+11 more)

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, html2pdf.js, jszip, lucide-react, dependencies, clsx, html2pdf.js, jszip (+9 more)

### Community 24 - "Design System: WorkBuddy EMS"
Cohesion: 0.08
Nodes (25): Buttons, Cards / Containers, Chips / Tags, Colors, Components, Design System: WorkBuddy EMS, Do:, Do's and Don'ts (+17 more)

### Community 25 - "DriversTab"
Cohesion: 0.22
Nodes (9): addDriver(), deleteDriver(), setDriverPin(), updateDriver(), DriversTab(), confirmDelete(), savePin(), submitAdd() (+1 more)

### Community 26 - "ensureAttendanceMonths"
Cohesion: 0.19
Nodes (22): applyAppStoreRows(), applyAttendanceWindow(), attendanceWindowMonths(), ensureAttendanceMonths(), ensureAttendanceRange(), fetchAllFromTable(), fetchAttendanceWindow(), initStore() (+14 more)

### Community 27 - "TeamTasksPanel"
Cohesion: 0.13
Nodes (14): addTaskMessage(), deleteTask(), getTeamMembers(), confirmDelete(), handleTaskReply(), TeamTasksPanel(), bump(), closeMenu() (+6 more)

### Community 28 - "AdminTasks"
Cohesion: 0.15
Nodes (14): addTask(), addTaskMessageByAdmin(), updateTaskByAdmin(), AdminTasks(), bump(), closeMenu(), handleCreate(), handleEdit() (+6 more)

### Community 29 - "components.json"
Cohesion: 0.14
Nodes (13): aliases, components, ui, utils, rsc, $schema, style, tailwind (+5 more)

### Community 30 - "tasks.js"
Cohesion: 0.27
Nodes (13): TaskBoard(), canManagerApproveDone(), EMPLOYEE_ASSIGNED_STATUSES, EMPLOYEE_SELF_STATUSES, groupByStatus(), isManagerAssignedDone(), isOverdue(), isTaskComplete() (+5 more)

### Community 31 - "CabManagement.jsx"
Cohesion: 0.14
Nodes (19): TimeInput(), addTrip(), addVehicle(), getCabAssignments(), getCabCancellationsForDate(), getCabUnreadByEmployee(), getDriverRunSheet(), buildStops() (+11 more)

### Community 32 - "todayKey"
Cohesion: 0.19
Nodes (19): getProfileForEmployee(), requestProfileUpdate(), reviewProfile(), saveProfileDraft(), submitProfile(), todayKey(), upsertProfile(), profileOf() (+11 more)

### Community 33 - "read"
Cohesion: 0.27
Nodes (10): Layout(), getAnnouncements(), getReadAnnouncements(), getTeamConversations(), getTeamUnreadCount(), getUnreadAnnouncementCount(), markAnnouncementAsRead(), read() (+2 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 35 - "write"
Cohesion: 0.23
Nodes (13): clearCabChat(), createCabRequest(), deleteCabRequest(), getCabRequests(), getCabRequestsForEmployee(), setCabRequestStatus(), updateCabRequest(), write() (+5 more)

### Community 36 - "NotificationBell"
Cohesion: 0.18
Nodes (17): NotificationBell(), handleClearAll(), handleClickItem(), handleMarkAll(), handleOpenToggle(), onTeamMessage(), refresh(), dismissAllNotifications() (+9 more)

### Community 37 - "EmployeeRecords"
Cohesion: 0.20
Nodes (11): reviewProfileUpdateRequest(), updateEmployeeTeam(), EmployeeRecords(), approveUpdateRequest(), closeEdit(), closeMenu(), denyUpdateRequest(), handleClickOutside() (+3 more)

### Community 38 - "getEmployees"
Cohesion: 0.47
Nodes (5): assignEmployeeShift(), getEmployees(), AssignmentsTab(), confirmChange(), nameOf()

### Community 39 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 42 - "check-leaves.mjs"
Cohesion: 0.25
Nodes (6): __dirname, envContent, envVars, __filename, LEAVE_TYPES, supabase

### Community 43 - "origin-button.tsx"
Cohesion: 0.36
Nodes (7): assignRef(), ButtonHTMLAttributesForMotion, FILL_EASE, getCoverDiameter(), hasTextContent(), OriginButton, OriginButtonProps

### Community 50 - "perf-probe.mjs"
Cohesion: 0.33
Nodes (4): a, keys, t0, TABLES

### Community 51 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, deploy, dev, preview

### Community 52 - "ChatSection"
Cohesion: 0.50
Nodes (3): ChatSection(), handleKeyDown(), send()

## Knowledge Gaps
- **185 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+180 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `usePagination()` connect `App.jsx` to `leaves.js`, `AdminSalary.jsx`, `attendance.js`, `EmployeeReimbursements`, `EmployeeTickets`, `EmployeeITHelpDesk.jsx`, `AdminAnnouncements`, `getEmployeeById`, `MyCab.jsx`, `TripsTab`, `getShiftChangeRequests`, `ShiftsTab`, `EmployeeTasks`, `DriversTab`, `TeamTasksPanel`, `AdminTasks`, `CabManagement.jsx`, `write`, `EmployeeRecords`, `getEmployees`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `formatDate()` connect `App.jsx` to `leaves.js`, `todayKey`, `attendance.js`, `profile.js`, `write`, `EmployeeReimbursements`, `EmployeeRecords`, `EmployeeTickets`, `EmployeeITHelpDesk.jsx`, `AdminAnnouncements`, `getEmployeeById`, `MyCab.jsx`, `getShiftChangeRequests`, `EmployeeTasks`, `TeamTasksPanel`, `AdminTasks`, `tasks.js`, `CabManagement.jsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `useTableControls()` connect `App.jsx` to `leaves.js`, `AdminSalary.jsx`, `attendance.js`, `EmployeeReimbursements`, `EmployeeTickets`, `EmployeeITHelpDesk.jsx`, `AdminAnnouncements`, `getEmployeeById`, `MyCab.jsx`, `TripsTab`, `getShiftChangeRequests`, `ShiftsTab`, `EmployeeTasks`, `DriversTab`, `TeamTasksPanel`, `AdminTasks`, `CabManagement.jsx`, `EmployeeRecords`, `getEmployees`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useTableControls()` (e.g. with `setFilter()` and `toggleSort()`) actually correct?**
  _`useTableControls()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _185 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `leaves.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06340326340326341 - nodes in this community are weakly interconnected._
- **Should `AdminSalary.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05745814307458143 - nodes in this community are weakly interconnected._