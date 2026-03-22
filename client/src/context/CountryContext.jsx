import { createContext, useContext, useState, useEffect } from 'react'
import { fetchCountries } from '../utils/api'

/**
 * Country Context for managing selected country across the app
 */
const CountryContext = createContext(null)

/**
 * Country Provider Component
 */
export function CountryProvider({ children }) {
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('IN')
  const [countryInfo, setCountryInfo] = useState({
    code: 'IN',
    name: 'India',
    flag: ''
  })
  const [loading, setLoading] = useState(true)

  // Load available countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries()
        setCountries(data.countries || [])
        
        // Set initial country info
        const initial = data.countries?.find(c => c.code === 'IN') || data.countries?.[0]
        if (initial) {
          setSelectedCountry(initial.code)
          setCountryInfo(initial)
        }
      } catch (error) {
        console.error('Failed to load countries:', error)
        // Set default if API fails
        setCountries([{ code: 'IN', name: 'India', flag: '' }])
      } finally {
        setLoading(false)
      }
    }

    loadCountries()
  }, [])

  // Update country info when selection changes
  const changeCountry = (countryCode) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(countryCode)
      setCountryInfo(country)
    }
  }

  const value = {
    countries,
    selectedCountry,
    countryInfo,
    changeCountry,
    loading
  }

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  )
}

/**
 * Hook to use country context
 */
export function useCountry() {
  const context = useContext(CountryContext)
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}

export default CountryContext
