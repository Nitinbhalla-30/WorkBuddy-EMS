import { useState } from 'react'
import { formatDate } from '../utils/attendance.js'

// Q&A thread on an attendance correction between HR/Admin and the employee.
export default function AttendanceCorrectionThread({
  correction,
  viewerRole,
  viewerId,
  nameOf,
  onReply,
  onClose
}) {
  const [text, setText] = useState('')
  const messages = correction.messages || []
  const isAdmin = viewerRole === 'admin'
  const pending = correction.status === 'pending'
  const canPost = pending && (isAdmin || viewerId === correction.employeeId)

  function authorName(msg) {
    if (msg.byRole === 'admin') {
      const n = nameOf ? nameOf(msg.byId) : null
      return n ? `${n} (HR / Admin)` : 'HR / Admin'
    }
    const n = nameOf ? nameOf(msg.byId) : null
    return n || msg.byId
  }

  function send() {
    const t = text.trim()
    if (!t) return
    onReply(t)
    setText('')
  }

  return (
    <div>
      <h3 className="section-title first">Questions &amp; replies</h3>
      {pending ? (
        <p className="hint first">
          {isAdmin
            ? 'Ask the employee for more details before approving or rejecting this request.'
            : 'HR may ask for clarification here before making a decision. Reply below if needed.'}
        </p>
      ) : (
        <p className="hint first">This request is closed. The conversation below is read-only.</p>
      )}

      {messages.length === 0 ? (
        <p className="muted">No messages yet.</p>
      ) : (
        <div className="thread">
          {messages.map((msg) => {
            const mine = isAdmin
              ? msg.byRole === 'admin'
              : msg.byRole === 'employee' && msg.byId === viewerId
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
      )}

      {canPost ? (
        <div className="reply-box">
          <textarea
            className="reply-input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAdmin ? 'Ask a question or request more information...' : 'Type your reply...'}
          />
          <div className="button-row">
            <button className="btn btn-primary" disabled={!text.trim()} onClick={send}>
              Send message
            </button>
            {onClose && (
              <button type="button" className="btn btn-light" onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      ) : (
        onClose && (
          <div className="button-row">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Close
            </button>
          </div>
        )
      )}
    </div>
  )
}
