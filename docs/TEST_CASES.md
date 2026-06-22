# Test Cases - Stagefront

## Información general

| Campo                    | Valor                                                         |
| ------------------------ | ------------------------------------------------------------- |
| Proyecto                 | Stagefront                                                    |
| Módulo evaluado          | Frontend, API REST, PostgreSQL, MongoDB, Admin, Checkout      |
| Responsables             | Edgar Castro y Javier Marin                                   |
| Entorno                  | Local                                                         |
| Frontend                 | http://localhost:5173                                         |
| Backend                  | http://localhost:3001                                         |
| Base de datos relacional | PostgreSQL                                                    |
| Base de datos NoSQL      | MongoDB                                                       |
| Herramientas             | Navegador, Postman/Thunder Client, Vitest, Supertest, Cypress |

---

## TC-API-001 - Eventos: obtener listado de eventos correctamente

| Campo              | Detalle                                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-API-001                                                                                                                                                                                                                       |
| Título             | API Eventos - Obtener listado de eventos - Respuesta exitosa                                                                                                                                                                     |
| Módulo             | API REST / Eventos                                                                                                                                                                                                               |
| Responsable        | Javier Marin                                                                                                                                                                                                                     |
| Precondiciones     | Backend ejecutándose en http://localhost:3001. Base de datos PostgreSQL levantada. Seeds ejecutados correctamente.                                                                                                               |
| Datos de entrada   | Método: GET. URL: http://localhost:3001/api/v1/events                                                                                                                                                                            |
| Pasos de ejecución | 1. Abrir Postman o navegador. <br> 2. Enviar una petición GET a `/api/v1/events`. <br> 3. Revisar el código de estado HTTP. <br> 4. Revisar que la respuesta sea JSON. <br> 5. Verificar que existan eventos o una lista válida. |
| Resultado esperado | La API responde con status 200 y devuelve una lista de eventos en formato JSON.                                                                                                                                                  |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                          |
| Estado             | Not Executed                                                                                                                                                                                                                     |
| Severidad          | High                                                                                                                                                                                                                             |
| Prioridad          | High                                                                                                                                                                                                                             |
| Automatizado       | Pendiente                                                                                                                                                                                                                        |
| Referencia         | RF-API-001: Consulta pública de eventos.                                                                                                                                                                                         |

---

## TC-API-002 - Eventos: consultar detalle de evento existente

| Campo              | Detalle                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-API-002                                                                                                                                                                                     |
| Título             | API Eventos - Consultar detalle de evento existente - Respuesta exitosa                                                                                                                        |
| Módulo             | API REST / Eventos                                                                                                                                                                             |
| Responsable        | Javier Marin                                                                                                                                                                                   |
| Precondiciones     | Backend ejecutándose. PostgreSQL con datos seed. Debe existir al menos un evento registrado.                                                                                                   |
| Datos de entrada   | Método: GET. URL: http://localhost:3001/api/v1/events/{id}. ID de prueba: usar un ID válido obtenido desde `/api/v1/events`.                                                                   |
| Pasos de ejecución | 1. Enviar GET a `/api/v1/events`. <br> 2. Copiar el ID de un evento existente. <br> 3. Enviar GET a `/api/v1/events/{id}`. <br> 4. Validar código HTTP. <br> 5. Validar estructura del evento. |
| Resultado esperado | La API responde con status 200 y devuelve los datos del evento solicitado, incluyendo id, nombre/título, fecha, ubicación y precio o zonas disponibles.                                        |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                        |
| Estado             | Not Executed                                                                                                                                                                                   |
| Severidad          | High                                                                                                                                                                                           |
| Prioridad          | High                                                                                                                                                                                           |
| Automatizado       | Pendiente                                                                                                                                                                                      |
| Referencia         | RF-API-002: Consulta de detalle de evento.                                                                                                                                                     |

---

## TC-API-003 - Eventos: consultar evento inexistente

