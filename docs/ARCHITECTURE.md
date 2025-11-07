# Voice-to-Note Agent - System Architecture

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Component Breakdown](#component-breakdown)
- [Database Schema](#database-schema)
- [API Layer](#api-layer)
- [Processing Pipeline](#processing-pipeline)
- [Technology Stack](#technology-stack)

---

## Overview

The Voice-to-Note Agent is a full-stack application built with a modern, scalable architecture that processes audio recordings into structured meeting minutes using AI-powered transcription and analysis.

**Core Design Principles:**
- Separation of concerns (MVC pattern)
- Asynchronous processing for scalability
- Intelligent fallback mechanisms
- Type-safe development with TypeScript
- RESTful API design
- Responsive UI with modern frameworks

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + TypeScript + Tailwind)              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐│
│  │  Dashboard  │  │   Upload    │  │   Library   │  │ Detail ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘│
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                         API GATEWAY                             │
│                    (Express.js Server)                          │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐       │
│  │ Meeting  │  │Transcript│  │ Analysis │  │ Export  │       │
│  │ Routes   │  │ Routes   │  │ Routes   │  │ Routes  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘       │
│       │             │              │             │             │
│  ┌────▼─────┐  ┌───▼──────┐  ┌───▼──────┐  ┌───▼─────┐      │
│  │ Meeting  │  │Transcript│  │ Analysis │  │ Export  │      │
│  │Controller│  │Controller│  │Controller│  │Controller│      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘      │
└───────┼─────────────┼──────────────┼──────────────┼───────────┘
        │             │              │              │
        └─────────────┴──────────────┴──────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      SERVICE LAYER                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Whisper    │  │    Ollama    │  │   Markdown   │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  │              │  │              │  │              │         │
│  │  (OpenAI)    │  │  (Local LLM) │  │ (Generator)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────────┐
│                      DATA LAYER                                 │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Prisma ORM                                │    │
│  └────────────────────┬───────────────────────────────────┘    │
│                       │                                        │
│  ┌────────────────────▼───────────────────────────────────┐    │
│  │         SQLite (Dev) / PostgreSQL (Prod)              │    │
│  │                                                        │    │
│  │  Tables: Meeting, Speaker, Transcription,            │    │
│  │          ActionItem, Decision, MeetingMinute,        │    │
│  │          Template                                     │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│                                                                 │
│  ┌──────────────┐              ┌──────────────┐                │
│  │  OpenAI API  │              │    Ollama    │                │
│  │  (Whisper)   │              │  (localhost) │                │
│  └──────────────┘              └──────────────┘                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   FILE STORAGE SYSTEM                           │
│                                                                 │
│  uploads/                                                       │
│  ├── audio/        ← Original audio files                      │
│  ├── processed/    ← Processed transcriptions                  │
│  ├── exports/      ← Generated meeting minutes                 │
│  └── temp/         ← Temporary processing files                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Upload Flow
```
User → Upload Page → API (POST /api/meetings/upload)
                        ↓
                   File Validation
                        ↓
                   Save to uploads/audio/
                        ↓
                   Create Meeting Record
                        ↓
                   Return Meeting ID
```

### 2. Transcription Flow
```
API (POST /api/transcriptions/process/:id)
    ↓
Update Status: "processing"
    ↓
Call Whisper Service
    ↓
┌─────────────────────────┐
│ Has OpenAI API Key?     │
├─────────────────────────┤
│ Yes → OpenAI Whisper    │
│ No  → Mock Transcription│
└────────┬────────────────┘
         ↓
Create Transcription Segments
         ↓
Save to Database
         ↓
Update Status: "transcribed"
         ↓
Return Success
```

### 3. Analysis Flow
```
API (POST /api/analysis/meeting/:id)
    ↓
Fetch Transcription Segments
    ↓
Compile Full Transcript
    ↓
Call Ollama Service
    ↓
┌─────────────────────────┐
│ Ollama Available?       │
├─────────────────────────┤
│ Yes → LLM Analysis      │
│ No  → Rule-based Extract│
└────────┬────────────────┘
         ↓
Extract:
  - Speakers
  - Action Items
  - Decisions
  - Topics
         ↓
Save to Database
         ↓
Generate Markdown
         ↓
Update Status: "completed"
```

### 4. Export Flow
```
User → Meeting Detail → Click Export
                           ↓
            API (GET /api/export/markdown/:id)
                           ↓
            Fetch Meeting + Relations
                           ↓
            Generate Markdown Service
                           ↓
            Compile Sections:
              - YAML Front-matter
              - Executive Summary
              - Attendees
              - Discussion
              - Action Items
              - Decisions
              - Metadata
                           ↓
            Return Markdown File
                           ↓
            Browser Downloads File
```

---

## Component Breakdown

### Frontend Components

#### 1. Pages
- **Dashboard.tsx** - Overview, statistics, system config
- **UploadPage.tsx** - File upload, meeting metadata input
- **MeetingLibrary.tsx** - List view, search, filter
- **MeetingDetail.tsx** - Full meeting view, export

#### 2. API Client (lib/api.ts)
- Axios-based HTTP client
- Typed request/response interfaces
- Error handling
- Base URL configuration

#### 3. App.tsx
- React Router setup
- Navigation bar with LLM display
- Route configuration

### Backend Components

#### 1. Controllers
```
meeting.controller.ts
├── uploadAudio()      - Handle file upload
├── getAllMeetings()   - List with pagination
├── getMeetingById()   - Detailed view
├── updateMeeting()    - Edit metadata
├── deleteMeeting()    - Remove meeting + files
└── getStats()         - Dashboard statistics

transcription.controller.ts
├── processTranscription()  - Start async transcription
├── getByMeeting()          - Fetch transcription
└── updateSegment()         - Edit transcript segment

analysis.controller.ts
├── analyzeMeeting()        - Start AI analysis
└── getAnalysis()           - Fetch analysis results

export.controller.ts
├── exportMarkdown()        - Generate MD file
├── exportPDF()             - Generate PDF (planned)
└── exportDocx()            - Generate DOCX (planned)
```

#### 2. Services
```
whisper.service.ts
└── transcribeAudio()
    ├── Check OpenAI API key
    ├── Call Whisper API OR
    └── Generate mock transcription

ollama.service.ts
└── analyzeWithOllama()
    ├── Check Ollama availability
    ├── Send prompt to LLM OR
    └── Rule-based extraction

markdown.service.ts
└── generateMeetingMinutes()
    ├── Fetch all meeting data
    ├── Generate YAML front-matter
    ├── Generate attendees section
    ├── Format discussion
    ├── Format action items
    ├── Format decisions
    └── Compile final document
```

#### 3. Configuration
```
multer.config.ts
├── Storage configuration
├── File type validation
└── Size limit enforcement

prisma.ts
└── Database client singleton
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│   Meeting    │──────────┐
│──────────────│          │
│ id (PK)      │          │
│ title        │          │ 1:N
│ meetingDate  │          │
│ status       │          ▼
│ audioFile... │     ┌──────────────┐
└──────────────┘     │ Transcription│
       │             │──────────────│
       │             │ id (PK)      │
       │ 1:N         │ meetingId(FK)│
       │             │ speakerId(FK)│
       ▼             │ text         │
┌──────────────┐     │ timestamps   │
│   Speaker    │◀────└──────────────┘
│──────────────│
│ id (PK)      │
│ meetingId(FK)│
│ speakerName  │
│ speakingTime │
└──────────────┘
       ▲
       │
       │
┌──────────────┐
│   Meeting    │──────────┐
│──────────────│          │
│     ...      │          │ 1:N
└──────────────┘          │
       │                  ▼
       │             ┌──────────────┐
       │ 1:N         │  ActionItem  │
       │             │──────────────│
       ▼             │ id (PK)      │
┌──────────────┐     │ meetingId(FK)│
│  Decision    │     │ title        │
│──────────────│     │ assignee     │
│ id (PK)      │     │ dueDate      │
│ meetingId(FK)│     │ priority     │
│ decisionText │     └──────────────┘
│ consensusType│
└──────────────┘
       ▲
       │
       │ 1:1
       │
┌──────────────┐
│MeetingMinute │
│──────────────│
│ id (PK)      │
│ meetingId(FK)│
│ markdownCont.│
│ execSummary  │
└──────────────┘
```

### Table Details

**Meeting** - Core meeting metadata
- Tracks upload status and processing stages
- Stores audio file path and size
- Records confidence scores and processing time

**Speaker** - Identified participants
- Links to meeting
- Can be linked to transcription segments
- Tracks speaking time and word count

**Transcription** - Raw transcript segments
- Ordered by segmentIndex
- Includes timestamps
- Optional speaker attribution

**ActionItem** - Extracted tasks
- Priority levels (high/medium/low)
- Optional assignee and due date
- References source segment

**Decision** - Meeting decisions
- Consensus type tracking
- Timestamp and participants
- References source segment

**MeetingMinute** - Final output
- Complete Markdown content
- Executive summary
- Generated timestamps

**Template** - Customizable formats
- User-defined meeting minute templates
- Format specifications

---

## API Layer

### Request/Response Flow

```
HTTP Request
    ↓
Express Router
    ↓
Middleware (CORS, Body Parser)
    ↓
Route Handler
    ↓
Controller Function
    ↓
┌──────────────────┐
│ Validation       │
│ Authentication?  │
│ Authorization?   │
└────────┬─────────┘
         ↓
Service Layer Call
         ↓
Database Operation (Prisma)
         ↓
Response Formatting
         ↓
JSON Response to Client
```

### Error Handling Strategy

```typescript
try {
  // Controller logic
  const result = await service.doSomething();
  res.json({ success: true, data: result });
} catch (error) {
  // Centralized error handler
  res.status(500).json({
    error: {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  });
}
```

---

## Processing Pipeline

### Asynchronous Processing Model

```
API Request Received
    ↓
Create Job Record (status: "pending")
    ↓
Return Job ID Immediately
    ↓
Background Processing Begins
    ↓
Update Status: "processing"
    ↓
[Long-running task]
    ↓
Update Status: "completed" | "failed"
    ↓
User Polls or WebSocket Notifies
```

### Status Transitions

```
uploaded → processing → transcribed → analyzing → completed
                                    ↓
                                  failed
```

---

## Technology Stack

### Frontend Stack
```
React 18.3
├── TypeScript 5.9 (Type Safety)
├── Vite 6.0 (Build Tool)
├── Tailwind CSS 3.4 (Styling)
├── React Router 6 (Navigation)
├── Axios 1.7 (HTTP Client)
├── Lucide React (Icons)
└── Radix UI (Component Library)
```

### Backend Stack
```
Node.js 18+
├── Express 5.x (Web Framework)
├── TypeScript 5.9 (Type Safety)
├── Prisma 6.19 (ORM)
│   └── SQLite / PostgreSQL
├── Multer 2.0 (File Upload)
├── OpenAI SDK (Whisper API)
└── dotenv (Configuration)
```

### Development Tools
```
Development
├── tsx (TypeScript Execution)
├── Vite (HMR & Dev Server)
├── ESLint (Code Quality)
├── Prettier (Code Formatting)
└── Concurrently (Multi-process)
```

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API design allows multiple instances
- Session storage could be added (Redis)
- Load balancer distribution ready

### Database Scaling
- Prisma supports connection pooling
- Read replicas for PostgreSQL
- Indexing on frequently queried fields

### File Storage Scaling
- Currently: Local filesystem
- Future: S3/Cloud Storage integration
- CDN for audio file delivery

### Processing Scaling
- Job queue system (Bull/BullMQ)
- Separate worker processes
- Distributed task processing

---

## Security Architecture

### Authentication (Future)
- JWT-based authentication
- OAuth2 integration ready
- Role-based access control

### File Security
- MIME type validation
- File size limits (500MB)
- Sanitized filenames
- Isolated upload directories

### API Security
- CORS configuration
- Rate limiting (planned)
- Input validation
- SQL injection prevention (Prisma)

### Data Privacy
- Local processing option (Ollama)
- No data sent to cloud (except OpenAI API)
- User data isolation
- Secure deletion

---

## Deployment Architectures

### Development
```
Laptop/Desktop
├── SQLite Database
├── Local File Storage
└── OpenAI API (Cloud)
```

### Production (Single Server)
```
VPS/Cloud Instance
├── PostgreSQL Database
├── Local/Network Storage
├── OpenAI API (Cloud)
└── Ollama (Local LLM)
```

### Production (Distributed)
```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ API 1  │ │ API 2  │
└────┬───┘ └───┬────┘
     │         │
     └────┬────┘
          ▼
    ┌──────────┐
    │PostgreSQL│
    └──────────┘
          │
          ▼
    ┌──────────┐
    │ S3/Cloud │
    │ Storage  │
    └──────────┘
```

---

## Performance Metrics

### Target Performance
- API Response Time: <200ms (excluding AI processing)
- Transcription: ~1-2 minutes per hour of audio
- Analysis: ~30-60 seconds per meeting
- File Upload: Support up to 500MB
- Concurrent Users: 100+ (with scaling)

### Optimization Strategies
1. Database query optimization (Prisma includes/selects)
2. Lazy loading in frontend
3. Pagination for large datasets
4. Caching for frequently accessed data
5. Asynchronous processing for heavy tasks

---

*This architecture is designed for scalability, maintainability, and ease of deployment.*
