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
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { Eye, MessageSquareText, MoreVertical, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'
import Avatar from '../components/Avatar.jsx'

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
  const {
    items: ticketsPage,
    page: ticketsPageNum,
    totalPages: ticketsTotalPages,
    total: ticketsTotal,
    startIndex: ticketsStart,
    endIndex: ticketsEnd,
    setPage: setTicketsPage
  } = usePagination(table.rows)

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
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <MessageSquareText size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Queries &amp; Grievances
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Review and resolve employee queries and confidential grievances</p>
        </div>
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
          <colgroup>
            <col style={{ width: '14%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="From" keyName="from" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Subject" keyName="subject" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Type" keyName="kind" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Category" keyName="category" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Status" keyName="status" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Updated" keyName="updatedOn" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={7} message="Nothing matches your filters." />
            )}
            {ticketsPage.map((t) => {
              const ticketEmp = !t.anonymous ? getEmployeeById(t.employeeId) : null
              return (
              <tr key={t.id}>
                <td>
                  <div className="person-cell">
                    {!t.anonymous && <Avatar src={ticketEmp?.photoUrl} name={raisedByName(t, nameOf)} size={34} />}
                    <div>
                      {raisedByName(t, nameOf)}
                      {!t.anonymous && <div className="muted small">{t.employeeId}</div>}
                    </div>
                  </div>
                </td>
                <td className="cell-ellipsis" title={t.subject}>
                  <strong>{t.subject}</strong>
                  {t.confidential && <span className="tag tag-high" style={{ marginLeft: 8 }}>Confidential</span>}
                </td>
                <td>{kindLabel(t.kind)}</td>
                <td>{categoryLabel(t.category)}</td>
                <td>
                  <select
                    className="btn-tiny"
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
                     ><MoreVertical size={16} /></button>
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
          page={ticketsPageNum}
          totalPages={ticketsTotalPages}
          total={ticketsTotal}
          startIndex={ticketsStart}
          endIndex={ticketsEnd}
          onPageChange={setTicketsPage}
        />
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
                 aria-label="Close"><X size={15} /></button>
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
        Grievances are marked confidential. Anonymous tickets hide the employee&rsquo;s name.
        With the current single-admin setup, all tickets are visible to whoever is logged in as admin.
        Separate HR-staff and Internal-Committee access will be added in a future update.
      </p>
    </div>
  )
}
