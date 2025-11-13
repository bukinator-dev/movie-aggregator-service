import httpx
import json
import asyncio
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
            print(f"Making YouTube API request to {endpoint} with params: {params}")
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{endpoint}",
                    params=params,
                    headers=self.headers,
                    timeout=config.YOUTUBE_REQUEST_TIMEOUT
                )
                
                if response.status_code == 200:
                    print(f"YouTube API request successful: {endpoint}")
                    return response.json()
                else:
                    print(f"API request failed: {response.status_code} - {response.text}")
                    return None
                    
        except httpx.TimeoutException:
            print(f"Timeout error for {endpoint} endpoint")
            return None
        except httpx.RequestError as e:
            print(f"Request error for {endpoint}: {str(e)}")
            return None
        except Exception as e:
            print(f"Unexpected error for {endpoint}: {str(e)}")
            return None
    
    async def _batch_get_video_details(self, video_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Batch fetch video details for multiple videos in a single API call
        
        This is much more efficient than individual calls
        """
        if not video_ids:
            return []
        
        try:
            # YouTube API allows up to 50 video IDs in a single request
            batch_size = config.YOUTUBE_BATCH_SIZE
            all_video_details = []
            
            for i in range(0, len(video_ids), batch_size):
                batch_ids = video_ids[i:i + batch_size]
                
                params = {
                    'key': self.api_key,
                    'part': 'snippet,statistics,contentDetails',
                    'id': ','.join(batch_ids)
                }
                
                response_data = await self._make_request('videos', params)
                
                if response_data and 'items' in response_data:
                    for video in response_data['items']:
                        snippet = video['snippet']
                        statistics = video.get('statistics', {})
                        content_details = video.get('contentDetails', {})
                        
                        video_details = {
                            'id': video['id'],
                            'title': snippet['title'],
                            'description': snippet['description'],
                            'channel_title': snippet['channelTitle'],
                            'published_at': snippet['publishedAt'],
                            'thumbnail': snippet['thumbnails']['high']['url'],
                            'url': f"https://www.youtube.com/watch?v={video['id']}",
                            'view_count': int(statistics.get('viewCount', 0)),
                            'like_count': int(statistics.get('likeCount', 0)),
                            'comment_count': int(statistics.get('commentCount', 0)),
                            'duration': content_details.get('duration', ''),
                            'category': self._categorize_video(snippet['title'], snippet['description'])
                        }
                        all_video_details.append(video_details)
            
            return all_video_details
            
        except Exception as e:
            print(f"Batch video details error: {str(e)}")
            return []
    
    async def search_movie_content(self, movie_title: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """
        Search for movie-related content on YouTube
        
        Returns videos related to the movie including:
        - Trailers
        - Interviews
        - Behind the scenes
        - Reviews
        - Clips
        
        Note: Reduced default max_results to prevent timeout issues
        """
        try:
            # Search for movie-related content
            search_query = f"{movie_title} movie"
            
            # Limit max_results to prevent too many API calls
            max_results = min(max_results, config.YOUTUBE_MAX_RESULTS)
            
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
            video_ids = []
            
            for item in response_data.get('items', []):
                video_id = item['id']['videoId']
                video_data = {
                    'id': video_id,
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'channel_title': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt'],
                    'thumbnail': item['snippet']['thumbnails']['high']['url'],
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'category': self._categorize_video(item['snippet']['title'], item['snippet']['description'])
                }
                videos.append(video_data)
                video_ids.append(video_id)
            
            # Try to batch fetch detailed information for all videos
            try:
                detailed_videos = await self._batch_get_video_details(video_ids)
                
                # Merge basic info with detailed info
                for video in videos:
                    detailed_video = next((dv for dv in detailed_videos if dv['id'] == video['id']), None)
                    if detailed_video:
                        video.update(detailed_video)
                    else:
                        # Fallback: add default values for missing detailed info
                        video.update({
                            'view_count': 0,
                            'like_count': 0,
                            'comment_count': 0,
                            'duration': ''
                        })
                        
            except Exception as e:
                print(f"Batch fetch failed, using basic video data: {str(e)}")
                # Fallback: add default values for missing detailed info
                for video in videos:
                    video.update({
                        'view_count': 0,
                        'like_count': 0,
                        'comment_count': 0,
                        'duration': ''
                    })
            
            return videos
            
        except Exception as e:
            print(f"An error occurred in search_movie_content: {e}")
            return []
    
    async def search_actor_interviews(self, actor_name: str, movie_title: str = None, max_results: int = 8) -> List[Dict[str, Any]]:
        """
        Search for actor interviews related to a specific movie
        
        Returns interview videos with the actor
        Note: Reduced default max_results to prevent timeout issues
        """
        try:
            # Build search query
            if movie_title:
                search_query = f"{actor_name} interview {movie_title}"
            else:
                search_query = f"{actor_name} interview"
            
            # Limit max_results to prevent too many API calls
            max_results = min(max_results, 12)
            
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
            video_ids = []
            
            for item in response_data.get('items', []):
                video_id = item['id']['videoId']
                interview_data = {
                    'id': video_id,
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'channel_title': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt'],
                    'thumbnail': item['snippet']['thumbnails']['high']['url'],
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'actor': actor_name,
                    'movie': movie_title,
                    'category': 'interview'
                }
                interviews.append(interview_data)
                video_ids.append(video_id)
            
            # Batch fetch detailed information for all interviews
            detailed_interviews = await self._batch_get_video_details(video_ids)
            
            # Merge basic info with detailed info
            for interview in interviews:
                detailed_interview = next((di for di in detailed_interviews if di['id'] == interview['id']), None)
                if detailed_interview:
                    interview.update(detailed_interview)
            
            return interviews
            
        except Exception as e:
            print(f"An error occurred: {e}")
            return []

    async def get_video_details(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific video
        
        Returns video statistics and additional metadata
        Note: This method is now deprecated in favor of batch fetching
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
            statistics = video.get('statistics', {})
            content_details = video.get('contentDetails', {})
            
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
                'duration': content_details.get('duration', ''),
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

    def extract_movies_from_content(self, videos: List[Dict[str, Any]]) -> List[str]:
        """
        Extract movie mentions from video content
        
        Analyzes titles and descriptions to find movie references
        """
        movies = set()
        movie_keywords = ['movie', 'film', 'trailer', 'interview', 'behind the scenes']
        
        for video in videos:
            title = video.get('title', '').lower()
            description = video.get('description', '').lower()
            
            # Look for movie titles in quotes or after "in" or "about"
            import re
            # Pattern to find movie titles in quotes
            quoted_movies = re.findall(r'"([^"]+)"', title + ' ' + description)
            for movie in quoted_movies:
                if any(keyword in movie for keyword in movie_keywords):
                    continue
                if len(movie.split()) >= 2:  # At least 2 words to be a movie title
                    movies.add(movie.title())
            
            # Look for patterns like "Actor Name in Movie Title"
            in_pattern = re.findall(r'in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', title)
            for movie in in_pattern:
                if len(movie.split()) >= 2:
                    movies.add(movie)
        
        return list(movies)

    def extract_actors_from_movie_content(self, videos: List[Dict[str, Any]], movie_title: str) -> List[Dict[str, Any]]:
        """
        Extract actor names from movie-related content
        
        Returns list of actors with their interview counts and engagement
        """
        actor_data = {}
        
        for video in videos:
            title = video.get('title', '')
            description = video.get('description', '')
            
            # Look for actor names in interview titles
            if 'interview' in title.lower():
                # Common patterns: "Actor Name Interview" or "Interview with Actor Name"
                import re
                
                # Pattern 1: "Actor Name Interview"
                actor_match = re.search(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Interview', title)
                if actor_match:
                    actor_name = actor_match.group(1)
                    if actor_name not in actor_data:
                        actor_data[actor_name] = {
                            'name': actor_name,
                            'interview_count': 0,
                            'total_views': 0,
                            'recent_interviews': []
                        }
                    actor_data[actor_name]['interview_count'] += 1
                    actor_data[actor_name]['total_views'] += video.get('view_count', 0)
                    
                    # Add recent interview
                    if len(actor_data[actor_name]['recent_interviews']) < 3:
                        actor_data[actor_name]['recent_interviews'].append({
                            'title': video.get('title'),
                            'url': video.get('url'),
                            'thumbnail': video.get('thumbnail'),
                            'view_count': video.get('view_count', 0)
                        })
                
                # Pattern 2: "Interview with Actor Name"
                with_match = re.search(r'Interview\s+with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', title)
                if with_match:
                    actor_name = with_match.group(1)
                    if actor_name not in actor_data:
                        actor_data[actor_name] = {
                            'name': actor_name,
                            'interview_count': 0,
                            'total_views': 0,
                            'recent_interviews': []
                        }
                    actor_data[actor_name]['interview_count'] += 1
                    actor_data[actor_name]['total_views'] += video.get('view_count', 0)
                    
                    if len(actor_data[actor_name]['recent_interviews']) < 3:
                        actor_data[actor_name]['recent_interviews'].append({
                            'title': video.get('title'),
                            'url': video.get('url'),
                            'thumbnail': video.get('thumbnail'),
                            'view_count': video.get('view_count', 0)
                        })
        
        # Convert to list and sort by interview count
        actors_list = list(actor_data.values())
        actors_list.sort(key=lambda x: x['interview_count'], reverse=True)
        
        return actors_list

    def get_recent_content(self, videos: List[Dict[str, Any]], months: int = 6) -> List[Dict[str, Any]]:
        """
        Get recent content from the last N months
        """
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=months * 30)
        
        recent_videos = []
        for video in videos:
            if video.get('published_at'):
                try:
                    published_date = datetime.fromisoformat(video['published_at'].replace('Z', '+00:00'))
                    if published_date > cutoff_date:
                        recent_videos.append(video)
                except:
                    continue
        
        # Sort by published date (newest first)
        recent_videos.sort(key=lambda x: x.get('published_at', ''), reverse=True)
        return recent_videos[:10]  # Return top 10 recent videos

    def get_top_interviews(self, videos: List[Dict[str, Any]], top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Get top interviews by view count
        """
        # Filter only interviews
        interviews = [v for v in videos if v.get('category') == 'interview']
        
        # Sort by view count (highest first)
        interviews.sort(key=lambda x: x.get('view_count', 0), reverse=True)
        
        return interviews[:top_n]

    # Step 3: Enhanced Actor Interview Aggregation Methods
    
    def categorize_interviews(self, interviews: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Categorize interviews by type for better organization
        
        Returns count of interviews by category
        """
        categories = {
            'press_junket': 0,
            'talk_show': 0,
            'podcast': 0,
            'red_carpet': 0,
            'behind_scenes': 0,
            'q_and_a': 0,
            'documentary': 0,
            'other': 0
        }
        
        for interview in interviews:
            title = interview.get('title', '').lower()
            description = interview.get('description', '').lower()
            channel = interview.get('channel_title', '').lower()
            
            # Categorize based on title, description, and channel
            if any(word in title for word in ['junket', 'press', 'roundtable']):
                categories['press_junket'] += 1
            elif any(word in title for word in ['talk show', 'late night', 'tonight show', 'ellen']):
                categories['talk_show'] += 1
            elif any(word in title for word in ['podcast', 'episode']):
                categories['podcast'] += 1
            elif any(word in title for word in ['red carpet', 'premiere', 'awards']):
                categories['red_carpet'] += 1
            elif any(word in title for word in ['behind the scenes', 'bts', 'making of']):
                categories['behind_scenes'] += 1
            elif any(word in title for word in ['q&a', 'qa', 'question']):
                categories['q_and_a'] += 1
            elif any(word in title for word in ['documentary', 'biography']):
                categories['documentary'] += 1
            else:
                categories['other'] += 1
        
        # Remove categories with 0 count
        return {k: v for k, v in categories.items() if v > 0}

    def build_career_timeline(self, actor_name: str, movies: List[str], interviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Build actor career timeline from available data
        
        Creates a chronological list of actor's work
        """
        timeline = []
        
        # Extract year information from interviews and movie mentions
        for interview in interviews:
            title = interview.get('title', '')
            description = interview.get('description', '')
            
            # Look for movie titles and years in interview content
            import re
            year_pattern = r'\b(19|20)\d{2}\b'
            years = re.findall(year_pattern, title + ' ' + description)
            
            for year in years:
                full_year = int(year)
                if 1900 <= full_year <= 2030:  # Reasonable year range
                    # Look for movie titles in the same content
                    for movie in movies:
                        if movie.lower() in title.lower() or movie.lower() in description.lower():
                            timeline.append({
                                'year': full_year,
                                'movie_title': movie,
                                'role': None,  # Will be enhanced in future steps
                                'type': 'movie',
                                'rating': None,
                                'box_office': None
                            })
        
        # Sort by year and remove duplicates
        unique_timeline = []
        seen = set()
        for entry in sorted(timeline, key=lambda x: x['year']):
            key = (entry['year'], entry['movie_title'])
            if key not in seen:
                seen.add(key)
                unique_timeline.append(entry)
        
        return unique_timeline

    def extract_collaborations(self, interviews: List[Dict[str, Any]], actor_name: str) -> List[Dict[str, Any]]:
        """
        Extract actor collaborations from interview content
        
        Identifies co-stars, directors, and other collaborators
        """
        collaborations = {}
        
        for interview in interviews:
            title = interview.get('title', '')
            description = interview.get('description', '')
            
            # Look for collaboration patterns
            import re
            
            # Pattern: "Actor Name with/and Collaborator Name"
            with_pattern = re.findall(rf'{re.escape(actor_name)}\s+(?:with|and)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', title)
            for collaborator in with_pattern:
                if collaborator not in collaborations:
                    collaborations[collaborator] = {
                        'collaborator_name': collaborator,
                        'collaboration_type': 'co-star',
                        'movies': [],
                        'interview_count': 0,
                        'total_views': 0
                    }
                collaborations[collaborator]['interview_count'] += 1
                collaborations[collaborator]['total_views'] += interview.get('view_count', 0)
            
            # Pattern: "Interview with Actor Name and Collaborator Name"
            interview_with_pattern = re.findall(rf'Interview\s+with\s+{re.escape(actor_name)}\s+and\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', title)
            for collaborator in interview_with_pattern:
                if collaborator not in collaborations:
                    collaborations[collaborator] = {
                        'collaborator_name': collaborator,
                        'collaboration_type': 'co-star',
                        'movies': [],
                        'interview_count': 0,
                        'total_views': 0
                    }
                collaborations[collaborator]['interview_count'] += 1
                collaborations[collaborator]['total_views'] += interview.get('view_count', 0)
        
        # Convert to list and sort by interview count
        collaborations_list = list(collaborations.values())
        collaborations_list.sort(key=lambda x: x['interview_count'], reverse=True)
        
        return collaborations_list

    def extract_social_media_info(self, interviews: List[Dict[str, Any]], actor_name: str) -> Dict[str, Any]:
        """
        Extract social media presence information from interviews
        
        Identifies social media platforms and engagement
        """
        social_media = {
            'instagram': {'mentions': 0, 'handles': []},
            'twitter': {'mentions': 0, 'handles': []},
            'facebook': {'mentions': 0, 'handles': []},
            'youtube': {'mentions': 0, 'channels': []},
            'tiktok': {'mentions': 0, 'accounts': []}
        }
        
        for interview in interviews:
            title = interview.get('title', '')
            description = interview.get('description', '')
            content = title + ' ' + description
            
            # Look for social media patterns
            import re
            
            # Instagram patterns
            instagram_patterns = [
                r'@([a-zA-Z0-9._]+)',  # @username
                r'instagram\.com/([a-zA-Z0-9._]+)',  # instagram.com/username
                r'#([a-zA-Z0-9_]+)'  # hashtags
            ]
            
            for pattern in instagram_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    if 'instagram' in content.lower():
                        social_media['instagram']['mentions'] += 1
                        if match not in social_media['instagram']['handles']:
                            social_media['instagram']['handles'].append(match)
            
            # Twitter patterns
            if 'twitter' in content.lower() or 'tweet' in content.lower():
                social_media['twitter']['mentions'] += 1
            
            # YouTube patterns
            if 'youtube' in content.lower() or 'channel' in content.lower():
                social_media['youtube']['mentions'] += 1
        
        # Remove empty platforms
        return {k: v for k, v in social_media.items() if v['mentions'] > 0}

    def extract_genres_from_content(self, content: List[Dict[str, Any]]) -> List[str]:
        """
        Extract movie genres from interview content
        
        Identifies genres based on movie mentions and descriptions
        """
        genres = set()
        genre_keywords = {
            'action': ['action', 'thriller', 'adventure', 'war', 'martial arts'],
            'comedy': ['comedy', 'funny', 'humor', 'satire', 'rom-com'],
            'drama': ['drama', 'emotional', 'serious', 'character study'],
            'horror': ['horror', 'scary', 'frightening', 'supernatural'],
            'sci_fi': ['science fiction', 'sci-fi', 'futuristic', 'space', 'alien'],
            'romance': ['romance', 'love story', 'romantic', 'relationship'],
            'fantasy': ['fantasy', 'magical', 'superhero', 'mythical'],
            'documentary': ['documentary', 'biography', 'real story', 'true story'],
            'animation': ['animation', 'animated', 'cartoon', 'pixar', 'disney']
        }
        
        for item in content:
            title = item.get('title', '').lower()
            description = item.get('description', '').lower()
            content_text = title + ' ' + description
            
            for genre, keywords in genre_keywords.items():
                if any(keyword in content_text for keyword in keywords):
                    genres.add(genre)
        
        return list(genres)

    def extract_actors_from_movie_content_enhanced(self, videos: List[Dict[str, Any]], movie_title: str) -> List[Dict[str, Any]]:
        """
        Enhanced actor extraction with confidence scores and analysis
        
        Returns actors with confidence scores and sample interviews
        """
        actor_data = {}
        
        for video in videos:
            title = video.get('title', '')
            description = video.get('description', '')
            
            # Look for actor names in interview titles with enhanced patterns
            if 'interview' in title.lower():
                import re
                
                # Enhanced actor name patterns
                patterns = [
                    r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Interview',  # "Actor Name Interview"
                    r'Interview\s+with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # "Interview with Actor Name"
                    r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+on\s+[A-Z]',  # "Actor Name on Show"
                    r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+talks\s+about',  # "Actor Name talks about"
                ]
                
                for pattern in patterns:
                    actor_match = re.search(pattern, title)
                    if actor_match:
                        actor_name = actor_match.group(1)
                        
                        # Calculate confidence score based on various factors
                        confidence_score = self._calculate_actor_confidence(actor_name, title, description, movie_title)
                        
                        if actor_name not in actor_data:
                            actor_data[actor_name] = {
                                'actor_name': actor_name,
                                'confidence_score': confidence_score,
                                'interview_count': 0,
                                'total_views': 0,
                                'recent_activity': 'low',
                                'primary_genres': [],
                                'sample_interviews': []
                            }
                        
                        actor_data[actor_name]['interview_count'] += 1
                        actor_data[actor_name]['total_views'] += video.get('view_count', 0)
                        
                        # Add sample interview if we don't have enough
                        if len(actor_data[actor_name]['sample_interviews']) < 3:
                            actor_data[actor_name]['sample_interviews'].append(video)
        
        # Calculate recent activity and genres for each actor
        for actor in actor_data.values():
            actor['recent_activity'] = self._calculate_recent_activity(actor['sample_interviews'])
            actor['primary_genres'] = self.extract_genres_from_content(actor['sample_interviews'])
        
        # Convert to list and sort by confidence score
        actors_list = list(actor_data.values())
        actors_list.sort(key=lambda x: x['confidence_score'], reverse=True)
        
        return actors_list

    def _calculate_actor_confidence(self, actor_name: str, title: str, description: str, movie_title: str) -> float:
        """
        Calculate confidence score for actor identification
        
        Returns score between 0.0 and 1.0
        """
        confidence = 0.0
        
        # Base confidence for having "interview" in title
        if 'interview' in title.lower():
            confidence += 0.3
        
        # Boost confidence if actor name appears multiple times
        name_count = title.lower().count(actor_name.lower()) + description.lower().count(actor_name.lower())
        confidence += min(0.2, name_count * 0.1)
        
        # Boost confidence if movie title is mentioned
        if movie_title.lower() in title.lower() or movie_title.lower() in description.lower():
            confidence += 0.2
        
        # Boost confidence for specific interview patterns
        if any(pattern in title.lower() for pattern in ['talks about', 'discusses', 'reveals']):
            confidence += 0.1
        
        # Boost confidence for professional interview sources
        professional_sources = ['show', 'program', 'channel', 'network', 'tv']
        if any(source in title.lower() for source in professional_sources):
            confidence += 0.1
        
        # Cap confidence at 1.0
        return min(1.0, confidence)

    def _calculate_recent_activity(self, interviews: List[Dict[str, Any]]) -> str:
        """
        Calculate recent activity level based on interview dates
        
        Returns 'high', 'medium', or 'low'
        """
        if not interviews:
            return 'low'
        
        # Count interviews from last 3 months
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=90)
        
        recent_count = 0
        for interview in interviews:
            if interview.get('published_at'):
                try:
                    published_date = datetime.fromisoformat(interview['published_at'].replace('Z', '+00:00'))
                    if published_date > cutoff_date:
                        recent_count += 1
                except:
                    continue
        
        if recent_count >= 3:
            return 'high'
        elif recent_count >= 1:
            return 'medium'
        else:
            return 'low'

    # Additional Step 3 methods that will be called by the API endpoints
    
    async def search_actors_by_name(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """
        Search for actors by name or partial match
        """
        # This would typically integrate with additional APIs
        # For now, we'll use YouTube search as a fallback
        search_results = await self.search_movie_content(f"{query} actor interview", max_results)
        return self.extract_actors_from_movie_content_enhanced(search_results, query)

    def analyze_interview_patterns(self, interviews: List[Dict[str, Any]], actor_name: str) -> Dict[str, Any]:
        """
        Analyze interview patterns for insights
        """
        analysis = {
            'total_interviews': len(interviews),
            'total_views': sum(interview.get('view_count', 0) for interview in interviews),
            'average_views': 0,
            'interview_categories': self.categorize_interviews(interviews),
            'engagement_trends': {},
            'common_topics': [],
            'quality_metrics': {}
        }
        
        if interviews:
            analysis['average_views'] = analysis['total_views'] / len(interviews)
        
        return analysis

    async def get_actor_career_timeline(self, actor_name: str, max_results: int) -> List[Dict[str, Any]]:
        """
        Get actor career timeline
        """
        # This would integrate with movie databases
        # For now, return basic timeline from interviews
        interviews = await self.search_actor_interviews(actor_name, None, max_results)
        movies = self.extract_movies_from_content(interviews)
        return self.build_career_timeline(actor_name, movies, interviews)

    async def get_actor_collaborations(self, actor_name: str, max_results: int) -> List[Dict[str, Any]]:
        """
        Get actor collaborations
        """
        interviews = await self.search_actor_interviews(actor_name, None, max_results)
        return self.extract_collaborations(interviews, actor_name)

    async def get_trending_actors(self, period: str, max_results: int) -> List[Dict[str, Any]]:
        """
        Get trending actors based on recent activity
        """
        # This would analyze recent interview activity across all actors
        # For now, return sample data
        return []

    async def get_actors_by_genre(self, genre: str, max_results: int) -> List[Dict[str, Any]]:
        """
        Get actors by genre
        """
        # This would search for actors associated with specific genres
        # For now, return sample data
        return []

# Global instance
youtube_service = YouTubeService()
