# Restructure Plan

## File Move Map

### Existing Files → New Location

1. `db_utils.py` → `database/movieRepository.ts` (converted to TypeScript)
2. `movie_system.py` → `middleware/services/movieService.ts` (converted to TypeScript)
3. `llm_enrichment.py` → `middleware/services/llmEnricher.ts` (converted to TypeScript)
4. `db/` → `database/db/` (moved as-is)
5. `main.py` → `scripts/enrich.ts` (optional script, converted to TypeScript)
6. `start.js` → removed (replaced by middleware server)
7. `run.bat`, `run.ps1` → removed (replaced by npm scripts)

## New Files to Create

- `shared/types/api.ts` - API request/response types
- `shared/types/movie.ts` - Movie domain types
- `middleware/server.ts` - Express server
- `middleware/routes/api.ts` - API routes
- `frontend/index.html` - HTML entry
- `frontend/src/app.ts` - Frontend TypeScript
- `frontend/src/style.css` - Styles
- `tsconfig.json` - Root TypeScript config
- `middleware/tsconfig.json` - Middleware config
- `frontend/tsconfig.json` - Frontend config