| Campo              | Detalle                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-API-003                                                                                                                                                                    |
| Título             | API Eventos - Consultar evento inexistente - Respuesta controlada                                                                                                             |
| Módulo             | API REST / Eventos                                                                                                                                                            |
| Responsable        | Javier Marin                                                                                                                                                                  |
| Precondiciones     | Backend ejecutándose. Base de datos disponible.                                                                                                                               |
| Datos de entrada   | Método: GET. URL: http://localhost:3001/api/v1/events/00000000-0000-0000-0000-000000000000                                                                                    |
| Pasos de ejecución | 1. Abrir Postman o Thunder Client. <br> 2. Enviar GET a `/api/v1/events/00000000-0000-0000-0000-000000000000`. <br> 3. Revisar código HTTP. <br> 4. Revisar mensaje de error. |
| Resultado esperado | La API responde con status 404 Not Found o un error controlado indicando que el evento no existe.                                                                             |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                       |
| Estado             | Not Executed                                                                                                                                                                  |
| Severidad          | Medium                                                                                                                                                                        |
| Prioridad          | Medium                                                                                                                                                                        |
| Automatizado       | Sí                                                                                                                                                                            |
| Referencia         | RF-API-003: Manejo de recursos inexistentes.                                                                                                                                  |

---

## TC-API-004 - Órdenes: crear orden con datos válidos

| Campo              | Detalle                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-API-004                                                                                                                                                                                                     |
| Título             | API Órdenes - Crear orden con datos válidos - Orden registrada                                                                                                                                                 |
| Módulo             | API REST / Órdenes / PostgreSQL                                                                                                                                                                                |
| Responsable        | Javier Marin                                                                                                                                                                                                   |
| Precondiciones     | Backend ejecutándose. PostgreSQL levantado. Existe al menos un evento con disponibilidad.                                                                                                                      |
| Datos de entrada   | Método: POST. URL: http://localhost:3001/api/v1/orders. Body: `{ "eventId": "ID_VALIDO", "buyerName": "Edgar Castro", "buyerEmail": "edgar.test@mail.com", "quantity": 2, "zone": "General" }`                 |
| Pasos de ejecución | 1. Obtener un evento válido desde `/api/v1/events`. <br> 2. Copiar su ID. <br> 3. Enviar POST a `/api/v1/orders` con los datos indicados. <br> 4. Revisar código HTTP. <br> 5. Revisar que se genere la orden. |
| Resultado esperado | La API responde con status 201 o 200 y devuelve la información de la orden creada.                                                                                                                             |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                        |
| Estado             | Not Executed                                                                                                                                                                                                   |
| Severidad          | Critical                                                                                                                                                                                                       |
| Prioridad          | High                                                                                                                                                                                                           |
| Automatizado       | Pendiente                                                                                                                                                                                                      |
| Referencia         | RF-ORD-001: Creación de órdenes de compra.                                                                                                                                                                     |

---

## TC-API-005 - Órdenes: rechazar orden con campos requeridos faltantes

| Campo              | Detalle                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID                 | TC-API-005                                                                                                                                                               |
| Título             | API Órdenes - Crear orden sin correo - Validación 400                                                                                                                    |
| Módulo             | API REST / Órdenes                                                                                                                                                       |
| Responsable        | Javier Marin                                                                                                                                                             |
| Precondiciones     | Backend ejecutándose. PostgreSQL disponible.                                                                                                                             |
| Datos de entrada   | Método: POST. URL: http://localhost:3001/api/v1/orders. Body: `{ "eventId": "ID_VALIDO", "buyerName": "Edgar Castro", "quantity": 2, "zone": "General" }`                |
| Pasos de ejecución | 1. Obtener un ID válido de evento. <br> 2. Enviar POST a `/api/v1/orders` sin el campo `buyerEmail`. <br> 3. Revisar código HTTP. <br> 4. Revisar mensaje de validación. |
| Resultado esperado | La API responde con status 400 Bad Request y un mensaje indicando que el correo del comprador es requerido.                                                              |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                  |
| Estado             | Not Executed                                                                                                                                                             |
| Severidad          | High                                                                                                                                                                     |
| Prioridad          | High                                                                                                                                                                     |
| Automatizado       | Sí                                                                                                                                                                       |
| Referencia         | RF-ORD-002: Validación de datos obligatorios en órdenes.                                                                                                                 |

