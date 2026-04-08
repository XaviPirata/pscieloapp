# PsCielo - Plan de Desarrollo Integral

**Fecha de inicio:** 8 de Abril de 2026  
**Repo:** https://github.com/XaviPirata/pscieloapp.git  
**Dominio:** pscielo.com  
**Infraestructura:** VPS Hostinger (Ubuntu 24.04 LTS, 8GB RAM, KVM 2)  

---

## 📋 Índice

1. [Contexto y Alcance](#contexto-y-alcance)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Esquema de Base de Datos](#esquema-de-base-de-datos)
5. [Fases de Desarrollo](#fases-de-desarrollo)
6. [Estructura del Monorepo](#estructura-del-monorepo)
7. [Plan por Sprint](#plan-por-sprint)
8. [Decisiones de Diseño](#decisiones-de-diseño)
9. [Checklist de Infraestructura](#checklist-de-infraestructura)

---

## Contexto y Alcance

### El Problema Hoy
PsCielo es un centro psicológico con **4 consultorios** y **~15 profesionales**. Actualmente se gestiona con Excel manual:

- ❌ Sin auditoría de cambios en calendarios
- ❌ Cambios constantes sin trazabilidad (profesionales borran pacientes)
- ❌ Cálculo manual de comisiones semanales
- ❌ Sin historial de pacientes
- ❌ Sin análisis de rentabilidad real
- ❌ Escalabilidad imposible con Excel

### La Solución: Sistema de Gestión Integral

Un **sistema web profesional, modular y escalable** que centralice:

✅ Gestión de profesionales (datos completos con matrículas, especialidades, etc.)  
✅ Gestión de 4 consultorios con alquileres fijos y disponibilidad en tiempo real  
✅ Calendario de disponibilidad con **auditoría inmutable** de cambios  
✅ Derivación de pacientes a profesionales  
✅ Registro de sesiones y asistencia  
✅ **Cálculo automático de comisiones semanales**  
✅ Integración con Gmail e Instagram (canales de consulta)  
✅ Dashboard ejecutivo con P&L mensual  
✅ 100% cloud — accesible desde cualquier PC  

### Modelos de Negocio Soportados

| Modelo | Descripción | Ejemplo |
|--------|-------------|---------|
| **Alquiler fijo** | Profesional paga turno mensual | "Carla alquila jueves mañana C1 = $120k/mes" |
| **Comisión** | PsCielo deriva pacientes, profesional paga % | "Andrea recibe 1 sesión ($40k) → PsCielo gana $15k" |
| **Mixto** | Ambos | "Mauricio alquila + recibe derivaciones" |

### Usuarios Finales

| Rol | Usuario | Acceso |
|-----|---------|--------|
| **SUPERADMIN** | Dueña | Todo + configuración del sistema |
| **ADMIN** | Vos (gestor diario) | Operación completa, sin config crítica |
| **PROFESSIONAL** | Profesionales con derivación | Solo su agenda, sus pacientes, sus comisiones |
| **READONLY** | Contador externo (futuro) | Solo reportes |

---

## Stack Tecnológico

### Backend
- **Framework:** FastAPI (Python)
  - Async/await nativo
  - Documentación automática (Swagger en `/api/docs`)
  - Validación de datos con Pydantic
  - Performance ~10k req/s
  
- **Base de datos:** PostgreSQL 16
  - JSONB para datos flexibles (social_links, amenities)
  - Extensiones: uuid-ossp, pg_trgm (búsquedas)
  - Backups automáticos via pg_dump
  
- **ORM:** SQLAlchemy 2.0
  - Modelos declarativos
  - Relaciones automáticas
  - Query builder type-safe
  
- **Migraciones:** Alembic
  - Versionado de cambios en BD
  - Rollback seguro

### Frontend
- **Framework:** Next.js 14 (App Router)
  - SSR para SEO
  - API Routes para proxy
  - Incremental Static Regeneration
  
- **Styling:** Tailwind CSS 3 + customización Neumorphism
  - Paleta pastel: `#EEF2F7`, `#FFD6E0`, `#D6EAF8`, `#FFF9C4`
  - Componentes propios (no shadcn stock)
  - Sombras suaves tipo Neumorphism
  
- **Animaciones:** Framer Motion
  - Transiciones en navegación
  - Microinteracciones en botones/modales
  
- **Tipado:** TypeScript
  - Type-safe props
  - Auto-complete en IDE
  
- **HTTP Client:** Axios + custom hooks
  - Interceptores para JWT
  - Retry automático

### Cache & Tareas Async
- **Cache:** Redis 7
  - Sesiones de usuario
  - Rate limiting
  - Invalidación de caché de disponibilidad
  
- **Queue:** Celery + Redis
  - Tareas async: cálculo de comisiones, envío de emails
  - Scheduled tasks: recordatorios semanales, pg_dump

### Auth
- **Método:** JWT (JSON Web Tokens)
  - Access token (15 min)
  - Refresh token (7 días)
  - Almacenado en secure httpOnly cookie
  
- **Hash:** bcrypt con salt
- **RBAC:** Role-Based Access Control integrado

### Integraciones Externas
- **Gmail API**
  - OAuth2 (sin guardar password)
  - Lectura de DMs entrantes
  - Envío de emails transaccionales
  
- **Instagram Graph API** (Fase 4)
  - Lectura de DMs
  - Respuestas automáticas
  
- **WhatsApp API** (Arquitectado, sin activar MVP)
  - Twilio ready
  - Bot para disponibilidad y recordatorios

### Deploy & Infraestructura
- **Containerización:** Docker
  - imagen alpine base (pequeña, segura)
  - Multi-stage builds
  
- **Orquestación:** Docker Compose (no K8s, overkill)
  - desarrollo local = producción
  
- **Deployment:** Coolify
  - GitHub integration (autodeploy en cada push)
  - SSL automático via Traefik
  - Gestión de variables de entorno
  
- **Proxy:** Traefik
  - Balanceo entre backend/frontend
  - SSL/TLS automático
  
- **Almacenamiento:** MinIO (S3-compatible)
  - Fotos de profesionales
  - Documentos (matrículas)
  - Backups incrementales

---

## Arquitectura del Sistema

### Diagrama de Capas

```
┌─────────────────────────────────────────────┐
│           BROWSER (Cliente)                 │
│  Next.js Frontend (Neumorphism UI)         │
└────────────────┬────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────┐
│         TRAEFIK (Proxy/LB)                 │
└────────────────┬────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼──────┐        ┌─────▼──────┐
│ FastAPI    │        │  Next.js   │
│ Backend    │        │  Frontend  │
│ :8000      │        │  :3000     │
└─────┬──────┘        └────────────┘
      │
      │ SQLAlchemy ORM
      │
┌─────▼──────────────────────────────┐
│      PostgreSQL 16                 │
│  - Users, Professionals, Rooms     │
│  - Availability, Sessions          │
│  - Audit Logs (append-only)        │
└────────────────────────────────────┘

Servicios Complementarios:
├─ Redis → sesiones, cache, rate limiting
├─ Celery Worker → tareas async (emails, comisiones)
├─ MinIO → almacenamiento S3
└─ Scheduler (cron) → backups, tareas programadas
```

### Flujos de Datos Principales

**1. Autenticación:**
```
User → Login (email/pwd) → FastAPI ─(bcrypt verify)→ DB
                              ↓
                          JWT (access + refresh)
                              ↓
                          Cookie httpOnly
                              ↓
                          Next.js (axios interceptor)
```

**2. Derivación de Paciente:**
```
Admin: "Derivar paciente X a Andrea, miércoles 16:30"
    ↓
FastAPI /referrals POST → valida disponibilidad Andrea
    ↓ (si OK)
Crea referral + notificación interna
    ↓ (Celery task)
Envía email a Andrea: "Nueva derivación"
    ↓
Webhook opcional: notifica Instagram/WhatsApp
```

**3. Cálculo Automático de Comisiones:**
```
Cada viernes 23:59 (Celery beat)
    ↓
Task: "calcula comisiones semana"
    ↓
SELECT sessions WHERE week = ? AND professional_id = ?
    ↓
SUM(sesiones * $15k) + SUM(evaluaciones * $22k)
    ↓
Crea weekly_commission_summary
    ↓
Email a Andrea: "Semana X: 7 sesiones = $105k"
    ↓
Dashboard Admin actualiza automáticamente
```

---

## Esquema de Base de Datos

### Módulo: Autenticación & Usuarios

```sql
TABLE users
├─ id (UUID, PK)
├─ email (VARCHAR, UNIQUE)
├─ password_hash (VARCHAR)
├─ role (ENUM: SUPERADMIN | ADMIN | PROFESSIONAL | READONLY)
├─ is_active (BOOL)
├─ last_login (TIMESTAMP)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)

TABLE notifications
├─ id (UUID, PK)
├─ user_id (FK → users)
├─ type (VARCHAR: new_referral | payment_due | availability_changed)
├─ title (VARCHAR)
├─ body (TEXT)
├─ reference_type (VARCHAR: professional | session | payment)
├─ reference_id (UUID)
├─ is_read (BOOL)
└─ created_at (TIMESTAMP)

TABLE audit_logs (APPEND-ONLY)
├─ id (BIGINT, PK) — nunca se modifica
├─ user_id (FK → users, nullable)
├─ action (ENUM: CREATE | UPDATE | DELETE)
├─ entity_type (VARCHAR: professional | session | etc)
├─ entity_id (UUID)
├─ old_value (JSONB, nullable)
├─ new_value (JSONB)
├─ ip_address (INET)
├─ timestamp (TIMESTAMP, no UPDATE)
└─ INDEX en (entity_type, entity_id, timestamp)
```

### Módulo: Profesionales

```sql
TABLE professionals
├─ id (UUID, PK)
├─ user_id (FK → users, nullable) — algunos sin acceso al sistema
├─ first_name (VARCHAR)
├─ last_name (VARCHAR)
├─ dni (VARCHAR, UNIQUE)
├─ license_number (VARCHAR, UNIQUE)
├─ phone (VARCHAR)
├─ email (VARCHAR)
├─ specialty (VARCHAR) — "Psicología Clínica", "Gestalt", etc.
├─ bio (TEXT)
├─ work_modality (ENUM: PRESENTIAL | ONLINE | HYBRID)
├─ social_links (JSONB) — {"instagram": "...", "linkedin": "..."}
├─ profile_photo_url (VARCHAR)
├─ allows_marketing (BOOL) — para difusión en redes
├─ contract_type (ENUM: RENTAL | COMMISSION | BOTH)
├─ commission_rate_session (DECIMAL, default 0.375) — 37.5% de $40k = $15k
├─ commission_rate_evaluation (DECIMAL, default 0.367) — 36.7% de $60k = $22k
├─ is_active (BOOL)
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
└─ archived_at (TIMESTAMP, nullable) — soft delete
```

### Módulo: Consultorios

```sql
TABLE rooms
├─ id (INT: 1-4, PK)
├─ name (VARCHAR) — "Consultorio 1", etc.
├─ description (TEXT)
├─ floor (INT)
├─ amenities (JSONB) — {"wifi": true, "whiteboard": true}
├─ is_active (BOOL)
└─ created_at (TIMESTAMP)

TABLE room_rentals (alquileres fijos mensuales)
├─ id (UUID, PK)
├─ room_id (FK → rooms)
├─ professional_id (FK → professionals)
├─ shift (ENUM: MORNING | AFTERNOON) — 8-14 o 14-20
├─ day_of_week (ENUM: MON | TUE | WED | THU | FRI | SAT | SUN)
├─ monthly_price (DECIMAL) — 120000
├─ currency (VARCHAR, default "ARS")
├─ start_date (DATE)
├─ end_date (DATE, nullable) — NULL = indefinido
├─ status (ENUM: ACTIVE | PAUSED | CANCELLED)
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
└─ UNIQUE (room_id, shift, day_of_week, start_date)

TABLE room_blocks (bloqueos puntuales)
├─ id (UUID, PK)
├─ room_id (FK → rooms)
├─ start_datetime (TIMESTAMP)
├─ end_datetime (TIMESTAMP)
├─ reason (VARCHAR) — "Mantenimiento", "Feriado", etc.
└─ created_at (TIMESTAMP)
```

### Módulo: Disponibilidad

```sql
TABLE professional_availability
├─ id (UUID, PK)
├─ professional_id (FK → professionals)
├─ day_of_week (ENUM: MON | TUE | WED | THU | FRI | SAT | SUN)
├─ start_time (TIME) — "08:00"
├─ end_time (TIME) — "20:00"
├─ is_available (BOOL, default true)
├─ reason_if_not (TEXT, nullable) — "No trabajo este día"
└─ created_at (TIMESTAMP)

TABLE availability_exceptions (cambios puntuales)
├─ id (UUID, PK)
├─ professional_id (FK → professionals)
├─ date (DATE)
├─ start_time (TIME)
├─ end_time (TIME)
├─ is_available (BOOL)
├─ reason (VARCHAR) — "Enfermo", "Vacaciones", etc.
├─ created_at (TIMESTAMP) ← auditoría: cuándo cambió
└─ created_by (FK → users) ← auditoría: quién lo cambió
```

### Módulo: Pacientes

```sql
TABLE patients
├─ id (UUID, PK)
├─ first_name (VARCHAR)
├─ last_name (VARCHAR)
├─ dni (VARCHAR)
├─ phone (VARCHAR)
├─ email (VARCHAR)
├─ birth_date (DATE, nullable)
├─ gender (ENUM: M | F | OTHER, nullable)
├─ referred_by (VARCHAR) — "Instagram", "WhatsApp", "Derivación profesional", etc.
├─ intake_date (DATE)
├─ status (ENUM: ACTIVE | INACTIVE | DISCHARGED)
├─ notes (TEXT) — motivo de consulta, observaciones iniciales
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
└─ archived_at (TIMESTAMP, nullable) — soft delete
```

### Módulo: Derivaciones & Sesiones

```sql
TABLE referrals (cada derivación)
├─ id (UUID, PK)
├─ patient_id (FK → patients)
├─ professional_id (FK → professionals)
├─ room_id (FK → rooms)
├─ assigned_date (DATE)
├─ assigned_time (TIME)
├─ referral_type (ENUM: SESSION | EVALUATION)
├─ status (ENUM: PENDING | CONFIRMED | CANCELLED | COMPLETED)
├─ cancellation_reason (VARCHAR, nullable)
├─ cancelled_at (TIMESTAMP, nullable)
├─ notes (TEXT)
├─ created_by (FK → users)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)

TABLE sessions (sesión efectivamente realizada)
├─ id (UUID, PK)
├─ referral_id (FK → referrals)
├─ patient_id (FK → patients)
├─ professional_id (FK → professionals)
├─ room_id (FK → rooms)
├─ scheduled_date (DATE)
├─ scheduled_time (TIME)
├─ session_type (ENUM: SESSION | EVALUATION)
├─ attendance_status (ENUM: ATTENDED | CANCELLED | NO_SHOW)
├─ amount_charged (DECIMAL) — lo que pagó el paciente (40000 o 60000)
├─ pscielo_commission (DECIMAL) — calculado auto (15000 o 22000)
├─ payment_status (ENUM: PENDING | PAID)
├─ week_number (INT)
├─ year (INT)
├─ notes (TEXT)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

### Módulo: Comisiones & Finanzas

```sql
TABLE weekly_commission_summaries (resumen automático)
├─ id (UUID, PK)
├─ professional_id (FK → professionals)
├─ week_number (INT)
├─ year (INT)
├─ total_sessions (INT)
├─ total_evaluations (INT)
├─ total_amount_charged (DECIMAL)
├─ total_commission (DECIMAL) — SUM(pscielo_commission)
├─ status (ENUM: PENDING | INVOICED | PAID)
├─ paid_at (TIMESTAMP, nullable)
├─ payment_method (VARCHAR, nullable) — "Transferencia", "Efectivo"
├─ created_at (TIMESTAMP)
└─ UNIQUE (professional_id, week_number, year)

TABLE income_records (ingresos reales)
├─ id (UUID, PK)
├─ type (ENUM: RENTAL | COMMISSION)
├─ reference_id (UUID) — FK a room_rental o weekly_commission_summary
├─ professional_id (FK → professionals)
├─ amount (DECIMAL)
├─ currency (VARCHAR, default "ARS")
├─ received_date (DATE)
├─ payment_method (VARCHAR) — "Transferencia", "Efectivo"
├─ notes (TEXT)
└─ created_at (TIMESTAMP)

TABLE expenses
├─ id (UUID, PK)
├─ category (ENUM: RENT | ELECTRICITY | GAS | SUPPLIES | OTHER)
├─ amount (DECIMAL)
├─ currency (VARCHAR, default "ARS")
├─ expense_date (DATE)
├─ description (VARCHAR)
├─ receipt_url (VARCHAR, nullable)
├─ is_recurring (BOOL)
├─ recurrence (ENUM: MONTHLY | QUARTERLY | YEARLY, nullable)
├─ created_by (FK → users)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

---

## Fases de Desarrollo

### FASE 1: MVP - Core System (4 semanas)

**Objetivo:** Sistema funcional con gestión básica y dashboard.

**Incluye:**
- ✅ Autenticación JWT (login, logout, refresh)
- ✅ CRUD Profesionales (datos del formulario)
- ✅ CRUD Consultorios + alquileres fijos
- ✅ Gestión de disponibilidad con excepciones + auditoría
- ✅ CRUD Pacientes
- ✅ Módulo Derivaciones (asignar paciente → profesional → consultorio)
- ✅ Módulo Sesiones (registrar asistencia/cancelación)
- ✅ Cálculo automático de comisiones (Celery)
- ✅ Sistema de notificaciones internas (DB)
- ✅ Dashboard Admin (vista general del día, pendientes)
- ✅ Primer deploy en Coolify con SSL activo

**Entregables:**
- Backend API completa documentada (Swagger)
- Frontend responsive con Neumorphism básico
- BD poblada con datos iniciales
- App corriendo en VPS con tu dominio

---

### FASE 2: Financiero & Reportes (2 semanas)

**Objetivo:** Análisis completo de rentabilidad.

**Incluye:**
- ✅ Módulo Alquileres (facturación mensual, cobros)
- ✅ Módulo Gastos (registro y categorización)
- ✅ Reportes P&L mensual (ingresos - gastos = ganancia)
- ✅ Exportación PDF para dueña
- ✅ Gráficos de rentabilidad por consultorio, por profesional
- ✅ Setup de backups automáticos (pg_dump diario)

**Entregables:**
- Dashboard financiero con gráficos
- Reporte mensual en PDF descargable
- Histórico de ingresos/gastos

---

### FASE 3: Escalabilidad & Profesionales (2 semanas)

**Objetivo:** Que profesionales gestionen su propia agenda.

**Incluye:**
- ✅ Login para profesionales (rol PROFESSIONAL)
- ✅ Panel de profesional: ver su disponibilidad, sus pacientes, sus comisiones
- ✅ Historial clínico básico (notas por sesión)
- ✅ Análisis de retención de pacientes
- ✅ WhatsApp API (activar Twilio, solo conexión)
- ✅ Notificaciones por email (resúmenes semanales, alertas)

**Entregables:**
- Panel profesional funcional
- Notificaciones email automáticas
- Módulo WhatsApp arquitectado

---

### FASE 4: CRM & Marketing (3 semanas)

**Objetivo:** Crecimiento y análisis de clientes.

**Incluye:**
- ✅ CRM Pacientes (historial, seguimiento, tags)
- ✅ Perfil público por profesional (para derivaciones externas)
- ✅ Analytics (ocupación de consultorios, tasas de cancelación)
- ✅ Instagram DM (bandeja unificada, respuestas automáticas)
- ✅ Campañas de remarketing (emails a pacientes inactivos)
- ✅ LTV por paciente (lifetime value)

**Entregables:**
- CRM completo integrado
- Dashboard de analytics
- Sistema de remarketing

---

## Estructura del Monorepo

```
pscielo/
│
├── README.md                    # Introducción del proyecto
├── DEVELOPMENT_PLAN.md          # Este archivo
├── docker-compose.yml           # Stack local (desarrollo)
├── docker-compose.prod.yml      # Stack producción (Coolify)
├── .env.example                 # Variables de entorno template
├── .gitignore
│
├── backend/                     # FastAPI + PostgreSQL
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .dockerignore
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app init
│   │   │
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py       # POST /login, /refresh, /logout
│   │   │   │   ├── users.py      # GET /users/{id}, PATCH /users/{id}
│   │   │   │   ├── professionals.py  # CRUD profesionales
│   │   │   │   ├── rooms.py      # CRUD consultorios
│   │   │   │   ├── availability.py   # GET disponibilidad, POST excepciones
│   │   │   │   ├── patients.py   # CRUD pacientes
│   │   │   │   ├── referrals.py  # POST derivación, GET del profesional
│   │   │   │   ├── sessions.py   # POST sesión (asistencia), GET historial
│   │   │   │   ├── notifications.py  # GET mis notificaciones
│   │   │   │   ├── commissions.py    # GET comisiones (resumen semanal)
│   │   │   │   ├── income.py     # GET ingresos
│   │   │   │   ├── expenses.py   # CRUD gastos
│   │   │   │   ├── dashboard.py  # GET dashboard (KPIs)
│   │   │   │   └── health.py     # GET /health (readiness check)
│   │   │   └── deps.py           # Dependencias comunes (auth, DB session)
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # Variables de entorno (Pydantic)
│   │   │   ├── security.py       # bcrypt, JWT, RBAC
│   │   │   └── database.py       # SQLAlchemy engine, session factory
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # Base model con id, created_at, updated_at
│   │   │   ├── user.py           # ORM User
│   │   │   ├── professional.py   # ORM Professional + relaciones
│   │   │   ├── room.py           # ORM Room, RoomRental, RoomBlock
│   │   │   ├── availability.py   # ORM ProfessionalAvailability, AvailabilityException
│   │   │   ├── patient.py        # ORM Patient
│   │   │   ├── referral.py       # ORM Referral
│   │   │   ├── session.py        # ORM Session, WeeklyCommissionSummary
│   │   │   ├── notification.py   # ORM Notification
│   │   │   ├── audit_log.py      # ORM AuditLog (append-only)
│   │   │   ├── income.py         # ORM IncomeRecord
│   │   │   └── expense.py        # ORM Expense
│   │   │
│   │   ├── schemas/              # Pydantic schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # LoginRequest, TokenResponse
│   │   │   ├── professional.py   # ProfessionalCreate, ProfessionalUpdate, ProfessionalResponse
│   │   │   ├── room.py
│   │   │   ├── patient.py
│   │   │   ├── referral.py
│   │   │   ├── session.py
│   │   │   └── ... (uno por entidad)
│   │   │
│   │   ├── services/             # Lógica de negocio
│   │   │   ├── __init__.py
│   │   │   ├── professional_service.py     # crear, actualizar, validar, etc.
│   │   │   ├── availability_service.py     # calcular disponibilidad, auditar cambios
│   │   │   ├── referral_service.py        # derivar, validar disponibilidad
│   │   │   ├── session_service.py         # registrar sesión, auditar
│   │   │   ├── commission_service.py      # calcular comisiones (se usa desde Celery)
│   │   │   ├── notification_service.py    # crear notificaciones
│   │   │   ├── email_service.py           # envío de emails
│   │   │   └── audit_service.py           # registro de auditoría
│   │   │
│   │   ├── tasks/                # Celery tasks (async)
│   │   │   ├── __init__.py
│   │   │   ├── commissions.py    # calculate_weekly_commissions (cron cada viernes)
│   │   │   ├── notifications.py  # send_email_reminders
│   │   │   ├── backups.py        # pg_dump diario (futuro)
│   │   │   └── whatsapp.py       # webhook handlers (futuro)
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── constants.py      # Enums, constantes
│   │       ├── validators.py     # Validadores custom
│   │       └── helpers.py        # Funciones auxiliares
│   │
│   ├── alembic/                  # Migraciones de BD
│   │   ├── versions/
│   │   │   ├── 001_initial_schema.py
│   │   │   └── ... (una por cambio)
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── alembic.ini
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py           # Fixtures (DB test, auth mock)
│   │   ├── test_auth.py
│   │   ├── test_professionals.py
│   │   ├── test_commissions.py
│   │   └── ...
│   │
│   └── scripts/
│       ├── init_db.py            # Poblar BD con datos iniciales
│       └── backup.sh             # Script de backup
│
├── frontend/                     # Next.js + React
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── next.config.js
│   ├── tailwind.config.js        # Neumorphism custom config
│   ├── tsconfig.json
│   ├── package.json
│   │
│   ├── public/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── app/                  # Next.js App Router
│       │   ├── layout.tsx        # Layout global (Neumorphism theme)
│       │   ├── page.tsx          # Home redirect a /dashboard
│       │   ├── globals.css       # Estilos globales + variables CSS
│       │   │
│       │   ├── login/
│       │   │   └── page.tsx      # Login form
│       │   │
│       │   ├── dashboard/
│       │   │   ├── layout.tsx    # Sidebar + header
│       │   │   ├── page.tsx      # Dashboard principal
│       │   │   │
│       │   │   ├── professionals/
│       │   │   │   ├── page.tsx  # Lista profesionales
│       │   │   │   ├── [id]/
│       │   │   │   │   ├── page.tsx  # Detalle profesional
│       │   │   │   │   └── edit/
│       │   │   │   │       └── page.tsx
│       │   │   │   └── create/
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   ├── rooms/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── [id]/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── calendar.tsx  # Vista calendario
│       │   │   │
│       │   │   ├── patients/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── [id]/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── create/
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   ├── referrals/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── [id]/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── create/
│       │   │   │       └── page.tsx  # Derivar paciente
│       │   │   │
│       │   │   ├── sessions/
│       │   │   │   ├── page.tsx
│       │   │   │   └── create/
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   ├── commissions/
│       │   │   │   ├── page.tsx  # Resumen semanal
│       │   │   │   ├── professional/
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │
│       │   │   ├── finance/
│       │   │   │   ├── page.tsx  # Dashboard financiero
│       │   │   │   ├── income/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── expenses/
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   ├── notifications/
│       │   │   │   └── page.tsx
│       │   │   │
│       │   │   └── settings/
│       │   │       └── page.tsx
│       │   │
│       │   └── api/
│       │       └── [...].ts      # Optional: API routes para proxy
│       │
│       ├── components/           # Componentes reutilizables
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   └── MainLayout.tsx
│       │   │
│       │   ├── ui/               # Componentes básicos (Neumorphism)
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Select.tsx
│       │   │   ├── Table.tsx
│       │   │   ├── Pagination.tsx
│       │   │   ├── Notification.tsx
│       │   │   ├── Loading.tsx
│       │   │   └── ...
│       │   │
│       │   ├── forms/            # Formularios reutilizables
│       │   │   ├── ProfessionalForm.tsx
│       │   │   ├── PatientForm.tsx
│       │   │   ├── ReferralForm.tsx
│       │   │   └── ...
│       │   │
│       │   └── charts/           # Gráficos (Recharts)
│       │       ├── CommissionsChart.tsx
│       │       ├── IncomeChart.tsx
│       │       └── OccupancyChart.tsx
│       │
│       ├── lib/                  # Utilidades
│       │   ├── api.ts            # Axios client con interceptores
│       │   ├── auth.ts           # Funciones de auth (login, logout)
│       │   ├── utils.ts          # Helpers generales
│       │   └── constants.ts      # Constantes (URLs, roles, etc.)
│       │
│       ├── hooks/                # Custom React hooks
│       │   ├── useAuth.ts        # Context/state de auth
│       │   ├── useFetch.ts       # Fetch con caching
│       │   └── ...
│       │
│       └── styles/
│           ├── neumorphism.css   # Tema Neumorphism
│           └── animations.css    # Framer Motion presets
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # Tests en cada push
│       └── deploy.yml            # Deploy automático en main (futuro)
│
└── docs/
    ├── API.md                    # Documentación API
    ├── DATABASE.md               # Schema BD
    ├── DEPLOYMENT.md             # Instrucciones Coolify
    └── CONTRIBUTING.md           # Guía para contribuidores
```

---

## Plan por Sprint

### SPRINT 1: Base Técnica + Infraestructura (Semana 1-2)

#### Semana 1: Infraestructura & Backend Setup

**Día 1-2: Infraestructura Cloud**
- [ ] Instalar Coolify en VPS Hostinger (Ubuntu 24.04)
- [ ] Conectar repo GitHub a Coolify
- [ ] Setup del docker-compose.yml con todos los servicios
- [ ] Crear .env.example con todas las variables
- [ ] Primer deploy vacío: backend + frontend + postgres corriendo
- [ ] SSL automático + dominio pscielo.com funcionando

**Día 3-4: Backend FastAPI Base**
- [ ] Crear estructura de carpetas (app/api, app/models, app/schemas, etc.)
- [ ] Setup de PostgreSQL + SQLAlchemy
- [ ] Config de FastAPI (CORS, logging, error handlers)
- [ ] Setup de Pydantic para validación
- [ ] Implementar auth: JWT + bcrypt
- [ ] Endpoint POST /auth/login
- [ ] Endpoint POST /auth/refresh
- [ ] Endpoint POST /auth/logout
- [ ] Documentación auto (Swagger en /api/docs)

**Día 5: Migraciones & Modelos Base**
- [ ] Alembic setup
- [ ] Crear modelos base (User, AuditLog, Notification)
- [ ] Crear migrations para crear tablas
- [ ] Script para popular datos iniciales (usuarios de test)

#### Semana 2: Modelos Principales & CRUD

**Día 1-2: Modelos de Dominio**
- [ ] ORM models: Professional, Room, RoomRental, RoomBlock
- [ ] ORM models: ProfessionalAvailability, AvailabilityException
- [ ] ORM models: Patient, Referral, Session
- [ ] ORM models: WeeklyCommissionSummary, IncomeRecord, Expense
- [ ] Relaciones entre modelos (foreign keys, cascades)
- [ ] Migraciones Alembic para todas las tablas

**Día 3-4: CRUD Endpoints**
- [ ] POST /professionals (crear)
- [ ] GET /professionals (listar con paginación)
- [ ] GET /professionals/{id} (detalle)
- [ ] PATCH /professionals/{id} (actualizar)
- [ ] DELETE /professionals/{id} (soft delete)
- [ ] Idem para Room, RoomRental, Patient

**Día 5: Sistema de Notificaciones + Auditoría**
- [ ] Servicio de notificaciones (crear en DB)
- [ ] Servicio de auditoría (append-only log)
- [ ] GET /notifications (mis notificaciones)
- [ ] PATCH /notifications/{id} (marcar como leído)
- [ ] GET /audit-logs/{entity_type}/{id} (ver historia de cambios)

**Fin de Sprint 1:**
- [ ] Backend API 90% funcional
- [ ] Tests unitarios de servicios críticos (auth, disponibilidad)
- [ ] Deploy en VPS → accesible via https://pscielo.com/api/docs

---

### SPRINT 2: Frontend Base + Disponibilidad (Semana 3-4)

#### Semana 3: Frontend Base & Auth

**Día 1-2: Next.js + Neumorphism Setup**
- [ ] Crear proyecto Next.js 14
- [ ] Instalar Tailwind CSS + configuración custom
- [ ] Implementar diseño Neumorphism (variables CSS, componentes base)
- [ ] Setup de TypeScript
- [ ] Instalar Framer Motion
- [ ] Crear componentes base: Button, Input, Card, Modal

**Día 3-4: Sistema de Autenticación Frontend**
- [ ] Crear contexto de auth (Context API o Zustand)
- [ ] Página de login funcional
- [ ] Axios client con interceptores (JWT refresh automático)
- [ ] Protección de rutas (PrivateRoute)
- [ ] Persistencia de token (localStorage con seguridad)

**Día 5: Layout Principal**
- [ ] Componente Sidebar (navegación)
- [ ] Componente Header (usuario, notificaciones, logout)
- [ ] Layout responsivo mobile-first
- [ ] Animaciones con Framer Motion

#### Semana 4: Módulo de Disponibilidad

**Día 1-2: Disponibilidad Backend**
- [ ] Servicio de disponibilidad (calcular turno libre/ocupado)
- [ ] POST /availability/exceptions (registrar cancelación)
- [ ] GET /availability/{professional_id} (ver semana)
- [ ] Sistema de auditoría: quién cambió qué a qué hora
- [ ] Task de Celery: verificar disponibilidad

**Día 3-4: Frontend de Disponibilidad**
- [ ] Página lista de profesionales
- [ ] Calendario semanal (grid día/hora)
- [ ] Formulario para registrar excepción
- [ ] Mostrar auditoría de cambios
- [ ] Validación en tiempo real (no solapar reservas)

**Día 5: Testing & Documentación**
- [ ] Tests e2e básicos (login → derivar paciente)
- [ ] Documentación en README
- [ ] Demo del sistema en vivo

**Fin de Sprint 2:**
- [ ] Frontend básico funcionando
- [ ] Login, dashboard, gestión de disponibilidad
- [ ] Deploy automático en Coolify ✅

---

### SPRINT 3: Derivaciones + Comisiones (Semana 5-6)

**Completar módulos:**
- [ ] CRUD Pacientes (frontend + backend)
- [ ] Sistema de Derivaciones (asignar paciente)
- [ ] Registro de Sesiones (asistencia/cancelación)
- [ ] Cálculo automático de comisiones (Celery task)
- [ ] Dashboard de comisiones semanales

**Frontend:**
- [ ] Página de derivaciones
- [ ] Crear paciente → derivar a profesional
- [ ] Registrar sesión (asistencia)
- [ ] Ver historial de comisiones

**Celery:**
- [ ] Task: calcular_comisiones_semana (cron viernes 23:59)
- [ ] Task: enviar_email_resumen_comisiones

---

### SPRINT 4: Dashboard + Deploy Final (Semana 7-8)

**Backend:**
- [ ] Endpoint GET /dashboard (KPIs: consultorios ocupados, pendientes, etc.)
- [ ] Endpoint GET /reports/monthly (ingresos, gastos, ganancia)

**Frontend:**
- [ ] Dashboard principal (tablero ejecutivo)
- [ ] Gráficos con Recharts (comisiones, ingresos)
- [ ] Responsivo en celular

**Deploy:**
- [ ] Health check endpoint
- [ ] Logs centralizados
- [ ] Backup automático de BD (pg_dump diario)
- [ ] Monitoreo básico (status page)

---

## Decisiones de Diseño

### 1. Neumorphism para UI

**Por qué:** Moderno, intuitivo, invita a usar (vs. interface vieja de admin)

**Implementación:**
- Tailwind CSS personalizado
- Sombras suaves (`box-shadow`)
- Transiciones suaves (`transition`)
- Colores pasteles como base
- Framer Motion para microinteracciones

**Paleta:**
```css
--background: #EEF2F7     /* fondo neutro */
--primary: #FFD6E0        /* rosa pastel */
--secondary: #D6EAF8      /* celeste pastel */
--accent: #FFF9C4         /* amarillo pastel */
--error: #FF6B6B          /* rojo fuerte (solo alertas) */
--success: #51CF66        /* verde fuerte (solo confirmaciones) */
```

### 2. Auditoría Inmutable

**Por qué:** Saber quién canceló, cuándo, qué cambió → protección legal + confiabilidad

**Implementación:**
- Tabla `audit_logs` append-only (nunca UPDATE/DELETE)
- Cada cambio en entidades principales se registra
- Quién lo hizo (`user_id`), cuándo, valores antes/después
- Endpoint para ver historial de cualquier entidad

### 3. Comisiones Automáticas (Celery)

**Por qué:** Eliminar cálculo manual, evitar errores, permitir escala

**Implementación:**
- Task Celery: cada viernes 23:59
- Busca todas las sesiones de la semana
- Suma `pscielo_commission` por profesional
- Crea `weekly_commission_summary`
- Envía email a profesional + admin
- Dashboard se actualiza automáticamente

### 4. Roles & Permisos Basados en Rol

**Implementación:**
- Enum en DB: SUPERADMIN | ADMIN | PROFESSIONAL | READONLY
- Decorador `@require_role()` en endpoints
- Permisos: PROFESSIONAL solo ve su data, ADMIN ve todo, SUPERADMIN puede cambiar config

### 5. Caché con Redis

**Uso:**
- Sesiones de usuario (auth)
- Rate limiting (evitar fuerza bruta)
- Disponibilidad caché (invalidar si hay excepción nueva)
- Jobs de Celery (estados, resultados)

### 6. WhatsApp API (Arquitectado, no MVP)

**Filosofía:** Código preparado para conectar Twilio sin refactorizar

**Ubicación:** `/backend/app/tasks/whatsapp.py` (vacío pero estructurado)

**Cuando se active:** Solo agregar credenciales en `.env`, código listo

---

## Checklist de Infraestructura

### Antes de empezar desarrollo

- [ ] Repo en GitHub privado (XaviPirata/pscieloapp)
- [ ] Coolify instalado en VPS Hostinger
- [ ] GitHub conectado a Coolify (OAuth token)
- [ ] docker-compose.yml base preparado
- [ ] Dominio pscielo.com apuntando a VPS (A record a IP pública)
- [ ] SSL automático funcionando (certificado Let's Encrypt)

### Durante desarrollo

- [ ] Cada push a `main` → Coolify autodeploy
- [ ] Logs centralizados en Coolify panel
- [ ] Backup automático diario de PostgreSQL

### Testing

- [ ] Health check: `curl https://pscielo.com/api/health` → 200
- [ ] Frontend cargando: `https://pscielo.com` → Login page
- [ ] API docs: `https://pscielo.com/api/docs` → Swagger funcional

---

## Próximos Pasos

1. ✅ Leer este documento completamente
2. ⏳ Instalar Coolify en VPS (comandos específicos en siguiente etapa)
3. ⏳ Crear docker-compose.yml
4. ⏳ Inicio Sprint 1

**¿Alguna pregunta o ajuste antes de arrancargit ?**
