import { SearchX } from 'lucide-react'

// Friendly full-width empty row for module tables.
export default function TableEmpty({ colSpan, message, icon: Icon = SearchX }) {
  return (
    <tr className="table-empty">
      <td colSpan={colSpan}>
        <span className="table-empty-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="table-empty-msg">{message}</span>
      </td>
    </tr>
  )
}