---

## TC-API-006 - Reseñas: crear reseña válida en MongoDB

| Campo              | Detalle                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-API-006                                                                                                                                                                                                                                                    |
| Título             | API Reseñas - Crear reseña válida - Documento guardado en MongoDB                                                                                                                                                                                             |
| Módulo             | API REST / Reviews / MongoDB                                                                                                                                                                                                                                  |
| Responsable        | Javier Marin                                                                                                                                                                                                                                                  |
| Precondiciones     | Backend ejecutándose. MongoDB levantado en Docker. Existe al menos un evento válido.                                                                                                                                                                          |
| Datos de entrada   | Método: POST. URL: http://localhost:3001/api/v1/reviews. Body: `{ "eventId": "ID_VALIDO", "userName": "Edgar Castro", "rating": 5, "comment": "Excelente evento y buena experiencia de compra." }`                                                            |
| Pasos de ejecución | 1. Obtener un evento válido desde `/api/v1/events`. <br> 2. Copiar su ID. <br> 3. Enviar POST a `/api/v1/reviews`. <br> 4. Revisar código HTTP. <br> 5. Consultar `/api/v1/events/{eventId}/reviews`. <br> 6. Validar que la reseña aparezca en la respuesta. |
| Resultado esperado | La API responde con status 201 o 200 y guarda la reseña en MongoDB.                                                                                                                                                                                           |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                                                       |
| Estado             | Not Executed                                                                                                                                                                                                                                                  |
| Severidad          | Medium                                                                                                                                                                                                                                                        |
| Prioridad          | Medium                                                                                                                                                                                                                                                        |
| Automatizado       | Pendiente                                                                                                                                                                                                                                                     |
| Referencia         | RF-REV-001: Registro de reseñas de eventos.                                                                                                                                                                                                                   |

---

## TC-API-007 - Reventas: rechazar precio mayor al 30% del precio original

| Campo              | Detalle                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-API-007                                                                                                                                                                                                                  |
| Título             | API Reventas - Precio excede límite permitido - Validación de negocio                                                                                                                                                       |
| Módulo             | API REST / Reventas                                                                                                                                                                                                         |
| Responsable        | Javier Marin                                                                                                                                                                                                                |
| Precondiciones     | Backend ejecutándose. Existe un boleto o evento con precio original conocido.                                                                                                                                               |
| Datos de entrada   | Método: POST. URL: http://localhost:3001/api/v1/resales. Body: `{ "eventId": "ID_VALIDO", "sellerName": "Javier Marin", "sellerEmail": "javier.test@mail.com", "originalPrice": 1000, "resalePrice": 1500, "quantity": 1 }` |
| Pasos de ejecución | 1. Abrir Postman o Thunder Client. <br> 2. Enviar POST a `/api/v1/resales` con precio original 1000 y precio de reventa 1500. <br> 3. Revisar código HTTP. <br> 4. Revisar mensaje de error.                                |
| Resultado esperado | El sistema rechaza la reventa porque el precio supera el 30% permitido. Debe responder con status 400 o mensaje de validación de negocio.                                                                                   |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                     |
| Estado             | Not Executed                                                                                                                                                                                                                |
| Severidad          | High                                                                                                                                                                                                                        |
| Prioridad          | High                                                                                                                                                                                                                        |
| Automatizado       | Sí                                                                                                                                                                                                                          |
| Referencia         | RF-RES-001: Control de precio máximo de reventa.                                                                                                                                                                            |

---

## TC-UI-001 - Frontend: cargar página principal correctamente

