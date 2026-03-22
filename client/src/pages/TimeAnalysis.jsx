import { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import Plot from 'react-plotly.js'
import { useFetch } from '../hooks/useFetch'
import { useCountry } from '../context/CountryContext'
import { fetchTimeAnalysis } from '../utils/api'
import { formatDuration, formatHour, formatNumber, plotlyDarkTheme } from '../utils/formatters'
import ChartCard from '../components/ChartCard'
import InsightsPanel from '../components/InsightsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Time Analysis Page
 * Displays time-to-trend distribution and publish hour analysis
 */
export default function TimeAnalysis() {
  const { selectedCountry } = useCountry()
  const { data, loading, error, refetch } = useFetch(
    () => fetchTimeAnalysis(selectedCountry),
    [selectedCountry]
  )

  // Generate insights from the data
  const insights = useMemo(() => {
    if (!data?.statistics) return []
    const stats = data.statistics
    return [
      `On average, videos take ${formatDuration(stats.mean_time_to_trend)} to reach the trending page, with a median of ${formatDuration(stats.median_time_to_trend)}.`,
      `The peak publish hour is ${formatHour(stats.peak_publish_hour)} with ${formatNumber(stats.peak_publish_count)} videos, indicating high creator activity during this time.`,
      `For fastest trending, videos published at ${formatHour(stats.optimal_hour_speed)} tend to reach the trending page quickest.`,
      `For maximum reach, ${formatHour(stats.optimal_hour_reach)} is optimal - videos published at this hour get the highest average views.`,
      `There's a trade-off between trending speed and total reach - the best times for each metric differ.`
    ]
  }, [data])

  if (loading) {
    return <LoadingSpinner message="Loading time analysis data..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Time Analysis</h1>
        <p className="text-dashboard-muted mt-2">
          Analyze how publish timing affects trending performance
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Avg Time to Trend" 
          value={formatDuration(data.statistics.mean_time_to_trend)}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard 
          label="Median Time to Trend" 
          value={formatDuration(data.statistics.median_time_to_trend)}
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
        <StatCard 
          label="Best Hour (Speed)" 
          value={formatHour(data.statistics.optimal_hour_speed)}
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <StatCard 
          label="Best Hour (Reach)" 
          value={formatHour(data.statistics.optimal_hour_reach)}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </div>

      {/* Time to Trend Distribution */}
      <ChartCard 
        title="Time to Trend Distribution" 
        description="How long videos take to reach the trending page (0-200 hours)"
      >
        <Plot
          data={[
            {
              x: data.time_to_trend_distribution.bins.slice(0, -1),
              y: data.time_to_trend_distribution.counts,
              type: 'bar',
              marker: {
                color: '#06b6d4',
                opacity: 0.8
              },
              hovertemplate: 'Hours: %{x:.1f}<br>Count: %{y:,.0f}<extra></extra>'
            }
          ]}
          layout={{
            ...plotlyDarkTheme,
            height: 350,
            xaxis: {
              ...plotlyDarkTheme.xaxis,
              title: 'Hours from Publish to Trending'
            },
            yaxis: {
              ...plotlyDarkTheme.yaxis,
              title: 'Frequency'
            },
            bargap: 0.02
          }}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Publish Hour Frequency */}
      <ChartCard 
        title="Publish Hour Frequency" 
        description="Number of trending videos published at each hour of the day"
      >
        <D3BarChart 
          hours={data.publish_hour_frequency.hours}
          values={data.publish_hour_frequency.counts}
          color="#3b82f6"
        />
      </ChartCard>

      {/* Hourly Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Avg Time to Trend by Publish Hour" 
          description="Lower values = faster trending"
        >
          <Plot
            data={[
              {
                x: data.hourly_metrics.hours,
                y: data.hourly_metrics.avg_time_to_trend,
                type: 'bar',
                marker: {
                  color: data.hourly_metrics.avg_time_to_trend.map(v => 
                    v === Math.min(...data.hourly_metrics.avg_time_to_trend) ? '#10b981' : '#f59e0b'
                  )
                },
                hovertemplate: 'Hour: %{x}:00<br>Avg Time: %{y:.1f} hours<extra></extra>'
              }
            ]}
            layout={{
              ...plotlyDarkTheme,
              height: 350,
              xaxis: {
                ...plotlyDarkTheme.xaxis,
                title: 'Hour of Day',
                tickmode: 'linear',
                dtick: 3
              },
              yaxis: {
                ...plotlyDarkTheme.yaxis,
                title: 'Average Hours to Trend'
              }
            }}
            config={{ responsive: true, displayModeBar: true }}
            style={{ width: '100%' }}
          />
        </ChartCard>

        <ChartCard 
          title="Avg Views by Publish Hour" 
          description="Higher values = better reach potential"
        >
          <Plot
            data={[
              {
                x: data.hourly_metrics.hours,
                y: data.hourly_metrics.avg_views,
                type: 'bar',
                marker: {
                  color: data.hourly_metrics.avg_views.map(v => 
                    v === Math.max(...data.hourly_metrics.avg_views) ? '#10b981' : '#8b5cf6'
                  )
                },
                hovertemplate: 'Hour: %{x}:00<br>Avg Views: %{y:,.0f}<extra></extra>'
              }
            ]}
            layout={{
              ...plotlyDarkTheme,
              height: 350,
              xaxis: {
                ...plotlyDarkTheme.xaxis,
                title: 'Hour of Day',
                tickmode: 'linear',
                dtick: 3
              },
              yaxis: {
                ...plotlyDarkTheme.yaxis,
                title: 'Average Views'
              }
            }}
            config={{ responsive: true, displayModeBar: true }}
            style={{ width: '100%' }}
          />
        </ChartCard>
      </div>

      {/* Insights Panel */}
      <InsightsPanel 
        title="Timing Insights"
        insights={insights}
      />
    </div>
  )
}

/**
 * Statistics Card Component
 */
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-dashboard-muted text-sm">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * D3 Bar Chart for Publish Hours
 */
function D3BarChart({ hours, values, color }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!hours || !svgRef.current) return

    const data = hours.map((hour, i) => ({ hour, value: values[i] }))

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(data.map(d => d.hour))
      .range([0, width])
      .padding(0.2)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height, 0])

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '2,2')

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.hour))
      .attr('width', x.bandwidth())
      .attr('fill', color)
      .attr('rx', 2)
      .attr('y', height)
      .attr('height', 0)
      .transition()
      .duration(800)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `${d}:00`))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')

    svg.selectAll('.domain, .tick line').attr('stroke', '#334155')

    // Y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toLocaleString()))
      .selectAll('text')
      .attr('fill', '#94a3b8')

  }, [hours, values, color])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full" style={{ minHeight: '300px' }} />
    </div>
  )
}
