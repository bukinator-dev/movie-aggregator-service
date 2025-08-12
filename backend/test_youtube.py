#!/usr/bin/env python3
"""
Test script for YouTube service
Run this to test if your YouTube API key is working
"""

import os
import asyncio
from dotenv import load_dotenv
from services.youtube_service import YouTubeService

async def test_youtube_service():
    """Test the YouTube service with a simple search"""
    
    # Load environment variables
    load_dotenv()
    
    # Check if API key exists
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("❌ Error: YOUTUBE_API_KEY not found in .env file")
        print("Please create a .env file with your YouTube API key:")
        print("YOUTUBE_API_KEY=your_api_key_here")
        return False
    
    print(f"✅ Found YouTube API key: {api_key[:10]}...")
    
    try:
        # Initialize service
        print("🔧 Initializing YouTube service...")
        youtube_service = YouTubeService()
        print("✅ YouTube service initialized successfully!")
        
        # Test simple search
        print("\n🔍 Testing movie content search...")
        test_movie = "Inception"
        videos = await youtube_service.search_movie_content(test_movie, max_results=5)
        
        if videos:
            print(f"✅ Found {len(videos)} videos for '{test_movie}'")
            print("\n📹 Sample videos:")
            for i, video in enumerate(videos[:3], 1):
                print(f"  {i}. {video['title']}")
                print(f"     Category: {video['category']}")
                print(f"     Channel: {video['channel_title']}")
                print(f"     URL: {video['url']}")
                print()
        else:
            print(f"❌ No videos found for '{test_movie}'")
            return False
        
        # Test video details
        if videos:
            print("🔍 Testing video details...")
            first_video = videos[0]
            video_details = await youtube_service.get_video_details(first_video['id'])
            
            if video_details:
                print("✅ Video details fetched successfully!")
                print(f"   Views: {video_details.get('view_count', 'N/A'):,}")
                print(f"   Likes: {video_details.get('like_count', 'N/A'):,}")
                print(f"   Duration: {video_details.get('duration', 'N/A')}")
            else:
                print("❌ Failed to fetch video details")
        
        print("\n🎉 All tests passed! Your YouTube service is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Error testing YouTube service: {str(e)}")
        return False

async def main():
    """Main async function"""
    print("🧪 Testing YouTube Service")
    print("=" * 40)
    
    success = await test_youtube_service()
    
    if success:
        print("\n✅ Ready to run the main service!")
        print("Run: uvicorn main:app --reload")
    else:
        print("\n❌ Please fix the issues above before running the main service.")

if __name__ == "__main__":
    # Run the async test
    asyncio.run(main())
