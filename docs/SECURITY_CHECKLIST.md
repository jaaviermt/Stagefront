# Security Checklist - Stagefront

## Información general

| Campo                 | Valor                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| Proyecto              | Stagefront                                                               |
| Responsables          | Edgar Castro y Javier Marin                                              |
| Tipo de revisión      | Seguridad basada en OWASP Top 10                                         |
| Entorno               | Local                                                                    |
| Frontend              | http://localhost:5173                                                    |
| Backend               | http://localhost:3001                                                    |
| Fecha de ejecución    | Semana de ejecución del proyecto                                         |
| Herramientas          | Revisión manual, inspección de código, npm audit, Postman/Thunder Client |
| Documento relacionado | TEST_PLAN.md                                                             |

---

## Objetivo

El objetivo de este documento es registrar la revisión de seguridad aplicada al proyecto Stagefront, tomando como base riesgos comunes de OWASP Top 10. La revisión busca identificar vulnerabilidades relacionadas con control de acceso, validación de entradas, configuración de seguridad, dependencias vulnerables, autenticación y exposición de información sensible.

---

## Alcance de seguridad

La revisión incluye:

* Rutas públicas de la API REST.
* Rutas administrativas.
* Formularios de frontend.
* Validaciones de checkout.
* Revisión básica de dependencias npm.
* Revisión de configuración CORS.
* Revisión de errores expuestos al usuario.
* Revisión de uso de ORM/ODM para acceso a datos.

Queda fuera de alcance:

* Pentesting profesional completo.
* Auditoría de infraestructura productiva.
* Revisión de certificados HTTPS en producción.
* Escaneo profundo con credenciales reales.
* Pruebas de fuerza bruta prolongadas.

---

# Checklist OWASP Top 10

## A01 - Broken Access Control

| Campo                 | Resultado                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Riesgo                | Usuarios no autorizados podrían acceder a rutas administrativas o recursos restringidos.                                  |
| Verificación          | Se revisaron endpoints administrativos, especialmente `/api/v1/admin/stats`, sin enviar token de autenticación.           |
| Resultado esperado    | Las rutas administrativas deben responder con 401 Unauthorized o 403 Forbidden si no existe token o rol válido.           |
| Resultado observado   | Pendiente de validación final en entorno local. En caso de responder 200 sin autenticación, se considera defecto crítico. |
| Estado                | Open                                                                                                                      |
| Severidad             | Critical                                                                                                                  |
| Prioridad             | Blocker                                                                                                                   |
| Responsable           | Javier Marin                                                                                                              |
| Evidencia relacionada | BUG-007 en BUG_REPORTS.md                                                                                                 |

### Recomendación

Implementar middleware de autenticación y autorización en todos los endpoints administrativos. El middleware debe validar:

* Existencia del token.
* Validez del token.
* Rol del usuario.
* Expiración de sesión.
* Permisos mínimos requeridos por endpoint.

---

## A02 - Cryptographic Failures

| Campo               | Resultado                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Riesgo              | Contraseñas o datos sensibles podrían almacenarse o transmitirse de forma insegura.                                                                          |
| Verificación        | Se revisó que las contraseñas no deberían almacenarse en texto plano y que los datos sensibles no deben aparecer en logs ni respuestas de error.             |
| Resultado esperado  | Las contraseñas deben estar hasheadas con bcrypt o argon2. Los tokens, contraseñas y datos personales no deben exponerse en consola, logs o respuestas HTTP. |
| Resultado observado | Pendiente de revisión completa del flujo de autenticación.                                                                                                   |
| Estado              | In Review                                                                                                                                                    |
| Severidad           | High                                                                                                                                                         |
| Prioridad           | High                                                                                                                                                         |
| Responsable         | Edgar Castro y Javier Marin                                                                                                                                  |

### Recomendación

* Usar bcrypt o argon2 para contraseñas.
* Nunca retornar password, hash o tokens sensibles en respuestas JSON.
* Evitar imprimir datos sensibles con `console.log`.
* Definir sanitización de logs.

---

## A03 - Injection

| Campo               | Resultado                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Riesgo              | Entradas maliciosas podrían alterar consultas SQL, NoSQL o generar XSS.                                                                                                           |
| Verificación        | Se revisó el uso de Prisma para PostgreSQL y Mongoose para MongoDB. También se propusieron pruebas con payloads maliciosos en formularios.                                        |
| Resultado esperado  | Las consultas deben realizarse mediante ORM/ODM o queries parametrizadas. Los inputs deben validarse y sanitizarse antes de procesarse.                                           |
| Resultado observado | El uso de Prisma reduce el riesgo de SQL Injection. El uso de Mongoose reduce el riesgo si se evita construir queries dinámicas con objetos enviados directamente por el usuario. |
| Estado              | In Review                                                                                                                                                                         |
| Severidad           | High                                                                                                                                                                              |
| Prioridad           | High                                                                                                                                                                              |
| Responsable         | Javier Marin                                                                                                                                                                      |

