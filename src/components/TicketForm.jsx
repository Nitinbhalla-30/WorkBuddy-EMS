import { useMemo, useState } from 'react'
import { categoriesForKind, isPosh } from '../utils/tickets.js'

// Form to raise a new query or grievance.
// onCreate({ kind, category, subject, message, anonymous }).
export default function TicketForm({ onCreate, onCancel }) {
  const [kind, setKind] = useState('query')
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState('')

  const categories = useMemo(() => categoriesForKind(kind), [kind])

  // When the kind changes, reset the category so it always matches the kind.
  function changeKind(nextKind) {
    setKind(nextKind)
    setCategory('')
    if (nextKind === 'query') setAnonymous(false)
  }

  function submit(e) {
    e.preventDefault()
    if (!category) return setError('Please choose a category.')
    if (!subject.trim()) return setError('Please add a short subject.')
    if (!message.trim()) return setError('Please describe your request.')

    onCreate({
      kind,
      category,
      subject: subject.trim(),
      message: message.trim(),
      anonymous: kind === 'grievance' ? anonymous : false
    })

    // Clear for the next one.
    setCategory('')
    setSubject('')
    setMessage('')
    setAnonymous(false)
    setError('')
    
    // Call onCancel if provided to close the modal
    if (onCancel) onCancel()
  }

  const poshChosen = isPosh(category)

  return (
    <form onSubmit={submit}>
      {error && <div className="error-box first">{error}</div>}

      <div className="two-col">
        <label className="field">
          <span>Type</span>
          <select value={kind} onChange={(e) => changeKind(e.target.value)}>
            <option value="query">Query (a routine question)</option>
            <option value="grievance">Grievance (a serious concern)</option>
          </select>
        </label>

        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">-- choose --</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="A short one-line summary"
        />
      </label>

      <label className="field">
        <span>Details</span>
        <textarea
          className="reply-input"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explain your query or concern in your own words"
        />
      </label>

      {kind === 'grievance' && (
        <>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <span>
              Raise this anonymously. HR will not see my name. (I can still
              track it here under my own login.)
            </span>
          </label>
          {poshChosen && (
            <div className="error-box">
              This is a POSH (harassment) complaint. By law it will be handled
              confidentially by the Internal Committee (IC).
            </div>
          )}
        </>
      )}

      <div className="button-row">
        <button type="submit" className="btn btn-primary">Submit</button>
        {onCancel && <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
