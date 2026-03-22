import { useMemo } from 'react'
import Plot from 'react-plotly.js'
import { useFetch } from '../hooks/useFetch'
import { useCountry } from '../context/CountryContext'
import { fetchEngagement } from '../utils/api'
import { formatNumber, formatPercentage, plotlyDarkTheme } from '../utils/formatters'
import ChartCard from '../components/ChartCard'
import InsightsPanel from '../components/InsightsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Engagement Analysis Page
 * Displays scatter plots of views vs likes/comments and engagement rate distribution
 */
export default function Engagement() {
  const { selectedCountry } = useCountry()
  const { data, loading, error, refetch } = useFetch(
    () => fetchEngagement(selectedCountry),
    [selectedCountry]
  )

  // Generate insights from the data
  const insights = useMemo(() => {
    if (!data?.statistics) return []
    const stats = data.statistics
    return [
      `Views and Likes show a strong positive correlation of ${stats.correlation_views_likes.toFixed(2)}, indicating that popular videos consistently receive more engagement.`,
      `The correlation between Views and Comments is ${stats.correlation_views_comments.toFixed(2)}, suggesting that viewer discussion increases with popularity.`,
      `Mean engagement rate is ${formatPercentage(stats.mean_engagement)}, while the median is ${formatPercentage(stats.median_engagement)} - the difference indicates right-skewed distribution.`,
      `Some videos achieve engagement rates as high as ${formatPercentage(stats.max_engagement)}, representing exceptionally viral or niche content.`,
      `The engagement rate standard deviation of ${formatPercentage(stats.std_engagement)} shows significant variance in how viewers interact with content.`
    ]
  }, [data])

  if (loading) {
    return <LoadingSpinner message="Loading engagement data..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  const scatterData = data.scatter_data

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Engagement Analysis</h1>
        <p className="text-dashboard-muted mt-2">
          Analyze relationships between views, likes, comments, and engagement rates
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Views-Likes Correlation" 
          value={data.statistics.correlation_views_likes.toFixed(2)}
          description="Strong positive"
        />
        <StatCard 
          label="Views-Comments Correlation" 
          value={data.statistics.correlation_views_comments.toFixed(2)}
          description="Moderate positive"
        />
        <StatCard 
          label="Mean Engagement Rate" 
          value={formatPercentage(data.statistics.mean_engagement)}
          description="Average interaction"
        />
        <StatCard 
          label="Median Engagement Rate" 
          value={formatPercentage(data.statistics.median_engagement)}
          description="Typical video"
        />
      </div>

      {/* Scatter Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views vs Likes */}
        <ChartCard 
          title="Views vs Likes" 
          description="Relationship between video views and likes received"
        >
          <Plot
            data={[
              {
                x: scatterData.views,
                y: scatterData.likes,
                type: 'scattergl',
                mode: 'markers',
                marker: {
                  color: '#3b82f6',
                  opacity: 0.5,
                  size: 6
                },
                text: scatterData.titles,
                hovertemplate: '<b>%{text}</b><br>Views: %{x:,.0f}<br>Likes: %{y:,.0f}<extra></extra>'
              }
            ]}
            layout={{
              ...plotlyDarkTheme,
              height: 400,
              xaxis: {
                ...plotlyDarkTheme.xaxis,
                title: 'Views',
                type: 'log'
              },
              yaxis: {
                ...plotlyDarkTheme.yaxis,
                title: 'Likes',
                type: 'log'
              },
              hovermode: 'closest'
            }}
            config={{ responsive: true, displayModeBar: true }}
            style={{ width: '100%' }}
          />
        </ChartCard>

        {/* Views vs Comments */}
        <ChartCard 
          title="Views vs Comments" 
          description="Relationship between video views and comment count"
        >
          <Plot
            data={[
              {
                x: scatterData.views,
                y: scatterData.comments,
                type: 'scattergl',
                mode: 'markers',
                marker: {
                  color: '#10b981',
                  opacity: 0.5,
                  size: 6
                },
                text: scatterData.titles,
                hovertemplate: '<b>%{text}</b><br>Views: %{x:,.0f}<br>Comments: %{y:,.0f}<extra></extra>'
              }
            ]}
            layout={{
              ...plotlyDarkTheme,
              height: 400,
              xaxis: {
                ...plotlyDarkTheme.xaxis,
                title: 'Views',
                type: 'log'
              },
              yaxis: {
                ...plotlyDarkTheme.yaxis,
                title: 'Comment Count',
                type: 'log'
              },
              hovermode: 'closest'
            }}
            config={{ responsive: true, displayModeBar: true }}
            style={{ width: '100%' }}
          />
        </ChartCard>
      </div>

      {/* Engagement Rate Distribution */}
      <ChartCard 
        title="Engagement Rate Distribution" 
        description="Distribution of engagement rates across all videos (capped at 20% for visibility)"
      >
        <Plot
          data={[
            {
              x: data.engagement_distribution.bins.slice(0, -1),
              y: data.engagement_distribution.counts,
              type: 'bar',
              marker: {
                color: '#8b5cf6',
                opacity: 0.8
              },
              hovertemplate: 'Rate: %{x:.2%}<br>Count: %{y:,.0f}<extra></extra>'
            }
          ]}
          layout={{
            ...plotlyDarkTheme,
            height: 350,
            xaxis: {
              ...plotlyDarkTheme.xaxis,
              title: 'Engagement Rate',
              tickformat: '.1%'
            },
            yaxis: {
              ...plotlyDarkTheme.yaxis,
              title: 'Frequency'
            },
            bargap: 0.05
          }}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Engagement Rate vs Views */}
      <ChartCard 
        title="Engagement Rate vs Views" 
        description="How engagement rate varies with video popularity"
      >
        <Plot
          data={[
            {
              x: scatterData.views,
              y: scatterData.engagement_rate,
              type: 'scattergl',
              mode: 'markers',
              marker: {
                color: '#f59e0b',
                opacity: 0.5,
                size: 6
              },
              text: scatterData.titles,
              hovertemplate: '<b>%{text}</b><br>Views: %{x:,.0f}<br>Engagement: %{y:.2%}<extra></extra>'
            }
          ]}
          layout={{
            ...plotlyDarkTheme,
            height: 400,
            xaxis: {
              ...plotlyDarkTheme.xaxis,
              title: 'Views',
              type: 'log'
            },
            yaxis: {
              ...plotlyDarkTheme.yaxis,
              title: 'Engagement Rate',
              tickformat: '.1%',
              range: [0, 0.15]
            },
            hovermode: 'closest'
          }}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Insights Panel */}
      <InsightsPanel 
        title="Engagement Insights"
        insights={insights}
      />
    </div>
  )
}

/**
 * Statistics Card Component
 */
function StatCard({ label, value, description }) {
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
      <p className="text-dashboard-muted text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-dashboard-muted mt-1">{description}</p>
    </div>
  )
}
