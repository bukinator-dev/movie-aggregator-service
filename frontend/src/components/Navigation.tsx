import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FilmIcon, UserIcon, HomeIcon, TrendingUpIcon } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/movie/inception', label: 'Movie Example', icon: FilmIcon },
    { path: '/actor/leonardo-dicaprio', label: 'Actor Example', icon: UserIcon },
    { path: '/actors/trending', label: 'Trending', icon: TrendingUpIcon },
  ];

  return (
    <nav className="bg-black/30 backdrop-blur-sm shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FilmIcon className="h-8 w-8 text-yellow-400" />
            <span className="text-xl font-bold text-white">Movie Actors</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-yellow-400 bg-yellow-400/20'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

