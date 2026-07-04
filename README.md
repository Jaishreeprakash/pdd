# AI-Based Mental Burnout Detection & Wellness Monitoring System

A full-stack, AI-powered application that detects burnout symptoms early using behavioral analysis — typing patterns, sleep data, phone usage, facial emotion, and voice emotion. Built with a FastAPI backend, React web app, and React Native (Expo) mobile app.

---

## Project Structure

```
AIbasedburnout/
├── backend/          # Python FastAPI + SQLite + AI/ML
├── web/              # React + TypeScript + Vite (dark-themed dashboard)
└── mobile/           # React Native + Expo (iOS/Android)
```

---

## Quick Start

### 1. Backend (Python FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

- API runs at: **http://localhost:8000**
- Interactive API docs: **http://localhost:8000/docs**
- Health check: **http://localhost:8000/**

### 2. Web App (React)

```bash
cd web
npm install
npm run dev
```

- Runs at: **http://localhost:3000**
- Works standalone with mock data — no backend required

### 3. Mobile App (React Native / Expo)

```bash
cd mobile
npm install
npx expo start
```

- Scan QR code with **Expo Go** app (iOS or Android)
- Works fully on mock data without backend

---

## Features

### Burnout Detection Engine
- **Burnout Risk Score** (0–100) with risk levels: Low / Moderate / High / Critical
- **Weighted AI formula**: Sleep 30% + Phone Usage 20% + Typing Behavior 20% + Activity 15% + Emotional State 15%
- **Trend prediction**: Linear regression over 30-day history

### Tracking Modules
| Module | What It Tracks |
|--------|---------------|
| Sleep Pattern | Duration, quality, consistency, bedtime |
| Phone Usage | Screen time, app categories, late-night usage |
| Typing Behavior | Speed (WPM), accuracy, pause frequency |
| Facial Emotion | Happy, Sad, Angry, Neutral, Surprised, Fearful |
| Voice Emotion | Tone, stress levels |
| Activity | Study hours, work hours, exercise, breaks |

### Dashboard
- Semicircular Burnout Gauge with animated needle
- Emotional Stability 7-day chart
- Wellness Score ring (0–100)
- AI-powered personalized recommendations
- Before/After comparison bar chart
- 6-dimension radar chart

### AI Recommendations
Context-aware recommendations for: sleep hygiene, digital detox, mindfulness, exercise, work-life balance

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI, SQLAlchemy, SQLite |
| AI/ML | NumPy, Scikit-learn (linear regression trend) |
| Authentication | JWT (python-jose) + bcrypt (passlib) |
| Web Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Charts (Web) | Recharts |
| Icons (Web) | Lucide React |
| Mobile | React Native, Expo ~50 |
| Charts (Mobile) | react-native-chart-kit |
| Camera | expo-camera (facial emotion) |
| Voice | expo-av (voice recording) |
| Mobile Storage | AsyncStorage |

---

## API Endpoints

### Auth
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login, returns JWT token
- `GET /api/v1/auth/me` — Get current user

### Tracking
- `POST/GET /api/v1/tracking/sleep`
- `POST/GET /api/v1/tracking/phone-usage`
- `POST/GET /api/v1/tracking/typing`
- `POST/GET /api/v1/tracking/emotion`
- `POST/GET /api/v1/tracking/activity`

### Analysis
- `GET /api/v1/burnout/analysis` — Full burnout analysis
- `GET /api/v1/burnout/history` — 30-day burnout history
- `GET /api/v1/wellness/dashboard` — Aggregated dashboard data
- `GET /api/v1/wellness/trends` — 7/30-day trends
- `GET /api/v1/recommendations` — AI recommendations

### Utilities
- `GET /api/v1/seed/{user_id}` — Seed 30 days of realistic mock data

---

## Seed Demo Data

After registering a user, seed realistic 30-day data:
```bash
curl http://localhost:8000/api/v1/seed/{user_id}
```

This generates a sinusoidal burnout curve: healthy → peak stress → recovery, with correlated data across all 7 tracking tables.

---

## Mobile Screens

- **Login / Register** — Animated dark-themed auth screens
- **Dashboard** — BurnoutGauge + WellnessRing + charts + quick actions
- **Sleep Tracker** — Log sleep, weekly bar chart, quality calendar
- **Emotion Analysis** — Live camera detection + manual emoji input + history
- **Phone Usage** — Screen time, category breakdown, late-night tracker
- **Activity Tracker** — SVG progress rings, activity heatmap
- **Recommendations** — Filterable AI recommendations with checklists
- **Analytics** — 7/30/90-day trend charts
- **Profile** — User settings, notification toggles, data privacy

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0f172a` (slate-900) |
| Card Surface | `#1e293b` (slate-800) |
| Primary | `#6366f1` (indigo-500) |
| Success | `#22c55e` (green-500) |
| Warning | `#f59e0b` (amber-500) |
| Danger | `#ef4444` (red-500) |
| Text | `#f1f5f9` |
| Muted Text | `#94a3b8` |

---

## References

1. World Health Organization, Mental Health and Burnout Reports, Geneva, 2022
2. National Institute of Mental Health, Mental Wellness and Stress Management Guidelines, 2021
3. TensorFlow Machine Learning Documentation, 2023
4. OpenCV Computer Vision Documentation, 2023
5. Google Firebase Cloud Database Documentation, 2023
6. Scikit-learn User Guide for Machine Learning Applications, 2022
7. J. Smith and R. Kumar, "AI-Based Emotion Recognition and Mental Wellness Monitoring System," IEEE Journal of AI, vol. 18, no. 4, pp. 245–252, 2021
