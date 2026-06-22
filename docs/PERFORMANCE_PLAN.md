# Performance Test Plan - Stagefront

## Información general

| Campo                 | Valor                       |
| --------------------- | --------------------------- |
| Proyecto              | Stagefront                  |
| Responsables          | Edgar Castro y Javier Marin |
| Tipo de revisión      | Pruebas de rendimiento      |
| Entorno               | Local / Staging simulado    |
| Frontend              | http://localhost:5173       |
| Backend               | http://localhost:3001       |
| Herramienta propuesta | k6                          |
| Documento relacionado | TEST_PLAN.md                |

---

## 1. Objetivo

El objetivo de este documento es definir la estrategia de pruebas de rendimiento para Stagefront, evaluando el comportamiento de la API REST bajo diferentes condiciones de carga.

La revisión se enfoca en endpoints críticos relacionados con consulta de eventos, estadísticas, reventas y detalle de eventos, ya que representan operaciones frecuentes dentro del sistema.

Las pruebas consideradas son:

* Load Test.
* Stress Test.
* Spike Test.
* Soak Test.

---

## 2. Alcance

Las pruebas de rendimiento se enfocan principalmente en la capa backend/API, ya que esta concentra la comunicación con PostgreSQL, MongoDB y la lógica de negocio.

Endpoints candidatos:

| Endpoint                          | Método | Motivo                                      |
| --------------------------------- | ------ | ------------------------------------------- |
| `/api/v1/events`                  | GET    | Consulta principal del catálogo de eventos. |
| `/api/v1/events/:id`              | GET    | Consulta de detalle de un evento.           |
| `/api/v1/stats`                   | GET    | Consulta de estadísticas generales.         |
| `/api/v1/resales`                 | GET    | Consulta de boletos en reventa.             |
| `/api/v1/events/:eventId/reviews` | GET    | Consulta de reseñas desde MongoDB.          |

---

## 3. Fuera de alcance

Quedan fuera de alcance para esta entrega:

* Pruebas en infraestructura real de producción.
* Pruebas con miles de usuarios concurrentes.
* Pruebas de carga prolongadas reales de 2 horas si el equipo local no lo soporta.
* Pruebas con CDN, balanceadores o autoscaling.
* Pruebas contra pasarelas de pago reales.
* Simulación real de tráfico geográficamente distribuido.

---

## 4. Métricas evaluadas

| Métrica                      | Descripción                                             |
| ---------------------------- | ------------------------------------------------------- |
| Requests por segundo         | Cantidad de solicitudes procesadas por segundo.         |
| Tiempo promedio de respuesta | Promedio de duración de las solicitudes.                |
| p95                          | Tiempo bajo el cual responde el 95% de las solicitudes. |
| p99                          | Tiempo bajo el cual responde el 99% de las solicitudes. |
| Porcentaje de errores        | Proporción de solicitudes fallidas.                     |
| Throughput                   | Volumen de procesamiento de la API.                     |
| Saturación                   | Indicios de degradación bajo carga.                     |
| Disponibilidad               | Capacidad de responder durante la prueba.               |

---

## 5. Criterios de aceptación

| Criterio                     | Objetivo                                                               |
| ---------------------------- | ---------------------------------------------------------------------- |
| Porcentaje de errores        | Menor al 1% en load test.                                              |
| Tiempo promedio de respuesta | Menor a 500 ms en endpoints GET principales.                           |
| p95                          | Menor a 1000 ms en load test.                                          |
| Disponibilidad               | 99% durante la prueba corta.                                           |
| Errores 5xx                  | No deben presentarse de forma sostenida.                               |
| Degradación                  | Debe documentarse si el tiempo de respuesta aumenta considerablemente. |

---

# 6. Tipos de pruebas de rendimiento

## 6.1 Load Test

| Campo                     | Detalle                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------- |
| ID                        | PERF-LOAD-001                                                                          |
| Tipo                      | Load Test                                                                              |
| Responsable               | Javier Marin                                                                           |
| Objetivo                  | Validar comportamiento de la API con una carga esperada de usuarios.                   |
| Escenario                 | Usuarios consultan catálogo, estadísticas y reventas durante varios minutos.           |
| Carga propuesta           | 20 usuarios virtuales.                                                                 |
| Duración académica        | 5 minutos.                                                                             |
| Duración ideal productiva | 10 minutos con ramp-up de 5 minutos.                                                   |
| Resultado esperado        | El sistema mantiene tiempos de respuesta estables y porcentaje de errores menor al 1%. |
| Estado                    | Pending                                                                                |

