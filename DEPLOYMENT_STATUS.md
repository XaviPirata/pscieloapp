# PsCielo - Estado de Deployment (16 de Abril 2026)

## 📍 Ubicación Actual en el Plan

**Fase:** Producción - MVP Core + Consultorios Funcionales
**Estado:** Consultorios CRUD completo con schedule semanal, deploy en Coolify activo
**Progreso:** 90% - Core funcional, Consultorios operativos, UI mobile-first

---

## ✅ Pasos Completados

### Paso 1: Fix Código Backend
- ✅ Eliminado `cors-middleware==0.1` de `requirements.txt` (paquete inexistente)
- ✅ Backend FastAPI con todos los modelos, APIs y configuración lista
- ✅ Celery tasks framework implementado (pero sin tareas programadas aún)

### Paso 2: Docker Compose Producción
- ✅ Creado `docker-compose.prod.yml` con:
  - PostgreSQL 16 (volumen persistente)
  - Redis 7 (volumen persistente)
  - FastAPI backend (2 workers, no reload)
  - Celery worker
  - Next.js frontend (multi-stage build)
  - Variables de entorno parametrizadas

### Paso 3: Script de Seed (SUPERADMIN inicial)
- ✅ Creado `backend/app/seed.py` — crea usuario inicial de forma idempotente
- ✅ Hookeado en `app/main.py` lifespan event
- ✅ Credenciales iniciales:
  - Email: `jimepucheta@pscielo.com`
  - Contraseña: `josefina1905`

### Paso 4: Coolify Configuración (Completo)
- ✅ App creada en Coolify: UUID `b10m3udi0teiffwkogtmoep7`
- ✅ 7 variables de entorno cargadas y validadas
- ✅ Infraestructura DNS configurada:
  - `panel.pscielo.app` → `89.116.214.228`
  - `api.pscielo.app` → `89.116.214.228`
  - TTL: 3600 segundos

### Paso 5: Push a GitHub + Deploy Inicial
- ✅ Commit inicial con seed, docker-compose.prod, DNS listo
- ✅ Coolify detectó cambios y comenzó builds automáticos
- ✅ Frontend y backend compilando en contenedores

### Paso 6: Rediseño Mobile-First (Hoy 12 de Abril)
- ✅ **Bug crítico corregido:** Framer Motion sobreescribía `display:none` en sidebar
  - Fix: Wrapper `<div className="hidden lg:block">` aislando motion components

- ✅ **Página Pacientes:**
  - Stats `grid-cols-2 sm:grid-cols-4` (responsive)
  - Tarjetas mobile (`lg:hidden`) con toda la info legible
  - Tabla desktop solo a partir de `lg` (1024px+)

- ✅ **Página Sesiones:**
  - Lista agrupada por día en mobile (cleanest UX)
  - Calendario grid solo en desktop

- ✅ **Página Profesionales:**
  - Tarjetas siempre en mobile (2 cols a 666px, 1 col en 390px real)
  - Vista lista solo en desktop

- ✅ **Header optimizado:**
  - Botones compactos en mobile
  - Notificaciones/búsqueda ocultas `< md`
  - Bottom nav limpia con indicadores activos

- ✅ **Deployment:**
  - Commit: `b854916`
  - Push a `main` exitoso
  - Deploy en Coolify completado

### Paso 7: Consultorios Funcionales (16 de Abril)

- ✅ **Backend - Endpoints nuevos:**
  - `GET /rooms/{id}/schedule?week_start=YYYY-MM-DD` — Horario semanal (Lun-Vie, 08:00-20:00)
  - `DELETE /rooms/{id}` — Eliminación con validación de sesiones asociadas
  - Schemas: ScheduleSlot, DaySchedule, RoomScheduleResponse
  - Campo `hourly_rate` agregado al modelo Room

- ✅ **Backend - Seed completo:**
  - 4 consultorios (C1-C4) con descripción, capacidad, tarifa, amenities
  - 4 profesionales (Andrea, Yamila, Martín, Lucía) con cuentas de usuario
  - 7 pacientes demo
  - 10 sesiones distribuidas Lun-Vie con estados variados

