# Bug Reports - Stagefront

## Información general

| Campo                    | Valor                            |
| ------------------------ | -------------------------------- |
| Proyecto                 | Stagefront                       |
| Responsables             | Edgar Castro y Javier Marin      |
| Entorno evaluado         | Local                            |
| Frontend                 | http://localhost:5173            |
| Backend                  | http://localhost:3001            |
| Base de datos relacional | PostgreSQL                       |
| Base de datos NoSQL      | MongoDB                          |
| Navegador principal      | Google Chrome                    |
| Sistema operativo        | Windows                          |
| Periodo de revisión      | Semana de ejecución del proyecto |
| Documento relacionado    | TEST_PLAN.md                     |

---

## Flujo de estados utilizado

| Estado      | Descripción                                  |
| ----------- | -------------------------------------------- |
| Open        | Defecto identificado y documentado.          |
| In Progress | Defecto en revisión o corrección.            |
| Fixed       | Defecto corregido por desarrollo.            |
| Verified    | Corrección validada por QA.                  |
| Closed      | Defecto cerrado.                             |
| Reopened    | Defecto reabierto porque persiste o regresó. |

---

## Escala de severidad

| Severidad | Descripción                                                     |
| --------- | --------------------------------------------------------------- |
| Critical  | Bloquea un flujo principal o afecta datos críticos.             |
| High      | Afecta una funcionalidad importante, aunque existe alternativa. |
| Medium    | Afecta validaciones, experiencia o consistencia del sistema.    |
| Low       | Problema menor visual, de texto o usabilidad.                   |

---

## Escala de prioridad

| Prioridad | Descripción                                          |
| --------- | ---------------------------------------------------- |
| Blocker   | Debe atenderse antes de liberar o entregar.          |
| High      | Debe corregirse lo antes posible.                    |
| Medium    | Se corrige después de los defectos críticos o altos. |
| Low       | Se corrige si hay tiempo disponible.                 |

---

# BUG-001 - Checkout permite exceder el límite de boletos al cambiar de zona

| Campo                 | Detalle                                                                                                                                                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                    | BUG-001                                                                                                                                                                                                                                                                                                           |
| Título                | Checkout - Límite de boletos - Se puede exceder el máximo permitido al cambiar de zona                                                                                                                                                                                                                            |
| Descripción           | El sistema permite que el usuario exceda el límite permitido de boletos si primero selecciona una cantidad válida en una zona y posteriormente cambia de zona sin reiniciar correctamente la selección. Esto puede generar inconsistencias en la compra y afectar la disponibilidad de boletos.                   |
| Módulo                | Frontend / Checkout / Selección de boletos                                                                                                                                                                                                                                                                        |
| Pasos para reproducir | 1. Abrir el frontend en `http://localhost:5173`. <br> 2. Entrar al catálogo de eventos. <br> 3. Seleccionar un evento disponible. <br> 4. Elegir una zona. <br> 5. Seleccionar la cantidad máxima permitida de boletos. <br> 6. Cambiar a otra zona. <br> 7. Intentar aumentar nuevamente la cantidad de boletos. |
| Datos de prueba       | Evento disponible. Zona inicial: General. Segunda zona: VIP o similar. Cantidad inicial: máximo permitido.                                                                                                                                                                                                        |
| Resultado esperado    | Al cambiar de zona, el sistema debe recalcular o reiniciar la cantidad seleccionada para impedir que se supere el máximo permitido.                                                                                                                                                                               |
| Resultado actual      | El sistema puede permitir una cantidad mayor al límite esperado al cambiar de zona.                                                                                                                                                                                                                               |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                                                                                           |
| Severidad             | High                                                                                                                                                                                                                                                                                                              |
| Prioridad             | High                                                                                                                                                                                                                                                                                                              |
| Entorno               | Local / Chrome / Windows                                                                                                                                                                                                                                                                                          |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                                                                                              |
| Asignado a            | Javier Marin                                                                                                                                                                                                                                                                                                      |
| Estado                | Open                                                                                                                                                                                                                                                                                                              |

---

# BUG-002 - Checkout acepta tarjetas vencidas

