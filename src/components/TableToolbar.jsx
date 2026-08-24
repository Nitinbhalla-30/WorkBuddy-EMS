import { Search, X } from 'lucide-react'

export default function TableToolbar({
  search,
  onSearchChange,
  showSearch = true,
  placeholder = 'Search table...',
  filters = [],
  onFilterChange,
  actions,
  children
}) {
  const hasActiveFilters = filters.some((f) => f.value && f.value !== 'all')

  function handleClearFilters() {
    filters.forEach((f) => {
      if (f.value && f.value !== 'all') {
        onFilterChange(f.key, 'all')
      }
    })
  }

  return (
    <div className="table-toolbar">
      <div className="table-toolbar-left">
        {showSearch && onSearchChange && (
          <label className="table-toolbar-field table-toolbar-search">
            <span className="table-toolbar-label">Search</span>
            <span className="search-control">
              <Search size={15} className="search-control-icon" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
              />
            </span>
          </label>
        )}
        {filters.map((f) => (
          <label key={f.key} className="table-toolbar-field table-toolbar-filter">
            <span className="table-toolbar-label">{f.label}</span>
            <select
              value={f.value || 'all'}
              onChange={(e) => onFilterChange(f.key, e.target.value)}
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        ))}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-light btn-tiny table-toolbar-action"
            onClick={handleClearFilters}
          >
            <X size={14} style={{ marginRight: 2 }} />
            Clear filters
          </button>
        )}
        {children}
      </div>
      {actions && <div className="table-toolbar-right">{actions}</div>}
    </div>
  )
}
