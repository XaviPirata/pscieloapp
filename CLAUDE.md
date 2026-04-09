# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📋 Project Overview

**PsCielo** is a comprehensive web system for managing a psychological center with multiple offices and professionals. It's built as a full-stack application handling everything from appointment scheduling with audit trails to automatic commission calculations and integrated communication channels (Gmail, Instagram).

**Stage:** Planning/Pre-Sprint 1 (Infrastructure setup in progress)
**Repository:** https://github.com/XaviPirata/pscieloapp.git
**Documentation:** See `README.md`, `ONBOARDING.md`, and `DEVELOPMENT_PLAN.md` for full context.

---

## 🏗️ Architecture & Stack

### Technology Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion |
| **Backend** | FastAPI + SQLAlchemy ORM + Pydantic |
| **Database** | PostgreSQL 16 with JSONB support |
| **Cache** | Redis 7 |
| **Task Queue** | Celery + Redis |
| **Auth** | JWT with RBAC (Role-Based Access Control) |
| **Deploy** | Docker Compose (local) + Coolify + Traefik (production) |
| **Integrations** | Gmail API (OAuth2), Instagram Graph API |

### Design Patterns
- **Monorepo** structure: `backend/` and `frontend/` folders at root level
- **Type Safety First:** TypeScript (frontend), Pydantic models (backend)
- **Async-first:** FastAPI async endpoints, Celery for background jobs
- **Database Migrations:** Alembic for schema versioning
- **Audit Trails:** Immutable append-only audit logs with user + timestamp
- **RBAC:** Role-based access control with roles: SUPERADMIN, ADMIN, PROFESSIONAL, READONLY
- **Design Aesthetic:** Neumorphism/Soft UI with pastel palette (`#FFD6E0`, `#D6EAF8`, `#EEF2F7`)

### High-Level Architecture
```
┌──────────────────────────────────────┐
│   Browser (Next.js Frontend)         │
│   - Login, Dashboard, Calendars      │
└──────────────┬───────────────────────┘
               │ HTTPS
┌──────────────▼───────────────────────┐
│  Traefik (Reverse Proxy, SSL, LB)    │
└──────────────┬───────────────────────┘
     ┌─────────┴─────────┐
     ▼                   ▼
┌──────────────┐   ┌──────────────┐
│ FastAPI      │   │ Next.js      │
│ Backend      │   │ Frontend     │
│ :8000        │   │ :3000        │
└──────┬───────┘   └──────────────┘
       │ SQLAlchemy
       ▼
┌─────────────────────────────────┐
│  PostgreSQL 16                  │
│  - Users, Professionals, Rooms  │
│  - Availability, Sessions       │
│  - Audit Logs (append-only)     │
│  - Financial Data               │
└─────────────────────────────────┘

Redis (Sessions, Cache, Celery Queue)
Celery Workers (Commission calc, Email tasks)
```

---

## 📂 Monorepo Structure (Planned)

