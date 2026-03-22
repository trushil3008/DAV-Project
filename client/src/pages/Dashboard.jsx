import { useMemo } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useCountry } from '../context/CountryContext'
import { fetchOverview } from '../utils/api'
import { formatNumber, formatPercentage, formatDuration } from '../utils/formatters'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import InsightsPanel from '../components/InsightsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Dashboard Overview Page
 * Displays key metrics and summary statistics
 */
export default function Dashboard() {
  const { selectedCountry, countryInfo } = useCountry()
  const { data, loading, error, refetch } = useFetch(
    () => fetchOverview(selectedCountry),
    [selectedCountry]
  )

  // Generate insights from the data
  const insights = useMemo(() => {
    if (!data) return []
    const countryName = countryInfo?.name || 'the selected region'
    return [
      `The dataset contains ${formatNumber(data.total_videos)} trending video entries from ${countryName}, representing ${formatNumber(data.unique_videos)} unique videos.`,
      `On average, videos receive ${formatNumber(data.avg_views)} views, ${formatNumber(data.avg_likes)} likes, and ${formatNumber(data.avg_comments)} comments.`,
      `The typical engagement rate is ${formatPercentage(data.avg_engagement_rate)}, indicating how actively viewers interact with content.`,
      `Videos take an average of ${formatDuration(data.avg_time_to_trend)} to reach the trending page, with a median of ${formatDuration(data.median_time_to_trend)}.`,
      `Data spans from ${data.date_range?.start} to ${data.date_range?.end}, covering multiple months of trending content.`
    ]
  }, [data, countryInfo])

  if (loading) {
    return <LoadingSpinner message="Loading dashboard overview..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-dashboard-muted mt-2">
          YouTube {countryInfo?.name || ''} Trending Videos Analysis - Key metrics and insights
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Videos"
          value={formatNumber(data.total_videos)}
          subtitle={`${formatNumber(data.unique_videos)} unique videos`}
          gradient="kpi-gradient-blue"
          icon="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
        
        <KPICard
          title="Total Views"
          value={formatNumber(data.total_views)}
          subtitle={`Avg: ${formatNumber(data.avg_views)} per video`}
          gradient="kpi-gradient-green"
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
        
        <KPICard
          title="Total Likes"
          value={formatNumber(data.total_likes)}
          subtitle={`Avg: ${formatNumber(data.avg_likes)} per video`}
          gradient="kpi-gradient-purple"
          icon="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
        
        <KPICard
          title="Avg Engagement Rate"
          value={formatPercentage(data.avg_engagement_rate)}
          subtitle="(Likes + Comments) / Views"
          gradient="kpi-gradient-orange"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        
        <KPICard
          title="Avg Time to Trend"
          value={formatDuration(data.avg_time_to_trend)}
          subtitle={`Median: ${formatDuration(data.median_time_to_trend)}`}
          gradient="kpi-gradient-pink"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        
        <KPICard
          title="Total Channels"
          value={formatNumber(data.total_channels)}
          subtitle={`${data.total_categories} categories`}
          gradient="kpi-gradient-cyan"
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </div>

      {/* Insights Panel */}
      <InsightsPanel 
        title="Key Findings"
        insights={insights}
      />

      {/* Date Range Info */}
      <ChartCard title="Dataset Information" description="Overview of the analyzed dataset">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dashboard-bg rounded-lg p-4">
            <p className="text-dashboard-muted text-sm">Data Period</p>
            <p className="text-white font-semibold mt-1">
              {data.date_range?.start} to {data.date_range?.end}
            </p>
          </div>
          <div className="bg-dashboard-bg rounded-lg p-4">
            <p className="text-dashboard-muted text-sm">Average Comments</p>
            <p className="text-white font-semibold mt-1">
              {formatNumber(data.avg_comments)} per video
            </p>
          </div>
          <div className="bg-dashboard-bg rounded-lg p-4">
            <p className="text-dashboard-muted text-sm">Dataset Source</p>
            <p className="text-white font-semibold mt-1">
              YouTube {countryInfo?.name || ''} Trending
            </p>
          </div>
        </div>
      </ChartCard>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickNavCard 
          to="/engagement" 
          title="Engagement Analysis" 
          description="Views vs likes/comments relationships"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <QuickNavCard 
          to="/categories" 
          title="Category Insights" 
          description="Distribution and performance by category"
          icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
        <QuickNavCard 
          to="/clustering" 
          title="Video Clustering" 
          description="K-Means segmentation of videos"
          icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </div>
    </div>
  )
}

/**
 * Quick Navigation Card Component
 */
function QuickNavCard({ to, title, description, icon }) {
  return (
    <a
      href={to}
      className="block bg-dashboard-card border border-dashboard-border rounded-xl p-5 card-hover group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{title}</h3>
          <p className="text-sm text-dashboard-muted mt-1">{description}</p>
        </div>
      </div>
    </a>
  )
}
