# Stagefront — Sistema de Logs

**Stack elegido:** Winston + Morgan + winston-daily-rotate-file  
**Scope:** Full transaction logs · Visibilidad de logs · Dashboard de errores

---

## 1. Dependencias a instalar

```bash
# backend/
npm install winston winston-daily-rotate-file morgan
npm install --save-dev @types/morgan
```

| Paquete | Versión | Rol |
|---|---|---|
| `winston` | ^3.x | Logger principal — niveles, formatos, transportes |
| `winston-daily-rotate-file` | ^5.x | Rotación de archivos diaria + retención configurable |
| `morgan` | ^1.x | Middleware HTTP — una línea por cada request/response |
| `@types/morgan` | dev | Tipos TypeScript para morgan |

---

## 2. Niveles de log usados

Winston usa los niveles npm en orden de severidad:

```
error (0) > warn (1) > info (2) > http (3)
```

| Nivel | Cuándo se usa |
|---|---|
| `error` | Excepciones no capturadas, fallos de base de datos, errores 500 |
| `warn` | Reglas de negocio rechazadas (precio de reventa >30%, compra bloqueada, zona sin lugares) |
| `info` | Transacciones exitosas (orden creada, evento publicado, reseña creada, CRUD admin) |
| `http` | Cada request HTTP (método, URL, status, tiempo de respuesta) — vía Morgan |

---

## 3. Archivos de log generados

```
backend/
└── logs/
    ├── error.log                 ← solo errores, archivo permanente
    └── combined-YYYY-MM-DD.log  ← error + warn + info + http, rotación diaria
```

**Política de retención:**
- `combined-*.log` → 30 días, máx 20 MB por archivo
- `error.log` → permanente (nunca rota, crece poco)

**Formato JSON de cada línea:**
```json
{
  "timestamp": "2026-06-01T14:30:00.000Z",
  "level": "info",
  "service": "stagefront",
  "message": "order.created",
  "orderId": "clu-abc123",
  "userId": "seed-user-demo",
  "eventId": "evt-xyz789",
  "total": 2500.00,
  "seats": 2,
  "promoCode": "STAGEFRONT10"
}
```

---

## 4. Archivos nuevos a crear

### Backend

```
backend/src/
├── lib/
│   └── logger.ts                ← instancia winston, config transportes, crea /logs/
├── middleware/
│   ├── requestLogger.ts         ← morgan → winston.http()
│   └── errorHandler.ts          ← catch-all Express error handler
└── controllers/
    └── logsController.ts        ← endpoints GET /admin/logs y /admin/logs/stats
```

### Frontend

```
frontend/src/
└── pages/
    └── AdminLogsPage.tsx        ← dashboard de logs (ruta /admin/logs)
```

---

## 5. Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/src/index.ts` | Agregar `requestLogger` antes de rutas, `errorHandler` al final |
| `backend/src/routes/index.ts` | Agregar rutas `GET /admin/logs` y `GET /admin/logs/stats` |
| `backend/src/controllers/ordersController.ts` | `logger.info` en orden creada, `logger.warn` en rechazos, `logger.error` en catch |
| `backend/src/controllers/adminController.ts` | `logger.info` en CRUD de eventos/órdenes, `logger.error` en catch |
| `backend/src/controllers/eventsController.ts` | `logger.error` en catch blocks |
| `backend/src/controllers/reviewsController.ts` | `logger.info` en reseña creada, `logger.error` en catch |
| `backend/src/controllers/resalesController.ts` | `logger.info` en reventa creada, `logger.warn` en precio inválido, `logger.error` en catch |
| `frontend/src/lib/api.ts` | Agregar `fetchAdminLogs()` y `fetchAdminLogStats()` |
| `frontend/src/App.tsx` | Agregar ruta `/admin/logs` con `AdminGuard` |
| `frontend/src/pages/AdminDashboardPage.tsx` | Agregar link de navegación a `/admin/logs` |

---

## 6. Eventos loggeados por controlador

### ordersController.ts
```
warn  → "order.rejected" { reason: "No seats selected" }
warn  → "order.rejected" { reason: canUserPurchase.reason }
warn  → "order.rejected" { reason: "One or more seats are unavailable" }
info  → "order.created"  { orderId, userId, eventId, total, seats, promoCode? }
error → "order.create_failed" { error }
```

### adminController.ts
```
info  → "admin.event.created"       { eventId, title, status }
info  → "admin.event.updated"       { eventId, fields: [...] }
info  → "admin.event.deleted"       { eventId }
info  → "admin.order.status_changed" { orderId, status }
info  → "admin.order.deleted"       { orderId }
error → "admin.*_failed"            { error }
```

