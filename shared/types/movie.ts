export interface Movie {
  movieid: number;
  title: string;
  imdbid?: string;
  overview?: string;
  productioncompanies?: string;
  releasedate?: string;
  budget?: number;
  revenue?: number;
  runtime?: number;
  language?: string;
  genres?: string;
  status?: string;
}

export interface MovieEnrichment {
  movieid: number;
  sentiment?: string;
  budget_tier?: string;
  revenue_tier?: string;
  effectiveness_score?: number;
  target_audience?: string;
  content_rating?: string;
}

export interface Rating {
  movieid: number;
  userid?: number;
  rating?: number;
  timestamp?: number;
}

