import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for fetching data with loading and error states
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Array} deps - Dependencies array for re-fetching
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use ref to store the latest fetchFn without causing re-renders
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFnRef.current()
      setData(result)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, []) // No dependencies - uses ref instead

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) // Only re-fetch when deps change

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

export default useFetch
