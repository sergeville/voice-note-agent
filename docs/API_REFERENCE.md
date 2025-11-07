# Voice-to-Note Agent - API Reference

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

Currently, the API does not require authentication. For production deployment, implement JWT-based authentication.

---

## Table of Contents

- [Health & Configuration](#health--configuration)
- [Meeting Management](#meeting-management)
- [Transcription](#transcription)
- [Analysis](#analysis)
- [Export](#export)
- [Error Handling](#error-handling)

---

## Health & Configuration

### GET /health

Health check endpoint to verify API status.

**Response:**
```json
{
  "status": "ok",
  "message": "Voice-to-Note Agent API is running",
  "version": "1.0.0",
  "timestamp": "2025-11-07T00:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

### GET /config

Get system configuration including active LLM model and service status.

**Response:**
```json
{
  "transcription": {
    "service": "OpenAI Whisper",
    "hasApiKey": true,
    "fallbackMode": null
  },
  "analysis": {
    "service": "Ollama",
    "baseUrl": "http://localhost:11434",
    "model": "llama3.1:70b",
    "fallbackMode": "Rule-based Analysis"
  },
  "environment": "development"
}
```

**Status Codes:**
- `200 OK` - Configuration retrieved successfully

---

## Meeting Management

### POST /meetings/upload

Upload audio file and create a new meeting.

**Request:**
- Content-Type: `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| audio | File | Yes | Audio file (MP3, WAV, M4A, FLAC, OGG, WEBM) |
| title | String | Yes | Meeting title |
| meetingDate | ISO8601 | No | Meeting date (defaults to now) |
| participants | String | No | Comma-separated participant names |
| location | String | No | Meeting location |
| meetingType | String | No | Type: general, team, client, board, standup, review |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/meetings/upload \
  -F "audio=@meeting.mp3" \
  -F "title=Quarterly Budget Review" \
  -F "meetingDate=2025-11-07T10:00:00Z" \
  -F "participants=John Doe, Jane Smith, Bob Johnson" \
  -F "location=Conference Room A" \
  -F "meetingType=board"
```

**Response:**
```json
{
  "success": true,
  "meeting": {
    "id": "uuid-here",
    "title": "Quarterly Budget Review",
    "meetingDate": "2025-11-07T10:00:00.000Z",
    "location": "Conference Room A",
    "meetingType": "board",
    "status": "uploaded",
    "audioFilePath": "uploads/audio/1234567890-123456789.mp3",
    "audioFileSize": 1154349,
    "participants": "[\"John Doe\",\"Jane Smith\",\"Bob Johnson\"]",
    "createdAt": "2025-11-07T10:05:00.000Z",
    "updatedAt": "2025-11-07T10:05:00.000Z"
  },
  "message": "Audio file uploaded successfully. Processing will begin shortly."
}
```

**Status Codes:**
- `200 OK` - Upload successful
- `400 Bad Request` - Invalid file type or missing required fields
- `413 Payload Too Large` - File exceeds 500MB limit
- `500 Internal Server Error` - Upload failed

---

### GET /meetings

Get list of all meetings with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 20 | Items per page |
| status | String | - | Filter by status: uploaded, processing, transcribed, analyzing, completed, failed |
| meetingType | String | - | Filter by meeting type |

**Example Request:**
```bash
curl "http://localhost:3001/api/meetings?page=1&limit=10&status=completed"
```

**Response:**
```json
{
  "success": true,
  "meetings": [
    {
      "id": "uuid-1",
      "title": "Quarterly Budget Review",
      "meetingDate": "2025-11-07T10:00:00.000Z",
      "status": "completed",
      "meetingType": "board",
      "location": "Conference Room A",
      "confidenceScore": 0.95,
      "createdAt": "2025-11-07T10:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**Status Codes:**
- `200 OK` - Meetings retrieved successfully
- `500 Internal Server Error` - Server error

---

### GET /meetings/:id

Get detailed meeting information including transcriptions, speakers, action items, and decisions.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Meeting ID |

**Example Request:**
```bash
curl "http://localhost:3001/api/meetings/uuid-here"
```

**Response:**
```json
{
  "success": true,
  "meeting": {
    "id": "uuid-here",
    "title": "Quarterly Budget Review",
    "meetingDate": "2025-11-07T10:00:00.000Z",
    "status": "completed",
    "location": "Conference Room A",
    "meetingType": "board",
    "audioFilePath": "uploads/audio/1234567890-123456789.mp3",
    "audioFileSize": 1154349,
    "confidenceScore": 0.95,
    "processingTimeSeconds": 125,
    "participants": "[\"John Doe\",\"Jane Smith\",\"Bob Johnson\"]",
    "transcriptions": [
      {
        "id": "trans-uuid-1",
        "segmentIndex": 0,
        "startTimeSeconds": 0,
        "endTimeSeconds": 5,
        "text": "Welcome everyone to the quarterly budget review...",
        "confidenceScore": 0.97
      }
    ],
    "speakers": [
      {
        "id": "speaker-uuid-1",
        "speakerLabel": "Speaker 1",
        "speakerName": "John Doe",
        "totalSpeakingTimeSeconds": 600
      }
    ],
    "actionItems": [
      {
        "id": "action-uuid-1",
        "title": "Complete budget analysis",
        "assignee": "John Doe",
        "dueDate": "2025-11-15T00:00:00.000Z",
        "priority": "high",
        "status": "pending"
      }
    ],
    "decisions": [
      {
        "id": "decision-uuid-1",
        "decisionText": "Approved Q4 marketing budget increase of 15%",
        "consensusType": "unanimous",
        "participants": "[\"John Doe\",\"Jane Smith\"]"
      }
    ],
    "meetingMinutes": {
      "id": "minutes-uuid-1",
      "markdownContent": "---\ntitle: \"Quarterly Budget Review\"\n...",
      "executiveSummary": "The quarterly budget review covered...",
      "createdAt": "2025-11-07T10:10:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Meeting found
- `404 Not Found` - Meeting not found
- `500 Internal Server Error` - Server error

---

### PUT /meetings/:id

Update meeting metadata.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Meeting ID |

**Request Body:**
```json
{
  "title": "Updated Meeting Title",
  "participants": "[\"John Doe\",\"Jane Smith\",\"Alice Brown\"]",
  "location": "Virtual",
  "meetingType": "team"
}
```

**Response:**
```json
{
  "success": true,
  "meeting": {
    "id": "uuid-here",
    "title": "Updated Meeting Title",
    "participants": "[\"John Doe\",\"Jane Smith\",\"Alice Brown\"]",
    "location": "Virtual",
    "meetingType": "team",
    "updatedAt": "2025-11-07T10:15:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Meeting updated
- `404 Not Found` - Meeting not found
- `500 Internal Server Error` - Update failed

---

### DELETE /meetings/:id

Delete a meeting and all associated data (transcriptions, speakers, action items, decisions, files).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Meeting ID |

**Example Request:**
```bash
curl -X DELETE "http://localhost:3001/api/meetings/uuid-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting and all associated data deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Meeting deleted
- `404 Not Found` - Meeting not found
- `500 Internal Server Error` - Deletion failed

---

### GET /meetings/stats/overview

Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalMeetings": 25,
    "completedMeetings": 20,
    "processingMeetings": 2,
    "totalActionItems": 47,
    "totalDecisions": 33
  }
}
```

**Status Codes:**
- `200 OK` - Stats retrieved successfully
- `500 Internal Server Error` - Server error

---

## Transcription

### POST /transcriptions/process/:meetingId

Start transcription processing for a meeting.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| meetingId | UUID | Meeting ID |

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/transcriptions/process/uuid-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Transcription processing started",
  "meetingId": "uuid-here"
}
```

**Process:**
1. Updates meeting status to "processing"
2. Calls OpenAI Whisper API (or uses mock transcription)
3. Creates transcription segments in database
4. Updates meeting status to "transcribed"

**Status Codes:**
- `200 OK` - Processing started
- `400 Bad Request` - Meeting already processed or audio file missing
- `404 Not Found` - Meeting not found
- `500 Internal Server Error` - Processing failed

---

### GET /transcriptions/meeting/:meetingId

Get transcription segments for a meeting.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| meetingId | UUID | Meeting ID |

**Example Request:**
```bash
curl "http://localhost:3001/api/transcriptions/meeting/uuid-here"
```

**Response:**
```json
{
  "success": true,
  "transcriptions": [
    {
      "id": "trans-uuid-1",
      "meetingId": "uuid-here",
      "speakerId": "speaker-uuid-1",
      "segmentIndex": 0,
      "startTimeSeconds": 0,
      "endTimeSeconds": 5,
      "text": "Welcome everyone...",
      "confidenceScore": 0.97,
      "speaker": {
        "speakerName": "John Doe"
      }
    }
  ],
  "status": "transcribed",
  "confidenceScore": 0.95
}
```

**Status Codes:**
- `200 OK` - Transcriptions retrieved
- `404 Not Found` - Meeting not found
- `500 Internal Server Error` - Server error

---

## Analysis

### POST /analysis/meeting/:meetingId

Analyze meeting transcription using AI to extract speakers, action items, decisions, and generate summary.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| meetingId | UUID | Meeting ID |

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/analysis/meeting/uuid-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Analysis started",
  "meetingId": "uuid-here"
}
```

**Process:**
1. Fetches all transcription segments
2. Compiles full transcript
3. Calls Ollama LLM (or uses rule-based analysis)
4. Extracts speakers, action items, decisions
5. Generates executive summary
6. Creates meeting minutes markdown
7. Updates status to "completed"

**Status Codes:**
- `200 OK` - Analysis started
- `400 Bad Request` - Meeting not transcribed yet
- `404 Not Found` - Meeting not found
- `500 Internal Server Error` - Analysis failed

---

### GET /analysis/meeting/:meetingId

Get analysis results for a meeting.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| meetingId | UUID | Meeting ID |

**Response:**
```json
{
  "success": true,
  "analysis": {
    "speakers": [
      {
        "id": "speaker-uuid-1",
        "speakerName": "John Doe",
        "totalSpeakingTimeSeconds": 600,
        "wordCount": 1250
      }
    ],
    "actionItems": [
      {
        "id": "action-uuid-1",
        "title": "Complete budget analysis",
        "assignee": "John Doe",
        "dueDate": "2025-11-15",
        "priority": "high"
      }
    ],
    "decisions": [
      {
        "id": "decision-uuid-1",
        "decisionText": "Approved budget increase",
        "consensusType": "unanimous"
      }
    ],
    "summary": "The meeting covered quarterly budget review..."
  }
}
```

**Status Codes:**
- `200 OK` - Analysis retrieved
- `404 Not Found` - Meeting not found or not analyzed yet
- `500 Internal Server Error` - Server error

---

## Export

### GET /export/markdown/:meetingId

Export meeting minutes as Markdown file.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| meetingId | UUID | Meeting ID |

**Example Request:**
```bash
curl "http://localhost:3001/api/export/markdown/uuid-here" -o meeting_minutes.md
```

**Response:**
- Content-Type: `text/markdown`
- Content-Disposition: `attachment; filename="meeting_title_minutes.md"`
- Body: Markdown file content

**Status Codes:**
- `200 OK` - File downloaded
- `404 Not Found` - Meeting not found or not completed
- `500 Internal Server Error` - Export failed

---

### GET /export/pdf/:meetingId

*Planned - Infrastructure ready*

Export meeting minutes as PDF file.

---

### GET /export/docx/:meetingId

*Planned - Infrastructure ready*

Export meeting minutes as DOCX file.

---

## Error Handling

### Error Response Format

All errors follow this consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "stack": "Error stack trace (development only)"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or missing required fields |
| 404 | Not Found | Resource not found |
| 413 | Payload Too Large | File size exceeds limit (500MB) |
| 500 | Internal Server Error | Server-side error |

### Common Error Messages

**File Upload Errors:**
- `"Only audio files are allowed (mp3, wav, m4a, flac, ogg, webm)"` - Invalid file type
- `"File too large"` - Exceeds 500MB limit
- `"Please select an audio file to upload"` - Missing audio file

**Meeting Errors:**
- `"Meeting not found"` - Invalid meeting ID
- `"Meeting already processed"` - Attempting to reprocess completed meeting

**Processing Errors:**
- `"Transcription failed"` - Whisper API error
- `"Analysis failed"` - Ollama/LLM error
- `"Audio file not found"` - Missing audio file on server

---

## Rate Limiting

Currently not implemented. For production deployment, consider adding rate limiting:

```javascript
// Example: 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

---

## Webhooks (Future Feature)

Potential webhook support for async processing notifications:

**POST /webhooks/register**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["transcription.completed", "analysis.completed"]
}
```

---

## API Client Examples

### JavaScript/TypeScript
```typescript
const API_BASE = 'http://localhost:3001/api';

// Upload meeting
async function uploadMeeting(audioFile: File, metadata: any) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('title', metadata.title);
  formData.append('meetingDate', metadata.date);
  formData.append('participants', metadata.participants);

  const response = await fetch(`${API_BASE}/meetings/upload`, {
    method: 'POST',
    body: formData
  });

  return await response.json();
}

// Get meeting
async function getMeeting(id: string) {
  const response = await fetch(`${API_BASE}/meetings/${id}`);
  return await response.json();
}
```

### Python
```python
import requests

API_BASE = 'http://localhost:3001/api'

# Upload meeting
def upload_meeting(audio_file_path, title, participants):
    with open(audio_file_path, 'rb') as f:
        files = {'audio': f}
        data = {
            'title': title,
            'participants': participants
        }
        response = requests.post(f'{API_BASE}/meetings/upload', files=files, data=data)
        return response.json()

# Get meeting
def get_meeting(meeting_id):
    response = requests.get(f'{API_BASE}/meetings/{meeting_id}')
    return response.json()
```

### cURL
```bash
# Upload
curl -X POST http://localhost:3001/api/meetings/upload \
  -F "audio=@meeting.mp3" \
  -F "title=Budget Review" \
  -F "participants=John,Jane"

# Get meeting
curl http://localhost:3001/api/meetings/uuid-here

# Process transcription
curl -X POST http://localhost:3001/api/transcriptions/process/uuid-here

# Analyze meeting
curl -X POST http://localhost:3001/api/analysis/meeting/uuid-here

# Export markdown
curl http://localhost:3001/api/export/markdown/uuid-here -o minutes.md
```

---

*API Version: 1.0.0*
*Last Updated: 2025-11-07*
