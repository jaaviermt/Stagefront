# Plan de Pruebas — StageFront

> Fase 2 de la Estrategia de Calidad. Documento maestro de testing.

## 1. Introducción y objetivos
StageFront es una plataforma de eventos y conciertos (venta y reventa de boletos).
Este plan define la estrategia de pruebas para garantizar **corrección funcional**,
**integridad de datos**, **seguridad** y **rendimiento** del sistema.

Objetivos:
- Validar la lógica de negocio crítica (cálculo de totales, límites de compra, reventa ≤30%, promos).
- Verificar contratos de API (códigos de estado, esquemas, filtros, paginación).
- Garantizar integridad relacional (PostgreSQL) y de documentos (MongoDB).
- Asegurar los flujos de usuario de extremo a extremo.
- Establecer una línea base de rendimiento y un baseline de seguridad (OWASP Top 10).

## 2. Alcance
- **Backend:** servicios de dominio, controllers, rutas REST `/api/v1/**`, modelos Prisma y Mongoose.
- **Frontend:** flujos públicos (Home, Eventos, Detalle, Checkout, Reventas) y panel Admin.
- **Datos:** restricciones UNIQUE/FK/NOT NULL, transacciones, índices NoSQL.
- **No funcional:** carga, estrés, picos, soak; seguridad; accesibilidad; compatibilidad.

## 3. Elementos fuera de alcance
- Pasarela de pago real (el checkout es simulado).
- Infraestructura de despliegue/producción (proyecto académico, no se despliega).
- Pruebas de penetración intrusivas sobre terceros.
- Internacionalización (la app es es-MX).

## 4. Estrategia por capas

| Capa | Qué prueba | Herramienta | Estado |
|------|------------|-------------|--------|
| **Unit** | Funciones puras de `services/` | Vitest + v8 coverage | ✅ Ejecutado (37 tests, 100%) |
| **Integration** | Rutas HTTP `/api/v1/**` contra DB real | Vitest + Supertest | ✅ Ejecutado (14 tests) |
| **Database** | UNIQUE/FK/NOT NULL/rollback + schema/índices Mongo | Vitest + Prisma/Mongoose | ✅ Ejecutado (11 tests) |
| **E2E** | Flujos de usuario en navegador | Cypress | ✅ Escrito · ⏳ ejecución |
| **Performance** | Load/Stress/Spike/Soak | k6 | ✅ Escrito · ⏳ ejecución |
| **Security** | OWASP Top 10 | Auditoría manual + `npm audit` | ✅ Auditado |

## 5. Tipos de prueba y justificación
- **Unitarias** → la lógica de negocio es pura y determinista: máximo ROI, ejecución en ms.
- **Integración** → valida el wiring real controller→service→ORM→DB y los contratos REST.
- **Base de datos** → las reglas (UNIQUE email, FK venue, índice único reseña) son críticas para la integridad.
- **E2E** → confirma que los flujos de negocio funcionan tal como los ve el usuario.
- **Performance** → la venta de boletos genera picos (on-sale); hay que conocer límites.
- **Seguridad** → manejo de datos personales y de pagos exige baseline OWASP.

## 6. Criterios de entrada
- Build compila (`tsc --noEmit` sin errores) en backend y frontend.
- Lint sin errores (`npm run lint`).
- Servicios de datos disponibles (Postgres + Mongo) y sembrados (`npm run db:setup`).

## 7. Criterios de salida
- Unit: cobertura de dominio ≥90% (objetivo) — **alcanzado 100%**.
- Integration + DB: 100% de los tests verdes.
- E2E: flujos críticos (login admin, navegación, detalle→checkout) verdes.
- Sin defectos abiertos de severidad **Crítica** o **Alta** sin mitigación documentada.

## 8. Criterios de suspensión
- Servicios de datos no disponibles o no sembrados.
- Build roto en `main`.
- Defecto bloqueante que impide ejecutar la suite (p. ej. el servidor no levanta).

## 9. Roles y responsabilidades

| Rol | Responsabilidad |
|-----|-----------------|
| QA Lead | Estrategia, plan, criterios, reporte final |
| Test Engineer | Implementación y mantenimiento de las suites |
| Backend Dev | Corrección de defectos de API/DB |
| Frontend Dev | Corrección de defectos de UI/accesibilidad |
| Reviewer (CI) | Gate de PR: lint + typecheck + tests deben pasar |

## 10. Entornos

| Entorno | Propósito | Configuración |
|---------|-----------|---------------|
| **Local** | Desarrollo y ejecución de suites | Vite :5173, Express :3001, Postgres :5432, Mongo :27017 (Docker) |
| **Staging** | Validación previa a entrega | Mismas imágenes vía GitHub Actions service containers |
| **Producción** | N/A (proyecto académico, no se despliega) | — |

## 11. Herramientas
Vitest · @vitest/coverage-v8 · Supertest · Cypress · k6 · ESLint 10 (typescript-eslint) · Prettier · GitHub Actions · npm audit.

## 12. Gestión de defectos
- Registro en `docs/quality/BUG_REPORTS.md` con ID `DEF-XXX`.
- Ciclo: `Abierto → En progreso → Resuelto → Cerrado` (o `Diferido` con justificación).
- Severidad (impacto técnico) y Prioridad (urgencia de negocio) independientes.

## 13. Métricas objetivo

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Cobertura de dominio | ≥90% | **100%** |
| Cobertura de servicios | ≥80% | **100%** |
| Cobertura global (código testeable) | ≥75% | 100% del dominio puro |
| Tests verdes | 100% | 62/62 (unit+int+db) |
| `http_req_duration` p95 (perf) | <500 ms | pendiente de ejecución |
| Tasa de error en carga | <1% | pendiente de ejecución |

## 14. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Endpoints admin sin auth | Documentado (SECURITY_REPORT A01); tests listos para 401/403 al añadir auth |
| Datos de prueba contaminan la DB | Los tests usan prefijos únicos y limpian en `afterAll` |
| E2E frágil por selectores | Page Objects + custom commands Cypress + recomendación de `data-testid` |
| Vulnerabilidades de dependencias | `npm audit` en CI; plan de actualización en SECURITY_REPORT |
