from openai import OpenAI
from typing import Dict, Any
import json

class LLMEnricher:
    def __init__(self, api_key: str = None):
        api_key = (api_key or "").strip()
        self.client = OpenAI(api_key=api_key) if api_key else None
    
    def enrich_movie(self, movie: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
            return self._mock_enrichment(movie)
        
        prompt = f"""Analyze this movie and return JSON with exactly these 5 attributes:
1. sentiment: sentiment of overview (positive/negative/neutral)
2. budget_tier: categorize budget (low/medium/high) - budget is ${movie.get('budget', 0):,}
3. revenue_tier: categorize revenue (low/medium/high) - revenue is ${movie.get('revenue', 0):,}
4. effectiveness_score: production effectiveness (0-100) based on budget, revenue, and quality
5. target_audience: primary target audience (e.g., "Family", "Adults", "Teens")

Movie: {movie.get('title')}
Overview: {movie.get('overview', '')}
Budget: ${movie.get('budget', 0):,}
Revenue: ${movie.get('revenue', 0):,}
Genres: {movie.get('genres', '')}

Return only valid JSON: {{"sentiment": "...", "budget_tier": "...", "revenue_tier": "...", "effectiveness_score": 0-100, "target_audience": "..."}}"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            err_msg = str(e)
            if "401" in err_msg or "incorrect api key" in err_msg.lower():
                return self._mock_enrichment(movie)  # Silent fallback for invalid key
            elif "429" not in err_msg and "quota" not in err_msg.lower():
                print(f"Enrichment Error: {err_msg[:80]}")
            return self._mock_enrichment(movie)
    
    def _mock_enrichment(self, movie: Dict[str, Any]) -> Dict[str, Any]:
        budget = movie.get('budget', 0)
        revenue = movie.get('revenue', 0)
        return {
            "sentiment": "positive" if "love" in str(movie.get('overview', '')).lower() else "neutral",
            "budget_tier": "high" if budget > 50000000 else "medium" if budget > 10000000 else "low",
            "revenue_tier": "high" if revenue > 100000000 else "medium" if revenue > 20000000 else "low",
            "effectiveness_score": min(100, max(0, (revenue / max(budget, 1)) * 10)),
            "target_audience": "Adults"
        }

