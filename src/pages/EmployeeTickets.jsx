import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTicketMessage,
  createTicket,
  getTicketsForEmployee,
  updateTicket,
  withdrawTicket
} from '../data/store.js'
import { TICKET_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import { categoryLabel, kindLabel, statusLabel, statusTagClass, canEditTicket, canWithdrawTicket } from '../utils/tickets.js'
import TicketForm from '../components/TicketForm.jsx'
import TicketThread from '../components/TicketThread.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'

const TICKET_KIND_OPTS = [
  { value: 'all', label: 'All types' },
  { value: 'query', label: 'Query' },
  { value: 'grievance', label: 'Grievance' }
]
const TICKET_STATUS_OPTS = [
  { value: 'all', label: 'All statuses' },
  ...TICKET_STATUSES.map((s) => ({ value: s.key, label: s.label }))
]

// The employee's help desk: raise queries or grievances and follow the replies.
export default function EmployeeTickets() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [withdrawId, setWithdrawId] = useState(null)

  const tickets = useMemo(
    () => getTicketsForEmployee(user.id),
    [user.id, refresh]
  )
  const table = useTableControls(tickets, {
    getSearchText: (t) =>
      [t.subject, kindLabel(t.kind), categoryLabel(t.category), statusLabel(t.status), t.updatedOn].join(' '),
    getSortValue: (t, key) => {
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

  const open = tickets.find((t) => t.id === openId) || null
  const editTicket = tickets.find((t) => t.id === editId) || null

  function closeTicket() {
    setOpenId(null)
  }

  function handleOpen(ticketId) {
    setOpenId(ticketId)
    setShowForm(false)
  }

  function handleCreate(data) {
    const t = createTicket({ ...data, employeeId: user.id })
    setShowForm(false)
    setOpenId(t.id)
    setRefresh((n) => n + 1)
  }

  function handleEdit(data) {
    if (!editTicket) return
    updateTicket(editTicket.id, user.id, data)
    setEditId(null)
    setRefresh((n) => n + 1)
    setOpenId(editTicket.id)
  }

  function handleWithdraw(ticketId) {
    setWithdrawId(ticketId)
  }

  function confirmWithdraw() {
    if (withdrawId) {
      withdrawTicket(withdrawId, user.id)
      if (openId === withdrawId) setOpenId(null)
      if (editId === withdrawId) setEditId(null)
      setWithdrawId(null)
      setRefresh((n) => n + 1)
    }
  }

  function cancelWithdraw() {
    setWithdrawId(null)
  }

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
    addTicketMessage(open.id, { byId: user.id, byRole: 'employee', text })
    setRefresh((n) => n + 1)
  }

  const nameOf = (id) => (id === user.id ? user.name : id)

  return (
    <div>
      <div className="page-head">
        <h2>My Queries &amp; Grievances</h2>
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => { setShowForm((s) => !s); setOpenId(null) }}
        >
          {showForm ? 'Close' : 'Raise new'}
        </button>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Raise Query or Grievance">
          <div className="modal-form">
              <div className="modal-header">
                <h3 className="section-title first">Raise Query or Grievance</h3>
                <button type="button" className="btn btn-tiny btn-light" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <p className="hint first">
                Raise a routine question (payslip, leave, PF, policy, IT) or a
                serious concern. Grievances are kept confidential, and you can
                choose to stay anonymous.
              </p>
              <TicketForm onCreate={handleCreate} onCancel={() => setShowForm(false)} />
            </div>
        </Modal>
      )}

      {editTicket && (
        <Modal onClose={() => setEditId(null)} title="Edit ticket">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit ticket</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setEditId(null)}>✕</button>
            </div>
            <p className="hint first">
              You can edit details while the ticket is still open and HR has not started working on it.
            </p>
            <TicketForm
              key={editTicket.id}
              initial={editTicket}
              submitLabel="Save changes"
              onCreate={handleEdit}
              onCancel={() => setEditId(null)}
            />
          </div>
        </Modal>
      )}

      {/* My tickets */}
      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={ticketsTotal}
          startIndex={ticketsStart}
          endIndex={ticketsEnd}
          placeholder="Search tickets..."
          filters={[
            { key: 'kind', label: 'Type', value: table.filters.kind || 'all', options: TICKET_KIND_OPTS },
            { key: 'status', label: 'Status', value: table.filters.status || 'all', options: TICKET_STATUS_OPTS }
          ]}
          onFilterChange={table.setFilter}
        />
        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '25%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead>
            <tr>
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
              <tr><td colSpan={7} className="muted">No tickets match your filters.</td></tr>
            )}
            {ticketsPage.map((t) => (
              <tr key={t.id}>
                <td className="cell-ellipsis" title={t.subject}>{t.subject}</td>
                <td>{kindLabel(t.kind)}{t.anonymous ? ' (anon)' : ''}</td>
                <td>{categoryLabel(t.category)}</td>
                <td><span className={`tag ${statusTagClass(t.status)}`}>{statusLabel(t.status)}</span></td>
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
                            handleOpen(t.id)
                            closeMenu()
                          }}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="task-menu-item"
                          disabled={!canEditTicket(t)}
                          onClick={() => {
                            setEditId(t.id)
                            setOpenId(null)
                            closeMenu()
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="task-menu-item task-menu-item-danger"
                          disabled={!canWithdrawTicket(t)}
                          onClick={() => {
                            handleWithdraw(t.id)
                          }}
                        >
                          Withdraw
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
          page={ticketsPageNum}
          totalPages={ticketsTotalPages}
          total={ticketsTotal}
          startIndex={ticketsStart}
          endIndex={ticketsEnd}
          onPageChange={setTicketsPage}
        />
      </div>

      {open && (
        <Modal onClose={closeTicket} title={open.subject}>
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <div>
                <h3 className="section-title first" style={{ margin: 0 }}>{open.subject}</h3>
                <div className="muted small">
                  {kindLabel(open.kind)} — {categoryLabel(open.category)}
                  {open.anonymous ? ' (anonymous)' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${statusTagClass(open.status)}`}>{statusLabel(open.status)}</span>
                <button
                  type="button"
                  className="btn btn-tiny btn-light"
                  onClick={closeTicket}
                >
                  ✕
                </button>
              </div>
            </div>
            <TicketThread
              ticket={open}
              viewerRole="employee"
              nameOf={nameOf}
              onReply={handleReply}
              onClose={closeTicket}
            />
          </div>
        </Modal>
      )}

      {withdrawId && (
        <Modal onClose={cancelWithdraw} title="Confirm Withdraw">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Withdraw</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelWithdraw}>✕</button>
            </div>
            <p className="hint first">
              {withdrawTicket?.kind === 'grievance'
                ? 'Are you sure you want to withdraw this grievance? This action cannot be undone.'
                : 'Are you sure you want to withdraw this query? This action cannot be undone.'}
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmWithdraw}>
                Withdraw
              </button>
              <button type="button" className="btn btn-light" onClick={cancelWithdraw}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
