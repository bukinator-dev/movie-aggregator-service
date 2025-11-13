// TMDB Configuration
export const TMDB_CONFIG = {
  // Get your free API key from: https://www.themoviedb.org/settings/api
  API_KEY: import.meta.env.VITE_TMDB_API_KEY || '12e1a75aa59b2cd8e59c727ad7d3e9dc',
  
  // API endpoints
  BASE_URL: 'https://api.themoviedb.org/3',
  
  // Image URLs
  POSTER_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/original',
  
  // Default settings
  LANGUAGE: 'en-US',
  INCLUDE_ADULT: false,
  MAX_CAST_MEMBERS: 20,
  MAX_SEARCH_RESULTS: 20
};

// Instructions for getting TMDB API key:
// 1. Go to https://www.themoviedb.org/
// 2. Create a free account
// 3. Go to Settings > API
// 4. Request an API key (read access)
// 5. Copy the API key and replace 'YOUR_TMDB_API_KEY_HERE' above
// 6. The free tier gives you 1000 requests per day
