# MINDCARE-AI (MVP)

Privacy-first, non-clinical mental health support chatbot for students.

## What this repo contains
- Frontend: React chat UI + two guided activities
- Backend: Node.js Express API with rule-based risk detection, Google NL fallback, and anonymous telemetry to Firebase
- Infra: minimal Firebase rules example

## Quick start (local)
1. Copy `.env.example` to `.env` and fill values.
2. Place Google and Firebase service account JSON files in `backend/`.
3. Start backend:
   ```bash
   cd backend
   npm install
   npm run dev