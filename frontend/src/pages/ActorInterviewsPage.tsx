import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useActorInterviews } from '../hooks/useApi';
import { PlayIcon, EyeIcon, CalendarIcon, UserIcon, FilmIcon } from 'lucide-react';

const ActorInterviewsPage: React.FC = () => {
  const { actorName } = useParams<{ actorName: string }>();
  const navigate = useNavigate();
  const [maxResults, setMaxResults] = useState(20);
  const [movieFilter, setMovieFilter] = useState('');
  
  const { data: interviews, loading, error, refetch } = useActorInterviews(
    actorName || '', 
    movieFilter || undefined, 
    maxResults
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 text-xl mb-4">Error loading actor interviews</div>
        <div className="text-gray-600 mb-6">{error.detail}</div>
        <button
          onClick={refetch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

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
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
          Interview
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
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
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
          ← Back to Search
        </button>
        
        <div className="flex items-center space-x-4 mb-6">
          <UserIcon className="h-12 w-12 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {actorName?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <p className="text-xl text-gray-600">Actor Interviews & Content</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Max Results:
              </label>
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
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Filter by Movie:
              </label>
              <input
                type="text"
                value={movieFilter}
                onChange={(e) => setMovieFilter(e.target.value)}
                placeholder="e.g., Inception, Matrix..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {interviews && interviews.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Found {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
            </h2>
            {movieFilter && (
              <div className="text-sm text-gray-600">
                Filtered by: <span className="font-medium">{movieFilter}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {interviews.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-600 text-xl mb-4">
            {movieFilter 
              ? `No interviews found for ${actorName} in "${movieFilter}"`
              : `No interviews found for ${actorName}`
            }
          </div>
          <p className="text-gray-500 mb-6">
            Try adjusting your search criteria or removing the movie filter.
          </p>
          <button
            onClick={() => {
              setMovieFilter('');
              setMaxResults(50);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ActorInterviewsPage;
