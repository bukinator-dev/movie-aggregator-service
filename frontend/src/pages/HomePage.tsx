import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, PlayIcon, UserIcon, FilmIcon } from 'lucide-react';
import { useHealthCheck } from '../hooks/useApi';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: healthData, loading: healthLoading } = useHealthCheck();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movie/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: FilmIcon,
      title: 'Movie Content',
      description: 'Discover trailers, interviews, behind-the-scenes, and more for any movie.',
      color: 'bg-blue-500'
    },
    {
      icon: UserIcon,
      title: 'Actor Interviews',
      description: 'Find interviews with your favorite actors from specific movies.',
      color: 'bg-green-500'
    },
    {
      icon: PlayIcon,
      title: 'Video Search',
      description: 'Search across all video content with smart categorization.',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Movie Aggregator
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover all the content related to your favorite movies - from trailers and interviews 
          to behind-the-scenes footage and reviews.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex shadow-lg rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a movie (e.g., Inception, Matrix, Avengers)..."
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

        {/* Quick Examples */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {['Inception', 'Matrix', 'Avengers', 'Titanic'].map((movie) => (
            <button
              key={movie}
              onClick={() => navigate(`/movie/${movie}`)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              {movie}
            </button>
          ))}
        </div>
      </div>

      {/* Features Section */}
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
