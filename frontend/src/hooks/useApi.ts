import { useState, useEffect, useCallback } from 'react';
import { MovieAggregatorAPI, handleApiError } from '../services/api';
import { ApiError } from '../types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const apiError = handleApiError(error);
      setState({ data: null, loading: false, error: apiError });
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { ...state, refetch: fetchData };
}

// Specific hooks for different API calls
export function useMovieInfo(movieTitle: string, maxResults: number = 20) {
  return useApi(
    () => MovieAggregatorAPI.getMovieInfo(movieTitle, maxResults),
    [movieTitle, maxResults]
  );
}

export function useVideoSearch(query: string, maxResults: number = 10) {
  return useApi(
    () => MovieAggregatorAPI.searchVideos(query, maxResults),
    [query, maxResults]
  );
}

export function useActorInterviews(actorName: string, movieTitle?: string, maxResults: number = 10) {
  return useApi(
    () => MovieAggregatorAPI.getActorInterviews(actorName, movieTitle, maxResults),
    [actorName, movieTitle, maxResults]
  );
}

export function useActorInfo(actorName: string, maxResults: number = 20) {
  return useApi(
    () => MovieAggregatorAPI.getActorInfo(actorName, maxResults),
    [actorName, maxResults]
  );
}

export function useActorDiscovery(movieTitle: string, maxResults: number = 10) {
  return useApi(
    () => MovieAggregatorAPI.discoverActorsFromMovie(movieTitle, maxResults),
    [movieTitle, maxResults]
  );
}

export function useHealthCheck() {
  return useApi(
    () => MovieAggregatorAPI.getHealth(),
    []
  );
}
