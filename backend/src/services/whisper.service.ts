import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language?: string;
  confidence?: number;
}

export async function transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
  try {
    console.log(`Starting transcription for: ${audioFilePath}`);
    
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.warn('OpenAI API key not configured. Using mock transcription for demo.');
      return getMockTranscription(audioFilePath);
    }

    // Create a readable stream from the audio file
    const audioStream = fs.createReadStream(audioFilePath);

    // Call Whisper API with timestamp granularity
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    // Process the response
    const segments: TranscriptionSegment[] = (transcription as any).segments?.map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
      confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined
    })) || [];

    return {
      text: transcription.text,
      segments,
      language: (transcription as any).language,
      confidence: segments.length > 0 
        ? segments.reduce((sum, seg) => sum + (seg.confidence || 0), 0) / segments.length 
        : undefined
    };
  } catch (error: any) {
    console.error('Whisper transcription error:', error);
    
    // If API call fails, use mock transcription
    if (error.code === 'insufficient_quota' || error.status === 401) {
      console.warn('OpenAI API error. Using mock transcription for demo.');
      return getMockTranscription(audioFilePath);
    }
    
    throw error;
  }
}

// Mock transcription for demo/testing purposes
function getMockTranscription(audioFilePath: string): TranscriptionResult {
  const fileName = path.basename(audioFilePath);
  const mockText = `This is a mock transcription for ${fileName}. In production, this would be replaced with actual Whisper API transcription. The meeting discussion covered quarterly budget review, project updates, and strategic planning for the next quarter. Key action items were identified and assigned to team members.`;
  
  const words = mockText.split(' ');
  const segments: TranscriptionSegment[] = [];
  let currentTime = 0;
  
  for (let i = 0; i < words.length; i += 10) {
    const segmentWords = words.slice(i, i + 10);
    const text = segmentWords.join(' ');
    const duration = segmentWords.length * 0.5; // ~0.5 seconds per word
    
    segments.push({
      start: currentTime,
      end: currentTime + duration,
      text,
      confidence: 0.92 + Math.random() * 0.06 // 92-98% confidence
    });
    
    currentTime += duration;
  }
  
  return {
    text: mockText,
    segments,
    language: 'en',
    confidence: 0.95
  };
}
