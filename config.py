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
    
    # External API settings (will be used in future steps)
    # TMDB_API_KEY = os.getenv("TMDB_API_KEY")  # For movie data
    # NEWS_API_KEY = os.getenv("NEWS_API_KEY")  # For interview data
    # SHOPIFY_API_KEY = os.getenv("SHOPIFY_API_KEY")  # For product data
    
    # Rate limiting (will be implemented in future steps)
    MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "100"))
    
    # Cache settings (will be implemented in future steps)
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour in seconds

# Global config instance
config = Config()

