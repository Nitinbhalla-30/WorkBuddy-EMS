import { useMemo, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getAttendance, getLeaves, getSettings } from '../data/store.js'
import Payslip from '../components/Payslip.jsx'
import {
  computeSalary,
  listRecentMonths,
  monthKey
} from '../utils/salary.js'
import html2pdf from 'html2pdf.js'

// The employee's own salary slip, with a month picker. The current month
// is not offered because its slip is only finalized once the month ends.
export default function EmployeeSalary() {
  const { user } = useAuth()
  const months = useMemo(
    () => listRecentMonths(7).filter((m) => m.key !== monthKey()),
    []
  )
  const [selected, setSelected] = useState(() => {
    const lastMonth = new Date()
    lastMonth.setDate(1)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return monthKey(lastMonth)
  })
  const payslipRef = useRef(null)

  const calc = useMemo(() => {
    return computeSalary(user, selected, {
      attendance: getAttendance(),
      leaves: getLeaves(),
      settings: getSettings()
    })
  }, [user, selected])

  function downloadPDF() {
    const element = payslipRef.current
    if (!element) return

    const opt = {
      margin: 0.5,
      filename: `payslip_${user.id}_${selected}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <div>
      <div className="page-head">
        <h2>My Salary</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label className="field inline">
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {months.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary btn-tiny" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>
      </div>

      <div className="card" ref={payslipRef}>
        <Payslip employee={user} monthKey={selected} calc={calc} />
      </div>

      <p className="hint">
        This is based on your attendance and approved leaves. Absent days and
        approved unpaid leave reduce the pay. The current month is not listed
        because its salary slip is only finalized after the month ends.
      </p>
    </div>
  )
}
