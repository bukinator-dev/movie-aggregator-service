import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration settings for the Movie Aggregator Service"""
    
    # Service settings
    SERVICE_NAME = "Movie Aggregator Service"
    SERVICE_VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # API settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    
    # External API settings - Step 2: YouTube API Integration
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3"
    
    # YouTube API optimization settings
    YOUTUBE_REQUEST_TIMEOUT = float(os.getenv("YOUTUBE_REQUEST_TIMEOUT", "15.0"))
    YOUTUBE_BATCH_SIZE = int(os.getenv("YOUTUBE_BATCH_SIZE", "50"))
    YOUTUBE_MAX_RESULTS = int(os.getenv("YOUTUBE_MAX_RESULTS", "50"))
    
    # Future API settings (will be used in Steps 3-4)
    # NEWS_API_KEY = os.getenv("NEWS_API_KEY")  # For additional interview data
    # SHOPIFY_API_KEY = os.getenv("SHOPIFY_API_KEY")  # For product data
    
    # Rate limiting (will be implemented in future steps)
    MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "100"))
    
    # Cache settings (will be implemented in future steps)
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour in seconds

# Global config instance
config = Config()

