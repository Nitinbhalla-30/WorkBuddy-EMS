import { useEffect, useMemo, useState } from 'react'
import {
  Ban,
  CalendarHeart,
  MoreVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
  X
} from 'lucide-react'
import {
  createCelebrationEvent,
  deleteCelebrationEvent,
  setSystemCelebrationHidden,
  updateCelebrationEvent
} from '../data/store.js'
import { CELEBRATION_EVENT_TYPES } from '../data/celebrationsData.js'
import { canManageCelebrations, celebrationKindLabel, systemCalendarRowsForYear } from '../utils/celebrations.js'
import { formatDate, todayDateKey } from '../utils/attendance.js'
import TableToolbar from '../components/TableToolbar.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableEmpty from '../components/TableEmpty.jsx'
import Pagination from '../components/Pagination.jsx'
import Modal from '../components/Modal.jsx'
import { useTableControls } from '../hooks/useTableControls.js'
import { usePagination } from '../hooks/usePagination.js'

const KIND_OPTS = [
  { value: 'all', label: 'All categories' },
  ...CELEBRATION_EVENT_TYPES.map((t) => ({ value: t.key, label: t.label }))
]

const BLANK_FORM = {
  name: '',
  kind: 'occasion',
  date: '',
  greeting: '',
  message: '',
  recurring: false
}