| Campo                 | Detalle                                                                                                                                                                                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                    | BUG-002                                                                                                                                                                                                                                                                                                                             |
| Título                | Checkout - Validación de tarjeta - El sistema acepta fecha de expiración vencida                                                                                                                                                                                                                                                    |
| Descripción           | El formulario de pago permite ingresar una fecha de expiración anterior a la fecha actual. Esto representa un error de validación importante en el flujo de compra, ya que una tarjeta vencida no debería ser aceptada.                                                                                                             |
| Módulo                | Frontend / Checkout / Pago                                                                                                                                                                                                                                                                                                          |
| Pasos para reproducir | 1. Abrir `http://localhost:5173`. <br> 2. Seleccionar un evento. <br> 3. Avanzar hasta el checkout. <br> 4. Ingresar datos válidos de comprador. <br> 5. Ingresar número de tarjeta válido de prueba. <br> 6. Ingresar fecha de expiración vencida. <br> 7. Ingresar CVV válido. <br> 8. Presionar el botón de pago o confirmación. |
| Datos de prueba       | Nombre: Edgar Castro. Correo: `edgar.test@mail.com`. Tarjeta: `4111111111111111`. Fecha: `01/20`. CVV: `123`.                                                                                                                                                                                                                       |
| Resultado esperado    | El sistema debe rechazar la tarjeta y mostrar un mensaje indicando que la fecha de expiración no es válida.                                                                                                                                                                                                                         |
| Resultado actual      | El sistema permite continuar o no muestra una validación clara sobre la tarjeta vencida.                                                                                                                                                                                                                                            |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                                                                                                             |
| Severidad             | High                                                                                                                                                                                                                                                                                                                                |
| Prioridad             | High                                                                                                                                                                                                                                                                                                                                |
| Entorno               | Local / Chrome / Windows                                                                                                                                                                                                                                                                                                            |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                                                                                                                |
| Asignado a            | Javier Marin                                                                                                                                                                                                                                                                                                                        |
| Estado                | Open                                                                                                                                                                                                                                                                                                                                |

---

# BUG-003 - Formularios aceptan campos compuestos solo por espacios

| Campo                 | Detalle                                                                                                                                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                    | BUG-003                                                                                                                                                                                                                                                                 |
| Título                | Formularios - Validación de campos - Se aceptan valores compuestos únicamente por espacios                                                                                                                                                                              |
| Descripción           | Algunos formularios del sistema aceptan entradas donde el usuario escribe solamente espacios en blanco. Esto permite enviar datos inválidos y afecta la calidad de la información almacenada o procesada.                                                               |
| Módulo                | Frontend / Formularios / Validaciones                                                                                                                                                                                                                                   |
| Pasos para reproducir | 1. Abrir un formulario del sistema, por ejemplo checkout, reseñas o reventa. <br> 2. En campos obligatorios como nombre o comentario, ingresar únicamente espacios. <br> 3. Completar el resto de campos con datos aparentemente válidos. <br> 4. Enviar el formulario. |
| Datos de prueba       | Nombre: `"     "`. Comentario: `"     "`. Correo: `edgar.test@mail.com`.                                                                                                                                                                                                |
| Resultado esperado    | El sistema debe aplicar `trim()` o una validación equivalente y rechazar valores vacíos después de eliminar espacios.                                                                                                                                                   |
| Resultado actual      | El formulario puede aceptar campos que visualmente no contienen información útil.                                                                                                                                                                                       |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                                                 |
| Severidad             | Medium                                                                                                                                                                                                                                                                  |
| Prioridad             | High                                                                                                                                                                                                                                                                    |
| Entorno               | Local / Chrome / Windows                                                                                                                                                                                                                                                |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                                                    |
| Asignado a            | Edgar Castro                                                                                                                                                                                                                                                            |
| Estado                | Open                                                                                                                                                                                                                                                                    |

---

# BUG-004 - Checkout no valida correctamente la longitud del CVV

| Campo                 | Detalle                                                                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                    | BUG-004                                                                                                                                                                                                                                                                      |
| Título                | Checkout - CVV - Se aceptan longitudes inválidas                                                                                                                                                                                                                             |
| Descripción           | El campo CVV permite ingresar valores con una longitud distinta a 3 o 4 dígitos. Esto afecta la validación del formulario de pago y permite datos incorrectos en una operación crítica.                                                                                      |
| Módulo                | Frontend / Checkout / Pago                                                                                                                                                                                                                                                   |
| Pasos para reproducir | 1. Abrir el frontend. <br> 2. Seleccionar un evento. <br> 3. Avanzar al checkout. <br> 4. Ingresar datos de comprador válidos. <br> 5. Ingresar un número de tarjeta válido de prueba. <br> 6. Ingresar CVV con 1, 2 o más de 4 dígitos. <br> 7. Intentar confirmar el pago. |
| Datos de prueba       | Nombre: Edgar Castro. Correo: `edgar.test@mail.com`. Tarjeta: `4111111111111111`. Fecha: `12/28`. CVV inválido: `1`, `12` o `123456`.                                                                                                                                        |
| Resultado esperado    | El sistema debe rechazar CVV que no tenga 3 o 4 dígitos numéricos.                                                                                                                                                                                                           |
| Resultado actual      | El sistema puede aceptar CVV con longitud inválida o no mostrar mensaje de error específico.                                                                                                                                                                                 |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                                                      |
| Severidad             | Medium                                                                                                                                                                                                                                                                       |
| Prioridad             | High                                                                                                                                                                                                                                                                         |
| Entorno               | Local / Chrome / Windows                                                                                                                                                                                                                                                     |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                                                         |
| Asignado a            | Javier Marin                                                                                                                                                                                                                                                                 |
| Estado                | Open                                                                                                                                                                                                                                                                         |

