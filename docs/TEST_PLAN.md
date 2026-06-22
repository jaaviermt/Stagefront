# Test Plan - Stagefront

## 1. Introducción y objetivos del plan de prueba

Stagefront es una aplicación web fullstack orientada a la venta, gestión y reventa de boletos para eventos. El sistema cuenta con frontend desarrollado en React + TypeScript, backend con Node.js + Express + TypeScript, base de datos relacional PostgreSQL mediante Prisma y base de datos NoSQL MongoDB mediante Mongoose.

El objetivo de este plan de pruebas es definir la estrategia de calidad para validar el correcto funcionamiento del sistema Stagefront, cubriendo sus principales capas: interfaz de usuario, API REST, base de datos relacional, base de datos NoSQL, rendimiento, seguridad, accesibilidad y observabilidad.

Este plan fue estructurado para ejecutarse durante una semana de trabajo, dividiendo responsabilidades entre los dos miembros del equipo y priorizando los módulos críticos del sistema.

Los objetivos específicos son:

* Verificar que los flujos principales del usuario funcionen correctamente.
* Validar que la API REST responda con códigos, estructuras y mensajes adecuados.
* Comprobar reglas de negocio relacionadas con eventos, órdenes, reventas, reseñas y administración.
* Identificar defectos funcionales, de validación, seguridad y experiencia de usuario.
* Automatizar pruebas unitarias, de integración y end-to-end para reducir regresiones.
* Documentar riesgos, criterios de entrada, criterios de salida y evidencias de calidad.
* Asegurar que el proyecto pueda ser evaluado y mantenido con una estrategia de pruebas clara.

---

## 2. Alcance

### 2.1 Elementos dentro del alcance

Se probarán los siguientes módulos y componentes:

### Frontend

* Página principal.
* Catálogo/listado de eventos.
* Detalle de evento.
* Flujo de selección y compra de boletos.
* Formularios de pago.
* Página de reventas.
* Login de administrador.
* Panel administrativo.
* Validaciones visuales y mensajes de error.
* Diseño responsive en desktop y móvil.

### API REST

* Endpoints de eventos.
* Endpoints de órdenes.
* Endpoints de reventas.
* Endpoints de reseñas.
* Endpoints administrativos.
* Validaciones de entrada.
* Respuestas HTTP.
* Manejo de errores.
* Estructura de respuestas JSON.

### Base de datos relacional PostgreSQL

* Persistencia de eventos.
* Persistencia de órdenes.
* Relaciones entre entidades.
* Restricciones de datos.
* Seeds iniciales.
* Migraciones mediante Prisma.

### Base de datos NoSQL MongoDB

* Persistencia de reseñas.
* Validación de documentos.
* Limpieza de colecciones en entorno de pruebas.
* Verificación de estructura de documentos.

### Seguridad

* Validación de controles de acceso.
* Revisión de riesgos OWASP Top 10.
* Validación de entradas para prevenir inyección.
* Revisión de configuración CORS y headers.
* Revisión básica de dependencias.

### Rendimiento

* Pruebas de carga sobre endpoints principales.
* Pruebas de estrés.
* Pruebas de picos de tráfico.
* Propuesta de prueba de resistencia o soak test.

### Accesibilidad y compatibilidad

* Revisión de navegación por teclado.
* Revisión de labels, aria-labels y mensajes de error.
* Revisión responsive en distintos viewports.
* Compatibilidad básica con navegadores modernos.

---

## 3. Fuera de alcance

Los siguientes puntos quedan fuera del alcance de esta entrega por tiempo, infraestructura o dependencia externa:

* Despliegue real en ambiente de producción.
* Pruebas con usuarios reales.
* Pruebas de pagos con pasarelas reales.
* Pruebas exhaustivas de todos los navegadores y dispositivos físicos.
* Auditoría profesional de seguridad.
* Monitoreo real con servicios externos como Datadog, Grafana Cloud o Sentry.
* Pruebas de carga prolongadas de varias horas en infraestructura de producción.
* Integración completa con pipeline CI/CD productivo.

