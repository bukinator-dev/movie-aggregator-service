from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import Optional, List, Dict, Any
from config import config
import re

class YouTubeService:
    """Service for interacting with YouTube Data API v3"""
    
    def __init__(self):
        self.api_key = config.YOUTUBE_API_KEY
        self.base_url = config.YOUTUBE_BASE_URL
        
        if not self.api_key:
            raise ValueError("YOUTUBE_API_KEY is required. Please set it in your .env file.")
        
        # Initialize YouTube API client
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)
    
    def search_movie_content(self, movie_title: str, max_results: int = 20) -> List[Dict[str, Any]]:
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
            
            search_response = self.youtube.search().list(
                q=search_query,
                part='snippet',
                maxResults=max_results,
                type='video',
                order='relevance',
                videoDuration='medium'  # Filter out very short/long videos
            ).execute()
            
            videos = []
            for item in search_response.get('items', []):
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
            
        except HttpError as e:
            print(f"An error occurred: {e}")
            return []
    
    def search_actor_interviews(self, actor_name: str, movie_title: str = None, max_results: int = 10) -> List[Dict[str, Any]]:
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
            
            search_response = self.youtube.search().list(
                q=search_query,
                part='snippet',
                maxResults=max_results,
                type='video',
                order='relevance',
                videoDuration='medium'
            ).execute()
            
            interviews = []
            for item in search_response.get('items', []):
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
            
        except HttpError as e:
            print(f"An error occurred: {e}")
            return []
    
    def get_video_details(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific video
        
        Returns video statistics and additional metadata
        """
        try:
            video_response = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=video_id
            ).execute()
            
            if not video_response.get('items'):
                return None
            
            video = video_response['items'][0]
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
            
        except HttpError as e:
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
