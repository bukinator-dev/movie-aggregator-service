#!/usr/bin/env python3
"""
Test script for the optimized YouTube service
Run this to verify the service is working correctly
"""

import asyncio
import sys
from pathlib import Path

# Add the parent directory to the Python path to access services
sys.path.append(str(Path(__file__).parent.parent))

from services.youtube_service import youtube_service

async def test_youtube_service():
    """Test the YouTube service functionality"""
    
    print("🧪 Testing YouTube Service...")
    print("=" * 50)
    
    try:
        # Test 1: Search for movie content
        print("\n1️⃣ Testing movie content search...")
        movie_title = "Inception"
        videos = await youtube_service.search_movie_content(movie_title, max_results=5)
        
        if videos:
            print(f"✅ Found {len(videos)} videos for '{movie_title}'")
            for i, video in enumerate(videos[:3], 1):
                print(f"   {i}. {video['title']}")
                print(f"      Category: {video.get('category', 'unknown')}")
                print(f"      Views: {video.get('view_count', 'N/A')}")
                print(f"      Duration: {video.get('duration', 'N/A')}")
        else:
            print("❌ No videos found")
        
        # Test 2: Search for actor interviews
        print("\n2️⃣ Testing actor interview search...")
        actor_name = "Leonardo DiCaprio"
        interviews = await youtube_service.search_actor_interviews(actor_name, max_results=3)
        
        if interviews:
            print(f"✅ Found {len(interviews)} interviews for '{actor_name}'")
            for i, interview in enumerate(interviews[:2], 1):
                print(f"   {i}. {interview['title']}")
                print(f"      Views: {interview.get('view_count', 'N/A')}")
        else:
            print("❌ No interviews found")
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Check if API key is configured
    if not youtube_service.api_key:
        print("❌ YOUTUBE_API_KEY not configured!")
        print("Please set YOUTUBE_API_KEY in your .env file")
        sys.exit(1)
    
    # Run the test
    asyncio.run(test_youtube_service())