---

## 4. Estrategia de prueba por capa

## 4.1 Pruebas unitarias

Las pruebas unitarias validarán funciones puras y reglas de negocio aisladas. No deberán depender de base de datos, red, sistema de archivos ni servicios externos.

Se probarán principalmente:

* Validaciones de formularios.
* Validaciones de pago.
* Validación de CVV.
* Validación de número de tarjeta.
* Validación de campos vacíos o con espacios.
* Regla de negocio para limitar precio de reventa.
* Transformaciones o utilidades de datos.

Herramientas:

* Vitest.
* TypeScript.
* Mocks cuando sea necesario.

Criterio de aceptación:

* Cada prueba debe seguir el patrón Arrange, Act, Assert.
* Las pruebas deben ser independientes entre sí.
* Cada prueba debe validar un comportamiento específico.
* No debe existir dependencia del orden de ejecución.
* No se deben usar condicionales o ciclos innecesarios dentro de los tests.

---

## 4.2 Pruebas de integración

Las pruebas de integración validarán la comunicación entre la API REST, servicios internos y bases de datos.

Se probarán principalmente:

* Endpoints públicos de eventos.
* Endpoints de órdenes.
* Endpoints de reventas.
* Endpoints de reseñas.
* Endpoints administrativos.
* Respuestas con códigos HTTP correctos.
* Validaciones de entrada.
* Respuestas ante recursos inexistentes.
* Persistencia de información en PostgreSQL y MongoDB.

Herramientas:

* Vitest.
* Supertest.
* Prisma.
* Mongoose.
* Docker Compose para PostgreSQL y MongoDB.

Criterio de aceptación:

* Requests válidos deben responder con 200, 201 o 204 según corresponda.
* Requests inválidos deben responder con 400, 401, 403, 404 o 409 según el caso.
* Las respuestas deben tener estructura JSON válida.
* Los datos de prueba deben ser controlados y reproducibles.
* Las bases de datos deben limpiarse o reiniciarse cuando sea necesario para evitar contaminación entre pruebas.

---

## 4.3 Pruebas end-to-end

Las pruebas E2E validarán flujos completos desde el navegador, simulando el comportamiento de un usuario real.

Flujos críticos a automatizar:

* Navegación desde la página principal hacia el catálogo de eventos.
* Consulta del detalle de un evento.
* Flujo de compra o checkout.
* Login de administrador con credenciales válidas.
* Login de administrador con credenciales inválidas.
* Validaciones de formularios de pago.
* Manejo de errores cuando el backend no responde correctamente.

Herramientas:

* Cypress.
* Fixtures para datos consistentes.
* Screenshots y videos de fallos.

Criterio de aceptación:

* Los tests deben ser independientes.
* Los selectores deben preferir data-testid o data-cy cuando sea posible.
* Las pruebas deben ejecutarse sin depender del orden.
* Los errores deben generar evidencia visual.
* Los flujos deben representar acciones reales del usuario final.

---

## 4.4 Pruebas de rendimiento

Las pruebas de rendimiento validarán el comportamiento del sistema bajo diferentes cargas.

Tipos de prueba:

### Load Test

Simular usuarios esperados consumiendo endpoints principales durante un periodo controlado.

### Stress Test

Incrementar gradualmente el número de usuarios hasta encontrar degradación o punto de falla.

### Spike Test

Simular un aumento repentino de tráfico para observar estabilidad.

### Soak Test

Proponer una ejecución prolongada para detectar memory leaks o degradación con el tiempo.

Herramientas:

* k6 o Artillery.

Endpoints candidatos:

* GET /api/v1/events
* GET /api/v1/stats
* GET /api/v1/resales
* GET /api/v1/events/:id

Métricas observadas:

* Tiempo promedio de respuesta.
* Porcentaje de errores.
* Requests por segundo.
* Tiempo máximo de respuesta.
* Estabilidad bajo carga.

---

## 4.5 Pruebas de seguridad

Las pruebas de seguridad se basarán en OWASP Top 10.

Verificaciones principales:

