import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getAnnouncementsForEmployee, markAnnouncementAsRead } from '../data/store.js'
import { ANNOUNCEMENT_TYPES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'

export default function EmployeeAnnouncements() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [expandedId, setExpandedId] = useState(null)

  const announcements = useMemo(
    () => getAnnouncementsForEmployee(user.id),
    [user.id, refresh]
  )

  // Mark announcements as read when expanded
  function toggleExpand(announcementId) {
    markAnnouncementAsRead(user.id, announcementId)
    setExpandedId(announcementId === expandedId ? null : announcementId)
    // Trigger custom event to update badge in real-time
    window.dispatchEvent(new CustomEvent('announcementRead'))
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
        <span className="muted">{announcements.length} messages</span>
      </div>

      {announcements.length === 0 && (
        <div className="card">
          <p className="muted">No announcements for you at this time.</p>
        </div>
      )}

      {announcements.map((announcement) => {
        const isExpanded = expandedId === announcement.id

        return (
          <div key={announcement.id} className="card">
            <div
              className="page-head"
              style={{ cursor: 'pointer' }}
              onClick={() => toggleExpand(announcement.id)}
            >
              <div>
                <h3 style={{ margin: 0 }}>{announcement.title}</h3>
                <div className="muted small">
                  {getTypeLabel(announcement.type)} • {formatDate(announcement.createdOn)}
                </div>
              </div>
              <span className={`tag ${getTypeClass(announcement.type)}`}>
                {getTypeLabel(announcement.type)}
              </span>
            </div>

            {isExpanded && (
              <div className="announcement-content">
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {announcement.content}
                </p>
              </div>
            )}

            <button
              className="btn btn-tiny btn-light"
              onClick={() => toggleExpand(announcement.id)}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          </div>
        )
      })}

      <p className="hint">
        Stay updated with company news, policy changes, events, and internal job postings.
      </p>
    </div>
  )
}