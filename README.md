# Movie Systems Design

TypeScript full-stack application with clean separation of concerns.

## Project Structure

```
/frontend          - TypeScript frontend (single-page tester)
/middleware        - Express API server (TypeScript)
/database          - Database layer and SQLite files
/shared            - Shared types and interfaces
/scripts           - Utility scripts (optional)
```

## Setup

```bash
# Install dependencies
npm install

# Set OpenAI API key (optional - will use mock mode if not set)
# PowerShell:
$env:OPENAI_API_KEY="your_api_key_here"
# CMD:
set OPENAI_API_KEY=your_api_key_here
```

## Development

```bash
# Run frontend dev server (TypeScript watch)
npm run dev:frontend

# Run middleware dev server (API)
npm run dev:middleware

# Run both (full stack dev)
npm run dev
```

## Build & Production

```bash
# Build everything
npm run build

# Start production server
npm start
```

Then open `frontend/index.html` in your browser (or serve it via a simple HTTP server).

## API Endpoints

- `POST /api/query` - Natural language movie queries
  - Body: `{ prompt: string, options?: { genre?, minRevenue?, minRating? } }`
  - Response: `{ columns: string[], rows: Array<Record<string, any>>, summary?: string }`

- `GET /health` - Health check

## Architecture

**Frontend**: Pure TypeScript/HTML/CSS - no framework overhead
**Middleware**: Express.js with TypeScript
**Database**: SQLite3 with TypeScript repository pattern
**Shared Types**: Common interfaces for type safety across layers

## File Locations

- Database files: `database/db/movies.db`, `database/db/ratings.db`
- Frontend entry: `frontend/index.html`
- API server: `middleware/server.ts`
- Shared types: `shared/types/`

<img width="1477" height="626" alt="image" src="https://github.com/user-attachments/assets/e3d4a020-828c-4fce-a1e0-ff63c4baea44" />

