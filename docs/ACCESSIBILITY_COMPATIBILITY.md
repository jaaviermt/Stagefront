# Accessibility and Compatibility Report - Stagefront

## Información general

| Campo                 | Valor                                                 |
| --------------------- | ----------------------------------------------------- |
| Proyecto              | Stagefront                                            |
| Responsables          | Edgar Castro y Javier Marin                           |
| Entorno evaluado      | Local                                                 |
| Frontend              | http://localhost:5173                                 |
| Backend               | http://localhost:3001                                 |
| Tipo de revisión      | Accesibilidad WCAG 2.1 y compatibilidad cross-browser |
| Navegador principal   | Google Chrome                                         |
| Sistema operativo     | Windows                                               |
| Documento relacionado | TEST_PLAN.md                                          |

---

## 1. Objetivo

El objetivo de este documento es registrar la revisión de accesibilidad y compatibilidad aplicada al frontend de Stagefront. Esta revisión busca validar que la aplicación pueda ser usada por distintos tipos de usuarios, en diferentes dispositivos, resoluciones y navegadores modernos.

La evaluación considera criterios básicos de WCAG 2.1, navegación con teclado, formularios accesibles, uso de atributos alternativos en imágenes, foco visible, mensajes de error comprensibles y comportamiento responsive.

---

## 2. Alcance

La revisión incluye los siguientes módulos:

* Página principal.
* Catálogo de eventos.
* Detalle de evento.
* Flujo de compra o checkout.
* Formularios de pago.
* Página de reventas.
* Login administrativo.
* Panel administrativo.
* Componentes de navegación.
* Componentes interactivos como botones, inputs, cards y enlaces.

---

## 3. Fuera de alcance

Quedan fuera de alcance para esta entrega:

* Auditoría completa profesional WCAG AA/AAA.
* Pruebas con lectores de pantalla reales en todos los sistemas operativos.
* Validación exhaustiva en dispositivos físicos iOS.
* Validación completa en Safari si no se cuenta con macOS/iOS.
* Pruebas con usuarios con discapacidad.
* Certificación formal de accesibilidad.

---

# 4. Checklist de accesibilidad WCAG 2.1

## ACC-001 - Imágenes con atributo alt descriptivo

| Campo               | Detalle                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Criterio            | Todas las imágenes deben tener atributo `alt` descriptivo.                                                            |
| Responsable         | Edgar Castro                                                                                                          |
| Método de revisión  | Inspección visual del DOM en navegador y revisión de componentes React.                                               |
| Resultado esperado  | Las imágenes informativas deben incluir texto alternativo descriptivo. Las imágenes decorativas pueden usar `alt=""`. |
| Resultado observado | Pendiente de validación final.                                                                                        |
| Estado              | Pending                                                                                                               |
| Severidad si falla  | Medium                                                                                                                |
| Recomendación       | Revisar imágenes de eventos, banners y logos para asegurar atributos `alt` adecuados.                                 |

---

## ACC-002 - Navegación completa con teclado

| Campo               | Detalle                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Criterio            | El sitio debe ser navegable usando teclado: Tab, Enter, Esc y flechas cuando aplique.                   |
| Responsable         | Edgar Castro                                                                                            |
| Método de revisión  | Navegación manual con teclado desde la página principal hasta eventos, detalle, checkout y login admin. |
| Resultado esperado  | El usuario debe poder recorrer elementos interactivos sin usar mouse.                                   |
| Resultado observado | Pendiente de validación final.                                                                          |
| Estado              | Pending                                                                                                 |
| Severidad si falla  | High                                                                                                    |
| Recomendación       | Validar orden lógico de tabulación y evitar elementos interactivos no enfocables.                       |

---

## ACC-003 - Focus visible en elementos interactivos

| Campo               | Detalle                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Criterio            | Todos los botones, links, inputs, selects y controles interactivos deben mostrar foco visible. |
| Responsable         | Edgar Castro                                                                                   |
| Método de revisión  | Navegación manual con Tab y revisión visual del foco.                                          |
| Resultado esperado  | Cada elemento enfocado debe mostrar un borde, outline, sombra o cambio visual claro.           |
| Resultado observado | Pendiente de validación final.                                                                 |
| Estado              | Pending                                                                                        |
| Severidad si falla  | Medium                                                                                         |
| Recomendación       | No eliminar `outline` sin reemplazarlo por un estilo visible de foco.                          |

---

## ACC-004 - Formularios con label o aria-label

