# Registro de Defectos — StageFront

> Fase 4. Defectos identificados durante la auditoría de calidad (2026-06-21).
> Severidad = impacto técnico · Prioridad = urgencia de corrección.
> Entorno base: local (Express :3001, Vite :5173, Postgres 16, Mongo 7).

---

## DEF-001 — Endpoints de administración sin autenticación
- **Descripción:** Las rutas `/api/v1/admin/*` no validan ninguna credencial; cualquier cliente puede leer estadísticas, crear/editar/eliminar eventos y órdenes.
- **Pasos para reproducir:** 1) `curl http://localhost:3001/api/v1/admin/stats` sin cabeceras. 2) Observar `200` con datos.
- **Evidencia esperada:** Respuesta `200` con métricas completas; `DELETE /api/v1/admin/events/:id` elimina sin auth.
- **Severidad:** Crítica · **Prioridad:** P1 · **Estado:** Abierto · **Responsable:** Backend
- **Referencia:** `routes/index.ts` (comentario "no auth — proteger en producción"), `SECURITY_REPORT` A01.

## DEF-002 — Credenciales de administrador hardcodeadas en el cliente
- **Descripción:** El usuario/contraseña admin (`admin@stagefront.mx / admin123`) están en `AdminAuthContext.tsx`, visibles en el bundle del navegador.
- **Pasos para reproducir:** 1) Abrir DevTools → Sources → buscar `CREDENTIALS`. 2) Ver las credenciales en claro.
- **Evidencia esperada:** Constante `CREDENTIALS` con email y password en el JS del cliente.
- **Severidad:** Alta · **Prioridad:** P1 · **Estado:** Abierto · **Responsable:** Frontend/Backend
- **Referencia:** `SECURITY_REPORT` A07.

## DEF-003 — Validación de entrada inexistente (Zod sin usar)
- **Descripción:** Los controllers confían en `req.body` sin validar tipos/longitudes; `zod` está instalado pero no se usa. Permite payloads malformados y posibles `500`.
- **Pasos para reproducir:** 1) `POST /api/v1/reviews` con `rating: "abc"`. 2) Observar error no controlado / 500.
- **Evidencia esperada:** Sin esquema de validación previo al acceso a DB.
- **Severidad:** Alta · **Prioridad:** P2 · **Estado:** Abierto · **Responsable:** Backend.

## DEF-004 — Update/Delete admin devuelve 500 en vez de 404
- **Descripción:** `updateAdminEvent`, `updateAdminOrder`, `deleteAdminEvent` lanzan a `catch` (500) cuando el id no existe, en lugar de `404`.
- **Pasos para reproducir:** 1) `PATCH /api/v1/admin/events/nonexistent-000` body `{"status":"published"}`. 2) Observar `500`.
- **Evidencia esperada:** `500 {"error":"Failed to update event"}` ante id inexistente.
- **Severidad:** Media · **Prioridad:** P2 · **Estado:** Abierto · **Responsable:** Backend
- **Referencia:** `admin.integration.test.ts` (test documenta `[404,500]`).

## DEF-005 — Variables declaradas y no usadas (detectadas al endurecer tsconfig)
- **Descripción:** Al activar `noUnusedLocals/noUnusedParameters` en `backend/tsconfig.json` se detectaron 4 bindings sin uso (`catch (error)` ×3, `req` ×1).
- **Pasos para reproducir:** 1) `cd backend && npx tsc --noEmit` antes de la corrección. 2) Errores `TS6133`.
- **Evidencia esperada:** 3 errores ESLint `no-unused-vars` + 1 `TS6133`.
- **Severidad:** Baja · **Prioridad:** P3 · **Estado:** **Resuelto** (esta auditoría) · **Responsable:** Backend.

## DEF-006 — CORS abierto a cualquier origen
- **Descripción:** `app.use(cors())` sin opciones permite peticiones desde cualquier origen.
- **Pasos para reproducir:** 1) Petición `fetch` desde un origen arbitrario. 2) Cabecera `Access-Control-Allow-Origin: *`.
- **Evidencia esperada:** Respuesta con CORS permisivo.
- **Severidad:** Media · **Prioridad:** P2 · **Estado:** Abierto · **Responsable:** Backend
- **Referencia:** `SECURITY_REPORT` A05.

