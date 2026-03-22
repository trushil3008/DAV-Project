/**
 * Loading Spinner Component
 * Displays animated loading state
 */
export default function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dashboard-border rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-dashboard-muted">{message}</p>
    </div>
  )
}