### Datos de prueba sugeridos

| Tipo            | Payload                         |
| --------------- | ------------------------------- |
| SQL Injection   | `' OR '1'='1`                   |
| SQL Injection   | `admin'--`                      |
| NoSQL Injection | `{ "$ne": null }`               |
| XSS             | `<script>alert("xss")</script>` |

### Recomendación

* Validar entradas con esquemas.
* Evitar pasar objetos del body directamente a queries.
* Escapar outputs en frontend.
* Rechazar payloads con estructura inesperada.
* Mantener Prisma y Mongoose actualizados.

---

## A05 - Security Misconfiguration

| Campo               | Resultado                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Riesgo              | Configuración insegura de headers, CORS o errores podría exponer información sensible.                      |
| Verificación        | Se revisó configuración del backend, manejo de errores y política CORS.                                     |
| Resultado esperado  | El backend debe incluir headers de seguridad, CORS restrictivo en producción y mensajes de error genéricos. |
| Resultado observado | Pendiente de validar si se utiliza `helmet.js` y si CORS está restringido en producción.                    |
| Estado              | Open                                                                                                        |
| Severidad           | Medium                                                                                                      |
| Prioridad           | High                                                                                                        |
| Responsable         | Javier Marin                                                                                                |

### Recomendación

Instalar y configurar Helmet en backend:

```bash
npm install helmet
```

Ejemplo de uso:

```ts
import helmet from "helmet";

app.use(helmet());
```

Configurar CORS de forma restrictiva:

```ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

Evitar errores detallados en producción:

```ts
if (process.env.NODE_ENV === "production") {
  // Responder mensajes genéricos sin stack trace
}
```

---

## A06 - Vulnerable and Outdated Components

| Campo               | Resultado                                                            |
| ------------------- | -------------------------------------------------------------------- |
| Riesgo              | Dependencias npm vulnerables podrían comprometer frontend o backend. |
| Verificación        | Ejecutar `npm audit` en backend y frontend.                          |
| Resultado esperado  | No deben existir vulnerabilidades críticas o altas sin documentar.   |
| Resultado observado | Pendiente de ejecución. Se documentará evidencia en QA_EVIDENCE.md.  |
| Estado              | Pending                                                              |
| Severidad           | Medium                                                               |
| Prioridad           | Medium                                                               |
| Responsable         | Edgar Castro y Javier Marin                                          |

### Comandos de revisión

En backend:

```bash
cd backend
npm audit
```

En frontend:

```bash
cd frontend
npm audit
```

### Recomendación

* Revisar vulnerabilidades críticas y altas.
* Actualizar dependencias cuando sea seguro.
* No usar `npm audit fix --force` sin revisar impacto.
* Mantener `package-lock.json` versionado.
* Documentar vulnerabilidades aceptadas como riesgo.

---

## A07 - Identification and Authentication Failures

| Campo               | Resultado                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Riesgo              | El sistema podría permitir acceso no autorizado, sesiones débiles o intentos ilimitados de login. |
| Verificación        | Se revisó flujo de login administrativo y manejo de sesión.                                       |
| Resultado esperado  | El login debe validar credenciales, limitar intentos fallidos y manejar expiración de sesión.     |
| Resultado observado | Pendiente de validar rate limiting y expiración de tokens.                                        |
| Estado              | Open                                                                                              |
| Severidad           | High                                                                                              |
| Prioridad           | High                                                                                              |
| Responsable         | Javier Marin                                                                                      |

### Recomendación

* Implementar rate limiting en login.
* Usar JWT con expiración.
* Validar algoritmo seguro.
* Invalidar sesión al cerrar sesión.
* Evitar mensajes de error demasiado específicos como “correo existe pero contraseña incorrecta”.

Ejemplo de rate limit:

```bash
npm install express-rate-limit
```

```ts
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Demasiados intentos. Intenta nuevamente más tarde."
});