- ✅ **Frontend - Página /dashboard/rooms COMPLETA:**
  - Reemplazó "Coming Soon" con funcionalidad real
  - 4 tarjetas StatCard: Total, Disponibles, Alquilados, Tarifa Promedio
  - Grid de tarjetas por consultorio con estado, capacidad, tarifa, amenities
  - Modal crear/editar consultorio (nombre, estado, descripción, capacidad, tarifa, amenities)
  - Modal eliminar con confirmación
  - Modal horario semanal con navegación por semana
    - Mobile: lista por día (slot cards)
    - Desktop: grilla horaria Lun-Vie
  - Conectado a API real (NO datos demo)
  - 100% mobile-first responsive

- ✅ **Deployment:**
  - Commit: `635cbd2`
  - Push a `main` exitoso
  - Deploy en Coolify disparado (UUID: `ajoouqn92cg14odpya82v70z`)

---

## ⏳ Pasos Pendientes Inmediatos

### A) Conectar páginas existentes al backend real
**Estado:** PENDIENTE
**Descripción:** Pacientes, Sesiones y Profesionales usan datos demo hardcodeados. Hay que reemplazar con llamadas a la API real (como se hizo con Consultorios).
**Páginas a conectar:**
- [ ] `/dashboard/patients` — usar `GET /patients`, `POST /patients`, etc.
- [ ] `/dashboard/sessions` — usar `GET /sessions`, `POST /sessions`, etc.
- [ ] `/dashboard/professionals` — usar `GET /professionals`, `POST /professionals`, etc.
- [ ] `/dashboard` (home) — stats reales desde API

### B) Comisiones Automáticas
**Estado:** PENDIENTE (prerequisito: consultorios ✅)
**Descripción:** Celery task semanal que calcula comisiones por profesional.

### C) Reportes y Analytics
**Estado:** PENDIENTE
**Descripción:** Dashboard con KPIs, gráficos, exportación PDF.

---

## 🚧 Roadmap Fase 2-3: Comisiones, Reportes, Integraciones

### Timeline Realista (basado en arquitectura actual)

#### ✅ COMPLETADO: **Consultorios (Rooms)**
- Backend: CRUD + schedule semanal + delete con validación
- Frontend: Tarjetas, modals crear/editar/eliminar, horario semanal mobile+desktop
- Seed: 4 consultorios con datos completos

#### Próximo: **Comisiones Automáticas - Celery + Dashboard**
**Por qué es importante:** Es donde se genera el dinero. Debe ser automático, auditado, preciso.

Tareas:
1. **Backend Task (3-4 días):**
   - Celery task `calculate_weekly_commissions.py`
   - Lógica:
     ```
     FOR cada profesional en la semana:
       total_sessions = COUNT(sesiones donde status=ATTENDED)
       revenue = total_sessions × hourly_rate
       commission = revenue × commission_percentage
       INSERT audit_log + commission_record
     ```
   - Scheduled: todos los domingos 23:59 UTC via Celery Beat
   - CRITICAL: usar transacciones DB para evitar double-counting

2. **Frontend Dashboard (2-3 días):**
   - Página `/dashboard/commissions`
   - Tabla: Profesional | Semana | Sesiones | Monto | Comisión % | $ Comisión
   - Filtros: por semana, por profesional, por rango de fechas
   - Botón "Exportar PDF" (weasyprint)

3. **Backend Audit (1 día):**
   - Endpoint `GET /commissions/{id}/audit` - ver cálculo paso a paso
   - Endpoint `POST /commissions/{id}/approve` - firma manual del admin

**Salida:** Comisiones automáticas auditables, exportables

---

#### Semana 5-6: **Reportes & Analytics - Dashboard**
**Por qué es importante:** Owner necesita ver KPIs: ¿cuánto facturé? ¿qué profesional vende más? ¿tasa de no-show?

Tareas:
1. **Backend Endpoints (2-3 días):**
   - `GET /reports/kpis?from=DATE&to=DATE` - sesiones, ingresos, tasa asistencia
   - `GET /reports/professional-ranking` - top profesionales por ingresos
   - `GET /reports/patient-acquisition` - fuentes de derivación (Instagram, Google, etc)
   - `GET /reports/no-show-analysis` - qué % de sesiones son canceladas/no-show

