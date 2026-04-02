# CareerPilot 🚀

> **"You sleep. CareerPilot hunts."** — Your autonomous, AI-powered job-hunting teammate.

CareerPilot is a fully autonomous, multi-agent AI system that treats job hunting as a **continuous feedback loop**. Five specialized AI agents work 24/7 — scouting jobs, analyzing fit, tailoring resumes, coaching interviews, and reporting progress.

## ✨ Features

- **🔍 Scout Agent**: Autonomously discovers jobs from 10+ sources (Remotive, Himalayas, HN Who's Hiring)
- **📊 Analyzer Agent**: 3-dimension scoring (Skills, Culture, Trajectory) + hidden requirement detection
- **✍️ Writer Agent**: Generates structurally unique resumes and cover letters for each application
- **🎯 Coach Agent**: Company-specific interview prep (OA, coding, behavioral) with weakness tracking
- **📬 Reporter Agent**: Daily intelligence briefings with actionable insights

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS FRONTEND (React 19)                    │
│   Dashboard • Jobs • Applications • Interview • Analytics   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           FASTAPI BACKEND (Python)                          │
│              LangGraph Orchestrator                         │
│   Scout → Analyzer → Writer → Reporter (+ Coach on-demand)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│    GOOGLE GEMINI API    │    SUPABASE    │    RESEND       │
│    (AI Functions)       │   (Database)   │   (Email)       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account (for database)
- Google Gemini API key

### 1. Clone and Install Frontend

```bash
cd agento
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the environment files and add your keys:

```bash
# Frontend (.env.local)
cp .env.sample .env.local

# Backend (.env)
cp backend/.env.example backend/.env
```

Required environment variables:

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
NEXT_PUBLIC_AGENT_API_URL=http://localhost:8000
AGENT_API_URL=http://localhost:8000
```

**Backend (`backend/.env`):**
```env
GOOGLE_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
RESEND_API_KEY=your_resend_api_key  # Optional: for email digests
```

### 4. Start the Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
agento/
├── app/                      # Next.js 15 App Router
│   ├── (auth)/               # Auth pages (login, onboarding)
│   ├── (dashboard)/          # Main app pages
│   │   ├── dashboard/        # Command center
│   │   ├── jobs/             # Job discovery
│   │   ├── applications/     # Application tracking
│   │   ├── interview/        # Interview prep
│   │   ├── resumes/          # Resume vault
│   │   ├── analytics/        # Analytics dashboard
│   │   └── settings/         # User settings
│   └── api/                  # API routes
│       └── agents/           # Agent workflow endpoints
├── backend/                  # Python agent backend
│   ├── agents/               # LangGraph agents
│   │   ├── orchestrator.py   # Main workflow graph
│   │   ├── scout.py          # Job discovery
│   │   ├── analyzer.py       # Scoring & analysis
│   │   ├── writer.py         # Resume/cover letter
│   │   ├── coach.py          # Interview prep
│   │   └── reporter.py       # Daily digest
│   ├── tools/                # Agent tools
│   │   ├── job_scrapers.py   # Job board scrapers
│   │   └── company_research.py
│   ├── state/                # State schemas
│   │   └── schemas.py        # Pydantic models
│   └── main.py               # FastAPI app
├── components/               # React components
│   └── ui/                   # UI components
├── lib/                      # Utilities
│   └── agent-api.ts          # Agent API client
├── types/                    # TypeScript types
│   └── agents.ts             # Agent type definitions
└── data/                     # Mock data
```

## 🤖 Agent Workflow

The main workflow runs automatically and follows this flow:

```
User Profile → Scout → Analyzer → Writer → Reporter
                          ↓
              (High-match jobs trigger Writer)
```

**Scout Agent** (Every 6 hours):
- Scrapes Remotive, Himalayas, HN Who's Hiring
- Deduplicates and filters by preferences
- Marks fresh jobs (< 24 hours)

**Analyzer Agent** (After Scout):
- Scores each job on Skills (0-100), Culture (0-100), Trajectory (0-100)
- Detects hidden requirements
- Generates AI reasoning for rankings

**Writer Agent** (For top matches):
- Determines optimal framing strategy
- Generates tailored resume
- Drafts personalized cover letter

**Coach Agent** (On-demand):
- Creates company-specific interview questions
- Runs OA/coding/behavioral simulations
- Tracks weaknesses and generates study plans

**Reporter Agent** (Daily):
- Compiles daily intelligence briefing
- Sends email digest via Resend

## 🛠️ API Endpoints

### Agent Workflow

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agents/run` | Start agent workflow |
| GET | `/api/agents/status/{runId}` | Get run status |
| GET | `/api/agents/events/{runId}` | SSE stream of events |

### Interview Prep

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/start` | Start interview session |
| POST | `/api/interview/{sessionId}/evaluate` | Evaluate behavioral answer |

## 🎨 Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TailwindCSS 4
- Framer Motion
- TypeScript

**Backend:**
- FastAPI
- LangGraph
- Google Gemini API
- Pydantic

**Database:**
- Supabase (PostgreSQL)

**Email:**
- Resend

## 📝 License

MIT

---

Built with ❤️ by CareerPilot — Because your next job shouldn't cost you your sanity.
