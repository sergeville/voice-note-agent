import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes and config
import meetingRoutes from './routes/meeting.routes';
import transcriptionRoutes from './routes/transcription.routes';
import analysisRoutes from './routes/analysis.routes';
import exportRoutes from './routes/export.routes';
import { upload } from './config/multer.config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/meetings', meetingRoutes);
app.use('/api/transcriptions', transcriptionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Voice-to-Note Agent API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// System configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    transcription: {
      service: 'OpenAI Whisper',
      hasApiKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here',
      fallbackMode: !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here' ? 'Mock Transcription' : null
    },
    analysis: {
      service: 'Ollama',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.1:70b',
      fallbackMode: 'Rule-based Analysis'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
