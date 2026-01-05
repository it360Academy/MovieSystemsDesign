import OpenAI from 'openai';
import { Movie, MovieEnrichment } from '../../shared/types/movie';

export class LLMEnricher {
  private client: OpenAI | null;

  constructor(apiKey?: string) {
    const key = (apiKey || '').trim();
    this.client = key ? new OpenAI({ apiKey: key }) : null;
  }

  async enrichMovie(movie: Movie): Promise<MovieEnrichment> {
    if (!this.client) {
      return this.mockEnrichment(movie);
    }

    const prompt = `Analyze this movie and return JSON with exactly these 5 attributes:
1. sentiment: sentiment of overview (positive/negative/neutral)
2. budget_tier: categorize budget (low/medium/high) - budget is $${(movie.budget || 0).toLocaleString()}
3. revenue_tier: categorize revenue (low/medium/high) - revenue is $${(movie.revenue || 0).toLocaleString()}
4. effectiveness_score: production effectiveness (0-100) based on budget, revenue, and quality
5. target_audience: primary target audience (e.g., "Family", "Adults", "Teens")

Movie: ${movie.title}
Overview: ${movie.overview || ''}
Budget: $${(movie.budget || 0).toLocaleString()}
Revenue: $${(movie.revenue || 0).toLocaleString()}
Genres: ${movie.genres || ''}

Return only valid JSON: {"sentiment": "...", "budget_tier": "...", "revenue_tier": "...", "effectiveness_score": 0-100, "target_audience": "..."}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });
      return JSON.parse(response.choices[0].message.content || '{}') as MovieEnrichment;
    } catch (e: any) {
      const errMsg = String(e);
      if (!errMsg.includes('401') && !errMsg.toLowerCase().includes('incorrect api key') &&
          !errMsg.includes('429') && !errMsg.toLowerCase().includes('quota')) {
        console.error(`Enrichment Error: ${errMsg.substring(0, 80)}`);
      }
      return this.mockEnrichment(movie);
    }
  }

  private mockEnrichment(movie: Movie): MovieEnrichment {
    const budget = movie.budget || 0;
    const revenue = movie.revenue || 0;
    return {
      movieid: movie.movieid,
      sentiment: movie.overview?.toLowerCase().includes('love') ? 'positive' : 'neutral',
      budget_tier: budget > 50000000 ? 'high' : budget > 10000000 ? 'medium' : 'low',
      revenue_tier: revenue > 100000000 ? 'high' : revenue > 20000000 ? 'medium' : 'low',
      effectiveness_score: Math.min(100, Math.max(0, (revenue / Math.max(budget, 1)) * 10)),
      target_audience: 'Adults'
    };
  }
}

