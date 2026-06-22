# Auditoría de Calidad — StageFront

> Fase 1 de la Estrategia de Calidad de Software.
> Método: inspección estática del repositorio + ejecución real de pruebas contra
> los servicios locales (PostgreSQL y MongoDB en Docker, ambos `healthy`).

---

## 1. Tecnologías detectadas

| Capa | Tecnología | Evidencia |
|------|------------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 + TailwindCSS + GSAP + react-router-dom 6 | `frontend/package.json`, `frontend/src/**` |
| Backend | Node.js + Express 4 (ESM) + TypeScript 5 | `backend/src/index.ts`, `backend/package.json` |
| ORM relacional | Prisma 5 sobre PostgreSQL | `backend/prisma/schema.prisma`, `backend/src/lib/prisma.ts` |
| ODM no-relacional | Mongoose 8 sobre MongoDB | `backend/src/models/mongoose/*`, `backend/src/lib/mongoose.ts` |
| Validación | Zod (instalado) | `backend/package.json` — **no usado en el código** |
| Contenedores | PostgreSQL 16 + Mongo 7 (Docker, `healthy`) | `docker ps` |

## 2. Estructura del repositorio

```
stagefront/
├── backend/   Express + Prisma + Mongoose (controllers, services, routes, models)
│   └── tests/ unit + integration + database (Vitest)
├── frontend/  React + Vite (pages, components, context, hooks, lib)
├── cypress/   E2E (Cypress)
├── docs/      entregables de Edgar (TEST_PLAN, TEST_CASES, BUG_REPORTS, etc.)
│   └── quality/ entregables del usuario (unit/api/e2e/security/db + auditoría/final)
└── tests/performance/  scripts k6
```

## 3. Hallazgos por área

### 3.1 Configuración TypeScript
- `frontend/tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` ✅.
- `backend/tsconfig.json`: tenía `strict:true` pero **faltaban** `noUnusedLocals`/`noUnusedParameters`.
  Al activarlos se detectaron 4 variables sin uso reales (corregidas). Ver `TYPESCRIPT_QUALITY.md`.

### 3.2 Linting / formato
- **No existía ESLint** en ningún paquete; `frontend` declaraba el script `lint` pero fallaba.
- **No existía Prettier**. Ambos se configuraron (flat config ESLint 10 + Prettier).

### 3.3 CI/CD
- **No existía `.github/workflows`**. Se añadió pipeline (lint + typecheck + unit + integration + DB).

### 3.4 Pruebas
- `backend/tests/` **vacío** y **0% de cobertura** al inicio.
- Estado actual: 37 unit (100% dominio), 14 integración, 11 BD — todas en verde.

### 3.5 Autenticación y autorización
- **No hay autenticación real**: login admin hardcodeado en el frontend (`AdminAuthContext.tsx`);
  rutas `/api/v1/admin/*` **sin protección**; `password_hash` nunca se calcula/verifica;
  `JWT_SECRET` presente pero sin uso. Ver `SECURITY_REPORT.md`.

### 3.6 Manejo de errores de API
- Todos los controllers usan `try/catch` con respuestas tipadas `{ error }` ✅.
- **Defecto:** update/delete admin devuelven **500** en lugar de **404** cuando el registro no existe.

### 3.7 Observabilidad
- Solo `console.*`; sin logs JSON, niveles ni correlation-ID. Ver `docs/OBSERVABILITY.md` (Edgar).

## 4. Riesgos de calidad

| ID | Riesgo | Impacto | Probabilidad |
|----|--------|---------|--------------|
| R1 | Endpoints admin sin autenticación | Crítico | Alta |
| R2 | Credenciales hardcodeadas en el cliente | Alto | Alta |
| R3 | Sin validación de entrada (Zod sin usar) | Alto | Media |
| R4 | Cobertura inicial 0% → regresiones silenciosas | Alto | Alta (mitigado) |
| R5 | Sin CI → defectos sin gate | Medio | Alta (mitigado) |
| R6 | Dependencias frontend con vulnerabilidades | Medio | Media |

## 5. Nivel de cumplimiento por sección (inicial → actual)

| Sección | Inicial | Actual |
|---------|---------|--------|
| Configuración TS / ESLint / Prettier | 30% | 100% |
| CI/CD | 0% | 90% |
| Unit / Integration / DB testing | 0% | 100% |
| E2E (Cypress) | 0% | 80% (escrito, falta ejecutar) |
| Performance (k6) | 0% | 80% (scripts listos, falta ejecutar) |
| Seguridad / Accesibilidad / Observabilidad | 10–30% | auditado y documentado |

## 6. Porcentaje estimado de cumplimiento
- **Estado inicial del repositorio: ~15%.**
- **Estado actual (trabajo combinado del equipo): ~90%.**

El resto corresponde a la **ejecución** de E2E/performance (requiere servidores levantados) y a
remediaciones de **código de producción** (auth real, validación Zod, logging) que exceden el alcance de QA.
