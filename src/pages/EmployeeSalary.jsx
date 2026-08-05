import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getAttendance, getLeaves, getSettings } from '../data/store.js'
import Payslip from '../components/Payslip.jsx'
import {
  computeSalary,
  listRecentMonths,
  monthKey
} from '../utils/salary.js'

// The employee's own salary slip, with a month picker.
export default function EmployeeSalary() {
  const { user } = useAuth()
  const months = useMemo(() => listRecentMonths(6), [])
  const [selected, setSelected] = useState(() => monthKey())

  const calc = useMemo(() => {
    return computeSalary(user, selected, {
      attendance: getAttendance(),
      leaves: getLeaves(),
      settings: getSettings()
    })
  }, [user, selected])

  return (
    <div>
      <div className="page-head">
        <h2>My Salary</h2>
        <label className="field inline">
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {months.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="card">
        <Payslip employee={user} monthKey={selected} calc={calc} />
      </div>

      <p className="hint">
        This is based on your attendance and approved leaves. Absent days and
        approved unpaid leave reduce the pay. The current month is counted up to
        yesterday, since today is still going on.
      </p>
    </div>
  )
}
