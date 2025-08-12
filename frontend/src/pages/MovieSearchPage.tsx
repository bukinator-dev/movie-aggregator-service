import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovieInfo } from '../hooks/useApi';
import { PlayIcon, EyeIcon, ThumbsUpIcon, MessageCircleIcon, CalendarIcon } from 'lucide-react';

const MovieSearchPage: React.FC = () => {
  const { movieTitle } = useParams<{ movieTitle: string }>();
  const navigate = useNavigate();
  const [maxResults, setMaxResults] = useState(20);
  
  const { data: movieInfo, loading, error, refetch } = useMovieInfo(movieTitle || '', maxResults);

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
        <div className="text-red-600 text-xl mb-4">Error loading movie data</div>
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

  if (!movieInfo) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-600 text-xl">No movie data found</div>
      </div>
    );
  }

  const VideoCard: React.FC<{ video: any; category: string }> = ({ video, category }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {video.title}
        </h3>
        {video.channel_title && (
          <p className="text-sm text-gray-600 mb-2">{video.channel_title}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
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
          className="mt-3 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <PlayIcon className="h-4 w-4" />
          <span>Watch on YouTube</span>
        </a>
      </div>
    </div>
  );

  const CategorySection: React.FC<{ title: string; videos: any[]; category: string }> = ({ 
    title, 
    videos, 
    category 
  }) => {
    if (!videos || videos.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} category={category} />
          ))}
        </div>
      </div>
    );
  };

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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{movieInfo.title}</h1>
        
        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center space-x-2">
            <PlayIcon className="h-5 w-5" />
            <span>{movieInfo.total_videos} videos found</span>
          </div>
          <div className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5" />
            <span>{movieInfo.total_views.toLocaleString()} total views</span>
          </div>
        </div>

        {/* Results Control */}
        <div className="flex items-center space-x-4 mb-6">
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
      </div>

      {/* Content Sections */}
      <CategorySection title="🎬 Trailers" videos={movieInfo.trailers} category="Trailer" />
      <CategorySection title="🎭 Interviews" videos={movieInfo.interviews} category="Interview" />
      <CategorySection title="🎬 Behind the Scenes" videos={movieInfo.behind_the_scenes} category="Behind the Scenes" />
      <CategorySection title="📝 Reviews" videos={movieInfo.reviews} category="Review" />
      <CategorySection title="🎬 Clips" videos={movieInfo.clips} category="Clip" />
      <CategorySection title="🎵 Music" videos={movieInfo.music} category="Music" />
      <CategorySection title="📺 Other Content" videos={movieInfo.other} category="Other" />
    </div>
  );
};

export default MovieSearchPage;
