import { useState } from 'react'
import { REIMBURSEMENT_CATEGORIES } from '../data/sampleData.js'

// Form to submit a reimbursement claim.
// onSubmit({ category, expenseDate, amount, description }).
export default function ReimbursementForm({ onSubmit, onCancel, initial = null, submitLabel = 'Submit claim' }) {
  const [category, setCategory] = useState(initial?.category || 'conveyance')
  const [expenseDate, setExpenseDate] = useState(initial?.expenseDate || '')
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description || '')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    setError('')

    const parsed = Number(amount)
    if (!expenseDate) {
      setError('Please enter the date when you incurred this expense.')
      return
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Please enter a valid amount greater than zero.')
      return
    }
    if (!description.trim()) {
      setError('Please briefly describe the expense.')
      return
    }

    onSubmit({
      category,
      expenseDate,
      amount: Math.round(parsed),
      description: description.trim()
    })

    if (!initial) {
      setCategory('conveyance')
      setExpenseDate('')
      setAmount('')
      setDescription('')
      setError('')
    }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="error-box first">{error}</div>}

      <div className="two-col">
        <label className="field">
          <span>Expense category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {REIMBURSEMENT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Expense date</span>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Amount (₹)</span>
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 450"
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          className="reply-input"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was the expense for? Include trip or project details if relevant."
        />
      </label>

      <p className="hint first">
        Submit claims for company-related expenses such as travel, conveyance, or meals.
        HR will review your claim and process payment after approval.
      </p>

      <div className="button-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