## DEF-007 — Sin cabeceras de seguridad (helmet)
- **Descripción:** No se envían cabeceras `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, etc.
- **Pasos para reproducir:** 1) `curl -I http://localhost:3001/health`. 2) Ausencia de cabeceras de seguridad.
- **Evidencia esperada:** Respuesta sin cabeceras protectoras.
- **Severidad:** Media · **Prioridad:** P2 · **Estado:** Abierto · **Responsable:** Backend.

## DEF-008 — Dependencias frontend con vulnerabilidades conocidas
- **Descripción:** `npm audit` (frontend) reporta 5 vulnerabilidades (1 baja, 3 moderadas, 1 alta), incluyendo open-redirect en `react-router` y exposición del dev-server de `esbuild`.
- **Pasos para reproducir:** 1) `cd frontend && npm audit`.
- **Evidencia esperada:** `5 vulnerabilities (1 low, 3 moderate, 1 high)`.
- **Severidad:** Alta · **Prioridad:** P2 · **Estado:** Abierto · **Responsable:** Frontend
- **Referencia:** `SECURITY_REPORT` A06.

## DEF-009 — Logging no estructurado y plan no implementado
- **Descripción:** El código usa `console.*`; `LOGGING.md` documenta Winston/Morgan pero no está implementado. Sin niveles, JSON ni correlation-ID.
- **Pasos para reproducir:** 1) Revisar `grep -rn "console\." backend/src`. 2) Confirmar ausencia de `winston`/`morgan` en `package.json`.
- **Evidencia esperada:** Solo 2 `console.*`; sin dependencias de logging.
- **Severidad:** Media · **Prioridad:** P3 · **Estado:** Abierto · **Responsable:** Backend
- **Referencia:** `OBSERVABILITY_REPORT`.

## DEF-010 — `ticketsSold` es un valor derivado/heurístico
- **Descripción:** En `statsController`, `ticketsSold = orderCount * 2` (aproximación) en vez de contar `order_items` reales, lo que reporta una métrica de negocio inexacta.
- **Pasos para reproducir:** 1) `GET /api/v1/stats`. 2) Comparar `ticketsSold` con el conteo real de `order_items`.
- **Evidencia esperada:** Valor = nº de órdenes × 2.
- **Severidad:** Baja · **Prioridad:** P3 · **Estado:** Abierto · **Responsable:** Backend.

## DEF-011 — Stats falla (500) si MongoDB no está conectado
- **Descripción:** `getPublicStats` llama `Review.countDocuments()`; si Mongoose no está conectado, la consulta hace buffering ~10s y termina en `500`, degradando un endpoint que es 90% relacional.
- **Pasos para reproducir:** 1) Levantar la API sin conexión Mongo. 2) `GET /api/v1/stats` → espera ~10s → `500`.
- **Evidencia esperada:** Timeout de buffering de Mongoose.
- **Severidad:** Media · **Prioridad:** P3 · **Estado:** Abierto · **Responsable:** Backend
- **Nota:** detectado al construir la suite de integración (la conexión Mongo se añadió en el `setup` de tests).

---

### Resumen

| ID | Severidad | Prioridad | Estado |
|----|-----------|-----------|--------|
| DEF-001 | Crítica | P1 | Abierto |
| DEF-002 | Alta | P1 | Abierto |
| DEF-003 | Alta | P2 | Abierto |
| DEF-004 | Media | P2 | Abierto |
| DEF-005 | Baja | P3 | Resuelto |
| DEF-006 | Media | P2 | Abierto |
| DEF-007 | Media | P2 | Abierto |
| DEF-008 | Alta | P2 | Abierto |
| DEF-009 | Media | P3 | Abierto |
| DEF-010 | Baja | P3 | Abierto |
| DEF-011 | Media | P3 | Abierto |
