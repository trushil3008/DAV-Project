import { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useFetch } from '../hooks/useFetch'
import { useCountry } from '../context/CountryContext'
import { fetchCategories } from '../utils/api'
import { formatNumber } from '../utils/formatters'
import ChartCard from '../components/ChartCard'
import InsightsPanel from '../components/InsightsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Categories Page
 * Displays category distribution and performance analysis using D3.js
 */
export default function Categories() {
  const { selectedCountry } = useCountry()
  const { data, loading, error, refetch } = useFetch(
    () => fetchCategories(selectedCountry),
    [selectedCountry]
  )

  // Generate insights from the data
  const insights = useMemo(() => {
    if (!data?.insights) return []
    return [
      `${data.insights.most_frequent_category} is the most frequent category with ${formatNumber(data.insights.most_frequent_count)} trending videos.`,
      `${data.insights.highest_avg_views_category} has the highest average views at ${formatNumber(data.insights.highest_avg_views)} per video.`,
      `There's a clear distinction between volume leaders and performance leaders - high frequency doesn't guarantee high average views.`,
      `Entertainment and News categories dominate in quantity, while Gaming and Music excel in per-video engagement.`,
      `Niche categories with fewer videos often show higher viral potential per individual video.`
    ]
  }, [data])

  if (loading) {
    return <LoadingSpinner message="Loading category data..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Category Insights</h1>
        <p className="text-dashboard-muted mt-2">
          Distribution and performance analysis of trending videos by category
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6">
          <p className="text-white/80 text-sm">Most Frequent Category</p>
          <p className="text-2xl font-bold text-white mt-1">{data.insights.most_frequent_category}</p>
          <p className="text-white/60 text-sm mt-1">{formatNumber(data.insights.most_frequent_count)} videos</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6">
          <p className="text-white/80 text-sm">Highest Avg Views Category</p>
          <p className="text-2xl font-bold text-white mt-1">{data.insights.highest_avg_views_category}</p>
          <p className="text-white/60 text-sm mt-1">{formatNumber(data.insights.highest_avg_views)} avg views</p>
        </div>
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Videos per Category" 
          description="Number of trending videos in each category"
        >
          <D3BarChart 
            data={data.category_counts}
            valueKey="counts"
            color="#3b82f6"
          />
        </ChartCard>

        <ChartCard 
          title="Average Views by Category" 
          description="Mean view count per category"
        >
          <D3BarChart 
            data={data.avg_views_by_category}
            valueKey="avg_views"
            color="#10b981"
            formatValue={formatNumber}
          />
        </ChartCard>
      </div>

      {/* Category Table */}
      <ChartCard title="Category Details" description="Complete breakdown of all categories">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dashboard-border">
                <th className="text-left py-3 px-4 text-dashboard-muted font-medium">Category</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">Video Count</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">Avg Views</th>
                <th className="text-right py-3 px-4 text-dashboard-muted font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.category_counts.category_names.map((name, index) => {
                const count = data.category_counts.counts[index]
                const totalVideos = data.category_counts.counts.reduce((a, b) => a + b, 0)
                const avgViewsData = data.avg_views_by_category
                const avgViewsIndex = avgViewsData.category_names.indexOf(name)
                const avgViews = avgViewsIndex >= 0 ? avgViewsData.avg_views[avgViewsIndex] : 0
                
                return (
                  <tr key={name} className="border-b border-dashboard-border/50 hover:bg-dashboard-bg/50">
                    <td className="py-3 px-4 text-white font-medium">{name}</td>
                    <td className="py-3 px-4 text-right text-dashboard-text">{formatNumber(count)}</td>
                    <td className="py-3 px-4 text-right text-dashboard-text">{formatNumber(avgViews)}</td>
                    <td className="py-3 px-4 text-right text-dashboard-muted">
                      {((count / totalVideos) * 100).toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Insights Panel */}
      <InsightsPanel 
        title="Category Insights"
        insights={insights}
      />
    </div>
  )
}

/**
 * D3 Horizontal Bar Chart Component
 */
function D3BarChart({ data, valueKey, color, formatValue = (v) => v.toLocaleString() }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    // Prepare data
    const chartData = data.category_names.map((name, i) => ({
      name,
      value: data[valueKey][i]
    })).sort((a, b) => b.value - a.value).slice(0, 15) // Top 15

    // Dimensions
    const margin = { top: 20, right: 80, bottom: 20, left: 120 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const height = Math.max(400, chartData.length * 30)

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.value)])
      .range([0, width])

    const y = d3.scaleBand()
      .domain(chartData.map(d => d.name))
      .range([0, height])
      .padding(0.2)

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(x.ticks(5))
      .enter()
      .append('line')
      .attr('x1', d => x(d))
      .attr('x2', d => x(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '2,2')

    // Bars
    svg.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.name))
      .attr('height', y.bandwidth())
      .attr('fill', color)
      .attr('rx', 4)
      .attr('width', 0)
      .transition()
      .duration(800)
      .attr('width', d => x(d.value))

    // Y-axis labels
    svg.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -10)
      .attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name)

    // Value labels
    svg.selectAll('.value-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.value) + 5)
      .attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .text(d => formatValue(d.value))

  }, [data, valueKey, color, formatValue])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full" style={{ minHeight: '400px' }} />
    </div>
  )
}
