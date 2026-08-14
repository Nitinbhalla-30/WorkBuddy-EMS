import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfileForEmployee, getSettings, getUnreadAnnouncementCount } from '../data/store.js'
import { profilePhotoUrl } from '../utils/profile.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import NotificationBell from './NotificationBell.jsx'
import CinematicThemeSwitcher from './ui/cinematic-theme-switcher.tsx'
import { OriginButton } from './ui/origin-button.tsx'
import { useState, useEffect } from 'react'

// The shared frame: top bar with the company name, side menu, and content.
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const settings = getSettings()
  const isAdmin = user?.role === 'admin'
  const isIT = user?.department === 'IT Support'
  const showAnnouncements = !isAdmin
  const [unreadCount, setUnreadCount] = useState(0)
  const [confirmLogout, setConfirmLogout] = useState(false)

  useEffect(() => {
    if (user && showAnnouncements) {
      setUnreadCount(getUnreadAnnouncementCount(user.id))
    } else {
      setUnreadCount(0)
    }
  }, [user, showAnnouncements, location])

  // Listen for announcement read events to update badge in real-time
  useEffect(() => {
    const handleAnnouncementRead = () => {
      if (user && showAnnouncements) {
        setUnreadCount(getUnreadAnnouncementCount(user.id))
      }
    }

    window.addEventListener('announcementRead', handleAnnouncementRead)
    return () => {
      window.removeEventListener('announcementRead', handleAnnouncementRead)
    }
  }, [user, showAnnouncements])

  function handleLogout() {
    setConfirmLogout(false)
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
              {user?.name}{' '}
              <small>
                {isAdmin ? (isIT ? (user?.isManager ? 'IT Manager' : 'IT Support') : 'HR / Admin') : 'Employee'}
              </small>
            </span>
          </span>
          {user && (user.role === 'employee' || (user.role === 'admin' && !isIT)) && (
            <NotificationBell employeeId={user.id} viewerRole={user.role} />
          )}
          <OriginButton
            className="h-10 rounded-lg px-4 text-[14px] data-[hovered=true]:text-white dark:data-[hovered=true]:text-white"
            fillClassName="bg-[#e81123] dark:bg-[#e81123]"
            onClick={() => setConfirmLogout(true)}
          >
            Log out
          </OriginButton>
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
            </>
          )}
        </nav>

        <main className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
      </div>

      {confirmLogout && (
        <Modal onClose={() => setConfirmLogout(false)} title="Confirm Log out">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Log out</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setConfirmLogout(false)}>✕</button>
            </div>
            <p className="hint first">
              Are you sure you want to log out? You will need to sign in again to access your account.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={handleLogout}>
                Log out
              </button>
              <button type="button" className="btn btn-light" onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
