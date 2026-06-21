# StageFront - Corrección de Bugs Reportados (Prioridad Máxima)

Repositorio:
https://github.com/jaaviermt/Stagefront

Contexto:

StageFront es un proyecto universitario. No es un producto real ni será desplegado a producción.

Otro equipo realizó pruebas funcionales y entregó un reporte de bugs.

Tu objetivo NO es refactorizar el proyecto, NO es mejorar arquitectura, NO es optimizar código y NO es implementar funcionalidades nuevas que no existan.

Tu único objetivo es corregir los bugs reales reportados con la menor cantidad de cambios posibles.

---

# Instrucciones

1. Analiza completamente el repositorio.
2. Localiza dónde se encuentra implementada cada funcionalidad relacionada con los bugs.
3. Determina cuáles son bugs reales.
4. Determina cuáles son:

   * Mejoras UX
   * Funcionalidades faltantes
   * Comportamientos intencionales
5. Prioriza únicamente los bugs que afectan la lógica del sistema.

NO hagas cambios todavía.

Primero genera una tabla:

| Bug                    | Estado |
| ---------------------- | ------ |
| Bug real               | Sí     |
| Mejora UX              | Sí     |
| Funcionalidad faltante | Sí     |
| No reproducible        | Sí     |

Para cada bug indica:

* Archivos involucrados
* Causa raíz
* Complejidad
* Solución propuesta

---

# Bugs reportados

1. Botón StageFront en home parece clickeable pero no hace nada.
2. Botones inferiores duplican funcionalidad de los superiores.
3. Botón Comprar redirige a Eventos.
4. Se generan tarjetas vacías cuando la fila de eventos no se llena.
5. La búsqueda también busca por localización.
6. El contador de boletos no se centra al usar 3 dígitos.
7. No existe límite de compra de boletos.
8. Se puede exceder el límite de boletos cambiando de zona.
9. No existe retroalimentación para códigos promocionales inválidos.
10. No existe botón para regresar desde la sección de pago.
11. Se aceptan tarjetas vencidas.
12. No existe historial o retroalimentación de compras realizadas.
13. Los formularios aceptan únicamente espacios.
14. No se valida correctamente la fecha en pago.
15. Las tarjetas de reventa parecen clickeables.
16. No existe forma de crear reseñas.
17. Hay nombres de usuario en reseñas pero no existe login.
18. No existe interfaz para crear reventas.
19. No existe filtro en la sección de reventas.
20. CVV acepta cualquier longitud.
21. Número de tarjeta acepta cualquier longitud.

---

# Prioridad

Prioridad 1:

* Bug 8
* Bug 11
* Bug 13
* Bug 14
* Bug 20
* Bug 21

Prioridad 2:

* Bug 9
* Bug 10
* Bug 7

Prioridad 3:

* Resto de bugs visuales o UX.

---

# Forma de trabajo

NO arregles todo de una sola vez.

Trabaja en ciclos:

1. Analiza.
2. Explica.
3. Muestra exactamente qué archivos modificarás.
4. Espera confirmación.
5. Implementa únicamente esos cambios.

---

# Restricciones

NO:

* Refactorizar componentes completos.
* Cambiar arquitectura.
* Renombrar carpetas.
* Cambiar rutas.
* Cambiar estructura de datos.
* Agregar librerías nuevas salvo que sea estrictamente necesario.

SI:

* Corregir validaciones.
* Corregir lógica de negocio.
* Corregir navegación.
* Corregir estados de UI.
* Agregar mensajes de error.
* Agregar validaciones de formularios.

Antes de escribir código quiero recibir:

1. Análisis de los 21 bugs.
2. Clasificación de cada bug.
3. Plan de corrección.
4. Orden recomendado de implementación.

Después comenzaremos con el Bug #8.