### resalesController.ts
```
warn  → "resale.price_violation"    { seatId, originalPrice, requestedPrice }
info  → "resale.created"            { resaleId, seatId, sellerId, price }
error → "resale.create_failed"      { error }
```

### reviewsController.ts
```
info  → "review.created"            { reviewId, userId, eventId, rating }
error → "review.create_failed"      { error }
```

---

## 7. API endpoints de logs

### `GET /api/v1/admin/logs`
Devuelve entradas del log del día (o fecha especificada), paginadas.

**Query params:**
| Param | Default | Descripción |
|---|---|---|
| `level` | `all` | Filtro: `error`, `warn`, `info`, `http`, `all` |
| `date` | hoy | Fecha en formato `YYYY-MM-DD` |
| `limit` | `100` | Máx 500 |
| `offset` | `0` | Para paginación |

**Response:**
```json
{
  "data": [
    {
      "timestamp": "2026-06-01T14:30:00.000Z",
      "level": "info",
      "message": "order.created",
      "orderId": "...",
      "total": 2500
    }
  ],
  "total": 234
}
```

---

### `GET /api/v1/admin/logs/stats`
Estadísticas del día actual para el dashboard.

**Response:**
```json
{
  "data": {
    "counts": {
      "error": 5,
      "warn": 12,
      "info": 234,
      "http": 1893
    },
    "errorsByHour": [
      { "hour": "00:00", "count": 0 },
      { "hour": "01:00", "count": 1 },
      ...
      { "hour": "23:00", "count": 0 }
    ],
    "topErrors": [
      { "message": "order.create_failed", "count": 3 },
      { "message": "resale.create_failed", "count": 2 }
    ],
    "recentErrors": [ ...últimos 10 errores con metadata completa ]
  }
}
```

---

## 8. Dashboard de Logs — AdminLogsPage.tsx

**Ruta:** `/admin/logs`  
**Acceso:** protegido con `AdminGuard`  
**Diseño:** industrial-brutalist (igual que AdminDashboardPage)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [ SYSTEM LOGS ]  ← /admin         [ REFRESH ] [ DATE ] │
├──────────┬──────────┬──────────┬──────────────────────  │
│ ERRORS   │ WARNINGS │ INFO     │ HTTP                    │
│ 5        │ 12       │ 234      │ 1893                    │
├─────────────────────────────────────────────────────────┤
│  < ERROR RATE — ÚLTIMAS 24H >                           │
│                                                         │
│  ▄                                                      │
│  █▄  ▂                       ▂▄                         │
│  ████▄▂▄▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂████▂▂                      │
│  00  02  04  06  08  10  12  14  16  18  20  22         │
├─────────────────────────────────────────────────────────┤
│  [ TOP ERRORS HOY ]                                     │
│  order.create_failed ........................... 3      │
│  resale.create_failed .......................... 2      │
├──────────────────────────────────┬──────────────────────┤
│  FILTER: [ ALL ▼ ]  SEARCH: [__] │                      │
├──────────────────────────────────┘                      │
│  TIMESTAMP          LEVEL   MESSAGE           META      │
│  14:30:01.234       INFO    order.created     {...}     │
│  14:29:55.891       HTTP    POST /api/orders  201 12ms  │
│  14:28:10.002       ERROR   order.create_fai  {...}     │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **Header** — título ASCII, botón refresh, selector de fecha, link "← DASHBOARD"
2. **KPI cards** (4) — error / warn / info / http, con color semántico
3. **Bar chart SVG** — 24 barras, errores por hora, sin librería externa
4. **Top Errors panel** — lista de mensajes de error más frecuentes del día
5. **Logs table** — timestamp, level badge, message, metadata expandible al click
6. **Filtros** — dropdown de nivel + búsqueda de texto

---

## 9. .gitignore

Agregar a `backend/.gitignore` (o crear si no existe):
```
logs/
*.log
```

---

## 10. Orden de implementación

1. Instalar dependencias
2. `logger.ts` — base de todo
3. `requestLogger.ts` + `errorHandler.ts` — middleware
4. `index.ts` — wiring
5. Controladores — logging estructurado
6. `logsController.ts` — API de lectura
7. `routes/index.ts` — rutas nuevas
8. `api.ts` frontend — fetch functions
9. `AdminLogsPage.tsx` — dashboard
10. `App.tsx` + `AdminDashboardPage.tsx` — navegación
