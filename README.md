# MindCare-AI Frontend

## Overview
This frontend connects to your backend at `http://127.0.0.1:8080/api/message`. It supports optional Firebase Auth/Firestore (configure `js/app.js`) and stores local history in `localStorage`.

## Files added
- `index.html`, `chat.html`, `dashboard.html`, `activities.html`
- `assets/css/chat.css` (shared styles)
- `js/app.js`, `js/api.js`, `js/chat.js`, `js/dashboard.js`, `js/activities.js`, `js/emotion-engine.js`

## Setup & Run
1. Ensure backend is running:
   ```bash
   npx nodemon index.js