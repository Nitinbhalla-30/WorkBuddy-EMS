import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyTeamDirectory } from '../data/store.js'
import Pagination from '../components/Pagination.jsx'
import SortableTh from '../components/SortableTh.jsx'
import TableToolbar from '../components/TableToolbar.jsx'
import { usePagination } from '../hooks/usePagination.js'
import { useTableControls } from '../hooks/useTableControls.js'

export default function MyTeam() {
  const { user } = useAuth()

  const teammates = useMemo(() => getMyTeamDirectory(user.id), [user.id])

  const table = useTableControls(teammates, {
    getSearchText: (m) => [m.name, m.mobile, m.email, m.designation, m.reportsTo].join(' '),
    getSortValue: (m, key) => m[key],
    initialSortKey: 'name',
    initialSortDir: 'asc'
  })

  const {
    items: pageRows,
    page,
    totalPages,
    total,
    startIndex,
    endIndex,
    setPage
  } = usePagination(table.rows)

  const emptyMessage = user.isManager
    ? 'No team members to show yet.'
    : user.managerId
      ? 'No team members found.'
      : 'You are not assigned to a team yet. Ask HR if this looks wrong.'

  return (
    <div>
      <div className="page-head">
        <h2>My Team</h2>
        <span className="muted">{teammates.length} team member(s)</span>
      </div>

      <div className="card">
        <TableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          placeholder="Search team members..."
        />
        <table className="table">
          <thead>
            <tr>
              <SortableTh
                label="Name"
                keyName="name"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Mobile"
                keyName="mobile"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Email"
                keyName="email"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Designation"
                keyName="designation"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh
                label="Reports to"
                keyName="reportsTo"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
              />
            </tr>
          </thead>
          <tbody>
            {table.count === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  {teammates.length === 0 ? emptyMessage : 'No team members match your search.'}
                </td>
              </tr>
            )}
            {pageRows.map((m) => (
              <tr key={m.id}>
                <td>{m.id === user.id ? `${m.name} (me)` : m.name}</td>
                <td>
                  {m.mobile
                    ? <a href={`tel:${m.mobile}`} className="phone-link">{m.mobile}</a>
                    : <span className="muted">--</span>}
                </td>
                <td>
                  {m.email
                    ? <a href={`mailto:${m.email}`} className="phone-link">{m.email}</a>
                    : <span className="muted">--</span>}
                </td>
                <td>{m.designation || <span className="muted">--</span>}</td>
                <td>{m.reportsTo || <span className="muted">--</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
        />
      </div>

      <p className="hint">
        Contact details come from employee records and verified profiles. If something is missing or wrong, ask HR to update it.
      </p>
    </div>
  )
}