| Campo               | Detalle                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Criterio            | Todos los inputs deben tener `label` asociado o `aria-label`.                                               |
| Responsable         | Edgar Castro                                                                                                |
| Método de revisión  | Inspección del formulario de checkout, login admin, reventas y reseñas.                                     |
| Resultado esperado  | Cada input debe poder identificarse correctamente mediante texto asociado.                                  |
| Resultado observado | Pendiente de validación final.                                                                              |
| Estado              | Pending                                                                                                     |
| Severidad si falla  | High                                                                                                        |
| Recomendación       | Asociar `label htmlFor` con `id` en inputs o usar `aria-label` cuando el diseño no permita labels visibles. |

---

## ACC-005 - Errores comunicados con aria-describedby o aria-live

| Campo               | Detalle                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Criterio            | Los errores de formulario deben comunicarse de forma accesible.                                                       |
| Responsable         | Edgar Castro                                                                                                          |
| Método de revisión  | Enviar formularios inválidos y revisar mensajes de error en DOM.                                                      |
| Resultado esperado  | Los errores deben estar asociados al input correspondiente mediante `aria-describedby` o comunicarse con `aria-live`. |
| Resultado observado | Pendiente de validación final.                                                                                        |
| Estado              | Pending                                                                                                               |
| Severidad si falla  | Medium                                                                                                                |
| Recomendación       | Agregar `aria-describedby` para errores específicos y `aria-live="polite"` para mensajes generales.                   |

---

## ACC-006 - Contraste visual básico

| Campo               | Detalle                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Criterio            | El texto debe tener contraste suficiente contra el fondo.                                |
| Responsable         | Edgar Castro                                                                             |
| Método de revisión  | Revisión visual y validación con Lighthouse o DevTools.                                  |
| Resultado esperado  | Textos principales, botones y errores deben ser legibles.                                |
| Resultado observado | Pendiente de validación final.                                                           |
| Estado              | Pending                                                                                  |
| Severidad si falla  | Medium                                                                                   |
| Recomendación       | Ajustar colores de bajo contraste, especialmente textos secundarios y mensajes de error. |

---

## ACC-007 - Tamaño y área de interacción

| Campo               | Detalle                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Criterio            | Botones y controles deben ser suficientemente grandes para interacción táctil.           |
| Responsable         | Edgar Castro                                                                             |
| Método de revisión  | Revisión en viewports móviles.                                                           |
| Resultado esperado  | Botones y enlaces deben poder presionarse fácilmente en móvil.                           |
| Resultado observado | Pendiente de validación final.                                                           |
| Estado              | Pending                                                                                  |
| Severidad si falla  | Low                                                                                      |
| Recomendación       | Mantener áreas clicables amplias, especialmente en cards de eventos y botones de compra. |

---

# 5. Checklist de compatibilidad

## COMP-001 - Google Chrome última versión

| Campo               | Detalle                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| Navegador           | Google Chrome                                                                |
| Responsable         | Edgar Castro                                                                 |
| Viewports probados  | 1920x1080, 1440x900, 1280x720, 390x844                                       |
| Resultado esperado  | La aplicación carga, navega y muestra correctamente los módulos principales. |
| Resultado observado | Pendiente de validación final.                                               |
| Estado              | Pending                                                                      |

---

## COMP-002 - Microsoft Edge última versión

| Campo               | Detalle                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| Navegador           | Microsoft Edge                                                                         |
| Responsable         | Edgar Castro                                                                           |
| Viewports probados  | 1920x1080, 1440x900, 390x844                                                           |
| Resultado esperado  | La aplicación debe comportarse igual que en Chrome al estar ambos basados en Chromium. |
| Resultado observado | Pendiente de validación final.                                                         |
| Estado              | Pending                                                                                |

---

## COMP-003 - Mozilla Firefox última versión

| Campo               | Detalle                                                            |
| ------------------- | ------------------------------------------------------------------ |
| Navegador           | Mozilla Firefox                                                    |
| Responsable         | Edgar Castro                                                       |
| Viewports probados  | 1440x900, 390x844                                                  |
| Resultado esperado  | El layout, formularios y navegación deben funcionar correctamente. |
| Resultado observado | Pending / Not Executed si no se cuenta con Firefox instalado.      |
| Estado              | Pending                                                            |

---

## COMP-004 - Safari macOS/iOS

| Campo               | Detalle                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| Navegador           | Safari                                                                              |
| Responsable         | Edgar Castro                                                                        |
| Viewports probados  | iOS 390x844 propuesto                                                               |
| Resultado esperado  | La aplicación debe mantener layout funcional y navegación correcta.                 |
| Resultado observado | Not Executed si no se cuenta con dispositivo macOS/iOS.                             |
| Estado              | Not Executed                                                                        |
| Justificación       | No se cuenta con dispositivo macOS/iOS para validación física durante esta entrega. |

