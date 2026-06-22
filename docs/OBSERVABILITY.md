# Observability Plan - Stagefront

## Información general

| Campo                          | Valor                                   |
| ------------------------------ | --------------------------------------- |
| Proyecto                       | Stagefront                              |
| Responsables                   | Edgar Castro y Javier Marin             |
| Tipo de documento              | Plan de monitoreo y observabilidad      |
| Entorno principal              | Producción propuesta / Staging simulado |
| Entorno de validación          | Local                                   |
| Frontend                       | http://localhost:5173                   |
| Backend                        | http://localhost:3001                   |
| Documento relacionado          | TEST_PLAN.md                            |
| Documento base del repositorio | LOGGING.md                              |

---

## 1. Objetivo

El objetivo de este documento es definir la estrategia de observabilidad para Stagefront, considerando logs, métricas, alertas y seguimiento de errores. La observabilidad permite comprender el comportamiento del sistema en tiempo real, detectar fallos, analizar incidentes y tomar decisiones de mejora basadas en datos.

Este documento complementa la estrategia de calidad del proyecto y se alinea con las prácticas solicitadas para monitoreo en producción.

---

## 2. Alcance

La estrategia de observabilidad contempla:

* Logging estructurado en backend.
* Niveles de log.
* Correlation ID por request.
* Protección de datos sensibles en logs.
* Retención de logs.
* Métricas RED por endpoint.
* Métricas USE de infraestructura.
* Métricas de negocio.
* Métricas de base de datos.
* Alertas básicas.
* Error tracking.

---

## 3. Fuera de alcance

Para esta entrega quedan fuera de alcance:

* Implementación real de Grafana, Datadog o Sentry en producción.
* Monitoreo distribuido en múltiples servidores.
* Trazabilidad distribuida avanzada con OpenTelemetry.
* Alertas reales enviadas a Slack, correo o PagerDuty.
* Dashboards productivos conectados a infraestructura cloud.

---

# 4. Logs

## 4.1 Logging estructurado en JSON

| Campo                 | Detalle                                                  |
| --------------------- | -------------------------------------------------------- |
| Requisito             | Los logs deben registrarse en formato estructurado JSON. |
| Responsable           | Javier Marin                                             |
| Herramienta propuesta | Winston o Pino                                           |
| Estado                | Propuesto / Documentado                                  |
| Evidencia             | LOGGING.md y este documento                              |

Ejemplo de log esperado:

```json id="cjz1qc"
{
  "level": "info",
  "timestamp": "2026-06-21T19:00:00.000Z",
  "requestId": "req-123456",
  "method": "GET",
  "path": "/api/v1/events",
  "statusCode": 200,
  "durationMs": 87,
  "message": "Request completed"
}
```

---

## 4.2 Niveles de log

| Nivel | Uso                                                                        |
| ----- | -------------------------------------------------------------------------- |
| error | Fallos que impiden completar una operación o requieren atención inmediata. |
| warn  | Situaciones anómalas que no bloquean el sistema pero deben revisarse.      |
| info  | Eventos normales relevantes para operación y seguimiento.                  |
| debug | Detalles técnicos útiles durante desarrollo o diagnóstico.                 |

Ejemplos:

| Evento                            | Nivel |
| --------------------------------- | ----- |
| Error al conectar con PostgreSQL  | error |
| Error al conectar con MongoDB     | error |
| Login fallido repetido            | warn  |
| Orden creada correctamente        | info  |
| Request recibido con query params | debug |

---

## 4.3 Correlation ID por request

| Campo       | Detalle                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| Requisito   | Cada request debe incluir un identificador único para rastrear su flujo completo. |
| Responsable | Javier Marin                                                                      |
| Estado      | Propuesto                                                                         |
| Beneficio   | Permite rastrear errores desde frontend hasta backend y base de datos.            |

Ejemplo de middleware propuesto:

```ts id="f0o67f"
import { randomUUID } from "crypto";

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.headers["x-request-id"] = String(requestId);
  res.setHeader("x-request-id", String(requestId));

  next();
});
```

