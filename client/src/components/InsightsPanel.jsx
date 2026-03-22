/**
 * Insights Panel Component
 * Displays key findings and insights from the analysis
 */
export default function InsightsPanel({ title, insights }) {
  return (
    <div className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-500/30 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-primary-400 font-bold">{index + 1}</span>
            </span>
            <p className="text-dashboard-muted text-sm leading-relaxed">{insight}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
