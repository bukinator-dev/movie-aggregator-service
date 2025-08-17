# Movie Aggregator Service

A service that aggregates interviews with actors and brand-related products for a given movie.

## Project Goals

**✅ Step 1**: Basic API structure and movie search
**✅ Step 2**: YouTube API integration for movie content and interviews
**✅ Step 3**: Actor interview aggregation (enhanced analysis and discovery)
**⏳ Step 4**: Brand/product aggregation (e-commerce APIs)
**⏳ Step 5**: Data integration and response formatting
**⏳ Step 6**: Caching and optimization

## Current Status: Step 3 Complete ✅

We've successfully implemented:
- **YouTube API Integration**: Real movie content fetching from YouTube
- **Video Categorization**: Automatic categorization of videos (trailers, interviews, behind-the-scenes, etc.)
- **Rich Video Data**: Thumbnails, view counts, engagement metrics, and metadata
- **Interview Search**: Actor-specific interview discovery
- **Structured Responses**: Well-organized video content by category
- **🎭 Enhanced Actor Analysis**: Comprehensive actor information with career timelines
- **📊 Interview Categorization**: Press junkets, talk shows, podcasts, red carpet events
- **🤝 Collaboration Networks**: Co-star and director relationship mapping
- **📱 Social Media Detection**: Instagram, Twitter, YouTube presence analysis
- **🎬 Genre Classification**: Automatic genre identification from content
- **📈 Confidence Scoring**: Intelligent actor identification with confidence metrics
- **⏰ Recent Activity Tracking**: Activity level assessment based on interview frequency

## Features Available Now

### Core Endpoints
- `GET /` - Service info and status
- `GET /health` - Health check
- `GET /movie/{movie_title}` - Get movie content with categorized YouTube videos
- `GET /search/{query}` - Search for videos on any topic
- `GET /interviews/{actor_name}` - Find actor interviews (optionally filtered by movie)

### 🎭 Step 3: Actor Interview Aggregation Endpoints
- `GET /actor/{actor_name}` - **Enhanced** actor information with career timeline and analysis
- `GET /discover/actors` - **Enhanced** actor discovery with confidence scores
- `GET /actors/search` - Search for actors by name or partial match
- `GET /actor/{actor_name}/interviews/analysis` - Detailed interview pattern analysis
- `GET /actor/{actor_name}/career` - Actor career timeline and filmography
- `GET /actor/{actor_name}/collaborations` - Actor's collaboration network
- `GET /actors/trending` - Trending actors based on recent interview activity
- `GET /actors/genre/{genre}` - Actors known for specific genres

- `GET /docs` - Interactive API documentation

## API Response Examples

### Enhanced Actor Information (Step 3)
```json
{
  "name": "Leonardo DiCaprio",
  "movies": ["Inception", "The Revenant", "Once Upon a Time in Hollywood"],
  "total_interviews": 25,
  "total_views": 15000000,
  "interviews": [...],
  "recent_content": [...],
  "top_interviews": [...],
  "career_timeline": [
    {
      "year": 2010,
      "movie_title": "Inception",
      "role": null,
      "type": "movie",
      "rating": null,
      "box_office": null
    }
  ],
  "interview_categories": {
    "press_junket": 8,
    "talk_show": 12,
    "red_carpet": 5
  },
  "collaboration_network": [
    {
      "collaborator_name": "Christopher Nolan",
      "collaboration_type": "director",
      "movies": ["Inception"],
      "interview_count": 3,
      "total_views": 2000000
    }
  ],
  "social_media_presence": {
    "instagram": {"mentions": 15, "handles": ["@leonardodicaprio"]},
    "twitter": {"mentions": 8, "handles": []}
  },
  "total_movies": 3,
  "average_rating": null,
  "genres": ["action", "drama", "sci_fi"],
  "recent_activity": "high"
}
```

### Actor Discovery with Confidence Scores
```json
[
  {
    "actor_name": "Tom Hardy",
    "confidence_score": 0.85,
    "interview_count": 12,
    "total_views": 8000000,
    "recent_activity": "medium",
    "primary_genres": ["action", "drama"],
    "sample_interviews": [...]
  }
]
```

## Interview Categories

Our service now automatically categorizes interviews into:
- **Press Junket**: Official movie press interviews and roundtables
- **Talk Show**: Late night shows, daytime talk shows, interviews on TV programs
- **Podcast**: Podcast episodes and audio interviews
- **Red Carpet**: Premiere events, award shows, red carpet interviews
- **Behind the Scenes**: Making-of content and BTS interviews
- **Q&A**: Question and answer sessions
- **Documentary**: Biographical and documentary-style interviews
- **Other**: Miscellaneous interview formats

## Next Steps

**Step 4**: Integrate e-commerce APIs for brand/product aggregation
**Step 5**: Implement data caching and response optimization
**Step 6**: Add advanced analytics and machine learning features

## Environment Variables

See `env.example` for all available configuration options.

## Testing Step 3 Features

Run the comprehensive Step 3 test script:
```bash
python test_step3_actor_aggregation.py
```

This will test all the new actor interview aggregation features including:
- Interview categorization
- Career timeline building
- Collaboration network extraction
- Social media detection
- Genre classification
- Confidence scoring
- Recent activity tracking

