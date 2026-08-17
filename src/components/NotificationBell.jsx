import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import {
  dismissAllNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import { getNotificationFeed } from '../utils/notifications.js'
import Modal from './Modal.jsx'

// Top-bar notification bell for employees and HR/Admin.
export default function NotificationBell({ employeeId, viewerRole = 'employee' }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [tick, setTick] = useState(0)

  const feed = useMemo(
    () => getNotificationFeed(employeeId, viewerRole),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeeId, viewerRole, tick, open]
  )

  function refresh() {
    setTick((n) => n + 1)
  }

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return
      if (!e.target.closest('.notif-bell')) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function handleOpenToggle() {
    setOpen((v) => !v)
    refresh()
  }

  function handleClickItem(n) {
    markNotificationRead(employeeId, n.id)
    refresh()
    setOpen(false)
    if (n.href) navigate(n.href)
  }

  function handleMarkAll() {
    markAllNotificationsRead(employeeId, feed.all.map((n) => n.id))
    refresh()
  }

  function handleClearAll() {
    dismissAllNotifications(employeeId, feed.all.map((n) => n.id))
    setConfirmClear(false)
    refresh()
  }

  const badge = feed.unreadCount > 99 ? '99+' : String(feed.unreadCount)

  return (
    <div className="notif-bell">
      <button
        type="button"
        className="notif-bell-btn"
        aria-label={feed.unreadCount ? `${feed.unreadCount} notifications` : 'Notifications'}
        aria-expanded={open}
        onClick={handleOpenToggle}
      >
        <Bell size={18} strokeWidth={2} />
        {feed.unreadCount > 0 && (
          <span className="notif-bell-badge">{badge}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="menu">
          <div className="notif-panel-head">
            <strong>Notifications</strong>
            <div className="notif-panel-actions">
              {feed.unreadCount > 0 && (
                <button type="button" className="btn btn-tiny btn-light" onClick={handleMarkAll}>
                  Mark all read
                </button>
              )}
              {feed.all.length > 0 && (
                <button type="button" className="btn btn-tiny btn-light" onClick={() => setConfirmClear(true)}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {feed.all.length === 0 ? (
            <p className="muted notif-empty">No notifications yet.</p>
          ) : (
            <ul className="notif-list">
              {feed.all.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`notif-item ${n.unread ? 'notif-item-unread' : ''}`}
                    onClick={() => handleClickItem(n)}
                  >
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-body">{n.body}</div>
                    {n.on && (
                      <div className="notif-item-meta muted small">{formatDate(n.on)}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {confirmClear && (
        <Modal onClose={() => setConfirmClear(false)} title="Clear notifications">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Clear all notifications</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setConfirmClear(false)}>✕</button>
            </div>
            <p className="hint first">Are you sure you want to clear your notification list? New activity will still show up again.</p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={handleClearAll}>
                Clear all
              </button>
              <button type="button" className="btn btn-light" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
