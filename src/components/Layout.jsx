import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfileForEmployee, getSettings, getUnreadAnnouncementCount, getTeamUnreadCount } from '../data/store.js'
import { profilePhotoUrl } from '../utils/profile.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import NotificationBell from './NotificationBell.jsx'
import CinematicThemeSwitcher from './ui/cinematic-theme-switcher.tsx'
import { OriginButton } from './ui/origin-button.tsx'
import { useState, useEffect } from 'react'
import { Banknote, Briefcase, CalendarDays, CarFront, CircleUser, Clock, Contact, LayoutDashboard, ListTodo, LogOut, Megaphone, MessageSquareText, ReceiptText, Settings, Users, Wrench, X } from 'lucide-react'

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
  const [teamUnreadCount, setTeamUnreadCount] = useState(0)
  const [confirmLogout, setConfirmLogout] = useState(false)

  useEffect(() => {
    if (user && showAnnouncements) {
      setUnreadCount(getUnreadAnnouncementCount(user.id))
    } else {
      setUnreadCount(0)
    }
    if (user) {
      const counts = getTeamUnreadCount(user.id)
      const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
      setTeamUnreadCount(total)
    } else {
      setTeamUnreadCount(0)
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

  // Listen for team message events to update badge in real-time
  useEffect(() => {
    const handleTeamMessage = () => {
      if (user) {
        const counts = getTeamUnreadCount(user.id)
        const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
        setTeamUnreadCount(total)
      }
    }

    window.addEventListener('teamMessageSent', handleTeamMessage)
    window.addEventListener('teamMessageReceived', handleTeamMessage)
    return () => {
      window.removeEventListener('teamMessageSent', handleTeamMessage)
      window.removeEventListener('teamMessageReceived', handleTeamMessage)
    }
  }, [user])

  function handleLogout() {
    setConfirmLogout(false)
    logout()
    navigate('/login', { replace: true })
  }

  const photoUrl = user ? profilePhotoUrl(getProfileForEmployee(user.id)) : ''

  const employeeNav = [
    { to: '/my-profile', label: 'My Details', icon: CircleUser },
    { to: '/me', label: 'My Attendance', icon: Clock },
    { to: '/my-leaves', label: 'My Leaves', icon: CalendarDays },
    { to: '/my-salary', label: 'My Salary', icon: Banknote },
    { to: '/my-reimbursements', label: 'My Reimbursements', icon: ReceiptText },
    { to: '/my-tasks', label: 'My Tasks', icon: ListTodo },
    { to: '/my-team', label: 'My Team', icon: Users, badge: true },
    { to: '/my-cab', label: 'My Cab', icon: CarFront },
    { to: '/it-help', label: 'My IT Issues', icon: Wrench },
    { to: '/help', label: 'My Queries & Grievances', icon: MessageSquareText },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, badge: true }
  ]
  const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/records-profiles', label: 'Employee Records', icon: Contact },
    { to: '/records', label: 'Attendance Records', icon: Clock },
    { to: '/leave-requests', label: 'Leave Requests', icon: CalendarDays },
    { to: '/reimbursements', label: 'Reimbursements', icon: ReceiptText },
    { to: '/salary', label: 'Salaries', icon: Banknote },
    { to: '/tasks', label: 'Tasks', icon: ListTodo },
    { to: '/cab-management', label: 'Cab Management', icon: CarFront },
    { to: '/it-help-desk', label: 'IT Issues', icon: Wrench },
    { to: '/queries', label: 'Queries & Grievances', icon: MessageSquareText },
    { to: '/company-announcements', label: 'Announcements', icon: Megaphone, badge: true },
    { to: '/settings', label: 'Settings', icon: Settings }
  ]
  const itNav = [{ to: '/it-help-desk', label: 'IT Issues', icon: Wrench }]
  const navItems = !isAdmin ? employeeNav : isIT ? itNav : adminNav

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Briefcase size={16} strokeWidth={2.25} />
          </span>
          WorkBuddy - {settings.companyName}
        </div>
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
            <LogOut size={16} aria-hidden="true" /> Log out
          </OriginButton>
        </div>
      </header>

      <div className="body">
        <nav className="sidebar">
          {navItems.map(({ to, label, icon: Icon, badge }) => {
            const count = badge && label === 'My Team' ? teamUnreadCount : unreadCount
            return (
              <NavLink key={to} to={to} className="nav-item">
                <Icon className="nav-icon" size={17} aria-hidden="true" />
                <span className="nav-label">{label}</span>
                {badge && count > 0 && (
                  <span className="notification-badge">{count}</span>
                )}
              </NavLink>
            )
          })}
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
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setConfirmLogout(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              You will be signed out and need to log in again to access your account.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={14} aria-hidden="true" /> Log out
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