| Campo              | Detalle                                                                                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-UI-001                                                                                                                                                                                                                    |
| Título             | Frontend Home - Cargar página principal - Render exitoso                                                                                                                                                                     |
| Módulo             | Frontend / Home                                                                                                                                                                                                              |
| Responsable        | Edgar Castro                                                                                                                                                                                                                 |
| Precondiciones     | Frontend ejecutándose en http://localhost:5173. Backend ejecutándose en http://localhost:3001.                                                                                                                               |
| Datos de entrada   | URL: http://localhost:5173                                                                                                                                                                                                   |
| Pasos de ejecución | 1. Abrir Google Chrome. <br> 2. Ingresar a `http://localhost:5173`. <br> 3. Esperar a que cargue la página. <br> 4. Revisar que no existan errores visibles. <br> 5. Abrir consola del navegador y revisar errores críticos. |
| Resultado esperado | La página principal carga correctamente, muestra contenido del sistema y no presenta errores críticos en consola.                                                                                                            |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                      |
| Estado             | Not Executed                                                                                                                                                                                                                 |
| Severidad          | High                                                                                                                                                                                                                         |
| Prioridad          | High                                                                                                                                                                                                                         |
| Automatizado       | Sí                                                                                                                                                                                                                           |
| Referencia         | RF-UI-001: Acceso público al sitio.                                                                                                                                                                                          |

---

## TC-UI-002 - Frontend: navegar al catálogo de eventos

| Campo              | Detalle                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-UI-002                                                                                                                                                                                                            |
| Título             | Frontend Eventos - Navegar al catálogo - Eventos visibles                                                                                                                                                            |
| Módulo             | Frontend / Eventos                                                                                                                                                                                                   |
| Responsable        | Edgar Castro                                                                                                                                                                                                         |
| Precondiciones     | Frontend y backend ejecutándose. Existen eventos cargados en PostgreSQL.                                                                                                                                             |
| Datos de entrada   | URL: http://localhost:5173/events                                                                                                                                                                                    |
| Pasos de ejecución | 1. Abrir `http://localhost:5173`. <br> 2. Dar clic en la opción de eventos o ingresar directamente a `/events`. <br> 3. Esperar carga de información. <br> 4. Revisar que se muestren tarjetas o listado de eventos. |
| Resultado esperado | El usuario puede ver el catálogo de eventos disponibles.                                                                                                                                                             |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                              |
| Estado             | Not Executed                                                                                                                                                                                                         |
| Severidad          | High                                                                                                                                                                                                                 |
| Prioridad          | High                                                                                                                                                                                                                 |
| Automatizado       | Sí                                                                                                                                                                                                                   |
| Referencia         | RF-UI-002: Consulta visual de eventos.                                                                                                                                                                               |

---

## TC-UI-003 - Frontend: login de administrador con credenciales válidas

| Campo              | Detalle                                                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-UI-003                                                                                                                                                                                          |
| Título             | Admin Login - Credenciales válidas - Acceso al panel                                                                                                                                               |
| Módulo             | Frontend / Admin                                                                                                                                                                                   |
| Responsable        | Edgar Castro                                                                                                                                                                                       |
| Precondiciones     | Frontend y backend ejecutándose. Seed de administrador ejecutado.                                                                                                                                  |
| Datos de entrada   | URL: http://localhost:5173/admin/login. Email: `admin@stagefront.mx`. Password: `admin123` o contraseña definida por seed/documentación del proyecto.                                              |
| Pasos de ejecución | 1. Abrir `/admin/login`. <br> 2. Escribir el correo del administrador. <br> 3. Escribir la contraseña. <br> 4. Presionar el botón de inicio de sesión. <br> 5. Validar redirección al panel admin. |
| Resultado esperado | El sistema permite el acceso al panel administrativo y muestra información de administración.                                                                                                      |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                            |
| Estado             | Not Executed                                                                                                                                                                                       |
| Severidad          | Critical                                                                                                                                                                                           |
| Prioridad          | High                                                                                                                                                                                               |
| Automatizado       | Pendiente                                                                                                                                                                                          |
| Referencia         | RF-ADM-001: Acceso administrativo.                                                                                                                                                                 |