---

# BUG-005 - Checkout acepta números de tarjeta con longitud inválida

| Campo                 | Detalle                                                                                                                                                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                    | BUG-005                                                                                                                                                                                                                                                                                                   |
| Título                | Checkout - Número de tarjeta - Se aceptan longitudes inválidas                                                                                                                                                                                                                                            |
| Descripción           | El formulario de checkout permite ingresar números de tarjeta que no cumplen con la longitud esperada. Esto representa una falla de validación en el flujo de pago.                                                                                                                                       |
| Módulo                | Frontend / Checkout / Pago                                                                                                                                                                                                                                                                                |
| Pasos para reproducir | 1. Entrar al frontend en `http://localhost:5173`. <br> 2. Seleccionar un evento y avanzar al checkout. <br> 3. Ingresar datos válidos en nombre y correo. <br> 4. Ingresar un número de tarjeta con menos o más de 16 dígitos. <br> 5. Completar fecha y CVV válidos. <br> 6. Intentar confirmar el pago. |
| Datos de prueba       | Nombre: Javier Marin. Correo: `javier.test@mail.com`. Tarjeta inválida: `41111111` o `41111111111111111111`. Fecha: `12/28`. CVV: `123`.                                                                                                                                                                  |
| Resultado esperado    | El sistema debe rechazar números de tarjeta con longitud inválida y mostrar un mensaje claro.                                                                                                                                                                                                             |
| Resultado actual      | El sistema puede permitir continuar sin validar correctamente la longitud del número de tarjeta.                                                                                                                                                                                                          |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                                                                                   |
| Severidad             | High                                                                                                                                                                                                                                                                                                      |
| Prioridad             | High                                                                                                                                                                                                                                                                                                      |
| Entorno               | Local / Chrome / Windows                                                                                                                                                                                                                                                                                  |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                                                                                      |
| Asignado a            | Javier Marin                                                                                                                                                                                                                                                                                              |
| Estado                | Open                                                                                                                                                                                                                                                                                                      |

---

# BUG-006 - Código promocional inválido no muestra retroalimentación clara

| Campo                 | Detalle                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                    | BUG-006                                                                                                                                                                                                                                                 |
| Título                | Checkout - Código promocional - No se muestra mensaje claro al ingresar código inválido                                                                                                                                                                 |
| Descripción           | Al ingresar un código promocional inexistente o inválido, el sistema no muestra retroalimentación suficiente para que el usuario entienda si el código fue rechazado, ignorado o si ocurrió un error.                                                   |
| Módulo                | Frontend / Checkout / Promociones                                                                                                                                                                                                                       |
| Pasos para reproducir | 1. Abrir el frontend. <br> 2. Seleccionar un evento y avanzar al checkout. <br> 3. Ubicar el campo de código promocional. <br> 4. Ingresar un código inválido. <br> 5. Aplicar el código. <br> 6. Revisar si aparece un mensaje de error o advertencia. |
| Datos de prueba       | Código promocional: `NOEXISTE2026`                                                                                                                                                                                                                      |
| Resultado esperado    | El sistema debe mostrar un mensaje claro: “Código promocional inválido” o equivalente.                                                                                                                                                                  |
| Resultado actual      | El sistema no muestra retroalimentación clara o el usuario no puede identificar si el código fue procesado.                                                                                                                                             |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                                 |
| Severidad             | Low                                                                                                                                                                                                                                                     |
| Prioridad             | Medium                                                                                                                                                                                                                                                  |
| Entorno               | Local / Chrome / Windows                                                                                                                                                                                                                                |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                                    |
| Asignado a            | Edgar Castro                                                                                                                                                                                                                                            |
| Estado                | Open                                                                                                                                                                                                                                                    |

---

# BUG-007 - Rutas administrativas requieren mayor protección de acceso

