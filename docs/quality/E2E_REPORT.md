# Reporte E2E — StageFront

> Fase 9. Herramienta: **Cypress 15**. Estado: suites **escritas y listas** (tipos verificados);
> ejecución pendiente de levantar frontend + backend.

## 1. Configuración
- `cypress.config.ts` (raíz): `baseUrl` configurable (`CYPRESS_BASE_URL`, por defecto
  `http://localhost:5173`), `specPattern: cypress/e2e/**/*.cy.ts`, `retries` en run mode, screenshots
  en fallo.
- `cypress/tsconfig.json`: tipos de Cypress; `tsc` sobre la carpeta = **0 errores**.

## 2. Estructura y patrones
```
cypress/
├── e2e/
│   ├── admin-auth.cy.ts      Login / Logout / Roles
│   ├── public-flow.cy.ts     Flujo principal del negocio
│   └── errors.cy.ts          Manejo de errores
├── support/
│   ├── commands.ts           Custom command cy.adminLogin() + ADMIN_CREDENTIALS
│   ├── e2e.ts                Bootstrap
│   └── pages/                Page Objects (AdminLoginPage, HomePage, EventsPage)
└── fixtures/
    └── admin.json            Datos de prueba
```
- **Page Objects** para login y páginas públicas.
- **Custom command** `cy.adminLogin()` reutilizable.
- **Selectores:** atributos estables (`input[type=email]`, placeholders, texto). Se recomienda añadir
  `data-testid` a los formularios clave (login, checkout); el cambio es localizado en los Page Objects.

## 3. Cobertura de flujos

| Spec | Flujo | Casos |
|------|-------|-------|
| `admin-auth.cy.ts` | **Login / Logout / Roles** | credenciales inválidas → error; login OK → `/admin`; guard de `/admin` → `/admin/login`; logout → login |
| `public-flow.cy.ts` | **Flujo principal** | Home → Eventos; búsqueda; Detalle → botón Comprar; Reventas |
| `errors.cy.ts` | **Errores** | evento inexistente sin crash; validación de tarjeta vencida (checkout) |

Mapeo a la rúbrica:
- **Registro:** StageFront no tiene registro público de comprador (solo login admin) → documentado como brecha; se cubre el único flujo credencializado.
- **Login / Logout / Roles / Errores:** cubiertos por los specs anteriores.

## 4. Cómo ejecutar
```bash
# 1. Datos + servicios
cd backend && npm run db:setup && npm run dev      # :3001
cd frontend && npm run dev                          # :5173
# 2. Ejecutar (raíz del repo)
npm run test:e2e          # headless (cypress run)
npm run test:e2e:open     # interactivo (cypress open)
```

## 5. Resultado esperado / real
- **Esperado:** flujos críticos (login admin, navegación Home→Eventos, detalle→comprar) en verde.
- **Real:** ⏳ *pendiente de ejecución* (requiere los dos servidores). El binario de Cypress está
  verificado (`npx cypress verify` ✔) y los specs compilan sin errores de tipo.

### `data-testid` recomendados (mejora, no bloqueante)
| Elemento | Sugerencia |
|----------|-----------|
| Input email login | `data-testid="admin-email"` |
| Input password login | `data-testid="admin-password"` |
| Botón autenticar | `data-testid="admin-submit"` |
| Tarjeta de evento | `data-testid="event-card"` |
| Botón comprar (detalle) | `data-testid="buy-button"` |
| Campos de tarjeta (checkout) | `data-testid="card-number" / "card-cvv" / "card-expiry"` |