---

## TC-UI-004 - Frontend: login de administrador con credenciales inválidas

| Campo              | Detalle                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-UI-004                                                                                                                                                            |
| Título             | Admin Login - Credenciales inválidas - Mensaje de error                                                                                                              |
| Módulo             | Frontend / Admin                                                                                                                                                     |
| Responsable        | Edgar Castro                                                                                                                                                         |
| Precondiciones     | Frontend y backend ejecutándose.                                                                                                                                     |
| Datos de entrada   | URL: http://localhost:5173/admin/login. Email: `admin@stagefront.mx`. Password: `passwordIncorrecto123`                                                              |
| Pasos de ejecución | 1. Abrir `/admin/login`. <br> 2. Ingresar correo válido. <br> 3. Ingresar contraseña incorrecta. <br> 4. Presionar iniciar sesión. <br> 5. Revisar mensaje mostrado. |
| Resultado esperado | El sistema rechaza el acceso y muestra un mensaje claro de credenciales inválidas.                                                                                   |
| Resultado real     | Pendiente de ejecución.                                                                                                                                              |
| Estado             | Not Executed                                                                                                                                                         |
| Severidad          | High                                                                                                                                                                 |
| Prioridad          | High                                                                                                                                                                 |
| Automatizado       | Sí                                                                                                                                                                   |
| Referencia         | RF-ADM-002: Validación de credenciales inválidas.                                                                                                                    |

---

## TC-UI-005 - Checkout: validar formulario con campos vacíos

| Campo              | Detalle                                                                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-UI-005                                                                                                                                                                                       |
| Título             | Checkout - Enviar formulario vacío - Validaciones visibles                                                                                                                                      |
| Módulo             | Frontend / Checkout                                                                                                                                                                             |
| Responsable        | Edgar Castro                                                                                                                                                                                    |
| Precondiciones     | Frontend ejecutándose. Usuario ubicado en flujo de compra o checkout.                                                                                                                           |
| Datos de entrada   | Campos vacíos: nombre, correo, tarjeta, CVV y fecha de expiración.                                                                                                                              |
| Pasos de ejecución | 1. Ir al flujo de compra. <br> 2. Avanzar hasta checkout. <br> 3. Dejar campos obligatorios vacíos. <br> 4. Presionar botón de pagar o confirmar compra. <br> 5. Revisar validaciones visuales. |
| Resultado esperado | El sistema no permite continuar y muestra mensajes de validación en los campos obligatorios.                                                                                                    |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                         |
| Estado             | Not Executed                                                                                                                                                                                    |
| Severidad          | High                                                                                                                                                                                            |
| Prioridad          | High                                                                                                                                                                                            |
| Automatizado       | Sí                                                                                                                                                                                              |
| Referencia         | RF-CHK-001: Validación de formulario de pago.                                                                                                                                                   |

---

## TC-UI-006 - Checkout: rechazar CVV con longitud inválida

| Campo              | Detalle                                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID                 | TC-UI-006                                                                                                                                                                            |
| Título             | Checkout - CVV inválido - Validación de longitud                                                                                                                                     |
| Módulo             | Frontend / Checkout                                                                                                                                                                  |
| Responsable        | Edgar Castro                                                                                                                                                                         |
| Precondiciones     | Frontend ejecutándose. Usuario ubicado en checkout.                                                                                                                                  |
| Datos de entrada   | Nombre: Edgar Castro. Correo: [edgar.test@mail.com](mailto:edgar.test@mail.com). Tarjeta: 4111111111111111. CVV: 12. Fecha: 12/28.                                                   |
| Pasos de ejecución | 1. Entrar al checkout. <br> 2. Capturar datos válidos excepto CVV. <br> 3. Ingresar CVV de dos dígitos. <br> 4. Presionar pagar. <br> 5. Revisar si el sistema bloquea la operación. |
| Resultado esperado | El sistema rechaza el CVV porque debe contener 3 o 4 dígitos.                                                                                                                        |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                              |
| Estado             | Not Executed                                                                                                                                                                         |
| Severidad          | Medium                                                                                                                                                                               |
| Prioridad          | High                                                                                                                                                                                 |
| Automatizado       | Pendiente                                                                                                                                                                            |
| Referencia         | RF-CHK-002: Validación de datos de tarjeta.                                                                                                                                          |

