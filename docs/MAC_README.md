# Voice-to-Note Taking Agent for Mac

**Professional meeting transcription and analysis - running entirely on your Mac**

## 🚀 Quick Start (Recommended)

1. **Prerequisites**: Install Homebrew, Node.js 18+, pnpm
2. **Run the setup script**: `chmod +x setup-mac.sh && ./setup-mac.sh`
3. **Add your OpenAI API key** in `backend/.env`
4. **Start the application**: `./start.sh`
5. **Open http://localhost:5173** in your browser

## 📋 What You Need

### Required:
- **OpenAI API Key** - Get one free at [OpenAI Platform](https://platform.openai.com/)
- **Mac** running macOS 10.15+ (Catalina or newer)
- **Internet connection** for OpenAI API calls

### Optional (for enhanced AI):
- **Ollama** - For local LLM analysis without cloud dependencies

## 🎯 Features

✅ **Audio Processing**: MP3, WAV, M4A, FLAC, OGG, WEBM support  
✅ **Speech-to-Text**: OpenAI Whisper integration  
✅ **AI Analysis**: Speaker identification, action items, decisions  
✅ **Smart Export**: Markdown, PDF, Word formats  
✅ **Meeting Library**: Searchable history  
✅ **Live Recording**: Real-time meeting capture  
✅ **100% Local**: Your data stays on your Mac  

## 🛠️ System Requirements

- **macOS**: 10.15+ (Catalina, Big Sur, Monterey, Ventura, Sonoma)
- **Node.js**: 18+ 
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Required for OpenAI API calls

## 📖 Full Setup Guide

For detailed step-by-step instructions, see **[MAC_SETUP_GUIDE.md](../MAC_SETUP_GUIDE.md)**

## 🆘 Quick Troubleshooting

**Port already in use**:
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Dependencies issues**:
```bash
rm -rf node_modules backend/node_modules frontend/node_modules
./setup-mac.sh
```

**Database issues**:
```bash
cd backend
rm -f dev.db
npx prisma db push
```

## 🔑 API Key Setup

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Go to API Keys section
3. Create a new secret key
4. Add it to `backend/.env`: `OPENAI_API_KEY="sk-..."`

## 🚀 Advanced Usage

### Local AI with Ollama
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Download model
ollama pull llama3.1:70b

# The system will automatically use Ollama for enhanced analysis
```

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# List meetings
curl http://localhost:3001/api/meetings
```

### Database Management
```bash
# Open database browser
cd backend
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

## 📁 Project Structure

```
voice-note-agent/
├── setup-mac.sh              # Quick setup script
├── start.sh                  # Start both servers
├── MAC_SETUP_GUIDE.md        # Detailed setup guide
├── MAC_README.md             # This file
├── backend/                  # Node.js/Express server
│   ├── src/                 # TypeScript source code
│   ├── uploads/             # Audio file storage
│   ├── prisma/              # Database schema
│   └── .env                 # Configuration (you create this)
└── frontend/voice-note-frontend/  # React web app
    ├── src/                 # React components
    └── .env                 # Configuration (you create this)
```

## 🎉 You're Ready!

Once setup is complete:

1. **Visit http://localhost:5173** in your browser
2. **Upload an audio file** to test transcription
3. **Try the live recording** feature
4. **Export your meeting notes** in your preferred format

## 💡 Tips

- **Use high-quality audio** for better transcription accuracy
- **Include participant names** for improved speaker identification
- **Review and edit** generated minutes before exporting
- **Regular backups** of your `dev.db` file to preserve meeting history

## 🆘 Need Help?

- **Setup Issues**: Check MAC_SETUP_GUIDE.md
- **API Problems**: Verify your OpenAI API key and credits
- **Performance Issues**: Ensure sufficient disk space and RAM
- **All other issues**: See troubleshooting section in the detailed guide

---

**Built for Mac users who value privacy and want professional meeting transcription without cloud dependencies.**