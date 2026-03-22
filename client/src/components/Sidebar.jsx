import { NavLink } from 'react-router-dom'
import { useCountry } from '../context/CountryContext'

/**
 * Navigation items for the sidebar
 */
const navItems = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/engagement', label: 'Engagement', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { path: '/categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { path: '/time-analysis', label: 'Time Analysis', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/correlation', label: 'Correlation', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { path: '/tags', label: 'Tag Cloud', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  { path: '/clustering', label: 'Clustering', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' }
]

/**
 * Sidebar Component
 * Main navigation for the dashboard with country selector
 */
export default function Sidebar() {
  const { countries, selectedCountry, countryInfo, changeCountry, loading } = useCountry()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dashboard-card border-r border-dashboard-border flex flex-col z-50">
      {/* Logo/Header */}
      <div className="p-6 border-b border-dashboard-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">YouTube</h1>
            <p className="text-xs text-dashboard-muted">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Country Selector */}
      <div className="p-4 border-b border-dashboard-border">
        <label className="block text-xs font-medium text-dashboard-muted mb-2">
          Select Country
        </label>
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => changeCountry(e.target.value)}
            disabled={loading}
            className="w-full bg-dashboard-bg border border-dashboard-border rounded-lg px-3 py-2.5 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-dashboard-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {countryInfo && (
          <div className="mt-2 flex items-center gap-2 text-xs text-dashboard-muted">
            <span className="text-lg">{countryInfo.flag}</span>
            <span>Viewing {countryInfo.name} data</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'text-dashboard-muted hover:bg-dashboard-border hover:text-white'
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dashboard-border">
        <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-lg p-4">
          <p className="text-sm text-dashboard-muted">
            Analyzing trending videos from{' '}
            <span className="text-white font-semibold">
              {countryInfo?.name || 'Loading...'}
            </span>
          </p>
        </div>
      </div>
    </aside>
  )
}
