// TypeScript types matching your Python API models

export interface Video {
  id: string;
  title: string;
  description?: string;
  channel_title?: string;
  published_at?: string;
  thumbnail?: string;
  url: string;
  category: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  duration?: string;
}

export interface MovieInfo {
  title: string;
  total_videos: number;
  total_views: number;
  videos_by_category: Record<string, Video[]>;
  trailers: Video[];
  interviews: Video[];
  behind_the_scenes: Video[];
  reviews: Video[];
  clips: Video[];
  music: Video[];
  other: Video[];
  actors: any[]; // Will be populated in Step 3
  brand_products: any[]; // Will be populated in Step 4
  actor_interviews?: Video[]; // Enhanced search results for actor interviews
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}


