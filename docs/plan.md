# Plan del proyecto: fechas óptimas para la milpa

Equipo: Ángel (página e integración) y Aquiles (red neuronal en Google Colab). Creado el 14 de noviembre de 2026. La versión editable vive en el Claude Doc; este archivo es la copia de esa fecha.

## Objetivo
Una página con un recorrido por las zonas de la milpa que, con base en datos de satélite, indique las fechas más óptimas de cada actividad (siembra, fertilización, cosecha). Debe permitir preguntar qué se necesita para un cultivo en específico. Parte de la Maqueta Tu Parcela v6 (`referencia/maqueta-tu-parcela-v6.html`).

## Reparto
| | Ángel | Aquiles |
|---|---|---|
| Entrega principal | Página, recorrido por zonas, chat, despliegue e integración | Datos de satélite, red neuronal, entrenamiento y predicciones exportadas |
| Herramientas | HTML/JS desde la maqueta v6, backend pequeño para el chat | Google Colab, NASA POWER, MODIS o HLS |
| Punto de unión | Lee el JSON del contrato (`docs/contrato-datos.md`) | Produce el JSON del contrato |

## Pendientes por confirmar
- Fechas y hora límite: la carpeta dice evento 13–15 nov con cierre el 15 a las 17:59; una fuente pública dice 14–15 nov. Confirmar con la sede CDMX.
- Brief oficial del reto: no se pudo leer la página. Una fuente secundaria menciona agua, plagas y enfermedades. El plan cubre agua; plagas y enfermedades quedan por decidir.
- Regla de trabajo previo y formato de entrega: revisar la guía oficial y declarar el trabajo previo.

## Decisión de diseño
La red no predice la fecha óptima directamente (no hay datos etiquetados). **Pronostica** NDVI y humedad para las próximas semanas por zona, y las fechas salen de aplicar umbrales agronómicos (FAO-56) sobre ese pronóstico.

## Fase 0: ahora (30–45 min), los dos juntos
- Contrato de datos (`docs/contrato-datos.md`).
- Alcance: 3–5 zonas y 2–3 cultivos.
- Ángel: confirma fechas, formato de entrega y regla de trabajo previo.

## Fase 1: sábado 14, hasta la noche
**Aquiles:** series de NASA POWER de Amealco; NDVI de MODIS o HLS por zona (cuenta de Earthdata); dataset y **baseline sin red** que ya genere el JSON del contrato.
**Ángel:** repo desde la maqueta v6; recorrido por zonas leyendo el JSON; quitar la regla de "ciclo corto/avena"; interfaz de preguntas respondiendo desde la tabla de cultivos.

## Fase 2: noche del sábado a las 09:00 del domingo 15
**Aquiles:** entrena el pronosticador de NDVI y humedad; evalúa por años contra el baseline; exporta predicciones ya calculadas a JSON; ficha con métricas reales.
**Ángel:** integra el JSON (fechas, ventanas, razón); conecta el chat con un backend pequeño (la llave de la API solo en el servidor); contexto del chat = tabla de cultivos + ventana de la zona, con "no tengo ese dato" fuera de ahí; despliegue público.

## Fase 3: domingo 15, 09:00 a 12:00
Compuerta a las 09:00: si la red no supera al baseline, se entrega el baseline y se dice así. Integración final, pruebas en celular y alcance congelado a las 12:00.

## Fase 4: domingo 15, 12:00 a 15:00
Pitch de 30 segundos, video si lo piden, README con datos NASA usados y declaración del trabajo previo. Ángel envía a las 15:00; el resto es margen.

## Reglas para los dos
- Nada de datos inventados en la demo; las muestras son salida real del baseline y están etiquetadas.
- Cada mensaje entre ustedes incluye un entregable verificable.
