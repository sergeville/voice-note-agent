# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice-to-Note Taking Agent is a production-ready application that transforms audio recordings into intelligent, structured meeting minutes using AI-powered transcription (OpenAI Whisper) and analysis (Ollama). The system includes intelligent fallback mechanisms: mock transcription when OpenAI API key is unavailable, and rule-based analysis when Ollama is unavailable.

## Commands

### Initial Setup
```bash
pnpm run setup              # Install all dependencies and setup database (first time)
pnpm start                  # Start both backend and frontend servers
```

### Development
```bash
# Backend (from backend/)
pnpm dev                    # Start backend with hot reload (port 3001)
pnpm build                  # Build backend for production
npx prisma generate         # Regenerate Prisma client after schema changes
npx prisma db push          # Push schema changes to database
npx prisma studio           # Open Prisma Studio to view/edit database

# Frontend (from frontend/voice-note-frontend/)
pnpm dev                    # Start frontend dev server (port 5173)
pnpm build                  # Build frontend for production
pnpm lint                   # Run ESLint
pnpm preview                # Preview production build

# Root (monorepo commands)
pnpm start                  # Start both servers concurrently
pnpm build                  # Build both backend and frontend
pnpm run db:setup           # Re-run database setup only
```

### Testing
```bash
# No test framework configured yet
# Backend uses manual testing via test_e2e.js
node backend/test_e2e.js    # Run end-to-end integration tests
```

## Architecture

### Processing Pipeline
The system follows a three-stage pipeline:

1. **Upload** → Audio file uploaded via multer to `backend/uploads/`
2. **Transcription** → Whisper API transcribes with timestamp granularity
3. **Analysis** → Ollama LLM extracts speakers, action items, decisions, topics
4. **Generation** → Markdown service creates structured meeting minutes with YAML front-matter

### Service Layer Pattern
All business logic is in `backend/src/services/`:
- `whisper.service.ts` - OpenAI Whisper transcription with mock fallback
- `ollama.service.ts` - Ollama LLM analysis with rule-based fallback
- `markdown.service.ts` - Generates structured Markdown with YAML front-matter

Each service has intelligent fallback mechanisms for production resilience.

### Database Architecture
Prisma ORM with SQLite (dev) / PostgreSQL (prod).

**Core relationships:**
- Meeting (1) → (many) Transcriptions, Speakers, ActionItems, Decisions
- Meeting (1) → (1) MeetingMinute
- Speaker (1) → (many) Transcriptions

**Key models:**
- `Meeting` - Central entity with status tracking and metadata
- `Transcription` - Timestamped segments with speaker association
- `Speaker` - Identified speakers with voice signatures
- `ActionItem` - Extracted tasks with priority and assignee
- `Decision` - Key decisions with consensus type
- `MeetingMinute` - Generated markdown with YAML front-matter

### API Structure
RESTful routes organized by domain in `backend/src/routes/`:
- `meeting.routes.ts` - CRUD for meetings, file upload, statistics
- `transcription.routes.ts` - Transcription processing and retrieval
- `analysis.routes.ts` - AI analysis of transcripts
- `export.routes.ts` - Export to Markdown/PDF/DOCX

Controllers in `backend/src/controllers/` handle request/response logic and delegate to services.

### Frontend Architecture
React 18 with TypeScript and Tailwind CSS. Uses React Router for navigation.

**Key pages** (in `frontend/voice-note-frontend/src/pages/`):
- Upload - Audio file upload with meeting metadata form
- Dashboard - Statistics and recent meetings
- Library - Searchable meeting history
- MeetingDetail - View transcription, action items, decisions, export

API client in `src/lib/` uses axios with base URL from environment.

### Configuration
Backend environment variables (`.env`):
```
DATABASE_URL="file:./dev.db"                    # SQLite path or PostgreSQL URL
PORT=3001                                        # Server port
OPENAI_API_KEY="your-key"                       # Optional, uses mock if missing
OLLAMA_BASE_URL="http://localhost:11434"        # Optional, uses rule-based if unavailable
OLLAMA_MODEL="llama3.1:70b"                     # Model for analysis
MAX_FILE_SIZE=524288000                         # 500MB upload limit
UPLOAD_DIR="./uploads"                          # File storage directory
CORS_ORIGIN="http://localhost:5173"             # Frontend URL
```

Frontend environment variables (`.env`):
```
VITE_API_URL=http://localhost:3001/api          # Backend API URL
```

## Important Patterns

### Database Changes
After modifying `backend/prisma/schema.prisma`:
1. Run `npx prisma generate` to update Prisma Client types
2. Run `npx prisma db push` to sync database schema
3. Check for TypeScript errors in services using the models

### Adding API Endpoints
1. Define route in `backend/src/routes/*.routes.ts`
2. Implement controller in `backend/src/controllers/*.controller.ts`
3. Add business logic to appropriate service in `backend/src/services/`
4. Update frontend API client in `frontend/voice-note-frontend/src/lib/`

### Fallback Mechanisms
Services gracefully degrade when external dependencies unavailable:
- Whisper service checks `OPENAI_API_KEY` validity and provides mock transcription
- Ollama service checks `/api/tags` endpoint health and falls back to regex extraction
- Both log warnings when using fallbacks

### File Upload Flow
1. Multer middleware configured in `backend/src/config/multer.config.ts`
2. Files saved to `backend/uploads/` with UUID filenames
3. File path stored in `Meeting.audioFilePath`
4. Original filename preserved in form data

## Production Deployment

### Database Migration
Switch from SQLite to PostgreSQL:
```bash
# Update backend/.env
DATABASE_URL="postgresql://user:password@host:5432/db"

# Run migration
npx prisma db push
```

### Build Process
```bash
pnpm run build              # Builds both backend and frontend

# Backend outputs to backend/dist/
# Frontend outputs to frontend/voice-note-frontend/dist/
```

### Environment Notes
- Backend runs production build with `NODE_ENV=production node dist/index.js`
- Frontend dist/ directory served by web server (nginx, Apache, etc.)
- Ensure CORS_ORIGIN matches production frontend URL
- OpenAI API key required in production (no mock mode)
- Ollama optional but recommended for production quality analysis