---

## TC-E2E-001 - Flujo completo: usuario consulta evento e inicia compra

| Campo              | Detalle                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-E2E-001                                                                                                                                                                                                                                  |
| Título             | E2E Compra - Consultar evento e iniciar checkout - Flujo principal                                                                                                                                                                          |
| Módulo             | Frontend / API / PostgreSQL                                                                                                                                                                                                                 |
| Responsable        | Edgar Castro y Javier Marin                                                                                                                                                                                                                 |
| Precondiciones     | Frontend, backend, PostgreSQL y MongoDB ejecutándose. Eventos cargados por seed.                                                                                                                                                            |
| Datos de entrada   | URL inicial: http://localhost:5173. Evento: primer evento disponible. Cantidad: 2 boletos. Zona: General.                                                                                                                                   |
| Pasos de ejecución | 1. Abrir la página principal. <br> 2. Ir al catálogo de eventos. <br> 3. Seleccionar un evento disponible. <br> 4. Seleccionar zona y cantidad de boletos. <br> 5. Continuar al checkout. <br> 6. Validar que se muestre resumen de compra. |
| Resultado esperado | El usuario puede navegar desde el home hasta el checkout y visualizar el resumen de compra sin errores críticos.                                                                                                                            |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                                     |
| Estado             | Not Executed                                                                                                                                                                                                                                |
| Severidad          | Critical                                                                                                                                                                                                                                    |
| Prioridad          | High                                                                                                                                                                                                                                        |
| Automatizado       | Sí                                                                                                                                                                                                                                          |
| Referencia         | RF-E2E-001: Flujo principal de compra.                                                                                                                                                                                                      |

---

## TC-SEC-001 - Seguridad: acceso a endpoint admin sin autenticación (Broken Access Control)

| Campo              | Detalle                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-SEC-001                                                                                                                                                                                                       |
| Título             | Seguridad - Endpoints /admin accesibles sin token (A01 OWASP)                                                                                                                                                    |
| Módulo             | API REST / Seguridad                                                                                                                                                                                             |
| Responsable        | Javier Marin                                                                                                                                                                                                     |
| Precondiciones     | Backend ejecutándose. Sin sesión ni token de administrador.                                                                                                                                                      |
| Datos de entrada   | Método: GET. URL: http://localhost:3001/api/v1/admin/stats. Sin header Authorization.                                                                                                                            |
| Pasos de ejecución | 1. Cerrar cualquier sesión. <br> 2. Enviar GET a `/api/v1/admin/stats` sin token. <br> 3. Revisar el código HTTP. <br> 4. Verificar si se devuelven datos sensibles. <br> 5. Documentar el comportamiento real. |
| Resultado esperado | El endpoint debería responder 401/403 sin token. Hallazgo conocido (BUG): hoy responde 200 con datos; control de acceso solo en cliente.                                                                         |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                          |
| Estado             | Not Executed                                                                                                                                                                                                     |
| Severidad          | Critical                                                                                                                                                                                                         |
| Prioridad          | High                                                                                                                                                                                                             |
| Automatizado       | Sí                                                                                                                                                                                                               |
| Referencia         | OWASP A01 Broken Access Control / SECURITY_REPORT.md                                                                                                                                                             |

---

## TC-SEC-002 - Seguridad: intento de NoSQL Injection en creación de reseña

