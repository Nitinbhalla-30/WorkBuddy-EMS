import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  getEmployees
} from '../data/store.js'
import { ANNOUNCEMENT_TYPES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { useTableControls } from '../hooks/useTableControls.js'

const ANNOUNCEMENT_TYPE_OPTS = [
  { value: 'all', label: 'All types' },
  ...ANNOUNCEMENT_TYPES.map((t) => ({ value: t.key, label: t.label }))
]

export default function AdminAnnouncements() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    excludedEmployees: []
  })

  const announcements = useMemo(() => getAnnouncements(), [refresh])

  const table = useTableControls(announcements, {
    getSearchText: (a) => [a.title, a.content, a.type, a.createdOn].join(' '),
    getSortValue: (a, key) => {
      if (key === 'type') return a.type
      if (key === 'excluded') return a.excludedEmployees?.length || 0
      return a[key]
    },
    initialSortKey: 'createdOn',
    initialSortDir: 'desc',
    filterFns: {
      type: (a, val) => a.type === val
    }
  })

  const employees = useMemo(() => {
    return getEmployees().filter((e) => e.role === 'employee' || e.role === 'it')
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.title.trim()) return

    createAnnouncement({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      createdBy: user.id,
      excludedEmployees: formData.excludedEmployees
    })

    setFormData({ title: '', content: '', type: 'general', excludedEmployees: [] })
    setShowForm(false)
    setRefresh((n) => n + 1)
  }

  function handleDelete(announcementId) {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(announcementId)
      setRefresh((n) => n + 1)
    }
  }

  function handleExcludedToggle(employeeId) {
    setFormData((prev) => {
      const excluded = prev.excludedEmployees.includes(employeeId)
        ? prev.excludedEmployees.filter((id) => id !== employeeId)
        : [...prev.excludedEmployees, employeeId]
      return { ...prev, excludedEmployees: excluded }
    })
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

  function getExcludedCount(announcement) {
    return announcement.excludedEmployees?.length || 0
  }

  return (
    <div>
      <div className="page-head">
        <h2>Company Announcements</h2>
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? 'Close' : 'New Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="card">
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
              <label>Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the announcement details..."
                rows={5}
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
              <label>Exclude Employees (optional)</label>
              <div className="employee-selector">
                {employees.length === 0 && (
                  <p className="muted small">No employees available</p>
                )}
                {employees.map((emp) => (
                  <label key={emp.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.excludedEmployees.includes(emp.id)}
                      onChange={() => handleExcludedToggle(emp.id)}
                    />
                    <span>{emp.name} ({emp.id})</span>
                  </label>
                ))}
              </div>
              {formData.excludedEmployees.length > 0 && (
                <p className="muted small">
                  {formData.excludedEmployees.length} employee(s) will not receive this announcement
                </p>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Send Announcement
            </button>
          </form>
        </div>
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
          <thead>
            <tr>
              <SortableTh label="Title" keyName="title" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="type" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Created On" keyName="createdOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Excluded" keyName="excluded" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={5} className="muted">No announcements match your filters.</td></tr>
            )}
            {table.rows.map((announcement) => (
              <tr key={announcement.id}>
                <td>
                  <strong>{announcement.title}</strong>
                  <div className="muted small">
                    {announcement.content.substring(0, 50)}...
                  </div>
                </td>
                <td>
                  <span className={`tag ${getTypeClass(announcement.type)}`}>
                    {getTypeLabel(announcement.type)}
                  </span>
                </td>
                <td>{formatDate(announcement.createdOn)}</td>
                <td>
                  {getExcludedCount(announcement) > 0 ? (
                    <span className="muted">{getExcludedCount(announcement)} employee(s)</span>
                  ) : (
                    <span className="muted">None</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-tiny btn-light"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="hint">
        Send company-wide announcements. You can exclude specific employees from receiving
        certain messages if they are not relevant to them.
      </p>
    </div>
  )
}