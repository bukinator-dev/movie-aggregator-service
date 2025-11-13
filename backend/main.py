from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
import uvicorn
import sys
import re
import time
from pathlib import Path
from collections import defaultdict

# Add the parent directory to the Python path to access services
sys.path.append(str(Path(__file__).parent.parent))

from services.youtube_service import youtube_service

app = FastAPI(
    title="Movie Aggregator Service",
    description="Aggregates interviews with actors and brand-related products for movies",
    version="1.0.0"
)

# Add security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]  # Add your production domain
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your production domain
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Simple rate limiting storage
rate_limit_storage = defaultdict(list)

def rate_limit_check(client_ip: str, max_requests: int = 100, window: int = 60) -> bool:
    """Simple rate limiting check"""
    current_time = time.time()
    # Clean old requests
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip] 
        if current_time - req_time < window
    ]
    
    # Check if limit exceeded
    if len(rate_limit_storage[client_ip]) >= max_requests:
        return False
    
    # Add current request
    rate_limit_storage[client_ip].append(current_time)
    return True

def validate_input(text: str, max_length: int = 100) -> str:
    """Validate and sanitize input"""
    if not text or not isinstance(text, str):
        raise HTTPException(status_code=400, detail="Invalid input")
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', text.strip())
    
    if len(sanitized) > max_length:
        raise HTTPException(status_code=400, detail=f"Input too long. Max {max_length} characters.")
    
    if len(sanitized) < 1:
        raise HTTPException(status_code=400, detail="Input cannot be empty")
    
    return sanitized

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

class ActorInfo(BaseModel):
    name: str
    movies: List[str]
    total_interviews: int
    total_views: int
    interviews: List[Video]
    recent_content: List[Video]
    top_interviews: List[Video]
    # Step 3: Enhanced actor information
    career_timeline: List[Dict[str, Any]] = []
    interview_categories: Dict[str, int] = {}
    collaboration_network: List[Dict[str, Any]] = []
    social_media_presence: Dict[str, Any] = {}
    awards_and_nominations: List[str] = []
    biography: Optional[str] = None
    birth_date: Optional[str] = None
    nationality: Optional[str] = None
    total_movies: int = 0
    average_rating: Optional[float] = None
    genres: List[str] = []
    years_active: Optional[str] = None

class ActorCareerEntry(BaseModel):
    year: int
    movie_title: str
    role: Optional[str] = None
    type: str  # 'movie', 'tv_show', 'documentary', 'voice_role'
    rating: Optional[float] = None
    box_office: Optional[str] = None

class ActorCollaboration(BaseModel):
    collaborator_name: str
    collaboration_type: str  # 'co-star', 'director', 'producer'
    movies: List[str]
    interview_count: int
    total_views: int

class InterviewCategory(BaseModel):
    category: str  # 'press_junket', 'talk_show', 'podcast', 'red_carpet', 'behind_scenes'
    count: int
    total_views: int
    average_duration: Optional[str] = None
    examples: List[Video] = []

class ActorDiscoveryResult(BaseModel):
    actor_name: str
    confidence_score: float  # 0.0 to 1.0
    interview_count: int
    total_views: int
    recent_activity: str  # 'high', 'medium', 'low'
    primary_genres: List[str]
    sample_interviews: List[Video] = []

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
        message="Movie Aggregator Service is running! Step 3: Actor Interview Aggregation Complete"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Service is operational"
    )

@app.get("/movie/{movie_title}", response_model=MovieInfo)
async def get_movie_info(movie_title: str, max_results: int = 50, request: Request = None):
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
        # Rate limiting check
        if request:
            client_ip = request.client.host
            if not rate_limit_check(client_ip):
                raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        
        # Input validation
        movie_title = validate_input(movie_title, max_length=100)
        if max_results > 100:
            max_results = 100  # Cap at 100 to prevent abuse
        # Step 2: YouTube content search for movies (now optimized with batch fetching)
        videos = await youtube_service.search_movie_content(movie_title, max_results)
        
        if not videos:
            raise HTTPException(
                status_code=404, 
                detail=f"No content found for movie '{movie_title}'"
            )
        
        # Format the data using our service (videos already have detailed info from batch fetch)
        formatted_movie = youtube_service.format_movie_data(movie_title, videos)
        
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
async def search_videos(query: str, max_results: int = 8):
    """
    Search for videos (Step 2 enhancement)
    
    Returns a list of videos matching the search query
    Note: Reduced default max_results to prevent timeout issues
    """
    try:
        videos = await youtube_service.search_movie_content(query, max_results)
        
        if not videos:
            return []
        
        # Videos already have detailed information from batch fetch
        return [Video(**video) for video in videos]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching videos: {str(e)}"
        )

