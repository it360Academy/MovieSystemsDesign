# Setup Instructions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Environment Variable (Optional)

```powershell
# PowerShell
$env:OPENAI_API_KEY="your_api_key_here"

# Or CMD
set OPENAI_API_KEY=your_api_key_here
```

## Step 3: Build Frontend

```bash
npm run build:frontend
```

This compiles TypeScript to JavaScript in `frontend/src/app.js`

## Step 4: Run Development Servers

### Option A: Run Both Together
```bash
npm run dev
```

### Option B: Run Separately
```bash
# Terminal 1: Middleware (API server)
npm run dev:middleware

# Terminal 2: Frontend (TypeScript watch)
npm run dev:frontend
```

## Step 5: Open Frontend

Open `frontend/index.html` in your browser, or use a simple HTTP server:

```bash
# Using Python
cd frontend
python -m http.server 8080

# Then open http://localhost:8080
```

## Production Build

```bash
npm run build
npm start
```

## File Structure After Restructure

```
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── app.ts
│   │   ├── app.js (compiled)
│   │   └── style.css
│   └── tsconfig.json
├── middleware/
│   ├── server.ts
│   ├── routes/
│   │   └── api.ts
│   ├── services/
│   │   ├── movieService.ts
│   │   └── llmEnricher.ts
│   ├── dist/ (compiled)
│   └── tsconfig.json
├── database/
│   ├── movieRepository.ts
│   └── db/
│       ├── movies.db
│       └── ratings.db
├── shared/
│   └── types/
│       ├── movie.ts
│       └── api.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Migration Notes

- Python files (`*.py`) are kept for reference but not used
- Database moved from `db/` to `database/db/`
- All TypeScript code uses shared types from `shared/types/`
- Frontend is pure TypeScript (no framework) for minimal overhead

