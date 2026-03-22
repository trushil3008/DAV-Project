/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toFixed(0)
}

/**
 * Format percentage values
 * @param {number} value - Value to format (0-1 or 0-100)
 * @param {boolean} isDecimal - Whether value is in decimal form (0-1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined) return '0%'
  const percentage = isDecimal ? value * 100 : value
  return percentage.toFixed(2) + '%'
}

/**
 * Format hours to human-readable duration
 * @param {number} hours - Number of hours
 * @returns {string} Formatted duration string
 */
export const formatDuration = (hours) => {
  if (hours === null || hours === undefined) return '0h'
  
  if (hours < 1) {
    return Math.round(hours * 60) + 'm'
  }
  if (hours < 24) {
    return hours.toFixed(1) + 'h'
  }
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return `${days}d ${remainingHours}h`
}

/**
 * Convert hour number to readable time
 * @param {number} hour - Hour of day (0-23)
 * @returns {string} Formatted time string
 */
export const formatHour = (hour) => {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

/**
 * Plotly dark theme configuration
 */
export const plotlyDarkTheme = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: {
    color: '#e2e8f0',
    family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  xaxis: {
    gridcolor: '#334155',
    linecolor: '#334155',
    tickfont: { color: '#94a3b8' }
  },
  yaxis: {
    gridcolor: '#334155',
    linecolor: '#334155',
    tickfont: { color: '#94a3b8' }
  },
  colorway: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
  margin: { t: 40, r: 20, b: 60, l: 60 }
}

/**
 * D3 color scales for consistent styling
 */
export const colorScales = {
  primary: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
  viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
  coolwarm: ['#3b4cc0', '#6a8ec7', '#b4c4df', '#f7f7f7', '#e6ac97', '#c7654a', '#b40426'],
  clusters: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
}
