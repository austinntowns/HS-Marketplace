export function KpiPlaceholder() {
  const metrics = ['Revenue', 'New Clients', 'Bookings', 'Membership']

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Performance Metrics</h3>
      <p className="text-gray-500 text-sm">
        Live KPI data coming soon. This section will show verified operational metrics
        including revenue, new clients, bookings, and membership conversion.
      </p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(label => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-300">-</p>
          </div>
        ))}
      </div>
    </div>
  )
}
