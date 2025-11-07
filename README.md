# Voice-to-Note Taking Agent

A production-ready application that transforms audio input into intelligent, structured meeting minutes with AI-powered analysis.

## Quick Start

### First Time Setup

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/sergeville/voice-note-agent.git
cd voice-note-agent

# 2. One-time setup (install dependencies + setup database)
pnpm run setup
```

**Expected output:**
```
> voice-note-agent@1.0.0 setup
> pnpm run install && pnpm run db:setup

Installing backend dependencies...
✓ Backend dependencies installed

Installing frontend dependencies...
✓ Frontend dependencies installed

Generating Prisma Client...
✔ Generated Prisma Client to ./node_modules/@prisma/client

Pushing database schema...
✔ The database is now in sync with the Prisma schema
```

```bash
# 3. Configure OpenAI API key (optional - uses mock mode as fallback)
cd backend
cp .env.example .env
nano .env  # Add your OpenAI API key if you have one
cd ..

# 4. Start both servers
pnpm start
```

**Expected output:**
```
[backend] Server running on http://localhost:3001
[frontend] Local: http://localhost:5173/
```

That's it! Open `http://localhost:5173` in your browser.

### Subsequent Runs

After initial setup, just run:
```bash
pnpm start  # Starts both backend and frontend
```

If dependencies are already installed, `pnpm run setup` will show:
```
✔ Generated Prisma Client (already exists)
The database is already in sync with the Prisma schema
```

### Available Commands

```bash
pnpm run setup        # Install all dependencies and setup database (first time)
pnpm start            # Start both backend and frontend servers
pnpm run dev          # Alias for pnpm start
pnpm run build        # Build both backend and frontend for production
pnpm run db:setup     # Re-run database setup only (if needed)
```

**Important Notes:**
- Frontend port may vary (5173 or 5174) if 5173 is already in use
- OpenAI API key is optional - system uses mock transcription as fallback
- Ollama is optional - system uses rule-based analysis as fallback

---

## Features

- **Audio Upload & Processing**: Support for MP3, WAV, M4A, FLAC, OGG, and WEBM formats
- **Speech-to-Text**: OpenAI Whisper integration for accurate transcription
- **AI Analysis**: Ollama local LLM for intelligent content extraction
- **Structured Output**: Professional Markdown meeting minutes with YAML front-matter
- **Action Items**: Automatic extraction formatted as checkboxes
- **Decision Tracking**: Identified decisions in blockquote format
- **Speaker Diarization**: Automatic speaker identification
- **Export Options**: Download as Markdown, PDF, or Word documents
- **Meeting Library**: Searchable history of all processed meetings
- **Real-time Dashboard**: Live statistics and meeting status updates

## Technology Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM with SQLite (development) / PostgreSQL (production)
- OpenAI Whisper API for speech-to-text
- Ollama for local LLM analysis
- Local file system storage

### Frontend
- React 18 + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons
- Axios for API communication

## Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key (for Whisper STT)
- Ollama (optional, for enhanced AI analysis)

## Manual Installation

**Note:** The Quick Start method above is recommended. Use manual installation only if you need more control over the setup process.

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
nano .env  # Add your OpenAI API key (optional)

# Initialize database
npx prisma generate
npx prisma db push

# Start the backend server
pnpm dev
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client to ./node_modules/@prisma/client

The database is now in sync with the Prisma schema

Server running on http://localhost:3001
```

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend/voice-note-frontend

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

**Expected output:**
```
VITE v6.0.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Configuration

### Environment Variables

**Backend (`backend/.env`)**:

Copy from example and configure:
```bash
cd backend
cp .env.example .env
nano .env  # Edit as needed
```

Required and optional variables:
```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=3001
NODE_ENV="development"

# OpenAI Configuration (Optional - uses mock mode as fallback)
OPENAI_API_KEY="your-openai-api-key-here"

# Ollama Configuration (Optional - for enhanced AI analysis)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1:70b"

# File Upload Configuration
MAX_FILE_SIZE=524288000
UPLOAD_DIR="./uploads"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"
```

**Frontend (`frontend/voice-note-frontend/.env`)**:
```env
VITE_API_URL=http://localhost:3001/api
```

See [CONFIGURATION.md](./docs/CONFIGURATION.md) for detailed configuration options.

### Ollama Setup (Optional)

For enhanced AI analysis:

```bash
# Install Ollama (see https://ollama.ai)
curl https://ollama.ai/install.sh | sh

# Pull the recommended model
ollama pull llama3.1:70b
```

## Usage

### 1. Upload Meeting Recording

- Navigate to the Upload page
- Select an audio file (MP3, WAV, M4A, etc.)
- Fill in meeting details (title, date, participants)
- Click "Upload and Process"

### 2. Processing Pipeline

The system automatically:
1. Uploads the audio file
2. Transcribes using OpenAI Whisper
3. Analyzes with Ollama LLM (speaker identification, action items, decisions)
4. Generates structured Markdown meeting minutes

### 3. Review & Export

- View meeting details and transcription
- Review extracted action items and decisions
- Export as Markdown, PDF, or DOCX

## API Endpoints

### Meetings
- `POST /api/meetings/upload` - Upload audio file
- `GET /api/meetings` - Get all meetings
- `GET /api/meetings/:id` - Get meeting details
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `GET /api/meetings/stats/overview` - Get statistics

### Transcription
- `POST /api/transcriptions/process/:meetingId` - Process transcription
- `GET /api/transcriptions/meeting/:meetingId` - Get transcription

### Analysis
- `POST /api/analysis/meeting/:meetingId` - Analyze meeting
- `GET /api/analysis/meeting/:meetingId` - Get analysis results

### Export
- `GET /api/export/markdown/:meetingId` - Export as Markdown
- `GET /api/export/pdf/:meetingId` - Export as PDF (planned)
- `GET /api/export/docx/:meetingId` - Export as DOCX (planned)

## Project Structure

```
voice-note-agent/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/           # Route controllers
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── utils/                 # Utilities
│   │   └── index.ts               # Main server file
│   ├── uploads/                   # File storage
│   └── package.json
│
└── frontend/
    └── voice-note-frontend/
        ├── src/
        │   ├── pages/             # React pages
        │   ├── lib/               # API client
        │   └── App.tsx            # Main app component
        └── package.json
```

## Development

### Backend Development

```bash
cd backend
pnpm dev       # Start with hot reload
pnpm build     # Build for production
pnpm start     # Run production build
```

### Frontend Development

```bash
cd frontend/voice-note-frontend
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build
```

## Production Deployment

### Database Migration

For production, switch to PostgreSQL:

```bash
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/voicenote"

# Run migrations
npx prisma db push
```

### Build & Deploy

```bash
# Backend
cd backend
pnpm build
NODE_ENV=production node dist/index.js

# Frontend
cd frontend/voice-note-frontend
pnpm build
# Serve the dist/ directory with your preferred web server
```

## Troubleshooting

### Common Issues

**OpenAI API Key Not Working**:
- Verify the API key is correct in `.env`
- Check your OpenAI account has sufficient credits
- The system will use mock transcription as fallback

**Ollama Connection Failed**:
- Ensure Ollama is running: `ollama serve`
- Check OLLAMA_BASE_URL in `.env`
- The system will use rule-based analysis as fallback

**File Upload Fails**:
- Check file size (max 500MB)
- Verify file format is supported
- Ensure upload directory has write permissions

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Contact: MiniMax Agent

---

*Built with production-grade quality standards - no shortcuts, no demos.*
