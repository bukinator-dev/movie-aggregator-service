// TMDB (The Movie Database) Service
import { TMDB_CONFIG } from '../config/tmdb';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDBSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCastResponse {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCastMember[];
}

export interface TMDBMovieSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSeriesSearchResponse {
  page: number;
  results: TMDBSeries[];
  total_pages: number;
  total_results: number;
}

export interface TMDBContent {
  id: number;
  title: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  media_type: 'movie' | 'tv';
}

class TMDBService {
  // Search for movies by title
  async searchMovies(query: string): Promise<TMDBMovie[]> {
    try {
      const url = `${TMDB_CONFIG.BASE_URL}/search/movie?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}&language=${TMDB_CONFIG.LANGUAGE}&page=1&include_adult=${TMDB_CONFIG.INCLUDE_ADULT}`;
      console.log(`🔍 TMDB: Making movie search request to:`, url);
      
      const response = await fetch(url);
      console.log(`🔍 TMDB: Movie search response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ TMDB: Movie search API error ${response.status}:`, errorText);
        throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
      }
      
      const data: TMDBMovieSearchResponse = await response.json();
      console.log(`🔍 TMDB: Movie search raw API response:`, data);
      
      const results = data.results.slice(0, TMDB_CONFIG.MAX_SEARCH_RESULTS);
      console.log(`🔍 TMDB: Returning ${results.length} movie results`);
      return results;
    } catch (error) {
      console.error('❌ TMDB: Error searching movies:', error);
      return [];
    }
  }

  // Search for TV series by title
  async searchSeries(query: string): Promise<TMDBSeries[]> {
    try {
      const url = `${TMDB_CONFIG.BASE_URL}/search/tv?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}&language=${TMDB_CONFIG.LANGUAGE}&page=1&include_adult=${TMDB_CONFIG.INCLUDE_ADULT}`;
      console.log(`📺 TMDB: Making TV search request to:`, url);
      
      const response = await fetch(url);
      console.log(`📺 TMDB: TV search response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ TMDB: TV search API error ${response.status}:`, errorText);
        throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
      }
      
      const data: TMDBSeriesSearchResponse = await response.json();
      console.log(`📺 TMDB: TV search raw API response:`, data);
      
      const results = data.results.slice(0, TMDB_CONFIG.MAX_SEARCH_RESULTS);
      console.log(`📺 TMDB: Returning ${results.length} TV results`);
      return results;
    } catch (error) {
      console.error('❌ TMDB: Error searching TV series:', error);
      return [];
    }
  }

  // Multi-search: search both movies and TV shows
  async multiSearch(query: string): Promise<TMDBContent[]> {
    try {
      console.log(`🔍📺 TMDB: Starting multi-search for: "${query}"`);
      
      // Search both movies and TV shows in parallel
      const [movieResults, seriesResults] = await Promise.all([
        this.searchMovies(query),
        this.searchSeries(query)
      ]);
      
      // Combine and normalize results
      const combinedResults: TMDBContent[] = [
        ...movieResults.map(movie => ({
          ...movie,
          title: movie.title,
          original_title: movie.original_title,
          release_date: movie.release_date,
          media_type: 'movie' as const
        })),
        ...seriesResults.map(series => ({
          ...series,
          title: series.name,
          original_title: series.original_name,
          release_date: series.first_air_date,
          media_type: 'tv' as const
        }))
      ];
      
      // Sort by popularity (vote_average * vote_count)
      combinedResults.sort((a, b) => (b.vote_average * b.vote_count) - (a.vote_average * a.vote_count));
      
      // Return top results
      const topResults = combinedResults.slice(0, TMDB_CONFIG.MAX_SEARCH_RESULTS);
      console.log(`🔍📺 TMDB: Multi-search returning ${topResults.length} combined results`);
      
      return topResults;
    } catch (error) {
      console.error('❌ TMDB: Error in multi-search:', error);
      return [];
    }
  }

  // Get movie details including cast
  async getMovieCast(movieId: number): Promise<TMDBCastResponse | null> {
    try {
      const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`;
      console.log(`🎭 TMDB: Fetching movie cast from:`, url);
      
      const response = await fetch(url);
      console.log(`🎭 TMDB: Movie cast response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ TMDB: Movie cast API error ${response.status}:`, errorText);
        throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
      }
      
      const data: TMDBCastResponse = await response.json();
      console.log(`🎭 TMDB: Movie cast API response:`, data);
      return data;
    } catch (error) {
      console.error('❌ TMDB: Error fetching movie cast:', error);
      return null;
    }
  }

  // Get TV series cast
  async getSeriesCast(seriesId: number): Promise<TMDBCastResponse | null> {
    try {
      const url = `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}/credits?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`;
      console.log(`🎭 TMDB: Fetching TV series cast from:`, url);
      
      const response = await fetch(url);
      console.log(`🎭 TMDB: TV series cast response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ TMDB: TV series cast API error ${response.status}:`, errorText);
        throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
      }
      
      const data: TMDBCastResponse = await response.json();
      console.log(`🎭 TMDB: TV series cast API response:`, data);
      return data;
    } catch (error) {
      console.error('❌ TMDB: Error fetching TV series cast:', error);
      return null;
    }
  }

  // Get movie by ID
  async getMovieById(movieId: number): Promise<TMDBMovie | null> {
    try {
      const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data: TMDBMovie = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      return null;
    }
  }

  // Get full poster URL
  getPosterUrl(posterPath: string | null): string {
    if (!posterPath) {
      return 'https://via.placeholder.com/500x750/666666/FFFFFF?text=No+Image';
    }
    return `${TMDB_CONFIG.POSTER_BASE_URL}${posterPath}`;
  }

  // Get full backdrop URL
  getBackdropUrl(backdropPath: string | null): string {
    if (!backdropPath) {
      return 'https://via.placeholder.com/1920x1080/666666/FFFFFF?text=No+Image';
    }
    return `${TMDB_CONFIG.BACKDROP_BASE_URL}${backdropPath}`;
  }

  // Find movie/TV show by title and get cast
  async findMovieAndCast(title: string): Promise<{
    content: TMDBContent | null;
    cast: TMDBCastMember[];
  }> {
    try {
      console.log(`🔍📺 TMDB: Searching for content: "${title}"`);
      
      // Use multi-search to find both movies and TV shows
      const searchResults = await this.multiSearch(title);
      console.log(`🔍📺 TMDB: Multi-search results:`, searchResults);
      
      if (searchResults.length === 0) {
        console.warn(`⚠️ TMDB: No content found for "${title}"`);
        return { content: null, cast: [] };
      }
      
      // Get the first (most relevant) result
      const content = searchResults[0];
      console.log(`🎬📺 TMDB: Selected content:`, content);
      
      // Get the cast based on content type
      let castData: TMDBCastResponse | null = null;
      
      if (content.media_type === 'movie') {
        console.log(`🎭 TMDB: Fetching cast for movie ID: ${content.id}`);
        castData = await this.getMovieCast(content.id);
      } else if (content.media_type === 'tv') {
        console.log(`🎭 TMDB: Fetching cast for TV series ID: ${content.id}`);
        castData = await this.getSeriesCast(content.id);
      }
      
      console.log(`🎭 TMDB: Cast data:`, castData);
      
      if (!castData) {
        console.warn(`⚠️ TMDB: No cast data found for ${content.media_type} ID: ${content.id}`);
        return { content, cast: [] };
      }
      
      // Return top cast members (main characters)
      const topCast = castData.cast
        .sort((a, b) => a.order - b.order)
        .slice(0, TMDB_CONFIG.MAX_CAST_MEMBERS);
      
      console.log(`🎭 TMDB: Top ${topCast.length} cast members:`, topCast);
      
      return { content, cast: topCast };
    } catch (error) {
      console.error('❌ TMDB: Error finding content and cast:', error);
      return { content: null, cast: [] };
    }
  }
}

export default new TMDBService();
