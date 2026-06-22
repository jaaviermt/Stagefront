# Reporte de Pruebas de API (Integración) — StageFront

> Fase 7. Herramienta: **Supertest** sobre la app Express in-process (Vitest).
> Ejecución real contra Postgres + Mongo locales (`healthy`): `cd backend && npm run test:integration`.

## 1. Arquitectura de la suite
- Se extrajo `createApp()` a `backend/src/app.ts` (sin `listen`, sin abrir DB) para montar el
  mismo stack de rutas/middleware en proceso. `index.ts` ahora consume `createApp()`.
- `helpers/testApp.ts` expone la instancia; `helpers/setup.ts` conecta Mongoose una vez por run.

## 2. Resultados (ejecución real)

```
 Test Files  4 passed (4)
      Tests  14 passed (14)
```

| Archivo | Casos | Cobertura HTTP |
|---------|-------|----------------|
| `health.integration.test.ts` | 3 | 200, 404, 400 |
| `events.integration.test.ts` | 5 | 200, 404, filtros, schema |
| `admin.integration.test.ts` | 4 | 201, 200, 200/204, 4xx/5xx |
| `resales.integration.test.ts` | 2 | 200, 404 |

## 3. Códigos de estado verificados

| Código | Escenario | Caso |
|--------|-----------|------|
| 200 | GET eventos / stats / admin stats / detalle | TC-API-02/04 |
| 201 | POST evento admin (creación) | TC-API-05 |
| 200/204 | DELETE evento admin | TC-API-05 |
| 400 | POST orden sin asientos | TC-API-01 |
| 404 | Evento inexistente / reventa sin compra original | TC-API-03/INT-07 |
| 4xx/5xx | PATCH evento inexistente (defecto conocido) | TC-API |

> **Códigos 401/403/409:** no aplican aún porque la API **carece de autenticación** y los
> endpoints actuales no devuelven 409. Los tests están preparados para añadir estos casos en cuanto
> se implemente auth (ver `SECURITY_REPORT`).

## 4. Validaciones cubiertas
- **Schema:** el detalle de evento expone `venue`, `zones`, `soldOut`; stats expone `activeEvents`, `ticketsSold`, `currency`.
- **Filtros:** `GET /events?city=CDMX`.
- **Paginación:** `GET /admin/orders?limit=5` ⇒ `data.length ≤ 5`.
- **Headers:** `Content-Type: application/json` en todas las peticiones.
- **Ordenamiento:** órdenes por `created_at desc` (verificado indirectamente por el endpoint).

## 5. Matriz de entornos

| Entorno | Postgres | Mongo | Comando |
|---------|----------|-------|---------|
| Local | Docker `:5432` | Docker `:27017` | `npm run test:integration` |
| CI | service container | service container | job `integration` en `.github/workflows/ci.yml` |

## 6. Hallazgo
`GET /api/v1/stats` dependía de una conexión Mongo activa y, sin ella, hacía buffering ~10s y
devolvía `500`. Se añadió la conexión Mongo en el `setup` de la suite; tras ello el caso
pasa en `200`.
