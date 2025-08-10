from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="Movie Aggregator Service",
    description="Aggregates interviews with actors and brand-related products for movies",
    version="1.0.0"
)

# Data models
class MovieInfo(BaseModel):
    title: str
    year: Optional[int] = None
    actors: List[str] = []
    interviews: List[dict] = []
    brand_products: List[dict] = []

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint with service information"""
    return HealthResponse(
        status="healthy",
        message="Movie Aggregator Service is running!"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Service is operational"
    )

@app.get("/movie/{movie_title}", response_model=MovieInfo)
async def get_movie_info(movie_title: str):
    """
    Get basic movie information (Step 1 implementation)
    
    This is our starting point. In future steps, we'll add:
    - Real movie data fetching
    - Actor interview aggregation
    - Brand/product aggregation
    """
    # Step 1: Basic mock response
    # In future steps, this will call external APIs and aggregate real data
    
    # Simple mock data for now
    mock_movie = MovieInfo(
        title=movie_title,
        year=2024,
        actors=["Actor 1", "Actor 2", "Actor 3"],
        interviews=[],  # Will be populated in Step 2
        brand_products=[]  # Will be populated in Step 3
    )
    
    return mock_movie

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

