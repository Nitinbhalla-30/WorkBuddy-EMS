import { useEffect, useMemo, useState } from 'react'
import {
  getAttendance,
  getEmployees,
  getLeaves,
  getSettings,
  updateEmployeeSalary
} from '../data/store.js'
import Payslip from '../components/Payslip.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'
import { downloadExcelXlsx } from '../utils/exportExcel.js'
import {
  computeSalary,
  formatRupees,
  listRecentMonths,
  monthKey
} from '../utils/salary.js'
import { Download, MoreHorizontal, Banknote, X } from 'lucide-react'
import TableEmpty from '../components/TableEmpty.jsx'

// HR/Admin salary screen: everyone's pay for a month, edit structure, view slip.
export default function AdminSalary() {
  const months = useMemo(() => listRecentMonths(6), [])
  const [selected, setSelected] = useState(() => monthKey())
  const [viewId, setViewId] = useState(null)   // employee whose slip is open
  const [editId, setEditId] = useState(null)   // employee being edited
  const [form, setForm] = useState(null)
  const [refresh, setRefresh] = useState(0)     // bump to recompute after save
  const [openMenuId, setOpenMenuId] = useState(null)

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

  const EMPLOYEE_FILTER_OPTS = useMemo(
    () => [
      { value: 'all', label: 'All employees' },
      ...employees.map((e) => ({ value: e.id, label: e.name }))
    ],
    [employees]
  )

  const DEPARTMENT_FILTER_OPTS = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department))]
    return [
      { value: 'all', label: 'All departments' },
      ...departments.map((d) => ({ value: d, label: d }))
    ]
  }, [employees])

  const table = useTableControls(allRows, {
    getSearchText: ({ emp, calc }) =>
      [emp.name, emp.id, emp.department, calc.gross, calc.lopDays, calc.netPay].join(' '),
    getSortValue: ({ emp, calc }, key) => {
      if (key === 'id') return emp.id
      if (key === 'employee') return emp.name
      if (key === 'month') return selected
      if (key === 'gross') return calc.gross
      if (key === 'lopDays') return calc.lopDays
      if (key === 'deductions') return calc.lopDeduction + calc.totalDeductions
      if (key === 'netPay') return calc.netPay
      return ''
    },
    initialSortKey: 'id',
    initialSortDir: 'asc',
    filterFns: {
      employee: ({ emp }, val) => emp.id === val,
      department: ({ emp }, val) => emp.department === val
    }
  })
  const {
    items: rowsPage,
    page: pageNum,
    totalPages,
    total,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows)

  const totalNet = table.rows.reduce((sum, r) => sum + r.calc.netPay, 0)

  function toggleMenu(empId) {
    setOpenMenuId(openMenuId === empId ? null : empId)
  }

  function closeMenu() {
    setOpenMenuId(null)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

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
  const selectedMonthLabel = months.find((m) => m.key === selected)?.label || selected

  function exportSalariesExcel() {
    const headers = [
      'Employee ID',
      'Employee',
      'Department',
      'Month',
      'Gross',
      'LOP days',
      'Deductions',
      'Net pay'
    ]
    const rows = table.rows.map(({ emp, calc }) => [
      emp.id,
      emp.name,
      emp.department || '',
      selectedMonthLabel,
      calc.gross,
      calc.lopDays,
      calc.lopDeduction + calc.totalDeductions,
      calc.netPay
    ])
    downloadExcelXlsx(`salaries-${selected}`, headers, rows)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Banknote size={20} style={{ opacity: 0.7, marginRight: 8, flexShrink: 0 }} />Salaries
          </h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Monthly payroll, salary structure, and payslips</p>
        </div>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search employees..."
          filters={[
            {
              key: 'employee',
              label: 'Employee',
              value: table.filters.employee || 'all',
              options: EMPLOYEE_FILTER_OPTS
            },
            {
              key: 'department',
              label: 'Department',
              value: table.filters.department || 'all',
              options: DEPARTMENT_FILTER_OPTS
            },
            {
              key: 'month',
              label: 'Month',
              value: selected,
              options: months.map((m) => ({ value: m.key, label: m.label }))
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'month') {
              setSelected(val)
            } else {
              table.setFilter(key, val)
            }
          }}
          actions={
            <button
              type="button"
              className="btn btn-primary btn-tiny"
              onClick={exportSalariesExcel}
              disabled={table.rows.length === 0}
            >
              <Download size={14} style={{ marginRight: 4 }} />Export to Excel
            </button>
          }
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh label="Employee ID" keyName="id" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Employee" keyName="employee" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Month" keyName="month" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Gross" keyName="gross" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="LOP days" keyName="lopDays" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Deductions" keyName="deductions" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Net pay" keyName="netPay" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty colSpan={8} message="No employees match your filters." />
            )}
            {rowsPage.map(({ emp, calc }) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>
                  <strong>{emp.name}</strong>
                  <div className="muted small">{emp.department}</div>
                </td>
                <td>{selectedMonthLabel}</td>
                <td>{formatRupees(calc.gross)}</td>
                <td>{calc.lopDays}</td>
                <td>{formatRupees(calc.lopDeduction + calc.totalDeductions)}</td>
                <td><strong>{formatRupees(calc.netPay)}</strong></td>
                <td>
                  <div className="task-menu-container">
                    <button
                      type="button"
                      className="btn btn-tiny btn-light task-menu-button"
                      onClick={() => toggleMenu(emp.id)}
                      aria-label="Employee actions"
                     ><MoreHorizontal size={16} /></button>
                    {openMenuId === emp.id && (
                      <div className="task-menu-dropdown">
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            setViewId(emp.id)
                            setEditId(null)
                            closeMenu()
                          }}
                        >
                          View payslip
                        </button>
                        <button
                          type="button"
                          className="task-menu-item"
                          onClick={() => {
                            startEdit(emp)
                            closeMenu()
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="6" style={{ textAlign: 'right' }}><strong>Total net pay</strong></td>
              <td colSpan="2"><strong>{formatRupees(totalNet)}</strong></td>
            </tr>
          </tbody>
        </table>
        <Pagination
          page={pageNum}
          totalPages={totalPages}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </div>

      {/* Edit salary structure */}
      {editId && form && (
        <Modal onClose={() => { setEditId(null); setForm(null) }} title={`Edit salary — ${editId}`}>
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Edit salary — {editId}</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => { setEditId(null); setForm(null) }}
               aria-label="Close"><X size={15} /></button>
            </div>
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
        </Modal>
      )}

      {/* View one slip */}
      {viewRow && (
        <Modal onClose={() => setViewId(null)} title={`Payslip — ${viewRow.emp.name}`}>
          <div className="modal-form modal-form-wide">
            <div className="modal-header">
              <h3 className="section-title first">Payslip — {viewRow.emp.name}</h3>
              <button
                type="button"
                className="btn btn-tiny btn-light"
                onClick={() => setViewId(null)}
               aria-label="Close"><X size={15} /></button>
            </div>
            <Payslip employee={viewRow.emp} monthKey={selected} calc={viewRow.calc} />
            <div className="button-row">
              <button className="btn btn-light" onClick={() => setViewId(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      <p className="hint">
        Delhi does not have Professional Tax, so it is not deducted. TDS is currently a simple
        fixed amount per employee. Full income-tax slab calculation can be added in a future update.
      </p>
    </div>
  )
}
