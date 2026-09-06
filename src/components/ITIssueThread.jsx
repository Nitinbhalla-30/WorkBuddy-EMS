import { useState } from 'react'
import { formatDate } from '../utils/attendance.js'

// Chat-style comment thread for an IT issue. IT staff use it to ask
// clarifying questions (which laptop, which software...) and the employee
// replies. viewerRole decides which side each message sits on
// ('employee' or 'it'). The composer is hidden when the thread is locked:
// either the issue was withdrawn, or the caller passed no onReply because the
// viewer only watches (HR/Admin). If onClose is given, a Close button is
// rendered next to Send message.
export default function ITIssueThread({ issue, viewerRole, onReply, onClose }) {
  const [text, setText] = useState('')

  const comments = issue.comments || []
  const withdrawn = issue.status === 'withdrawn'
  const noReply = withdrawn || typeof onReply !== 'function'

  function send() {
    const t = text.trim()
    if (!t) return
    onReply(t)
    setText('')
  }

  return (
    <div>
      <h3 className="section-title">Discussion</h3>
      {comments.length === 0 ? (
        <p className="hint first">
          No messages yet. IT staff will use this space to ask questions — feel free to reply with more details.
        </p>
      ) : (
        <div className="thread">
          {comments.map((msg) => {
            const mine = msg.byRole === viewerRole
            return (
              <div key={msg.id} className={`msg ${mine ? 'msg-mine' : 'msg-them'}`}>
                <div className="msg-head">
                  <span className="msg-who">{msg.byName}</span>
                  <span>{formatDate(msg.on)}</span>
                </div>
                <div className="msg-body">{msg.text}</div>
              </div>
            )
          })}
        </div>
      )}

      {noReply ? (
        <>
          <p className="hint first">
            {withdrawn
              ? 'This issue was withdrawn and is now closed. No further messages can be added.'
              : 'You can read this discussion, but only the IT team can post in it.'}
          </p>
          {onClose && (
            <div className="button-row">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="reply-box">
          <textarea
            className="reply-input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              viewerRole === 'it'
                ? 'Ask a question or update the employee...'
                : 'Reply to IT or add more details...'
            }
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
      )}
    </div>
  )
}
