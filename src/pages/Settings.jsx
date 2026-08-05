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
            <span>Office start time (after this = Late)</span>
            <input
              type="time"
              value={form.officeStartTime}
              onChange={(e) => update('officeStartTime', e.target.value)}
            />
          </label>
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
        </div>

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
