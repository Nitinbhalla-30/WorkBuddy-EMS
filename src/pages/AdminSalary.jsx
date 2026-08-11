import { useMemo, useState } from 'react'
import {
  getAttendance,
  getEmployees,
  getLeaves,
  getSettings,
  updateEmployeeSalary
} from '../data/store.js'
import Payslip from '../components/Payslip.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { useTableControls } from '../hooks/useTableControls.js'
import {
  computeSalary,
  formatRupees,
  listRecentMonths,
  monthKey
} from '../utils/salary.js'

// HR/Admin salary screen: everyone's pay for a month, edit structure, view slip.
export default function AdminSalary() {
  const months = useMemo(() => listRecentMonths(6), [])
  const [selected, setSelected] = useState(() => monthKey())
  const [viewId, setViewId] = useState(null)   // employee whose slip is open
  const [editId, setEditId] = useState(null)   // employee being edited
  const [form, setForm] = useState(null)
  const [refresh, setRefresh] = useState(0)     // bump to recompute after save

  const employees = useMemo(
    () => getEmployees().filter((e) => e.role === 'employee'),
    [refresh]
  )

  const allRows = useMemo(() => {
    const attendance = getAttendance()
    const leaves = getLeaves()
    const settings = getSettings()
    return employees.map((emp) => ({
      emp,
      calc: computeSalary(emp, selected, { attendance, leaves, settings })
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, selected, refresh])

  const table = useTableControls(allRows, {
    getSearchText: ({ emp, calc }) =>
      [emp.name, emp.id, emp.department, calc.gross, calc.lopDays, calc.netPay].join(' '),
    getSortValue: ({ emp, calc }, key) => {
      if (key === 'employee') return emp.name
      if (key === 'gross') return calc.gross
      if (key === 'lopDays') return calc.lopDays
      if (key === 'deductions') return calc.lopDeduction + calc.totalDeductions
      if (key === 'netPay') return calc.netPay
      return ''
    },
    initialSortKey: 'employee',
    initialSortDir: 'asc'
  })

  const totalNet = table.rows.reduce((sum, r) => sum + r.calc.netPay, 0)

  function startEdit(emp) {
    setEditId(emp.id)
    setViewId(null)
    setForm({ ...emp.salary })
  }

  function saveEdit() {
    updateEmployeeSalary(editId, {
      basic: Number(form.basic) || 0,
      hra: Number(form.hra) || 0,
      other: Number(form.other) || 0,
      tdsMonthly: Number(form.tdsMonthly) || 0
    })
    setEditId(null)
    setForm(null)
    setRefresh((n) => n + 1)
  }

  const viewRow = allRows.find((r) => r.emp.id === viewId)

  return (
    <div>
      <div className="page-head">
        <h2>Salaries</h2>
        <label className="field inline">
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {months.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search employees..."
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Gross" keyName="gross" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="LOP days" keyName="lopDays" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Deductions" keyName="deductions" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Net pay" keyName="netPay" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr><td colSpan={6} className="muted">No employees match your search.</td></tr>
            )}
            {table.rows.map(({ emp, calc }) => (
              <tr key={emp.id}>
                <td>
                  <strong>{emp.name}</strong>
                  <div className="muted small">{emp.department}</div>
                </td>
                <td>{formatRupees(calc.gross)}</td>
                <td>{calc.lopDays}</td>
                <td>{formatRupees(calc.lopDeduction + calc.totalDeductions)}</td>
                <td><strong>{formatRupees(calc.netPay)}</strong></td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-tiny" onClick={() => { setViewId(emp.id); setEditId(null) }}>
                      View slip
                    </button>
                    <button className="btn btn-tiny btn-light" onClick={() => startEdit(emp)}>
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" style={{ textAlign: 'right' }}><strong>Total net pay</strong></td>
              <td colSpan="2"><strong>{formatRupees(totalNet)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Edit salary structure */}
      {editId && form && (
        <div className="card">
          <h3 className="section-title first">Edit salary — {editId}</h3>
          <div className="two-col">
            <label className="field">
              <span>Basic</span>
              <input type="number" min="0" value={form.basic}
                onChange={(e) => setForm({ ...form, basic: e.target.value })} />
            </label>
            <label className="field">
              <span>HRA</span>
              <input type="number" min="0" value={form.hra}
                onChange={(e) => setForm({ ...form, hra: e.target.value })} />
            </label>
          </div>
          <div className="two-col">
            <label className="field">
              <span>Other allowances</span>
              <input type="number" min="0" value={form.other}
                onChange={(e) => setForm({ ...form, other: e.target.value })} />
            </label>
            <label className="field">
              <span>TDS per month</span>
              <input type="number" min="0" value={form.tdsMonthly}
                onChange={(e) => setForm({ ...form, tdsMonthly: e.target.value })} />
            </label>
          </div>
          <div className="button-row">
            <button className="btn btn-primary" onClick={saveEdit}>Save salary</button>
            <button className="btn btn-light" onClick={() => { setEditId(null); setForm(null) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View one slip */}
      {viewRow && (
        <div className="card">
          <Payslip employee={viewRow.emp} monthKey={selected} calc={viewRow.calc} />
          <div className="button-row">
            <button className="btn btn-light" onClick={() => setViewId(null)}>Close slip</button>
          </div>
        </div>
      )}

      <p className="hint">
        Delhi has no Professional Tax, so it is not deducted. TDS here is a simple
        fixed amount per employee; full income-tax slab calculation can be added
        later.
      </p>
    </div>
  )
}
