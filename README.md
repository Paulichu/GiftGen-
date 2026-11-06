# Emergent Studio (app.emergent.sh Clone)

An open-source, full-stack AI App Builder platform inspired by **Emergent** (`app.emergent.sh`). Unlike closed platforms with restrictive paywalls, **Emergent Studio operates completely free without mandatory top-ups or paywalls**.

![Emergent Studio Preview](frontend_verify.png)

---

## ⚡ Key Highlights & Architecture

Emergent Studio orchestrates a sequential multi-agent AI pipeline that designs, architectures, and writes clean, production-ready full-stack applications directly from high-level natural language prompts:

1. **Architect Agent**: Synthesizes specifications, generates blueprints, and automatically prompts clarifying questions for ambiguous requests.
2. **Designer Agent**: Produces cohesive Tailwind CSS themes, UI components, and accessible dark-mode color tokens.
3. **Developer Agent**: Emits full Next.js 14 frontend files, FastAPI backend services, and SQL/MongoDB database schemas.
4. **Integration Agent**: Configures authentication (JWT), third-party webhooks, and Stripe billing stubs.
5. **Project Manager Agent**: Validates build integrity, executes linting checks, and creates deterministic version snapshots.

---

## 🚀 Repository Structure

```tree
.
├── backend/                   # FastAPI backend service
│   ├── app/
│   │   ├── models/            # Pydantic schemas (auth, project, version, deploy)
│   │   ├── routers/           # API routes (auth, projects, versions, generation, stats)
│   │   ├── services/          # Multi-agent sequential pipeline & blueprint logic
│   │   ├── auth.py            # JWT token creation and bcrypt password verification
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # Motor async MongoDB client with mongomock fallback
│   │   └── main.py            # FastAPI ASGI entrypoint with CORS
│   ├── tests/                 # Pytest test suite
│   ├── Dockerfile             # Backend container image
│   └── requirements.txt       # Python dependencies
├── frontend/                  # Next.js 14 frontend application
│   ├── src/
│   │   ├── app/               # Next.js App Router (Landing `/` and Builder `/builder`)
│   │   ├── components/        # Auth modal, live sandbox preview, code inspector
│   │   └── lib/               # API client and utility helpers
│   ├── Dockerfile             # Frontend container image
│   ├── package.json           # Next.js, React, Tailwind CSS, Lucide dependencies
│   └── tailwind.config.ts     # Dark theme aesthetic configuration
├── docker-compose.yml         # 1-command deployment with MongoDB, Backend, and Frontend
├── .env.example               # Template environment configuration
└── README.md                  # System documentation
```

---

## 🛠️ Getting Started

### Option 1: Docker Compose (Recommended)

Run all services (MongoDB, FastAPI backend, and Next.js frontend) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **MongoDB**: `localhost:27017`

---

### Option 2: Local Development Setup

#### 1. Backend Setup

Prerequisites: Python 3.10+ (and optionally MongoDB running on `mongodb://localhost:27017/emergent_studio` — if MongoDB is not present, backend automatically uses memory-safe `mongomock-motor` for isolated zero-setup execution).

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup

Prerequisites: Node.js 18+ and npm / bun.

```bash
cd frontend
npm install

# Start the Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the landing page and builder studio.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` or configure the variables in your hosting provider:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `SECRET_KEY` | Secret key for signing JWT tokens | `super-secret-emergent-studio-key` |
| `ALGORITHM` | Algorithm for token signatures | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session expiration in minutes | `1440` (24h) |
| `MONGODB_URL` | MongoDB connection URL | `mongodb://localhost:27017/emergent_studio` |
| `DB_NAME` | Database name | `emergent_studio` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `*` |
| `NEXT_PUBLIC_API_URL` | Frontend URL to Backend API | `http://localhost:8000` |

---

## 🌐 Cloud Deployment Guide

### Frontend on Vercel
1. Link your Git repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set Environment Variable `NEXT_PUBLIC_API_URL` pointing to your deployed backend domain.
4. Deploy!

### Backend on Railway / Render / Fly.io
1. Deploy from the `backend/` directory or use `backend/Dockerfile`.
2. Add a hosted MongoDB service (e.g., [MongoDB Atlas](https://www.mongodb.com/atlas)).
3. Provide `MONGODB_URL`, `SECRET_KEY`, and `CORS_ORIGINS` in your environment settings.
4. Port `8000` is exposed by default.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Build Verification
```bash
cd frontend
npm run build
```

---

## 📄 License
MIT License. Open source, free forever, no top-ups required.
