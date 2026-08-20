import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements
} from '../data/store.js'
import { ANNOUNCEMENT_TYPES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import Pagination from '../components/Pagination.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import Modal from '../components/Modal.jsx'
import { Eye, Megaphone, MoreHorizontal, Trash2, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

const ANNOUNCEMENT_TYPE_OPTS = [
  { value: 'all', label: 'All types' },
  ...ANNOUNCEMENT_TYPES.map((t) => ({ value: t.key, label: t.label }))
]

export default function AdminAnnouncements() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general'
  })

  const announcements = useMemo(() => getAnnouncements(), [refresh])
  const open = announcements.find((a) => a.id === openId) || null

  const table = useTableControls(announcements, {
    getSearchText: (a) => [a.title, a.content, a.type, a.createdOn].join(' '),
    getSortValue: (a, key) => {
      if (key === 'type') return a.type
      return a[key]
    },
    initialSortKey: 'createdOn',
    initialSortDir: 'desc',
    filterFns: {
      type: (a, val) => a.type === val
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

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.title.trim()) return

    createAnnouncement({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      createdBy: user.id
    })

    setFormData({ title: '', content: '', type: 'general' })
    setShowForm(false)
    setRefresh((n) => n + 1)
  }

  function handleDelete(announcementId) {
    setDeleteId(announcementId)
  }

  function confirmDelete() {
    if (deleteId) {
      deleteAnnouncement(deleteId)
      setDeleteId(null)
      setRefresh((n) => n + 1)
    }
  }

  function cancelDelete() {
    setDeleteId(null)
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
      case 'event': return 'tag-event'
      default: return 'tag-general'
    }
  }

  function handleOpen(announcementId) {
    setOpenId(announcementId)
  }

  function toggleMenu(announcementId) {
    setOpenMenuId(openMenuId === announcementId ? null : announcementId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  // Close menu when clicking outside
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
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? 'Close' : 'New Announcement'}
        </button>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="New Announcement">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">New Announcement</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowForm(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Office closure for Diwali"
                  required
                />
              </div>
              <div className="field">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {ANNOUNCEMENT_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the announcement details..."
                  rows={5}
                  required
                />
              </div>
              <div className="button-row">
                <button type="submit" className="btn btn-primary">Send Announcement</button>
                <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* All Announcements */}
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search announcements..."
          filters={[{
            key: 'type',
            label: 'Type',
            value: table.filters.type || 'all',
            options: ANNOUNCEMENT_TYPE_OPTS
          }]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <colgroup>
            <col style={{ width: '50%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Created On" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={4} message="No announcements match your filters." />
            )}
            {announcementsPage.map((announcement) => (
              <tr key={announcement.id}>
                <td>
                  <strong>{announcement.title}</strong>
                  <div className="muted small cell-ellipsis" title={announcement.content}>
                    {announcement.content}
                  </div>
                </td>
                <td>
                  <span className={`tag ${getTypeClass(announcement.type)}`}>
                    {getTypeLabel(announcement.type)}
                  </span>
                </td>
                <td>{formatDate(announcement.createdOn)}</td>
                <td>
                  <div className="task-menu-container">
                    <button
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(announcement.id)}
                      aria-label="Announcement actions"
                     ><MoreHorizontal size={16} /></button>
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
                        <button
                          type="button"
                          className="task-menu-item task-menu-item-danger"
                          onClick={() => {
                            handleDelete(announcement.id)
                          }}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
        <Modal onClose={() => setOpenId(null)} title={open.title}>
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
                onClick={() => setOpenId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <div className="announcement-content">
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                {open.content}
              </p>
            </div>
            <div className="button-row">
              <button type="button" className="btn btn-light" onClick={() => setOpenId(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal onClose={cancelDelete} title="Confirm Delete">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Delete</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelDelete} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will permanently delete the announcement. Employees will no longer see it.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
              <button type="button" className="btn btn-light" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      <p className="hint">
        Send company-wide announcements to keep everyone informed about important updates,
        upcoming events, and policy changes.
      </p>
    </div>
  )
}