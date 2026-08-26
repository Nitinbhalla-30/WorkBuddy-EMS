import { getSettings } from '../data/store.js'
import { formatRupees, monthLabel } from '../utils/salary.js'

// A printable-looking salary slip for one employee and one month.
// `calc` is the object returned by computeSalary().
export default function Payslip({ employee, monthKey, calc }) {
  const settings = getSettings()

  const earnings = [
    { label: 'Basic', value: calc.basic },
    { label: 'HRA', value: calc.hra },
    { label: 'Other allowances', value: calc.other }
  ]

  if (calc.overtimePay > 0) {
    earnings.push({
      label: `Overtime (${calc.overtimeHours}h @ 2x rate)`,
      value: calc.overtimePay
    })
  }

  const deductions = [
    { label: `Provident Fund (${settings.salary.pfPercent}% of Basic)`, value: calc.pf },
    {
      label: calc.esiApplicable
        ? `ESI (${settings.salary.esiPercent}% of earned)`
        : 'ESI (not applicable)',
      value: calc.esi
    },
    { label: 'TDS', value: calc.tds }
  ]

  if (calc.lopDeduction > 0) {
    deductions.unshift({
      label: `Loss of pay (${calc.lopDays} day(s))`,
      value: calc.lopDeduction
    })
  }

  return (
    <div className="payslip">
      <div className="payslip-head">
        <div>
          <div className="payslip-company">{settings.companyName}</div>
          <div className="muted small">Salary slip — {monthLabel(monthKey)}</div>
        </div>
        <div className="payslip-emp">
          <strong>{employee.name}</strong>
          <div className="muted small">{employee.id} · {employee.department}</div>
        </div>
      </div>

      <div className="payslip-days">
        <span>Days in month: <strong>{calc.daysInMonth}</strong></span>
        <span>Present: <strong>{calc.presentDays}</strong></span>
        <span>Paid leave: <strong>{calc.paidLeaveDays}</strong></span>
        <span>Loss of pay: <strong>{calc.lopDays}</strong></span>
      </div>

      <div className="payslip-cols">
        <div className="payslip-col">
          <div className="payslip-col-title">Earnings</div>
          {earnings.map((row) => (
            <div className="payslip-row" key={row.label}>
              <span>{row.label}</span>
              <span>{formatRupees(row.value)}</span>
            </div>
          ))}
          <div className="payslip-row total">
            <span>Gross</span>
            <span>{formatRupees(calc.gross + calc.overtimePay)}</span>
          </div>
        </div>

        <div className="payslip-col">
          <div className="payslip-col-title">Deductions</div>
          {deductions.map((row) => (
            <div className="payslip-row" key={row.label}>
              <span>{row.label}</span>
              <span>{formatRupees(row.value)}</span>
            </div>
          ))}
          <div className="payslip-row total">
            <span>Total deductions</span>
            <span>{formatRupees(calc.lopDeduction + calc.totalDeductions)}</span>
          </div>
        </div>
      </div>

      <div className="payslip-net">
        <span>Net pay</span>
        <span>{formatRupees(calc.netPay)}</span>
      </div>

      <div className="payslip-footer">
        <div className="payslip-signature">
          *Signature not required because this is a system-generated document*
        </div>
      </div>
    </div>
  )
}
