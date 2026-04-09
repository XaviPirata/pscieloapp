# PsCielo - Onboarding & Contexto de Desarrollo

**Última actualización:** 8 de Abril 2026  
**Estado del proyecto:** Fase de Planificación (Pre-Sprint 1)  

---

## 📖 Resumen de la Conversación Inicial

### El Problema Original

PsCielo es un **centro psicológico con 4 consultorios y ~15 profesionales** que se gestiona actualmente con **Excel manual**. Los problemas:

1. **Sin auditoría:** No se sabe quién canceló pacientes, cuándo, por qué
2. **Información dispersa:** Google Sheets de profesionales + Excel local = desincronización
3. **Cálculo manual de comisiones:** Semanalmente se calcula a mano → errores
4. **Sin historial de pacientes:** No hay seguimiento de retención, asistencias
5. **Sin análisis financiero:** No sé si realmente gano plata o pierdo

### La Visión

Un **sistema web profesional, escalable y estético** que:

✅ Centralice TODA la información (profesionales, pacientes, calendarios, finanzas)  
✅ Tenga **auditoría inmutable** de cambios  
✅ Calcule **comisiones automáticamente** cada semana  
✅ Integre **Gmail e Instagram** (canales de consulta)  
✅ Muestre un **dashboard ejecutivo** con P&L mensual  
✅ Sea **100% cloud** — accesible desde cualquier PC  
✅ **Escalable:** Hoy para 15 profesionales, mañana para 50  

---

## 🏗️ Lo que ya tenemos

### Documentación
- ✅ `DEVELOPMENT_PLAN.md` — Plan completo (stack, BD, fases, sprints)
- ✅ `ONBOARDING.md` — Este archivo (resumen + contexto)
- ✅ `.env.example` — Variables de entorno (aún no creado, próximo paso)

### Repo Git
- ✅ GitHub privado: https://github.com/XaviPirata/pscieloapp.git
- ✅ Rama `main` con primer commit (el plan)
- ✅ Acceso: Vos (XaviPirata) eres owner

### Decisiones Clave Confirmadas
1. **Stack:** Python (FastAPI) + Next.js + PostgreSQL + Redis + Celery
2. **Deploy:** Coolify en VPS Hostinger (Ubuntu 24.04 LTS, 8GB RAM)
3. **Dominio:** pscielo.com
4. **Estética:** Neumorphism / Soft UI (paleta pastel + animaciones)
5. **Notificaciones:** Email (MVP), WhatsApp arquitectado (sin activar)
6. **Instagram:** Integrado desde el inicio (Meta Graph API)

---

## 💼 Lo que FALTA hacer

### ETAPA 1: Infraestructura Cloud (Esta semana)

**Objetivo:** Coolify funcionando + primer deploy vacío

**Tareas:**
1. [ ] Inspeccionar VPS actual (ver qué hay ahora)
2. [ ] Instalar Coolify en VPS Hostinger (comandos específicos)
3. [ ] Conectar GitHub a Coolify (OAuth token)
4. [ ] Crear `docker-compose.yml` base (postgres, redis, backend, frontend)
5. [ ] Crear `.env.example` con todas las variables
6. [ ] Primer deploy: backend vacío + frontend vacío + BD corriendo
7. [ ] Verificar SSL automático en pscielo.com

**Resultado esperado:** https://pscielo.com carga login page

---

### ETAPA 2: Backend Base (Semanas 2-3)

**Stack:**
- FastAPI con Pydantic validation
- PostgreSQL con SQLAlchemy ORM
- Alembic para migraciones
- Celery para tareas async

**Endpoint mínimo:**
- POST `/auth/login` — devuelve JWT
- GET `/api/docs` — Swagger funcionando

---

### ETAPA 3: Frontend Base (Semana 4)

**Setup:**
- Next.js 14 con App Router
- Tailwind CSS + Neumorphism custom
- Framer Motion para animaciones
- TypeScript

**Componentes mínimos:**
- Login page (formulario funcional)
- Dashboard page (esqueleto)
- Sidebar con navegación

---

### ETAPA 4: Modelos & CRUD (Semanas 5-6)

**Modelos de BD a crear:**
- users, professionals, rooms, room_rentals
- patients, referrals, sessions
- availability, audit_logs, notifications
- income_records, expenses
- weekly_commission_summaries

**CRUD endpoints:**
- Profesionales (crear, listar, actualizar, eliminar)
- Consultorios + alquileres
- Pacientes
- Derivaciones

