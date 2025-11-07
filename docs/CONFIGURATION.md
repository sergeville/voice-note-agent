# Voice-to-Note Agent - Configuration Guide

## Environment Variables Reference

### Backend Configuration

All backend configuration is managed through environment variables in `backend/.env`.

#### Required Variables

**DATABASE_URL**
- **Description**: Database connection string
- **Development**: `"file:./dev.db"` (SQLite)
- **Production**: `"postgresql://user:password@host:5432/dbname"`
- **Example**: 
  ```env
  DATABASE_URL="file:./dev.db"
  ```

**PORT**
- **Description**: Backend server port
- **Default**: `3001`
- **Example**:
  ```env
  PORT=3001
  ```

**OPENAI_API_KEY**
- **Description**: OpenAI API key for Whisper transcription
- **Required**: Yes (or system uses mock transcription)
- **Get Key**: https://platform.openai.com/api-keys
- **Example**:
  ```env
  OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"
  ```

#### Optional Variables

**OLLAMA_BASE_URL**
- **Description**: Ollama API base URL for local LLM
- **Default**: `"http://localhost:11434"`
- **Example**:
  ```env
  OLLAMA_BASE_URL="http://localhost:11434"
  ```

**OLLAMA_MODEL**
- **Description**: Ollama model to use for analysis
- **Default**: `"llama3.1:70b"`
- **Options**: `llama2`, `llama3.1:70b`, `mistral`, `codellama`, etc.
- **Example**:
  ```env
  OLLAMA_MODEL="llama3.1:70b"
  ```

**NODE_ENV**
- **Description**: Application environment
- **Options**: `development`, `production`, `test`
- **Default**: `development`
- **Example**:
  ```env
  NODE_ENV="development"
  ```

**MAX_FILE_SIZE**
- **Description**: Maximum audio file size in bytes
- **Default**: `524288000` (500MB)
- **Example**:
  ```env
  MAX_FILE_SIZE=524288000
  ```

**UPLOAD_DIR**
- **Description**: Directory for file uploads
- **Default**: `"./uploads"`
- **Example**:
  ```env
  UPLOAD_DIR="./uploads"
  ```

**CORS_ORIGIN**
- **Description**: Allowed CORS origin for frontend
- **Default**: `"http://localhost:5173"`
- **Production**: Your frontend domain
- **Example**:
  ```env
  CORS_ORIGIN="https://app.yourdomain.com"
  ```

---

### Frontend Configuration

Frontend configuration in `frontend/voice-note-frontend/.env`.

**VITE_API_URL**
- **Description**: Backend API base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.yourdomain.com/api`
- **Example**:
  ```env
  VITE_API_URL=http://localhost:3001/api
  ```

---

## Complete Configuration Examples

### Development Setup

**backend/.env**
```env
DATABASE_URL="file:./dev.db"
PORT=3001
OPENAI_API_KEY="sk-proj-your-key-here"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1:70b"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

**frontend/voice-note-frontend/.env**
```env
VITE_API_URL=http://localhost:3001/api
```

### Production Setup

**backend/.env**
```env
DATABASE_URL="postgresql://username:password@db.example.com:5432/voicenote"
PORT=3001
OPENAI_API_KEY="sk-proj-production-key"
OLLAMA_BASE_URL="http://ollama-service:11434"
OLLAMA_MODEL="llama3.1:70b"
NODE_ENV="production"
CORS_ORIGIN="https://app.yourdomain.com"
MAX_FILE_SIZE=524288000
```

**frontend/voice-note-frontend/.env**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Configuration by Feature

### Transcription Service

**With OpenAI Whisper (Recommended):**
```env
OPENAI_API_KEY="sk-proj-xxxxx"
```

**Mock Mode (No API key):**
```env
OPENAI_API_KEY="your-openai-api-key-here"  # Default value = mock mode
```

### AI Analysis

**With Ollama (Enhanced Analysis):**
```env
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1:70b"
```

Install Ollama:
```bash
curl https://ollama.ai/install.sh | sh
ollama pull llama3.1:70b
```

**Rule-based Mode (No Ollama):**
- System automatically falls back if Ollama unavailable

### Database

**SQLite (Development):**
```env
DATABASE_URL="file:./dev.db"
```

**PostgreSQL (Production):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

Migration from SQLite to PostgreSQL:
```bash
# Export data (manual process)
# Update DATABASE_URL
npx prisma db push
# Import data
```

---

## Security Best Practices

### Environment Files

1. **Never commit `.env` files to version control**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different keys for dev/prod**
   - Development: Test API keys with limits
   - Production: Production keys with monitoring

3. **Rotate API keys regularly**
   - Update OPENAI_API_KEY every 90 days
   - Monitor usage for anomalies

### File Storage

**Development:**
```env
UPLOAD_DIR="./uploads"
```

**Production (Recommended):**
- Use cloud storage (S3, Azure Blob, GCS)
- Configure appropriate bucket permissions
- Set up lifecycle policies

### CORS Configuration

**Development:**
```env
CORS_ORIGIN="http://localhost:5173"
```

**Production:**
```env
CORS_ORIGIN="https://app.yourdomain.com"
# Or multiple origins:
CORS_ORIGIN="https://app.yourdomain.com,https://www.yourdomain.com"
```

---

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`
- Check DATABASE_URL format
- Verify database is running
- Check network connectivity

**Solution**:
```bash
# Test PostgreSQL connection
psql $DATABASE_URL

# Regenerate Prisma client
npx prisma generate
npx prisma db push
```

### OpenAI API Issues

**Error**: `401 Incorrect API key`
- Verify OPENAI_API_KEY is correct
- Check API key is active
- Verify billing is set up

**Fallback**:
- System automatically uses mock transcription
- Check logs for fallback messages

### Ollama Connection Issues

**Error**: `Ollama not available`
- Verify Ollama is running: `ollama serve`
- Check OLLAMA_BASE_URL is correct
- Ensure model is downloaded: `ollama pull llama3.1:70b`

**Fallback**:
- System uses rule-based analysis
- Check logs for fallback activation

### Port Conflicts

**Error**: `Port 3001 is already in use`

**Solution**:
```bash
# Find process using port
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)

# Or change port
PORT=3002 pnpm dev
```

---

## Performance Tuning

### Database Optimization

**Connection Pooling (PostgreSQL):**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=30"
```

### File Upload Limits

**Increase for large files:**
```env
MAX_FILE_SIZE=1048576000  # 1GB
```

**Note**: Update nginx/reverse proxy limits too:
```nginx
client_max_body_size 1G;
```

### Ollama Performance

**GPU Acceleration:**
```bash
# Check GPU availability
ollama list

# Use GPU-optimized model
OLLAMA_MODEL="llama3.1:70b-q8_0"
```

---

## Monitoring & Logging

### Enable Debug Logging

```env
NODE_ENV="development"
DEBUG="voice-note:*"
LOG_LEVEL="debug"
```

### Production Logging

```env
NODE_ENV="production"
LOG_LEVEL="info"
LOG_FORMAT="json"
LOG_FILE="/var/log/voice-note-agent/app.log"
```

---

## Environment-Specific Configs

### Local Development
```bash
cp .env.example .env
# Edit .env with local values
pnpm dev
```

### Staging
```bash
cp .env.staging .env
# Uses staging database & services
pnpm start
```

### Production
```bash
# Use environment variables from hosting platform
# Or use secret management (AWS Secrets Manager, etc.)
pnpm build
pnpm start
```

---

*Keep your `.env` files secure and never commit them to version control!*
