import React, { useState, useEffect } from 'react';
import { SearchIcon, PlayIcon, UserIcon, FilmIcon, EyeIcon, CalendarIcon, ThumbsUpIcon, Sparkles } from 'lucide-react';
import { useHealthCheck } from '../hooks/useApi';
import MovieAggregatorAPI from '../services/api';
import TMDBService, { TMDBCastMember } from '../services/tmdb';
import { MovieInfo, Video } from '../types/api';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { data: healthData, loading: healthLoading } = useHealthCheck();

  // TMDB Cast state
  const [castMembers, setCastMembers] = useState<TMDBCastMember[]>([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [castError, setCastError] = useState<string | null>(null);

  // Function to fetch cast information from TMDB
  const fetchCastInformation = async (movieTitle: string) => {
    if (!movieTitle.trim()) return;
    
    console.log(`🎭 HomePage: Starting to fetch cast for: "${movieTitle}"`);
    setIsLoadingCast(true);
    setCastError(null);
    
    try {
      const { content, cast } = await TMDBService.findMovieAndCast(movieTitle);
      console.log(`🎭 HomePage: TMDB response:`, { content, cast });
      
      if (content && cast.length > 0) {
        setCastMembers(cast);
        const contentType = content.media_type === 'tv' ? 'TV series' : 'movie';
        console.log(`🎭 HomePage: Successfully set ${cast.length} cast members for "${content.title}" (${contentType})`);
      } else {
        setCastMembers([]);
        const errorMsg = content ? 'No cast information found for this content' : 'Content not found in TMDB';
        console.warn(`⚠️ HomePage: ${errorMsg}`);
        setCastError(errorMsg);
      }
    } catch (error) {
      console.error('❌ HomePage: Error fetching cast information:', error);
      setCastError('Failed to load cast information');
      setCastMembers([]);
    } finally {
      setIsLoadingCast(false);
    }
  };

  // Function to handle actor search
  const handleActorSearch = async (actorName: string) => {
    if (!searchResults?.title) return;
    
    const actorInterviewQuery = `${actorName} ${searchResults.title} interview`;
    console.log(`🎭 HomePage: Actor search triggered for: "${actorInterviewQuery}"`);
    
    // Set the search query to the actor interview query
    setSearchQuery(actorInterviewQuery);
    
    // Clear previous results and start new search
    setSearchResults(null);
    setSearchError(null);
    setCastMembers([]);
    setCastError(null);
    
    // Perform the search with the new query
    try {
      setIsSearching(true);
      
      // Search for actor interviews specifically
      const actorInterviewResults = await MovieAggregatorAPI.searchVideos(actorInterviewQuery, 50);
      console.log(`🎭 Actor interview results for "${actorName}":`, actorInterviewResults.length, 'videos');
      
      // Create a new results object focused on the actor interviews
      const actorResults: MovieInfo = {
        title: `${actorName} - ${searchResults.title}`,
        total_videos: actorInterviewResults.length,
        total_views: actorInterviewResults.reduce((sum, video) => sum + (video.view_count || 0), 0),
        videos_by_category: {
          'Actor Interviews': actorInterviewResults
        },
        // Organize videos by category
        actor_interviews: actorInterviewResults,
        trailers: [],
        interviews: [],
        behind_the_scenes: [],
        reviews: [],
        clips: [],
        music: [],
        other: [],
        actors: [],
        brand_products: []
      };
      
      setSearchResults(actorResults);
    } catch (error: any) {
      console.error('❌ Error searching for actor interviews:', error);
      setSearchError(error.response?.data?.detail || 'Error searching for actor interviews');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle soundtrack search
  const handleSoundtrackSearch = async () => {
    if (!searchResults?.title) return;
    
    const soundtrackQuery = `${searchResults.title} soundtrack`;
    console.log(`🎵 HomePage: Soundtrack search triggered for: "${soundtrackQuery}"`);
    
    try {
      setIsSearching(true);
      const soundtrackResults = await MovieAggregatorAPI.searchVideos(soundtrackQuery, 50);
      
      const soundtrackData: MovieInfo = {
        title: `${searchResults.title} - Soundtrack`,
        total_videos: soundtrackResults.length,
        total_views: soundtrackResults.reduce((sum, video) => sum + (video.view_count || 0), 0),
        videos_by_category: {
          'Soundtrack': soundtrackResults
        },
        actor_interviews: [],
        trailers: [],
        interviews: [],
        behind_the_scenes: [],
        reviews: [],
        clips: [],
        music: soundtrackResults,
        other: [],
        actors: [],
        brand_products: []
      };
      
      setSearchResults(soundtrackData);
    } catch (error: any) {
      console.error('❌ Error searching for soundtrack:', error);
      setSearchError(error.response?.data?.detail || 'Error searching for soundtrack');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle music videos search
  const handleMusicVideosSearch = async () => {
    if (!searchResults?.title) return;
    
    const musicQuery = `${searchResults.title} music video`;
    console.log(`🎵 HomePage: Music videos search triggered for: "${musicQuery}"`);
    
    try {
      setIsSearching(true);
      const musicResults = await MovieAggregatorAPI.searchVideos(musicQuery, 50);
      
      const musicData: MovieInfo = {
        title: `${searchResults.title} - Music Videos`,
        total_videos: musicResults.length,
        total_views: musicResults.reduce((sum, video) => sum + (video.view_count || 0), 0),
        videos_by_category: {
          'Music Videos': musicResults
        },
        actor_interviews: [],
        trailers: [],
        interviews: [],
        behind_the_scenes: [],
        reviews: [],
        clips: [],
        music: musicResults,
        other: [],
        actors: [],
        brand_products: []
      };
      
      setSearchResults(musicData);
    } catch (error: any) {
      console.error('❌ Error searching for music videos:', error);
      setSearchError(error.response?.data?.detail || 'Error searching for music videos');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle covers search
  const handleCoversSearch = async () => {
    if (!searchResults?.title) return;
    
    const coversQuery = `${searchResults.title} music cover`;
    console.log(`🎵 HomePage: Covers search triggered for: "${coversQuery}"`);
    
    try {
      setIsSearching(true);
      const coversResults = await MovieAggregatorAPI.searchVideos(coversQuery, 50);
      
      const coversData: MovieInfo = {
        title: `${searchResults.title} - Music Covers`,
        total_videos: coversResults.length,
        total_views: coversResults.reduce((sum, video) => sum + (video.view_count || 0), 0),
        videos_by_category: {
          'Music Covers': coversResults
        },
        actor_interviews: [],
        trailers: [],
        interviews: [],
        behind_the_scenes: [],
        reviews: [],
        clips: [],
        music: coversResults,
        other: [],
        actors: [],
        brand_products: []
      };
      
      setSearchResults(coversData);
    } catch (error: any) {
      console.error('❌ Error searching for music covers:', error);
      setSearchError(error.response?.data?.detail || 'Error searching for music covers');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle music analysis search
  const handleAnalysisSearch = async () => {
    if (!searchResults?.title) return;
    
    const analysisQuery = `${searchResults.title} music analysis`;
    console.log(`🎵 HomePage: Music analysis search triggered for: "${analysisQuery}"`);
    
    try {
      setIsSearching(true);
      const analysisResults = await MovieAggregatorAPI.searchVideos(analysisQuery, 50);
      
      const analysisData: MovieInfo = {
        title: `${searchResults.title} - Music Analysis`,
        total_videos: analysisResults.length,
        total_views: analysisResults.reduce((sum, video) => sum + (video.view_count || 0), 0),
        videos_by_category: {
          'Music Analysis': analysisResults
        },
        actor_interviews: [],
        trailers: [],
        interviews: [],
        behind_the_scenes: [],
        reviews: [],
        clips: [],
        music: analysisResults,
        other: [],
        actors: [],
        brand_products: []
      };
      
      setSearchResults(analysisData);
    } catch (error: any) {
      console.error('❌ Error searching for music analysis:', error);
      setSearchError(error.response?.data?.detail || 'Error searching for music analysis');
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch cast information when search results are available
  useEffect(() => {
    if (searchResults?.title) {
      console.log(`🎭 HomePage: useEffect triggered with movie title: "${searchResults.title}"`);
      fetchCastInformation(searchResults.title);
    }
  }, [searchResults?.title]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults(null);
      
      try {
        // First, get the main movie search results
        const movieResults = await MovieAggregatorAPI.getMovieInfo(searchQuery.trim(), 50);
        console.log(`🎬 Movie search results for "${searchQuery.trim()}":`, movieResults.total_videos, 'videos');
        
        // Then, get actor interview results by appending "actors interview" to the query
        let actorInterviewResults: Video[] = [];
        try {
          const actorInterviewQuery = `${searchQuery.trim()} actors interview`;
          console.log(`🎭 Enhanced search query: "${actorInterviewQuery}"`);
          actorInterviewResults = await MovieAggregatorAPI.searchVideos(actorInterviewQuery, 50);
          console.log(`🎭 Actor interview results:`, actorInterviewResults.length, 'videos');
        } catch (actorError) {
          // If actor interview search fails, continue with just movie results
          console.warn('Actor interview search failed, continuing with movie results only:', actorError);
        }
        
        // Combine the results, prioritizing actor interviews at the top
        const combinedResults = {
          ...movieResults,
          // Add actor interviews as a separate category at the top
          actor_interviews: actorInterviewResults,
          // Update total counts
          total_videos: movieResults.total_videos + actorInterviewResults.length,
          total_views: movieResults.total_views + (actorInterviewResults.reduce((sum, video) => sum + (video.view_count || 0), 0))
        };
        
        console.log(`✨ Combined results:`, combinedResults.total_videos, 'total videos');
        setSearchResults(combinedResults);
      } catch (error: any) {
        setSearchError(error.response?.data?.detail || 'Error searching for movie');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const VideoCard: React.FC<{ video: Video; category: string }> = ({ video, category }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
      <div className="relative">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-32 sm:h-48 object-cover"
          />
        )}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-yellow-400 text-gray-900 text-xs px-2 sm:px-3 py-1 rounded-full font-semibold shadow-lg">
          {category}
        </div>
        {video.duration && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-3 sm:p-5">
        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2 text-sm leading-tight">
          {video.title}
        </h3>
        {video.channel_title && (
          <p className="text-xs text-gray-600 mb-2 sm:mb-3 truncate">{video.channel_title}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
          {video.view_count && (
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-3 w-3" />
              <span>{video.view_count.toLocaleString()}</span>
            </div>
          )}
          {video.published_at && (
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-3 w-3" />
              <span className="hidden sm:inline">{new Date(video.published_at).toLocaleDateString()}</span>
              <span className="sm:hidden">{new Date(video.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 text-yellow-600 hover:text-yellow-700 transition-colors text-sm font-medium bg-yellow-50 hover:bg-yellow-100 px-3 py-2 rounded-lg min-h-[44px]"
        >
          <PlayIcon className="h-4 w-4" />
          <span>Watch</span>
        </a>
      </div>
    </div>
  );

  const CategorySection: React.FC<{ title: string; videos: Video[]; category: string; icon: React.ComponentType<any> }> = ({ 
    title, 
    videos, 
    category,
    icon: Icon
  }) => {
    if (!videos || videos.length === 0) return null;
    
    return (
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/20 rounded-lg">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
          </div>
          <span className="text-xs sm:text-sm text-yellow-200 bg-yellow-400/20 px-2 sm:px-3 py-1 rounded-full font-medium self-start sm:self-auto">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} category={category} />
          ))}
        </div>
      </div>
    );
  };

  const popularMovies = ['Inception', 'Matrix', 'Avengers', 'Titanic', 'Interstellar', 'The Dark Knight'];

  const features = [
    {
      icon: UserIcon,
      title: 'Actor Interviews',
      description: 'Find interviews with your favorite actors from specific movies.',
      color: 'bg-yellow-400'
    },
    {
      icon: FilmIcon,
      title: 'Movie Content',
      description: 'Discover trailers, behind-the-scenes footage, and more for any movie.',
      color: 'bg-yellow-400'
    },
    {
      icon: PlayIcon,
      title: 'Video Search',
      description: 'Search across all video content with smart categorization.',
      color: 'bg-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"
          alt="Cinema background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Gradient overlay for smoother transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-yellow-400">
                <FilmIcon className="h-8 w-8" />
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-white">Movie Actors</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl mb-6 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent font-bold">
              Discover Movie Interviews
        </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Search for your favorite movies and explore exclusive interviews with actors, behind-the-scenes content, trailers, and more.
            </p>

            {/* Enhanced Search Form */}
            <div className="max-w-3xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a movie..."
                      className="w-full pl-12 pr-4 py-4 sm:py-6 text-base sm:text-lg bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-yellow-400 transition-colors rounded-xl shadow-lg text-gray-900 placeholder:text-gray-500"
                      disabled={isSearching}
                      list="movie-suggestions"
                    />
                    <datalist id="movie-suggestions">
                      {popularMovies.map((movie) => (
                        <option key={movie} value={movie} />
                      ))}
                    </datalist>
                  </div>
            <button
              type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 sm:px-8 py-4 sm:py-6 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 min-h-[56px] sm:min-h-[72px]"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                        <span className="text-sm sm:text-base">Searching...</span>
                      </>
                    ) : (
                      <>
                        <SearchIcon className="h-5 w-5" />
                        <span className="text-sm sm:text-base">Search</span>
                      </>
                    )}
            </button>
          </div>
                {/* Mobile Helper Text */}
                <div className="text-center mt-3 sm:hidden">
                  <p className="text-xs text-yellow-200/80">
                    💡 Type a movie name and tap Search
                  </p>
                </div>
        </form>
            </div>

            {/* Search Results Section */}
            {isSearching && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-lg text-gray-200">Searching for "{searchQuery}"...</p>
              </div>
            )}

            {searchError && (
              <div className="text-center py-16">
                <div className="text-red-400 text-xl mb-4">❌ Search Error</div>
                <div className="text-gray-300 mb-6">{searchError}</div>
                <button
                  onClick={() => setSearchError(null)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {searchResults && (
              <div className="py-8">
                {/* Results Header */}
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    🎬 Results for "{searchResults.title}"
                  </h2>
                  <p className="text-lg text-gray-300 mb-8">
                    {searchResults.title.includes(' - ') ? 
                      searchResults.title.includes('Soundtrack') || searchResults.title.includes('Music') ?
                        'Soundtrack, music videos, covers, and music analysis' :
                        'Actor interviews and related content' : 
                      'Actor interviews + Movie content + Behind-the-scenes footage + Soundtrack'
                    }
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300 mb-8">
                    <div className="flex items-center space-x-2">
                      <PlayIcon className="h-5 w-5 text-yellow-400" />
                      <span>{searchResults.total_videos} videos found</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="h-5 w-5 text-yellow-400" />
                      <span>{searchResults.total_views.toLocaleString()} total views</span>
                    </div>
                    {searchResults.actor_interviews && searchResults.actor_interviews.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-5 w-5 text-yellow-400" />
                        <span>{searchResults.actor_interviews.length} actor interviews</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults(null);
                        setSearchError(null);
                        setCastMembers([]);
                        setCastError(null);
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors text-sm backdrop-blur-sm border border-white/20"
                    >
                      New Search
                    </button>
                    {searchResults.title.includes(' - ') && (
                      <button
                        onClick={() => {
                          // Go back to the original movie/show results
                          setSearchQuery(searchResults.title.split(' - ')[1]);
                          handleSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                        className="px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-full text-yellow-200 transition-colors text-sm backdrop-blur-sm border border-yellow-400/30"
                      >
                        ← Back to Movie/Show
                      </button>
                    )}
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-full text-yellow-200 transition-colors text-sm backdrop-blur-sm border border-yellow-400/30"
                    >
                      Back to Top
                    </button>
                  </div>
                </div>

                {/* Movie Cast Section - Using Movie Database Service */}
                {!searchResults.title.includes(' - ') && (
                  <div className="text-center mb-16 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <UserIcon className="h-8 w-8 text-yellow-400" />
                      <h3 className="text-3xl font-bold text-white">
                        🎭 Cast Information
                      </h3>
                      <UserIcon className="h-8 w-8 text-yellow-400" />
                    </div>
                    
                    {isLoadingCast && (
                      <div className="text-center">
                        <div className="animate-pulse bg-yellow-400/20 rounded-lg p-4 mb-4">
                          <p className="text-yellow-200 text-lg">
                            🔄 Loading cast information from TMDB...
                          </p>
                        </div>
                        <p className="text-sm text-gray-400">
                          Fetching cast members from The Movie Database
                        </p>
                      </div>
                    )}

                    {castError && (
                      <div className="text-center">
                        <div className="bg-red-500/20 rounded-lg p-4 mb-4">
                          <p className="text-red-300 text-lg">
                            ❌ {castError}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400">
                          You can still search for actors manually by typing their name + "{searchResults.title} interview"
                        </p>
                      </div>
                    )}

                    {!isLoadingCast && !castError && castMembers.length > 0 && (
                      <div>
                        <div className="flex flex-wrap justify-center gap-3 mb-6">
                          {castMembers.map((castMember) => (
            <button
                              key={castMember.id}
                              onClick={() => handleActorSearch(castMember.name)}
                              className="group px-6 py-3 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 hover:from-yellow-400/30 hover:to-yellow-500/30 rounded-full text-yellow-200 border border-yellow-400/40 transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm font-semibold text-lg"
                              title={`Search for: "${castMember.name} ${searchResults.title} interview"`}
                            >
                              <div className="text-center">
                                <div className="font-bold group-hover:text-yellow-100 transition-colors">
                                  {castMember.name}
                                </div>
                                <div className="text-xs text-yellow-300 group-hover:text-yellow-200 transition-colors mt-1">
                                  as {castMember.character}
                                </div>
                              </div>
                              <span className="ml-2 text-yellow-300 group-hover:text-yellow-200 transition-colors">
                                →
                              </span>
            </button>
          ))}
        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-300 bg-gray-800/30 px-4 py-2 rounded-full">
                          <span className="text-yellow-400">💡</span>
                          <span>Click any actor name to search for their interviews about this content</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">
                          Example: Clicking "Lee Pace" will search for "Lee Pace {searchResults.title} interview"
                        </div>
                      </div>
                    )}

                    {!isLoadingCast && !castError && castMembers.length === 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-400">
                          No cast information available. You can search for actors manually by typing their name + "{searchResults.title} interview"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Sections */}
                {searchResults.actor_interviews && searchResults.actor_interviews.length > 0 && (
                  <CategorySection 
                    title="🎭 Interviews" 
                    videos={searchResults.actor_interviews} 
                    category="Interview"
                    icon={UserIcon}
                  />
                )}
                
                {/* Soundtrack Section - New Music Menu */}
                {!searchResults.title.includes(' - ') && (
                  <div className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 mb-6 sm:mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400/20 rounded-lg">
                          <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">🎵 Soundtrack & Music</h2>
                      </div>
                      <span className="text-xs sm:text-sm text-yellow-200 bg-yellow-400/20 px-2 sm:px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                        Music & Soundtrack
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                      {/* Original Soundtrack Card */}
                      <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-xl border border-yellow-400/30 p-6 text-center hover:scale-105 transition-all duration-300">
                        <div className="w-16 h-16 bg-yellow-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlayIcon className="h-8 w-8 text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Original Soundtrack</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Official movie soundtrack and score
                        </p>
                        <button 
                          onClick={() => handleSoundtrackSearch()}
                          className="px-4 py-2 bg-yellow-400/30 hover:bg-yellow-400/50 text-yellow-200 rounded-lg transition-colors text-sm font-medium"
                        >
                          View Soundtrack
                        </button>
                      </div>
                      
                      {/* Music Videos Card */}
                      <div className="bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm rounded-xl border border-blue-400/30 p-6 text-center hover:scale-105 transition-all duration-300">
                        <div className="w-16 h-16 bg-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlayIcon className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Music Videos</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Official music videos and performances
                        </p>
                        <button 
                          onClick={() => handleMusicVideosSearch()}
                          className="px-4 py-2 bg-blue-400/30 hover:bg-blue-400/50 text-blue-200 rounded-lg transition-colors text-sm font-medium"
                        >
                          View Videos
                        </button>
                      </div>
                      
                      {/* Covers & Remixes Card */}
                      <div className="bg-gradient-to-br from-green-400/20 to-teal-400/20 backdrop-blur-sm rounded-xl border border-green-400/30 p-6 text-center hover:scale-105 transition-all duration-300">
                        <div className="w-16 h-16 bg-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlayIcon className="h-8 w-8 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Covers & Remixes</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Fan covers and remixed versions
                        </p>
                        <button 
                          onClick={() => handleCoversSearch()}
                          className="px-4 py-2 bg-green-400/30 hover:bg-green-400/50 text-green-200 rounded-lg transition-colors text-sm font-medium"
                        >
                          View Covers
                        </button>
      </div>
                      
                      {/* Music Analysis Card */}
                      <div className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-sm rounded-xl border border-purple-400/30 p-6 text-center hover:scale-105 transition-all duration-300">
                        <div className="w-16 h-16 bg-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PlayIcon className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Music Analysis</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Behind-the-scenes music insights
                        </p>
                        <button 
                          onClick={() => handleAnalysisSearch()}
                          className="px-4 py-2 bg-purple-400/30 hover:bg-purple-400/50 text-purple-200 rounded-lg transition-colors text-sm font-medium"
                        >
                          View Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <CategorySection 
                  title="🎬 Trailers" 
                  videos={searchResults.trailers} 
                  category="Trailer"
                  icon={PlayIcon}
                />
                <CategorySection 
                  title="🎭 Interviews" 
                  videos={searchResults.interviews} 
                  category="Interview"
                  icon={UserIcon}
                />
                <CategorySection 
                  title="🎬 Behind the Scenes" 
                  videos={searchResults.behind_the_scenes} 
                  category="Behind the Scenes"
                  icon={FilmIcon}
                />
                <CategorySection 
                  title="📝 Reviews" 
                  videos={searchResults.reviews} 
                  category="Review"
                  icon={ThumbsUpIcon}
                />
                <CategorySection 
                  title="🎬 Clips" 
                  videos={searchResults.clips} 
                  category="Clip"
                  icon={PlayIcon}
                />
                <CategorySection 
                  title="🎵 Music" 
                  videos={searchResults.music} 
                  category="Music"
                  icon={PlayIcon}
                />
                <CategorySection 
                  title="📺 Other Content" 
                  videos={searchResults.other} 
                  category="Other"
                  icon={FilmIcon}
                />

                {/* No Results Message */}
                {searchResults.total_videos === 0 && (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">🎬</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
                    <p className="text-gray-300 mb-6">
                      We couldn't find any videos for "{searchResults.title}". Try searching for a different movie.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults(null);
                        setSearchError(null);
                      }}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      Try Another Search
                    </button>
                  </div>
                )}
              </div>
            )}

      {/* Features Section */}
            {!searchResults && (
      <div className="py-16">
                <h2 className="text-3xl font-bold text-center text-white mb-12">
          What You Can Discover
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
                      <div key={index} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <Icon className="h-8 w-8 text-gray-900" />
                </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/30 mt-20">
            <div className="container mx-auto px-4 py-8 text-center text-gray-300">
              <p>© 2025 Movie Actors. Discover the stories behind your favorite films.</p>
              </div>
          </footer>

      {/* Status Section */}
      <div className="py-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <div className={`w-3 h-3 rounded-full ${healthLoading ? 'bg-yellow-400' : healthData ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-200">
            {healthLoading ? 'Checking service...' : healthData ? 'Service Online' : 'Service Offline'}
          </span>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;