* A01 Broken Access Control: validar que rutas administrativas no sean accesibles sin permisos.
* A03 Injection: validar que entradas maliciosas no generen errores inesperados.
* A05 Security Misconfiguration: revisar CORS, headers y exposición de errores.
* A06 Vulnerable Components: ejecutar npm audit sobre dependencias.
* A07 Authentication Failures: revisar flujo de login y expiración de sesión.

Herramientas:

* Revisión manual.
* npm audit.
* OWASP ZAP, si el tiempo lo permite.
* Inspección de código.

Criterio de aceptación:

* No deben exponerse datos sensibles.
* Las rutas privadas deben requerir autenticación.
* Los errores no deben mostrar stack traces en producción.
* Las dependencias no deben tener vulnerabilidades críticas sin documentar.
* Las entradas del usuario deben validarse antes de ser procesadas.

---

## 4.6 Pruebas de accesibilidad y compatibilidad

Se revisará que la aplicación pueda ser usada correctamente en distintos dispositivos y navegadores.

Aspectos revisados:

* Imágenes con atributo alt.
* Inputs con label o aria-label.
* Navegación básica con teclado.
* Focus visible.
* Contraste visual.
* Mensajes de error comprensibles.
* Responsive design.

Navegadores considerados:

* Google Chrome.
* Microsoft Edge.
* Mozilla Firefox.
* Safari, documentado como pendiente si no se cuenta con equipo macOS/iOS.

Viewports considerados:

* Desktop: 1920x1080.
* Laptop: 1440x900.
* Tablet: 768x1024.
* Móvil: 390x844.
* Móvil Android típico: 360x800.

---

## 5. Tipos de prueba a ejecutar y justificación

| Tipo de prueba           | Justificación                                                               |
| ------------------------ | --------------------------------------------------------------------------- |
| Unitarias                | Validan reglas de negocio aisladas sin depender de infraestructura externa. |
| Integración              | Validan comunicación entre API, servicios y bases de datos.                 |
| End-to-End               | Validan flujos reales desde la interfaz de usuario.                         |
| Base de datos relacional | Verifican persistencia, relaciones y restricciones en PostgreSQL.           |
| Base de datos NoSQL      | Verifican documentos de reseñas y estructuras flexibles en MongoDB.         |
| Seguridad                | Identifican vulnerabilidades comunes antes de producción.                   |
| Rendimiento              | Evalúan estabilidad ante múltiples usuarios o tráfico elevado.              |
| Accesibilidad            | Mejoran la experiencia para usuarios con distintas necesidades.             |
| Compatibilidad           | Aseguran funcionamiento en distintos dispositivos y navegadores.            |
| Observabilidad           | Facilitan diagnóstico de errores en ejecución.                              |

---

## 6. Criterios de entrada

Las pruebas podrán comenzar cuando se cumplan las siguientes condiciones:

* El repositorio Stagefront está clonado correctamente.
* Docker está disponible en el equipo.
* PostgreSQL y MongoDB levantan correctamente mediante docker-compose.
* El backend instala dependencias sin errores críticos.
* El frontend instala dependencias sin errores críticos.
* El archivo .env del backend fue creado a partir de .env.example.
* El archivo .env del frontend fue creado a partir de .env.example.
* Las migraciones y seeds de Prisma se ejecutan correctamente.
* El backend responde en http://localhost:3001.
* El frontend responde en http://localhost:5173.
* El equipo tiene definidos roles de QA Lead y Dev QA.
* Existe carpeta docs para versionar la documentación de calidad.

---

## 7. Criterios de salida

Las pruebas se considerarán finalizadas cuando se cumplan los siguientes criterios:

* Test Plan documentado y versionado en el repositorio.
* Mínimo 8 casos de prueba documentados.
* Mínimo 5 defectos documentados con evidencia o descripción reproducible.
* Pruebas unitarias configuradas y ejecutadas.
* Pruebas de integración configuradas y ejecutadas.
* Pruebas E2E configuradas o documentadas.
* Checklist OWASP con mínimo 3 vulnerabilidades revisadas.
* Reporte de accesibilidad y compatibilidad documentado.
* Plan de rendimiento documentado.
* Evidencias agregadas en QA_EVIDENCE.md.
* No existen defectos críticos sin documentar que bloqueen la ejecución principal.
* El equipo conoce los riesgos pendientes antes de entrega.

