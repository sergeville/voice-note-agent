# Voice-to-Note Agent - Usage Examples

## Table of Contents
- [Real-World Scenarios](#real-world-scenarios)
- [Step-by-Step Walkthroughs](#step-by-step-walkthroughs)
- [API Integration Examples](#api-integration-examples)
- [Common Workflows](#common-workflows)
- [Advanced Use Cases](#advanced-use-cases)

---

## Real-World Scenarios

### Scenario 1: Weekly Team Standup

**Context:** A software development team holds a 30-minute weekly standup meeting via Zoom.

**Setup:**
1. Record the Zoom meeting (audio only, M4A format)
2. Download the audio file: `team-standup-2024-01-15.m4a`
3. Meeting participants: Alice (PM), Bob (Dev), Carol (Designer)

**Upload:**
```bash
curl -X POST http://localhost:3001/api/meetings/upload \
  -F "audio=@team-standup-2024-01-15.m4a" \
  -F "title=Weekly Team Standup - Jan 15" \
  -F "meetingDate=2024-01-15T10:00:00Z" \
  -F "participants=[\"Alice Chen\",\"Bob Smith\",\"Carol Davis\"]"
```

**Response:**
```json
{
  "success": true,
  "meeting": {
    "id": "clx123abc456",
    "title": "Weekly Team Standup - Jan 15",
    "status": "uploaded"
  }
}
```

**Process:**
1. Transcribe: `POST /api/transcriptions/process/clx123abc456`
2. Analyze: `POST /api/analysis/meeting/clx123abc456`
3. Export: `GET /api/export/markdown/clx123abc456`

**Generated Minutes Excerpt:**
```markdown
---
title: "Weekly Team Standup - Jan 15"
date: "2024-01-15"
participants:
  - "Alice Chen"
  - "Bob Smith"
  - "Carol Davis"
---

## Executive Summary
Team discussed sprint progress, identified blockers with the API integration,
and assigned tasks for the upcoming week. Overall sprint is 75% complete.

## Action Items

### High Priority
* [ ] **Fix authentication bug in API** (Bob, 2024-01-17)
* [ ] **Complete design mockups for user profile** (Carol, 2024-01-18)

### Medium Priority
* [ ] **Update documentation for new endpoints** (Alice, 2024-01-20)
```

---

### Scenario 2: Client Presentation with Q&A

**Context:** A 1-hour client presentation followed by 30 minutes of questions.

**Upload via Web Interface:**
1. Navigate to http://localhost:5173/upload
2. Drag and drop `client-presentation-acme-corp.mp3`
3. Fill in form:
   - Title: "Acme Corp Product Demo & Q&A"
   - Date: January 20, 2024
   - Time: 2:00 PM - 3:30 PM
   - Participants: Sarah (Sales), John (Engineering), Acme Team (3 people)
4. Click "Upload & Process"

**Processing Time:**
- Upload: ~5 seconds (45MB file)
- Transcription: ~3 minutes (90 minutes of audio)
- Analysis: ~45 seconds (with Ollama)

**Key Extracted Elements:**
- **Speakers:** 6 identified (Sarah, John, Client-Speaker-1, Client-Speaker-2, Client-Speaker-3, Client-Speaker-4)
- **Action Items:** 8 tasks
- **Decisions:** 3 major decisions
- **Topics:** Product roadmap, pricing, implementation timeline

**Exported Format:**
```markdown
## Decisions Made

> **Acme Corp will proceed with Enterprise tier subscription**
> Consensus type: Unanimous
> *Time: 3:15 PM*

> **Implementation starts February 1st with 2-week onboarding**
> Consensus type: Agreed by stakeholders
> *Time: 3:22 PM*
```

---

### Scenario 3: Board Meeting (Sensitive Content)

**Context:** Quarterly board meeting with financial discussions, requires local processing.

**Configuration (Privacy-First):**
```env
# backend/.env - No external API calls
OPENAI_API_KEY="your-openai-api-key-here"  # Mock mode
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1:70b"
```

**Processing:**
- Transcription: Mock mode (manual transcription needed)
- Analysis: Local Ollama (no data leaves server)
- Storage: SQLite local database

**Result:**
All data remains on local machine. Board minutes generated with complete privacy.

---

## Step-by-Step Walkthroughs

### Walkthrough 1: First-Time Setup to First Meeting

**Prerequisites:**
- macOS/Linux/Windows with Node.js 18+
- 2GB free disk space
- Internet connection (for dependencies)

**Steps:**

1. **Clone and Install**
```bash
git clone <repository-url>
cd voice-note-agent
pnpm run setup
```

Expected output:
```
Installing backend dependencies...
Installing frontend dependencies...
Generating Prisma client...
Pushing database schema...
✓ Setup complete!
```

2. **Configure Environment**
```bash
cd backend
cp .env.example .env
nano .env  # Add your OpenAI API key if available
```

3. **Start Application**
```bash
cd ..
pnpm start
```

Expected output:
```
[backend] Server running on http://localhost:3001
[frontend] Local: http://localhost:5173/
```

4. **Upload First Meeting**
- Open browser: http://localhost:5173
- Click "Upload" in navigation
- Select audio file (or use sample_business_meeting.mp3)
- Fill in meeting details:
  - Title: "My First Test Meeting"
  - Date: Today's date
  - Participants: Your name, Test User
- Click "Upload & Process"

5. **Monitor Processing**
Dashboard shows:
- Status: "processing" → "transcribed" → "analyzing" → "completed"
- Progress bar updates in real-time
- Estimated time remaining

6. **View Results**
- Navigate to "Library"
- Click on your meeting
- See full transcription, action items, decisions
- Click "Export Markdown" to download

7. **Verify Output**
Downloaded file: `My_First_Test_Meeting_2024-01-15.md`
Open in any text editor or Markdown viewer (Obsidian, Notion, VS Code)

---

### Walkthrough 2: Batch Processing Multiple Meetings

**Scenario:** Process 10 recorded meetings from last week.

**Python Script:**
```python
import os
import requests
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:3001/api"
MEETINGS_DIR = "./recordings/week-3"

# Meeting metadata
meetings = [
    {"file": "monday-standup.mp3", "title": "Monday Standup", "day": 0},
    {"file": "client-call-techcorp.m4a", "title": "TechCorp Client Call", "day": 1},
    {"file": "design-review.wav", "title": "Design Review", "day": 2},
    # ... more meetings
]

def upload_and_process(meeting_file, title, meeting_date):
    # Upload
    with open(os.path.join(MEETINGS_DIR, meeting_file), 'rb') as f:
        files = {'audio': f}
        data = {
            'title': title,
            'meetingDate': meeting_date.isoformat(),
            'participants': '["Team Members"]'
        }
        response = requests.post(f"{API_BASE}/meetings/upload", files=files, data=data)
        meeting_id = response.json()['meeting']['id']

    print(f"✓ Uploaded: {title} (ID: {meeting_id})")

    # Transcribe
    requests.post(f"{API_BASE}/transcriptions/process/{meeting_id}")
    print(f"  → Transcription started...")

    # Wait for transcription
    while True:
        status = requests.get(f"{API_BASE}/meetings/{meeting_id}").json()
        if status['meeting']['status'] == 'transcribed':
            break
        time.sleep(5)

    print(f"  → Transcription complete")

    # Analyze
    requests.post(f"{API_BASE}/analysis/meeting/{meeting_id}")
    print(f"  → Analysis started...")

    # Wait for analysis
    while True:
        status = requests.get(f"{API_BASE}/meetings/{meeting_id}").json()
        if status['meeting']['status'] == 'completed':
            break
        time.sleep(3)

    print(f"  ✓ Analysis complete")

    # Export
    response = requests.get(f"{API_BASE}/export/markdown/{meeting_id}")
    filename = f"{title.replace(' ', '_')}_{meeting_date.strftime('%Y-%m-%d')}.md"
    with open(f"./exports/{filename}", 'wb') as f:
        f.write(response.content)

    print(f"  ✓ Exported: {filename}\n")
    return meeting_id

# Process all meetings
base_date = datetime(2024, 1, 15)
for meeting in meetings:
    meeting_date = base_date + timedelta(days=meeting['day'])
    upload_and_process(meeting['file'], meeting['title'], meeting_date)

print("All meetings processed!")
```

**Output:**
```
✓ Uploaded: Monday Standup (ID: clx123...)
  → Transcription started...
  → Transcription complete
  → Analysis started...
  ✓ Analysis complete
  ✓ Exported: Monday_Standup_2024-01-15.md

✓ Uploaded: TechCorp Client Call (ID: clx456...)
  ...
```

---

## API Integration Examples

### Example 1: Node.js Integration

**Use Case:** Integrate voice-note-agent into existing Express.js application.

```javascript
// meeting-processor.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class MeetingProcessor {
  constructor(apiBaseUrl = 'http://localhost:3001/api') {
    this.api = axios.create({
      baseURL: apiBaseUrl,
      timeout: 300000 // 5 minutes for large files
    });
  }

  async uploadMeeting(audioPath, metadata) {
    const form = new FormData();
    form.append('audio', fs.createReadStream(audioPath));
    form.append('title', metadata.title);
    form.append('meetingDate', metadata.date);
    form.append('participants', JSON.stringify(metadata.participants));

    const response = await this.api.post('/meetings/upload', form, {
      headers: form.getHeaders()
    });

    return response.data.meeting;
  }

  async processTranscription(meetingId) {
    await this.api.post(`/transcriptions/process/${meetingId}`);
    return this.waitForStatus(meetingId, 'transcribed');
  }

  async analyzeMeeting(meetingId) {
    await this.api.post(`/analysis/meeting/${meetingId}`);
    return this.waitForStatus(meetingId, 'completed');
  }

  async waitForStatus(meetingId, targetStatus, maxWaitSeconds = 600) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const { data } = await this.api.get(`/meetings/${meetingId}`);
      if (data.meeting.status === targetStatus) {
        return data.meeting;
      }
      if (data.meeting.status === 'failed') {
        throw new Error('Processing failed');
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    }
    throw new Error('Timeout waiting for processing');
  }

  async exportMarkdown(meetingId, outputPath) {
    const { data } = await this.api.get(`/export/markdown/${meetingId}`, {
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(outputPath, data);
  }

  async processComplete(audioPath, metadata, exportPath) {
    console.log('Uploading...');
    const meeting = await this.uploadMeeting(audioPath, metadata);

    console.log(`Processing meeting ${meeting.id}...`);
    await this.processTranscription(meeting.id);

    console.log('Analyzing...');
    await this.analyzeMeeting(meeting.id);

    console.log('Exporting...');
    await this.exportMarkdown(meeting.id, exportPath);

    console.log(`Complete! Minutes saved to ${exportPath}`);
    return meeting.id;
  }
}

// Usage
const processor = new MeetingProcessor();
processor.processComplete(
  './recordings/team-meeting.mp3',
  {
    title: 'Weekly Team Meeting',
    date: new Date().toISOString(),
    participants: ['Alice', 'Bob', 'Carol']
  },
  './minutes/team-meeting.md'
).catch(console.error);
```

---

### Example 2: Python Web Scraper Integration

**Use Case:** Automatically download meeting recordings from cloud storage and process them.

```python
import requests
import boto3
from datetime import datetime

class MeetingPipeline:
    def __init__(self, api_url="http://localhost:3001/api"):
        self.api_url = api_url
        self.s3 = boto3.client('s3')

    def download_from_s3(self, bucket, key, local_path):
        """Download meeting recording from S3"""
        self.s3.download_file(bucket, key, local_path)
        return local_path

    def upload_to_voice_note(self, audio_path, metadata):
        """Upload to voice-note-agent"""
        with open(audio_path, 'rb') as audio_file:
            files = {'audio': audio_file}
            data = {
                'title': metadata['title'],
                'meetingDate': metadata['date'],
                'participants': metadata['participants']
            }
            response = requests.post(
                f"{self.api_url}/meetings/upload",
                files=files,
                data=data
            )
            return response.json()['meeting']['id']

    def process_pipeline(self, meeting_id):
        """Run full processing pipeline"""
        # Transcribe
        requests.post(f"{self.api_url}/transcriptions/process/{meeting_id}")
        self._wait_for_status(meeting_id, 'transcribed')

        # Analyze
        requests.post(f"{self.api_url}/analysis/meeting/{meeting_id}")
        self._wait_for_status(meeting_id, 'completed')

    def _wait_for_status(self, meeting_id, target_status):
        import time
        while True:
            response = requests.get(f"{self.api_url}/meetings/{meeting_id}")
            status = response.json()['meeting']['status']
            if status == target_status:
                break
            time.sleep(5)

    def export_and_upload_to_notion(self, meeting_id, notion_page_id):
        """Export markdown and upload to Notion"""
        # Get markdown
        response = requests.get(f"{self.api_url}/export/markdown/{meeting_id}")
        markdown_content = response.content.decode('utf-8')

        # Upload to Notion (using notion-client)
        from notion_client import Client
        notion = Client(auth=os.environ["NOTION_TOKEN"])

        notion.pages.update(
            page_id=notion_page_id,
            properties={
                "Meeting Minutes": {
                    "rich_text": [{
                        "text": {"content": markdown_content}
                    }]
                }
            }
        )

    def run_daily_batch(self):
        """Process all meetings from today"""
        # List S3 objects from today
        today = datetime.now().strftime('%Y-%m-%d')
        objects = self.s3.list_objects_v2(
            Bucket='company-meetings',
            Prefix=f'recordings/{today}/'
        )

        for obj in objects.get('Contents', []):
            key = obj['Key']
            filename = key.split('/')[-1]

            # Download
            local_path = f"/tmp/{filename}"
            self.download_from_s3('company-meetings', key, local_path)

            # Process
            meeting_id = self.upload_to_voice_note(local_path, {
                'title': filename.replace('.mp3', ''),
                'date': datetime.now().isoformat(),
                'participants': '["Auto-processed"]'
            })

            self.process_pipeline(meeting_id)

            print(f"✓ Processed: {filename}")

# Run as cron job
if __name__ == "__main__":
    pipeline = MeetingPipeline()
    pipeline.run_daily_batch()
```

---

### Example 3: Webhook Integration

**Use Case:** Automatically process meetings when Zoom recording completes.

```javascript
// webhook-handler.js
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Zoom webhook endpoint
app.post('/webhook/zoom', async (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-zm-signature'];
  if (!verifyZoomSignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body.event;

  // Handle recording completed event
  if (event === 'recording.completed') {
    const recording = req.body.payload.object;

    // Download recording
    const audioUrl = recording.recording_files.find(f => f.file_type === 'M4A').download_url;
    const localPath = await downloadRecording(audioUrl, recording.access_token);

    // Upload to voice-note-agent
    const meetingId = await uploadToVoiceNote(localPath, {
      title: recording.topic,
      date: recording.start_time,
      participants: recording.participant_audio_files.map(p => p.file_name)
    });

    // Process asynchronously
    processInBackground(meetingId);

    res.status(200).send('Processing started');
  } else {
    res.status(200).send('Event ignored');
  }
});

async function downloadRecording(url, token) {
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'stream'
  });

  const path = `/tmp/recording-${Date.now()}.m4a`;
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(path));
    writer.on('error', reject);
  });
}

app.listen(3002, () => {
  console.log('Webhook handler running on port 3002');
});
```

---

## Common Workflows

### Workflow 1: Weekly Team Standup Routine

**Every Monday, 10 AM:**

1. **Record meeting** (Zoom/Teams/Google Meet)
2. **Download audio** → `~/Downloads/standup-YYYY-MM-DD.m4a`
3. **Quick upload script:**
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
FILE="$HOME/Downloads/standup-$DATE.m4a"

MEETING_ID=$(curl -X POST http://localhost:3001/api/meetings/upload \
  -F "audio=@$FILE" \
  -F "title=Weekly Standup - $DATE" \
  -F "meetingDate=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "participants=[\"Alice\",\"Bob\",\"Carol\",\"David\"]" \
  | jq -r '.meeting.id')

echo "Meeting uploaded: $MEETING_ID"

# Process
curl -X POST "http://localhost:3001/api/transcriptions/process/$MEETING_ID"
sleep 120  # Wait 2 minutes

curl -X POST "http://localhost:3001/api/analysis/meeting/$MEETING_ID"
sleep 30

# Export
curl "http://localhost:3001/api/export/markdown/$MEETING_ID" \
  -o "$HOME/Documents/Meetings/standup-$DATE.md"

echo "Minutes saved to Documents/Meetings/"
```

4. **Review in Obsidian** (auto-synced to Documents/Meetings/)
5. **Share via Slack** (copy action items)

---

### Workflow 2: Client Meeting Documentation

**For each client meeting:**

1. **Upload via web UI** (http://localhost:5173/upload)
2. **Add detailed metadata:**
   - Client name
   - All participants (internal + external)
   - Meeting agenda
   - Project code
3. **Process and wait** (~5 minutes for 1-hour meeting)
4. **Review transcript** for accuracy
5. **Edit action items** (assign to team members)
6. **Export to:**
   - Notion (project page)
   - Shared Google Drive
   - CRM (attach to client record)

---

## Advanced Use Cases

### Use Case 1: Multi-Language Meetings

**Challenge:** Meeting conducted in English and Spanish.

**Solution:**
Whisper automatically detects language. For mixed-language meetings:

```javascript
// Custom post-processing
const meeting = await getMeeting(meetingId);
const segments = meeting.transcriptions;

// Separate by detected language
const englishSegments = segments.filter(s => s.language === 'en');
const spanishSegments = segments.filter(s => s.language === 'es');

// Generate bilingual minutes
const bilingualMarkdown = `
## English Discussion
${formatSegments(englishSegments)}

## Spanish Discussion (Discusión en Español)
${formatSegments(spanishSegments)}
`;
```

---

### Use Case 2: Automated Speaker Identification

**Challenge:** Identify speakers by voice characteristics.

**Current:** Speakers labeled as "Speaker 1", "Speaker 2", etc.

**Enhancement:**
1. Use Whisper's speaker diarization
2. Map to known participants list
3. Update speaker names in database

```sql
-- Update speaker names post-processing
UPDATE Speaker
SET speakerName = 'Alice Chen'
WHERE meetingId = 'clx123' AND speakerLabel = 'Speaker 1';
```

---

### Use Case 3: Integration with Calendar

**Workflow:**
1. Google Calendar event created with Zoom link
2. Zoom auto-records meeting
3. Webhook triggers when recording ready
4. Voice-note-agent processes automatically
5. Meeting minutes attached to calendar event

```javascript
// Google Calendar API integration
const { google } = require('googleapis');

async function attachMinutesToEvent(eventId, markdownPath) {
  const calendar = google.calendar('v3');
  const auth = await getGoogleAuth();

  const markdown = fs.readFileSync(markdownPath, 'utf8');

  await calendar.events.patch({
    auth,
    calendarId: 'primary',
    eventId,
    requestBody: {
      description: markdown
    }
  });
}
```

---

### Use Case 4: Custom Templates

**Scenario:** Company-specific meeting minute format.

**Create custom template:**
```markdown
# {{title}} - Meeting Minutes

**Date:** {{date}}
**Project:** {{project_code}}
**Attendees:** {{participants}}

---

## 1. Opening & Agenda Review
{{section_opening}}

## 2. Discussion Points
{{transcription}}

## 3. Decisions & Agreements
{{decisions}}

## 4. Next Steps
{{action_items}}

## 5. Next Meeting
**Date:** {{next_meeting_date}}
**Agenda:** {{next_agenda}}

---
**Prepared by:** Voice-to-Note Agent
**Distribution:** {{distribution_list}}
```

**Implement in markdown.service.ts:**
```typescript
function applyCustomTemplate(meeting: Meeting, template: string): string {
  return template
    .replace('{{title}}', meeting.title)
    .replace('{{date}}', meeting.meetingDate)
    .replace('{{participants}}', formatParticipants(meeting.participants))
    // ... more replacements
}
```

---

*These examples demonstrate the flexibility and power of the Voice-to-Note Agent across various real-world scenarios.*