// HR/Admin only. Two jobs: keep the company's own occasions, and decide which
// entries of the built-in festival calendar this office actually observes.
// Everything else on the Celebrations page is derived and needs no managing.
export default function CelebrationAdminPanel({ user, settings, events, onChanged }) {
  const [denied, setDenied] = useState(false)

  // ---- company occasions ----
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState(BLANK_FORM)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)

  const table = useTableControls(events || [], {
    getSearchText: (ev) => [ev.name, ev.greeting, ev.message, ev.date].join(' '),
    initialSortKey: 'date',
    initialSortDir: 'desc',
    filterFns: { kind: (ev, val) => (ev.kind || 'occasion') === val }
  })
  const {
    items: pageRows,
    page: pageNum,
    totalPages,
    total: pageCount,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows)

  // ---- system calendar ----
  const thisYear = Number(todayDateKey().slice(0, 4))
  const [year, setYear] = useState(thisYear)
  const hiddenIds = useMemo(
    () => new Set(settings?.celebrationsHiddenSlots || []),
    [settings]
  )
  const calendarRows = useMemo(
    // includeUndated: a festival with no date yet for this year stays in the
    // list so it is visibly waiting, instead of looking like it was removed.
    () => systemCalendarRowsForYear(year, { includeUndated: true }),
    [year]
  )
  const calendar = useTableControls(calendarRows, {
    getSearchText: (row) => [row.name, row.kind].join(' '),
    initialSortKey: 'date',
    initialSortDir: 'asc',
    filterFns: { kind: (row, val) => row.kind === val }
  })

  function closeForm() {
    setShowForm(false)
    setEditId(null)
    setFormData(BLANK_FORM)
  }

  function openNew() {
    setEditId(null)
    setFormData(BLANK_FORM)
    setShowForm(true)
  }

  function openEdit(ev) {
    setEditId(ev.id)
    setFormData({
      name: ev.name || '',
      kind: ev.kind || 'occasion',
      date: ev.date || '',
      greeting: ev.greeting || '',
      message: ev.message || '',
      recurring: !!ev.recurring
    })
    setShowForm(true)
  }

  // Every write goes through the store, which re-checks the role before it
  // changes anything and returns null when the caller may not. A null here
  // therefore means the user is not allowed, not that the save failed quietly.
  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.date) return
    const patch = {
      name: formData.name.trim(),
      kind: formData.kind,
      date: formData.date,
      greeting: formData.greeting.trim(),
      message: formData.message.trim(),
      recurring: formData.recurring
    }
    const result = editId
      ? updateCelebrationEvent(editId, patch, user)
      : createCelebrationEvent(patch, user)
    if (!result) {
      setDenied(true)
      return
    }
    setDenied(false)
    closeForm()
    onChanged?.()
  }

  function confirmDelete() {
    if (!deleteRow) return
    const result = deleteCelebrationEvent(deleteRow.id, user)
    setDeleteRow(null)
    if (result === null) {
      setDenied(true)
      return
    }
    setDenied(false)
    onChanged?.()
  }

  function toggleVisible(row) {
    // This one reports the current list either way, so the check is made here
    // as well — the store still refuses the write on its own.
    if (!canManageCelebrations(user)) {
      setDenied(true)
      return
    }
    setSystemCelebrationHidden(row.id, !hiddenIds.has(row.id), user)
    setDenied(false)
    onChanged?.()
  }

  function handleCalendarFilter(key, value) {
    // The year is its own control rather than a table filter: it changes which
    // rows exist at all, and clearing filters should not jump back a year.
    if (key === 'year') setYear(Number(value))
    else calendar.setFilter(key, value)
  }

  // Close row menus on an outside click, like the other tables.
  useEffect(() => {
    function handleClickOutside(event) {
      if (openMenuId && !event.target.closest('.task-menu-container')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  return (
    <div className="celebration-admin">
      {denied && (
        <p className="error-box" role="alert">
          Your account cannot change the celebration calendar. Ask an HR admin to
          make this update.
        </p>
      )}

      <div className="card">
        <div className="section-head-row">
          <h3 className="section-title first">
            <Sparkles size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
            Company occasions
          </h3>
          <span className="muted small">{pageCount} total</span>
        </div>
        <p className="hint first">
          Add the days that belong to this company alone — foundation day, a
          branch opening, an annual get-together. They appear on the Celebrations
          page for everyone on the dates you set.
        </p>

        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          showing={table.count}
          total={table.total}
          placeholder="Search occasions..."
          filters={[
            { key: 'kind', label: 'Category', value: table.filters.kind || 'all', options: KIND_OPTS }
          ]}
          onFilterChange={table.setFilter}
          actions={
            <button type="button" className="btn btn-primary btn-tiny" onClick={openNew}>
              <Plus size={14} style={{ marginRight: 4 }} aria-hidden="true" />
              New occasion
            </button>
          }
        />

        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '22%' }} /> {/* Occasion */}
            <col style={{ width: '15%' }} /> {/* Category */}
            <col style={{ width: '14%' }} /> {/* Date */}
            <col style={{ width: '11%' }} /> {/* Repeats */}
            <col style={{ width: '26%' }} /> {/* Greeting */}
            <col style={{ width: '12%' }} /> {/* Added by */}
            <col style={{ width: '8%' }} />  {/* Actions */}
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Occasion" keyName="name" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Category" keyName="kind" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortableTh label="Date" keyName="date" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <th>Repeats</th>
              <th>Greeting</th>
              <th>Added by</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <TableEmpty
                colSpan={7}
                message={(table.total || 0) === 0
                  ? 'No company occasions yet. Add one and everyone will see it on the Celebrations page.'
                  : 'No occasions match your filters.'}
                icon={Sparkles}
              />
            )}
            {pageRows.map((ev) => {
              const dateLabel = ev.date ? formatDate(ev.date) : '—'
              return (
                <tr key={ev.id}>
                  <td className="cell-ellipsis" title={ev.name}>
                    <strong>{ev.name}</strong>
                  </td>
                  <td>
                    <span className="tag">{celebrationKindLabel(ev.kind)}</span>
                  </td>
                  <td className="cell-ellipsis" title={dateLabel}>{dateLabel}</td>
                  <td>{ev.recurring ? 'Every year' : 'Once'}</td>
                  <td className="cell-ellipsis" title={ev.greeting || ev.message || ''}>
                    {ev.greeting || ev.message || <span className="muted">—</span>}
                  </td>
                  <td className="cell-ellipsis" title={formatDate(ev.createdOn)}>
                    {formatDate(ev.createdOn)}
                  </td>
                  <td>
                    <div className="task-menu-container">
                      <button
                        type="button"
                        className="btn btn-tiny btn-light task-menu-button"
                        onClick={() => setOpenMenuId(openMenuId === ev.id ? null : ev.id)}
                        aria-label="Occasion actions"
                      ><MoreVertical size={16} /></button>
                      {openMenuId === ev.id && (
                        <div className="task-menu-dropdown">
                          <button
                            type="button"
                            className="task-menu-item"
                            onClick={() => {
                              openEdit(ev)
                              setOpenMenuId(null)
                            }}
                          >
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="task-menu-item task-menu-item-danger"
                            onClick={() => {
                              setDeleteRow(ev)
                              setOpenMenuId(null)
                            }}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination
          page={pageNum}
          totalPages={totalPages}
          total={pageCount}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </div>

      <div className="card">
        <div className="section-head-row">
          <h3 className="section-title first">
            <CalendarHeart size={15} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }} aria-hidden="true" />
            Company calendar
          </h3>
          <span className="muted small">{calendar.count} of {calendar.total}</span>
        </div>
        <p className="hint first">
          Festivals and national days the app already knows about. Hide the ones
          this office does not celebrate — the setting applies in every year, not
          just the one shown. Movable festivals carry dates for the years the
          government has published; a year showing <strong>No date yet</strong>{' '}
          means the date is not confirmed, and you can add it as a company
          occasion until the calendar is updated.
        </p>

        <TableToolbar
          search={calendar.search}
          onSearchChange={calendar.setSearch}
          showing={calendar.count}
          total={calendar.total}
          placeholder="Search festivals..."
          filters={[
            {
              key: 'year',
              label: 'Year',
              value: String(year),
              clearable: false,
              options: [thisYear - 1, thisYear, thisYear + 1].map((y) => ({ value: String(y), label: String(y) }))
            },
            {
              key: 'kind',
              label: 'Category',
              value: calendar.filters.kind || 'all',
              options: KIND_OPTS
            }
          ]}
          onFilterChange={handleCalendarFilter}
        />

        <table className="table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '30%' }} /> {/* Festival */}
            <col style={{ width: '18%' }} /> {/* Category */}
            <col style={{ width: '18%' }} /> {/* Date */}
            <col style={{ width: '16%' }} /> {/* Repeats */}
            <col style={{ width: '18%' }} /> {/* Visibility */}
          </colgroup>
          <thead>
            <tr>
              <SortableTh label="Occasion" keyName="name" sortKey={calendar.sortKey} sortDir={calendar.sortDir} onSort={calendar.toggleSort} />
              <SortableTh label="Category" keyName="kind" sortKey={calendar.sortKey} sortDir={calendar.sortDir} onSort={calendar.toggleSort} />
              <SortableTh label="Date" keyName="date" sortKey={calendar.sortKey} sortDir={calendar.sortDir} onSort={calendar.toggleSort} />
              <th>Repeats</th>
              <th>Shown to everyone</th>
            </tr>
          </thead>
          <tbody>
            {calendar.count === 0 && (
              <TableEmpty colSpan={5} message="No calendar dates match your filters." icon={CalendarHeart} />
            )}
            {calendar.rows.map((row) => {
              const hidden = hiddenIds.has(row.id)
              const dateLabel = row.date ? formatDate(row.date) : 'No date yet'
              return (
                <tr key={row.id}>
                  <td className="cell-ellipsis" title={row.name}>
                    <strong>{row.name}</strong>
                  </td>
                  <td>
                    <span className="tag">{celebrationKindLabel(row.kind)}</span>
                  </td>
                  <td className={row.date ? 'cell-ellipsis' : 'cell-ellipsis muted'} title={dateLabel}>
                    {dateLabel}
                  </td>
                  <td>{row.monthDay ? 'Every year' : 'That date only'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-tiny btn-light"
                      onClick={() => toggleVisible(row)}
                      aria-label={hidden ? `Show ${row.name}` : `Hide ${row.name}`}
                    >
                      {hidden
                        ? <><Undo2 size={13} style={{ marginRight: 4 }} aria-hidden="true" /> Show</>
                        : <><Ban size={13} style={{ marginRight: 4 }} aria-hidden="true" /> Hide</>}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal onClose={closeForm} title={editId ? 'Edit Occasion' : 'New Occasion'}>
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">{editId ? 'Edit Occasion' : 'New Occasion'}</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={closeForm} aria-label="Close"><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Foundation Day"
                  required
                />
              </div>
              <div className="two-col">
                <div className="field">
                  <label>Category</label>
                  <select
                    value={formData.kind}
                    onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                  >
                    {CELEBRATION_EVENT_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>Greeting</label>
                <input
                  type="text"
                  value={formData.greeting}
                  onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                  placeholder="e.g. Happy Foundation Day!"
                />
              </div>
              <div className="field">
                <label>Message (optional)</label>
                <textarea
                  className="reply-input"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="A short wish shown under the greeting"
                />
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                />
                <span>
                  <strong>Repeats every year</strong> — keep the month and day and
                  carry it forward, so an annual date does not have to be re-added.
                </span>
              </label>
              <div className="button-row">
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Save Changes' : 'Add Occasion'}
                </button>
                <button type="button" className="btn btn-light" onClick={closeForm}>Cancel</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {deleteRow && (
        <Modal onClose={() => setDeleteRow(null)} title="Confirm Delete">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="section-title first">Confirm Delete</h3>
              <button type="button" className="btn btn-tiny btn-light" onClick={() => setDeleteRow(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <p className="hint first">
              This will permanently remove <strong>{deleteRow.name}</strong> from the
              Celebrations page for everyone. You can add it again later.
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              <button type="button" className="btn btn-light" onClick={() => setDeleteRow(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
