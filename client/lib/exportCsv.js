/**
 * Builds a CSV file from transaction data and triggers a browser download.
 * Used by both the Settings page (exports everything) and the Spending page
 * (exports the currently filtered period/transactions).
 *
 * @param {Array} transactions - array of transaction objects from the API
 * @param {Function} formatDate - the date() function from useLocale(), so the
 *   export respects the user's chosen date format
 * @param {string} filename - name for the downloaded file
 */
export function exportTransactionsToCSV(transactions, formatDate, filename = 'fintrack-transactions.csv') {
  const header = 'Date,Type,Category,Merchant,Amount (NPR)\n'
  const rows = transactions.map(t =>
    `${formatDate(t.date)},${t.type},${t.category},"${t.merchant || ''}",${t.amount}`
  ).join('\n')

  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}