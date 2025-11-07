Act as a Senior Solutions Architect. Your task is to develop a comprehensive, multi-phased implementation plan for a **Voice-to-Note Taking Agent**.

The primary and non-negotiable deliverable of this agent must be a well-structured **Markdown (.md) file** formatted specifically for **meeting minutes**.

Your plan must be detailed, actionable, and cover all aspects from core transcription to intelligent note organization. Structure the plan into logical development phases and include a final output template.

**Key Requirements & Constraints:**

1.  **Core Functionality:** Must handle both **recorded audio files** (e.g., MP3, WAV) and **live/streaming voice input**.
2.  **Technology Stack:** Recommend a modern, industry-standard stack (e.g., Python, Cloud APIs/LLMs).
3.  **Intelligence Layer:** This is crucial. The plan must detail the use of **NLP/LLMs** for:
    * **Speaker Diarization** (identifying and labeling speakers).
    * **Action Item Extraction** (formatting tasks as an actionable checklist `* [ ]`).
    * **Decision Extraction** (formatting conclusions clearly, e.g., using a blockquote `>`).
    * **Automatic Summarization** and **Topic Sectioning** (using Markdown headings `##`).
4.  **Final Output:** Present a complete example of the desired Markdown Minutes Template, including YAML front-matter (Title, Date, Participants).

**Structure the response using the following headings:**

1.  Phase 1: Core Speech-to-Text (STT) and Basic Output
2.  Phase 2: Intelligence Layer & Structured Markdown Output
3.  Phase 3: Agent Deployment & Advanced Features
4.  Deliverable: Markdown Minutes Template