from openai import OpenAI
from db_utils import get_movies, get_ratings, update_movie_enrichment
from llm_enrichment import LLMEnricher
from typing import List, Dict, Any
import json

class MovieSystem:
    def __init__(self, api_key: str = None):
        api_key = (api_key or "").strip()
        self.llm = LLMEnricher(api_key if api_key else None)
        self.client = OpenAI(api_key=api_key) if api_key else None
        self.has_api_key = bool(api_key)
    
    def _llm_call(self, prompt: str, temp: float = 0.4) -> dict:
        if not self.client:
            return {}
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}, temperature=temp
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            err_msg = str(e)
            if "401" in err_msg or "incorrect api key" in err_msg.lower():
                return {}  # Silent fallback for invalid key
            elif "429" in err_msg or "quota" in err_msg.lower():
                print("OpenAI quota exceeded. Using fallback mode.")
            return {}
    
    def enrich_movies(self, limit: int = 100):
        movies = get_movies(limit)
        for movie in movies:
            enrichment = self.llm.enrich_movie(movie)
            update_movie_enrichment(movie['movieid'], enrichment)
        return len(movies)
    
    def recommend(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        movies = get_movies(200)
        if not self.client:
            return movies[:limit]
        
        result = self._llm_call(f"""Given these movies and user query, recommend top {limit} movies.
Query: {query}
Movies (JSON array): {json.dumps(movies[:50], default=str)}
Return JSON: {{"recommendations": [movieid1, movieid2, ...]}}""", 0.5)
        recs = result.get('recommendations', [])
        return [m for m in movies if m['movieid'] in recs][:limit] if recs else movies[:limit]
    
    def predict_rating(self, movieid: int, user_preferences: str = "") -> float:
        movie = next((m for m in get_movies(1000) if m['movieid'] == movieid), None)
        if not movie or not self.client:
            return 7.5
        
        result = self._llm_call(f"""Predict rating (0-10) for this movie:
Movie: {movie.get('title')}
Overview: {movie.get('overview')}
Budget: ${movie.get('budget', 0):,}
Revenue: ${movie.get('revenue', 0):,}
Ratings: {len(get_ratings(movieid))}
Preferences: {user_preferences or 'None'}
Return JSON: {{"predicted_rating": 0-10}}""", 0.2)
        return float(result.get('predicted_rating', 7.5))
    
    def query(self, query: str) -> Dict[str, Any]:
        movies = get_movies(200)
        if not self.has_api_key or not self.client:
            return {"answer": "LLM not configured - set OPENAI_API_KEY environment variable", "movies": movies[:5]}
        
        result = self._llm_call(f"""Answer this query: {query}
Movies: {json.dumps(movies[:50], default=str)}
Return JSON: {{"answer": "...", "relevant_movies": [movieid1, ...]}}""", 0.4)
        if not result:
            return {"answer": "LLM call failed - check API key and quota", "movies": movies[:5]}
        movie_ids = result.get('relevant_movies', [])
        return {"answer": result.get('answer', ''), "movies": [m for m in movies if m['movieid'] in movie_ids]}
    
    def compare_movies(self, movieids: List[int], criteria: str = "budget, revenue, runtime") -> Dict[str, Any]:
        movies = [m for m in get_movies(1000) if m['movieid'] in movieids]
        if not self.has_api_key or not self.client:
            return {"comparison": "LLM not configured", "summary": "Set OPENAI_API_KEY environment variable for detailed comparison", "movies": movies}
        
        result = self._llm_call(f"""Compare these movies on: {criteria}
Movies: {json.dumps(movies, default=str)}
Return JSON: {{"comparison": "...", "summary": "..."}}""", 0.3)
        if not result:
            return {"comparison": "LLM call failed", "summary": "Check API key and quota", "movies": movies}
        return {"comparison": result.get('comparison', ''), "summary": result.get('summary', 'No summary available'), "movies": movies}

