import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActorDiscovery } from '../hooks/useApi';
import { UserIcon, PlayIcon, EyeIcon } from 'lucide-react';

interface ActorDiscoveryProps {
  movieTitle: string;
}

const ActorDiscovery: React.FC<ActorDiscoveryProps> = ({ movieTitle }) => {
  const navigate = useNavigate();
  const [maxResults, setMaxResults] = useState(10);
  const { data: actors, loading, error } = useActorDiscovery(movieTitle, maxResults);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-4">
          <div className="text-red-600 text-sm mb-2">Error loading actors</div>
          <div className="text-gray-500 text-xs">{error.detail}</div>
        </div>
      </div>
    );
  }

  if (!actors || actors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm">No actors found for this movie</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <UserIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Actors Found in "{movieTitle}"
        </h3>
      </div>

      <div className="space-y-4">
        {actors.map((actor, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{actor.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{actor.interview_count} interview{actor.interview_count !== 1 ? 's' : ''}</span>
                    <span>{actor.total_views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/actor/${actor.name.replace(/\s+/g, '-')}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                View Interviews
              </button>
            </div>

            {actor.recent_interviews && actor.recent_interviews.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Recent Interviews:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {actor.recent_interviews.map((interview: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      {interview.thumbnail && (
                        <img
                          src={interview.thumbnail}
                          alt={interview.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {interview.title}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <EyeIcon className="h-3 w-3" />
                          <span>{interview.view_count?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </div>
                      <a
                        href={interview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {actors.length} actor{actors.length !== 1 ? 's' : ''}
          </span>
          <select
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={5}>5 actors</option>
            <option value={10}>10 actors</option>
            <option value={20}>20 actors</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ActorDiscovery;