---

## 8. Criterios de suspensión

Las pruebas se pausarán temporalmente si ocurre alguno de estos casos:

* El backend no puede iniciar por errores de configuración.
* Las bases de datos no levantan correctamente en Docker.
* Las migraciones fallan y no existe una base estable para probar.
* El frontend no puede comunicarse con la API.
* Existe un bug crítico que impide acceder a la aplicación.
* Hay pérdida o corrupción de datos de prueba.
* El entorno local queda inconsistente.
* Las dependencias presentan errores de instalación que bloquean ejecución.

Acción correctiva:

* Registrar el problema en BUG_REPORTS.md.
* Documentar evidencia en QA_EVIDENCE.md.
* Asignar responsable.
* Corregir la configuración o definir workaround.
* Reanudar pruebas cuando el ambiente vuelva a estar estable.

---

## 9. Roles y responsabilidades del equipo

| Rol               | Responsable                 | Actividades                                                                                                             |
| ----------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| QA Lead           | Edgar Castro                | Elaboración del Test Plan, documentación de casos de prueba, registro de defectos, evidencias y seguimiento de calidad. |
| Dev QA            | Javier Marin                | Configuración de pruebas automatizadas, pruebas unitarias, pruebas de integración y Cypress.                            |
| Backend Tester    | Javier Marin                | Validación de endpoints, servicios, Prisma, PostgreSQL y MongoDB.                                                       |
| Frontend Tester   | Edgar Castro                | Validación de interfaz, formularios, navegación, accesibilidad y compatibilidad visual.                                 |
| Security Reviewer | Edgar Castro y Javier Marin | Revisión OWASP, npm audit, riesgos de autenticación y controles de acceso.                                              |
| DevOps básico     | Edgar Castro y Javier Marin | Docker, variables de entorno, ejecución de pruebas y documentación de comandos.                                         |

---

## 10. Entornos de prueba

## 10.1 Local

Ambiente usado por los integrantes del equipo en sus computadoras.

Características:

* Frontend en http://localhost:5173.
* Backend en http://localhost:3001.
* PostgreSQL en Docker.
* MongoDB en Docker.
* Variables desde archivos .env.
* Usado para pruebas manuales, unitarias, integración y E2E.

## 10.2 Staging simulado

Ambiente propuesto para validar antes de producción.

Características:

* Misma configuración que local, pero con base de datos separada.
* Datos seed controlados.
* Logs habilitados.
* Configuración de CORS más cercana a producción.
* Usado para pruebas E2E, rendimiento y seguridad.

## 10.3 Producción

Ambiente real propuesto para usuarios finales.

Características esperadas:

* HTTPS obligatorio.
* Variables de entorno protegidas.
* Logs estructurados.
* Monitoreo de errores.
* Métricas RED por endpoint.
* CORS restrictivo.
* Endpoints administrativos protegidos.
* Base de datos con respaldos.

---

## 11. Herramientas utilizadas con justificación

| Herramienta           | Uso                           | Justificación                                                    |
| --------------------- | ----------------------------- | ---------------------------------------------------------------- |
| TypeScript            | Desarrollo frontend y backend | Permite tipado estático y detección temprana de errores.         |
| ESLint                | Análisis estático             | Ayuda a mantener reglas de calidad y consistencia.               |
| Prettier              | Formato                       | Mantiene estilo de código uniforme.                              |
| Vitest                | Unit testing                  | Ligero, rápido y compatible con TypeScript.                      |
| Supertest             | Integration testing API       | Permite probar endpoints Express mediante requests HTTP.         |
| Cypress               | E2E testing                   | Permite validar flujos reales desde el navegador.                |
| Prisma                | ORM PostgreSQL                | Facilita migraciones, queries tipadas y manejo de BD relacional. |
| Mongoose              | ODM MongoDB                   | Permite definir modelos y validar documentos NoSQL.              |
| Docker Compose        | Entorno de BD                 | Permite levantar PostgreSQL y MongoDB de manera reproducible.    |
| k6 o Artillery        | Performance testing           | Permite simular carga sobre endpoints críticos.                  |
| npm audit             | Seguridad de dependencias     | Detecta vulnerabilidades conocidas en paquetes npm.              |
| Lighthouse / axe-core | Accesibilidad                 | Evalúa accesibilidad, performance y buenas prácticas web.        |
| Git                   | Versionamiento                | Permite documentar cambios, pruebas y entregables.               |