@app.get("/interviews/{actor_name}", response_model=List[Video])
async def get_actor_interviews(actor_name: str, movie_title: str = None, max_results: int = 8):
    """
    Get actor interviews (Step 2 enhancement)
    
    Returns interview videos for a specific actor, optionally filtered by movie
    Note: Reduced default max_results to prevent timeout issues
    """
    try:
        interviews = await youtube_service.search_actor_interviews(actor_name, movie_title, max_results)
        
        if not interviews:
            return []
        
        # Interviews already have detailed information from batch fetch
        return [Video(**interview) for interview in interviews]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching actor interviews: {str(e)}"
        )

@app.get("/actor/{actor_name}", response_model=ActorInfo)
async def get_actor_info(actor_name: str, max_results: int = 15):
    """
    Get comprehensive actor information (Step 3: Actor Aggregation)
    
    Returns:
    - Actor's interview content with enhanced categorization
    - Movies they've been in with career timeline
    - Recent content and top interviews
    - Statistics and engagement metrics
    - Interview categories and collaboration network
    - Career information and social media presence
    """
    try:
        # Search for actor interviews (now optimized with batch fetching)
        interviews = await youtube_service.search_actor_interviews(actor_name, None, max_results)
        
        if not interviews:
            raise HTTPException(
                status_code=404,
                detail=f"No content found for actor '{actor_name}'"
            )
        
        # Interviews already have detailed information from batch fetch
        detailed_interviews = interviews
        
        # Extract movie mentions from interview titles and descriptions
        movies = youtube_service.extract_movies_from_content(detailed_interviews)
        
        # Get recent content (last 6 months)
        recent_content = youtube_service.get_recent_content(detailed_interviews)
        
        # Get top interviews by view count
        top_interviews = youtube_service.get_top_interviews(detailed_interviews)
        
        # Step 3: Enhanced actor analysis
        interview_categories = youtube_service.categorize_interviews(detailed_interviews)
        career_timeline = youtube_service.build_career_timeline(actor_name, movies, detailed_interviews)
        collaboration_network = youtube_service.extract_collaborations(detailed_interviews, actor_name)
        social_media_presence = youtube_service.extract_social_media_info(detailed_interviews, actor_name)
        
        # Calculate enhanced statistics
        total_interviews = len(detailed_interviews)
        total_views = sum(interview.get('view_count', 0) for interview in detailed_interviews)
        total_movies = len(movies)
        
        # Calculate average rating from available data
        ratings = [interview.get('rating', 0) for interview in detailed_interviews if interview.get('rating')]
        average_rating = sum(ratings) / len(ratings) if ratings else None
        
        # Extract genres from movie mentions
        genres = youtube_service.extract_genres_from_content(detailed_interviews)
        
        actor_info = {
            'name': actor_name,
            'movies': movies,
            'total_interviews': total_interviews,
            'total_views': total_views,
            'interviews': detailed_interviews,
            'recent_content': recent_content,
            'top_interviews': top_interviews,
            # Step 3: Enhanced information
            'career_timeline': career_timeline,
            'interview_categories': interview_categories,
            'collaboration_network': collaboration_network,
            'social_media_presence': social_media_presence,
            'awards_and_nominations': [],  # Will be populated in future steps
            'biography': None,  # Will be populated in future steps
            'birth_date': None,  # Will be populated in future steps
            'nationality': None,  # Will be populated in future steps
            'total_movies': total_movies,
            'average_rating': average_rating,
            'genres': genres,
            'years_active': None  # Will be populated in future steps
        }
        
        return ActorInfo(**actor_info)
        
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Service configuration error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching actor information: {str(e)}"
        )

@app.get("/discover/actors", response_model=List[ActorDiscoveryResult])
async def discover_actors_from_movie(movie_title: str, max_results: int = 50):
    """
    Discover actors from a movie (Step 3: Actor Discovery)
    
    Returns a list of actors found in movie-related content with:
    - Confidence scores for actor identification
    - Interview counts and engagement metrics
    - Recent activity levels
    - Primary genres and sample interviews
    """
    try:
        # Search for movie content to find actor mentions (now optimized)
        movie_content = await youtube_service.search_movie_content(movie_title, max_results * 2)
        
        if not movie_content:
            raise HTTPException(
                status_code=404,
                detail=f"No content found for movie '{movie_title}'"
            )
        
        # Extract actor names from video titles and descriptions with enhanced analysis
        actors = youtube_service.extract_actors_from_movie_content_enhanced(movie_content, movie_title)
        
        # Limit results and return enhanced actor discovery data
        return actors[:max_results]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error discovering actors: {str(e)}"
        )

@app.get("/actors/search", response_model=List[ActorDiscoveryResult])
async def search_actors(query: str, max_results: int = 50):
    """
    Search for actors by name or partial match (Step 3: Actor Search)
    
    Returns actors matching the search query with confidence scores
    and sample interview data
    """
    try:
        # Search for actors using the query
        actors = await youtube_service.search_actors_by_name(query, max_results)
        
        if not actors:
            return []
        
        return actors
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching actors: {str(e)}"
        )

