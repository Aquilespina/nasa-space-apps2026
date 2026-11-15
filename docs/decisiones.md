# Decisiones cerradas (una línea cada una, con su porqué)

- Arquitectura: datos precalculados (Aquiles/pipeline) → JSON → sitio estático. Porque la demo no debe depender de APIs de NASA en vivo.
- La red neuronal pronostica NDVI y humedad; las fechas salen de umbrales FAO-56 sobre ese pronóstico. Porque no existen datos etiquetados de "fecha óptima". `[PENDIENTE: acordar con Aquiles]`
- Siempre hay un baseline sin red. Si la red no lo supera, se entrega el baseline y se dice. Porque el jurado valora la validación honesta.
- Se descarta la regla "si llueve tarde, avena": perdió −$4,048/ha en 2003–2025 (revisión del supervisor del 27 sep).
- El chat sí entra (cambia lo decidido el 27 sep: "sin chatbot sin evaluar"), pero solo anclado a `cultivos.json` y a la ventana de la zona, con "no tengo ese dato" fuera de ahí, y se evalúa con unas 20–30 preguntas antes del envío. Porque un chat genérico no distingue (Texcaliacenses 2024 no pasó).
- La llave de la API de Claude vive solo en el backend del chat.
- 14 nov 13:40 (Ángel): pasado H24, el calendario usa el **baseline de la referencia** (inicio de lluvias NASA POWER 2003–2025 + ciclos FAO-56) con **una sola zona, El Llano**, marcado `ejemplo: false` y `generado_por: baseline`. Porque las zonas de prueba tenían coordenadas inventadas y la salida de Aquiles no trae fechas por zona. Fertilización queda "sin dato".
- 14 nov (salida de Aquiles en `main`): en `modelos_comparacion.json` el mejor modelo es "Climatología del píxel"; la LSTM no la supera. El sitio debe decirlo (regla 6).
- 14 nov 18:50 (Ángel, rama `frontend-simple`): la pregunta "¿Dónde cultivas?" acepta **cualquier municipio de México** (lista de INEGI en `municipios.json`, sin internet) o la ubicación GPS. Si el lugar está a **25 km o menos** de una zona con datos (`radio_cobertura_km` en `zonas.json`: mitad de la celda de ~55 km de NASA POWER), se muestra el plan de esa zona; si no, se dice "aún no tenemos datos de tu zona", con la zona más cercana y su distancia, y el plan de esa zona solo se ve si la persona lo pide, marcado como referencia. Porque no hay datos fuera de Amealco y no se inventan. El radio de 25 km es una regla propuesta: ajustarla si el equipo prefiere otra.

## Abiertas
- `[DECIDIR]` Dónde corre el backend del chat (función serverless o servidor pequeño), porque un sitio estático por sí solo no puede guardar la llave.
- `[DECIDIR]` Zonas adicionales a El Llano (las debe definir Aquiles con su NDVI). Cultivos: maíz, frijol y avena en `cultivos.json`.
- `[DECIDIR]` Si plagas y enfermedades entran, según el brief oficial del reto.