---

## 6.2 Stress Test

| Campo              | Detalle                                                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| ID                 | PERF-STRESS-001                                                                  |
| Tipo               | Stress Test                                                                      |
| Responsable        | Javier Marin                                                                     |
| Objetivo           | Encontrar el punto donde el sistema empieza a degradarse o fallar.               |
| Escenario          | Aumentar usuarios virtuales progresivamente.                                     |
| Carga propuesta    | 10 → 25 → 50 → 75 usuarios virtuales.                                            |
| Duración académica | 6 minutos.                                                                       |
| Resultado esperado | Documentar el punto en el que aumenta el tiempo de respuesta o aparecen errores. |
| Estado             | Pending                                                                          |

---

## 6.3 Spike Test

| Campo              | Detalle                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| ID                 | PERF-SPIKE-001                                                         |
| Tipo               | Spike Test                                                             |
| Responsable        | Javier Marin                                                           |
| Objetivo           | Evaluar reacción del sistema ante un pico repentino de tráfico.        |
| Escenario          | Tráfico normal seguido de incremento súbito 10x durante 1 minuto.      |
| Carga propuesta    | 5 usuarios base → 50 usuarios por 1 minuto → 5 usuarios.               |
| Duración académica | 3 minutos.                                                             |
| Resultado esperado | El backend debe mantenerse disponible y recuperarse al bajar la carga. |
| Estado             | Pending                                                                |

---

## 6.4 Soak Test

| Campo                     | Detalle                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| ID                        | PERF-SOAK-001                                                                             |
| Tipo                      | Soak Test / Endurance Test                                                                |
| Responsable               | Javier Marin                                                                              |
| Objetivo                  | Detectar degradación, memory leaks o pérdida de estabilidad con carga sostenida.          |
| Escenario                 | Usuarios consultan endpoints principales durante un periodo extendido.                    |
| Carga propuesta           | 10 usuarios virtuales constantes.                                                         |
| Duración académica        | 10 minutos.                                                                               |
| Duración ideal productiva | 2 horas.                                                                                  |
| Resultado esperado        | El sistema mantiene estabilidad sin aumento progresivo de errores o tiempos de respuesta. |
| Estado                    | Pending                                                                                   |

---

# 7. Instalación de k6

## 7.1 Instalación en Windows

Opción con Chocolatey:

```powershell id="0n7tkb"
choco install k6
```

Opción con winget:

```powershell id="4krkmx"
winget install k6 --source winget
```

Verificar instalación:

```powershell id="85llmh"
k6 version
```

---

# 8. Script sugerido de prueba con k6

Crear carpeta:

```powershell id="d8iqz5"
mkdir performance -Force
```

Crear archivo:

```powershell id="q5nw1u"
code performance\k6-load-test.js
```

Contenido sugerido:

