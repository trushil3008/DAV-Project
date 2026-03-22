import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 second timeout for data processing endpoints
  headers: {
    'Content-Type': 'application/json'
  }
})

// API endpoints
export const endpoints = {
  countries: '/countries',
  overview: '/overview',
  engagement: '/engagement',
  categories: '/categories',
  timeAnalysis: '/time-analysis',
  correlation: '/correlation',
  tags: '/tags',
  clusters: '/clusters'
}

/**
 * Fetch available countries
 */
export const fetchCountries = async () => {
  const response = await api.get(endpoints.countries)
  return response.data
}

/**
 * Fetch dataset overview statistics
 * @param {string} country - Country code
 */
export const fetchOverview = async (country = 'IN') => {
  const response = await api.get(endpoints.overview, {
    params: { country }
  })
  return response.data
}

/**
 * Fetch engagement analysis data
 * @param {string} country - Country code
 * @param {number} sampleSize - Number of points to sample for scatter plots
 */
export const fetchEngagement = async (country = 'IN', sampleSize = 5000) => {
  const response = await api.get(endpoints.engagement, {
    params: { country, sample_size: sampleSize }
  })
  return response.data
}

/**
 * Fetch category analysis data
 * @param {string} country - Country code
 */
export const fetchCategories = async (country = 'IN') => {
  const response = await api.get(endpoints.categories, {
    params: { country }
  })
  return response.data
}

/**
 * Fetch time-based analysis data
 * @param {string} country - Country code
 */
export const fetchTimeAnalysis = async (country = 'IN') => {
  const response = await api.get(endpoints.timeAnalysis, {
    params: { country }
  })
  return response.data
}

/**
 * Fetch correlation matrix data
 * @param {string} country - Country code
 */
export const fetchCorrelation = async (country = 'IN') => {
  const response = await api.get(endpoints.correlation, {
    params: { country }
  })
  return response.data
}

/**
 * Fetch tag frequency data for word cloud
 * @param {string} country - Country code
 * @param {number} maxWords - Maximum number of words to return
 */
export const fetchTags = async (country = 'IN', maxWords = 200) => {
  const response = await api.get(endpoints.tags, {
    params: { country, max_words: maxWords }
  })
  return response.data
}

/**
 * Fetch clustering results
 * @param {string} country - Country code
 * @param {number} nClusters - Number of clusters
 * @param {number} sampleSize - Number of points to sample
 */
export const fetchClusters = async (country = 'IN', nClusters = 4, sampleSize = 5000) => {
  const response = await api.get(endpoints.clusters, {
    params: { country, n_clusters: nClusters, sample_size: sampleSize }
  })
  return response.data
}

export default api
