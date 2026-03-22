import Sidebar from './Sidebar'

/**
 * Layout Component
 * Wraps all pages with the sidebar navigation
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
