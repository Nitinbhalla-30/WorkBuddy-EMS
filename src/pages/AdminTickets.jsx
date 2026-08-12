import { useEffect, useMemo, useState } from 'react'
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
import Modal from '../components/Modal.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { useTableControls } from '../hooks/useTableControls.js'

const TICKET_KIND_OPTS = [
  { value: 'all', label: 'All types' },
  { value: 'query', label: 'Queries' },
  { value: 'grievance', label: 'Grievances' }
]
const TICKET_STATUS_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...TICKET_STATUSES.map((s) => ({ value: s.key, label: s.label }))
]

// HR view of every query and grievance, with filters and a reply thread.
export default function AdminTickets() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [openId, setOpenId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const nameOf = (id) => getEmployeeById(id)?.name || id

  const allTickets = useMemo(() => getTicketsForHR(), [refresh])

  const table = useTableControls(allTickets, {
    getSearchText: (t) =>
      [t.subject, raisedByName(t, nameOf), kindLabel(t.kind), categoryLabel(t.category), statusLabel(t.status), t.updatedOn].join(' '),
    getSortValue: (t, key) => {
      if (key === 'from') return raisedByName(t, nameOf)
      if (key === 'kind') return t.kind
      if (key === 'category') return categoryLabel(t.category)
      if (key === 'status') return t.status
      return t[key]
    },
    initialSortKey: 'updatedOn',
    initialSortDir: 'desc',
    filterFns: {
      kind: (t, val) => t.kind === val,
      status: (t, val) => t.status === val
    }
  })

  const open = allTickets.find((t) => t.id === openId) || null

  function toggleMenu(ticketId) {
    setOpenMenuId(openMenuId === ticketId ? null : ticketId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  function handleReply(text) {
    addTicketMessage(open.id, { byId: user.id, byRole: 'admin', text })
    setRefresh((n) => n + 1)
  }

  function handleSetStatus(ticketId, status) {
    setTicketStatus(ticketId, status)
    setRefresh((n) => n + 1)
  }

  const openCount = allTickets.filter((t) => t.status === 'open').length

  return (
    <div>
      <div className="page-head">
        <h2>Queries &amp; Grievances</h2>
        <span className="muted">{openCount} open</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search tickets..."
          filters={[
            { key: 'kind', label: 'Type', value: table.filters.kind || 'all', options: TICKET_KIND_OPTS },
            { key: 'status', label: 'Status', value: table.filters.status || 'all', options: TICKET_STATUS_OPTS }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Subject" keyName="subject" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="From" keyName="from" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="kind" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Updated" keyName="updatedOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={7} className="muted">Nothing matches your filters.</td></tr>
            )}
            {table.rows.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.subject}</strong>
                  {t.confidential && <span className="tag tag-high" style={{ marginLeft: 8 }}>Confidential</span>}
                </td>
                <td>
                  {raisedByName(t, nameOf)}
                  {!t.anonymous && <div className="muted small">{t.employeeId}</div>}
                </td>
                <td>{kindLabel(t.kind)}</td>
                <td>{categoryLabel(t.category)}</td>
                <td>
                  <select
                    className="inline-select"
                    value={t.status}
                    aria-label={`Set status for ${t.subject}`}
                    onChange={(e) => handleSetStatus(t.id, e.target.value)}
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td>{formatDate(t.updatedOn)}</td>
                <td>
                  <div className="task-menu-container">
                    <button
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(t.id)}
                      aria-label="Ticket actions"
                    >
                      ⋯
                    </button>
                    {openMenuId === t.id && (
                      <div className="task-menu-dropdown">
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            setOpenId(t.id)
                            closeMenu()
                          }}
                        >
                          Open
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Open one ticket */}
      {open && (
        <Modal onClose={() => setOpenId(null)} title={open.subject}>
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>{open.subject}</h3>
                <div className="muted small">
                  From {raisedByName(open, nameOf)} — {kindLabel(open.kind)} — {categoryLabel(open.category)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(open.status)}`}>{statusLabel(open.status)}</span>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={() => setOpenId(null)}
                >
                  ✕
                </button>
              </div>
            </div>
            <TicketThread
              ticket={open}
              viewerRole="admin"
              nameOf={nameOf}
              onReply={handleReply}
              onClose={() => setOpenId(null)}
            />
          </div>
        </Modal>
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
