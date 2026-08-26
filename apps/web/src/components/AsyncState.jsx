export default function AsyncState({ loading, error, children, empty = false, emptyMessage = 'No records found.' }) {
  if (loading) return <div className="p-6 text-sm text-gray-500" role="status">Loading…</div>
  if (error) return <div className="p-6 text-sm text-red-600" role="alert">{error.message || String(error)}</div>
  if (empty) return <div className="p-6 text-sm text-gray-500">{emptyMessage}</div>
  return children
}
