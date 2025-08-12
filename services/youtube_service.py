import httpx
import json
from typing import Optional, List, Dict, Any
from config import config

class YouTubeService:
    """Service for interacting with YouTube Data API v3"""
    
    def __init__(self):
        self.api_key = config.YOUTUBE_API_KEY
        self.base_url = config.YOUTUBE_BASE_URL
        
        if not self.api_key:
            raise ValueError("YOUTUBE_API_KEY is required. Please set it in your .env file.")
        
        # Custom headers including Referer to bypass restrictions
        self.headers = {
            'User-Agent': 'MovieAggregatorService/1.0',
            'Referer': 'http://localhost:8000/',
            'Accept': 'application/json'
        }
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Make HTTP request to YouTube API with custom headers
        
        Args:
            endpoint: API endpoint (e.g., 'search', 'videos')
            params: Query parameters
            
        Returns:
            API response data or None if failed
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{endpoint}",
                    params=params,
                    headers=self.headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"API request failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            print(f"Request error: {str(e)}")
            return None
    
    async def search_movie_content(self, movie_title: str, max_results: int = 20) -> List[Dict[str, Any]]:
        """
        Search for movie-related content on YouTube
        
        Returns videos related to the movie including:
        - Trailers
        - Interviews
        - Behind the scenes
        - Reviews
        - Clips
        """
        try:
            # Search for movie-related content
            search_query = f"{movie_title} movie"
            
            params = {
                'key': self.api_key,
                'q': search_query,
                'part': 'snippet',
                'maxResults': max_results,
                'type': 'video',
                'order': 'relevance',
                'videoDuration': 'medium'  # Filter out very short/long videos
            }
            
            response_data = await self._make_request('search', params)
            
            if not response_data or 'items' not in response_data:
                return []
            
            videos = []
            for item in response_data.get('items', []):
                video_data = {
                    'id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'channel_title': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt'],
                    'thumbnail': item['snippet']['thumbnails']['high']['url'],
                    'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    'category': self._categorize_video(item['snippet']['title'], item['snippet']['description'])
                }
                videos.append(video_data)
            
            return videos
            
        except Exception as e:
            print(f"An error occurred: {e}")
            return []
    
    async def search_actor_interviews(self, actor_name: str, movie_title: str = None, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Search for actor interviews related to a specific movie
        
        Returns interview videos with the actor
        """
        try:
            # Build search query
            if movie_title:
                search_query = f"{actor_name} interview {movie_title}"
            else:
                search_query = f"{actor_name} interview"
            
            params = {
                'key': self.api_key,
                'q': search_query,
                'part': 'snippet',
                'maxResults': max_results,
                'type': 'video',
                'order': 'relevance',
                'videoDuration': 'medium'
            }
            
            response_data = await self._make_request('search', params)
            
            if not response_data or 'items' not in response_data:
                return []
            
            interviews = []
            for item in response_data.get('items', []):
                interview_data = {
                    'id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'channel_title': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt'],
                    'thumbnail': item['snippet']['thumbnails']['high']['url'],
                    'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    'actor': actor_name,
                    'movie': movie_title,
                    'category': 'interview'
                }
                interviews.append(interview_data)
            
            return interviews
            
        except Exception as e:
            print(f"An error occurred: {e}")
            return []
    
    async def get_video_details(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific video
        
        Returns video statistics and additional metadata
        """
        try:
            params = {
                'key': self.api_key,
                'part': 'snippet,statistics,contentDetails',
                'id': video_id
            }
            
            response_data = await self._make_request('videos', params)
            
            if not response_data or 'items' not in response_data:
                return None
            
            video = response_data['items'][0]
            snippet = video['snippet']
            statistics = video['statistics']
            content_details = video['contentDetails']
            
            video_details = {
                'id': video_id,
                'title': snippet['title'],
                'description': snippet['description'],
                'channel_title': snippet['channelTitle'],
                'published_at': snippet['publishedAt'],
                'thumbnail': snippet['thumbnails']['high']['url'],
                'url': f"https://www.youtube.com/watch?v={video_id}",
                'view_count': int(statistics.get('viewCount', 0)),
                'like_count': int(statistics.get('likeCount', 0)),
                'comment_count': int(statistics.get('commentCount', 0)),
                'duration': content_details['duration'],
                'category': self._categorize_video(snippet['title'], snippet['description'])
            }
            
            return video_details
            
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
    
    def _categorize_video(self, title: str, description: str) -> str:
        """
        Categorize video based on title and description
        
        Returns video category for better organization
        """
        title_lower = title.lower()
        desc_lower = description.lower()
        
        # Check for different video types
        if any(word in title_lower for word in ['trailer', 'teaser']):
            return 'trailer'
        elif any(word in title_lower for word in ['interview', 'q&a', 'qa']):
            return 'interview'
        elif any(word in title_lower for word in ['behind the scenes', 'bts', 'making of']):
            return 'behind_the_scenes'
        elif any(word in title_lower for word in ['review', 'critic']):
            return 'review'
        elif any(word in title_lower for word in ['clip', 'scene', 'moment']):
            return 'clip'
        elif any(word in title_lower for word in ['music', 'song', 'soundtrack']):
            return 'music'
        else:
            return 'other'
    
    def format_movie_data(self, movie_title: str, videos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Format movie data into our standard structure
        
        Organizes videos by category and provides summary information
        """
        # Group videos by category
        categorized_videos = {}
        for video in videos:
            category = video.get('category', 'other')
            if category not in categorized_videos:
                categorized_videos[category] = []
            categorized_videos[category].append(video)
        
        # Create summary statistics
        total_videos = len(videos)
        total_views = sum(video.get('view_count', 0) for video in videos)
        
        formatted = {
            'title': movie_title,
            'total_videos': total_videos,
            'total_views': total_views,
            'videos_by_category': categorized_videos,
            'trailers': categorized_videos.get('trailer', []),
            'interviews': categorized_videos.get('interview', []),
            'behind_the_scenes': categorized_videos.get('behind_the_scenes', []),
            'reviews': categorized_videos.get('review', []),
            'clips': categorized_videos.get('clip', []),
            'music': categorized_videos.get('music', []),
            'other': categorized_videos.get('other', []),
            'actors': [],  # Will be populated in Step 3
            'brand_products': []  # Will be populated in Step 4
        }
        
        return formatted

# Global instance
youtube_service = YouTubeService()
