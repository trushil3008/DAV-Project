/**
 * KPI Card Component
 * Displays key performance indicators with icons
 */
export default function KPICard({ title, value, subtitle, icon, gradient = 'kpi-gradient-blue' }) {
  return (
    <div className={`${gradient} rounded-xl p-6 card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-white/60 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
