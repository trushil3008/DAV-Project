import { useMemo, useState } from 'react'
import Plot from 'react-plotly.js'
import { useFetch } from '../hooks/useFetch'
import { useCountry } from '../context/CountryContext'
import { fetchClusters } from '../utils/api'
import { formatNumber, plotlyDarkTheme } from '../utils/formatters'
import ChartCard from '../components/ChartCard'
import InsightsPanel from '../components/InsightsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Clustering Analysis Page
 * Displays K-Means clustering results for video engagement metrics
 */
export default function Clustering() {
  const { selectedCountry } = useCountry()
  const [nClusters, setNClusters] = useState(4)
  const { data, loading, error, refetch } = useFetch(
    () => fetchClusters(selectedCountry, nClusters, 5000), 
    [selectedCountry, nClusters]
  )

  // Cluster colors
  const clusterColors = ['#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

  // Transform API data into component-friendly format
  const clusterSummary = useMemo(() => {
    if (!data?.cluster_stats) return []
    const stats = data.cluster_stats
    return stats.clusters.map((cluster, i) => ({
      cluster,
      size: stats.counts[i],
      avg_views: stats.avg_views[i],
      avg_likes: stats.avg_likes[i],
      avg_comments: stats.avg_comments[i],
      avg_engagement: stats.avg_engagement[i]
    }))
  }, [data])

  // Transform scatter data into points array
  const points = useMemo(() => {
    if (!data?.scatter_data) return []
    const sd = data.scatter_data
    return sd.views.map((_, i) => ({
      views: sd.views[i],
      likes: sd.likes[i],
      comment_count: sd.comments[i],
      cluster: sd.clusters[i],
      title: sd.titles[i]
    }))
  }, [data])

  // Generate insights from clustering data
  const insights = useMemo(() => {
    if (clusterSummary.length === 0) return []
    
    const largest = clusterSummary.reduce((max, c) => c.size > max.size ? c : max, clusterSummary[0])
    const mostEngaged = clusterSummary.reduce((max, c) => c.avg_likes > max.avg_likes ? c : max, clusterSummary[0])
    const mostViewed = clusterSummary.reduce((max, c) => c.avg_views > max.avg_views ? c : max, clusterSummary[0])

    return [
      `K-Means clustering with ${nClusters} clusters groups videos by views, likes, and comment count patterns.`,
      `Cluster ${largest.cluster} is the largest with ${formatNumber(largest.size)} videos (${((largest.size / points.length) * 100).toFixed(1)}% of sampled data).`,
      `Cluster ${mostViewed.cluster} contains the highest-performing videos with ${formatNumber(mostViewed.avg_views)} average views.`,
      `Cluster ${mostEngaged.cluster} shows the strongest engagement with ${formatNumber(mostEngaged.avg_likes)} average likes.`,
      `The clustering helps identify distinct video performance tiers, from viral hits to moderate performers.`
    ]
  }, [clusterSummary, points, nClusters])

  if (loading) {
    return <LoadingSpinner message="Running K-Means clustering algorithm..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Clustering Analysis</h1>
          <p className="text-dashboard-muted mt-2">
            K-Means clustering of videos based on engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-dashboard-muted text-sm">Number of Clusters:</label>
          <select
            value={nClusters}
            onChange={(e) => setNClusters(Number(e.target.value))}
            className="bg-dashboard-card border border-dashboard-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} Clusters</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cluster Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusterSummary.map((cluster, i) => (
          <ClusterCard 
            key={cluster.cluster}
            cluster={cluster}
            color={clusterColors[i % clusterColors.length]}
            totalPoints={points.length}
          />
        ))}
      </div>

      {/* 3D Scatter Plot */}
      <ChartCard 
        title="3D Cluster Visualization" 
        description="Interactive 3D view of video clusters (Views vs Likes vs Comments)"
      >
        <Plot
          data={clusterSummary.map((cluster, i) => {
            const clusterPoints = points.filter(p => p.cluster === cluster.cluster)
            return {
              type: 'scatter3d',
              mode: 'markers',
              name: `Cluster ${cluster.cluster}`,
              x: clusterPoints.map(p => p.views),
              y: clusterPoints.map(p => p.likes),
              z: clusterPoints.map(p => p.comment_count),
              marker: {
                size: 4,
                color: clusterColors[i % clusterColors.length],
                opacity: 0.7
              },
              hovertemplate: 
                'Views: %{x:,.0f}<br>' +
                'Likes: %{y:,.0f}<br>' +
                'Comments: %{z:,.0f}<extra>Cluster ' + cluster.cluster + '</extra>'
            }
          })}
          layout={{
            ...plotlyDarkTheme,
            height: 600,
            scene: {
              xaxis: { 
                title: 'Views',
                gridcolor: '#334155',
                zerolinecolor: '#334155',
                color: '#94a3b8'
              },
              yaxis: { 
                title: 'Likes',
                gridcolor: '#334155',
                zerolinecolor: '#334155',
                color: '#94a3b8'
              },
              zaxis: { 
                title: 'Comments',
                gridcolor: '#334155',
                zerolinecolor: '#334155',
                color: '#94a3b8'
              },
              bgcolor: '#0f172a'
            },
            legend: {
              x: 1,
              y: 1,
              font: { color: '#e2e8f0' }
            }
          }}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* 2D Scatter Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views vs Likes */}
        <ChartCard 
          title="Views vs Likes" 
          description="2D view showing cluster separation"
        >
          <Plot
            data={clusterSummary.map((cluster, i) => {
              const clusterPoints = points.filter(p => p.cluster === cluster.cluster)
              return {
                type: 'scattergl',
                mode: 'markers',
                name: `Cluster ${cluster.cluster}`,
                x: clusterPoints.map(p => p.views),
                y: clusterPoints.map(p => p.likes),
                marker: {
                  size: 5,
                  color: clusterColors[i % clusterColors.length],
                  opacity: 0.6
                },
                hovertemplate: 'Views: %{x:,.0f}<br>Likes: %{y:,.0f}<extra></extra>'
              }
            })}
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
              legend: {
                orientation: 'h',
                y: -0.15,
                font: { color: '#e2e8f0' }
              }
            }}
            config={{ responsive: true, displayModeBar: true }}
            style={{ width: '100%' }}
          />
        </ChartCard>

        {/* Views vs Comments */}
        <ChartCard 
          title="Views vs Comments" 
          description="2D view showing cluster separation"
        >
          <Plot
            data={clusterSummary.map((cluster, i) => {
              const clusterPoints = points.filter(p => p.cluster === cluster.cluster)
              return {
                type: 'scattergl',
                mode: 'markers',
                name: `Cluster ${cluster.cluster}`,
                x: clusterPoints.map(p => p.views),
                y: clusterPoints.map(p => p.comment_count),
                marker: {
                  size: 5,
                  color: clusterColors[i % clusterColors.length],
                  opacity: 0.6
                },
                hovertemplate: 'Views: %{x:,.0f}<br>Comments: %{y:,.0f}<extra></extra>'
              }
            })}
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
              legend: {
                orientation: 'h',
                y: -0.15,
                font: { color: '#e2e8f0' }
              }
            }}
            config={{ responsive: true, displayModeBar: true }}
            style={{ width: '100%' }}
          />
        </ChartCard>
      </div>

      {/* Elbow Chart */}
      <ChartCard 
        title="Elbow Method - Optimal Clusters" 
        description="WCSS (Within-Cluster Sum of Squares) by number of clusters"
      >
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'lines+markers',
              x: data.elbow_data.k_values,
              y: data.elbow_data.wcss,
              marker: {
                size: 10,
                color: data.elbow_data.k_values.map(k => k === nClusters ? '#10b981' : '#3b82f6')
              },
              line: {
                color: '#3b82f6',
                width: 2
              },
              hovertemplate: 'K = %{x}<br>WCSS: %{y:,.0f}<extra></extra>'
            }
          ]}
          layout={{
            ...plotlyDarkTheme,
            height: 350,
            xaxis: {
              ...plotlyDarkTheme.xaxis,
              title: 'Number of Clusters (K)',
              tickmode: 'linear',
              dtick: 1
            },
            yaxis: {
              ...plotlyDarkTheme.yaxis,
              title: 'WCSS'
            },
            annotations: [
              {
                x: nClusters,
                y: data.elbow_data.wcss[nClusters - 1],
                text: `Current: K=${nClusters}`,
                showarrow: true,
                arrowhead: 2,
                arrowcolor: '#10b981',
                font: { color: '#10b981' },
                ax: 40,
                ay: -40
              }
            ]
          }}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Cluster Statistics Table */}
      <ChartCard 
        title="Cluster Statistics" 
        description="Detailed metrics for each cluster"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dashboard-border">
                <th className="text-left py-3 px-4 text-dashboard-muted font-medium">Cluster</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">Size</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">% of Total</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">Avg Views</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">Avg Likes</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">Avg Comments</th>
              </tr>
            </thead>
            <tbody>
              {clusterSummary.map((cluster, i) => (
                <tr key={cluster.cluster} className="border-b border-dashboard-border/50 hover:bg-dashboard-card/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: clusterColors[i % clusterColors.length] }}
                      />
                      <span className="text-white font-medium">Cluster {cluster.cluster}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-white">{formatNumber(cluster.size)}</td>
                  <td className="text-right py-3 px-4 text-dashboard-muted">
                    {((cluster.size / points.length) * 100).toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-4 text-white">{formatNumber(cluster.avg_views)}</td>
                  <td className="text-right py-3 px-4 text-white">{formatNumber(cluster.avg_likes)}</td>
                  <td className="text-right py-3 px-4 text-white">{formatNumber(cluster.avg_comments)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Cluster Distribution */}
      <ChartCard 
        title="Cluster Size Distribution" 
        description="Proportion of videos in each cluster"
      >
        <Plot
          data={[
            {
              type: 'pie',
              labels: clusterSummary.map(c => `Cluster ${c.cluster}`),
              values: clusterSummary.map(c => c.size),
              marker: {
                colors: clusterColors.slice(0, clusterSummary.length)
              },
              textinfo: 'label+percent',
              textposition: 'outside',
              textfont: { color: '#e2e8f0' },
              hovertemplate: 'Cluster %{label}<br>Size: %{value:,.0f}<br>Percent: %{percent}<extra></extra>',
              hole: 0.4
            }
          ]}
          layout={{
            ...plotlyDarkTheme,
            height: 400,
            showlegend: false,
            annotations: [
              {
                text: `${formatNumber(points.length)}<br>Videos`,
                x: 0.5,
                y: 0.5,
                font: { size: 16, color: '#e2e8f0' },
                showarrow: false
              }
            ]
          }}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Insights Panel */}
      <InsightsPanel 
        title="Clustering Insights"
        insights={insights}
      />
    </div>
  )
}

/**
 * Cluster Summary Card Component
 */
function ClusterCard({ cluster, color, totalPoints }) {
  const percentage = totalPoints > 0 ? ((cluster.size / totalPoints) * 100).toFixed(1) : 0
  
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <h3 className="text-lg font-semibold text-white">Cluster {cluster.cluster}</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-dashboard-muted text-sm">Size</span>
          <span className="text-white font-medium">
            {formatNumber(cluster.size)} <span className="text-dashboard-muted">({percentage}%)</span>
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-dashboard-muted text-sm">Avg Views</span>
          <span className="text-white font-medium">{formatNumber(cluster.avg_views)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-dashboard-muted text-sm">Avg Likes</span>
          <span className="text-white font-medium">{formatNumber(cluster.avg_likes)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-dashboard-muted text-sm">Avg Comments</span>
          <span className="text-white font-medium">{formatNumber(cluster.avg_comments)}</span>
        </div>
      </div>
      
      {/* Mini bar showing relative size */}
      <div className="mt-4 h-2 bg-dashboard-border rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  )
}
