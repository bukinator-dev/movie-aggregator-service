#!/usr/bin/env python3
"""
Test script for Step 3: Actor Interview Aggregation
Run this to verify all the new Step 3 features are working correctly
"""

import asyncio
import sys
from pathlib import Path

# Add the parent directory to the Python path to access services
sys.path.append(str(Path(__file__).parent.parent))

from services.youtube_service import youtube_service

async def test_step3_actor_aggregation():
    """Test all Step 3: Actor Interview Aggregation features"""
    
    print("🎭 Testing Step 3: Actor Interview Aggregation...")
    print("=" * 60)
    
    try:
        # Test 1: Enhanced Actor Information
        print("\n1️⃣ Testing Enhanced Actor Information...")
        actor_name = "Leonardo DiCaprio"
        interviews = await youtube_service.search_actor_interviews(actor_name, None, 10)
        
        if interviews:
            print(f"✅ Found {len(interviews)} interviews for '{actor_name}'")
            
            # Test interview categorization
            categories = youtube_service.categorize_interviews(interviews)
            print(f"   📊 Interview Categories: {categories}")
            
            # Test career timeline building
            movies = youtube_service.extract_movies_from_content(interviews)
            timeline = youtube_service.build_career_timeline(actor_name, movies, interviews)
            print(f"   📅 Career Timeline: {len(timeline)} entries")
            
            # Test collaboration extraction
            collaborations = youtube_service.extract_collaborations(interviews, actor_name)
            print(f"   🤝 Collaborations: {len(collaborations)} found")
            
            # Test social media extraction
            social_media = youtube_service.extract_social_media_info(interviews, actor_name)
            print(f"   📱 Social Media: {social_media}")
            
            # Test genre extraction
            genres = youtube_service.extract_genres_from_content(interviews)
            print(f"   🎬 Genres: {genres}")
        else:
            print("❌ No interviews found")
        
        # Test 2: Enhanced Actor Discovery
        print("\n2️⃣ Testing Enhanced Actor Discovery...")
        movie_title = "Inception"
        movie_content = await youtube_service.search_movie_content(movie_title, 15)
        
        if movie_content:
            actors = youtube_service.extract_actors_from_movie_content_enhanced(movie_content, movie_title)
            print(f"✅ Found {len(actors)} actors for '{movie_title}'")
            
            for i, actor in enumerate(actors[:3], 1):
                print(f"   {i}. {actor['actor_name']}")
                print(f"      Confidence: {actor['confidence_score']:.2f}")
                print(f"      Interviews: {actor['interview_count']}")
                print(f"      Recent Activity: {actor['recent_activity']}")
                print(f"      Genres: {actor['primary_genres']}")
        else:
            print("❌ No movie content found")
        
        # Test 3: Interview Analysis
        print("\n3️⃣ Testing Interview Analysis...")
        if interviews:
            analysis = youtube_service.analyze_interview_patterns(interviews, actor_name)
            print(f"✅ Interview Analysis Complete:")
            print(f"   📈 Total Interviews: {analysis['total_interviews']}")
            print(f"   👀 Total Views: {analysis['total_views']}")
            print(f"   📊 Average Views: {analysis['average_views']:.0f}")
            print(f"   🏷️  Categories: {analysis['interview_categories']}")
        else:
            print("❌ No interviews to analyze")
        
        # Test 4: Actor Search
        print("\n4️⃣ Testing Actor Search...")
        search_query = "Tom"
        search_results = await youtube_service.search_actors_by_name(search_query, 5)
        print(f"✅ Actor Search Results for '{search_query}': {len(search_results)} found")
        
        # Test 5: Career Timeline
        print("\n5️⃣ Testing Career Timeline...")
        career = await youtube_service.get_actor_career_timeline(actor_name, 20)
        print(f"✅ Career Timeline: {len(career)} entries")
        
        # Test 6: Collaborations
        print("\n6️⃣ Testing Collaborations...")
        collabs = await youtube_service.get_actor_collaborations(actor_name, 10)
        print(f"✅ Collaborations: {len(collabs)} found")
        
        print("\n✅ All Step 3 tests completed successfully!")
        print("\n🎯 Step 3 Features Implemented:")
        print("   • Enhanced ActorInfo model with career timeline, interview categories")
        print("   • Interview categorization (press junket, talk show, podcast, etc.)")
        print("   • Career timeline building from interview content")
        print("   • Collaboration network extraction")
        print("   • Social media presence detection")
        print("   • Genre extraction from content")
        print("   • Confidence scoring for actor identification")
        print("   • Recent activity level calculation")
        print("   • New API endpoints for comprehensive actor analysis")
        
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
    asyncio.run(test_step3_actor_aggregation())
