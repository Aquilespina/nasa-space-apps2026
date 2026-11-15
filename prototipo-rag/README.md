# Prototipo RAG — wizard + chat

Prueba de concepto, fuera de `site/`, para el flujo: wizard de 5 pasos → chat anclado a `data/processed/*.json`.
No usa la LSTM en vivo (perdió contra el baseline, ver `docs/decisiones.md`); el chat solo lee los JSON ya calculados.

Está armado como una función serverless de Vercel (`api/chat.js`) + archivos estáticos, porque así se va a desplegar.
No hay un servidor Node aparte: lo mismo que corre en tu máquina es lo que corre en Vercel.

## Cómo probarlo localmente

1. Dentro de `prototipo-rag/`, copia los datos (hazlo de nuevo cada vez que cambie algo en `data/processed/`):
   ```
   node scripts/sync-datos.js
   ```

2. Pon tu llave de Claude en un archivo `.env` dentro de `prototipo-rag/` (ya está en `.gitignore`, nunca se sube):
   ```
   ANTHROPIC_API_KEY=tu-llave
   ```

3. Corre el emulador de Vercel (pide instalar/loguearse la primera vez; sigue lo que te pregunte en la terminal):
   ```
   npx vercel dev
   ```

4. Abre la URL que te muestre esa terminal (normalmente `http://localhost:3000`).

**Importante:** no abras `index.html` con doble clic ni con otro servidor estático (`python3 -m http.server`, Live Server, etc.) — ninguno de esos conoce la ruta `/api/chat`, así que el chat va a fallar con "No pude conectar" sin importar qué escribas. Tiene que ser `vercel dev` (local) o la URL ya desplegada en Vercel.

## Cómo desplegarlo

Desde `prototipo-rag/`: `npx vercel` (o conectar esta subcarpeta como Root Directory de un proyecto nuevo en el dashboard de Vercel). Después, en el proyecto de Vercel: Settings → Environment Variables → `ANTHROPIC_API_KEY` con la llave real.

## Qué hace el backend (`api/chat.js`)

- Normaliza el cultivo escrito y lo compara contra `cultivos.json`. Si no hay match, responde "no tengo ese dato" sin llamar al LLM.
- Si el usuario comparte su ubicación (GPS, ya validada en el navegador contra un radio de 60 km de Amealco) o escribe "Amealco"/"El Llano", busca la zona en `zonas.json` y las filas correspondientes en `calendario.json`.
- Fuera de ese radio, el frontend (`script.js`) rechaza la ubicación antes de llegar al backend (no se guarda como válida).
- Llama a la API de Claude (`claude-sonnet-5-5` por defecto, configurable con `ANTHROPIC_MODEL`) con ese contexto como único material permitido.

## Pendiente antes de integrarlo al sitio real

- Evaluarlo con las 20-30 preguntas de `docs/tablero.md`.
- Más zonas en `zonas.json` cuando Aquiles las defina (hoy solo "El Llano").
- Decidir si el chat también debe poder hablar de `modelos_comparacion.json` (qué tan bien le fue a la red vs. el baseline) cuando se lo pregunten directamente.
