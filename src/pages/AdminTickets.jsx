import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTicketMessage,
  getEmployeeById,
  getTicketsForHR,
  setTicketStatus
} from '../data/store.js'
import { TICKET_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import {
  categoryLabel,
  kindLabel,
  raisedByName,
  statusLabel,
  statusTagClass
} from '../utils/tickets.js'
import TicketThread from '../components/TicketThread.jsx'

// HR view of every query and grievance, with filters and a reply thread.
export default function AdminTickets() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [kindFilter, setKindFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openId, setOpenId] = useState(null)

  const nameOf = (id) => getEmployeeById(id)?.name || id

  const tickets = useMemo(() => {
    return getTicketsForHR().filter((t) => {
      if (kindFilter !== 'all' && t.kind !== kindFilter) return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      return true
    })
  }, [kindFilter, statusFilter, refresh])

  const open = getTicketsForHR().find((t) => t.id === openId) || null

  function handleReply(text) {
    addTicketMessage(open.id, { byId: user.id, byRole: 'admin', text })
    setRefresh((n) => n + 1)
  }

  function handleSetStatus(status) {
    setTicketStatus(open.id, status)
    setRefresh((n) => n + 1)
  }

  const openCount = getTicketsForHR().filter((t) => t.status === 'open').length

  return (
    <div>
      <div className="page-head">
        <h2>Queries &amp; Grievances</h2>
        <span className="muted">{openCount} open</span>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filters">
          <label className="field inline">
            <span>Type</span>
            <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="query">Queries</option>
              <option value="grievance">Grievances</option>
            </select>
          </label>
          <label className="field inline">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* List */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>From</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td colSpan={7} className="muted">Nothing matches these filters.</td></tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.subject}</strong>
                  {t.confidential && <span className="tag tag-high" style={{ marginLeft: 8 }}>Confidential</span>}
                </td>
                <td>{raisedByName(t, nameOf)}</td>
                <td>{kindLabel(t.kind)}</td>
                <td>{categoryLabel(t.category)}</td>
                <td><span className={`tag ${statusTagClass(t.status)}`}>{statusLabel(t.status)}</span></td>
                <td>{formatDate(t.updatedOn)}</td>
                <td>
                  <button
                    className="btn btn-tiny btn-light"
                    onClick={() => setOpenId(t.id === openId ? null : t.id)}
                  >
                    {t.id === openId ? 'Hide' : 'Open'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Open one ticket */}
      {open && (
        <div className="card">
          <div className="page-head">
            <div>
              <h3 style={{ margin: 0 }}>{open.subject}</h3>
              <div className="muted small">
                From {raisedByName(open, nameOf)} — {kindLabel(open.kind)} — {categoryLabel(open.category)}
              </div>
            </div>
            <span className={`tag ${statusTagClass(open.status)}`}>{statusLabel(open.status)}</span>
          </div>
          <TicketThread
            ticket={open}
            viewerRole="admin"
            nameOf={nameOf}
            onReply={handleReply}
            onSetStatus={handleSetStatus}
          />
        </div>
      )}

      <p className="hint">
        Grievances are marked confidential and anonymous ones hide the
        employee&apos;s name. With a single admin login today, everything is
        visible to whoever holds it; separate HR-staff and Internal-Committee
        access comes with the real login phase.
      </p>
    </div>
  )
}
