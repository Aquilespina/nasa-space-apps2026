// Función serverless de Vercel: POST /api/chat
// RAG estructurado: solo responde con lo que hay en data/processed/*.json (copiado a ./data por scripts/sync-datos.js).
// La llave de Claude vive SOLO en la variable de entorno ANTHROPIC_API_KEY del proyecto en Vercel.

const fs = require('node:fs');
const path = require('node:path');

const RAIZ_DATOS = path.join(__dirname, '..', 'data');
const MODELO = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const RADIO_COBERTURA_KM = 60; // la celda de NASA POWER usada en el contrato cubre ~55 km

function cargarJson(nombreArchivo) {
  return JSON.parse(fs.readFileSync(path.join(RAIZ_DATOS, nombreArchivo), 'utf8'));
}

function normalizar(texto) {
  return (texto || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buscarCultivo(textoCultivo, cultivosJson) {
  const texto = normalizar(textoCultivo);
  if (!texto) return null;
  return (
    cultivosJson.datos.find((c) => {
      const clave = normalizar(c.cultivo);
      const nombre = normalizar(c.nombre);
      return clave === texto || texto.includes(clave) || clave.includes(texto) || nombre.includes(texto);
    }) || null
  );
}

function buscarZona(perfil, zonasJson) {
  const { lat, lon, lugar } = perfil;

  if (typeof lat === 'number' && typeof lon === 'number') {
    let mejor = null;
    for (const zona of zonasJson.datos) {
      const d = distanciaKm(lat, lon, zona.lat, zona.lon);
      if (d <= RADIO_COBERTURA_KM && (!mejor || d < mejor.distancia_km)) {
        mejor = { zona, distancia_km: Math.round(d), aproximado: false };
      }
    }
    return mejor;
  }

  const texto = normalizar(lugar);
  if (!texto) return null;
  if (texto.includes('amealco') || texto.includes('llano')) {
    return { zona: zonasJson.datos[0], distancia_km: null, aproximado: true };
  }
  return null;
}

function construirContexto(perfil, datos) {
  const { cultivosJson, calendarioJson, zonasJson } = datos;
  const cultivo = buscarCultivo(perfil.cultivo, cultivosJson);

  if (!cultivo) {
    return { respuestaDirecta: `No tengo datos para "${perfil.cultivo}". Por ahora solo cubro maíz, frijol y avena de Amealco de Bonfil, Qro.` };
  }

  const zonaEncontrada = buscarZona(perfil, zonasJson);
  const filasCalendario = zonaEncontrada
    ? calendarioJson.datos.filter(
        (fila) => fila.zona_id === zonaEncontrada.zona.zona_id && fila.cultivo === cultivo.cultivo
      )
    : [];

  return {
    contexto: {
      cultivo,
      cobertura: zonaEncontrada
        ? {
            dentro_de_cobertura: true,
            zona: zonaEncontrada.zona.nombre,
            distancia_km: zonaEncontrada.distancia_km,
            aproximado: zonaEncontrada.aproximado
          }
        : { dentro_de_cobertura: false },
      calendario_filas: filasCalendario
    }
  };
}

function construirPromptSistema(perfil, contexto) {
  const anios = (String(perfil.tiempo || '').match(/\d+/) || [])[0];
  const experiencia = anios ? (Number(anios) < 2 ? 'principiante' : 'experimentada') : 'desconocida';

  return `Eres el asistente de Milpa Clara para productores de Amealco de Bonfil, Querétaro.
Responde SOLO con los datos del bloque CONTEXTO (JSON) de abajo. No inventes cifras ni fechas.
Si la pregunta pide algo que no está en CONTEXTO, responde literalmente: "No tengo ese dato."
Si la pregunta no se entiende o no tiene relación con cultivos (por ejemplo, texto sin sentido), pide amablemente que la reformule; no respondas "No tengo ese dato" en ese caso.
Si cobertura.dentro_de_cobertura es false, dilo con claridad: no hay datos satelitales verificados para esa ubicación exacta; los números de "cultivo" son una referencia para el clima de Amealco y pueden no aplicar tal cual a otra zona. No des fechas de calendario si calendario_filas está vacío.
Ajusta el tono a una persona con experiencia ${experiencia} cultivando, y da prioridad a lo relacionado con su objetivo: "${perfil.objetivo || 'sin especificar'}".
Responde en español, en 2 a 4 frases, sin tecnicismos innecesarios.

CONTEXTO:
${JSON.stringify(contexto, null, 2)}`;
}

async function llamarClaude(systemPrompt, pregunta) {
  const llave = process.env.ANTHROPIC_API_KEY;
  if (!llave) {
    return 'Falta configurar la llave de la API en el proyecto de Vercel (variable de entorno ANTHROPIC_API_KEY).';
  }

  const respuesta = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': llave,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: pregunta }]
    })
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    console.error('Error de la API de Claude:', respuesta.status, detalle);
    return 'Hubo un problema al generar la respuesta. Intenta de nuevo en un momento.';
  }

  const cuerpo = await respuesta.json();
  return cuerpo.content?.[0]?.text?.trim() || 'No tengo ese dato.';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ respuesta: 'Método no permitido.' });
    return;
  }

  const { perfil, pregunta } = req.body || {};
  if (!pregunta || typeof pregunta !== 'string') {
    res.status(400).json({ respuesta: 'Falta la pregunta.' });
    return;
  }

  try {
    const datos = {
      cultivosJson: cargarJson('cultivos.json'),
      calendarioJson: cargarJson('calendario.json'),
      zonasJson: cargarJson('zonas.json')
    };

    const armado = construirContexto(perfil || {}, datos);
    let respuestaTexto;
    if (armado.respuestaDirecta) {
      respuestaTexto = armado.respuestaDirecta;
    } else {
      const sistema = construirPromptSistema(perfil || {}, armado.contexto);
      respuestaTexto = await llamarClaude(sistema, pregunta);
    }

    res.status(200).json({ respuesta: respuestaTexto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ respuesta: 'Error interno del servidor.' });
  }
};