@app.get("/actor/{actor_name}/interviews/analysis", response_model=Dict[str, Any])
async def analyze_actor_interviews(actor_name: str, max_results: int = 20):
    """
    Analyze actor interviews for insights (Step 3: Interview Analysis)
    
    Returns detailed analysis including:
    - Interview patterns and trends
    - Topic analysis and common themes
    - Engagement metrics over time
    - Interview quality assessment
    """
    try:
        # Get actor interviews
        interviews = await youtube_service.search_actor_interviews(actor_name, None, max_results)
        
        if not interviews:
            raise HTTPException(
                status_code=404,
                detail=f"No interviews found for actor '{actor_name}'"
            )
        
        # Perform interview analysis
        analysis = youtube_service.analyze_interview_patterns(interviews, actor_name)
        
        return analysis
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing actor interviews: {str(e)}"
        )

@app.get("/actor/{actor_name}/career", response_model=List[ActorCareerEntry])
async def get_actor_career(actor_name: str, max_results: int = 50):
    """
    Get actor career timeline and filmography (Step 3: Career Analysis)
    
    Returns chronological list of actor's work with:
    - Movie/TV show appearances
    - Roles and character names
    - Ratings and box office data
    - Career milestones
    """
    try:
        # Get actor's career information
        career = await youtube_service.get_actor_career_timeline(actor_name, max_results)
        
        if not career:
            raise HTTPException(
                status_code=404,
                detail=f"No career information found for actor '{actor_name}'"
            )
        
        return career
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching actor career: {str(e)}"
        )

@app.get("/actor/{actor_name}/collaborations", response_model=List[ActorCollaboration])
async def get_actor_collaborations(actor_name: str, max_results: int = 20):
    """
    Get actor's collaboration network (Step 3: Collaboration Analysis)
    
    Returns list of people the actor has worked with:
    - Co-stars, directors, producers
    - Movies they collaborated on
    - Interview mentions and engagement
    """
    try:
        # Get actor's collaboration network
        collaborations = await youtube_service.get_actor_collaborations(actor_name, max_results)
        
        if not collaborations:
            return []
        
        return collaborations
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching actor collaborations: {str(e)}"
        )

@app.get("/actors/trending", response_model=List[ActorDiscoveryResult])
async def get_trending_actors(period: str = "week", max_results: int = 50):
    """
    Get trending actors based on recent interview activity (Step 3: Trending Analysis)
    
    Returns actors with high recent interview activity:
    - Period: 'day', 'week', 'month'
    - Based on interview frequency and engagement
    - Recent activity levels and sample content
    """
    try:
        # Get trending actors
        trending_actors = await youtube_service.get_trending_actors(period, max_results)
        
        if not trending_actors:
            return []
        
        return trending_actors
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching trending actors: {str(e)}"
        )

@app.get("/actors/genre/{genre}", response_model=List[ActorDiscoveryResult])
async def get_actors_by_genre(genre: str, max_results: int = 15):
    """
    Get actors known for specific genres (Step 3: Genre Analysis)
    
    Returns actors associated with the specified genre:
    - Based on movie mentions and interview content
    - Genre-specific interview counts
    - Sample interviews and engagement metrics
    """
    try:
        # Get actors by genre
        actors = await youtube_service.get_actors_by_genre(genre, max_results)
        
        if not actors:
            return []
        
        return actors
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching actors by genre: {str(e)}"
        )

@app.get("/movie/{movie_title}/soundtrack", response_model=Dict[str, Any])
async def get_movie_soundtrack(movie_title: str, max_results: int = 50):
    """
    Get soundtrack and music information for a movie or TV show
    
    Returns:
    - Original soundtrack information
    - Music-related videos (covers, remixes, analysis)
    - Song lists and track information
    - Music videos and performances
    """
    try:
        # Search for music-related content
        music_videos = await youtube_service.search_movie_content(f"{movie_title} soundtrack", max_results)
        music_covers = await youtube_service.search_movie_content(f"{movie_title} music cover", max_results // 2)
        music_analysis = await youtube_service.search_movie_content(f"{movie_title} music analysis", max_results // 2)
        
        # Combine and categorize music content
        soundtrack_info = {
            "movie_title": movie_title,
            "original_soundtrack": {
                "tracks": [],  # Will be populated in future steps with external music APIs
                "composer": None,
                "release_date": None,
                "total_tracks": 0
            },
            "music_videos": music_videos,
            "music_covers": music_covers,
            "music_analysis": music_analysis,
            "total_music_content": len(music_videos) + len(music_covers) + len(music_analysis),
            "categories": {
                "soundtrack": len(music_videos),
                "covers": len(music_covers),
                "analysis": len(music_analysis)
            }
        }
        
        return soundtrack_info
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching soundtrack information: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

