import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAnnouncementsForEmployee,
  isAnnouncementRead,
  markAnnouncementAsRead
} from '../data/store.js'
import { ANNOUNCEMENT_TYPES } from '../data/sampleData.js'
import {
  announcementTypeLabel,
  announcementTypeTagClass
} from '../utils/announcements.js'
import { formatDate } from '../utils/attendance.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import { Eye, Megaphone, MoreVertical, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

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
  const [openMenuId, setOpenMenuId] = useState(null)

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

  function toggleMenu(announcementId) {
    setOpenMenuId(openMenuId === announcementId ? null : announcementId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  // Close the row menu on any click outside it — same convention as every other
  // table's three-dot menu in the app.
  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Megaphone size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Announcements
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Company-wide updates, events, and policy changes</p>
        </div>
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
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} /> {/* Title */}
            <col style={{ width: '33%' }} /> {/* Content */}
            <col style={{ width: '15%' }} /> {/* Type */}
            <col style={{ width: '14%' }} /> {/* Date */}
            <col style={{ width: '9%' }} />  {/* Status */}
            <col style={{ width: '9%' }} />  {/* Action */}
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Content" keyName="content" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Date" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="read" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={6} message="No announcements match your filters." />
            )}
            {announcementsPage.map((announcement) => {
              const isRead = isAnnouncementRead(user.id, announcement.id)
              const shownDate = formatDate(announcement.createdOn)

              return (
                <tr key={announcement.id}>
                  <td className="cell-ellipsis" title={announcement.title}>
                    <strong>{announcement.title}</strong>
                  </td>
                  {/* Content is its own column now rather than a second line under
                      the title, so every row stays exactly one line tall. */}
                  <td className="cell-ellipsis" title={announcement.content}>
                    {announcement.content}
                  </td>
                  <td>
                    <span className={`tag ${announcementTypeTagClass(announcement.type)}`}>
                      {announcementTypeLabel(announcement.type)}
                    </span>
                  </td>
                  {/* Dates print like "Wed, 02 Sep" with spaces, so without this
                      the narrower column could wrap them onto two lines. */}
                  <td className="cell-ellipsis" title={shownDate}>{shownDate}</td>
                  <td>
                    {isRead
                      ? <span className="muted">Read</span>
                      : <span className="tag tag-medium">New</span>}
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => toggleMenu(announcement.id)}
                        aria-label="Announcement actions"
                       ><MoreVertical size={16} /></button>
                      {openMenuId === announcement.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => {
                              handleOpen(announcement.id)
                              closeMenu()
                            }}
                          >
                            <Eye size={14} aria-hidden="true" />
                            Open
                          </button>
                        </div>
                      )}
                    </div>
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
                    {announcementTypeLabel(open.type)} • {formatDate(open.createdOn)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={closeModal}
                 aria-label="Close"><X size={15} /></button>
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
        Stay up to date with company news, policy changes, upcoming events, and internal announcements.
      </p>
    </div>
  )
}
