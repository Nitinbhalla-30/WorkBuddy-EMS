import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAnnouncementsForEmployee,
  isAnnouncementRead,
  markAnnouncementAsRead
} from '../data/store.js'
import { ANNOUNCEMENT_TYPES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'

export default function EmployeeAnnouncements() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [openId, setOpenId] = useState(null)

  const announcements = useMemo(
    () => getAnnouncementsForEmployee(user.id),
    [user.id, refresh]
  )

  const open = announcements.find((a) => a.id === openId) || null

  function handleOpen(announcementId) {
    markAnnouncementAsRead(user.id, announcementId)
    setOpenId(announcementId)
    setRefresh((n) => n + 1)
    window.dispatchEvent(new CustomEvent('announcementRead'))
  }

  function closeModal() {
    setOpenId(null)
  }

  function getTypeLabel(key) {
    const t = ANNOUNCEMENT_TYPES.find((item) => item.key === key)
    return t ? t.label : key
  }

  function getTypeClass(key) {
    switch (key) {
      case 'urgent': return 'tag-high'
      case 'job': return 'tag-medium'
      case 'policy': return 'tag-low'
      case 'event': return ''
      default: return ''
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Company Announcements</h2>
        <span className="muted">{announcements.length} message(s)</span>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 && (
              <tr><td colSpan={5} className="muted">No announcements for you at this time.</td></tr>
            )}
            {announcements.map((announcement) => {
              const isRead = isAnnouncementRead(user.id, announcement.id)

              return (
                <tr key={announcement.id}>
                  <td>
                    <strong>{announcement.title}</strong>
                    <div className="muted small">
                      {announcement.content.length > 60
                        ? `${announcement.content.substring(0, 60)}...`
                        : announcement.content}
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${getTypeClass(announcement.type)}`}>
                      {getTypeLabel(announcement.type)}
                    </span>
                  </td>
                  <td>{formatDate(announcement.createdOn)}</td>
                  <td>
                    {isRead
                      ? <span className="muted">Read</span>
                      : <span className="tag tag-medium">New</span>}
                  </td>
                  <td>
                    <button
                      className="btn btn-tiny btn-light"
                      onClick={() => handleOpen(announcement.id)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-form">
              <div className="modal-header">
                <div>
                  <h3 className="section-title first" style={{ margin: 0 }}>{open.title}</h3>
                  <div className="muted small">
                    {getTypeLabel(open.type)} • {formatDate(open.createdOn)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>
              <div className="announcement-content">
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                  {open.content}
                </p>
              </div>
              <div className="button-row">
                <button type="button" className="btn btn-light" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="hint">
        Stay updated with company news, policy changes, events, and internal job postings.
      </p>
    </div>
  )
}
