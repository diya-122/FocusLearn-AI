# FocusLearn AI 🧠

**Stay Focused. Learn Smarter.**

AI-powered attention monitoring and adaptive learning platform designed for students with ADHD and attention-related learning challenges.

## 🚀 Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend (Coming Soon)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 📁 Project Structure

```
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── layouts/    # Layout wrappers
│   │   ├── context/    # React Context providers
│   │   ├── services/   # API service layer
│   │   ├── hooks/      # Custom React hooks
│   │   ├── utils/      # Utilities & mock data
│   │   ├── styles/     # Global CSS & design system
│   │   └── routes/     # React Router config
│   └── ...
│
└── backend/            # Django REST API (architecture docs)
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── AI_INTEGRATION.md
    └── ATTENTION_MONITORING.md
```

## ✨ Features

- **🧠 Attention Monitoring** — Real-time focus tracking using AI
- **🤖 AI Summaries** — Auto-generated lesson summaries via Llama 3
- **🧩 Smart Quizzes** — AI-generated MCQ & True/False quizzes
- **📊 Learning Analytics** — Focus trends, study time, performance charts
- **🎯 Adaptive Learning** — ADHD-aware personalized interventions
- **💬 AI Assistant** — Chat with AI about lesson content

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, React Router, Recharts |
| Styling | Modular CSS, CSS Variables |
| State | React Context API |
| HTTP | Axios (mock-ready) |
| Backend | Django, DRF, PostgreSQL |
| AI | Ollama, Llama 3, Gemma |
| Vision | OpenCV, MediaPipe |

## 📱 Pages

1. **Landing Page** — Hero, features, how it works, testimonials
2. **Login / Register** — Auth with social login UI
3. **Student Dashboard** — Stats, progress, activity feed
4. **Course Catalog** — Search, filter, sort courses
5. **Course Learning** — Video player, AI panel, focus meter
6. **AI Summaries** — Generated summaries with copy/download
7. **AI Quiz** — MCQ/T-F with timer, results, recommendations
8. **Analytics** — 6 chart types with Recharts
9. **Instructor Dashboard** — Course management, student stats
10. **Profile** — Settings, goals, notifications

## 📄 License

MIT License — Built with ❤️ for educational innovation.