---

## COMP-005 - Viewport desktop 1920x1080

| Campo               | Detalle                                               |
| ------------------- | ----------------------------------------------------- |
| Viewport            | 1920x1080                                             |
| Responsable         | Edgar Castro                                          |
| Módulos revisados   | Home, eventos, detalle, checkout, admin login         |
| Resultado esperado  | Diseño amplio sin desbordamientos ni cortes visuales. |
| Resultado observado | Pendiente de validación final.                        |
| Estado              | Pending                                               |

---

## COMP-006 - Viewport laptop 1440x900

| Campo               | Detalle                                                          |
| ------------------- | ---------------------------------------------------------------- |
| Viewport            | 1440x900                                                         |
| Responsable         | Edgar Castro                                                     |
| Módulos revisados   | Home, eventos, detalle, checkout, admin login                    |
| Resultado esperado  | El contenido debe adaptarse correctamente al tamaño de pantalla. |
| Resultado observado | Pendiente de validación final.                                   |
| Estado              | Pending                                                          |

---

## COMP-007 - Viewport desktop pequeño 1280x720

| Campo               | Detalle                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| Viewport            | 1280x720                                                                            |
| Responsable         | Edgar Castro                                                                        |
| Módulos revisados   | Home, eventos, detalle, checkout                                                    |
| Resultado esperado  | No deben existir elementos importantes fuera de pantalla sin posibilidad de scroll. |
| Resultado observado | Pendiente de validación final.                                                      |
| Estado              | Pending                                                                             |

---

## COMP-008 - Viewport tablet 768x1024

| Campo               | Detalle                                                            |
| ------------------- | ------------------------------------------------------------------ |
| Viewport            | 768x1024                                                           |
| Responsable         | Edgar Castro                                                       |
| Módulos revisados   | Home, eventos, detalle, checkout                                   |
| Resultado esperado  | Cards, menús y formularios deben ajustarse correctamente a tablet. |
| Resultado observado | Pendiente de validación final.                                     |
| Estado              | Pending                                                            |

---

## COMP-009 - Viewport móvil iPhone 14 390x844

| Campo               | Detalle                                                                   |
| ------------------- | ------------------------------------------------------------------------- |
| Viewport            | 390x844                                                                   |
| Responsable         | Edgar Castro                                                              |
| Módulos revisados   | Home, eventos, detalle, checkout, login admin                             |
| Resultado esperado  | La aplicación debe ser usable en móvil, sin desbordamientos horizontales. |
| Resultado observado | Pendiente de validación final.                                            |
| Estado              | Pending                                                                   |

---

## COMP-010 - Viewport Android típico 360x800

| Campo               | Detalle                                                        |
| ------------------- | -------------------------------------------------------------- |
| Viewport            | 360x800                                                        |
| Responsable         | Edgar Castro                                                   |
| Módulos revisados   | Home, eventos, detalle, checkout                               |
| Resultado esperado  | La aplicación debe mantener legibilidad y navegación adecuada. |
| Resultado observado | Pendiente de validación final.                                 |
| Estado              | Pending                                                        |

---

## COMP-011 - Cypress en múltiples viewports

| Campo               | Detalle                                                     |
| ------------------- | ----------------------------------------------------------- |
| Criterio            | Ejecutar pruebas E2E en más de un viewport.                 |
| Responsable         | Javier Marin                                                |
| Método              | Configurar pruebas Cypress usando `cy.viewport()`.          |
| Resultado esperado  | Los flujos principales deben ejecutarse en desktop y móvil. |
| Resultado observado | Pendiente de implementación.                                |
| Estado              | Pending                                                     |

Ejemplo sugerido:

```ts
describe("Responsive navigation", () => {
  it("debe cargar eventos en mobile", () => {
    cy.viewport(390, 844);
    cy.visit("/events");
    cy.contains("Eventos").should("be.visible");
  });

  it("debe cargar eventos en desktop", () => {
    cy.viewport(1440, 900);
    cy.visit("/events");
    cy.contains("Eventos").should("be.visible");
  });
});
```

---

## COMP-012 - Prueba con JavaScript desactivado

