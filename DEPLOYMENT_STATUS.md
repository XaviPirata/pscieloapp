# PsCielo - Estado de Deployment (11 de Abril 2026)

## 📍 Ubicación Actual en el Plan

**Fase:** Pre-Producción (Paso 4 de 5)
**Estado:** En configuración de DNS y Coolify
**Progreso:** 80% completo

---

## ✅ Pasos Completados

### Paso 1: Fix Código Backend
- ✅ Eliminado `cors-middleware==0.1` de `requirements.txt` (paquete inexistente)
- ✅ Backend FastAPI con todos los modelos, APIs y configuración lista

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

### Paso 4A: Coolify Configuración (Parcial)
- ✅ App creada en Coolify: UUID `b10m3udi0teiffwkogtmoep7`
- ✅ 7 variables de entorno cargadas:
  - `POSTGRES_PASSWORD` (generada 32 chars)
  - `SECRET_KEY` (generada 64 chars para JWT)
  - `SEED_SUPERADMIN_EMAIL` → `jimepucheta@pscielo.com`
  - `SEED_SUPERADMIN_PASSWORD` → `josefina1905`
  - `FRONTEND_DOMAIN` → `panel.pscielo.app` (actualizado)
  - `BACKEND_DOMAIN` → `api.pscielo.app`
  - `NEXT_PUBLIC_API_URL` → `https://api.pscielo.app`

### Paso 4B: Infraestructura DNS
- ✅ Decidido usar dominio nuevo: `pscielo.app` (por conflicto con Vercel en `pscielo.com`)
- ✅ Dominio comprado en **name.com**
- ✅ A records creados en name.com DNS:
  - `panel.pscielo.app` → `89.116.214.228` (frontend Next.js)
  - `api.pscielo.app` → `89.116.214.228` (backend FastAPI)
  - TTL: 3600 segundos
- ✅ Frontend Dockerfile actualizado para aceptar `NEXT_PUBLIC_API_URL` en build-time

---

## ⏳ Pasos Restantes

### Paso 4C: Verificar DNS Propagación
**Estado:** PENDIENTE - esperando confirmación del usuario
**Acción:**
```powershell
nslookup panel.pscielo.app
nslookup api.pscielo.app
```
**Criterio de éxito:** Ambos devuelven `Address: 89.116.214.228`

### Paso 4D: Actualizar Coolify Dominios
**Cuando:** Después de confirmación DNS
**Acción:**
- Parsear `docker-compose.prod.yml` desde GitHub
- Setear dominios por-servicio:
  - `frontend` → `panel.pscielo.app`
  - `backend` → `api.pscielo.app`
- Labels Traefik automáticos para SSL

### Paso 5: Push a GitHub + Deploy
**Cambios a commitear:**
```
backend/
  ├── requirements.txt (sin cors-middleware)
  ├── app/
  │   ├── main.py (seed hookeado)
  │   └── seed.py (nuevo)
  └── Dockerfile (sin cambios)

frontend/
  ├── Dockerfile (NEXT_PUBLIC_API_URL arg agregado)
  └── app/ (sin cambios críticos)

docker-compose.prod.yml (nuevo)
DEPLOYMENT_STATUS.md (este archivo)
```

**Comando:**
```bash
git add backend/requirements.txt backend/app/main.py backend/app/seed.py \
        frontend/Dockerfile docker-compose.prod.yml DEPLOYMENT_STATUS.md
git commit -m "feat: prep para producción - seed, docker-compose.prod, DNS listo"
git push origin main
```

**Resultado:** Coolify detecta cambio en `main`, parsea `docker-compose.prod.yml`, despliega automáticamente

### Verificación Post-Deploy
```bash
# Backend health check
curl https://api.pscielo.app/health

# Frontend acceso
curl https://panel.pscielo.app

# Login con SUPERADMIN
Email: jimepucheta@pscielo.com
Contraseña: josefina1905
```

---

## 🏗️ Dominio Principal: Decisión Arquitectónica

### Escenario Original
- `pscielo.com` alojado en **Vercel** (web institucional)
- Nameservers apuntaban a **Vercel DNS** (ns1.vercel-dns.com, ns2.vercel-dns.com)
- Conflicto: no podía agregar subdomios para la VPS sin romper la web

### Solución Elegida
- Sistema PsCielo en **dominio nuevo: `pscielo.app`**
- `pscielo.com` sigue en Vercel sin cambios
- `pscielo.app` apunta a VPS Hostinger (89.116.214.228)
- **Ventaja:** Cero riesgo, arquitectura limpia, ambos servicios independientes

### Dominios Finales
| Dominio | Servicio | Proveedor | Estado |
|---------|----------|-----------|--------|
| `pscielo.com` | Web institucional | Vercel | ✅ Operativa |
| `panel.pscielo.app` | Frontend PsCielo | Coolify (VPS) | ⏳ Por activar |
| `api.pscielo.app` | Backend PsCielo | Coolify (VPS) | ⏳ Por activar |

---

## 🔐 Credenciales & Secretos

| Concepto | Valor | Almacenado | Seguridad |
|----------|-------|-----------|----------|
| JWT Secret | `OErYMCA9zhXEYDMsMN0AQorO2IsHFloFOvqvHExndC2OcTHDaUELxFsTleFzyjcL` | Coolify Env Var | ✅ Generada aleatoria |
| PostgreSQL Password | `A7h7TrvYf6KQN_iyeJ9riQ89k3GzGpYb` | Coolify Env Var | ✅ Generada aleatoria |
| SUPERADMIN Email | `jimepucheta@pscielo.com` | Coolify Env Var | ℹ️ Visible en UI |
| SUPERADMIN Password | `josefina1905` | Coolify Env Var | ⚠️ Cambiar en primer login |

**Nota:** Después del primer login, el usuario deberá cambiar la contraseña en la aplicación. Implementar endpoint de "Forgot Password" en Fase 2.

---

## 📊 Checklist Final Antes de Push

- [ ] DNS propagó correctamente (`nslookup` devuelve 89.116.214.228)
- [ ] Coolify app UUID `b10m3udi0teiffwkogtmoep7` visible en dashboard
- [ ] 7 env vars cargadas en Coolify
- [ ] `docker-compose.prod.yml` en repo local y listo para push
- [ ] `backend/app/seed.py` implementado
- [ ] `backend/requirements.txt` sin `cors-middleware`
- [ ] `frontend/Dockerfile` con `ARG NEXT_PUBLIC_API_URL`
- [ ] Repo aún es **público** (después de push, volver a **privado**)
- [ ] Git commit mensaje descriptivo y completo

---

## 🎯 Próximos Pasos (Fase 2+)

1. **Verificar DNS + Deploy** (Esta sesión)
2. **Fase 2: Financiero & Reportes**
   - Comisiones automáticas (Celery scheduled)
   - P&L dashboard
   - Exportación PDF
3. **Fase 3: Panel Profesionales**
   - Login para profesionales
   - Mi agenda, mis comisiones
4. **Fase 4: CRM & Marketing**
   - Instagram DMs unificado
   - Análisis de retención

---

*Último update: 11 de Abril 2026 - 18:50 UTC*
