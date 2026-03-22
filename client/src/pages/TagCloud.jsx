import { useMemo, useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import cloud from 'd3-cloud'
import { useFetch } from '../hooks/useFetch'
import { useCountry } from '../context/CountryContext'
import { fetchTags } from '../utils/api'
import { formatNumber } from '../utils/formatters'
import ChartCard from '../components/ChartCard'
import InsightsPanel from '../components/InsightsPanel'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Tag Cloud Page
 * Displays word cloud visualization of video tags
 */
export default function TagCloud() {
  const { selectedCountry, countryInfo } = useCountry()
  const [maxWords, setMaxWords] = useState(100)
  const { data, loading, error, refetch } = useFetch(
    () => fetchTags(selectedCountry, maxWords), 
    [selectedCountry, maxWords]
  )

  // Transform data for components - API returns {text, value} format
  const tags = useMemo(() => {
    if (!data?.words) return []
    return data.words.map(w => ({ word: w.text, count: w.value }))
  }, [data])

  // Generate insights from tag data
  const insights = useMemo(() => {
    if (!data?.words || data.words.length === 0) return []
    const topTag = data.words[0]
    return [
      `The dataset contains ${formatNumber(data.unique_words)} unique tags across all trending videos.`,
      `The most common tag "${topTag.text}" appears ${formatNumber(topTag.value)} times, indicating its popularity among creators.`,
      `A total of ${formatNumber(data.total_tags_processed)} tag words were processed from the ${countryInfo?.name || 'selected'} dataset.`,
      `Tags related to the top categories (Entertainment, Music, Gaming) dominate the tag cloud.`,
      `Regional language tags may be prevalent, reflecting the ${countryInfo?.name || 'local'} YouTube landscape.`
    ]
  }, [data])

  if (loading) {
    return <LoadingSpinner message="Analyzing video tags..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  const topTag = data.words?.[0] || { text: 'N/A', value: 0 }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tag Analysis</h1>
          <p className="text-dashboard-muted mt-2">
            Explore the most common tags used in trending videos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-dashboard-muted text-sm">Max Words:</label>
          <select
            value={maxWords}
            onChange={(e) => setMaxWords(Number(e.target.value))}
            className="bg-dashboard-card border border-dashboard-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
        </div>
      </div>

      {/* Tag Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Unique Tags" 
          value={formatNumber(data.unique_words)}
          icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
        <StatCard 
          label="Top Tag" 
          value={topTag.text}
          subValue={`${formatNumber(topTag.value)} uses`}
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
        <StatCard 
          label="Total Words Processed" 
          value={formatNumber(data.total_tags_processed)}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
        <StatCard 
          label="Tags Displayed" 
          value={tags.length}
          icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </div>

      {/* Word Cloud Visualization */}
      <ChartCard 
        title="Tag Word Cloud" 
        description="Size represents frequency - larger tags appear more often in trending videos"
      >
        <D3WordCloud words={tags} />
      </ChartCard>

      {/* Top Tags Bar Chart */}
      <ChartCard 
        title="Top 20 Tags" 
        description="Most frequently used tags in trending videos"
      >
        <D3BarChart data={tags.slice(0, 20)} />
      </ChartCard>

      {/* Insights Panel */}
      <InsightsPanel 
        title="Tag Insights"
        insights={insights}
      />
    </div>
  )
}

/**
 * Statistics Card Component
 */
function StatCard({ label, value, subValue, icon }) {
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-dashboard-muted text-sm">{label}</p>
          <p className="text-xl font-bold text-white truncate">{value}</p>
          {subValue && <p className="text-xs text-dashboard-muted">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * D3 Word Cloud Component using d3-cloud for proper layout
 */
function D3WordCloud({ words }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || 800
        setDimensions({ width, height: 500 })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!words || words.length === 0 || !svgRef.current) return

    const { width, height } = dimensions

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Scale for font sizes
    const maxCount = d3.max(words, d => d.count)
    const minCount = d3.min(words, d => d.count)
    const fontScale = d3.scaleLinear()
      .domain([minCount, maxCount])
      .range([14, 72])

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .range([
        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#ef4444', '#6366f1', '#14b8a6', '#f97316',
        '#84cc16', '#22d3ee', '#a855f7', '#fb7185', '#fbbf24'
      ])

    // Prepare words for d3-cloud
    const cloudWords = words.map(d => ({
      text: d.word,
      size: fontScale(d.count),
      count: d.count
    }))

    // Create cloud layout
    const layout = cloud()
      .size([width, height])
      .words(cloudWords)
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90 * (Math.random() > 0.5 ? 1 : -1)))
      .font('Inter, system-ui, sans-serif')
      .fontSize(d => d.size)
      .spiral('archimedean')
      .on('end', draw)

    layout.start()

    function draw(words) {
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)

      const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)

      // Create tooltip
      const tooltip = d3.select('body')
        .selectAll('.wordcloud-tooltip')
        .data([0])
        .join('div')
        .attr('class', 'wordcloud-tooltip')
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
        .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.3)')

      g.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => d.size + 'px')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('font-weight', d => d.size > 40 ? '700' : d.size > 25 ? '600' : '500')
        .style('fill', (d, i) => colorScale(i))
        .style('cursor', 'pointer')
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text)
        .style('opacity', 0)
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('font-size', (d.size * 1.15) + 'px')

          tooltip
            .style('opacity', 1)
            .html(`<strong>${d.text}</strong><br/>Count: ${formatNumber(d.count)}`)
        })
        .on('mousemove', function(event) {
          tooltip
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px')
        })
        .on('mouseleave', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.9)
            .style('font-size', d.size + 'px')

          tooltip.style('opacity', 0)
        })
        .transition()
        .duration(600)
        .delay((d, i) => i * 10)
        .style('opacity', 0.9)
    }

    return () => {
      d3.select('body').selectAll('.wordcloud-tooltip').remove()
    }
  }, [words, dimensions])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} style={{ minHeight: '500px', width: '100%' }} />
    </div>
  )
}

/**
 * D3 Horizontal Bar Chart for Top Tags
 */
function D3BarChart({ data }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return

    const margin = { top: 20, right: 80, bottom: 20, left: 120 }
    const width = containerRef.current.clientWidth - margin.left - margin.right
    const barHeight = 28
    const height = data.length * barHeight

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([0, width])

    const y = d3.scaleBand()
      .domain(data.map(d => d.word))
      .range([0, height])
      .padding(0.2)

    // Color scale based on count
    const colorScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.count), d3.max(data, d => d.count)])
      .range(['#3b82f6', '#06b6d4'])

    // Grid lines
    svg.append('g')
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
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.word))
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', d => colorScale(d.count))
      .attr('x', 0)
      .attr('width', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 30)
      .attr('width', d => x(d.count))

    // Labels (left)
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -10)
      .attr('y', d => y(d.word) + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .text(d => d.word.length > 15 ? d.word.slice(0, 15) + '...' : d.word)

    // Count values (right of bars)
    svg.selectAll('.count')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'count')
      .attr('x', d => x(d.count) + 8)
      .attr('y', d => y(d.word) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('opacity', 0)
      .text(d => formatNumber(d.count))
      .transition()
      .duration(800)
      .delay((d, i) => i * 30 + 400)
      .attr('opacity', 1)

  }, [data])

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg ref={svgRef} style={{ minHeight: '600px' }} />
    </div>
  )
}