| Campo              | Detalle                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-SEC-002                                                                                                                                                                                                                     |
| Título             | Seguridad - Payload con operadores Mongo en /reviews (A03 OWASP)                                                                                                                                                               |
| Módulo             | API REST / MongoDB / Seguridad                                                                                                                                                                                                 |
| Responsable        | Javier Marin                                                                                                                                                                                                                   |
| Precondiciones     | Backend y MongoDB ejecutándose.                                                                                                                                                                                                |
| Datos de entrada   | Método: POST. URL: `/api/v1/reviews`. Body: `{ "user_id": {"$ne": null}, "event_id": "evt-1", "rating": 5, "comment": "x" }`.                                                                                                  |
| Pasos de ejecución | 1. Enviar POST a `/api/v1/reviews` con `user_id` como objeto `{$ne:null}`. <br> 2. Revisar código HTTP. <br> 3. Verificar que no se ejecute lógica no deseada. <br> 4. Confirmar que el valor se trate como dato, no operador. |
| Resultado esperado | El sistema rechaza (400) o castea el campo a string; no permite inyección de operadores Mongo.                                                                                                                                 |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                        |
| Estado             | Not Executed                                                                                                                                                                                                                   |
| Severidad          | High                                                                                                                                                                                                                           |
| Prioridad          | High                                                                                                                                                                                                                           |
| Automatizado       | Sí                                                                                                                                                                                                                             |
| Referencia         | OWASP A03 Injection (NoSQL) / SECURITY_REPORT.md                                                                                                                                                                               |

---

## TC-INT-001 - Integración: crear orden válida end-to-end (API + PostgreSQL)

| Campo              | Detalle                                                                                                                                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-INT-001                                                                                                                                                                                                                                                                          |
| Título             | Integración - POST /orders crea orden, marca asientos y descuenta disponibilidad                                                                                                                                                                                                    |
| Módulo             | API REST / Servicios / PostgreSQL                                                                                                                                                                                                                                                   |
| Responsable        | Javier Marin                                                                                                                                                                                                                                                                        |
| Precondiciones     | Backend + PostgreSQL con seed. Existe un evento con zona y asientos `available`.                                                                                                                                                                                                    |
| Datos de entrada   | Método: POST. URL: `/api/v1/orders`. Body: `{ "user_id": "seed-user-demo", "event_id": "<id>", "zone_id": "<zona>", "quantity": 2 }`.                                                                                                                                               |
| Pasos de ejecución | 1. Obtener un evento y una zona con asientos disponibles. <br> 2. Enviar POST a `/api/v1/orders`. <br> 3. Validar status 201 y `data.order_items.length === 2`. <br> 4. Consultar la zona y verificar `available_seats` decrementado. <br> 5. Verificar asientos en estado `sold`. |
| Resultado esperado | Status 201; se crea la orden con 2 items, los asientos pasan a `sold` y `available_seats` baja en 2 (transacción atómica).                                                                                                                                                          |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                                                                             |
| Estado             | Not Executed                                                                                                                                                                                                                                                                        |
| Severidad          | Critical                                                                                                                                                                                                                                                                            |
| Prioridad          | High                                                                                                                                                                                                                                                                                |
| Automatizado       | Sí                                                                                                                                                                                                                                                                                  |
| Referencia         | RF-ORD-001 / backend/tests/integration                                                                                                                                                                                                                                              |

---

## TC-DB-001 - Base de datos: restricción UNIQUE en users.email

