import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfileForEmployee, getSettings, getUnreadAnnouncementCount, getTeamUnreadCount } from '../data/store.js'
import { profilePhotoUrl } from '../utils/profile.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import NotificationBell from './NotificationBell.jsx'
import AnimatedThemeToggle from './ui/animated-theme-toggle.tsx'
import { OriginButton } from './ui/origin-button.tsx'
import { useState, useEffect } from 'react'
import { Banknote, Briefcase, CalendarDays, CarFront, CircleUser, Clock, Contact, LayoutDashboard, ListTodo, LogOut, Megaphone, MessageSquareText, PanelLeftClose, PanelLeftOpen, ReceiptText, Settings, Shuffle, Users, Wrench, X, Timer } from 'lucide-react'

// Sidebar collapse-to-rail is a display preference, not app data → localStorage.
// Guarded because the app already tolerates storage being unavailable.
const NAV_COLLAPSE_KEY = 'workbuddy_nav_collapsed'

function readNavCollapsed() {
  try {
    return localStorage.getItem(NAV_COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

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
  const [navCollapsed, setNavCollapsed] = useState(readNavCollapsed)

  const toggleNav = () => {
    setNavCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(NAV_COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        // Preference just won't persist; the toggle still works for this session.
      }
      return next
    })
  }

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

  // The visible text is the button's accessible name (it clips away in the rail
  // but stays in the DOM), so a title is only needed when there's no room.
  const navToggleLabel = navCollapsed ? 'Expand menu' : 'Hide menu'

  const employeeNav = [
    { to: '/me', label: 'My Attendance', icon: Clock },
    { to: '/my-profile', label: 'My Details', icon: CircleUser },
    { to: '/my-shifts', label: 'My Shifts', icon: Shuffle },
    { to: '/my-leaves', label: 'My Leaves', icon: CalendarDays },
    { to: '/my-salary', label: 'My Salary', icon: Banknote },
    { to: '/my-reimbursements', label: 'My Reimbursements', icon: ReceiptText },
    { to: '/my-overtime', label: 'My Overtime', icon: Timer },
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
    { to: '/shift-management', label: 'Shift Management', icon: Shuffle },
    { to: '/overtime', label: 'Overtime', icon: Timer },
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
          <div className="theme-toggle-wrap">
            <AnimatedThemeToggle />
          </div>
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
        <nav
          id="app-nav"
          className={'sidebar' + (navCollapsed ? ' sidebar--collapsed' : '')}
          aria-label="Main navigation"
        >
          {/* The list scrolls; the collapse control beneath it stays put so it
              is reachable even when every module is on screen. */}
          <div className="sidebar-nav">
            {navItems.map(({ to, label, icon: Icon, badge }) => {
              const count = badge && label === 'My Team' ? teamUnreadCount : unreadCount
              return (
                <NavLink
                  key={to}
                  to={to}
                  className="nav-item"
                  title={navCollapsed ? label : undefined}
                >
                  <Icon className="nav-icon" size={17} aria-hidden="true" />
                  <span className="nav-label">{label}</span>
                  {badge && count > 0 && (
                    <span className="notification-badge">{count}</span>
                  )}
                </NavLink>
              )
            })}
          </div>
          <div className="sidebar-foot">
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={toggleNav}
              aria-controls="app-nav"
              aria-expanded={!navCollapsed}
              title={navCollapsed ? navToggleLabel : undefined}
            >
              {navCollapsed
                ? <PanelLeftOpen className="nav-icon" size={17} strokeWidth={2} aria-hidden="true" />
                : <PanelLeftClose className="nav-icon" size={17} strokeWidth={2} aria-hidden="true" />}
              <span className="nav-label">{navToggleLabel}</span>
            </button>
          </div>
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
