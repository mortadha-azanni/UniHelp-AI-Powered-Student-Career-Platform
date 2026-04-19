# UniHelp — AI-Powered Student Career Platform

> A full-stack platform helping students manage their professional development with AI: roadmaps, CVs, interview prep, study schedules, and job tracking — all in one place.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5+-black.svg)](https://expressjs.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1.x-purple.svg)](https://langchain.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5--flash-blue.svg)](https://ai.google.dev/)

---

## 🎯 Overview

**UniHelp** is an AI-powered career companion designed for students. It combines job application tracking, professional profile management, and a powerful suite of AI tools — all driven by Google's Gemini 2.5 Flash via LangChain.

---

## ✨ Features

### 🗺️ AI Visual Roadmaps
- Generate **personalized learning roadmaps** for any domain (cybersecurity, data science, React, etc.)
- AI produces a **branching DAG (tree) structure** with parallel learning tracks — not a linear list
- Interactive **React Flow** canvas with draggable, zoomable nodes
- Track progress node-by-node with status badges (pending / in-progress / completed)
- Community roadmaps: publish, clone, and like public roadmaps
- **3-tier AI fallback**: Google Gemini (primary) → Google Gemini (backup) → OpenRouter

### 📅 AI Study Schedule Generator
- Generate a **daily study plan** from any roadmap
- Configures to your hours/day, target timeframe, and familiarity level
- Tasks auto-sync back to the roadmap node statuses when completed

### 👤 Professional Profile Builder
- Complete profile: personal info, education, work experience, projects, skills, certifications, languages
- Used by all AI features to personalize output

### 📄 AI CV Generation
- Two modes: **full profile CV** or **auto-fill from a job description**
- Outputs professional **LaTeX** code ready for Overleaf
- Save generated CVs to the database for later reuse

### 🧠 Profile Critique
- AI-powered analysis of your full professional profile
- Identifies strengths, weaknesses, and gives actionable improvement advice
- One-click add to Todo list

### 🎤 Interview Preparation
- **HR Interview**: conversational mock interview with context-aware follow-ups
- **Technical Interview**: coding/concept quiz based on your skill stack
- **Job-specific questions** linked to a job application

### 💼 Job Application Tracker
- Track every application: company, role, status, interview dates, notes, URLs
- Link CVs to specific applications
- Statistics dashboard: success rate, pipeline overview

### ✅ Smart Todo List
- Create tasks with priorities and due dates
- Link todos to job applications for skill-gap tracking
- **One-click**: create a Roadmap directly from a Todo item

### 🔐 Secure Authentication
- JWT access tokens (15 min) + refresh tokens in httpOnly cookies
- Rate-limited auth endpoints
- bcrypt password hashing (12 rounds)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Vite, Axios |
| **UI / Visualization** | React Flow, Dagre (auto-layout), Vanilla CSS |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas + Mongoose |
| **AI / LLM** | LangChain, Google Gemini 2.5 Flash, OpenRouter (fallback) |
| **Auth** | JWT (access + refresh), bcrypt, httpOnly cookies |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API key — [get one free](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone
git clone https://github.com/MouhammedHoussemAwadi/projet_nuit_ai.git
cd projet_nuit_ai

# 2. Install server dependencies
cd server
npm install

# 3. Configure environment (see Environment Variables below)
cp .env.example .env   # then edit .env

# 4. Install client dependencies
cd ../client
npm install
```

### Run

```bash
# Terminal 1 — Backend
cd server
node index.js          # or: npm run dev (nodemon)

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ⚙️ Environment Variables

**`server/.env`**
```env
# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/unihelp

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173

# AI — Google Gemini (required)
GOOGLE_API_KEY=your_google_ai_studio_key
GOOGLE_API_KEY_BACKUP=your_backup_google_key   # optional but recommended

# AI — OpenRouter (fallback when Google quota is exhausted)
OPENROUTER_API_KEY=sk-or-v1-...
```

**`client/.env`** *(optional)*
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
projet_nuit_ai/
├── client/                    # React 19 frontend (Vite)
│   └── src/
│       ├── api/               # Axios API layer (roadmapService, cvsApi, etc.)
│       ├── components/
│       │   └── roadmap/       # React Flow canvas, custom nodes/edges
│       └── pages/             # RoadmapsPage, ProfilePage, InterviewPrepPage, …
│
├── server/                    # Node.js / Express 5 backend
│   ├── controllers/           # Business logic (roadmapController, cvController, …)
│   ├── models/                # Mongoose schemas (Roadmap, Profile, StudySchedule, …)
│   ├── routes/                # Express routers
│   ├── services/              # LangChain AI chains (9 chains)
│   │   ├── roadmapGeneratorChain.js   # Main AI roadmap generation
│   │   ├── studyScheduleChain.js      # AI study schedule
│   │   ├── cvChain.js                 # CV generation
│   │   ├── cvAutoFillChain.js         # CV auto-fill from job description
│   │   ├── profileCritiqueChain.js    # Profile AI review
│   │   ├── hrInterviewChain.js        # HR mock interview
│   │   ├── technicalInterviewChain.js # Technical quiz
│   │   ├── roadmapNodeChain.js        # Node detail generation
│   │   └── studyScheduleChain.js      # Daily schedule builder
│   └── middleware/            # Auth, rate-limiting
│
└── docs/                      # Full documentation
    ├── API.md
    ├── ARCHITECTURE.md
    ├── COMPONENTS.md
    ├── DATABASE.md
    └── SETUP.md
```

---

## 📚 Documentation

| File | Contents |
|---|---|
| [docs/SETUP.md](./docs/SETUP.md) | Detailed installation & configuration guide |
| [docs/API.md](./docs/API.md) | Complete REST API reference |
| [docs/DATABASE.md](./docs/DATABASE.md) | MongoDB schemas & relationships |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, AI pipeline, patterns |
| [docs/COMPONENTS.md](./docs/COMPONENTS.md) | Frontend component guide |

---

## 🔌 Key API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/refresh` | Refresh JWT |
| `POST` | `/api/auth/logout` | Logout |

### Roadmaps
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/roadmaps/generate` | 🤖 AI generate roadmap |
| `GET` | `/api/roadmaps` | List my roadmaps |
| `GET` | `/api/roadmaps/public/all` | Community roadmaps |
| `POST` | `/api/roadmaps/:id/schedule/generate` | 🤖 AI study schedule |
| `POST` | `/api/roadmaps/:id/nodes/:nodeId/generate` | 🤖 AI node detail |

### CV
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cvs/generate` | 🤖 AI generate CV |
| `POST` | `/api/cvs/autofill` | 🤖 AI auto-fill from job desc |
| `GET` | `/api/cvs` | List CVs |

### Profile, Todos, Job Applications → see [docs/API.md](./docs/API.md)

---

## 🤝 Team

Project developed by students of **ING1** as an academic AI project.

---

## 📝 License

Educational use only.