| Campo                 | Detalle                                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID                    | BUG-007                                                                                                                                                                                                                                                                        |
| Título                | Seguridad - Rutas administrativas - Control de acceso insuficiente                                                                                                                                                                                                             |
| Descripción           | Las rutas administrativas deben protegerse correctamente para evitar que usuarios no autorizados accedan a funcionalidades sensibles. Si una ruta administrativa puede consultarse sin autenticación o sin validación de rol, se considera un riesgo de Broken Access Control. |
| Módulo                | Backend / Admin / Seguridad                                                                                                                                                                                                                                                    |
| Pasos para reproducir | 1. Abrir Postman o Thunder Client. <br> 2. Enviar una petición a un endpoint administrativo, por ejemplo `/api/v1/admin/stats`. <br> 3. No enviar token de autenticación. <br> 4. Revisar el código HTTP y la respuesta.                                                       |
| Datos de prueba       | Método: GET. URL: `http://localhost:3001/api/v1/admin/stats`. Headers: sin Authorization.                                                                                                                                                                                      |
| Resultado esperado    | El backend debe responder con 401 Unauthorized o 403 Forbidden cuando no exista token o permisos suficientes.                                                                                                                                                                  |
| Resultado actual      | Pendiente de validación. Si responde 200 sin token, se confirma defecto de seguridad.                                                                                                                                                                                          |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                                                        |
| Severidad             | Critical                                                                                                                                                                                                                                                                       |
| Prioridad             | Blocker                                                                                                                                                                                                                                                                        |
| Entorno               | Local / Postman / Windows                                                                                                                                                                                                                                                      |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                                                           |
| Asignado a            | Javier Marin                                                                                                                                                                                                                                                                   |
| Estado                | Open                                                                                                                                                                                                                                                                           |

---

# BUG-008 - Mensajes de error de formularios no siempre son específicos

| Campo                 | Detalle                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID                    | BUG-008                                                                                                                                                                                                                                    |
| Título                | UX/Formularios - Mensajes de error - Retroalimentación poco específica                                                                                                                                                                     |
| Descripción           | En algunos formularios, cuando el usuario ingresa información inválida, el sistema no siempre comunica con claridad qué campo falló o cómo corregirlo. Esto afecta la experiencia de usuario y dificulta completar correctamente el flujo. |
| Módulo                | Frontend / Formularios / UX                                                                                                                                                                                                                |
| Pasos para reproducir | 1. Abrir un formulario del sistema. <br> 2. Ingresar datos incompletos o inválidos. <br> 3. Enviar el formulario. <br> 4. Revisar si cada campo muestra un mensaje específico.                                                             |
| Datos de prueba       | Correo inválido: `correo-mal`. CVV inválido: `12`. Campo obligatorio vacío: nombre.                                                                                                                                                        |
| Resultado esperado    | Cada campo inválido debe mostrar un mensaje específico y comprensible.                                                                                                                                                                     |
| Resultado actual      | Algunos errores pueden mostrarse de manera genérica o no asociarse claramente al campo correspondiente.                                                                                                                                    |
| Evidencia             | Pendiente de captura en QA_EVIDENCE.md.                                                                                                                                                                                                    |
| Severidad             | Medium                                                                                                                                                                                                                                     |
| Prioridad             | Medium                                                                                                                                                                                                                                     |
| Entorno               | Local / Chrome / Windows                                                                                                                                                                                                                   |
| Versión               | Rama main del repositorio Stagefront                                                                                                                                                                                                       |
| Asignado a            | Edgar Castro                                                                                                                                                                                                                               |
| Estado                | Open                                                                                                                                                                                                                                       |

---

## Resumen de defectos

| ID      | Módulo               | Severidad | Prioridad | Estado | Asignado a   |
| ------- | -------------------- | --------- | --------- | ------ | ------------ |
| BUG-001 | Checkout             | High      | High      | Open   | Javier Marin |
| BUG-002 | Checkout/Pago        | High      | High      | Open   | Javier Marin |
| BUG-003 | Formularios          | Medium    | High      | Open   | Edgar Castro |
| BUG-004 | Checkout/Pago        | Medium    | High      | Open   | Javier Marin |
| BUG-005 | Checkout/Pago        | High      | High      | Open   | Javier Marin |
| BUG-006 | Checkout/Promociones | Low       | Medium    | Open   | Edgar Castro |
| BUG-007 | Seguridad/Admin      | Critical  | Blocker   | Open   | Javier Marin |
| BUG-008 | UX/Formularios       | Medium    | Medium    | Open   | Edgar Castro |

---

## Métricas del registro de defectos

| Métrica                        | Resultado |
| ------------------------------ | --------- |
| Total de defectos documentados | 8         |
| Defectos Critical              | 1         |
| Defectos High                  | 3         |
| Defectos Medium                | 3         |
| Defectos Low                   | 1         |
| Defectos con prioridad Blocker | 1         |
| Defectos con prioridad High    | 4         |
| Defectos abiertos              | 8         |
| Defectos cerrados              | 0         |

---

## Observaciones finales

Durante la revisión se identificaron defectos relacionados principalmente con validaciones del flujo de checkout, reglas de negocio, mensajes de error y seguridad administrativa. Los defectos de mayor prioridad se concentran en el flujo de compra y en la protección de rutas administrativas, por lo que deben atenderse antes de considerar una liberación productiva.

Para esta entrega académica, los defectos quedan documentados con pasos reproducibles, datos de prueba, severidad, prioridad y responsable asignado.
