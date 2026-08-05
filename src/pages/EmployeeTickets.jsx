import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addTicketMessage,
  createTicket,
  getTicketsForEmployee
} from '../data/store.js'
import { formatDate } from '../utils/attendance.js'
import { categoryLabel, kindLabel, statusLabel, statusTagClass } from '../utils/tickets.js'
import TicketForm from '../components/TicketForm.jsx'
import TicketThread from '../components/TicketThread.jsx'

// The employee's help desk: raise queries or grievances and follow the replies.
export default function EmployeeTickets() {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const [openId, setOpenId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const tickets = useMemo(
    () => getTicketsForEmployee(user.id),
    [user.id, refresh]
  )

  const open = tickets.find((t) => t.id === openId) || null

  function handleCreate(data) {
    const t = createTicket({ ...data, employeeId: user.id })
    setShowForm(false)
    setOpenId(t.id)
    setRefresh((n) => n + 1)
  }

  function handleReply(text) {
    addTicketMessage(open.id, { byId: user.id, byRole: 'employee', text })
    setRefresh((n) => n + 1)
  }

  const nameOf = (id) => (id === user.id ? user.name : id)

  return (
    <div>
      <div className="page-head">
        <h2>Queries &amp; Grievances</h2>
        <button
          className="btn btn-primary btn-tiny"
          onClick={() => { setShowForm((s) => !s); setOpenId(null) }}
        >
          {showForm ? 'Close' : 'Raise new'}
        </button>
      </div>

      {showForm && (
        <>
          <p className="hint first">
            Raise a routine question (payslip, leave, PF, policy, IT) or a
            serious concern. Grievances are kept confidential, and you can
            choose to stay anonymous.
          </p>
          <TicketForm onCreate={handleCreate} />
        </>
      )}

      {/* My tickets */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td colSpan={6} className="muted">You have not raised anything yet.</td></tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.subject}</strong></td>
                <td>{kindLabel(t.kind)}{t.anonymous ? ' (anon)' : ''}</td>
                <td>{categoryLabel(t.category)}</td>
                <td><span className={`tag ${statusTagClass(t.status)}`}>{statusLabel(t.status)}</span></td>
                <td>{formatDate(t.updatedOn)}</td>
                <td>
                  <button
                    className="btn btn-tiny btn-light"
                    onClick={() => { setOpenId(t.id === openId ? null : t.id); setShowForm(false) }}
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
                {kindLabel(open.kind)} — {categoryLabel(open.category)}
              </div>
            </div>
            <span className={`tag ${statusTagClass(open.status)}`}>{statusLabel(open.status)}</span>
          </div>
          <TicketThread
            ticket={open}
            viewerRole="employee"
            nameOf={nameOf}
            onReply={handleReply}
          />
        </div>
      )}
    </div>
  )
}