| Campo               | Detalle                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| Criterio            | Validar comportamiento del contenido crítico con JavaScript desactivado.                                     |
| Responsable         | Edgar Castro                                                                                                 |
| Método              | Desactivar JavaScript desde DevTools y recargar la página.                                                   |
| Resultado esperado  | En una SPA React, puede no estar disponible toda la funcionalidad, pero debe documentarse el comportamiento. |
| Resultado observado | Not Executed.                                                                                                |
| Estado              | Not Executed                                                                                                 |
| Justificación       | Stagefront es una SPA basada en React; se documenta como limitación técnica del enfoque frontend.            |

---

# 6. Pruebas manuales recomendadas

| ID          | Prueba                            | Pasos                      | Resultado esperado                      | Estado  |
| ----------- | --------------------------------- | -------------------------- | --------------------------------------- | ------- |
| A11Y-TC-001 | Navegación con teclado en home    | Usar Tab y Enter desde `/` | Se recorren links y botones principales | Pending |
| A11Y-TC-002 | Navegación con teclado en eventos | Usar Tab en `/events`      | Se pueden seleccionar eventos sin mouse | Pending |
| A11Y-TC-003 | Login admin accesible             | Usar Tab en `/admin/login` | Inputs y botón tienen foco visible      | Pending |
| A11Y-TC-004 | Checkout con errores              | Enviar formulario vacío    | Errores claros asociados a campos       | Pending |
| A11Y-TC-005 | Imágenes de eventos               | Inspeccionar cards         | Imágenes con `alt` descriptivo          | Pending |
| COMP-TC-001 | Responsive móvil                  | DevTools 390x844           | No hay scroll horizontal                | Pending |
| COMP-TC-002 | Responsive tablet                 | DevTools 768x1024          | Layout adaptado                         | Pending |
| COMP-TC-003 | Responsive desktop                | DevTools 1440x900          | Layout correcto                         | Pending |

---

# 7. Evidencias esperadas

Las evidencias se registrarán en `QA_EVIDENCE.md`.

Se recomienda incluir:

* Captura de home en desktop.
* Captura de eventos en desktop.
* Captura de checkout en móvil.
* Captura de login admin en móvil.
* Captura de navegación con foco visible.
* Captura de errores de formulario.
* Captura de Lighthouse si se ejecuta.
* Captura de DevTools con viewport móvil.
* Captura de DevTools con viewport tablet.

---

# 8. Hallazgos esperados

| ID       | Hallazgo                                                               | Severidad | Recomendación                                                   |
| -------- | ---------------------------------------------------------------------- | --------- | --------------------------------------------------------------- |
| A11Y-001 | Algunos formularios podrían no asociar errores con `aria-describedby`. | Medium    | Agregar IDs a mensajes de error y relacionarlos con los inputs. |
| A11Y-002 | Algunos elementos interactivos podrían depender demasiado del mouse.   | Medium    | Validar navegación con teclado y corregir orden de tabulación.  |
| A11Y-003 | Algunas imágenes podrían no tener `alt` descriptivo.                   | Medium    | Agregar texto alternativo significativo en imágenes de eventos. |
| COMP-001 | Safari no fue validado físicamente.                                    | Low       | Probar en macOS/iOS antes de producción.                        |
| COMP-002 | La SPA depende de JavaScript para contenido crítico.                   | Medium    | Considerar SSR o fallback si se requiere accesibilidad sin JS.  |

---

# 9. Resumen de cumplimiento

| Categoría                               | Total revisado | Cumplimiento objetivo           |
| --------------------------------------- | -------------: | ------------------------------- |
| Criterios de accesibilidad documentados |              7 | Cumple documentación requerida  |
| Navegadores considerados                |              4 | Chrome, Edge, Firefox, Safari   |
| Viewports considerados                  |              6 | Desktop, laptop, tablet y móvil |
| Pruebas manuales propuestas             |              8 | Cumple revisión funcional       |
| Pruebas Cypress responsive propuestas   |              1 | Pendiente de automatización     |
| Evidencias solicitadas                  |              9 | Pendiente de captura            |

---

# 10. Conclusión

La revisión de accesibilidad y compatibilidad de Stagefront establece una base clara para validar el uso del sistema en diferentes navegadores, dispositivos y condiciones de interacción. Se consideran los puntos principales de WCAG 2.1 solicitados: imágenes con `alt`, navegación por teclado, foco visible, formularios con labels o `aria-label` y comunicación accesible de errores.

También se documentan pruebas en navegadores modernos y múltiples viewports, incluyendo desktop, tablet y móvil. Los puntos no ejecutados, como Safari físico y JavaScript desactivado, quedan registrados como limitaciones conocidas y recomendaciones para futuras iteraciones.
