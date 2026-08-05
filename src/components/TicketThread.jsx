import { useState } from 'react'
import { TICKET_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import { isPosh } from '../utils/tickets.js'

// Shows a ticket's message thread as a simple chat, with a reply box below.
// viewerRole decides which side each message sits on ('employee' or 'admin').
// nameOf(id) turns an id into a name; anonymous employee messages are masked.
export default function TicketThread({
  ticket,
  viewerRole,
  nameOf,
  onReply,
  onSetStatus // only passed on the HR side
}) {
  const [text, setText] = useState('')

  const isAdmin = viewerRole === 'admin'
  const closed = ticket.status === 'closed'

  // Name to show for a message's author.
  function authorName(msg) {
    if (msg.byRole === 'admin') return 'HR / Admin'
    // employee message
    if (ticket.anonymous && isAdmin) return 'Anonymous'
    return nameOf ? nameOf(msg.byId) : msg.byId
  }

  function send() {
    const t = text.trim()
    if (!t) return
    onReply(t)
    setText('')
  }

  const posh = isPosh(ticket.category)

  return (
    <div>
      {/* POSH / confidential notices */}
      {posh && (
        <div className="error-box first">
          POSH complaint. By law this must be handled confidentially by the
          Internal Committee (IC), not by a regular HR person. Please keep all
          details private.
        </div>
      )}
      {ticket.kind === 'grievance' && !posh && (
        <div className="info-box first">
          This is a confidential grievance. Please handle it privately.
        </div>
      )}

      <div className="thread">
        {ticket.messages.map((msg) => {
          const mine = msg.byRole === viewerRole
          return (
            <div key={msg.id} className={`msg ${mine ? 'msg-mine' : 'msg-them'}`}>
              <div className="msg-head">
                <span className="msg-who">{authorName(msg)}</span>
                <span>{formatDate(msg.on)}</span>
              </div>
              <div className="msg-body">{msg.text}</div>
            </div>
          )
        })}
      </div>

      {/* Reply box (hidden once the ticket is closed) */}
      {closed ? (
        <p className="hint first">This ticket is closed. No more replies can be added.</p>
      ) : (
        <div className="reply-box">
          <textarea
            className="reply-input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAdmin ? 'Write a reply to the employee...' : 'Add more details or a reply...'}
          />
          <div className="button-row">
            <button className="btn btn-primary" disabled={!text.trim()} onClick={send}>
              Send reply
            </button>
          </div>
        </div>
      )}

      {/* HR-only status controls */}
      {isAdmin && onSetStatus && (
        <>
          <h3 className="section-title">Set status</h3>
          <div className="button-row">
            {TICKET_STATUSES.map((s) => (
              <button
                key={s.key}
                className={`btn btn-tiny ${ticket.status === s.key ? 'btn-primary' : 'btn-light'}`}
                onClick={() => onSetStatus(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
