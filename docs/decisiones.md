# Decisiones cerradas (una línea cada una, con su porqué)

- Arquitectura: datos precalculados (Aquiles/pipeline) → JSON → sitio estático. Porque la demo no debe depender de APIs de NASA en vivo.
- La red neuronal pronostica NDVI y humedad; las fechas salen de umbrales FAO-56 sobre ese pronóstico. Porque no existen datos etiquetados de "fecha óptima". `[PENDIENTE: acordar con Aquiles]`
- Siempre hay un baseline sin red. Si la red no lo supera, se entrega el baseline y se dice. Porque el jurado valora la validación honesta.
- Se descarta la regla "si llueve tarde, avena": perdió −$4,048/ha en 2003–2025 (revisión del supervisor del 27 sep).
- El chat sí entra (cambia lo decidido el 27 sep: "sin chatbot sin evaluar"), pero solo anclado a `cultivos.json` y a la ventana de la zona, con "no tengo ese dato" fuera de ahí, y se evalúa con unas 20–30 preguntas antes del envío. Porque un chat genérico no distingue (Texcaliacenses 2024 no pasó).
- ~~La llave de la API de Claude vive solo en el backend del chat.~~ Reemplazada el 14 nov (abajo): el chat no usa ninguna API de modelos de lenguaje.
- 14 nov 13:40 (Ángel): pasado H24, el calendario usa el **baseline de la referencia** (inicio de lluvias NASA POWER 2003–2025 + ciclos FAO-56) con **una sola zona, El Llano**, marcado `ejemplo: false` y `generado_por: baseline`. Porque las zonas de prueba tenían coordenadas inventadas y la salida de Aquiles no trae fechas por zona. Fertilización queda "sin dato".
- 14 nov (salida de Aquiles en `main`): en `modelos_comparacion.json` el mejor modelo es "Climatología del píxel"; la LSTM no la supera. El sitio debe decirlo (regla 6).
- 14 nov 18:50 (Ángel, rama `frontend-simple`): la pregunta "¿Dónde cultivas?" acepta **cualquier municipio de México** (lista de INEGI en `municipios.json`, sin internet) o la ubicación GPS. Si el lugar está a **25 km o menos** de una zona con datos (`radio_cobertura_km` en `zonas.json`: mitad de la celda de ~55 km de NASA POWER), se muestra el plan de esa zona; si no, se dice "aún no tenemos datos de tu zona", con la zona más cercana y su distancia, y el plan de esa zona solo se ve si la persona lo pide, marcado como referencia. Porque no hay datos fuera de Amealco y no se inventan. El radio de 25 km es una regla propuesta: ajustarla si el equipo prefiere otra.

- 14 nov 23:55 (Aquiles): **el chat nunca usa la API de Anthropic** (ni otra API de modelos de lenguaje con llave). Es un RAG propio: `api/_recuperar.js` busca con BM25 en `data/processed/*.json` los fragmentos de cada pregunta, incluido lo que predijo la LSTM del equipo (`estres_mapa.json`, con su advertencia de que no superó al promedio en 2021–2025), y `api/chat.js` redacta la respuesta con esos datos. Porque el equipo quiere que el chat use su propio modelo y no depender de llaves ni servicios externos.

## Abiertas
- Backend del chat: función serverless de Vercel (`api/chat.js`); en local, `npm run local` (`servidor-local.js`). Ya no hay llave que guardar.
- `[DECIDIR]` Zonas adicionales a El Llano (las debe definir Aquiles con su NDVI). Cultivos: maíz, frijol y avena en `cultivos.json`.
- `[DECIDIR]` Si plagas y enfermedades entran, según el brief oficial del reto.