Ejemplo de uso en respuesta:

```txt id="3qnwzs"
x-request-id: 6b3dc0f4-920f-41fc-8795-1e58bd90d39b
```

---

## 4.4 Sin datos sensibles en logs

| Campo              | Detalle                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Requisito          | Los logs no deben incluir passwords, tokens, tarjetas, CVV ni datos personales sensibles. |
| Responsable        | Edgar Castro y Javier Marin                                                               |
| Estado             | Requerido                                                                                 |
| Severidad si falla | High                                                                                      |

Datos que deben omitirse o enmascararse:

* Passwords.
* Tokens JWT.
* Refresh tokens.
* Número completo de tarjeta.
* CVV.
* Correos si no son necesarios.
* Datos personales del comprador.
* Variables de entorno.
* Cadenas de conexión.

Ejemplo de enmascaramiento:

```json id="pkt0c4"
{
  "buyerEmail": "ed***@mail.com",
  "cardNumber": "************1111",
  "cvv": "***"
}
```

---

## 4.5 Reporte de logs

| Campo       | Detalle                                                              |
| ----------- | -------------------------------------------------------------------- |
| Requisito   | Debe existir un reporte o ubicación definida para consultar logs.    |
| Responsable | Edgar Castro                                                         |
| Estado      | Documentado                                                          |
| Propuesta   | Logs en consola durante desarrollo y archivos rotados en producción. |

Estructura sugerida:

```txt id="ceccsn"
logs/
├─ error.log
├─ combined.log
└─ http.log
```

---

## 4.6 Retención de logs

| Tipo de log       | Retención propuesta             |
| ----------------- | ------------------------------- |
| Logs de error     | 90 días                         |
| Logs HTTP         | 30 días                         |
| Logs de auditoría | 180 días                        |
| Logs debug        | Solo desarrollo o máximo 7 días |
| Logs archivados   | 90 días en almacenamiento frío  |

---

# 5. Métricas

## 5.1 RED metrics por endpoint

Las métricas RED permiten observar el comportamiento de servicios HTTP.

| Métrica  | Descripción                           |
| -------- | ------------------------------------- |
| Rate     | Número de requests por segundo.       |
| Errors   | Porcentaje de requests fallidas.      |
| Duration | Tiempo de respuesta de cada endpoint. |

Endpoints a monitorear:

| Endpoint                | Métricas RED           |
| ----------------------- | ---------------------- |
| GET /api/v1/events      | Rate, Errors, Duration |
| GET /api/v1/events/:id  | Rate, Errors, Duration |
| POST /api/v1/orders     | Rate, Errors, Duration |
| GET /api/v1/resales     | Rate, Errors, Duration |
| POST /api/v1/resales    | Rate, Errors, Duration |
| POST /api/v1/reviews    | Rate, Errors, Duration |
| GET /api/v1/admin/stats | Rate, Errors, Duration |

---

## 5.2 USE metrics de infraestructura

Las métricas USE permiten observar el estado de los recursos del sistema.

| Métrica     | Descripción                                         |
| ----------- | --------------------------------------------------- |
| Utilization | Porcentaje de uso de CPU, RAM, disco o red.         |
| Saturation  | Cantidad de trabajo en espera o recursos al límite. |
| Errors      | Fallos del recurso o errores del sistema.           |

Recursos a monitorear:

| Recurso             | Métricas                                            |
| ------------------- | --------------------------------------------------- |
| CPU                 | Uso promedio, picos, saturación.                    |
| Memoria RAM         | Uso total, memoria libre, crecimiento anormal.      |
| Disco               | Espacio disponible, errores de escritura, latencia. |
| Red                 | Latencia, tráfico de entrada/salida, errores.       |
| Contenedores Docker | Estado, reinicios, consumo de recursos.             |

---

## 5.3 Métricas de negocio

Las métricas de negocio ayudan a entender si el sistema cumple su propósito.

