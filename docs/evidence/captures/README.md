# Capturas de evidencia — StageFront QA

Capturas de página completa generadas el 2026-06-22 con la app real corriendo
(backend `:3001`, frontend `:5173`, PostgreSQL + MongoDB en Docker). Listas para
insertar en el PDF del reporte de calidad.

| # | Archivo | Qué evidencia | Fase / requisito |
|---|---------|---------------|------------------|
| 01 | `01-home.png` | Home pública funcionando | UI / Dashboard funcionando |
| 02 | `02-events.png` | Catálogo de eventos + buscador | UI / E2E |
| 03 | `03-event-detail.png` | Detalle de evento con zona seleccionada y CTA de compra | Flujo principal de negocio |
| 04 | `04-resales.png` | Página de reventas | UI |
| 05 | `05-admin-login.png` | Login de administrador | Seguridad / Roles |
| 06 | `06-admin-dashboard.png` | Dashboard admin con datos reales (PostgreSQL + MongoDB) | **Dashboard funcionando** |
| 07 | `07-admin-logs.png` | **Dashboard de logs** (KPIs, error rate, top errors, tabla) | **Logs en proyecto** / Observabilidad |
| 08 | `08-test-results.png` | Salida real de todas las suites (unit/integration/db/k6/JMeter) | Unit / Integración / BD / Performance |
| 09 | `09-coverage.png` | Reporte de cobertura Vitest v8 — **100%** dominio | Unit tests |
| 10 | `10-jmeter-report.png` | Dashboard HTML de Apache JMeter (load test) | **Test Plan JMeter** |

## Evidencia de texto (carpeta `../raw/`)
Salida cruda (sin color) de cada suite, por si prefieres pegarla como texto:
`unit-coverage.txt`, `integration.txt`, `database.txt`, `k6-load.txt`, `jmeter-load.txt`.

## Cómo se regeneran
1. `docker compose up -d` → `cd backend && npm run db:setup && npm run dev`
2. `cd frontend && npm run dev`
3. Capturas de UI: vía Cypress (`cy.screenshot` página completa) navegando cada ruta.
4. Reportes: `npm run test:coverage` (coverage HTML), `jmeter -n -t StageFront.jmx -e -o report`
   (dashboard HTML), servidos en local y capturados.

> Nota: las capturas existentes `01-06-*.png` (raíz de `docs/evidence/`) son del set previo
> del equipo (estructura, docker, servidores). Las de esta carpeta `captures/` son el set nuevo
> y completo de la app + reportes.
