import { useState } from 'react'
import { formatDate } from '../utils/attendance.js'

// Task Q&A thread between the assignee and whoever created the task.
export default function TaskThread({ task, viewerId, nameOf, onReply, onClose }) {
  const [text, setText] = useState('')
  const messages = task.messages || []
  const canPost = viewerId === task.assigneeId || viewerId === task.createdById

  function authorName(byId) {
    if (byId === task.assigneeId && byId === task.createdById) return `${nameOf(byId)} (me)`
    if (byId === task.assigneeId) return nameOf(byId)
    if (byId === task.createdById) return nameOf(byId)
    return nameOf(byId)
  }

  function send() {
    const t = text.trim()
    if (!t) return
    onReply(t)
    setText('')
  }

  return (
    <div>
      <p className="hint first">
        Ask anything you need to finish this task — missing details, access IDs, passwords,
        deadlines, or other clarifications. The person who assigned the task can reply here.
      </p>

      {messages.length === 0 ? (
        <p className="muted">No questions yet. Send the first message below.</p>
      ) : (
        <div className="thread">
          {messages.map((msg) => {
            const mine = msg.byId === viewerId
            return (
              <div key={msg.id} className={`msg ${mine ? 'msg-mine' : 'msg-them'}`}>
                <div className="msg-head">
                  <span className="msg-who">{authorName(msg.byId)}</span>
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
            placeholder="Type your question or reply..."
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
        <>
          <p className="hint first">Only the assignee and the person who gave the task can post here.</p>
          {onClose && (
            <div className="button-row">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
