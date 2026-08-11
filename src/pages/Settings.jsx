import { useState } from 'react'
import {
  getSettings,
  resetToSampleData,
  saveSettings
} from '../data/store.js'
import { fetchPublicIp } from '../utils/network.js'

// HR/Admin settings: branding, timing rules, and the office-internet check.
export default function Settings() {
  const [form, setForm] = useState(() => getSettings())
  const [saved, setSaved] = useState(false)
  const [detectedIp, setDetectedIp] = useState('')
  const [detecting, setDetecting] = useState(false)

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function updateLeaveAllowance(key, value) {
    setForm((f) => ({
      ...f,
      leaveAllowance: { ...f.leaveAllowance, [key]: Number(value) }
    }))
    setSaved(false)
  }

  function updateLunchPolicy(key, value) {
    setForm((f) => ({
      ...f,
      lunchPolicy: { ...f.lunchPolicy, [key]: value }
    }))
    setSaved(false)
  }

  function updateHoliday(id, field, value) {
    setForm((f) => ({
      ...f,
      companyHolidays: (f.companyHolidays || []).map((h) =>
        h.id === id ? { ...h, [field]: value } : h
      )
    }))
    setSaved(false)
  }

  function addHoliday() {
    setForm((f) => ({
      ...f,
      companyHolidays: [
        ...(f.companyHolidays || []),
        { id: `HOL${Date.now()}`, date: '', name: '', isHoliday: true }
      ]
    }))
    setSaved(false)
  }

  function removeHoliday(id) {
    setForm((f) => ({
      ...f,
      companyHolidays: (f.companyHolidays || []).filter((h) => h.id !== id)
    }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    saveSettings(form)
    setSaved(true)
    // Company name shows in the top bar, so refresh to update it everywhere.
    setTimeout(() => window.location.reload(), 600)
  }

  async function detectIp() {
    setDetecting(true)
    const ip = await fetchPublicIp()
    setDetectedIp(ip || 'Could not read the address.')
    setDetecting(false)
  }

  function handleReset() {
    const ok = window.confirm(
      'This will erase all changes and load the sample data again. Continue?'
    )
    if (!ok) return
    resetToSampleData()
    window.location.reload()
  }

  return (
    <div>
      <div className="page-head">
        <h2>Settings</h2>
      </div>

      <form className="card" onSubmit={handleSave}>
        <h3 className="section-title first">Company</h3>
        <label className="field">
          <span>Company name (shown at the top)</span>
          <input
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
          />
        </label>

        <h3 className="section-title">Work timing rules</h3>
        <div className="two-col">
          <label className="field">
            <span>Office start time (shift start)</span>
            <input
              type="time"
              value={form.officeStartTime}
              onChange={(e) => update('officeStartTime', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Late grace period (minutes)</span>
            <input
              type="number"
              min="0"
              max="180"
              value={form.lateGraceMinutes ?? 0}
              onChange={(e) => update('lateGraceMinutes', Number(e.target.value))}
            />
          </label>
        </div>
        <p className="hint">
          Employees are on time until office start plus the grace period. Example:
          start 10:30 with 20 minutes grace → late only after 10:50.
        </p>
        <div className="two-col">
          <label className="field">
            <span>Standard work hours per day</span>
            <input
              type="number"
              min="1"
              max="24"
              value={form.standardWorkHours}
              onChange={(e) => update('standardWorkHours', Number(e.target.value))}
            />
          </label>
          <div />
        </div>

        <h3 className="section-title">Cab timing rules</h3>
        <div className="two-col">
          <label className="field">
            <span>Maximum wait time for employees (minutes)</span>
            <input
              type="number"
              min="0"
              value={form.cabWaitingTime || ''}
              onChange={(e) => update('cabWaitingTime', Number(e.target.value))}
            />
          </label>
          <div />
        </div>

        <h3 className="section-title">Lunch policy</h3>
        <p className="hint first">
          These details are shown to every employee on My Attendance so new joiners
          know where and how long they can take lunch without HR repeating it.
        </p>
        <div className="two-col">
          <label className="field">
            <span>Lunch duration (minutes)</span>
            <input
              type="number"
              min="1"
              max="120"
              value={form.lunchPolicy.durationMinutes}
              onChange={(e) => updateLunchPolicy('durationMinutes', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Allowed lunch window — from</span>
            <input
              type="time"
              value={form.lunchPolicy.startTime}
              onChange={(e) => updateLunchPolicy('startTime', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Allowed lunch window — until</span>
            <input
              type="time"
              value={form.lunchPolicy.endTime}
              onChange={(e) => updateLunchPolicy('endTime', e.target.value)}
            />
          </label>
        </div>
        <label className="field">
          <span>Where employees may have lunch</span>
          <textarea
            className="reply-input"
            rows={3}
            value={form.lunchPolicy.place}
            onChange={(e) => updateLunchPolicy('place', e.target.value)}
            placeholder="e.g. Company cafeteria, 2nd floor. Lunch at your desk is not allowed."
          />
        </label>
        <label className="field">
          <span>Additional notes (optional)</span>
          <textarea
            className="reply-input"
            rows={2}
            value={form.lunchPolicy.notes}
            onChange={(e) => updateLunchPolicy('notes', e.target.value)}
            placeholder="Any other lunch rules employees should follow"
          />
        </label>

        <h3 className="section-title">Leave allowance (per year)</h3>
        <p className="hint first">
          Paid-leave days given to every employee each year. Unpaid leave has
          no limit.
        </p>
        <div className="two-col">
          <label className="field">
            <span>Casual leave days</span>
            <input
              type="number"
              min="0"
              value={form.leaveAllowance.casual}
              onChange={(e) => updateLeaveAllowance('casual', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Sick leave days</span>
            <input
              type="number"
              min="0"
              value={form.leaveAllowance.sick}
              onChange={(e) => updateLeaveAllowance('sick', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Earned leave days</span>
            <input
              type="number"
              min="0"
              value={form.leaveAllowance.earned}
              onChange={(e) => updateLeaveAllowance('earned', e.target.value)}
            />
          </label>
        </div>

        <h3 className="section-title">Company holidays</h3>
        <p className="hint first">
          List dates that may be public holidays or special occasions. Tick
          <strong> Company holiday</strong> only for days when employees get a
          day off. Unticked dates are shown here for reference but employees may
          still be expected to work.
        </p>
        <table className="table" style={{ marginTop: '12px' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Occasion</th>
              <th>Company holiday</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(form.companyHolidays || []).length === 0 && (
              <tr>
                <td colSpan={4} className="muted">No dates added yet.</td>
              </tr>
            )}
            {(form.companyHolidays || []).map((h) => (
              <tr key={h.id}>
                <td>
                  <input
                    type="date"
                    value={h.date}
                    onChange={(e) => updateHoliday(h.id, 'date', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={h.name}
                    onChange={(e) => updateHoliday(h.id, 'name', e.target.value)}
                    placeholder="e.g. Independence Day"
                  />
                </td>
                <td>
                  <label className="checkbox-row" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={!!h.isHoliday}
                      onChange={(e) => updateHoliday(h.id, 'isHoliday', e.target.checked)}
                    />
                    <span>Day off for employees</span>
                  </label>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-tiny btn-light"
                    onClick={() => removeHoliday(h.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="button-row">
          <button type="button" className="btn btn-light btn-tiny" onClick={addHoliday}>
            Add date
          </button>
        </div>

        <h3 className="section-title">Office internet check</h3>
        <p className="hint first">
          This confirms a person is really in the office. When someone marks
          attendance, the app checks that their internet address matches the
          office address below.
        </p>

        <label className="field">
          <span>Office internet address (IP)</span>
          <input
            value={form.officeIp}
            onChange={(e) => update('officeIp', e.target.value)}
            placeholder="e.g. 103.25.xx.xx"
          />
        </label>

        <div className="detect-row">
          <button type="button" className="btn btn-light" onClick={detectIp} disabled={detecting}>
            {detecting ? 'Checking...' : 'Show this computer\u2019s address'}
          </button>
          {detectedIp && (
            <span className="detected">
              This computer: <code>{detectedIp}</code>
              {detectedIp && !detectedIp.startsWith('Could') && (
                <button
                  type="button"
                  className="btn btn-tiny"
                  onClick={() => update('officeIp', detectedIp)}
                >
                  Use this
                </button>
              )}
            </span>
          )}
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.pretendOnOfficeNetwork}
            onChange={(e) => update('pretendOnOfficeNetwork', e.target.checked)}
          />
          <span>
            <strong>Test mode:</strong> skip the office-internet check
            (turn this OFF in the real office once the address above is set).
          </span>
        </label>

        <div className="button-row">
          <button className="btn btn-primary" type="submit">Save settings</button>
          {saved && <span className="saved-note">Saved!</span>}
        </div>
      </form>

      <h3 className="section-title">Testing tools</h3>
      <div className="card">
        <p className="hint first">
          Load the built-in sample employees and attendance again. Use this if
          you changed the data while testing and want a clean start.
        </p>
        <button className="btn btn-danger" onClick={handleReset}>
          Reset to sample data
        </button>
      </div>
    </div>
  )
}