---

## 🚀 Cómo Continuar desde tu PC Personal

### Paso 1: Clonar el repositorio

```bash
# En tu PC personal, en la carpeta donde quieras trabajar
git clone https://github.com/XaviPirata/pscieloapp.git
cd pscieloapp

# Verificar que está todo
ls -la
cat DEVELOPMENT_PLAN.md  # Leer el plan completo
```

### Paso 2: Configurar Git

```bash
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
```

### Paso 3: Leer la Documentación

**Orden recomendado:**
1. **DEVELOPMENT_PLAN.md** — Entiende la arquitectura completa
2. **ONBOARDING.md** — Este archivo (contexto rápido)
3. **Próximamente:** API.md, DATABASE.md (cuando tengamos código)

### Paso 4: Antes de escribir código

Necesitamos completar **ETAPA 1 (Infraestructura)**. Para eso:

1. Conectate por SSH a la VPS Hostinger
2. Corre estos comandos:

```bash
# Ver qué hay ahora
systemctl list-units --type=service --state=running | grep -E 'nginx|apache|docker'
sudo netstat -tulpn | grep LISTEN
docker --version 2>/dev/null || echo "Docker no instalado"
```

3. Reporta los resultados (vamos a compartir en un issue o en la próxima sesión)

---

## 📋 Checklist para Empezar

### En tu PC personal (primero)

- [ ] Git instalado (`git --version`)
- [ ] SSH key configurada en GitHub (https://github.com/settings/keys)
- [ ] Clonar repo: `git clone https://github.com/XaviPirata/pscieloapp.git`
- [ ] Leer `DEVELOPMENT_PLAN.md` completamente
- [ ] Editor de código (VS Code, PyCharm, etc.)

### En la VPS Hostinger (después)

- [ ] Acceso SSH con credenciales root
- [ ] Ubuntu 24.04 LTS
- [ ] 8GB RAM
- [ ] Ejecutar comandos de inspección (arriba)

---

## 🎯 Próximas Decisiones Pendientes

1. **VPS actual:** ¿Qué hay corriendo? (nginx, Docker, etc.)
   → Necesario para decidir si limpiamos o coexistimos

2. **Coolify:** ¿Ya instalado o from scratch?
   → Hoy es from scratch

3. **Variables de entorno:** 
   → Crear `.env.example` cuando sepamos todas las integraciones

---

## 📚 Estructura del Repo Actual

```
pscieloapp/
├── DEVELOPMENT_PLAN.md    ✅ (completo)
├── ONBOARDING.md          ✅ (este archivo)
├── README.md              ⏳ (a crear)
├── docker-compose.yml     ⏳ (a crear)
├── .env.example           ⏳ (a crear)
├── backend/               ⏳ (a crear)
├── frontend/              ⏳ (a crear)
└── .gitignore             ⏳ (a crear)
```

---

## 🔗 Enlaces Importantes

- **Repo GitHub:** https://github.com/XaviPirata/pscieloapp
- **Dominio:** pscielo.com
- **VPS Provider:** Hostinger (KVM 2, Ubuntu 24.04 LTS, 8GB RAM)

---

## 💬 Notas Importantes

### Estética es FUNDAMENTAL
No es "un panel más". Debe ser:
- Moderno (Neumorphism / Soft UI)
- Invitante (colores pasteles: rosa `#FFD6E0`, celeste `#D6EAF8`)
- Armónico (animaciones suaves, sin saltos)
- Responsive (mobile-first)

Si algún componente se ve "junior" → rechazarlo.

### Escalabilidad desde el inicio
No hacemos un sistema para "15 profesionales actuales". Hacemos uno que aguante:
- 50+ profesionales
- Múltiples centros (futuro)
- Telemedicina (futuro)
- CRM + marketing (futuro)

### Código SENIOR
- Type-safe (TypeScript, Pydantic)
- Tests desde el inicio
- Documentación auto (Swagger)
- Error handling robusto
- Logging estructurado

---

## 🆘 Si Tenés Dudas

1. **Sobre el stack:** Lee DEVELOPMENT_PLAN.md sección "Stack Tecnológico"
2. **Sobre la arquitectura:** Lee sección "Arquitectura del Sistema"
3. **Sobre qué hacer primero:** Lee sección "Plan por Sprint"

---

**¿Listo para clonar en tu PC personal?** ✨
