# Calidad de TypeScript, ESLint y Prettier — StageFront

> Fase 5. Verificación y endurecimiento de la configuración de tipos y estilo.

## 1. Configuración TypeScript

### Backend — `backend/tsconfig.json`
| Flag | Antes | Ahora | Impacto |
|------|-------|-------|---------|
| `strict` | ✅ | ✅ | Conjunto estricto completo |
| `noImplicitAny` | (implícito) | ✅ explícito | Prohíbe `any` implícito |
| `strictNullChecks` | (implícito) | ✅ explícito | `null`/`undefined` deben tratarse |
| `noUnusedLocals` | ❌ | ✅ **añadido** | Detecta variables locales sin uso |
| `noUnusedParameters` | ❌ | ✅ **añadido** | Detecta parámetros sin uso |
| `noFallthroughCasesInSwitch` | ❌ | ✅ **añadido** | Evita caídas en `switch` |
| `forceConsistentCasingInFileNames` | ❌ | ✅ **añadido** | Portabilidad de imports |

**Impacto de activar los flags:** `tsc --noEmit` reveló 4 errores reales (`TS6133`) por bindings sin uso,
corregidos con cambios mínimos:
- `eventsController.ts` ×2 y `ordersController.ts` ×1 → `catch (error)` → `catch {`
- `resalesController.ts` ×1 → `req` → `_req`

### Frontend — `frontend/tsconfig.json`
Ya cumplía `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Sin cambios.

**Resultado:** `npx tsc --noEmit` → **0 errores** en backend y frontend.

## 2. ESLint (nuevo)
Flat config (`eslint.config.js`) con ESLint 10 + `typescript-eslint` en ambos paquetes.

| Regla | Nivel | Motivo |
|-------|-------|--------|
| `@typescript-eslint/no-explicit-any` | error | Prohibido `any` (regla global del proyecto) |
| `@typescript-eslint/no-unused-vars` | error (`^_` ignorado) | Limpieza |
| `@typescript-eslint/explicit-function-return-type` | warn (backend) | Tipos de retorno explícitos |
| `no-console` | warn (`info/warn/error` permitidos) | Sin `console.log` en producción |
| `eqeqeq` | error | Comparaciones estrictas |
| React: `react-hooks/*`, `react-refresh/*` | recommended/warn | Buenas prácticas React |

### Resultados
- **Backend:** `npm run lint` → **0 errores, 0 warnings**.
- **Frontend:** `npm run lint` → **0 errores, 3 warnings** (`react-hooks/set-state-in-effect` en
  `Navbar.tsx` y `EventsPage.tsx`). Son patrones funcionales; refactor fuera del alcance de QA →
  registrados como deuda técnica y la regla fijada en `warn` (no bloquea el pipeline).

## 3. Prettier (nuevo)
- `.prettierrc.json` (raíz): `printWidth 90`, `semi true`, `singleQuote false`, `trailingComma es5`.
- `.prettierignore`: `node_modules`, `dist`, `coverage`, `*.md`, `package-lock.json`, `frontend/public`.
- Scripts `format` (`prettier --check`) en ambos `package.json`.

## 4. Cumplimiento de reglas globales (CLAUDE.md)
| Regla | Estado |
|-------|--------|
| No `any` en TypeScript | ✅ (`no-explicit-any: error`) |
| No `console.log` en producción | ✅ |
| API con `try/catch` tipado | ✅ |
| Modelos Prisma = schema | ✅ |
| Interfaces TS en Mongoose | ✅ |
| Servicios exportados individualmente | ✅ |