| Métrica                        | Descripción                                         |
| ------------------------------ | --------------------------------------------------- |
| Eventos consultados por minuto | Cantidad de visitas a eventos.                      |
| Órdenes creadas por minuto     | Número de compras realizadas.                       |
| Tasa de conversión             | Relación entre visitas a eventos y órdenes creadas. |
| Reventas activas               | Número de boletos en reventa.                       |
| Reseñas creadas                | Cantidad de reseñas registradas.                    |
| Intentos de login admin        | Accesos exitosos y fallidos al panel.               |
| Errores en checkout            | Fallos durante flujo de compra.                     |

---

## 5.4 Métricas de base de datos

| Base de datos | Métricas                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| PostgreSQL    | Conexiones activas, duración de queries, errores, deadlocks, tamaño de tablas.                             |
| MongoDB       | Conexiones activas, operaciones por segundo, duración de queries, collection scans, tamaño de colecciones. |

Métricas específicas recomendadas:

* Duración promedio de queries.
* Queries lentas.
* Número de conexiones activas.
* Errores por constraint.
* Errores de conexión.
* Tiempo de respuesta de MongoDB.
* Operaciones de lectura/escritura por minuto.

---

# 6. Alertas

## 6.1 Alertas técnicas

| Alerta                   | Condición                                        | Severidad |
| ------------------------ | ------------------------------------------------ | --------- |
| API caída                | No responde `/api/v1/events` por más de 1 minuto | Critical  |
| Error rate alto          | Errores 5xx mayores a 5% durante 5 minutos       | High      |
| Latencia alta            | p95 mayor a 2 segundos durante 5 minutos         | High      |
| PostgreSQL no disponible | Error de conexión a BD relacional                | Critical  |
| MongoDB no disponible    | Error de conexión a BD NoSQL                     | Critical  |
| CPU alta                 | CPU mayor a 85% durante 10 minutos               | Medium    |
| Memoria alta             | RAM mayor a 85% durante 10 minutos               | Medium    |
| Disco bajo               | Espacio disponible menor al 15%                  | High      |

---

## 6.2 Alertas de negocio

| Alerta                            | Condición                                                    | Severidad |
| --------------------------------- | ------------------------------------------------------------ | --------- |
| Órdenes caen a cero               | No hay órdenes creadas durante periodo esperado de actividad | High      |
| Checkout con errores altos        | Errores en checkout mayores a 10%                            | High      |
| Login admin fallido repetidamente | Más de 5 intentos fallidos por minuto desde misma IP         | Medium    |
| Reventas con precios inválidos    | Intentos repetidos de publicar precios fuera de regla        | Medium    |

---

# 7. Error tracking

## 7.1 Errores frontend

Herramienta propuesta:

* Sentry.

Eventos a capturar:

* Errores no controlados en React.
* Fallos de carga de recursos.
* Errores en checkout.
* Errores de navegación.
* Errores de comunicación con API.

Datos recomendados:

* Ruta.
* Navegador.
* Sistema operativo.
* Timestamp.
* requestId si existe.
* Mensaje de error.
* Stack trace sanitizado.

---

## 7.2 Errores backend

Herramientas propuestas:

* Winston/Pino para logs.
* Sentry para errores.
* Middleware global de manejo de errores.

Errores a capturar:

* Errores 500.
* Fallos de conexión a PostgreSQL.
* Fallos de conexión a MongoDB.
* Errores de validación inesperados.
* Errores en creación de órdenes.
* Errores en autenticación admin.

---

# 8. Middleware global de errores propuesto

Ejemplo:

```ts id="z2cod5"
app.use((err, req, res, next) => {
  const requestId = req.headers["x-request-id"];

  logger.error({
    requestId,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  res.status(err.statusCode || 500).json({
    message: process.env.NODE_ENV === "production"
      ? "Ocurrió un error interno"
      : err.message,
    requestId,
  });
});
```

Beneficios:

* Centraliza errores.
* Evita duplicidad de manejo.
* Permite registrar fallos con requestId.
* Evita exponer stack trace en producción.

---

# 9. Dashboard propuesto

Un dashboard básico de observabilidad debería incluir:

## API REST

* Requests por minuto.
* Latencia promedio.
* p95 de latencia.
* Porcentaje de errores.
* Endpoints más utilizados.
* Endpoints más lentos.

