/**
 * Chart Card Component
 * Reusable container for charts with title and optional description
 */
export default function ChartCard({ title, description, children, className = '' }) {
  return (
    <div className={`chart-container card-hover ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-dashboard-muted mt-1">{description}</p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