```
pscieloapp/
├── CLAUDE.md                      ← You are here
├── DEVELOPMENT_PLAN.md            ← Full technical plan (phases, sprints, schema)
├── ONBOARDING.md                  ← Quick context + setup checklist
├── README.md                      ← Project summary + quick links
├── docker-compose.yml             ← Local dev stack definition
├── .env.example                   ← Environment variables template
├── .gitignore                     ← Git ignore patterns
│
├── backend/                       ← FastAPI application
│   ├── app/
│   │   ├── main.py               ← FastAPI app initialization
│   │   ├── config.py             ← Config (env, settings)
│   │   ├── models/               ← SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── professional.py
│   │   │   ├── room.py
│   │   │   ├── patient.py
│   │   │   ├── session.py
│   │   │   └── audit_log.py
│   │   ├── schemas/              ← Pydantic request/response models
│   │   ├── api/
│   │   │   ├── auth.py           ← Login, JWT tokens
│   │   │   ├── professionals.py  ← CRUD: professionals
│   │   │   ├── rooms.py          ← CRUD: rooms + rentals
│   │   │   ├── patients.py       ← CRUD: patients
│   │   │   ├── sessions.py       ← CRUD: sessions + availability
│   │   │   ├── commissions.py    ← Commission calculations
│   │   │   └── reports.py        ← Dashboard + analytics
│   │   ├── services/             ← Business logic
│   │   ├── integrations/         ← Gmail, Instagram, etc.
│   │   ├── tasks/                ← Celery async tasks
│   │   └── middleware/           ← Auth, logging, CORS
│   ├── alembic/                  ← Database migrations
│   │   ├── versions/             ← Migration files
│   │   └── env.py
│   ├── tests/                    ← Unit & integration tests
│   ├── requirements.txt           ← Python dependencies
│   ├── Dockerfile                ← Backend container
│   └── .env                      ← Local dev env (gitignored)
│
├── frontend/                      ← Next.js application
│   ├── app/                      ← App Router structure
│   │   ├── layout.tsx            ← Root layout + providers
│   │   ├── page.tsx              ← Home/login page
│   │   ├── login/                ← Login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        ← Dashboard layout + sidebar
│   │   │   ├── page.tsx          ← Dashboard home
│   │   │   ├── professionals/    ← Professionals management
│   │   │   ├── rooms/            ← Rooms management
│   │   │   ├── calendar/         ← Availability calendar
│   │   │   ├── patients/         ← Patient management
│   │   │   ├── sessions/         ← Sessions + history
│   │   │   ├── commissions/      ← Commission tracking
│   │   │   └── reports/          ← Dashboard + analytics
│   │   └── api/                  ← API routes (proxy to backend)
│   ├── components/               ← React components
│   │   ├── layout/               ← Sidebar, header, footer
│   │   ├── forms/                ← Input forms
│   │   ├── tables/               ← Data tables
│   │   ├── modals/               ← Modal dialogs
│   │   └── neumorphism/          ← Neumorphism styled components
│   ├── lib/
│   │   ├── api.ts                ← Axios client + interceptors
│   │   ├── auth.ts               ← JWT token management
│   │   └── utils.ts              ← Helpers
│   ├── hooks/                    ← Custom React hooks
│   ├── styles/
│   │   ├── globals.css           ← Tailwind + neumorphism theme
│   │   └── variables.css         ← CSS variables (colors, spacing)
│   ├── public/                   ← Static assets
│   ├── package.json              ← Node dependencies
│   ├── tsconfig.json             ← TypeScript config
│   ├── tailwind.config.ts        ← Tailwind + neumorphism setup
│   ├── next.config.js            ← Next.js config
│   ├── Dockerfile                ← Frontend container
│   └── .env.local                ← Local dev env (gitignored)
│
└── docs/                         ← Additional documentation (future)
    ├── API.md                    ← API endpoint reference
    └── DATABASE.md               ← Database schema details
```

---

## 🚀 Development Workflow

### Initial Setup (First Time)

```bash
# Clone and enter repo
git clone https://github.com/XaviPirata/pscieloapp.git
cd pscieloapp

# Read documentation in order
cat DEVELOPMENT_PLAN.md     # Full technical plan
cat ONBOARDING.md          # Quick context
```

### Backend Development (FastAPI)

**Coming in Sprint 1-2.** When backend is initialized:

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate        # or: venv\Scripts\activate on Windows
pip install -r requirements.txt

# Environment
cp .env.example .env
# Edit .env with local values

# Run server (dev mode with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/
pytest tests/test_auth.py -v                    # Single test file
pytest tests/ -k "commission" -v                # Tests matching pattern

# Database migrations
alembic upgrade head                             # Apply latest migrations
alembic downgrade -1                             # Rollback one migration
alembic revision --autogenerate -m "add users"  # Create new migration

# Lint & format
black app/                                       # Format code
isort app/                                       # Sort imports
flake8 app/                                      # Style check
```

### Frontend Development (Next.js)

**Coming in Sprint 3.** When frontend is initialized:

```bash
# Frontend setup
cd frontend
npm install

# Environment
cp .env.example .env.local
# Edit .env.local with API base URL

# Run dev server (with hot reload)
npm run dev

# Open http://localhost:3000

