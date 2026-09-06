import { useEffect, useRef, useState } from 'react'
import {
  addTeamMessage,
  clearTeamConversation,
  getEmployeeById,
  getTeamMessages,
  markTeamMessagesRead
} from '../data/store.js'
import { formatDateTime } from '../utils/cab.js'
import { formatFileSize } from '../utils/profile.js'
import Avatar from '../components/Avatar.jsx'
import Modal from './Modal.jsx'
import {
  FileText,
  MoreVertical,
  Paperclip,
  Send,
  Trash2,
  X
} from 'lucide-react'

// Slide-out chat panel for messaging a teammate. Shows the conversation
// thread, supports text messages and file attachments (Word, Excel, PDF,
// images, etc.). Uses the same .thread / .msg / .reply-box CSS as the
// rest of the app so it looks consistent.
export default function TeamChat({ peerId, currentUser, onClose, refresh }) {
  const peer = getEmployeeById(peerId)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState(() =>
    getTeamMessages(currentUser.id, peerId)
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const threadRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)

  // Mark incoming messages as read when the panel opens.
  useEffect(() => {
    markTeamMessagesRead(currentUser.id, peerId)
    // Notify sidebar to refresh unread badge.
    window.dispatchEvent(new Event('teamMessageReceived'))
  }, [currentUser.id, peerId])

  // Auto-scroll to the bottom when new messages arrive.
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages])

  // Close the three-dot menu when clicking outside.
  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(e) {
      if (!e.target.closest('.team-chat-menu-container')) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  function loadMessages() {
    setMessages(getTeamMessages(currentUser.id, peerId))
  }

  function handlePickFiles(e) {
    const picked = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type
    }))
    if (picked.length > 0) {
      // Send file(s) immediately.
      addTeamMessage({
        fromId: currentUser.id,
        toId: peerId,
        text: '',
        attachments: picked
      })
      loadMessages()
      if (refresh) refresh()
      window.dispatchEvent(new Event('teamMessageSent'))
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function send() {
    const t = text.trim()
    if (!t) return
    addTeamMessage({
      fromId: currentUser.id,
      toId: peerId,
      text: t,
      attachments: []
    })
    setText('')
    loadMessages()
    if (refresh) refresh()
    // Notify sidebar to refresh unread badge.
    window.dispatchEvent(new Event('teamMessageSent'))
    // Keep focus in the textarea so the user can keep typing.
    // Use requestAnimationFrame to defer focus until after re-renders.
    requestAnimationFrame(() => {
      if (inputRef.current) inputRef.current.focus()
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function fileIcon(type) {
    if (!type) return <FileText size={14} />
    if (type.startsWith('image/')) return <FileText size={14} />
    if (type.includes('pdf')) return <FileText size={14} />
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return <FileText size={14} />
    if (type.includes('word') || type.includes('document')) return <FileText size={14} />
    return <FileText size={14} />
  }

  function handleClearChat() {
    clearTeamConversation(currentUser.id, peerId)
    setMessages([])
    setMenuOpen(false)
    setConfirmClear(false)
    if (refresh) refresh()
    window.dispatchEvent(new Event('teamMessageReceived'))
  }

  const peerName = peer?.name || peerId

  return (
    <>
    <div className="team-chat-panel">
      <div className="team-chat-header">
        <div className="team-chat-peer">
          <Avatar src={peer?.photoUrl} name={peerName} size={32} />
          <div>
            <div className="team-chat-peer-name">{peerName}</div>
            <div className="team-chat-peer-role muted small">{peer?.designation || 'Teammate'}</div>
          </div>
        </div>
        <div className="team-chat-header-actions">
          <div className="task-menu-container team-chat-menu-container">
            <button
              type="button"
              className="btn btn-tiny btn-light task-menu-button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Chat options"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="task-menu-dropdown">
                <button
                  type="button"
                  className="task-menu-item task-menu-item-danger"
                  onClick={() => { setMenuOpen(false); setConfirmClear(true) }}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Clear chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="team-chat-thread" ref={threadRef}>
        {messages.length === 0 && (
          <p className="muted team-chat-empty">
            No messages yet. Say hello to {peerName.split(' ')[0]}!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.fromId === currentUser.id
          return (
            <div key={m.id} className={`msg ${mine ? 'msg-mine' : 'msg-them'}`}>
              {m.text && <div className="msg-body">{m.text}</div>}
              {m.attachments && m.attachments.length > 0 && (
                <div className="team-chat-attachments">
                  {m.attachments.map((f, i) => (
                    <span className="file-chip static" key={`${f.name}-${i}`}>
                      {fileIcon(f.type)}
                      <span className="file-chip-name">{f.name}</span>
                      <span className="file-chip-size muted">{formatFileSize(f.size)}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="msg-time">{formatDateTime(m.on)}</div>
            </div>
          )
        })}
      </div>

      <div className="team-chat-reply">
        <div className="team-chat-composer">
          <textarea
            ref={inputRef}
            className="team-chat-composer-input"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${peerName.split(' ')[0]}...`}
          />
          <div className="team-chat-composer-actions">
            <button
              type="button"
              className="team-chat-composer-attach"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handlePickFiles}
            />
            <button
              type="button"
              className={`team-chat-composer-send ${text.trim() ? 'active' : ''}`}
              disabled={!text.trim()}
              onClick={send}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>

    {confirmClear && (
      <Modal onClose={() => setConfirmClear(false)} title="Clear chat">
        <div className="modal-form">
          <div className="modal-header">
            <h3 className="section-title first">Clear chat with {peerName}</h3>
            <button type="button" className="btn btn-tiny btn-light" onClick={() => setConfirmClear(false)} aria-label="Close"><X size={15} /></button>
          </div>
          <p className="hint first">This will permanently delete all messages in this conversation. This action cannot be undone.</p>
          <div className="button-row">
            <button type="button" className="btn btn-danger" onClick={handleClearChat}>
              Clear chat
            </button>
            <button type="button" className="btn btn-light" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    )}
    </>
  )
}
