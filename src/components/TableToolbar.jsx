import { Search } from 'lucide-react'

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
        {children}
      </div>
      {actions && <div className="table-toolbar-right">{actions}</div>}
    </div>
  )
}
