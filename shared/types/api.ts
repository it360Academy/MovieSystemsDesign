export interface QueryRequest {
  prompt: string;
  options?: {
    genre?: string;
    minRevenue?: number;
    minRating?: number;
    sentimentThreshold?: number;
  };
}

export interface QueryResponse {
  columns: string[];
  rows: Array<Record<string, string | number | boolean | null>>;
  summary?: string;
}

export interface RecommendationResponse {
  movies: Array<{
    movieid: number;
    title: string;
    revenue?: number;
    [key: string]: any;
  }>;
}

export interface RatingPredictionResponse {
  predicted_rating: number;
  movieid: number;
}

