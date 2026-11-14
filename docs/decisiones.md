# Decisiones cerradas (una línea cada una, con su porqué)

- Arquitectura: datos precalculados (Aquiles/pipeline) → JSON → sitio estático. Porque la demo no debe depender de APIs de NASA en vivo.
- La red neuronal pronostica NDVI y humedad; las fechas salen de umbrales FAO-56 sobre ese pronóstico. Porque no existen datos etiquetados de "fecha óptima". `[PENDIENTE: acordar con Aquiles]`
- Siempre hay un baseline sin red. Si la red no lo supera, se entrega el baseline y se dice. Porque el jurado valora la validación honesta.
- Se descarta la regla "si llueve tarde, avena": perdió −$4,048/ha en 2003–2025 (revisión del supervisor del 27 sep).
- El chat sí entra (cambia lo decidido el 27 sep: "sin chatbot sin evaluar"), pero solo anclado a `cultivos.json` y a la ventana de la zona, con "no tengo ese dato" fuera de ahí, y se evalúa con unas 20–30 preguntas antes del envío. Porque un chat genérico no distingue (Texcaliacenses 2024 no pasó).
- La llave de la API de Claude vive solo en el backend del chat.

## Abiertas
- `[DECIDIR]` Dónde corre el backend del chat (función serverless o servidor pequeño), porque un sitio estático por sí solo no puede guardar la llave.
- `[DECIDIR]` Zonas y cultivos exactos.
- `[DECIDIR]` Si plagas y enfermedades entran, según el brief oficial del reto.
