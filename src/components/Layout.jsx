import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getSettings } from '../data/store.js'

// The shared frame: top bar with the company name, side menu, and content.
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const settings = getSettings()
  const isAdmin = user?.role === 'admin'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">WorkBuddy - {settings.companyName}</div>
        <div className="topbar-right">
          <span className="who">
            {user?.name} <small>({isAdmin ? 'HR / Admin' : 'Employee'})</small>
          </span>
          <button className="btn btn-light" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="body">
        <nav className="sidebar">
          {!isAdmin && (
            <>
              <NavLink to="/my-profile" className="nav-item">My Details</NavLink>
              <NavLink to="/me" className="nav-item">My Attendance</NavLink>
              <NavLink to="/my-leaves" className="nav-item">My Leaves</NavLink>
              <NavLink to="/my-salary" className="nav-item">My Salary</NavLink>
              <NavLink to="/my-tasks" className="nav-item">My Tasks</NavLink>
              {user?.isManager && (
                <NavLink to="/team-tasks" className="nav-item">My Team Tasks</NavLink>
              )}
              <NavLink to="/help" className="nav-item">My Queries &amp; Grievances</NavLink>
              <NavLink to="/my-cab" className="nav-item">My Cab</NavLink>
            </>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin" className="nav-item">Dashboard</NavLink>
              <NavLink to="/records-profiles" className="nav-item">Employee Records</NavLink>
              <NavLink to="/records" className="nav-item">Attendance Records</NavLink>
              <NavLink to="/leave-requests" className="nav-item">Leave Requests</NavLink>
              <NavLink to="/salary" className="nav-item">Salaries</NavLink>
              <NavLink to="/tasks" className="nav-item">Tasks</NavLink>
              <NavLink to="/queries" className="nav-item">Queries &amp; Grievances</NavLink>
              <NavLink to="/cab-management" className="nav-item">Cab Management</NavLink>
              <NavLink to="/settings" className="nav-item">Settings</NavLink>
            </>
          )}
        </nav>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
