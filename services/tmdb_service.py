import aiohttp
import asyncio
from typing import Optional, List, Dict, Any
from config import config

class TMDBService:
    """Service for interacting with The Movie Database (TMDB) API"""
    
    def __init__(self):
        self.api_key = config.TMDB_API_KEY
        self.base_url = config.TMDB_BASE_URL
        self.image_base_url = config.TMDB_IMAGE_BASE_URL
        
        if not self.api_key:
            raise ValueError("TMDB_API_KEY is required. Please set it in your .env file.")
    
    async def search_movie(self, query: str) -> Optional[Dict[str, Any]]:
        """Search for a movie by title"""
        async with aiohttp.ClientSession() as session:
            params = {
                'api_key': self.api_key,
                'query': query,
                'language': 'en-US',
                'page': 1,
                'include_adult': False
            }
            
            async with session.get(f"{self.base_url}/search/movie", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('results'):
                        return data['results'][0]  # Return first result
                return None
    
    async def get_movie_details(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific movie"""
        async with aiohttp.ClientSession() as session:
            params = {
                'api_key': self.api_key,
                'language': 'en-US',
                'append_to_response': 'credits,images'
            }
            
            async with session.get(f"{self.base_url}/movie/{movie_id}", params=params) as response:
                if response.status == 200:
                    return await response.json()
                return None
    
    async def get_movie_credits(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Get cast and crew information for a movie"""
        async with aiohttp.ClientSession() as session:
            params = {
                'api_key': self.api_key,
                'language': 'en-US'
            }
            
            async with session.get(f"{self.base_url}/movie/{movie_id}/credits", params=params) as response:
                if response.status == 200:
                    return await response.json()
                return None
    
    def format_movie_data(self, movie_data: Dict[str, Any], credits_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Format movie data into our standard structure"""
        formatted = {
            'id': movie_data.get('id'),
            'title': movie_data.get('title'),
            'original_title': movie_data.get('original_title'),
            'overview': movie_data.get('overview'),
            'release_date': movie_data.get('release_date'),
            'year': movie_data.get('release_date', '')[:4] if movie_data.get('release_date') else None,
            'runtime': movie_data.get('runtime'),
            'genres': [genre['name'] for genre in movie_data.get('genres', [])],
            'poster_path': f"{self.image_base_url}{movie_data.get('poster_path')}" if movie_data.get('poster_path') else None,
            'backdrop_path': f"{self.image_base_url}{movie_data.get('backdrop_path')}" if movie_data.get('backdrop_path') else None,
            'vote_average': movie_data.get('vote_average'),
            'vote_count': movie_data.get('vote_count'),
            'actors': [],
            'interviews': [],  # Will be populated in Step 3
            'brand_products': []  # Will be populated in Step 4
        }
        
        # Add actor information if credits data is available
        if credits_data and 'cast' in credits_data:
            # Get top 10 actors by order
            top_actors = sorted(credits_data['cast'], key=lambda x: x.get('order', 999))[:10]
            formatted['actors'] = [
                {
                    'id': actor.get('id'),
                    'name': actor.get('name'),
                    'character': actor.get('character'),
                    'profile_path': f"{self.image_base_url}{actor.get('profile_path')}" if actor.get('profile_path') else None,
                    'order': actor.get('order')
                }
                for actor in top_actors
            ]
        
        return formatted

# Global instance
tmdb_service = TMDBService()
