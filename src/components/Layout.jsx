import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfileForEmployee, getSettings, getUnreadAnnouncementCount } from '../data/store.js'
import { profilePhotoUrl } from '../utils/profile.js'
import Avatar from './Avatar.jsx'
import NotificationBell from './NotificationBell.jsx'
import CinematicThemeSwitcher from './ui/cinematic-theme-switcher.tsx'
import { useState, useEffect } from 'react'

// The shared frame: top bar with the company name, side menu, and content.
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const settings = getSettings()
  const isAdmin = user?.role === 'admin'
  const isIT = user?.department === 'IT Support'
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user && (isIT || !isAdmin)) {
      setUnreadCount(getUnreadAnnouncementCount(user.id))
    } else {
      setUnreadCount(0)
    }
  }, [user, isAdmin, isIT, location])

  // Listen for announcement read events to update badge in real-time
  useEffect(() => {
    const handleAnnouncementRead = () => {
      if (user && (isIT || !isAdmin)) {
        setUnreadCount(getUnreadAnnouncementCount(user.id))
      }
    }

    window.addEventListener('announcementRead', handleAnnouncementRead)
    return () => {
      window.removeEventListener('announcementRead', handleAnnouncementRead)
    }
  }, [user, isAdmin, isIT])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const photoUrl = user ? profilePhotoUrl(getProfileForEmployee(user.id)) : ''

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">WorkBuddy - {settings.companyName}</div>
        <div className="topbar-right">
          <div className="cinematic-theme-switcher-wrap">
            <CinematicThemeSwitcher />
          </div>
          <span className="who">
            <Avatar src={photoUrl} name={user?.name || ''} size={32} />
            <span className="who-text">
              {user?.name} <small>({isAdmin ? (isIT ? 'IT Support' : 'HR / Admin') : 'Employee'})</small>
            </span>
          </span>
          {user?.role === 'employee' && (
            <NotificationBell employeeId={user.id} />
          )}
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
              <NavLink to="/my-reimbursements" className="nav-item">My Reimbursements</NavLink>
              <NavLink to="/my-tasks" className="nav-item">My Tasks</NavLink>
              <NavLink to="/my-team" className="nav-item">My Team</NavLink>
              {user?.isManager && (
                <NavLink to="/team-tasks" className="nav-item">My Team Tasks</NavLink>
              )}
              <NavLink to="/my-cab" className="nav-item">My Cab</NavLink>
              <NavLink to="/it-help" className="nav-item">My IT Issues</NavLink>
              <NavLink to="/help" className="nav-item">My Queries &amp; Grievances</NavLink>
              <NavLink to="/announcements" className="nav-item">
                Announcements
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </NavLink>
            </>
          )}
          {isAdmin && !isIT && (
            <>
              <NavLink to="/admin" className="nav-item">Dashboard</NavLink>
              <NavLink to="/records-profiles" className="nav-item">Employee Records</NavLink>
              <NavLink to="/records" className="nav-item">Attendance Records</NavLink>
              <NavLink to="/leave-requests" className="nav-item">Leave Requests</NavLink>
              <NavLink to="/reimbursements" className="nav-item">Reimbursements</NavLink>
              <NavLink to="/salary" className="nav-item">Salaries</NavLink>
              <NavLink to="/tasks" className="nav-item">Tasks</NavLink>
              <NavLink to="/cab-management" className="nav-item">Cab Management</NavLink>
              <NavLink to="/it-help-desk" className="nav-item">IT Issues</NavLink>
              <NavLink to="/queries" className="nav-item">Queries &amp; Grievances</NavLink>
              <NavLink to="/company-announcements" className="nav-item">
                Announcements
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </NavLink>
              <NavLink to="/settings" className="nav-item">Settings</NavLink>
            </>
          )}
          {isIT && (
            <>
              <NavLink to="/it-help-desk" className="nav-item">IT Issues</NavLink>
              <NavLink to="/company-announcements" className="nav-item">
                Announcements
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </NavLink>
            </>
          )}
        </nav>

        <main className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
