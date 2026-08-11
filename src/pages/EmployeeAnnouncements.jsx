import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAnnouncementsForEmployee,
  isAnnouncementRead,
  markAnnouncementAsRead
} from '../data/store.js'
import { ANNOUNCEMENT_TYPES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'

const ANNOUNCEMENT_TYPE_OPTS = [
  { value: 'all', label: 'All types' },
  ...ANNOUNCEMENT_TYPES.map((t) => ({ value: t.key, label: t.label }))
]
const READ_FILTER_OPTS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'Unread' },
  { value: 'read', label: 'Read' }
]

export default function EmployeeAnnouncements() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [openId, setOpenId] = useState(null)

  const announcements = useMemo(
    () => getAnnouncementsForEmployee(user.id),
    [user.id, refresh]
  )
  const table = useTableControls(announcements, {
    getSearchText: (a) => [a.title, a.content, a.type, a.createdOn].join(' '),
    getSortValue: (a, key) => {
      if (key === 'read') return isAnnouncementRead(user.id, a.id) ? 'read' : 'new'
      if (key === 'type') return a.type
      return a[key]
    },
    initialSortKey: 'createdOn',
    initialSortDir: 'desc',
    filterFns: {
      type: (a, val) => a.type === val,
      read: (a, val) => {
        const isRead = isAnnouncementRead(user.id, a.id)
        if (val === 'read') return isRead
        if (val === 'new') return !isRead
        return true
      }
    }
  })
  const {
    items: announcementsPage,
    page: announcementsPageNum,
    totalPages: announcementsTotalPages,
    total: announcementsTotal,
    startIndex: announcementsStart,
    endIndex: announcementsEnd,
    setPage: setAnnouncementsPage
  } = usePagination(table.rows)

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
        <h2>Announcements</h2>
        <span className="muted">{announcements.length} message(s)</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={announcementsTotal}
          startIndex={announcementsStart}
          endIndex={announcementsEnd}
          placeholder="Search announcements..."
          filters={[
            { key: 'type', label: 'Type', value: table.filters.type || 'all', options: ANNOUNCEMENT_TYPE_OPTS },
            { key: 'read', label: 'Status', value: table.filters.read || 'all', options: READ_FILTER_OPTS }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Date" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="read" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={5} className="muted">No announcements match your filters.</td></tr>
            )}
            {announcementsPage.map((announcement) => {
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
        <Pagination
          page={announcementsPageNum}
          totalPages={announcementsTotalPages}
          total={announcementsTotal}
          startIndex={announcementsStart}
          endIndex={announcementsEnd}
          onPageChange={setAnnouncementsPage}
        />
      </div>

      {open && (
        <Modal onClose={closeModal} title={open.title}>
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
        </Modal>
      )}

      <p className="hint">
        Stay updated with company news, policy changes, events, and internal job postings.
      </p>
    </div>
  )
}
