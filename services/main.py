"""
FastAPI Server for YouTube Trending Videos Analytics
Provides REST API endpoints for data analysis with multi-country support
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_processor import get_processor, get_available_countries, COUNTRIES
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="YouTube Analytics API",
    description="API for YouTube Trending Videos Data Analysis (Multi-Country)",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {"status": "healthy", "message": "YouTube Analytics API is running", "version": "2.0.0"}


@app.get("/api/countries")
async def get_countries():
    """
    Get list of available countries with datasets
    Returns: list of country codes, names, and flags
    """
    try:
        countries = get_available_countries()
        return {"countries": countries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/overview")
async def get_overview(country: str = "IN"):
    """
    Get dataset overview statistics
    Returns: total videos, avg views, avg engagement, date range, etc.
    """
    try:
        processor = get_processor(country)
        data = processor.get_overview()
        data["country"] = {
            "code": country.upper(),
            "name": COUNTRIES.get(country.upper(), {}).get("name", "Unknown"),
            "flag": COUNTRIES.get(country.upper(), {}).get("flag", "")
        }
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/engagement")
async def get_engagement(country: str = "IN", sample_size: int = 5000):
    """
    Get engagement analysis data
    Returns: scatter plot data (views vs likes, views vs comments), 
             engagement rate distribution, statistics
    """
    try:
        processor = get_processor(country)
        return processor.get_engagement_data(sample_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories")
async def get_categories(country: str = "IN"):
    """
    Get category analysis data
    Returns: category counts, avg views by category, insights
    """
    try:
        processor = get_processor(country)
        return processor.get_category_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/time-analysis")
async def get_time_analysis(country: str = "IN"):
    """
    Get time-based analysis data
    Returns: time_to_trend distribution, publish hour frequency, 
             hourly metrics, optimal upload times
    """
    try:
        processor = get_processor(country)
        return processor.get_time_analysis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/correlation")
async def get_correlation(country: str = "IN"):
    """
    Get correlation matrix for engagement metrics
    Returns: correlation matrix (views, likes, dislikes, comments)
    """
    try:
        processor = get_processor(country)
        return processor.get_correlation_matrix()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tags")
async def get_tags(country: str = "IN", max_words: int = 200):
    """
    Get tag frequency data for word cloud
    Returns: word frequencies for generating word cloud
    """
    try:
        processor = get_processor(country)
        return processor.get_tags_data(max_words)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clusters")
async def get_clusters(country: str = "IN", n_clusters: int = 4, sample_size: int = 5000):
    """
    Get K-Means clustering results
    Returns: cluster assignments, cluster statistics, elbow chart data
    """
    try:
        processor = get_processor(country)
        return processor.get_clusters(n_clusters, sample_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
