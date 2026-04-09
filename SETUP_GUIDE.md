# PsCielo - Setup Guide

> **Última actualización:** 9 de Abril 2026
> **Etapa actual:** FASE 3 Completada - Frontend Impactante

---

## 📋 Tabla de Contenidos

1. [Estado Actual](#estado-actual)
2. [FASE 1 Completada](#fase-1-completada)
3. [Próximos Pasos Detallados](#próximos-pasos-detallados)
4. [Variables de Entorno](#variables-de-entorno)
5. [Deployment en Coolify](#deployment-en-coolify)

---

## Estado Actual

### ✅ Completado en FASE 1

#### Backend Profesional (FastAPI)
- ✅ Estructura de carpetas completa: `backend/app/{models,schemas,api,services,integrations,tasks,middleware}`
- ✅ **11 Modelos SQLAlchemy** completamente definidos:
  - `User` (Autenticación + RBAC)
  - `Professional` (Psicólogos/Terapeutas)
  - `ProfessionalMatrix` (Asignación a consultorios)
  - `Room` (Consultorios)
  - `RoomRental` (Alquileres mensuales)
  - `Patient` (Clientes)
  - `PatientHistory` (Historial clínico)
  - `Session` (Citas/Sesiones)
  - `SessionAttendance` (Asistencia)
  - `Availability` (Disponibilidad semanal)
  - `AvailabilityOverride` (Excepciones)
  - `AuditLog` (Audit trail inmutable)
  - `Commission` (Comisiones semanales)
  - `IncomeRecord` (Registros de ingresos)
  - `ExpenseRecord` (Registros de gastos)

- ✅ Configuración base (`config.py`) con todas las variables:
  - Database (PostgreSQL)
  - Redis
  - JWT Authentication
  - SendGrid (Email)
  - Gmail API
  - Instagram Graph API
  - Celery

- ✅ `requirements.txt` con todas las dependencias necesarias
- ✅ FastAPI `main.py` con estructura lista para endpoints
- ✅ Dockerfile para backend con Python 3.11

#### Frontend Moderno (Next.js 14)
- ✅ Estructura de carpetas: `frontend/app, components/, lib/, hooks/, styles/`
- ✅ **Sistema de Diseño Neumorphism 2026 optimizado:**
  - Paleta pastel profesional (Rosa `#FFD6E0`, Azul `#D6EAF8`, Lavanda `#EEF2F7`)
  - Tailwind config con sombras neumorphic personalizadas
  - Sistema de animaciones suave (Framer Motion ready)
  - Responsive design y accessibility features

- ✅ Página de Login (`app/page.tsx`) con:
  - Animaciones impactantes (fondos animados, rotación de logo)
  - Neumorphic form styling
  - Validación básica
  - Diseño mobile-first

- ✅ CSS global (`styles/globals.css`) con:
  - Variables CSS personalizadas
  - Clases utilitarias neumorphic
  - Animaciones predefinidas
  - Soporte para dark mode (futuro)

- ✅ Configuración TypeScript estricta
- ✅ Dockerfile multi-stage para Next.js

#### Infraestructura & Deployment
- ✅ `docker-compose.yml` production-ready con:
  - PostgreSQL 16
  - Redis 7
  - FastAPI backend
  - Celery worker
  - Next.js frontend
  - Networking y volumes configurados
  - Health checks en cada servicio

- ✅ `.env.example` con todas las variables documentadas
- ✅ `next.config.js` y configuración Next.js completa
- ✅ `tsconfig.json` con aliases de path (`@/`)

---

## FASE 1 Completada

### Archivos Creados

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py                    # Configuración centralizada
│   ├── main.py                      # FastAPI app
│   └── models/
│       ├── __init__.py
│       ├── base.py                  # Base de datos + mixins
│       ├── user.py
│       ├── professional.py
│       ├── room.py
│       ├── patient.py
│       ├── session.py
│       ├── availability.py
│       ├── audit_log.py
│       ├── commission.py
│       ├── income.py
│       └── expense.py
├── Dockerfile
├── requirements.txt

frontend/
├── app/
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Login page
├── styles/
│   └── globals.css                  # Diseño global + variables
├── Dockerfile
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts               # Neumorphism design system

docker-compose.yml
.env.example
```

---

## Próximos Pasos Detallados

### **FASE 2A: Backend Endpoints (CRUD)**
**Objetivo:** Crear todos los endpoints REST para las operaciones básicas

**Archivos a crear:**
```
backend/app/schemas/
├── user.py                          # Pydantic models para User
├── professional.py                  # Pydantic models para Professional
├── patient.py                       # Pydantic models para Patient
├── session.py                       # Pydantic models para Session
├── room.py
├── commission.py
└── shared.py                        # Modelos compartidos (responses, pagination)

backend/app/api/
├── auth.py                          # Login, JWT tokens, refresh
├── professionals.py                 # CRUD: List, Create, Update, Delete
├── patients.py                      # CRUD: List, Create, Update, Delete
├── sessions.py                      # CRUD: List, Create, Update, Delete
├── rooms.py                         # CRUD: List, Create, Update, Delete
├── availability.py                  # Gestión de disponibilidad
├── commissions.py                   # Cálculo y listado de comisiones
└── reports.py                       # Reportes y analytics
```

**Pasos:**
1. Crear archivos de schemas (Pydantic) para validación de inputs
2. Crear decorador/middleware para autenticación JWT
3. Crear endpoints CRUD básicos para cada entidad
4. Implementar paginación y filtros
5. Documentación automática en Swagger (`/api/docs`)

**Estimación:** 2-3 sesiones de trabajo intenso

---

### **FASE 2B: Autenticación & RBAC**
**Objetivo:** Implementar JWT con roles y control de acceso

**Archivos a crear:**
```
backend/app/auth/
├── jwt_handler.py                   # Crear/validar JWT tokens
├── password.py                      # Hash y verify contraseñas
└── decorators.py                    # @require_role("ADMIN"), etc.

backend/app/middleware/
├── auth.py                          # Middleware para verificar JWT
└── logging.py                       # Logging de auditoría
```

**Pasos:**
1. Hashear contraseñas con bcrypt
2. Crear tokens JWT (access + refresh)
3. Middleware para verificar tokens en cada request
4. Decoradores para requerir roles específicos
5. Refresh token flow
6. Logout y revocación de tokens (Redis)

**Estimación:** 1 sesión

---

### **FASE 2C: Integraciones Externas**
**Objetivo:** Configurar Gmail API e Instagram Graph API

**Gmail API Setup:**
```bash
# 1. Ir a Google Cloud Console
# 2. Crear proyecto "PsCielo"
# 3. Habilitar Gmail API
# 4. Crear OAuth 2.0 credentials (tipo: Aplicación web)
# 5. Descargar JSON de credenciales
# 6. Guardar en: backend/.secrets/gmail_credentials.json
```

**Archivos a crear:**
```
backend/app/integrations/
├── gmail.py                         # OAuth2 + lectura/envío de emails
├── instagram.py                     # Graph API para DMs
└── email_service.py                 # SendGrid + Zoho SMTP
```

**Pasos:**
1. Configurar SendGrid para emails transaccionales
2. Implementar Gmail OAuth2 (lectura de consultas)
3. Implementar Instagram Graph API (lectura de DMs)
4. Crear tareas Celery para procesar emails de forma asíncrona

**Estimación:** 2 sesiones

---

### **FASE 3: Frontend Componentes Impactantes**
**Objetivo:** Crear dashboard y componentes neumorphism modernos

**Archivos a crear:**
```
frontend/components/
├── neumorphism/
│   ├── Button.tsx                   # Botón neumorphic con variantes
│   ├── Card.tsx                     # Card neumorphic
│   ├── Input.tsx                    # Input neumorphic
│   ├── Select.tsx                   # Select/Dropdown
│   └── Modal.tsx                    # Modal/Dialog

├── layout/
│   ├── Sidebar.tsx                  # Sidebar navegación
│   ├── Header.tsx                   # Header con usuario
│   ├── DashboardLayout.tsx          # Layout base dashboard
│   └── Navigation.tsx               # Menú principal

├── dashboard/
│   ├── StatCard.tsx                 # KPI cards (sesiones, ingresos, etc)
│   ├── SessionsChart.tsx            # Gráfico sesiones (Chart.js/Recharts)
│   ├── RevenueChart.tsx             # Gráfico ingresos
│   └── QuickStats.tsx               # Stats overview

├── forms/
│   ├── LoginForm.tsx                # (Ya existe en page.tsx, refactorizar)
│   ├── ProfessionalForm.tsx         # Crear/editar profesional
│   ├── PatientForm.tsx              # Crear/editar paciente
│   ├── SessionForm.tsx              # Crear sesión/cita
│   └── AvailabilityForm.tsx         # Gestionar disponibilidad

├── tables/
│   ├── DataTable.tsx                # Table reusable con sort, filter
│   ├── SessionsTable.tsx            # Tabla de sesiones
│   ├── ProfessionalsTable.tsx       # Tabla de profesionales
│   └── PatientsTable.tsx            # Tabla de pacientes

└── modals/
    ├── ConfirmDialog.tsx            # Confirmar acciones
    └── NotificationModal.tsx        # Notificaciones

frontend/app/dashboard/
├── layout.tsx                       # Dashboard layout con sidebar
├── page.tsx                         # Dashboard home (overview)
├── professionals/
│   ├── page.tsx                     # Listado de profesionales
│   ├── [id]/
│   │   └── page.tsx                 # Detalle y edición
│   └── new/
│       └── page.tsx                 # Crear profesional
├── patients/
├── sessions/
├── rooms/
├── availability/
├── commissions/
└── reports/

frontend/lib/
├── api.ts                           # Axios client con interceptores
├── auth.ts                          # JWT token management
├── constants.ts                     # Constantes (roles, estados)
└── utils.ts                         # Helpers

frontend/hooks/
├── useAuth.ts                       # Auth context hook
├── useFetch.ts                      # Data fetching hook
├── useForm.ts                       # Form state hook
└── useDebounce.ts                   # Debounce hook
```

**Características de Diseño (2026 Standards):**
- Glassmorphism + Neumorphism blend (moderno y sofisticado)
- Animaciones suaves con Framer Motion (no over-engineered)
- Gradientes sutiles (paleta pastel)
- Micro-interactions en botones, inputs, cards
- Dark mode support (opcional pero preparado)
- Accesibilidad total (WCAG 2.1 AA)
- Responsive grid system

**Estimación:** 4-5 sesiones (esto es lo más visual e impactante)

---

### **FASE 4: Deployment en Coolify**
**Objetivo:** Desplegar PsCielo en VPS Hostinger con Traefik

**Pasos:**
1. Crear aplicaciones en Coolify UI o vía API
2. Configurar variables de entorno en Coolify
3. Setup de dominios: `control.pscielo.com`
4. SSL automático vía Let's Encrypt/Traefik
5. CI/CD: GitHub → Coolify (auto-deploy en push a `main`)
6. Monitoreo y alertas

**Estimación:** 1 sesión (configuración de Coolify)

---

## Variables de Entorno

### `.env` para desarrollo local

Copiar `.env.example` a `.env` y completar:

```bash
# Críticas
SECRET_KEY=your-secret-key-very-long-32-chars-minimum
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
SENDGRID_API_KEY=SG.your-sendgrid-key
INSTAGRAM_ACCESS_TOKEN=your-instagram-token
INSTAGRAM_BUSINESS_ACCOUNT_ID=123456

# Opcionales (tienen defaults)
DEBUG=false
ENVIRONMENT=development
```

### Variables en Coolify

En el dashboard de Coolify, para el servicio PsCielo:
1. Ir a `Services` → `PsCielo` → `Environment`
2. Agregar cada variable de `.env`
3. Secrets se guardan encriptados

---

## Deployment en Coolify

### Requisitos Previos
- ✅ Coolify 4.0.0+ en 89.116.214.228:8000
- ✅ PostgreSQL y Redis ya existentes
- ✅ Traefik v3.6 configurado
- ✅ Proyecto `PsCielo` creado en Coolify (UUID: `t2sqolm6y803tce1ovjlnjtr`)
- ✅ Servidor `localhost` conectado (UUID: `rgsip55kql65hm81jp52e1m8`)

### Pasos de Deployment

**1. Crear aplicación Docker Compose en Coolify**

```bash
# Opción A: Via API (recomendado)
API_KEY="1|vttiabRlzWeKCyjvMgcil0pzMK1t4ms9JaHOLInK6a249a91"
BASE_URL="http://89.116.214.228:8000"

# Preparar docker-compose.yml en base64
BASE64_COMPOSE=$(base64 -w 0 docker-compose.yml)

curl -s -X POST "$BASE_URL/api/v1/applications/dockercompose" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"project_uuid\": \"t2sqolm6y803tce1ovjlnjtr\",
    \"environment_name\": \"production\",
    \"server_uuid\": \"rgsip55kql65hm81jp52e1m8\",
    \"docker_compose_raw\": \"$BASE64_COMPOSE\"
  }"

# Opción B: Via UI de Coolify
# 1. Ir a Projects → PsCielo
# 2. Click "+ New Service"
# 3. Seleccionar "Docker Compose"
# 4. Pegar docker-compose.yml
# 5. Configurar variables de entorno
```

**2. Configurar dominios y SSL**

```bash
# Agregar dominio a la aplicación
curl -s -X POST "$BASE_URL/api/v1/services/{service_uuid}/domains" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"domain\": \"control.pscielo.com\"
  }"

# SSL se configura automáticamente vía Traefik
# Certificado Let's Encrypt en /data/coolify/proxy/acme.json
```

**3. Configurar GitHub Actions (CI/CD)**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Coolify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Coolify
        run: |
          curl -s -X POST "http://89.116.214.228:8000/api/v1/services/{service_uuid}/deploy" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_API_KEY }}"
```

---

## Checklist de Validación

### FASE 1 ✅
- [x] Estructura de carpetas creada
- [x] Backend: 11 modelos SQLAlchemy
- [x] Backend: config.py con todas las variables
- [x] Backend: requirements.txt completo
- [x] Frontend: Estructura Next.js
- [x] Frontend: Sistema neumorphism con Tailwind
- [x] Frontend: Página de login impactante
- [x] docker-compose.yml production-ready
- [x] .env.example documentado
- [x] Este SETUP_GUIDE.md

### FASE 2A ✅
- [x] Schemas Pydantic para cada entidad (user, professional, patient, session, room, commission, shared)
- [x] Endpoints CRUD para profesionales
- [x] Endpoints CRUD para pacientes (+ historial clínico)
- [x] Endpoints CRUD para sesiones (+ asistencia)
- [x] Endpoints CRUD para consultorios (+ alquileres)
- [x] Endpoints para comisiones (cálculo + pago)
- [x] Swagger docs funcional (auto-generado en /docs)
- [x] Servicio de auditoría (audit_log inmutable)

### FASE 2B ✅
- [x] Autenticación JWT (access + refresh tokens)
- [x] Validación de tokens (middleware auth.py)
- [x] RBAC decorators (require_admin, require_professional, etc.)
- [x] Refresh token flow
- [x] Seed superadmin endpoint (para BD vacía)
- [x] Password hashing con bcrypt

### FASE 2C (DIFERIDA - Hacer después de FASE 3)
- [ ] Gmail API setup y integración (requiere Google Cloud Console)
- [ ] Instagram Graph API setup (requiere Facebook Developer)
- [ ] SendGrid email service (requiere cuenta SendGrid)
- [ ] Celery tasks para procesamiento asíncrono
- **Nota:** No bloquea el frontend. Se integrará cuando las credenciales estén listas.

### FASE 3 ✅
- [x] Librería de componentes neumorphism (Button, Card, Input, Badge, Modal)
- [x] Sidebar con animaciones, active indicator, collapse/expand
- [x] Header con búsqueda expandible, notificaciones, perfil dropdown
- [x] Dashboard home: StatCards animados (counter), WeeklyChart, ActivityFeed, UpcomingSessions, QuickActions, ProfessionalOverview
- [x] Página Profesionales: grid/list view, search, modal crear, tarjetas con stats
- [x] Página Pacientes: tabla con búsqueda, stats row, modal crear, badges por origen
- [x] Página Sesiones: vista calendario semanal, slots por hora, modal detalle, modal crear
- [x] Login page: blobs animados, partículas flotantes, glassmorphism, show/hide password
- [x] Sistema de diseño neumorphism 2026: soft shadows, gradientes pastel, micro-interactions
- [x] API client (Axios) con auto-refresh JWT interceptor
- [x] Utilidades: formatCurrency, formatDate, getGreeting, getInitials, cn()
- [x] Constantes: roles, estados, colores, navegación
- [ ] Reportes y analytics (pendiente para iteración futura)
- [ ] Testeo exhaustivo en navegadores (pendiente para deploy)

### FASE 4
- [ ] Deployment en Coolify
- [ ] SSL automático
- [ ] CI/CD configurado
- [ ] Monitoreo

---

## Comandos Útiles

### Desarrollo Local
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop everything
docker-compose down

# Reset database (⚠️ PELIGRO)
docker-compose down -v
docker-compose up -d

# Run migrations (cuando existan)
docker-compose exec backend alembic upgrade head

# Enter database
docker-compose exec postgres psql -U pscielo -d pscielo_dev
```

### Backend
```bash
# Install deps
pip install -r requirements.txt

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Migrations (cuando estén ready)
alembic revision --autogenerate -m "add users table"
alembic upgrade head

# Tests
pytest tests/
```

### Frontend
```bash
# Install deps
npm install

# Run dev
npm run dev

# Build
npm run build
npm start

# Lint
npm run lint:fix
```

---

## Notas Importantes

### ⚠️ Críticas
1. **No romper psicodelcielo.com:** Comparte infraestructura (Traefik). Cuidado al hacer cambios.
2. **JWT Secret:** Cambiar en producción. Mínimo 32 caracteres.
3. **CORS:** Actualizar ALLOWED_ORIGINS en Coolify.
4. **Variables Sensibles:** Usar Coolify secrets, NUNCA commitear `.env`.

### 📊 Estado del Proyecto
- **Etapa:** Pre-Desarrollo (FASE 1 ✅)
- **Próximo:** FASE 2C (Integraciones) o FASE 3 (Frontend)
- **Duración estimada:** 4 semanas para MVP completo
- **Stack:** FastAPI, Next.js, PostgreSQL, Redis, Celery

### 🔗 Referencias
- CLAUDE.md — Instrucciones del proyecto
- DEVELOPMENT_PLAN.md — Plan técnico detallado
- ONBOARDING.md — Onboarding para nuevos desarrolladores
- Este archivo — Setup y próximos pasos

---

**¿Preguntas?** Ver DEVELOPMENT_PLAN.md o CLAUDE.md
