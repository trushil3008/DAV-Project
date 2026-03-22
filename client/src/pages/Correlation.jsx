import { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useFetch } from '../hooks/useFetch'
import { useCountry } from '../context/CountryContext'
import { fetchCorrelation } from '../utils/api'
import ChartCard from '../components/ChartCard'
import InsightsPanel from '../components/InsightsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Correlation Analysis Page
 * Displays correlation heatmap between numeric variables
 */
export default function Correlation() {
  const { selectedCountry } = useCountry()
  const { data, loading, error, refetch } = useFetch(
    () => fetchCorrelation(selectedCountry),
    [selectedCountry]
  )

  // Generate insights from correlation data
  const insights = useMemo(() => {
    if (!data?.insights) return []
    const kc = data.insights
    return [
      `Views and likes have a ${getCorrelationStrength(kc.views_likes_corr)} positive correlation (${kc.views_likes_corr.toFixed(3)}), showing that popular videos consistently get more likes.`,
      `Likes and comments are ${getCorrelationStrength(kc.likes_comments_corr)} correlated (${kc.likes_comments_corr.toFixed(3)}), indicating engaged viewers tend to both like and comment.`,
      `Views and comments show a ${getCorrelationStrength(kc.views_comments_corr)} correlation (${kc.views_comments_corr.toFixed(3)}), suggesting comments scale with viewership.`,
      `Dislikes and comments correlation (${kc.dislikes_comments_corr.toFixed(3)}) shows the relationship between negative and neutral engagement.`,
      `Strong positive correlations between engagement metrics suggest that viral videos receive all types of interactions.`
    ]
  }, [data])

  if (loading) {
    return <LoadingSpinner message="Computing correlation matrix..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Correlation Analysis</h1>
        <p className="text-dashboard-muted mt-2">
          Explore relationships between different video metrics
        </p>
      </div>

      {/* Key Correlations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CorrelationCard 
          label="Views & Likes" 
          value={data.insights.views_likes_corr}
        />
        <CorrelationCard 
          label="Views & Comments" 
          value={data.insights.views_comments_corr}
        />
        <CorrelationCard 
          label="Likes & Comments" 
          value={data.insights.likes_comments_corr}
        />
        <CorrelationCard 
          label="Dislikes & Comments" 
          value={data.insights.dislikes_comments_corr}
        />
      </div>

      {/* Correlation Heatmap */}
      <ChartCard 
        title="Correlation Heatmap" 
        description="Correlation coefficients between all numeric variables (-1 to 1)"
      >
        <D3Heatmap 
          matrix={data.matrix}
          labels={data.labels}
        />
      </ChartCard>

      {/* Correlation Legend */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Understanding Correlations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <div>
              <p className="text-white font-medium">Strong Positive (0.7 to 1.0)</p>
              <p className="text-dashboard-muted text-sm">Variables increase together</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#1e293b' }}></div>
            <div>
              <p className="text-white font-medium">No Correlation (~0)</p>
              <p className="text-dashboard-muted text-sm">No linear relationship</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <div>
              <p className="text-white font-medium">Strong Negative (-0.7 to -1.0)</p>
              <p className="text-dashboard-muted text-sm">One increases as other decreases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <InsightsPanel 
        title="Correlation Insights"
        insights={insights}
      />
    </div>
  )
}

/**
 * Get human-readable correlation strength
 */
function getCorrelationStrength(value) {
  const abs = Math.abs(value)
  if (abs >= 0.7) return 'strongly'
  if (abs >= 0.5) return 'moderately'
  if (abs >= 0.3) return 'weakly'
  return 'very weakly'
}

/**
 * Correlation Card Component
 */
function CorrelationCard({ label, value }) {
  const color = value > 0.5 ? 'text-green-400' : value > 0.3 ? 'text-yellow-400' : 'text-gray-400'
  const bgColor = value > 0.5 ? 'bg-green-500/10' : value > 0.3 ? 'bg-yellow-500/10' : 'bg-gray-500/10'
  
  return (
    <div className={`${bgColor} border border-dashboard-border rounded-xl p-4`}>
      <p className="text-dashboard-muted text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value.toFixed(3)}</p>
      <p className="text-dashboard-muted text-xs mt-1">{getCorrelationStrength(value)} correlation</p>
    </div>
  )
}

/**
 * D3 Correlation Heatmap Component
 */
function D3Heatmap({ matrix, labels }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!matrix || !labels || !svgRef.current) return

    const margin = { top: 80, right: 40, bottom: 20, left: 120 }
    const containerWidth = containerRef.current?.clientWidth || 800
    const size = Math.min(containerWidth - margin.left - margin.right, 600)
    const cellSize = size / labels.length

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', size + margin.left + margin.right)
      .attr('height', size + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Color scale: red (negative) -> dark (zero) -> green (positive)
    const colorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(['#ef4444', '#1e293b', '#10b981'])

    // Create cells
    const cells = svg.selectAll('.cell')
      .data(matrix.flatMap((row, i) => row.map((value, j) => ({ value, row: i, col: j }))))
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.col * cellSize},${d.row * cellSize})`)

    // Cell rectangles
    cells.append('rect')
      .attr('width', cellSize - 2)
      .attr('height', cellSize - 2)
      .attr('rx', 4)
      .attr('fill', d => colorScale(d.value))
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 10)
      .attr('opacity', 1)

    // Cell text values
    cells.append('text')
      .attr('x', cellSize / 2)
      .attr('y', cellSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', d => Math.abs(d.value) > 0.5 ? '#ffffff' : '#94a3b8')
      .attr('font-size', cellSize > 60 ? '12px' : '10px')
      .attr('font-weight', '500')
      .text(d => d.value.toFixed(2))

    // Row labels (left)
    svg.selectAll('.row-label')
      .data(labels)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', -10)
      .attr('y', (d, i) => i * cellSize + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .text(d => formatLabel(d))

    // Column labels (top)
    svg.selectAll('.col-label')
      .data(labels)
      .enter()
      .append('text')
      .attr('class', 'col-label')
      .attr('x', (d, i) => i * cellSize + cellSize / 2)
      .attr('y', -10)
      .attr('text-anchor', 'start')
      .attr('transform', (d, i) => `rotate(-45, ${i * cellSize + cellSize / 2}, -10)`)
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .text(d => formatLabel(d))

    // Tooltip
    const tooltip = d3.select('body')
      .selectAll('.correlation-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'correlation-tooltip')
      .style('position', 'absolute')
      .style('background', '#1e293b')
      .style('border', '1px solid #334155')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '12px')
      .style('color', '#e2e8f0')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)

    cells.on('mouseenter', function(event, d) {
      d3.select(this).select('rect')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)

      tooltip
        .style('opacity', 1)
        .html(`
          <strong>${formatLabel(labels[d.row])}</strong> vs <strong>${formatLabel(labels[d.col])}</strong><br/>
          Correlation: <span style="color: ${colorScale(d.value)}">${d.value.toFixed(3)}</span>
        `)
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 10) + 'px')
    })
    .on('mouseleave', function() {
      d3.select(this).select('rect')
        .attr('stroke', 'none')

      tooltip.style('opacity', 0)
    })

    return () => {
      tooltip.remove()
    }
  }, [matrix, labels])

  return (
    <div ref={containerRef} className="w-full overflow-x-auto flex justify-center">
      <svg ref={svgRef} style={{ minHeight: '500px' }} />
    </div>
  )
}

/**
 * Format label for display
 */
function formatLabel(label) {
  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
