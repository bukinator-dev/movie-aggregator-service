import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, PlayIcon, UserIcon, FilmIcon, EyeIcon, CalendarIcon, ThumbsUpIcon, MessageCircleIcon, Sparkles } from 'lucide-react';
import { useHealthCheck } from '../hooks/useApi';
import MovieAggregatorAPI from '../services/api';
import { MovieInfo, Video } from '../types/api';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState(10);
  const navigate = useNavigate();
  const { data: healthData, loading: healthLoading } = useHealthCheck();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults(null);
      
      try {
        // First, get the main movie search results
        const movieResults = await MovieAggregatorAPI.getMovieInfo(searchQuery.trim(), maxResults);
        console.log(`🎬 Movie search results for "${searchQuery.trim()}":`, movieResults.total_videos, 'videos');
        
        // Then, get actor interview results by appending "actors interview" to the query
        let actorInterviewResults: Video[] = [];
        try {
          const actorInterviewQuery = `${searchQuery.trim()} actors interview`;
          console.log(`🎭 Enhanced search query: "${actorInterviewQuery}"`);
          actorInterviewResults = await MovieAggregatorAPI.searchVideos(actorInterviewQuery, maxResults);
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
                    Actor interviews + Movie content + Behind-the-scenes footage
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
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors text-sm backdrop-blur-sm border border-white/20"
                    >
                      New Search
                    </button>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-full text-yellow-200 transition-colors text-sm backdrop-blur-sm border border-yellow-400/30"
                    >
                      Back to Top
                    </button>
                  </div>
                </div>

                {/* Content Sections */}
                {searchResults.actor_interviews && searchResults.actor_interviews.length > 0 && (
                  <CategorySection 
                    title="🎭 Interviews" 
                    videos={searchResults.actor_interviews} 
                    category="Interview"
                    icon={UserIcon}
                  />
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

