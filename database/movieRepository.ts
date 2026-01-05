import sqlite3 from 'sqlite3';
import { Movie, MovieEnrichment, Rating } from '../shared/types/movie';
import path from 'path';

// Use absolute path from project root - works in both dev and production
const dbDir = path.resolve(process.cwd(), 'database', 'db');
const DB_PATH = path.join(dbDir, 'movies.db');
const RATINGS_PATH = path.join(dbDir, 'ratings.db');

function getDb(dbPath: string): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function all<T>(db: sqlite3.Database, query: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

function run(db: sqlite3.Database, query: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function getMovies(limit: number = 100): Promise<Movie[]> {
  const db = await getDb(DB_PATH);
  try {
    const rows = await all<any>(db, 'SELECT * FROM movies LIMIT ?', [limit]);
    return rows.map(row => {
      const movie: any = {};
      for (const key in row) {
        movie[key.toLowerCase()] = row[key];
      }
      return movie as Movie;
    });
  } finally {
    db.close();
  }
}

export async function getRatings(movieid?: number): Promise<Rating[]> {
  const db = await getDb(RATINGS_PATH);
  try {
    const query = movieid 
      ? 'SELECT * FROM ratings WHERE movieId = ?'
      : 'SELECT * FROM ratings';
    const params = movieid ? [movieid] : [];
    const rows = await all<any>(db, query, params);
    return rows.map(row => {
      const rating: any = {};
      for (const key in row) {
        rating[key.toLowerCase()] = row[key];
      }
      return rating as Rating;
    });
  } finally {
    db.close();
  }
}

export async function updateMovieEnrichment(movieid: number, enrichment: Partial<MovieEnrichment>): Promise<void> {
  const db = await getDb(DB_PATH);
  try {
    await run(db, `CREATE TABLE IF NOT EXISTS movie_enrichment 
      (movieid INTEGER PRIMARY KEY, sentiment TEXT, budget_tier TEXT, 
       revenue_tier TEXT, effectiveness_score REAL, target_audience TEXT, 
       content_rating TEXT)`);
    
    await run(db, `INSERT OR REPLACE INTO movie_enrichment 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [movieid, enrichment.sentiment || null, enrichment.budget_tier || null,
       enrichment.revenue_tier || null, enrichment.effectiveness_score || null,
       enrichment.target_audience || null, enrichment.content_rating || null]);
  } finally {
    db.close();
  }
}

