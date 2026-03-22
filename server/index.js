/**
 * Express.js Server - API Gateway for YouTube Analytics Dashboard
 * Acts as a proxy to the Python FastAPI service and provides additional utilities
 * Supports multi-country datasets
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// YouTube Category ID to Name Mapping (fallback)
const CATEGORY_MAPPING = {
  1: "Film & Animation",
  2: "Autos & Vehicles",
  10: "Music",
  15: "Pets & Animals",
  17: "Sports",
  18: "Short Movies",
  19: "Travel & Events",
  20: "Gaming",
  21: "Videoblogging",
  22: "People & Blogs",
  23: "Comedy",
  24: "Entertainment",
  25: "News & Politics",
  26: "Howto & Style",
  27: "Education",
  28: "Science & Technology",
  29: "Nonprofits & Activism",
  30: "Movies",
  31: "Anime/Animation",
  32: "Action/Adventure",
  33: "Classics",
  34: "Comedy",
  35: "Documentary",
  36: "Drama",
  37: "Family",
  38: "Foreign",
  39: "Horror",
  40: "Sci-Fi/Fantasy",
  41: "Thriller",
  42: "Shorts",
  43: "Shows",
  44: "Trailers"
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'YouTube Analytics API Gateway is running' });
});

// Proxy endpoint helper - passes ALL query parameters to Python
const proxyToPython = async (endpoint, req, res) => {
  try {
    const url = new URL(endpoint, PYTHON_API_URL);
    
    // Pass ALL query parameters from the request to Python
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    
    console.log(`Proxying to: ${url.toString()}`);
    
    const response = await axios.get(url.toString(), {
      timeout: 30000 // 30 second timeout for data processing
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error proxying to ${endpoint}:`, error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'Python service unavailable', 
        details: 'Make sure the Python FastAPI server is running on port 8000' 
      });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
};

// API Routes

/**
 * GET /api/countries
 * Returns list of available countries with datasets
 */
app.get('/api/countries', async (req, res) => {
  await proxyToPython('/api/countries', req, res);
});

/**
 * GET /api/overview
 * Returns dataset overview statistics
 * Query params: country (default: IN)
 */
app.get('/api/overview', async (req, res) => {
  await proxyToPython('/api/overview', req, res);
});

/**
 * GET /api/engagement
 * Returns engagement analysis data (views vs likes, views vs comments)
 * Query params: country (default: IN), sample_size (default: 5000)
 */
app.get('/api/engagement', async (req, res) => {
  await proxyToPython('/api/engagement', req, res);
});

/**
 * GET /api/categories
 * Returns category analysis data with YouTube category names
 * Query params: country (default: IN)
 */
app.get('/api/categories', async (req, res) => {
  await proxyToPython('/api/categories', req, res);
});

/**
 * GET /api/time-analysis
 * Returns time-based analysis data
 * Query params: country (default: IN)
 */
app.get('/api/time-analysis', async (req, res) => {
  await proxyToPython('/api/time-analysis', req, res);
});

/**
 * GET /api/correlation
 * Returns correlation matrix
 * Query params: country (default: IN)
 */
app.get('/api/correlation', async (req, res) => {
  await proxyToPython('/api/correlation', req, res);
});

/**
 * GET /api/tags
 * Returns tag frequency data for word cloud
 * Query params: country (default: IN), max_words (default: 200)
 */
app.get('/api/tags', async (req, res) => {
  await proxyToPython('/api/tags', req, res);
});

/**
 * GET /api/clusters
 * Returns K-Means clustering results
 * Query params: country (default: IN), n_clusters (default: 4), sample_size (default: 5000)
 */
app.get('/api/clusters', async (req, res) => {
  await proxyToPython('/api/clusters', req, res);
});

/**
 * GET /api/category-mapping
 * Returns the category ID to name mapping (local fallback)
 */
app.get('/api/category-mapping', (req, res) => {
  res.json(CATEGORY_MAPPING);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  YouTube Analytics API Gateway`);
  console.log(`========================================`);
  console.log(`  Gateway:  http://localhost:${PORT}`);
  console.log(`  Python:   ${PYTHON_API_URL}`);
  console.log(`========================================\n`);
});
