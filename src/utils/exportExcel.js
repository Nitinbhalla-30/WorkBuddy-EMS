import * as XLSX from 'xlsx'

// Download a native Excel (.xlsx) workbook with one sheet.
export function downloadExcelXlsx(filename, headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Size each column to its longest cell so nothing shows truncated.
  ws['!cols'] = headers.map((h, col) => {
    const longest = rows.reduce(
      (max, row) => Math.max(max, String(row[col] ?? '').length),
      String(h ?? '').length
    )
    return { wch: Math.min(longest + 2, 60) }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  XLSX.writeFile(wb, safeName)
}
