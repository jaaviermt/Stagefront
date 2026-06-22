# Casos de Prueba — StageFront

> Fase 3. 18 casos divididos en UI, API, Seguridad, Integración y Base de Datos.
> Estado: `Pass` = verificado por suite automatizada · `Pending` = requiere ejecución manual/E2E.
> Trazabilidad: cada caso enlaza a su test o a su bug (`DEF-XXX`).

Leyenda — **Automatizable**: Sí/No · **Severidad**: Baja/Media/Alta/Crítica · **Prioridad**: P1/P2/P3.

---

## API

### TC-API-01 — Crear orden sin asientos devuelve 400
- **Requerimiento:** Una orden debe seleccionar asientos o zona+cantidad válidos.
- **Precondiciones:** Backend arriba.
- **Datos:** `POST /api/v1/orders` body `{}`.
- **Pasos:** 1) Enviar POST con cuerpo vacío.
- **Resultado esperado:** `400` con `error: "No seats selected or available"`.
- **Resultado real:** `400` ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí · `health.integration.test.ts`.

### TC-API-02 — Listar eventos devuelve 200 y arreglo
- **Requerimiento:** `GET /api/v1/events` retorna la lista pública.
- **Precondiciones:** DB sembrada.
- **Datos:** `GET /api/v1/events`.
- **Pasos:** 1) GET.
- **Resultado esperado:** `200`, `data` es arreglo.
- **Resultado real:** `200` ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Media · **Automatizable:** Sí · `events.integration.test.ts`.

### TC-API-03 — Detalle de evento inexistente devuelve 404
- **Requerimiento:** ID inválido no debe romper el servidor.
- **Datos:** `GET /api/v1/events/nonexistent-id-000`.
- **Pasos:** 1) GET con id inexistente.
- **Resultado esperado:** `404` con `error` "not found".
- **Resultado real:** `404` ✅. **Estado:** Pass · **Prioridad:** P2 · **Severidad:** Media · **Automatizable:** Sí.

### TC-API-04 — Detalle de evento incluye venue + zones + soldOut
- **Requerimiento:** El detalle expone relaciones y flag de agotado.
- **Datos:** `GET /api/v1/events/:id` (id real del seed).
- **Resultado esperado:** `200` con propiedades `venue`, `zones`, `soldOut`.
- **Resultado real:** `200` ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Media · **Automatizable:** Sí.

### TC-API-05 — Lifecycle admin evento: POST 201 → PATCH 200 → DELETE 200
- **Requerimiento:** CRUD de eventos del panel admin.
- **Precondiciones:** Existe al menos un venue.
- **Datos:** payload de evento válido.
- **Pasos:** 1) Crear · 2) Cambiar status a `published` · 3) Eliminar.
- **Resultado esperado:** `201`, `200` (status=published), `200/204`.
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí · `admin.integration.test.ts`.

### TC-API-06 — `admin/orders?limit=5` respeta paginación
- **Requerimiento:** El límite acota la respuesta.
- **Datos:** `GET /api/v1/admin/orders?limit=5`.
- **Resultado esperado:** `200`, `data.length ≤ 5`.
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P2 · **Severidad:** Baja · **Automatizable:** Sí.

---

## Integración / Negocio

### TC-INT-07 — Reventa sin compra original devuelve 404
- **Requerimiento:** Solo se revende un boleto previamente comprado.
- **Datos:** `POST /api/v1/resales` con `seat_id` sin orden.
- **Resultado esperado:** `404` "original purchase not found".
- **Resultado real:** `404` ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí.

### TC-INT-08 — Precio de reventa > 30% es rechazado
- **Requerimiento:** Markup máximo de reventa = 30%.
- **Datos:** original 1000 → reventa 1300.01.
- **Resultado esperado:** `validateResalePrice` = `false`; API `400`.
- **Resultado real:** `false` ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí · `resaleService.test.ts`.

