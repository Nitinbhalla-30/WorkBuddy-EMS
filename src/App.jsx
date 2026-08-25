import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import EmployeeLeaves from './pages/EmployeeLeaves.jsx'
import EmployeeSalary from './pages/EmployeeSalary.jsx'
import EmployeeTasks from './pages/EmployeeTasks.jsx'
import EmployeeProfile from './pages/EmployeeProfile.jsx'
import EmployeeTickets from './pages/EmployeeTickets.jsx'
import EmployeeITHelpDesk from './pages/EmployeeITHelpDesk.jsx'
import EmployeeAnnouncements from './pages/EmployeeAnnouncements.jsx'
import MyCab from './pages/MyCab.jsx'
import MyTeam from './pages/MyTeam.jsx'
import EmployeeReimbursements from './pages/EmployeeReimbursements.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLeaves from './pages/AdminLeaves.jsx'
import AdminReimbursements from './pages/AdminReimbursements.jsx'
import AdminSalary from './pages/AdminSalary.jsx'
import AdminTasks from './pages/AdminTasks.jsx'
import AdminProfiles from './pages/AdminProfiles.jsx'
import AdminTickets from './pages/AdminTickets.jsx'
import AdminITHelpDesk from './pages/AdminITHelpDesk.jsx'
import AdminAnnouncements from './pages/AdminAnnouncements.jsx'
import AdminShifts from './pages/AdminShifts.jsx'
import EmployeeShifts from './pages/EmployeeShifts.jsx'
import AdminOvertime from './pages/AdminOvertime.jsx'
import EmployeeOvertime from './pages/EmployeeOvertime.jsx'
import CabManagement from './pages/CabManagement.jsx'
import AttendanceRecords from './pages/AttendanceRecords.jsx'
import Settings from './pages/Settings.jsx'
import DriverView from './pages/DriverView.jsx'

// Only let logged-in users through. Admin-only pages also check the role.
// noIT blocks everyone in the IT Support department (they get no announcements).
function Protected({ children, adminOnly, noIT }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  if (noIT && user.department === 'IT Support') {
    return <Navigate to="/it-help-desk" replace />
  }
  return children
}

// Send the logged-in user to the right home page for their role.
function Home() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') {
    // IT staff land on the IT Help Desk, HR/Admin on the dashboard.
    if (user.department === 'IT Support') return <Navigate to="/it-help-desk" replace />
    return <Navigate to="/admin" replace />
  }
  if (user.role === 'driver') return <Navigate to={`/driver/${user.id}`} replace />
  return <Navigate to="/me" replace />
}

export default function App() {
  const { ready } = useAuth()
  if (!ready) return null

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/me" element={<EmployeeDashboard />} />
        <Route path="/my-leaves" element={<EmployeeLeaves />} />
        <Route path="/my-salary" element={<EmployeeSalary />} />
        <Route path="/my-reimbursements" element={<EmployeeReimbursements />} />
        <Route path="/my-tasks" element={<EmployeeTasks />} />
        <Route path="/my-team" element={<MyTeam />} />
        <Route path="/my-profile" element={<EmployeeProfile />} />
        <Route path="/help" element={<EmployeeTickets />} />
        <Route path="/it-help" element={<EmployeeITHelpDesk />} />
        <Route
          path="/announcements"
          element={
            <Protected noIT>
              <EmployeeAnnouncements />
            </Protected>
          }
        />
        <Route path="/my-cab" element={<MyCab />} />
        <Route path="/my-shifts" element={<EmployeeShifts />} />
        <Route path="/my-overtime" element={<EmployeeOvertime />} />
        <Route
          path="/admin"
          element={
            <Protected adminOnly>
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/leave-requests"
          element={
            <Protected adminOnly>
              <AdminLeaves />
            </Protected>
          }
        />
        <Route
          path="/reimbursements"
          element={
            <Protected adminOnly>
              <AdminReimbursements />
            </Protected>
          }
        />
        <Route
          path="/salary"
          element={
            <Protected adminOnly>
              <AdminSalary />
            </Protected>
          }
        />
        <Route
          path="/tasks"
          element={
            <Protected adminOnly>
              <AdminTasks />
            </Protected>
          }
        />
        <Route
          path="/records-profiles"
          element={
            <Protected adminOnly>
              <AdminProfiles />
            </Protected>
          }
        />
        <Route
          path="/queries"
          element={
            <Protected adminOnly>
              <AdminTickets />
            </Protected>
          }
        />
        <Route
          path="/it-help-desk"
          element={
            <Protected adminOnly>
              <AdminITHelpDesk />
            </Protected>
          }
        />
        <Route
          path="/company-announcements"
          element={
            <Protected adminOnly noIT>
              <AdminAnnouncements />
            </Protected>
          }
        />
        <Route
          path="/shift-management"
          element={
            <Protected adminOnly>
              <AdminShifts />
            </Protected>
          }
        />
        <Route
          path="/overtime"
          element={
            <Protected adminOnly>
              <AdminOvertime />
            </Protected>
          }
        />
        <Route
          path="/cab-management"
          element={
            <Protected adminOnly>
              <CabManagement />
            </Protected>
          }
        />
        <Route
          path="/employees"
          element={
            <Protected adminOnly>
              <AdminProfiles />
            </Protected>
          }
        />
        <Route
          path="/records"
          element={
            <Protected adminOnly>
              <AttendanceRecords />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected adminOnly>
              <Settings />
            </Protected>
          }
        />
      </Route>

      {/* Driver run-sheet — requires login, only accessible to the driver themselves */}
      <Route
        path="/driver/:driverId"
        element={
          <Protected>
            <DriverView />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
