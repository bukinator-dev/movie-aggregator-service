from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from services.youtube_service import youtube_service

app = FastAPI(
    title="Movie Aggregator Service",
    description="Aggregates interviews with actors and brand-related products for movies",
    version="1.0.0"
)

# Data models - Updated for Step 2: YouTube Integration
class Video(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    channel_title: Optional[str] = None
    published_at: Optional[str] = None
    thumbnail: Optional[str] = None
    url: str
    category: str
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    duration: Optional[str] = None

class MovieInfo(BaseModel):
    title: str
    total_videos: int
    total_views: int
    videos_by_category: Dict[str, List[Video]]
    trailers: List[Video]
    interviews: List[Video]
    behind_the_scenes: List[Video]
    reviews: List[Video]
    clips: List[Video]
    music: List[Video]
    other: List[Video]
    actors: List[Dict[str, Any]] = []  # Will be populated in Step 3
    brand_products: List[Dict[str, Any]] = []  # Will be populated in Step 4

class HealthResponse(BaseModel):
    status: str
    message: str

class ErrorResponse(BaseModel):
    error: str
    message: str

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint with service information"""
    return HealthResponse(
        status="healthy",
        message="Movie Aggregator Service is running! Step 2: YouTube API Integration Complete"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Service is operational"
    )

@app.get("/movie/{movie_title}", response_model=MovieInfo)
async def get_movie_info(movie_title: str, max_results: int = 20):
    """
    Get movie information with YouTube content (Step 2 implementation)
    
    This endpoint now:
    - Searches YouTube for movie-related content
    - Categorizes videos (trailers, interviews, behind-the-scenes, etc.)
    - Returns structured video data with thumbnails and metadata
    - Provides view counts and engagement metrics
    
    In future steps, we'll add:
    - Actor interview aggregation (Step 3)
    - Brand/product aggregation (Step 4)
    """
    try:
        # Step 2: YouTube content search for movies
        videos = youtube_service.search_movie_content(movie_title, max_results)
        
        if not videos:
            raise HTTPException(
                status_code=404, 
                detail=f"No content found for movie '{movie_title}'"
            )
        
        # Get detailed video information for each video
        detailed_videos = []
        for video in videos:
            video_details = youtube_service.get_video_details(video['id'])
            if video_details:
                detailed_videos.append(video_details)
            else:
                # Fallback to basic video data if details fetch fails
                detailed_videos.append(video)
        
        # Format the data using our service
        formatted_movie = youtube_service.format_movie_data(movie_title, detailed_videos)
        
        return MovieInfo(**formatted_movie)
        
    except ValueError as e:
        # Configuration error (missing API key)
        raise HTTPException(
            status_code=500,
            detail=f"Service configuration error: {str(e)}"
        )
    except Exception as e:
        # Other errors
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching movie content: {str(e)}"
        )

@app.get("/search/{query}", response_model=List[Video])
async def search_videos(query: str, max_results: int = 10):
    """
    Search for videos (Step 2 enhancement)
    
    Returns a list of videos matching the search query
    """
    try:
        videos = youtube_service.search_movie_content(query, max_results)
        
        if not videos:
            return []
        
        # Get detailed information for each video
        detailed_videos = []
        for video in videos:
            video_details = youtube_service.get_video_details(video['id'])
            if video_details:
                detailed_videos.append(video_details)
            else:
                detailed_videos.append(video)
        
        return [Video(**video) for video in detailed_videos]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching videos: {str(e)}"
        )

@app.get("/interviews/{actor_name}", response_model=List[Video])
async def get_actor_interviews(actor_name: str, movie_title: str = None, max_results: int = 10):
    """
    Get actor interviews (Step 2 enhancement)
    
    Returns interview videos for a specific actor, optionally filtered by movie
    """
    try:
        interviews = youtube_service.search_actor_interviews(actor_name, movie_title, max_results)
        
        if not interviews:
            return []
        
        # Get detailed information for each interview
        detailed_interviews = []
        for interview in interviews:
            interview_details = youtube_service.get_video_details(interview['id'])
            if interview_details:
                detailed_interviews.append(interview_details)
            else:
                detailed_interviews.append(interview)
        
        return [Video(**interview) for interview in detailed_interviews]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching actor interviews: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