2. **Frontend Dashboards (3-4 días):**
   - Página `/dashboard/reports`
   - 4 tarjetas KPI grandes: Total Sesiones | Ingresos | Tasa Asistencia | Profesionales Activos
   - Gráfico línea: ingresos últimas 12 semanas
   - Tabla ranking profesionales
   - Tabla origen derivaciones

3. **Exportación (1 día):**
   - Botón "Descargar PDF" genera reporte completo para contador

**Salida:** Owner tiene visibilidad financiera y operativa

---

### Criterios de Salida para Cada Fase

| Fase | Backend | Frontend | Tests | Deploy |
|------|---------|----------|-------|--------|
| Consultorios | 95% | 100% mobile/desktop | 80%+ | Coolify auto |
| Comisiones | 100% transaccional | 100% con filtros | 90%+ | Coolify auto |
| Reportes | 100% + exports | 100% responsive | 80%+ | Coolify auto |

---

## 🔌 Integraciones Fase 4-5: Gmail, Instagram, WhatsApp

### Por qué después (no ahora)

**Motivo:** El core del negocio es gestión de sesiones + comisiones. Las integraciones son nice-to-have que generan ruido si no está el core sólido.

**Timeline:** Después de que Consultorios + Comisiones estén en producción (fin de mayo aprox)

---

### **Gmail Integration (Ver correos de consultas)**

**Objetivo:** Monitor las consultas que llegan al email del centro, marcar como "visto" en PsCielo.

**Arquitectura:**
1. **Google OAuth2**
   - User autoriza PsCielo a leer sus emails
   - Token almacenado en `user_integrations` tabla

2. **Celery Task:** `sync_gmail_inbox.py` (cada 5 min)
   - Fetch últimos 10 emails de Gmail API
   - Parse sender, subject, body
   - INSERT en tabla `email_messages`
   - Flag "unread" si es nuevo

3. **Frontend:**
   - Sidebar widget: "3 nuevos emails" con botón
   - Página `/dashboard/emails` - bandeja de entrada
   - Click en email → abre detalle, opción "responder" (abre Gmail)

**Stack:** `google-auth-oauthlib`, `google-api-python-client`

**Complejidad:** Media (2-3 días)

---

### **Instagram DMs (Notificaciones + Auto-reply)**

**Objetivo:** Ver DMs de Instagram sin salir de PsCielo, auto-responder con "Tenemos disponibilidad el..."

**Arquitectura:**
1. **Instagram Business Account + Graph API**
   - User vincula su business account
   - Token almacenado (con refresh logic)

2. **Celery Task:** `sync_instagram_dms.py` (cada 2 min)
   - Fetch DMs no leídos
   - Parse sender IG handle, message, timestamp
   - INSERT en tabla `instagram_messages`

3. **Auto-reply Celery Task:** `auto_reply_instagram.py`
   - Si mensaje contiene keywords ("disponibilidad", "horario", "cita")
   - Y sender no es professional conocido
   - POST a Graph API: respuesta templated
   - Marcar como "respondido automático"

4. **Frontend:**
   - Sidebar: "2 nuevos DMs de Instagram"
   - Página `/dashboard/instagram` - bandeja DMs
   - Badge contador unread

**Stack:** `requests` + Graph API, templates para respuestas

**Complejidad:** Media-Alta (3-4 días por requerimientos de Meta)

---

### **WhatsApp (Notificaciones + Confirmaciones de Cita)**

**Objetivo:** Enviar recordatorio 24h antes de sesión. Paciente confirma "✓" en WhatsApp. Actualiza status en PsCielo.

**Arquitectura:**
1. **Twilio WhatsApp API** (o Baileys si es número regular)
   - Twilio: +$ mensual pero soporte oficial
   - Baileys: free pero reverse engineering (riesgo bans)

2. **Celery Task:** `send_session_reminders.py` (cada día a las 9am)
   - Fetch sesiones de mañana (status=SCHEDULED o CONFIRMED)
   - Para cada paciente con phone number
   - Enviar vía Twilio: "Tu sesión con [prof] es mañana a las [hora] en [room]"

3. **Webhook Celery Task:** `process_whatsapp_confirmation.py`
   - Twilio webhook → recibe confirmación del paciente
   - Si mensaje = "✓" → UPDATE session.status = "CONFIRMED"
   - Responder: "Gracias por confirmar! Te esperamos"

