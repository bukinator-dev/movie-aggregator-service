import axios, { AxiosResponse } from 'axios';
import { MovieInfo, Video, HealthResponse, ApiError } from '../types/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // This will be proxied to your Python backend
  timeout: 30000, // Increased timeout to 30 seconds for movie searches
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service class
export class MovieAggregatorAPI {
  // Health check
  static async getHealth(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await api.get('/health');
    return response.data;
  }

  // Get movie information with YouTube content
  static async getMovieInfo(movieTitle: string, maxResults: number = 10): Promise<MovieInfo> {
    const response: AxiosResponse<MovieInfo> = await api.get(`/movie/${encodeURIComponent(movieTitle)}`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Search for videos
  static async searchVideos(query: string, maxResults: number = 8): Promise<Video[]> {
    const response: AxiosResponse<Video[]> = await api.get(`/search/${encodeURIComponent(query)}`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Get actor interviews
  static async getActorInterviews(actorName: string, movieTitle?: string, maxResults: number = 8): Promise<Video[]> {
    const params: any = { max_results: maxResults };
    if (movieTitle) {
      params.movie_title = movieTitle;
    }
    
    const response: AxiosResponse<Video[]> = await api.get(`/interviews/${encodeURIComponent(actorName)}`, {
      params
    });
    return response.data;
  }

  // Get comprehensive actor information
  static async getActorInfo(actorName: string, maxResults: number = 12): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/actor/${encodeURIComponent(actorName)}`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Discover actors from a movie
  static async discoverActorsFromMovie(movieTitle: string, maxResults: number = 10): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get(`/discover/actors`, {
      params: { 
        movie_title: movieTitle,
        max_results: maxResults 
      }
    });
    return response.data;
  }

  // Step 3: New Actor Interview Aggregation endpoints
  
  // Search for actors by name
  static async searchActors(query: string, maxResults: number = 10): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get(`/actors/search`, {
      params: { 
        query: query,
        max_results: maxResults 
      }
    });
    return response.data;
  }

  // Analyze actor interviews
  static async analyzeActorInterviews(actorName: string, maxResults: number = 20): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/actor/${encodeURIComponent(actorName)}/interviews/analysis`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Get actor career timeline
  static async getActorCareer(actorName: string, maxResults: number = 50): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get(`/actor/${encodeURIComponent(actorName)}/career`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Get actor collaborations
  static async getActorCollaborations(actorName: string, maxResults: number = 20): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get(`/actor/${encodeURIComponent(actorName)}/collaborations`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Get trending actors
  static async getTrendingActors(period: string = "week", maxResults: number = 10): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get(`/actors/trending`, {
      params: { 
        period: period,
        max_results: maxResults 
      }
    });
    return response.data;
  }

  // Get actors by genre
  static async getActorsByGenre(genre: string, maxResults: number = 15): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get(`/actors/genre/${encodeURIComponent(genre)}`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }
}

// Error handling utility
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      detail: error.response?.data?.detail || error.message,
      status_code: error.response?.status || 500,
    };
  }
  return {
    detail: 'An unexpected error occurred',
    status_code: 500,
  };
};

export default MovieAggregatorAPI;

