import * as XLSX from 'xlsx'

// Convert a JS Date to an Excel serial number (days since 1899-12-30).
// Excel's day 1 = 1900-01-01, but it has a bug treating 1900 as a leap year,
// so the epoch is 1899-12-30.
function dateToExcelSerial(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return ''
  const msPerDay = 86400000
  const epoch = Date.UTC(1899, 11, 30) // 1899-12-30 UTC
  return Math.floor((date.getTime() - epoch) / msPerDay)
}

// Format a cell value for display-length measurement.
function displayValue(val, fmt) {
  if (val === '' || val == null) return ''
  if (fmt?.z === 'yyyy-mm-dd' && typeof val === 'number') {
    // Approximate display length for a date like "2026-08-27"
    return '2026-08-27'
  }
  if (fmt?.z?.includes('AM/PM') && typeof val === 'number') {
    // Approximate display length for a time like "09:19 AM"
    return '09:19 AM'
  }
  if (fmt?.z === '[h]:mm' && typeof val === 'number') {
    // Approximate display length for a duration like "8:30"
    return '8:30'
  }
  return String(val)
}

// Download a native Excel (.xlsx) workbook with one sheet.
// Options:
//   colFormats: { [colIndex]: { z: 'format-string', t: 'type' } }
//     t can be 'd' (date) or 'n' (number). z is the Excel number format.
//   autoFilter: true to apply auto-filter on the header row.
export function downloadExcelXlsx(filename, headers, rows, options = {}) {
  // Preprocess rows: convert Date objects to Excel serial numbers
  const dateCols = new Set()
  if (options.colFormats) {
    for (const [colStr, fmt] of Object.entries(options.colFormats)) {
      if (fmt.t === 'd') dateCols.add(parseInt(colStr, 10))
    }
  }

  const processedRows = rows.map((row) =>
    row.map((val, col) => {
      if (dateCols.has(col) && val instanceof Date && !isNaN(val.getTime())) {
        return dateToExcelSerial(val)
      }
      return val
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([headers, ...processedRows])

  // Size each column to its longest displayed cell
  ws['!cols'] = headers.map((h, col) => {
    const fmt = options.colFormats?.[String(col)]
    const headerLen = String(h ?? '').length
    const longest = processedRows.reduce(
      (max, row) => Math.max(max, displayValue(row[col], fmt).length),
      headerLen
    )
    return { wch: Math.min(longest + 2, 60) }
  })

  // Apply column formats (date, time, number)
  if (options.colFormats) {
    const totalRows = processedRows.length + 1 // +1 for header
    for (const [colStr, fmt] of Object.entries(options.colFormats)) {
      const col = parseInt(colStr, 10)
      for (let row = 1; row < totalRows; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
        if (ws[cellRef]) {
          // Always use 'n' (number) type — Excel stores dates/times as numbers
          // with format strings. Using 'd' with a pre-computed serial number
          // causes Excel to misinterpret the value.
          ws[cellRef].t = 'n'
          if (fmt.z) ws[cellRef].z = fmt.z
        }
      }
    }
  }

  // Apply auto-filter on header row
  if (options.autoFilter) {
    const lastCol = XLSX.utils.encode_col(headers.length - 1)
    ws['!autofilter'] = { ref: `A1:${lastCol}${processedRows.length + 1}` }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  XLSX.writeFile(wb, safeName)
}