4. **Frontend:**
   - En detalles de sesión, ver status "Confirmado por WhatsApp" + timestamp
   - Opción para enviar recordatorio manual

**Stack:** `twilio`, Celery webhooks

**Complejidad:** Alta (porque flujo bidireccional + webhooks)

---

## 📊 Priorización de Fases

```
🟢 HACER AHORA (Semana 1-2):
   - Validar deploy mobile en prod
   - Empezar Consultorios (sin Consultorios no hay sesiones claras)

🟡 HACER DESPUÉS (Semana 3-4):
   - Comisiones automáticas (CRITICAL para financiero)
   - Reportes (CRITICAL para owner visibility)

🔵 HACER DESPUÉS (Semana 5+):
   - Gmail (nice-to-have, reduce switch de apps)
   - Instagram (marketing, genera clientes)
   - WhatsApp (UX, confirmaciones automáticas)
```

---

## 🎯 MVP Producción vs Roadmap

### MVP Core (AHORA - Abril 2026)
- ✅ Usuarios (SUPERADMIN/ADMIN/PROFESSIONAL/READONLY)
- ✅ Profesionales (CRUD)
- ✅ Pacientes (CRUD)
- ✅ Sesiones (CRUD + calendar)
- ⏳ Consultorios (TODO)
- ❌ Comisiones (no automáticas aún)
- ❌ Reportes (solo Coming Soon)
- ❌ Integraciones (no implementadas)

### MVP + Financiero (Mayo 2026)
- ✅ Todo lo anterior
- ✅ Consultorios (COMPLETADO 16 Abril)
- ⏳ Conectar Pacientes/Sesiones/Profesionales a API real
- ⏳ Comisiones automáticas
- ⏳ Reportes básicos
- ❌ Integraciones

### Full Stack (Junio 2026)
- ✅ Todo lo anterior
- ✅ Gmail sync
- ✅ Instagram DMs
- ✅ WhatsApp confirmaciones
- ✅ Panel Profesionales (si querés)

---

## 🔐 Estado de Deployment Actual

| Componente | Estado | URL |
|------------|--------|-----|
| **Frontend** | Building (Coolify) | https://panel.pscielo.app |
| **Backend** | Building (Coolify) | https://api.pscielo.app |
| **PostgreSQL** | Running | internal:5432 |
| **Redis** | Running | internal:6379 |
| **Celery Worker** | Running | internal |
| **Traefik Proxy** | Running | 89.116.214.228:80/443 |

**Último Deployment UUID:** `ajoouqn92cg14odpya82v70z` (16 Abril 2026)
**Commit:** `635cbd2` — Consultorios funcionales

---

## 📝 Notas Importantes

### Mobile-First es NOW
El usuario hizo una crítica muy válida: 2026, ¿por qué no es mobile-first? Ahora lo es. SIEMPRE verificar en Chrome DevTools 390px antes de merge.

### Framer Motion + Tailwind Pitfall
`motion.div` y `motion.aside` sobrescriben `display:none` con inline `display: block`. Workaround: wrapper `<div className="hidden ...">` que no usa motion.

### Backend Parcialmente Conectado
Consultorios ya usa la API real. Pacientes, Sesiones y Profesionales TODAVÍA usan datos demo hardcodeados. Próximo step: conectar esas 3 páginas al backend.

### Coolify Deploy Automático
Cada push a `main` → Coolify detecta → git pull + rebuild + restart. CERO downtime porque docker-compose hace rolling restart.

---

## 🚀 Próximos Comandos (Cuando Deploy Termine)

```bash
# Validar acceso
curl https://panel.pscielo.app
curl https://api.pscielo.app/health

# Ver logs en Coolify
# http://89.116.214.228:8000/projects/t2sqolm6y803tce1ovjlnjtr

# Si algo falla
# Reimaginar el approach y hacer un fix commit + push (Coolify re-deploya automático)
```

---

*Último update: 16 de Abril 2026*
*Estado: Consultorios funcionales + CRUD real. Próximo: conectar Pacientes/Sesiones/Profesionales a API + Comisiones*
