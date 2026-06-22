# Reporte de Pruebas Unitarias — StageFront

> Fase 6. Runner: **Vitest 4** · Cobertura: **@vitest/coverage-v8**.
> Ejecución real: `cd backend && npm run test:coverage`.

## 1. Alcance
Lógica de negocio pura en `backend/src/services/` — funciones tipadas, sin efectos secundarios.

| Servicio | Función bajo prueba |
|----------|---------------------|
| `orderService` | `calculateOrderTotal` |
| `resaleService` | `validateResalePrice` (markup ≤30%) |
| `promoService` | `applyPromoCode` (porcentaje/fijo, mínimo de compra, clamp ≥0) |
| `purchaseService` | `canUserPurchase` (límite 10, estado del evento, validaciones) |
| `eventService` | `isEventSoldOut`, `getAvailableSeats`, `getEventsByCity` |

## 2. Metodología
- **AAA** (Arrange–Act–Assert) en cada caso.
- **Independencia:** sin estado compartido entre tests.
- **Nombres descriptivos** orientados a comportamiento.
- **Casos límite y negativos:** listas vacías, `null/undefined`, fronteras exactas (1300 vs 1300.01; 10 vs 11 boletos), códigos inválidos, mínimos de compra.

## 3. Resultados (ejecución real)

```
 Test Files  5 passed (5)
      Tests  37 passed (37)
```

| Archivo | Tests |
|---------|-------|
| `tests/unit/orderService.test.ts` | 5 |
| `tests/unit/resaleService.test.ts` | 7 |
| `tests/unit/promoService.test.ts` | 9 |
| `tests/unit/purchaseService.test.ts` | 7 |
| `tests/unit/eventService.test.ts` | 9 |
| **Total** | **37** |

## 4. Cobertura (v8) — código de dominio

| Métrica | Cubierto | % | Objetivo | Resultado |
|---------|----------|---|----------|-----------|
| Statements | 49/49 | **100%** | ≥90% (dominio) | ✅ |
| Branches | 48/48 | **100%** | ≥85% | ✅ |
| Functions | 12/12 | **100%** | ≥90% | ✅ |
| Lines | 35/35 | **100%** | ≥90% | ✅ |

Por archivo (todos al 100%): `eventService.ts`, `orderService.ts`, `promoService.ts`,
`purchaseService.ts`, `resaleService.ts`.

> Umbrales declarados en `vitest.config.ts` (`thresholds`): la suite **falla** si la cobertura
> de dominio cae por debajo de 90/85/90/90. El reporte HTML se genera en `backend/coverage/`.

## 5. Hallazgo durante la implementación
Un caso inicial sobre "total nunca negativo" usaba `FIRSTORDER` (con `min_purchase: 50`) con un
total de 10 — el descuento no se aplicaba por el mínimo, no por el clamp. Se corrigió el **dato de
prueba** para usar un código fijo sin mínimo (`{ code: "BIG", discount: 9999 }`), validando
correctamente `Math.max(0, …)`. Es un ejemplo de cómo el diseño de tests reveló un matiz de la regla.

## 6. Capas de cobertura objetivo vs. realidad

| Capa | Objetivo | Estado |
|------|----------|--------|
| Dominio (services puros) | ≥90% | **100%** ✅ |
| Servicios | ≥80% | **100%** ✅ |
| Controllers | ≥70% | Cubiertos vía **integración** (Supertest) — ver `API_TEST_REPORT.md` |

> Nota: los controllers se ejercitan a través de la suite de integración (HTTP real contra DB),
> que es la estrategia adecuada para código con E/S. La cobertura unitaria se concentra en la
> lógica pura, donde el ROI es máximo.
