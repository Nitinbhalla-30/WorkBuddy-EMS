import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import EmployeeLeaves from './pages/EmployeeLeaves.jsx'
import EmployeeSalary from './pages/EmployeeSalary.jsx'
import EmployeeTasks from './pages/EmployeeTasks.jsx'
import TeamTasks from './pages/TeamTasks.jsx'
import EmployeeProfile from './pages/EmployeeProfile.jsx'
import EmployeeTickets from './pages/EmployeeTickets.jsx'
import MyCab from './pages/MyCab.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLeaves from './pages/AdminLeaves.jsx'
import AdminSalary from './pages/AdminSalary.jsx'
import AdminTasks from './pages/AdminTasks.jsx'
import AdminProfiles from './pages/AdminProfiles.jsx'
import AdminTickets from './pages/AdminTickets.jsx'
import CabManagement from './pages/CabManagement.jsx'
import AttendanceRecords from './pages/AttendanceRecords.jsx'
import Settings from './pages/Settings.jsx'

// Only let logged-in users through. Admin-only pages also check the role.
function Protected({ children, adminOnly }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Send the logged-in user to the right home page for their role.
function Home() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/me" replace />
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
        <Route path="/my-tasks" element={<EmployeeTasks />} />
        <Route path="/team-tasks" element={<TeamTasks />} />
        <Route path="/my-profile" element={<EmployeeProfile />} />
        <Route path="/help" element={<EmployeeTickets />} />
        <Route path="/my-cab" element={<MyCab />} />
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
