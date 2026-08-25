import { useState } from 'react'
import {
  getSettings,
  saveSettings
} from '../data/store.js'
import { fetchPublicIp } from '../utils/network.js'
import Modal from '../components/Modal.jsx'
import TimeInput from '../components/TimeInput.jsx'
import { Building2, Clock, Car, Coffee, CalendarDays, Shield, Wifi, Plus, Trash2, Check, Inbox, Settings as SettingsIcon, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

// HR/Admin settings: branding, timing rules, and the office-internet check.
export default function Settings() {
  const [form, setForm] = useState(() => getSettings())
  const [saved, setSaved] = useState(false)
  const [detectedIp, setDetectedIp] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [deleteHolidayId, setDeleteHolidayId] = useState(null)

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
    setDeleteHolidayId(id)
  }

  function confirmDeleteHoliday() {
    if (!deleteHolidayId) return
    setForm((f) => ({
      ...f,
      companyHolidays: (f.companyHolidays || []).filter((h) => h.id !== deleteHolidayId)
    }))
    setDeleteHolidayId(null)
    setSaved(false)
  }

  function cancelDeleteHoliday() {
    setDeleteHolidayId(null)
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

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <SettingsIcon size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Settings
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Configure company-wide rules and preferences</p>
        </div>
      </div>

      <form className="card" onSubmit={handleSave}>
        <h3 className="section-title first">
          <Building2 size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Company
        </h3>
        <label className="field">
          <span>Company name (shown at the top)</span>
          <input
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
          />
        </label>

        <h3 className="section-title">
          <Clock size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Work timing rules
        </h3>
        <div className="two-col">
          <label className="field">
            <span>Office start time (shift start)</span>
            <TimeInput
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
          Employees are considered on time until the office start time plus the grace period.
          For example: start at 10:30 with 20 minutes grace &rarr; marked late only after 10:50.
        </p>
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

        <h3 className="section-title">
          <Car size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Cab service rules
        </h3>
        <label className="field">
          <span>Monthly cab service charge per employee (₹)</span>
          <input
            type="number"
            min="0"
            step="50"
            value={form.cabMonthlyCharge ?? 0}
            onChange={(e) => update('cabMonthlyCharge', Number(e.target.value))}
          />
        </label>
        <p className="hint">
          Employees who opt in to the company cab service will see this amount in
          My Details and must confirm it before their profile can be submitted.
          Set to 0 to offer the cab service free of charge.
        </p>
        <label className="field">
          <span>Maximum wait time for employees (minutes)</span>
          <input
            type="number"
            min="0"
            value={form.cabWaitingTime || ''}
            onChange={(e) => update('cabWaitingTime', Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>Today&rsquo;s cab changes close (hours before shift start / end)</span>
          <input
            type="number"
            min="0"
            max="12"
            value={form.cabTodayCutoffHours ?? 3}
            onChange={(e) => update('cabTodayCutoffHours', Number(e.target.value))}
          />
        </label>
        <p className="hint">
          Employees can skip or restore today&rsquo;s pickup until this many hours
          before their shift starts, and today&rsquo;s drop until this many hours
          before their shift ends. After that, the buttons are locked to give drivers
          enough time to plan their routes. For example: 3 hours with a 09:30
          shift start &rarr; changes lock at 06:30 AM.
        </p>

        <h3 className="section-title">
          <Coffee size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Lunch policy
        </h3>
        <p className="hint first">
          These details are shown to every employee on their My Attendance page so that new joiners
          know where and how long they can take their lunch break.
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
            <TimeInput
              value={form.lunchPolicy.startTime}
              onChange={(e) => updateLunchPolicy('startTime', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Allowed lunch window — until</span>
            <TimeInput
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

        <h3 className="section-title">
          <CalendarDays size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Leave allowance (per year)
        </h3>
        <p className="hint first">
          The number of paid-leave days given to every employee each year. Half-day and short
          leave each count as one request. Unpaid
          leave has no limit.
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
          <label className="field">
            <span>Half day leaves</span>
            <input
              type="number"
              min="0"
              value={form.leaveAllowance.halfday}
              onChange={(e) => updateLeaveAllowance('halfday', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Short leaves</span>
            <input
              type="number"
              min="0"
              value={form.leaveAllowance.short}
              onChange={(e) => updateLeaveAllowance('short', e.target.value)}
            />
          </label>
        </div>

        <h3 className="section-title">
          <Shield size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Approval rules
        </h3>
        <p className="hint first">
          Employees can apply for paid leave only after their probation period
          ends and while they have remaining balance. New paid-leave requests and
          overtime requests go to the employee&rsquo;s manager first; if the manager
          does not respond within the number of days set below, the request is
          forwarded to HR automatically for final approval.
        </p>
        <div className="two-col">
          <label className="field">
            <span>Probation period (months)</span>
            <input
              type="number"
              min="0"
              value={form.probationMonths}
              onChange={(e) => update('probationMonths', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Days for manager to respond to leaves</span>
            <input
              type="number"
              min="0"
              value={form.leaveManagerDays}
              onChange={(e) => update('leaveManagerDays', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Days for manager to respond to overtime</span>
            <input
              type="number"
              min="0"
              value={form.overtimeManagerDays ?? 2}
              onChange={(e) => update('overtimeManagerDays', Number(e.target.value))}
            />
          </label>
        </div>

        <h3 className="section-title">
          <CalendarDays size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Company holidays
        </h3>
        <p className="hint first">
          Add dates that may be public holidays or special occasions. Tick
          <strong> Company holiday</strong> only for days when employees get a
          day off. Unticked dates are shown here for reference but employees are
          expected to work as usual.
        </p>
        <table className="table" style={{ marginTop: '12px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '155px' }} />
            <col style={{ width: '300px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '50px' }} />
          </colgroup>
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
              <TableEmpty colSpan={4} message="No dates added yet." icon={Inbox} />
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
                  <label className="checkbox-row" style={{ margin: 0, whiteSpace: 'nowrap', justifyContent: 'flex-start' }}>
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
                    aria-label={`Remove ${h.name || 'holiday'}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="button-row">
          <button type="button" className="btn btn-light btn-tiny" onClick={addHoliday}>
            <Plus size={14} style={{ marginRight: 4 }} aria-hidden="true" /> Add date
          </button>
        </div>

        <h3 className="section-title">
          <Wifi size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
          Office internet check
        </h3>
        <p className="hint first">
          This confirms that a person is actually at the office. When someone marks
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
            <Wifi size={14} style={{ marginRight: 6 }} aria-hidden="true" />
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
                  <Check size={13} style={{ marginRight: 3 }} aria-hidden="true" /> Use this
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
          <button className="btn btn-primary" type="submit">
            <Check size={15} style={{ marginRight: 6 }} aria-hidden="true" /> Save settings
          </button>
          {saved && <span className="saved-note">Saved!</span>}
        </div>
      </form>

      {deleteHolidayId && (
        <Modal onClose={cancelDeleteHoliday} title="Confirm Delete">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Delete</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={cancelDeleteHoliday} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will permanently delete the holiday entry. You will not be able to restore it.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmDeleteHoliday}>
                Delete
              </button>
              <button type="button" className="btn btn-light" onClick={cancelDeleteHoliday}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