| Campo              | Detalle                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-DB-001                                                                                                                                                                                                        |
| Título             | Base de datos - Insertar dos usuarios con el mismo email viola UNIQUE                                                                                                                                            |
| Módulo             | PostgreSQL / Prisma                                                                                                                                                                                              |
| Responsable        | Javier Marin                                                                                                                                                                                                     |
| Precondiciones     | PostgreSQL ejecutándose. Esquema Prisma aplicado (`prisma db push`).                                                                                                                                             |
| Datos de entrada   | Dos `prisma.user.create` con el mismo `email` (ej. `dup@test.com`).                                                                                                                                              |
| Pasos de ejecución | 1. Crear un usuario con `email = dup@test.com`. <br> 2. Intentar crear un segundo usuario con el mismo email. <br> 3. Capturar el error de Prisma. <br> 4. Verificar el código `P2002` (unique constraint).      |
| Resultado esperado | La segunda inserción falla con error de restricción única (`P2002`); no se crea el registro duplicado.                                                                                                           |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                          |
| Estado             | Not Executed                                                                                                                                                                                                     |
| Severidad          | High                                                                                                                                                                                                             |
| Prioridad          | Medium                                                                                                                                                                                                           |
| Automatizado       | Sí                                                                                                                                                                                                               |
| Referencia         | Esquema `users` / backend/tests/database/prisma.db.test.ts                                                                                                                                                       |

---

## TC-DB-002 - Base de datos: rollback transaccional al fallar la creación de orden

| Campo              | Detalle                                                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                 | TC-DB-002                                                                                                                                                                                                                                            |
| Título             | Base de datos - Una transacción de orden que falla no deja asientos en `sold`                                                                                                                                                                        |
| Módulo             | PostgreSQL / Prisma (transacciones)                                                                                                                                                                                                                  |
| Responsable        | Javier Marin                                                                                                                                                                                                                                         |
| Precondiciones     | PostgreSQL con seed. Asientos `available` en una zona.                                                                                                                                                                                                |
| Datos de entrada   | `prisma.$transaction` que actualiza asientos a `sold` y luego lanza un error forzado antes de confirmar.                                                                                                                                              |
| Pasos de ejecución | 1. Capturar el estado inicial de los asientos. <br> 2. Ejecutar una transacción que marca asientos `sold` y luego arroja un error. <br> 3. Atrapar la excepción. <br> 4. Volver a consultar los asientos. <br> 5. Verificar que siguen `available`. |
| Resultado esperado | El error revierte toda la transacción: los asientos permanecen `available` y `available_seats` no cambia.                                                                                                                                            |
| Resultado real     | Pendiente de ejecución.                                                                                                                                                                                                                              |
| Estado             | Not Executed                                                                                                                                                                                                                                         |
| Severidad          | Critical                                                                                                                                                                                                                                             |
| Prioridad          | High                                                                                                                                                                                                                                                 |
| Automatizado       | Sí                                                                                                                                                                                                                                                   |
| Referencia         | Atomicidad de `createOrder` / backend/tests/database                                                                                                                                                                                                 |

---

## Resumen de cobertura de casos

| Capa         | Casos relacionados                                                                 |
| ------------ | ---------------------------------------------------------------------------------- |
| Frontend     | TC-UI-001, TC-UI-002, TC-UI-003, TC-UI-004, TC-UI-005, TC-UI-006                   |
| API REST     | TC-API-001, TC-API-002, TC-API-003, TC-API-004, TC-API-005, TC-API-006, TC-API-007 |
| Integración  | TC-INT-001                                                                         |
| PostgreSQL / BD | TC-DB-001, TC-DB-002, TC-INT-001, TC-API-001, TC-API-002, TC-API-004, TC-E2E-001 |
| MongoDB      | TC-API-006, TC-SEC-002                                                             |
| Seguridad    | TC-SEC-001, TC-SEC-002, TC-UI-003, TC-UI-004                                       |
| Validaciones | TC-API-005, TC-API-007, TC-UI-005, TC-UI-006                                       |
| End-to-End   | TC-E2E-001                                                                         |

---

## Estado general

| Métrica                         | Resultado    |
| ------------------------------- | ------------ |
| Total de casos documentados     | 19           |
| Casos API                       | 7            |
| Casos UI                        | 6            |
| Casos Seguridad                 | 2            |
| Casos Integración               | 1            |
| Casos Base de datos             | 2            |
| Casos E2E                       | 1            |
| Casos automatizados             | 11           |
| Casos pendientes de automatizar | 8            |
| Estado inicial                  | Not Executed |