```js id="4py1qa"
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "3m", target: 20 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

const BASE_URL = "http://localhost:3001";

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/api/v1/events`],
    ["GET", `${BASE_URL}/api/v1/stats`],
    ["GET", `${BASE_URL}/api/v1/resales`],
  ]);

  check(responses[0], {
    "events responde 200": (res) => res.status === 200,
  });

  check(responses[1], {
    "stats responde 200": (res) => res.status === 200,
  });

  check(responses[2], {
    "resales responde 200": (res) => res.status === 200,
  });

  sleep(1);
}
```

Ejecutar:

```powershell id="jmu0gf"
k6 run performance\k6-load-test.js
```

---

# 9. Script sugerido para stress test

Crear archivo:

```powershell id="bc5fqr"
code performance\k6-stress-test.js
```

Contenido sugerido:

```js id="qbqcv8"
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "1m", target: 25 },
    { duration: "1m", target: 50 },
    { duration: "1m", target: 75 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = "http://localhost:3001";

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/events`);

  check(res, {
    "events status 200": (r) => r.status === 200,
    "duración menor a 2000ms": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

---

# 10. Script sugerido para spike test

Crear archivo:

```powershell id="6zkt3l"
code performance\k6-spike-test.js
```

Contenido sugerido:

```js id="ywoqeh"
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 5 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = "http://localhost:3001";

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/events`);

  check(res, {
    "events responde correctamente": (r) => r.status === 200,
  });

  sleep(1);
}
```

---

# 11. Script sugerido para soak test académico

Crear archivo:

```powershell id="nkaqgc"
code performance\k6-soak-test.js
```

Contenido sugerido:

```js id="56d8c7"
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "8m", target: 10 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1200"],
  },
};

const BASE_URL = "http://localhost:3001";

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/events`);

  check(res, {
    "events status 200": (r) => r.status === 200,
  });

  sleep(1);
}
```

---

# 12. Registro de resultados

Cuando se ejecuten las pruebas, documentar aquí los resultados:

| ID              | Tipo   | Fecha     | Usuarios virtuales | Duración |   Errores | Promedio respuesta |       p95 | Resultado |
| --------------- | ------ | --------- | -----------------: | -------- | --------: | -----------------: | --------: | --------- |
| PERF-LOAD-001   | Load   | Pendiente |                 20 | 5 min    | Pendiente |          Pendiente | Pendiente | Pending   |
| PERF-STRESS-001 | Stress | Pendiente |            75 máx. | 6 min    | Pendiente |          Pendiente | Pendiente | Pending   |
| PERF-SPIKE-001  | Spike  | Pendiente |            50 máx. | 3 min    | Pendiente |          Pendiente | Pendiente | Pending   |
| PERF-SOAK-001   | Soak   | Pendiente |                 10 | 10 min   | Pendiente |          Pendiente | Pendiente | Pending   |

---

# 13. Comandos de ejecución

Desde la raíz del proyecto:

```powershell id="gfy8cy"
k6 run performance\k6-load-test.js
```

```powershell id="nissss"
k6 run performance\k6-stress-test.js
```

```powershell id="06s27v"
k6 run performance\k6-spike-test.js
```

```powershell id="49i07v"
k6 run performance\k6-soak-test.js
```

---

# 14. Evidencias esperadas

Registrar en `QA_EVIDENCE.md`:

* Captura de backend ejecutándose.
* Captura de Docker con PostgreSQL y MongoDB activos.
* Captura del comando `k6 version`.
* Captura de ejecución del load test.
* Captura de ejecución del stress test.
* Captura de ejecución del spike test.
* Captura de ejecución del soak test académico.
* Captura de métricas finales de k6.
* Notas sobre errores o limitaciones.

---

# 15. Riesgos de rendimiento

| Riesgo                               | Impacto                                    | Mitigación                                                    |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------------------------- |
| Equipo local no soporta carga alta   | Resultados no representan producción       | Documentar como staging simulado/local.                       |
| Base de datos con pocos datos seed   | Métricas demasiado optimistas              | Crear datos adicionales o documentar limitación.              |
| Endpoints sin caché                  | Respuestas más lentas bajo carga           | Proponer cache en endpoints de consulta frecuente.            |
| Consultas sin índices suficientes    | Degradación con muchos registros           | Revisar índices en PostgreSQL/MongoDB.                        |
| Pruebas largas no ejecutadas         | No se detectan memory leaks reales         | Ejecutar soak académico y documentar prueba ideal de 2 horas. |
| Backend corriendo en modo desarrollo | Rendimiento menor o diferente a producción | Documentar entorno y proponer prueba en build productivo.     |

---

# 16. Recomendaciones de mejora

* Ejecutar pruebas de rendimiento en un ambiente staging real.
* Agregar índices a campos de búsqueda frecuente.
* Medir duración de queries de base de datos.
* Implementar caché para endpoints de solo lectura si el tráfico crece.
* Agregar métricas RED por endpoint: Rate, Errors y Duration.
* Monitorear consumo de CPU, RAM y conexiones de base de datos.
* Comparar resultados antes y después de optimizaciones.
* Mantener pruebas k6 dentro del repositorio para futuras regresiones.

---

# 17. Conclusión

El plan de rendimiento de Stagefront cubre los cuatro tipos de prueba solicitados: Load Test, Stress Test, Spike Test y Soak Test. La estrategia propuesta permite evaluar estabilidad, tiempos de respuesta, porcentaje de errores y comportamiento bajo incrementos de tráfico.

Para esta entrega se documenta una versión académica ejecutable en entorno local o staging simulado, además de una versión ideal para ambiente productivo. Los resultados finales deberán registrarse en QA_EVIDENCE.md junto con capturas de consola y métricas obtenidas.
