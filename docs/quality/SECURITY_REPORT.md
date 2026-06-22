# Reporte de Seguridad (OWASP Top 10) — StageFront

> Fase 11. Auditoría manual + `npm audit`. Fecha: 2026-06-21.
> Marcas: ✅ Cumple · ❌ No cumple · ⚠️ Riesgo.

## Resumen ejecutivo
StageFront es un proyecto académico **sin autenticación real**. Los hallazgos más graves son el
**control de acceso inexistente** en los endpoints de administración y las **credenciales
hardcodeadas en el cliente**. La lógica de negocio sensible (límite de boletos, markup de reventa)
sí está correctamente validada en el servidor.

## Matriz OWASP Top 10 (2021)

| # | Categoría | Estado | Hallazgo | Recomendación |
|---|-----------|--------|----------|---------------|
| A01 | Broken Access Control | ❌ | `/api/v1/admin/*` sin auth (DEF-001); guard solo en el cliente | Middleware de auth + verificación de rol en backend |
| A02 | Cryptographic Failures | ⚠️ | `password_hash` en schema pero sin hashing real; `JWT_SECRET` sin uso | Implementar `bcrypt` + JWT firmado |
| A03 | Injection (SQL) | ✅ | Prisma parametriza todas las queries; sin SQL crudo | Mantener; evitar `$queryRawUnsafe` |
| A03 | Injection (NoSQL) | ⚠️ | `req.body` llega sin validar a Mongoose (DEF-003) | Validar con Zod antes de consultar |
| A03 | XSS | ✅/⚠️ | React escapa por defecto; no se detectó `dangerouslySetInnerHTML` | Mantener; CSP vía helmet |
| A04 | Insecure Design | ⚠️ | Auth de cliente, checkout simulado | Documentado; rediseñar auth para producción |
| A05 | Security Misconfiguration | ❌ | `cors()` abierto (DEF-006); sin `helmet` (DEF-007) | CORS por allowlist + helmet |
| A06 | Vulnerable Components | ❌ | `npm audit` frontend: 5 vulns (1 baja, 3 mod, 1 alta) | `npm audit fix`; planear subir a vite/react-router |
| A07 | Identification & Auth Failures | ❌ | Credenciales hardcodeadas (DEF-002); sin expiración de sesión robusta | Auth real, rate-limit de login |
| A08 | Software & Data Integrity | ✅ | `package-lock.json` presente; sin CDN de scripts no fijados | Mantener lockfiles |
| A09 | Logging & Monitoring Failures | ⚠️ | Solo `console.*`; sin auditoría (DEF-009) | Winston + logs de eventos de seguridad |
| A10 | SSRF | ✅ | El servidor no hace fetch a URLs provistas por el usuario | Mantener |

## Detalle de `npm audit`
| Paquete | Severidad | Ámbito | Nota |
|---------|-----------|--------|------|
| backend (prod) | **0 vulnerabilidades** | — | ✅ |
| backend (dev) | 1 baja | `esbuild` (dev-server) | Solo desarrollo |
| frontend | **5** (1 baja, 3 moderadas, 1 alta) | `react-router`, `esbuild` (vía vite) | Open-redirect protocol-relative; dev-server expuesto |

Comandos: `cd backend && npm audit` · `cd frontend && npm audit`.

## Verificaciones específicas solicitadas
| Control | Estado | Evidencia |
|---------|--------|-----------|
| Access Control | ❌ | Endpoints admin abiertos |
| SQL Injection | ✅ | Prisma parametrizado |
| NoSQL Injection | ⚠️ | Falta validación de entrada |
| XSS | ✅ | Escape de React |
| JWT | ❌ | No implementado (secret sin uso) |
| Password Hashing | ❌ | `password_hash` nunca calculado/verificado |
| Headers | ❌ | Sin helmet |
| CORS | ❌ | Abierto a `*` |
| npm audit | ⚠️ | Vulnerabilidades en frontend |

## Plan de remediación priorizado
1. **P1** — Middleware de autenticación + rol para `/api/v1/admin/*`; mover credenciales fuera del cliente.
2. **P1** — `bcrypt` para password_hash + emisión/verificación de JWT con `JWT_SECRET`.
3. **P2** — `helmet` + CORS por allowlist; validación Zod en todos los `POST/PATCH`.
4. **P2** — `npm audit fix` y plan de actualización de `react-router`/`vite`.
5. **P3** — Logging de seguridad (intentos de login, acciones admin) con correlation-ID.

> **Nota de alcance:** la remediación implica **cambios de código de producción** (nuevas
> dependencias y endpoints de auth), fuera del alcance de QA acordado. Este reporte deja la
> auditoría y el plan listos para el equipo de desarrollo.