# Build for production
npm run build
npm start                                        # Run production build

# Tests (when added)
npm run test                                     # Run Jest tests
npm run test:watch                               # Watch mode

# Lint & format
npm run lint                                     # Next.js eslint
npx prettier --write app/                        # Format code
```

### Full Stack Local Development (Docker Compose)

**Coming in Sprint 1.** When `docker-compose.yml` is ready:

```bash
# Start all services (postgres, redis, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f backend                  # Backend logs
docker-compose logs -f frontend                 # Frontend logs
docker-compose logs -f postgres                 # Database logs

# Stop everything
docker-compose down

# Reset database (⚠️ deletes data)
docker-compose down -v
docker-compose up -d

# Run migrations inside container
docker-compose exec backend alembic upgrade head

# Access database
docker-compose exec postgres psql -U pscielo -d pscielo_dev
```

### Common Git Workflow

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/add-professional-crud

# Make changes, commit
git add .
git commit -m "feat: add professional CRUD endpoints"

# Push and create PR
git push origin feature/add-professional-crud
# Then create PR on GitHub

# After PR merge, sync local main
git checkout main
git pull origin main
```

---

## 🔑 Key Design Decisions

### 1. Monorepo with Docker Compose
- **Why:** Keeps backend + frontend tightly versioned. Simplifies local dev (one `docker-compose up`).
- **Trade-off:** Slightly more complex repo structure, but standard for full-stack apps.

### 2. FastAPI over Django
- **Why:** Async-native (handles concurrent requests), modern Python, auto-docs with Swagger, lightweight.
- **Trade-off:** Less batteries-included than Django, but Celery makes it complete.

### 3. Next.js App Router (not Pages Router)
- **Why:** Modern, better for file-based routing, Server Components for reduced JS bundle.
- **Trade-off:** Still relatively new (2022), some community patterns still evolving.

### 4. Neumorphism Design System
- **Why:** Professional, modern, differentiates from generic admin panels. Pastel palette matches psychological/wellness space.
- **Critical:** No stock shadcn components — custom Tailwind components only. Every UI must feel intentional.

### 5. PostgreSQL + SQLAlchemy (not NoSQL)
- **Why:** Audit logs need ACID guarantees. Commission calculations need transactions. JSONB for flexibility where needed.
- **Trade-off:** Requires schema planning, but fits domain perfectly.

### 6. JWT Authentication (not OAuth in MVP)
- **Why:** Simple, stateless, works well with microservices later. Refresh tokens reduce access token exposure.
- **Future:** Add OAuth2 for third-party integrations (Gmail, Instagram already use it).

### 7. Celery for Background Jobs
- **Why:** Commission calculations, email sends, and report generation must be async and reliable.
- **Critical:** All Celery tasks must be idempotent (safe to retry).

---

## 🎯 Code Quality Standards

### Backend (Python)
- **Type hints:** All function signatures must have type hints (Pydantic or standard library types).
- **Models:** Use SQLAlchemy declarative models with relationships properly defined.
- **Validation:** Pydantic schemas for all request/response bodies (auto-validation, auto-docs).
- **Error handling:** Custom exception classes, not generic raises. HTTP status codes must be correct.
- **Async:** Use async/await consistently. No blocking I/O in async handlers.
- **Tests:** Minimum 80% coverage for business logic (services, models). Integration tests for API endpoints.

### Frontend (TypeScript)
- **Type safety:** Strict mode enabled. No `any` types except explicit escape hatches.
- **Components:** Functional components with hooks. Props must be typed with interfaces.
- **Server vs Client:** Mark components `'use client'` explicitly. Prefer Server Components when possible.
- **Styling:** Tailwind classes only. No inline styles. Use CSS variables for theme values.
- **Accessibility:** ARIA labels, semantic HTML, keyboard navigation for all interactive elements.
- **Performance:** Image optimization (next/image), code splitting, lazy loading modals.