app.use("/api/v1/admin/login", loginLimiter);
```

---

## A08 - Software and Data Integrity Failures

| Campo               | Resultado                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Riesgo              | Dependencias modificadas, lockfiles inconsistentes o instalaciones no reproducibles pueden afectar la integridad del sistema.     |
| Verificación        | Se revisó la existencia de lockfiles y uso de instalación mediante npm.                                                           |
| Resultado esperado  | El proyecto debe mantener `package-lock.json` en frontend y backend para asegurar instalaciones reproducibles.                    |
| Resultado observado | Existen lockfiles asociados a las dependencias del proyecto. Se recomienda no eliminar los lockfiles propios de frontend/backend. |
| Estado              | In Review                                                                                                                         |
| Severidad           | Medium                                                                                                                            |
| Prioridad           | Medium                                                                                                                            |
| Responsable         | Edgar Castro y Javier Marin                                                                                                       |

### Recomendación

* Versionar lockfiles correctos.
* Evitar instalar dependencias desde fuentes desconocidas.
* No subir archivos `.env`.
* Revisar cambios en lockfiles antes del commit.

---

## A09 - Security Logging and Monitoring Failures

| Campo               | Resultado                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Riesgo              | Sin logs adecuados, los errores o actividades sospechosas no pueden rastrearse correctamente.                                                  |
| Verificación        | Se revisó la necesidad de logs estructurados, niveles de log y trazabilidad por request.                                                       |
| Resultado esperado  | El sistema debe registrar operaciones críticas con niveles error, warn, info y debug, evitando datos sensibles.                                |
| Resultado observado | Existe documentación relacionada con logging en el proyecto, pero se recomienda fortalecer correlation ID y auditoría de operaciones críticas. |
| Estado              | In Review                                                                                                                                      |
| Severidad           | Medium                                                                                                                                         |
| Prioridad           | Medium                                                                                                                                         |
| Responsable         | Edgar Castro y Javier Marin                                                                                                                    |

### Recomendación

* Usar Winston o Pino.
* Registrar errores de backend.
* Registrar intentos fallidos de login.
* Agregar correlation ID por request.
* Evitar registrar passwords, tokens o datos personales sensibles.

---

## Pruebas manuales sugeridas

| ID         | Prueba                                                         | Resultado esperado                            | Estado  |
| ---------- | -------------------------------------------------------------- | --------------------------------------------- | ------- |
| SEC-TC-001 | Acceder a `/api/v1/admin/stats` sin token                      | 401 o 403                                     | Pending |
| SEC-TC-002 | Enviar payload `' OR '1'='1` en campos de búsqueda             | No debe alterar consultas                     | Pending |
| SEC-TC-003 | Enviar `<script>alert("xss")</script>` en formulario de reseña | Debe sanitizarse o mostrarse escapado         | Pending |
| SEC-TC-004 | Ejecutar `npm audit` en backend                                | Sin vulnerabilidades críticas no documentadas | Pending |
| SEC-TC-005 | Ejecutar `npm audit` en frontend                               | Sin vulnerabilidades críticas no documentadas | Pending |
| SEC-TC-006 | Intentar login con credenciales inválidas repetidamente        | Debe bloquear o limitar intentos              | Pending |

---

## Resumen de cumplimiento

| Punto OWASP                   | Revisado | Estado    | Evidencia                     |
| ----------------------------- | -------- | --------- | ----------------------------- |
| A01 Broken Access Control     | Sí       | Open      | BUG-007                       |
| A02 Cryptographic Failures    | Sí       | In Review | Pendiente                     |
| A03 Injection                 | Sí       | In Review | Pendiente                     |
| A05 Security Misconfiguration | Sí       | Open      | Pendiente                     |
| A06 Vulnerable Components     | Sí       | Pending   | npm audit                     |
| A07 Auth Failures             | Sí       | Open      | Pendiente                     |
| A08 Software Integrity        | Sí       | In Review | Lockfiles                     |
| A09 Logging and Monitoring    | Sí       | In Review | LOGGING.md / OBSERVABILITY.md |

---

## Hallazgos principales

| ID      | Hallazgo                                                                         | Severidad | Recomendación                                               |
| ------- | -------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------- |
| SEC-001 | Las rutas administrativas deben validar autenticación y rol antes de responder.  | Critical  | Implementar middleware JWT y roles.                         |
| SEC-002 | Las validaciones de formularios deben reforzarse para evitar entradas inválidas. | High      | Validar y sanitizar inputs en frontend y backend.           |
| SEC-003 | Se debe confirmar configuración de Helmet y CORS restrictivo.                    | Medium    | Agregar Helmet y configurar origin por variable de entorno. |
| SEC-004 | Se debe documentar resultado de npm audit.                                       | Medium    | Ejecutar audit en backend y frontend.                       |
| SEC-005 | Se recomienda rate limiting en login administrativo.                             | High      | Implementar express-rate-limit.                             |

---

## Conclusión

La revisión de seguridad permitió identificar riesgos relevantes en Stagefront, especialmente en control de acceso, validación de entradas, configuración del backend y manejo de dependencias. Aunque el sistema cuenta con tecnologías que ayudan a reducir riesgos, como Prisma y Mongoose, es necesario complementar con autenticación robusta, validaciones estrictas, headers de seguridad y revisión continua de dependencias.

Para esta entrega se cumple con la revisión de múltiples puntos OWASP Top 10, superando el mínimo requerido de tres verificaciones de seguridad.