---

## 12. Gestión de defectos

Los defectos se registrarán en el archivo docs/BUG_REPORTS.md.

Cada defecto debe incluir:

* ID único.
* Título.
* Descripción.
* Pasos para reproducir.
* Datos de prueba.
* Resultado esperado.
* Resultado actual.
* Evidencia.
* Severidad.
* Prioridad.
* Entorno.
* Versión.
* Responsable.
* Estado.

Estados permitidos:

* Open.
* In Progress.
* Fixed.
* Verified.
* Closed.
* Reopened.

Severidades:

* Critical: impide el uso del sistema o afecta datos críticos.
* High: afecta un flujo importante, pero existe workaround.
* Medium: afecta validación o experiencia, pero no bloquea todo el sistema.
* Low: problema menor visual, de texto o usabilidad.

Prioridades:

* Blocker: debe corregirse antes de entregar.
* High: corregir lo antes posible.
* Medium: corregir después de defectos críticos.
* Low: corregir si hay tiempo.

Flujo de defectos:

1. QA detecta el defecto.
2. QA documenta pasos y evidencia.
3. QA Lead asigna severidad y prioridad.
4. Dev revisa el defecto.
5. Dev corrige o documenta workaround.
6. QA verifica.
7. QA cierra el defecto o lo reabre.

---

## 13. Métricas de calidad objetivo

| Métrica                              | Objetivo |
| ------------------------------------ | -------- |
| Cobertura global mínima              | 75%      |
| Cobertura de lógica de negocio       | 90%      |
| Cobertura de servicios/casos de uso  | 80%      |
| Cobertura de controllers             | 70%      |
| Cobertura de repositorios            | 60%      |
| Casos de prueba documentados         | Mínimo 8 |
| Defectos documentados                | Mínimo 5 |
| Pruebas unitarias                    | Mínimo 5 |
| Pruebas de integración               | Mínimo 3 |
| Pruebas E2E                          | Mínimo 2 |
| Defectos críticos abiertos al cierre | 0        |
| Endpoints críticos revisados         | Mínimo 5 |
| Vulnerabilidades OWASP revisadas     | Mínimo 3 |
| Viewports revisados                  | Mínimo 4 |

---

## 14. Riesgos identificados y plan de mitigación

| Riesgo                                                        | Impacto | Probabilidad | Mitigación                                                      |
| ------------------------------------------------------------- | ------- | ------------ | --------------------------------------------------------------- |
| El proyecto no levanta por errores de ambiente                | Alto    | Media        | Documentar instalación, usar .env.example y Docker Compose.     |
| Fallan migraciones o seeds                                    | Alto    | Media        | Ejecutar db:setup y registrar errores en evidencia.             |
| Poco tiempo para automatizar todas las capas                  | Alto    | Media        | Priorizar unitarias, integración y E2E de flujos críticos.      |
| Endpoints administrativos sin autenticación robusta           | Alto    | Media        | Documentar hallazgo en seguridad y proponer middleware JWT.     |
| Formularios aceptan datos inválidos                           | Medio   | Alta         | Crear bug reports y pruebas de validación.                      |
| Cypress falla por selectores inestables                       | Medio   | Media        | Usar selectores por texto temporalmente y proponer data-testid. |
| Dependencias con vulnerabilidades                             | Medio   | Media        | Ejecutar npm audit y documentar resultado.                      |
| Pruebas de performance extensas requieren más infraestructura | Medio   | Media        | Ejecutar prueba corta y documentar plan completo.               |
| Incompatibilidad entre navegadores                            | Medio   | Media        | Probar Chrome/Edge y documentar pendientes.                     |
| Falta de evidencia visual                                     | Alto    | Baja         | Crear QA_EVIDENCE.md con capturas y comandos ejecutados.        |

