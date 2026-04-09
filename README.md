# PsCielo - Sistema de Gestión Integral para Centro Psicológico

![Status](https://img.shields.io/badge/status-en%20desarrollo-orange)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-Privado-red)

**PsCielo** es un sistema web profesional, moderno y escalable para gestionar un centro psicológico con múltiples consultorios y profesionales.

---

## 🎯 Características Principales

### Gestión Integral
- 📋 **Profesionales** — datos completos (matrículas, especialidades, horarios)
- 🏢 **Consultorios** — 4 espacios con alquileres fijos y gestión de disponibilidad
- 👥 **Pacientes** — historial completo y seguimiento
- 📅 **Calendario** — agenda centralizada con auditoría de cambios
- 💰 **Comisiones** — cálculo automático semanal (sin errores)

### Canales Integrados
- 📧 **Gmail** — sincronización de consultas entrantes + envío automático
- 📱 **Instagram** — lectura de DMs + respuestas automáticas
- 💬 **WhatsApp** — (arquitectado, sin activar en MVP)

### Análisis & Reportes
- 📊 **Dashboard ejecutivo** — KPIs en tiempo real
- 💹 **P&L mensual** — ingresos vs gastos
- 📈 **Analytics** — ocupación, retención, rentabilidad
- 🔐 **Auditoría inmutable** — quién hizo qué, cuándo

---

## 🚀 Tecnología

| Capa | Tecnología |
|------|-----------|
| **Backend** | Python + FastAPI |
| **Frontend** | Next.js 14 + Tailwind CSS (Neumorphism) |
| **DB** | PostgreSQL 16 |
| **Cache** | Redis |
| **Tareas async** | Celery |
| **Deploy** | Coolify (VPS Hostinger) |

**Estética:** Moderno, intuitivo, profesional. Neumorphism con paleta pastel.

---

## 📖 Documentación

1. **[ONBOARDING.md](ONBOARDING.md)** — Resumen de contexto + cómo continuar
2. **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** — Plan completo (arquitectura, fases, sprints)
3. **[API.md](docs/API.md)** — Documentación de endpoints (próximamente)
4. **[DATABASE.md](docs/DATABASE.md)** — Schema de BD (próximamente)

---

## 🛠️ Setup Local (Futuro)

```bash
# Clonar repo
git clone https://github.com/XaviPirata/pscieloapp.git
cd pscieloapp

# Variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Levantar stack (Docker Compose)
docker-compose up -d

# Backend en http://localhost:8000
# Frontend en http://localhost:3000
# API docs en http://localhost:8000/api/docs
```

---

## 📋 Estado del Proyecto

### ✅ Completado
- Análisis de requisitos
- Diseño de arquitectura
- Plan de desarrollo (4 fases)
- Documentación inicial

### 🔄 En Progreso
- **ETAPA 1:** Infraestructura cloud (Coolify setup)

### ⏳ Próximo
- Sprint 1: Backend base + autenticación
- Sprint 2: Frontend con Neumorphism
- Sprint 3: Módulos core (profesionales, pacientes, derivaciones)
- Sprint 4: Dashboard + deploy final

---

## 📂 Estructura

```
pscieloapp/
├── DEVELOPMENT_PLAN.md         # Plan completo
├── ONBOARDING.md               # Resumen + contexto
├── README.md                   # Este archivo
├── docker-compose.yml          # Stack (próximamente)
├── .env.example                # Variables (próximamente)
├── backend/                    # FastAPI app (próximamente)
├── frontend/                   # Next.js app (próximamente)
├── docs/                       # Documentación adicional
└── .gitignore
```

---

## 👤 Equipo

- **Propietario:** PsCielo
- **Desarrollo:** Claude Code + XaviPirata
- **Stack:** Python + TypeScript + PostgreSQL

---

## 📞 Contacto

- **Email:** pscielo@example.com
- **Dominio:** pscielo.com

---

**¿Dudas?** Lee [ONBOARDING.md](ONBOARDING.md) o [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)

---

*Última actualización: 8 de Abril 2026*
