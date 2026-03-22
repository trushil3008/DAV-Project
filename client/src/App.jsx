import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CountryProvider } from './context/CountryContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Engagement from './pages/Engagement'
import Categories from './pages/Categories'
import TimeAnalysis from './pages/TimeAnalysis'
import Correlation from './pages/Correlation'
import TagCloud from './pages/TagCloud'
import Clustering from './pages/Clustering'

/**
 * Main App Component
 * Sets up routing and context providers for the YouTube Analytics Dashboard
 */
function App() {
  return (
    <CountryProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/engagement" element={<Engagement />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/time-analysis" element={<TimeAnalysis />} />
            <Route path="/correlation" element={<Correlation />} />
            <Route path="/tags" element={<TagCloud />} />
            <Route path="/clustering" element={<Clustering />} />
          </Routes>
        </Layout>
      </Router>
    </CountryProvider>
  )
}

export default App
