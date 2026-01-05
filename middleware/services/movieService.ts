import OpenAI from 'openai';
import { getMovies, getRatings, updateMovieEnrichment } from '../../database/movieRepository';
import { LLMEnricher } from './llmEnricher';
import { Movie } from '../../shared/types/movie';
import { QueryResponse } from '../../shared/types/api';

export class MovieService {
  private llm: LLMEnricher;
  private client: OpenAI | null;
  private hasApiKey: boolean;

  constructor(apiKey?: string) {
    let key = (apiKey || '').trim();
    
    // Remove quotes if present
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1).trim();
    }
    if (key.startsWith("'") && key.endsWith("'")) {
      key = key.slice(1, -1).trim();
    }
    
    this.llm = new LLMEnricher(key || undefined);
    this.client = key ? new OpenAI({ apiKey: key }) : null;
    this.hasApiKey = !!key;
  }

  async enrichMovies(limit: number = 100): Promise<number> {
    const movies = await getMovies(limit);
    for (const movie of movies) {
      const enrichment = await this.llm.enrichMovie(movie);
      await updateMovieEnrichment(movie.movieid, enrichment);
    }
    return movies.length;
  }

  async recommend(query: string, limit: number = 5): Promise<Movie[]> {
    const movies = await getMovies(200);
    if (!this.client) {
      return movies.slice(0, limit);
    }

    const result = await this.llmCall(
      `Given these movies and user query, recommend top ${limit} movies.
Query: ${query}
Movies (JSON array): ${JSON.stringify(movies.slice(0, 50))}
Return JSON: {"recommendations": [movieid1, movieid2, ...]}`,
      0.5
    );
    const recs = result.recommendations || [];
    return movies.filter(m => recs.includes(m.movieid)).slice(0, limit);
  }

  async predictRating(movieid: number, userPreferences: string = ''): Promise<number> {
    const movies = await getMovies(1000);
    const movie = movies.find(m => m.movieid === movieid);
    if (!movie || !this.client) {
      return 7.5;
    }

    const ratings = await getRatings(movieid);
    const result = await this.llmCall(
      `Predict rating (0-10) for this movie:
Movie: ${movie.title}
Overview: ${movie.overview || ''}
Budget: $${(movie.budget || 0).toLocaleString()}
Revenue: $${(movie.revenue || 0).toLocaleString()}
Ratings: ${ratings.length}
Preferences: ${userPreferences || 'None'}
Return JSON: {"predicted_rating": 0-10}`,
      0.2
    );
    return parseFloat(String(result.predicted_rating || 7.5));
  }

  async query(prompt: string, options?: {
    genre?: string;
    minRevenue?: number;
    minRating?: number;
    sentimentThreshold?: number;
  }): Promise<QueryResponse> {
    const movies = await getMovies(200);
    
    if (!this.hasApiKey || !this.client) {
      return {
        columns: ['title', 'revenue', 'budget', 'genres'],
        rows: movies.slice(0, 5).map(m => ({
          title: m.title || '',
          revenue: m.revenue || 0,
          budget: m.budget || 0,
          genres: m.genres || ''
        })),
        summary: 'LLM not configured - set OPENAI_API_KEY environment variable'
      };
    }

    let filteredMovies = movies;
    if (options) {
      if (options.genre) {
        filteredMovies = filteredMovies.filter(m => 
          m.genres?.toLowerCase().includes(options.genre!.toLowerCase())
        );
      }
      if (options.minRevenue) {
        filteredMovies = filteredMovies.filter(m => (m.revenue || 0) >= options.minRevenue!);
      }
    }

    const result = await this.llmCall(
      `Answer this query: ${prompt}
Movies: ${JSON.stringify(filteredMovies.slice(0, 50))}
Return JSON: {"answer": "...", "relevant_movies": [movieid1, ...]}`,
      0.4
    );

    if (!result || !result.answer) {
      let errorMsg = 'LLM call failed';
      if (result?.error === 'invalid_api_key') {
        errorMsg = 'Invalid API key - please set OPENAI_API_KEY environment variable with a valid key';
      } else if (result?.error === 'quota_exceeded') {
        errorMsg = 'OpenAI quota exceeded - please check your account billing';
      } else if (result?.error === 'network_error') {
        errorMsg = 'Network error - please check your internet connection';
      } else if (!this.hasApiKey) {
        errorMsg = 'API key not set - please set OPENAI_API_KEY environment variable';
      } else {
        errorMsg = 'LLM call failed - check API key and quota. See server logs for details.';
      }
      
      return {
        columns: ['title', 'revenue', 'budget', 'genres'],
        rows: movies.slice(0, 5).map(m => ({
          title: m.title || '',
          revenue: m.revenue || 0,
          budget: m.budget || 0,
          genres: m.genres || ''
        })),
        summary: errorMsg
      };
    }

    const movieIds = result.relevant_movies || [];
    const relevantMovies = filteredMovies.filter(m => movieIds.includes(m.movieid));

    const columns = ['title', 'revenue', 'budget', 'runtime', 'genres', 'overview'].filter(
      col => relevantMovies.some(m => (m as any)[col] != null)
    );

    return {
      columns,
      rows: relevantMovies.map(m => {
        const row: Record<string, any> = {};
        columns.forEach(col => {
          row[col] = (m as any)[col] ?? null;
        });
        return row;
      }),
      summary: result.answer
    };
  }

  private async llmCall(prompt: string, temp: number = 0.4): Promise<any> {
    if (!this.client) return {};
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: temp
      });
      const content = response.choices[0].message.content || '{}';
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', content.substring(0, 200));
        return {};
      }
    } catch (e: any) {
      const errMsg = String(e);
      const errorDetails = e.message || errMsg;
      
      if (errMsg.includes('401') || errMsg.toLowerCase().includes('incorrect api key') || errMsg.toLowerCase().includes('invalid api key')) {
        console.error('OpenAI API Error: Invalid API key (401).');
        console.error('Error details:', errorDetails.substring(0, 300));
        console.error('Please verify:');
        console.error('  1. API key is correct and not expired');
        console.error('  2. API key starts with "sk-"');
        console.error('  3. API key has no extra spaces or quotes');
        console.error('  4. Your OpenAI account has credits/quota');
        console.error('Get a valid key at: https://platform.openai.com/api-keys');
        return { error: 'invalid_api_key' };
      } else if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota')) {
        console.error('OpenAI API Error: Quota exceeded (429). Please check your OpenAI account billing.');
        return { error: 'quota_exceeded' };
      } else if (errMsg.includes('ENOTFOUND') || errMsg.includes('ECONNREFUSED')) {
        console.error('OpenAI API Error: Network error. Check your internet connection.');
        return { error: 'network_error' };
      } else {
        console.error('OpenAI API Error:', errorDetails.substring(0, 200));
        return { error: 'unknown_error', details: errorDetails.substring(0, 100) };
      }
    }
  }
}

