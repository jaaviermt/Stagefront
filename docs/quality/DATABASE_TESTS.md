# Pruebas de Base de Datos — StageFront

> Fase 8. Relacional: **PostgreSQL + Prisma**. No-relacional: **MongoDB + Mongoose**.
> Ejecución real: `cd backend && npm run test:db`.

## 1. Motores identificados
| Motor | Uso | Driver |
|-------|-----|--------|
| PostgreSQL 16 | Transaccional (users, events, venues, zones, seats, orders, order_items, resales) | Prisma 5 |
| MongoDB 7 | Flexible (reviews, activity_logs, notifications, artist_profiles) | Mongoose 8 |
| MySQL / Redis | No aplican (no presentes en el stack) | — |

## 2. Resultados (ejecución real)

```
 Test Files  2 passed (2)
      Tests  11 passed (11)
```

## 3. Relacional (PostgreSQL / Prisma) — `backend/tests/database/prisma.db.test.ts`

| Prueba | Restricción | Resultado |
|--------|-------------|-----------|
| CRUD de `venue` (create/read/update/delete) | Operaciones básicas | ✅ |
| Email duplicado | **UNIQUE** (`users.email`) → `P2002` | ✅ |
| Evento con venue inexistente | **FK** (`events.venue_id`) → `PrismaClientKnownRequestError` | ✅ |
| Venue sin `city` | **NOT NULL** (columna requerida) → rechazado | ✅ |
| Transacción que lanza error | **ROLLBACK** atómico (`$transaction`) → nada persiste | ✅ |

**Limpieza:** los registros usan el prefijo único `qa-db-<timestamp>` y se eliminan en `afterAll`;
`prisma.$disconnect()` cierra la conexión.

## 4. No-relacional (MongoDB / Mongoose) — `backend/tests/database/mongoose.db.test.ts`

| Prueba | Aspecto | Resultado |
|--------|---------|-----------|
| `rating` fuera de 1–5 | **Schema validation** (`min/max`) | ✅ rechazado |
| Reseña sin `comment` | **Required** | ✅ rechazado |
| Insertar y leer reseña válida | **Documentos / CRUD** | ✅ |
| Reseña duplicada `{user_id,event_id}` | **Índice único compuesto** → error `11000` | ✅ |
| `Review.collection.indexes()` | **Índices** (`{event_id:1}`, `{user_id:1,event_id:1}`) | ✅ presentes |
| `ArtistProfile` con arrays + Map | **Documento flexible** (genres[], social_links{}) | ✅ |

**Limpieza:** documentos con prefijo `qa-<timestamp>` eliminados en `afterAll`; `mongoose.disconnect()`.

## 5. Notas
- Las suites de BD están **excluidas** de la corrida unitaria por defecto (`vitest.config.ts`) y se
  ejecutan con su propio config (`vitest.db.config.ts`, sin paralelismo de archivos) para evitar
  interferencia entre conexiones.
- En CI se ejecutan tras `npm run db:setup` (push del schema + seed) contra los service containers
  (job `Integration · DB` en `.github/workflows/ci.yml`).
