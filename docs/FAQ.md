# Voice-to-Note Agent - Frequently Asked Questions

## Table of Contents
- [Installation & Setup](#installation--setup)
- [Usage & Features](#usage--features)
- [Transcription](#transcription)
- [Analysis & AI](#analysis--ai)
- [File Formats & Limits](#file-formats--limits)
- [Performance & Processing](#performance--processing)
- [Troubleshooting](#troubleshooting)
- [Privacy & Security](#privacy--security)
- [Cost & Resources](#cost--resources)
- [Customization](#customization)

---

## Installation & Setup

### Q: What are the system requirements?

**A:** Minimum requirements:
- **Operating System:** macOS, Linux, or Windows
- **Node.js:** Version 18.0 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 2GB for application + space for audio files
- **Package Manager:** pnpm (recommended), npm, or yarn

For AI analysis with Ollama:
- **RAM:** 16GB minimum for llama3.1:70b
- **Disk:** Additional 40GB for model storage

### Q: How do I install the application?

**A:** Quick install:
```bash
git clone <repository-url>
cd voice-note-agent
pnpm run setup
```

This single command:
1. Installs backend dependencies
2. Installs frontend dependencies
3. Generates Prisma client
4. Initializes database

### Q: Do I need an OpenAI API key?

**A:** No, but recommended.

- **With API key:** Real transcription using Whisper API (high accuracy)
- **Without API key:** Mock transcription mode (returns placeholder text)

For testing, you can use mock mode. For production, get a key at https://platform.openai.com/api-keys

### Q: Do I need Ollama installed?

**A:** No, it's optional.

- **With Ollama:** AI-powered analysis (extracts action items, decisions, speakers)
- **Without Ollama:** Rule-based extraction (basic keyword matching)

Ollama provides much better results but requires more resources.

### Q: Installation fails with "prisma not found"

**A:** Run the database setup manually:
```bash
cd backend
npx prisma generate
npx prisma db push
```

Or use the setup script:
```bash
pnpm run db:setup
```

### Q: Can I use PostgreSQL instead of SQLite?

**A:** Yes! Update `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/voicenote"
```

Then run:
```bash
cd backend
npx prisma db push
```

---

## Usage & Features

### Q: What audio formats are supported?

**A:** Supported formats:
- **MP3** (.mp3) - Most common
- **WAV** (.wav) - Uncompressed
- **M4A** (.m4a) - Apple/iOS recordings
- **FLAC** (.flac) - Lossless
- **OGG** (.ogg) - Open format
- **WebM** (.webm) - Web recordings

### Q: How do I upload a meeting recording?

**A:** Three methods:

**1. Web Interface (Easiest):**
- Navigate to http://localhost:5173/upload
- Drag and drop audio file
- Fill in meeting details
- Click "Upload & Process"

**2. API (cURL):**
```bash
curl -X POST http://localhost:3001/api/meetings/upload \
  -F "audio=@meeting.mp3" \
  -F "title=Team Meeting" \
  -F "meetingDate=2024-01-15T10:00:00Z" \
  -F "participants=[\"Alice\",\"Bob\"]"
```

**3. Programmatic (JavaScript/Python):**
See [EXAMPLES.md](./EXAMPLES.md) for code samples.

### Q: Can I upload multiple files at once?

**A:** Not through the UI currently. For batch uploads:
- Use the API with a script
- See [EXAMPLES.md - Batch Processing](./EXAMPLES.md#walkthrough-2-batch-processing-multiple-meetings)

### Q: How do I export meeting minutes?

**A:** Three ways:

**1. Web Interface:**
- Go to Library
- Click on meeting
- Click "Export Markdown" button

**2. API:**
```bash
curl "http://localhost:3001/api/export/markdown/{meetingId}" \
  -o meeting-minutes.md
```

**3. Automatic:**
Download links appear after processing completes.

### Q: What export formats are available?

**A:** Currently supported:
- **Markdown** (.md) - Full support, rich formatting
- **Plain Text** (.txt) - Basic text export (via API)

Planned for future:
- PDF (.pdf)
- DOCX (.docx)
- HTML (.html)

### Q: Can I edit the transcription or action items?

**A:** Yes! Currently via API:

**Update transcription segment:**
```bash
curl -X PUT "http://localhost:3001/api/transcriptions/{segmentId}" \
  -H "Content-Type: application/json" \
  -d '{"text": "Corrected transcription text"}'
```

**UI editing planned for future release.**

---

## Transcription

### Q: How accurate is the transcription?

**A:** Accuracy depends on:

**With OpenAI Whisper (recommended):**
- Clear audio: 95-98% accuracy
- Background noise: 85-90% accuracy
- Multiple speakers: 80-90% accuracy
- Accents/dialects: 85-95% accuracy

**Mock mode (no API key):**
- Returns placeholder text only
- Not suitable for real use

**Factors affecting accuracy:**
- Audio quality (clear > noisy)
- Speaker clarity (enunciation)
- Background noise level
- Audio format quality

### Q: How long does transcription take?

**A:** Processing time:

| Audio Length | Transcription Time (Whisper) |
|--------------|------------------------------|
| 10 minutes   | ~30-45 seconds              |
| 30 minutes   | ~1-2 minutes                |
| 1 hour       | ~2-4 minutes                |
| 2 hours      | ~5-8 minutes                |

**Factors:**
- Network speed (API calls)
- File size
- OpenAI API load

### Q: Does it identify speakers automatically?

**A:** Partial speaker diarization:

**Current:**
- Whisper detects speaker changes
- Labels as "Speaker 1", "Speaker 2", etc.
- You can manually map to real names

**Future enhancement:**
- Voice fingerprinting
- Automatic name mapping from participants list

### Q: Can it transcribe non-English languages?

**A:** Yes! Whisper supports 90+ languages:

**Supported languages include:**
- Spanish, French, German, Italian
- Portuguese, Dutch, Polish, Russian
- Chinese (Mandarin), Japanese, Korean
- Arabic, Hindi, Turkish
- And many more

**Automatic language detection** - Whisper auto-detects language.

### Q: What if transcription fails?

**A:** Common causes and fixes:

**1. OpenAI API Error:**
- Check API key is valid
- Verify billing is set up
- Check API quota
- System falls back to mock mode

**2. Audio format issue:**
- Convert to MP3 or M4A
- Check file isn't corrupted
- Verify file size < 500MB

**3. Network timeout:**
- Check internet connection
- Try smaller audio file
- Increase timeout in code

---

## Analysis & AI

### Q: What does AI analysis extract?

**A:** The analysis identifies:

1. **Speakers**
   - Number of speakers
   - Speaking time per person
   - Speaker labels

2. **Action Items**
   - Tasks identified
   - Assignees (if mentioned)
   - Due dates (if mentioned)
   - Priority levels

3. **Decisions Made**
   - Key decisions
   - Consensus type
   - Decision timestamp

4. **Topics Discussed**
   - Main discussion points
   - Themes
   - Categories

5. **Executive Summary**
   - High-level overview
   - Key takeaways
   - Meeting outcome

### Q: How do I change the AI model?

**A:** Configure in `backend/.env`:

```env
OLLAMA_MODEL="llama3.1:70b"
```

**Recommended models:**
- `llama3.1:70b` - Best quality, requires 48GB RAM
- `llama3.1:8b` - Good balance, 8GB RAM
- `llama2:13b` - Moderate quality, 16GB RAM
- `mistral:7b` - Fast, 8GB RAM

After changing, restart backend:
```bash
pnpm start
```

### Q: Can I use OpenAI GPT instead of Ollama?

**A:** Currently, only Ollama is supported for analysis.

**To add OpenAI support:**
1. Modify `ollama.service.ts`
2. Add OpenAI SDK
3. Switch between providers

This is a planned feature for future releases.

### Q: Does analysis work offline?

**A:** Partially:

- **Transcription:** Requires OpenAI API (online) unless using mock mode
- **Analysis:** Works offline with Ollama (local LLM)
- **Database:** Works offline (local SQLite)
- **Export:** Works offline

**Fully offline setup:**
```env
OPENAI_API_KEY="mock"  # Use mock transcription
OLLAMA_BASE_URL="http://localhost:11434"  # Local Ollama
```

### Q: How can I improve AI analysis quality?

**A:** Best practices:

1. **Better audio quality:**
   - Use good microphone
   - Minimize background noise
   - Clear speaker enunciation

2. **Better model:**
   - Use larger Ollama model (llama3.1:70b vs llama2:7b)
   - More RAM = better results

3. **Better prompts:**
   - Customize analysis prompts in `ollama.service.ts`
   - Add domain-specific keywords

4. **Structured meetings:**
   - Follow agenda
   - Clear action item language ("Alice will...", "Due Friday...")
   - Explicit decision statements ("We decided to...")

---

## File Formats & Limits

### Q: What's the maximum file size?

**A:** Current limits:

- **Default:** 500MB per file
- **Configurable:** Set in `backend/.env`

```env
MAX_FILE_SIZE=524288000  # 500MB in bytes
```

**To increase:**
```env
MAX_FILE_SIZE=1048576000  # 1GB
```

**Also update reverse proxy** (nginx, Apache) if using:
```nginx
client_max_body_size 1G;
```

### Q: What's the recommended audio quality?

**A:** Recommendations:

**For best results:**
- **Format:** MP3 or M4A
- **Bitrate:** 128 kbps minimum, 256 kbps ideal
- **Sample Rate:** 44.1 kHz or 48 kHz
- **Channels:** Mono or stereo (stereo preferred for multiple speakers)

**File size estimates:**
- 1 hour at 128 kbps: ~60MB
- 1 hour at 256 kbps: ~120MB

### Q: Can I compress audio files before upload?

**A:** Yes, compression recommended:

**Using ffmpeg:**
```bash
# Convert to MP3, 128 kbps
ffmpeg -i input.wav -b:a 128k output.mp3

# Convert to M4A, optimize for speech
ffmpeg -i input.wav -c:a aac -b:a 96k -ac 1 output.m4a
```

**Benefits:**
- Faster upload
- Less storage
- Still good transcription accuracy

### Q: Does it support video files?

**A:** No direct video support, but you can extract audio:

```bash
# Extract audio from MP4
ffmpeg -i meeting-video.mp4 -vn -acodec libmp3lame -b:a 128k meeting-audio.mp3

# From MOV
ffmpeg -i recording.mov -vn -acodec libmp3lame meeting.mp3
```

Then upload the audio file.

---

## Performance & Processing

### Q: How many meetings can I process simultaneously?

**A:** Depends on system resources:

**Typical setup (8GB RAM, 4 cores):**
- **Transcription:** 1-2 concurrent (API-limited)
- **Analysis:** 1-2 concurrent (RAM-limited with Ollama)

**High-end setup (32GB RAM, 8+ cores):**
- **Transcription:** 5-10 concurrent
- **Analysis:** 3-5 concurrent

**Recommendation:** Process sequentially for best results.

### Q: Can I speed up processing?

**A:** Optimization tips:

1. **Use smaller audio files:**
   - Compress to 128 kbps MP3
   - Trim silence at start/end

2. **Better hardware:**
   - More RAM for Ollama
   - SSD for faster file I/O
   - Faster internet for API calls

3. **Smaller AI model:**
   - `llama2:7b` faster than `llama3.1:70b`
   - Trade quality for speed

4. **Disable unnecessary analysis:**
   - Modify `ollama.service.ts` to skip features

### Q: Where are files stored?

**A:** Storage locations:

```
voice-note-agent/
├── backend/
│   ├── dev.db              ← SQLite database
│   └── uploads/
│       └── {timestamp}-{filename}  ← Audio files
└── frontend/
    └── voice-note-frontend/
        └── dist/           ← Built frontend
```

**Production:**
- Use external storage (S3, Azure Blob)
- Configure `UPLOAD_DIR` in `.env`

### Q: How much disk space do I need?

**A:** Calculation:

**Per meeting:**
- Audio file: 60-120MB (1 hour at 128-256 kbps)
- Database entry: ~1-5KB
- Transcription: ~10-50KB
- Meeting minutes: ~5-20KB

**For 100 meetings:**
- ~6-12GB storage needed

**Recommendation:** 20GB+ free space for active use.

---

## Troubleshooting

### Q: "Port 3001 already in use" error

**A:** Another process is using the port.

**Fix:**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 pnpm dev
```

**Update frontend API URL** in `frontend/.env`:
```env
VITE_API_URL=http://localhost:3002/api
```

### Q: Frontend shows "Network Error"

**A:** Backend isn't running or wrong URL.

**Check:**
1. Backend running: `curl http://localhost:3001/health`
2. CORS configured: Check `CORS_ORIGIN` in `backend/.env`
3. Correct URL in `frontend/.env`

**Fix:**
```env
# backend/.env
CORS_ORIGIN="http://localhost:5173"

# frontend/.env
VITE_API_URL=http://localhost:3001/api
```

### Q: "Ollama not available" warning

**A:** Ollama isn't running or wrong URL.

**Check Ollama:**
```bash
# Test connection
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Check model installed
ollama list
```

**Pull model if needed:**
```bash
ollama pull llama3.1:70b
```

**System falls back to rule-based analysis** if Ollama unavailable.

### Q: Transcription returns mock data

**A:** OpenAI API key invalid or missing.

**Fix:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to `backend/.env`:
```env
OPENAI_API_KEY="sk-proj-your-actual-key-here"
```
3. Restart backend

**Test:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Q: Database migration errors

**A:** Prisma schema out of sync.

**Fix:**
```bash
cd backend
npx prisma generate
npx prisma db push
```

**Reset database (WARNING: deletes data):**
```bash
rm dev.db
npx prisma db push
```

### Q: Upload fails with "Only audio files allowed"

**A:** File validation issue.

**Check:**
1. File has correct extension (.mp3, .wav, etc.)
2. File isn't corrupted
3. MIME type detection issue

**Workaround (API):**
```bash
curl -X POST http://localhost:3001/api/meetings/upload \
  -F "audio=@file.mp3;type=audio/mpeg" \
  -F "title=Meeting"
```

---

## Privacy & Security

### Q: Where is my data stored?

**A:** All data stored locally:

- **Database:** `backend/dev.db` (SQLite)
- **Audio files:** `backend/uploads/`
- **Frontend:** Browser only

**External API calls:**
- OpenAI Whisper (if using API key)
- No other external services

### Q: Is my data encrypted?

**A:** Current state:

- **At rest:** No encryption (SQLite plain text)
- **In transit:** HTTPS if configured
- **API keys:** Stored in `.env` (plaintext)

**For production:**
- Use PostgreSQL with encryption
- Store `.env` in secure vault
- Enable HTTPS with SSL certificate
- Consider encrypting uploads

### Q: Can I use this for confidential meetings?

**A:** Yes, with precautions:

**For maximum privacy:**
1. **Don't use OpenAI API** (use mock mode or local Whisper)
2. **Use Ollama** for local analysis
3. **Air-gapped network** (no internet)
4. **Encrypt database** (PostgreSQL with encryption)

**Full offline setup:**
```env
OPENAI_API_KEY="mock"
OLLAMA_BASE_URL="http://localhost:11434"
DATABASE_URL="file:./dev.db"
```

### Q: Does it comply with GDPR/privacy laws?

**A:** Potentially, with proper configuration:

**GDPR considerations:**
- Data stored locally ✓
- User can delete data ✓
- Minimal external sharing (only OpenAI if enabled)
- Need to add: consent management, data export, audit logs

**Recommendation:**
- Consult legal expert for compliance
- Disable OpenAI for sensitive data
- Implement data retention policies

### Q: Can I delete meeting data?

**A:** Yes, via API:

```bash
# Delete specific meeting (includes audio, transcription, analysis)
curl -X DELETE "http://localhost:3001/api/meetings/{meetingId}"
```

**This permanently deletes:**
- Meeting record
- Audio file
- Transcription segments
- Action items
- Decisions
- Meeting minutes

**No UI delete button yet** - planned for future release.

---

## Cost & Resources

### Q: How much does it cost to run?

**A:** Cost breakdown:

**Free/Self-hosted:**
- ✓ Application code (open source)
- ✓ Database (SQLite)
- ✓ Hosting (local or VPS you own)

**Paid services:**
- **OpenAI Whisper API:**
  - $0.006 per minute of audio
  - 1-hour meeting = ~$0.36
  - 100 meetings/month = ~$36/month

- **Ollama (local):** Free, but costs:
  - Electricity for running GPU/CPU
  - Hardware (GPU recommended)

**Total estimated cost:**
- Small team (10 meetings/week): ~$15-25/month
- Medium team (50 meetings/week): ~$75-100/month

### Q: Can I reduce OpenAI costs?

**A:** Cost-saving tips:

1. **Shorter recordings:**
   - Trim silence
   - Edit out breaks
   - Use meeting highlights only

2. **Lower quality audio:**
   - 64 kbps still transcribes well
   - Mono instead of stereo

3. **Batch processing:**
   - Process during off-peak
   - Use API quotas efficiently

4. **Local Whisper:**
   - Run Whisper locally (GPU required)
   - Free but slower

### Q: What GPU do I need for Ollama?

**A:** GPU recommendations:

**For llama3.1:70b (best quality):**
- NVIDIA RTX 4090 (24GB VRAM) - Ideal
- NVIDIA A100 (40GB VRAM) - Professional
- Apple M2 Ultra (64GB RAM) - Mac alternative

**For llama2:13b (good balance):**
- NVIDIA RTX 3080 (10GB VRAM)
- NVIDIA RTX 4070 (12GB VRAM)
- Apple M1/M2 Pro (16GB RAM)

**For llama2:7b (basic):**
- NVIDIA GTX 1660 (6GB VRAM)
- Apple M1 (8GB RAM)

**CPU-only:**
- Works but very slow (10-100x slower)
- Not recommended for production

---

## Customization

### Q: Can I customize the meeting minutes format?

**A:** Yes, edit `backend/src/services/markdown.service.ts`:

```typescript
// Custom template
const customFormat = `
# ${meeting.title}

**YOUR CUSTOM HEADER**

${executiveSummary}
${customSection}
${actionItems}
`;
```

See [EXAMPLES.md - Custom Templates](./EXAMPLES.md#use-case-4-custom-templates)

### Q: Can I add custom action item fields?

**A:** Yes, modify Prisma schema:

```prisma
// backend/prisma/schema.prisma
model ActionItem {
  id          String   @id @default(cuid())
  // ... existing fields ...

  // Add custom fields
  category    String?
  costEstimate Float?
  department  String?
}
```

Then run:
```bash
npx prisma db push
```

### Q: Can I change the analysis prompt?

**A:** Yes, edit `backend/src/services/ollama.service.ts`:

Find the `analyzeWithOllama` function and modify the prompt:

```typescript
const prompt = `
YOUR CUSTOM PROMPT HERE

Analyze this meeting transcript:
${transcript}

Extract:
- Your custom requirements
- Different format
- Additional fields
`;
```

### Q: Can I integrate with other tools?

**A:** Yes! The REST API allows integration:

**Zapier/Make.com:**
- Trigger: New meeting uploaded
- Action: Send to Slack/Notion/etc.

**Slack Bot:**
- Upload from Slack
- Receive minutes in channel

**Notion:**
- Auto-create meeting page
- Sync action items

See [EXAMPLES.md - API Integration](./EXAMPLES.md#api-integration-examples)

---

## Still Have Questions?

**Documentation:**
- [QUICKSTART.md](./QUICKSTART.md) - Getting started guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
- [EXAMPLES.md](./EXAMPLES.md) - Usage examples

**Support:**
- GitHub Issues: Report bugs or request features
- Discussions: Community help and questions

**Contributing:**
- See CONTRIBUTING.md for development guidelines
- PRs welcome!

---

*Updated: January 2024*
