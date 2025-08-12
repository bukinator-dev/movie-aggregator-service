import axios, { AxiosResponse } from 'axios';
import { MovieInfo, Video, HealthResponse, ApiError } from '../types/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // This will be proxied to your Python backend
  timeout: 10000,
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
  static async getMovieInfo(movieTitle: string, maxResults: number = 20): Promise<MovieInfo> {
    const response: AxiosResponse<MovieInfo> = await api.get(`/movie/${encodeURIComponent(movieTitle)}`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Search for videos
  static async searchVideos(query: string, maxResults: number = 10): Promise<Video[]> {
    const response: AxiosResponse<Video[]> = await api.get(`/search/${encodeURIComponent(query)}`, {
      params: { max_results: maxResults }
    });
    return response.data;
  }

  // Get actor interviews
  static async getActorInterviews(actorName: string, movieTitle?: string, maxResults: number = 10): Promise<Video[]> {
    const params: any = { max_results: maxResults };
    if (movieTitle) {
      params.movie_title = movieTitle;
    }
    
    const response: AxiosResponse<Video[]> = await api.get(`/interviews/${encodeURIComponent(actorName)}`, {
      params
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
