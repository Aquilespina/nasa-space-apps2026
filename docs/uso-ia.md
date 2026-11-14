# Uso de IA (base del campo "Use of Artificial Intelligence (AI)")

Antes del evento: se preparó la configuración del agente (CLAUDE.md, hooks de verificación, subagentes de revisión), la maqueta Tu Parcela v6 y el análisis de datos de Amealco, con asistencia de IA. Declarar esto como trabajo previo.

| Hora | Qué hizo la IA (herramienta y modelo) | Qué revisó o cambió una persona |
|---|---|---|
| 14 nov 12:20 | Claude Code (Claude Opus 5.5): `git init` y primer commit; copió la maqueta v6 a `site/index.html`, quitó la regla de "ciclo corto" y cambió "tu parcela" por "tu zona" en los textos que sobreprometían; armó `data/processed/cultivos.json` desde `referencia/amealco-datos-reales.md`; redactó `docs/mensaje-aquiles.md` | Pendiente: Ángel revisa los textos y el JSON |
| 14 nov 12:35 | Claude Code (Claude Opus 5.5): sección "Recorrido por zonas" (`site/recorrido.js` + HTML/CSS en `site/index.html`) que lee `zonas.json`, `calendario.json` y `cultivos.json` y muestra "sin dato" donde falta; JSON de prueba (`ejemplo: true`) derivados de la referencia; `pipeline/copiar_datos.py` y chequeo en `verifica.py` de que `site/data` coincide con `data/processed` | Pendiente: Ángel revisa |
| 14 nov 12:45 | Claude Code (Claude Opus 5.5): README, .gitignore y flujo de GitHub Pages (`.github/workflows/pages.yml`) | Pendiente: Ángel revisa |
| 14 nov 13:40 | Claude Code (Claude Opus 5.5): pasó `zonas.json` y `calendario.json` a baseline real (`ejemplo: false`) con una sola zona, El Llano; quitó las 2 zonas con coordenadas de prueba | Ángel eligió la opción (baseline con lo existente) |
| 14 nov 14:00 | Claude Code (Claude Opus 5.5): sección "Cómo se calculó" (`site/calculo.js` + HTML/CSS) que lee `modelos_comparacion.json` de Aquiles y dice que la LSTM no superó a la climatología | Pendiente: Ángel revisa |
| 14 nov 14:20 | Claude Code (Claude Opus 5.5): `pipeline/probar_salida_aquiles.py` y `docs/prueba-salida-aquiles.md` (prueba local de la salida de Aquiles, sin ejecutar el modelo) | Pendiente: Ángel revisa y manda las preguntas a Aquiles |
| 14 nov 14:30 | Claude Code (Claude Opus 5.5): `docs/guia-milpa-clara.pdf` (guía de uso para alguien que no conoce el proyecto, con capturas de la página; hecha con reportlab) | Pendiente: Ángel revisa |
