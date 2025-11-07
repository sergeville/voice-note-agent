# Quick Start Guide

## One-Step Installation

```bash
# Navigate to project directory
cd voice-note-agent

# Install all dependencies
cd backend && pnpm install && cd ../frontend/voice-note-frontend && pnpm install && cd ../..

# Start both backend and frontend
./start.sh
```

## Manual Setup

### Backend

```bash
cd voice-note-agent/backend
pnpm install
npx prisma generate
npx prisma db push
pnpm dev
```

### Frontend (in a new terminal)

```bash
cd voice-note-agent/frontend/voice-note-frontend
pnpm install
pnpm dev
```

## Configuration

1. Edit `backend/.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY="sk-your-key-here"
   ```

2. (Optional) Install and configure Ollama for enhanced AI analysis:
   ```bash
   # Install Ollama
   curl https://ollama.ai/install.sh | sh
   
   # Pull model
   ollama pull llama3.1:70b
   ```

## First Use

1. Open http://localhost:5173 in your browser
2. Click "Upload" in the navigation
3. Select an audio file (MP3, WAV, etc.)
4. Fill in meeting details
5. Click "Upload and Process"
6. Wait for transcription and analysis
7. View your meeting minutes!

## API Testing

Test the backend API:

```bash
# Health check
curl http://localhost:3001/api/health

# Get stats
curl http://localhost:3001/api/meetings/stats/overview
```

## Features

- Automatic transcription with OpenAI Whisper
- AI-powered speaker identification
- Action item extraction (checkbox format)
- Decision identification (blockquote format)
- Professional Markdown export
- Meeting library and search
- Real-time processing status

## Support

If you encounter issues:

1. Check that ports 3001 (backend) and 5173 (frontend) are available
2. Ensure you have Node.js 18+ installed
3. Verify your OpenAI API key is valid
4. Check the console logs for errors

For more details, see the main README.md file.
