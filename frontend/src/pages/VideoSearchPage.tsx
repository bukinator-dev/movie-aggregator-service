import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoSearch } from '../hooks/useApi';
import { SearchIcon, PlayIcon, EyeIcon, CalendarIcon, FilterIcon } from 'lucide-react';

const VideoSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: videos, loading, error, refetch } = useVideoSearch(
    searchQuery, 
    maxResults
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      refetch();
    }
  };

  const VideoCard: React.FC<{ video: any }> = ({ video }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {video.category || 'Video'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {video.title}
        </h3>
        {video.channel_title && (
          <p className="text-sm text-gray-600 mb-2">{video.channel_title}</p>
        )}
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {video.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          {video.view_count && (
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{video.view_count.toLocaleString()}</span>
            </div>
          )}
          {video.published_at && (
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(video.published_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <PlayIcon className="h-4 w-4" />
          <span>Watch on YouTube</span>
        </a>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center space-x-2"
        >
          ← Back to Home
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search All Videos</h1>
          <p className="text-xl text-gray-600">
            Discover videos across all categories - trailers, interviews, reviews, and more
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
          <div className="flex shadow-lg rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for videos (e.g., 'Marvel interviews', 'action movie trailers', 'behind the scenes')..."
              className="flex-1 px-6 py-4 text-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 transition-colors"
            >
              <SearchIcon className="h-6 w-6" />
            </button>
          </div>
        </form>

        {/* Search Controls */}
        {isSearching && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center space-x-4">
              <FilterIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Search Settings:</span>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Max Results:</label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {isSearching && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-600 text-xl mb-4">Error searching videos</div>
              <div className="text-gray-600 mb-6">{error.detail}</div>
              <button
                onClick={refetch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : videos && videos.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Found {videos.length} video{videos.length !== 1 ? 's' : ''} for "{searchQuery}"
                </h2>
                <div className="text-sm text-gray-600">
                  Showing up to {maxResults} results
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-600 text-xl mb-4">
                No videos found for "{searchQuery}"
              </div>
              <p className="text-gray-500 mb-6">
                Try different search terms or check your spelling.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Search suggestions:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Marvel interviews', 'action trailers', 'behind the scenes', 'movie reviews'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setIsSearching(true);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!isSearching && (
        <div className="text-center py-16">
          <SearchIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Ready to search for videos?
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter your search query above to find trailers, interviews, behind-the-scenes footage, 
            reviews, and more from the world of movies.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoSearchPage;
