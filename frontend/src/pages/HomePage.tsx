import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, PlayIcon, UserIcon, FilmIcon, EyeIcon, CalendarIcon, ThumbsUpIcon, MessageCircleIcon } from 'lucide-react';
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="relative">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded font-medium">
          {category}
        </div>
        {video.duration && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
          {video.title}
        </h3>
        {video.channel_title && (
          <p className="text-xs text-gray-600 mb-2 truncate">{video.channel_title}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {video.view_count && (
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-3 w-3" />
              <span>{video.view_count.toLocaleString()}</span>
            </div>
          )}
          {video.published_at && (
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{new Date(video.published_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
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
        <div className="flex items-center space-x-2 mb-6">
          <Icon className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
      color: 'bg-green-500'
    },
    {
      icon: FilmIcon,
      title: 'Movie Content',
      description: 'Discover trailers, behind-the-scenes footage, and more for any movie.',
      color: 'bg-blue-500'
    },
    {
      icon: PlayIcon,
      title: 'Video Search',
      description: 'Search across all video content with smart categorization.',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Movie Actors
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover actor interviews, behind-the-scenes footage, trailers, and more for your favorite movies.
        </p>

        {/* Enhanced Search Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a movie to find actor interviews (e.g., Inception, Matrix, Avengers)..."
                className="flex-1 px-6 py-4 text-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={isSearching}
                list="movie-suggestions"
              />
              <datalist id="movie-suggestions">
                {popularMovies.map((movie) => (
                  <option key={movie} value={movie} />
                ))}
              </datalist>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 transition-all duration-200 flex items-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-6 w-6" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">
                🔍 Enhanced search finds actor interviews + movie content
              </span>
              {searchResults && searchResults.actor_interviews && searchResults.actor_interviews.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    ✨ Enhanced results active
                  </span>
                </div>
              )}
            </div>
          </form>

          {/* Search Controls */}
          {searchResults && (
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Max Results:
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-full">
                ✨ Enhanced search with actor interviews
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                  setSearchError(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Quick Examples */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {popularMovies.map((movie) => (
            <button
              key={movie}
              onClick={() => {
                setSearchQuery(movie);
                handleSearch({ preventDefault: () => {} } as React.FormEvent);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              {movie}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Section */}
      {isSearching && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Searching for "{searchQuery}"...</p>
        </div>
      )}

      {searchError && (
        <div className="text-center py-16">
          <div className="text-red-600 text-xl mb-4">❌ Search Error</div>
          <div className="text-gray-600 mb-6">{searchError}</div>
          <button
            onClick={() => setSearchError(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {searchResults && (
        <div className="py-8">
          {/* Results Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎬 Enhanced Results for "{searchResults.title}"
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Actor interviews + Movie content + Behind-the-scenes footage
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <PlayIcon className="h-5 w-5" />
                <span>{searchResults.total_videos} videos found</span>
              </div>
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-5 w-5" />
                <span>{searchResults.total_views.toLocaleString()} total views</span>
              </div>
              {searchResults.actor_interviews && searchResults.actor_interviews.length > 0 && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
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
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors text-sm"
              >
                New Search
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700 transition-colors text-sm"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any videos for "{searchResults.title}". Try searching for a different movie.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                  setSearchError(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You Can Discover
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Section */}
      <div className="py-8 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100">
          <div className={`w-3 h-3 rounded-full ${healthLoading ? 'bg-yellow-400' : healthData ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-600">
            {healthLoading ? 'Checking service...' : healthData ? 'Service Online' : 'Service Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