## Infraestructura

* CPU.
* RAM.
* Disco.
* Red.
* Estado de contenedores.

## PostgreSQL

* Conexiones activas.
* Queries lentas.
* Deadlocks.
* Errores de constraints.
* Tiempo promedio de query.

## MongoDB

* Conexiones activas.
* Operaciones por segundo.
* Collection scans.
* Tiempo promedio de operación.
* Tamaño de colecciones.

## Negocio

* Órdenes creadas.
* Eventos más consultados.
* Reventas activas.
* Reseñas creadas.
* Errores en checkout.

---

# 10. Comandos útiles para evidencia local

Ver contenedores activos:

```powershell id="j0824a"
docker ps
```

Ver logs de backend si se ejecuta en consola:

```powershell id="ftuc07"
npm run dev
```

Ver consumo de contenedores:

```powershell id="olhumx"
docker stats
```

Ver errores recientes en consola:

```powershell id="071en8"
npm run dev
```

---

# 11. Evidencias esperadas

Registrar en `QA_EVIDENCE.md`:

* Captura de backend mostrando logs en consola.
* Captura de request exitoso a `/api/v1/events`.
* Captura de error controlado ante endpoint inválido.
* Captura de `docker ps`.
* Captura de `docker stats`, si se ejecuta.
* Captura de logs sin datos sensibles.
* Captura de propuesta o tabla de métricas RED.
* Captura de `LOGGING.md` existente como documento base.

---

# 12. Checklist de cumplimiento

| Requisito                            | Estado      | Evidencia                     |
| ------------------------------------ | ----------- | ----------------------------- |
| Logging estructurado en JSON         | Documentado | LOGGING.md / OBSERVABILITY.md |
| Niveles de log error/warn/info/debug | Documentado | OBSERVABILITY.md              |
| Correlation ID en cada request       | Propuesto   | OBSERVABILITY.md              |
| Sin datos sensibles en logs          | Documentado | OBSERVABILITY.md              |
| Reporte de logs                      | Documentado | LOGGING.md / OBSERVABILITY.md |
| Retención de logs definida           | Documentado | OBSERVABILITY.md              |
| RED metrics por endpoint             | Documentado | OBSERVABILITY.md              |
| USE metrics de infraestructura       | Documentado | OBSERVABILITY.md              |
| Business metrics                     | Documentado | OBSERVABILITY.md              |
| Dashboard de métricas                | Propuesto   | OBSERVABILITY.md              |
| Métricas de BD                       | Documentado | OBSERVABILITY.md              |

---

# 13. Riesgos de observabilidad

| Riesgo                   | Impacto                                              | Mitigación                                                   |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| Logs sin estructura      | Dificulta búsqueda y análisis de incidentes          | Usar Winston o Pino en formato JSON.                         |
| Logs con datos sensibles | Riesgo de seguridad y privacidad                     | Enmascarar o eliminar passwords, tokens y tarjetas.          |
| Falta de correlation ID  | Dificulta rastrear errores end-to-end                | Agregar middleware por request.                              |
| Sin alertas automáticas  | Incidentes podrían detectarse tarde                  | Configurar alertas sobre errores, latencia y disponibilidad. |
| Sin métricas de negocio  | No se detectan fallas del flujo comercial            | Medir órdenes, errores de checkout y conversiones.           |
| Sin métricas de BD       | Problemas de rendimiento pueden pasar desapercibidos | Monitorear conexiones, queries lentas y errores.             |

---

# 14. Conclusión

La estrategia de observabilidad propuesta para Stagefront cubre los tres pilares principales: logs, métricas y alertas. Además, incorpora seguimiento de errores y recomendaciones para un dashboard operativo.

Para esta entrega se documenta una estrategia completa que incluye logging estructurado, niveles de log, correlation ID, protección de datos sensibles, retención, métricas RED, métricas USE, métricas de negocio y métricas de base de datos. Esto permite cumplir la sección de monitoreo y observabilidad solicitada en la estrategia de calidad del proyecto.