### TC-INT-09 — Límite de 10 boletos por orden
- **Requerimiento:** No comprar más de 10 boletos por orden (Bug #7).
- **Datos:** `canUserPurchase(user, eventoPublicado, 11)`.
- **Resultado esperado:** `{ allowed: false, reason: /more than 10/ }`.
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí · `purchaseService.test.ts`.

### TC-INT-10 — Código promocional inválido no altera el total
- **Requerimiento:** Un código desconocido devuelve el total original (Bug #9).
- **Datos:** total 1000, code `"NOPE"`.
- **Resultado esperado:** 1000.
- **Resultado real:** 1000 ✅. **Estado:** Pass · **Prioridad:** P2 · **Severidad:** Media · **Automatizable:** Sí.

### TC-INT-11 — Promo fija no aplica bajo el mínimo de compra
- **Requerimiento:** `FIRSTORDER` requiere min_purchase 50.
- **Datos:** total 40, code `FIRSTORDER`.
- **Resultado esperado:** 40 (sin descuento).
- **Resultado real:** 40 ✅. **Estado:** Pass · **Prioridad:** P3 · **Severidad:** Baja · **Automatizable:** Sí.

---

## Base de Datos

### TC-DB-12 — UNIQUE de email rechaza duplicados (P2002)
- **Requerimiento:** `users.email` es único.
- **Datos:** dos usuarios con el mismo email.
- **Resultado esperado:** Prisma lanza `P2002`.
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí · `prisma.db.test.ts`.

### TC-DB-13 — FK rechaza evento con venue inexistente
- **Requerimiento:** `events.venue_id` referencia `venues.id`.
- **Datos:** evento con `venue_id` inexistente.
- **Resultado esperado:** `PrismaClientKnownRequestError` (P2003).
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí.

### TC-DB-14 — Transacción fallida hace rollback completo
- **Requerimiento:** Atomicidad de `$transaction`.
- **Datos:** crear venue + lanzar error dentro de la transacción.
- **Resultado esperado:** El venue NO persiste.
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P1 · **Severidad:** Crítica · **Automatizable:** Sí.

### TC-DB-15 — Índice único compuesto bloquea reseña duplicada
- **Requerimiento:** Un usuario reseña un evento una sola vez (`{user_id,event_id}` único).
- **Datos:** dos reseñas con el mismo par.
- **Resultado esperado:** Error Mongo `11000`.
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P2 · **Severidad:** Media · **Automatizable:** Sí · `mongoose.db.test.ts`.

### TC-DB-16 — Validación de schema: rating fuera de 1–5 rechazado
- **Requerimiento:** `rating` entre 1 y 5.
- **Datos:** reseña con rating 9.
- **Resultado esperado:** `validate()` rechaza.
- **Resultado real:** ✅. **Estado:** Pass · **Prioridad:** P2 · **Severidad:** Media · **Automatizable:** Sí.

---

## UI (E2E)

### TC-UI-17 — Login admin con credenciales inválidas muestra error
- **Requerimiento:** Mensaje de error ante credenciales incorrectas.
- **Precondiciones:** Frontend + backend arriba.
- **Datos:** `wrong@stagefront.mx / badpass`.
- **Pasos:** 1) Ir a `/admin/login` · 2) Enviar credenciales inválidas.
- **Resultado esperado:** Texto "CREDENCIALES INVÁLIDAS" visible.
- **Resultado real:** *(pendiente de ejecución E2E)*. **Estado:** Pending · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí · `admin-auth.spec.ts`.

### TC-UI-18 — Guard de rol redirige `/admin` a `/admin/login` sin sesión
- **Requerimiento:** `AdminGuard` protege la ruta del panel.
- **Pasos:** 1) Visitar `/admin` sin sesión.
- **Resultado esperado:** Redirección a `/admin/login`.
- **Resultado real:** *(pendiente de ejecución E2E)*. **Estado:** Pending · **Prioridad:** P1 · **Severidad:** Alta · **Automatizable:** Sí.

---

## Seguridad

### TC-SEC-19 — Endpoints admin accesibles sin autenticación (negativo)
- **Requerimiento (esperado):** `/api/v1/admin/*` debe requerir auth.
- **Datos:** `GET /api/v1/admin/stats` sin token.
- **Resultado esperado (deseado):** `401 Unauthorized`.
- **Resultado real:** `200` — **falla de control de acceso** (ver `SECURITY_REPORT` A01 / `BUG_REPORTS` DEF-001).
- **Estado:** Fail (defecto conocido) · **Prioridad:** P1 · **Severidad:** Crítica · **Automatizable:** Sí.
