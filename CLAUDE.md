# Milpa Clara — contexto para Claude Code

Este repo es la parte de **Ángel** (página e integración) de un proyecto de NASA Space Apps CDMX 2026, reto *Field Shift: Adapting Farms with NASA Data*. **Aquiles** hace la red neuronal en Google Colab (fuera de este repo): aquí solo llegan sus resultados como JSON.

## Qué es (3 frases)
Página web con un recorrido por zonas de la milpa de Amealco de Bonfil (Querétaro) que, con base en datos de satélite, muestra las fechas más óptimas de cada actividad (siembra, fertilización, cosecha) y explica por qué. Incluye un cuadro para preguntar qué se necesita para un cultivo específico. Apoya la decisión del productor; no la reemplaza.

Meta del equipo: ganar el evento local de CDMX. Envío: 15 nov 2026. Hora límite: `[DECIDIR]` confirmar con la sede (la carpeta de preparación dice 17:59 CDMX; objetivo interno: 15:00).

## Reglas que no se rompen
1. **Ningún dato inventado.** Todo número del sitio sale de `data/processed/*.json`. Cada JSON lleva `fuente`, `fecha_consulta` y `ejemplo` (ver `docs/contrato-datos.md`). Si falta un dato, el sitio muestra "sin dato".
2. **Un JSON de prueba lleva `"ejemplo": true`** y no puede quedar ninguno al congelar el alcance.
3. **El sitio no llama a APIs de NASA en vivo.** Todo viene precalculado por Aquiles o por `pipeline/`. La única llamada en vivo permitida es la del chat, y va a un backend propio.
4. **El chat nunca usa la API de Anthropic ni otra API de modelos de lenguaje con llave.** Es un RAG propio (`api/_recuperar.js` + `api/chat.js`) que responde con `data/processed/*.json` y con lo que predijo el modelo del equipo. Ver `docs/decisiones.md` (14 nov 23:55).
5. **No escribas código de la red neuronal ni la entrenes.** Eso es de Aquiles en Colab. Si falta un campo del contrato, pídelo; no lo inventes.
6. Si el modelo de Aquiles no supera al baseline, el sitio lo dice así. No presentes como red neuronal algo que no lo es.
7. Anota en `docs/uso-ia.md` lo que generó la IA (campo obligatorio *Use of AI*).
8. Todo vive en el repo. Commit al terminar cada tarea.
9. Antes de proponer algo que cambie el alcance, lee `docs/decisiones.md`.

## Alcance de Ángel
DEBE: recorrido por zonas (una a la vez) con calendario por actividad leído del JSON · razón y confianza visibles en cada fecha · cuadro de preguntas por cultivo con respuestas ancladas a `data/processed/cultivos.json` y a la ventana de la zona · móvil (`<meta name="viewport">`) · enlace público · video de 30 s con subtítulos en inglés.
NO: login · backend más allá del proxy del chat · depender de internet de la sede para lo principal · más de 3–5 zonas · quitar el "no tengo ese dato" del chat.

## Punto de partida visual
`referencia/maqueta-tu-parcela-v6.html` es el prototipo (pestañas Mi parcela, Mi plan, Historia, Avisos). La página debe basarse en él. Dos cosas a corregir de entrada:
- Quitar la regla de "cultivo de ciclo corto/avena si la lluvia se atrasa" (≈ línea 979): perdió −$4,048/ha en 2003–2025.
- El texto "tu parcela" sobrepromete: los datos son de la zona/municipio, no de la parcela.

## Datos y método (referencia)
- `referencia/amealco-datos-reales.md`: lluvia y temperatura NASA POWER, SIAP, sequía CONAGUA, suelo SoilGrids, agua por cultivo FAO-56 (maíz 528 mm / 180 d, avena 320 mm / 100 d, frijol 354 mm / 110 d). Punto de referencia: lat 20.19, lon −100.14.
- `referencia/retos-2026-completo.md`: texto completo de los retos 2026. Léelo solo si la tarea lo pide (es largo). El reto actual se llama *Field Shift*.
- `referencia/estado-supervisor.md`: riesgos y decisiones abiertas del equipo.

## Estructura y comandos
- `site/` página estática · `pipeline/` scripts de apoyo · `data/processed/` JSON del contrato · `docs/` plan, contrato, tablero, decisiones, uso de IA.
- Ver el sitio con el chat: `npm run local` (http://localhost:3000, sin llaves ni cuenta de Vercel). Igual que en producción: `npx vercel dev`.
- Verificar el repo: `python3 .claude/hooks/verifica.py`
- Tareas con su comprobación: `docs/tablero.md`

## Notas del entorno
- Fedora: usa `python3`, no `python`. Los hooks de `.claude/settings.json` ya lo usan.
- El hook `anti_mock.py` marca palabras como `placeholder` (incluido el atributo HTML de un `<input>`). Si es legítimo, agrega en esa línea `ok-sin-datos: <razón>`.
- Los hooks calculan las horas del evento con H0 = 13 nov 13:00 CDMX. Si la sede confirma otro horario, edita `H0` en `reloj.py` y `H24` en `verifica.py`.
