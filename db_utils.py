import sqlite3
from typing import List, Dict, Any

DB_PATH = r'D:\SandBox2026\Aetna\db\movies.db'
RATINGS_PATH = r'D:\SandBox2026\Aetna\db\ratings.db'

def get_movies(limit: int = 100) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM movies LIMIT ?', (limit,))
    movies = [{k.lower(): v for k, v in dict(row).items()} for row in cursor.fetchall()]
    conn.close()
    return movies

def get_ratings(movieid: int = None) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(RATINGS_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    if movieid:
        cursor.execute('SELECT * FROM ratings WHERE movieId = ?', (movieid,))
    else:
        cursor.execute('SELECT * FROM ratings')
    ratings = [{k.lower(): v for k, v in dict(row).items()} for row in cursor.fetchall()]
    conn.close()
    return ratings

def update_movie_enrichment(movieid: int, enrichment: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS movie_enrichment 
                     (movieid INTEGER PRIMARY KEY, sentiment TEXT, budget_tier TEXT, 
                      revenue_tier TEXT, effectiveness_score REAL, target_audience TEXT, 
                      content_rating TEXT)''')
    cursor.execute('''INSERT OR REPLACE INTO movie_enrichment 
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                   (movieid, enrichment.get('sentiment'), enrichment.get('budget_tier'),
                    enrichment.get('revenue_tier'), enrichment.get('effectiveness_score'),
                    enrichment.get('target_audience'), enrichment.get('content_rating')))
    conn.commit()
    conn.close()