### Database
- **Migrations:** Every schema change must have an Alembic migration. Never modify production schema manually.
- **Naming:** Tables singular (`user`, not `users`), snake_case columns.
- **Audit:** All data-affecting tables include `created_at`, `updated_at`, `created_by` fields.
- **Indexes:** Foreign keys are indexed. High-cardinality WHERE clauses have indexes.

---

## 📊 Database Overview (Preliminary)

Core tables planned (see `DEVELOPMENT_PLAN.md` for full schema):

- **user** — System users (superadmin, admin, professionals, readonly)
- **professional** — Psychologists/therapists (matrices, specialties, hourly rates)
- **room** — Office spaces (4 rooms planned)
- **room_rental** — Fixed monthly rentals per professional
- **patient** — Client records (contact, history, referral source)
- **session** — Appointment records (date, duration, professional, patient, attended)
- **availability** — Professional availability calendar (weekly templates + overrides)
- **audit_log** — Immutable log of all changes (user, action, timestamp, before/after)
- **commission** — Weekly commission summaries (calculated, auditable)
- **income_record** — Revenue from rentals + commissions
- **expense_record** — Operating costs (minimal for MVP)

---

## 🔐 Authentication & Authorization

- **Login:** Email + password → JWT access + refresh tokens
- **JWT:** Access token (15 min), refresh token (7 days) in httpOnly cookies
- **RBAC Roles:**
  - **SUPERADMIN:** All access + system configuration
  - **ADMIN:** Day-to-day operations (exclude critical config)
  - **PROFESSIONAL:** Own calendar, own patients, own commissions
  - **READONLY:** Reports only (for external accountant)
- **API Protection:** All endpoints require valid JWT. Role checks in endpoint decorators.

---

## 🔗 Integration Points

### Gmail API
- **Purpose:** Monitor incoming consultation requests, send appointment confirmations
- **Method:** OAuth2 (user grants permission, no password stored)
- **Status:** Phase 2 (after core backend stable)

### Instagram Graph API
- **Purpose:** Monitor DMs, auto-respond with availability/booking info
- **Status:** Phase 3 (architecture-ready, not activated in MVP)

### Coolify Deployment
- **What:** VPS platform for automated Docker deployments
- **Trigger:** Push to `main` branch → Coolify auto-builds + deploys
- **Config:** Env vars, domain, SSL managed in Coolify UI (not code)

---

## 📝 Documentation References

- **`DEVELOPMENT_PLAN.md`** — Full technical specification (architecture, DB schema, sprint plan)
- **`ONBOARDING.md`** — Quick context + setup checklist for new developers
- **`README.md`** — Project summary + links
- **API Docs (future)** — Generated by Swagger at `/api/docs` (FastAPI auto-docs)
- **DB Docs (future)** — Alembic auto-generates from migrations

---

## 🚨 Common Pitfalls & How to Avoid Them

### 1. Forgetting Audit Logs
Every data-affecting endpoint must log the change (user, timestamp, what changed). Use a middleware or decorator.

### 2. Mixing Frontend & Backend Concerns
Next.js API routes are for *proxy only* (calling backend). Business logic goes in FastAPI. Frontend does UI state management.

### 3. Celery Task Failures Go Silent
Always set Celery task retry policies + failure callbacks. Log failures explicitly.

### 4. Commission Calculation Race Conditions
Weekly commission calc is a critical operation. Use database transactions (Celery task → DB transaction) to prevent double-counting.

### 5. Styling Inconsistency
Use Tailwind config to enforce the neumorphism design system. Don't let developers freestyle CSS.

### 6. JWT Token Expiry Surprises
Access tokens are short (15 min). Frontend must handle refresh transparently (interceptor). Refresh tokens are longer (7 days) but still expire.

### 7. Skipping Migrations
Every schema change must have an Alembic migration. Never execute raw SQL in production. Migrations enable rollback.

---

## 📞 Questions?

Refer to:
1. **For architecture/stack decisions:** See `DEVELOPMENT_PLAN.md` § "Stack Tecnológico" & "Decisiones de Diseño"
2. **For getting started:** See `ONBOARDING.md` § "Cómo Continuar"
3. **For current status:** Check recent commits and open issues on GitHub

---

*Last updated: April 8, 2026*
