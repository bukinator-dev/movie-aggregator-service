# Movie Aggregator Service

A service that aggregates interviews with actors and brand-related products for a given movie.

## Project Goals

**✅ Step 1**: Basic API structure and movie search
**✅ Step 2**: YouTube API integration for movie content and interviews
**🔄 Step 3**: Actor interview aggregation (additional news APIs)
**⏳ Step 4**: Brand/product aggregation (e-commerce APIs)
**⏳ Step 5**: Data integration and response formatting
**⏳ Step 6**: Caching and optimization

## Current Status: Step 2 Complete ✅

We've successfully implemented:
- **YouTube API Integration**: Real movie content fetching from YouTube
- **Video Categorization**: Automatic categorization of videos (trailers, interviews, behind-the-scenes, etc.)
- **Rich Video Data**: Thumbnails, view counts, engagement metrics, and metadata
- **Interview Search**: Actor-specific interview discovery
- **Structured Responses**: Well-organized video content by category

## Features Available Now

- `GET /` - Service info and status
- `GET /health` - Health check
- `GET /movie/{movie_title}` - Get movie content with categorized YouTube videos
- `GET /search/{query}` - Search for videos on any topic
- `GET /interviews/{actor_name}` - Find actor interviews (optionally filtered by movie)
- `GET /docs` - Interactive API documentation

## Setup Requirements

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Get YouTube API Key
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Create a `.env` file with your API key:
```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Run the Service
```bash
uvicorn main:app --reload
```

## API Response Example

```json
{
  "title": "Inception",
  "total_videos": 20,
  "total_views": 15000000,
  "videos_by_category": {
    "trailer": [...],
    "interview": [...],
    "behind_the_scenes": [...],
    "review": [...],
    "clip": [...],
    "music": [...],
    "other": [...]
  },
  "trailers": [
    {
      "id": "YoHD9XEInc0",
      "title": "Inception - Official Trailer",
      "description": "A thief who steals corporate secrets...",
      "channel_title": "Warner Bros. Pictures",
      "published_at": "2010-07-16T00:00:00Z",
      "thumbnail": "https://i.ytimg.com/vi/YoHD9XEInc0/hqdefault.jpg",
      "url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
      "category": "trailer",
      "view_count": 5000000,
      "like_count": 150000,
      "comment_count": 25000,
      "duration": "PT2M32S"
    }
  ],
  "interviews": [...],
  "behind_the_scenes": [...],
  "reviews": [...],
  "clips": [...],
  "music": [...],
  "other": [...],
  "actors": [],
  "brand_products": []
}
```

## Video Categories

Our service automatically categorizes videos into:
- **Trailers**: Official movie trailers and teasers
- **Interviews**: Actor and crew interviews
- **Behind the Scenes**: Making-of videos and BTS content
- **Reviews**: Movie reviews and critiques
- **Clips**: Movie scenes and moments
- **Music**: Soundtracks and music videos
- **Other**: Miscellaneous content

## Next Steps

**Step 3**: Integrate additional news APIs for comprehensive interview coverage
**Step 4**: Add e-commerce APIs for brand/product aggregation
**Step 5**: Implement data caching and response optimization

## Environment Variables

See `env.example` for all available configuration options.