---

## 15. Calendario semanal de ejecución

El trabajo de calidad se organizó en una semana de ejecución, distribuyendo las actividades entre Edgar Castro y Javier Marin para cubrir documentación, configuración, automatización y evidencias.

| Día   | Actividad                                                                                                     | Responsable                 | Entregable                          |
| ----- | ------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------- |
| Día 1 | Revisión inicial del repositorio, lectura de README, identificación de tecnologías y estructura del proyecto. | Edgar Castro y Javier Marin | Análisis inicial del proyecto.      |
| Día 1 | Configuración del entorno local con Docker, backend, frontend, PostgreSQL y MongoDB.                          | Javier Marin                | Entorno local funcional.            |
| Día 2 | Elaboración del Test Plan y definición de alcance, criterios, riesgos, métricas y herramientas.               | Edgar Castro                | docs/TEST_PLAN.md                   |
| Día 2 | Revisión de configuración TypeScript, scripts npm y estructura de backend/frontend.                           | Javier Marin                | Notas técnicas de configuración.    |
| Día 3 | Diseño y documentación de casos de prueba funcionales para frontend, API, PostgreSQL y MongoDB.               | Edgar Castro                | docs/TEST_CASES.md                  |
| Día 3 | Configuración de Vitest y creación de pruebas unitarias para reglas de negocio.                               | Javier Marin                | Pruebas unitarias en backend.       |
| Día 4 | Registro de defectos funcionales y de validación encontrados en el sistema.                                   | Edgar Castro                | docs/BUG_REPORTS.md                 |
| Día 4 | Configuración de Supertest y creación de pruebas de integración para endpoints principales.                   | Javier Marin                | Pruebas de integración API.         |
| Día 5 | Revisión de seguridad basada en OWASP Top 10 y ejecución/documentación de npm audit.                          | Edgar Castro y Javier Marin | docs/SECURITY_CHECKLIST.md          |
| Día 5 | Configuración de Cypress y creación de pruebas E2E para navegación, login y checkout.                         | Javier Marin                | Pruebas E2E en frontend.            |
| Día 6 | Revisión de accesibilidad, compatibilidad responsive y navegadores principales.                               | Edgar Castro                | docs/ACCESSIBILITY_COMPATIBILITY.md |
| Día 6 | Diseño de pruebas de rendimiento con k6 o Artillery para endpoints críticos.                                  | Javier Marin                | docs/PERFORMANCE_PLAN.md            |
| Día 7 | Integración de evidencias, revisión final de documentos, ejecución de pruebas y preparación de entrega.       | Edgar Castro y Javier Marin | QA_EVIDENCE.md y entrega final.     |

---

## 16. Evidencias esperadas

Las evidencias del proceso de calidad se documentarán en el archivo QA_EVIDENCE.md.

Se incluirán:

* Captura del backend ejecutándose.
* Captura del frontend ejecutándose.
* Captura de contenedores Docker activos.
* Captura de pruebas unitarias ejecutadas.
* Captura de pruebas de integración ejecutadas.
* Captura de pruebas E2E ejecutadas.
* Captura de revisión responsive.
* Captura de revisión de seguridad o npm audit.
* Capturas de defectos relevantes.
* Comandos utilizados durante la ejecución.

---

## 17. Aprobación del plan

El presente plan de pruebas se considera aprobado por el equipo al cumplir con los puntos requeridos por la estrategia de calidad solicitada para el proyecto Stagefront.

| Nombre       | Rol     | Estado   |
| ------------ | ------- | -------- |
| Edgar Castro | QA Lead | Aprobado |
| Javier Marin | Dev QA  | Aprobado |
