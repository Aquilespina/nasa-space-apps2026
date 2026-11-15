// Función serverless de Vercel: POST /api/chat — el chat RAG de Milpa Clara, sin servicios externos.
//   1. Recuperación: api/_recuperar.js busca en data/processed/*.json los fragmentos más
//      parecidos a la pregunta (incluido lo que predijo el modelo que entrenó el equipo).
//   2. Respuesta: la LSTM de texto del equipo (api/_lstm_texto.js) escribe cada frase en el tono de
//      Amealquito con marcas; aquí se llenan con los datos de los fragmentos. Si no hay dato, se dice.
// No necesita llaves ni internet: corre igual en Vercel y en servidor-local.js.

const fs = require('node:fs');
const path = require('node:path');
const { recuperar } = require('./_recuperar.js');
const { redactar } = require('./_lstm_texto.js');

const RAIZ_DATOS = path.join(__dirname, '..', 'data', 'processed');
const PARCELA = 'Datos de tu parcela';
const REDACTOR = 'Redactado por la LSTM del equipo';
const cargarJson = (n) => JSON.parse(fs.readFileSync(path.join(RAIZ_DATOS, n), 'utf8'));

const CONDICION = { falta_agua: 'la tierra se te seca muy rápido', tierra_cansada: 'la tierra está cansada y rinde menos', plagas_clima: 'ves más plagas o lluvias disparejas' };
const ESTRATEGIA = { leguminosa: 'frijol', cobertura: 'avena' };
const ACTIVIDAD = { siembra: 'la siembra', fertilizacion: 'la fertilización', cosecha: 'la cosecha' };

const corto = (nombre) => String(nombre || '').split(/\s+/)[0].toLowerCase();
const miles = (n) => Number(n).toLocaleString('es-MX');
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const amigable = (r) => String(r || '')
  .replace(/NASA POWER PRECTOTCORR/g, 'satélites de la NASA que miden la lluvia')
  .replace(/\s*\(?FAO-56\)?/g, '')
  .replace(/\+\s*ciclo de (\d+) días/, 'más $1 días de ciclo').replace(/\s{2,}/g, ' ').trim();

// El texto lo escribe la LSTM de texto del equipo (api/_lstm_texto.js); los números y los textos
// que vienen de los datos (razón de la fecha, avisos) los pone el código. usoLstm cuenta cuántas
// frases escribió la red en esta respuesta.
let usoLstm = 0;
const R = (tema, valores = {}) => { const r = redactar(tema, valores); if (r.lstm) usoLstm++; return r.texto; };
const conArticulo = (c) => (c === 'avena' ? 'la avena' : `el ${c}`);
const enAmealco = (t) => (/^En el municipio,/.test(t) ? t.replace(/^En el municipio,/, 'En Amealco,') : `En Amealco, ${t.charAt(0).toLowerCase()}${t.slice(1)}`);

function frase(f) {
  const d = f.datos;
  switch (f.id.split(':')[0]) {
    case 'fecha': {
      const v = { '<ACT>': ACTIVIDAD[d.actividad] || d.actividad, '<CULTIVO>': corto(d.cultivo) };
      if (d.fecha_recomendada === 'sin dato') return R('fecha_sin_dato', v);
      v['<FECHA>'] = d.fecha_recomendada;
      let s = d.ventana !== 'sin dato' && d.confianza !== 'sin dato'
        ? R('fecha', { ...v, '<VENTANA>': d.ventana, '<CONF>': d.confianza })
        : R('fecha_sin_ventana', v);
      if (d.razon !== 'sin dato') s += ` ${amigable(d.razon)}`;
      return s;
    }
    case 'agua': {
      let s = R('agua', { '<EL_CULTIVO>': conArticulo(corto(d.cultivo)), '<MM>': d.agua_ciclo_mm, '<DIAS>': d.ciclo_dias, '<M3>': miles(d.agua_ciclo_m3_ha) });
      if (d.anios_con_falta_agua_mas_15pct) s += ` ${enAmealco(R('falta_agua', { '<X>': d.anios_con_falta_agua_mas_15pct.split(' (')[0] }))}`;
      return s;
    }
    case 'cosechas': {
      const c = corto(d.cultivo), malos = d.anios_malos_2003_2025 || [];
      let s = enAmealco(R('cosechas', { '<EL_CULTIVO>': conArticulo(c), '<N>': malos.length, '<LISTA>': malos.join(', ') }));
      const p = d.rendimiento_en_los_anios_malos_del_maiz_pct_de_lo_normal;
      if (typeof p === 'number') s += ' ' + (c === 'maíz' ? R('rend_propio', { '<P>': p }) : R('rend_otro', { '<EL_CULTIVO>': conArticulo(c), '<P>': p }));
      if (typeof d.ingreso_bruto_ha_anio_normal_mxn === 'number') s += ' ' + R('ingreso', { '<DINERO>': `$${miles(d.ingreso_bruto_ha_anio_normal_mxn)}` });
      if (d.aviso) s += ` Ojo: ${d.aviso}`;
      return s;
    }
    case 'sin_registro': return `${R('sin_registro', { '<CULTIVO>': d.cultivo })} ${d.nota}`;
    case 'zona': return R('zona', { '<ZONA>': d.zona });
    case 'metodo': return R('metodo');
    case 'suelo': {
      const a = d.arcilla_pct || {};
      if (typeof d.agua_disponible_mm_por_m !== 'number' || a['0-5cm'] == null || a['15-30cm'] == null || !d.ph) return 'Del suelo de tu zona no tengo dato completo.';
      return `${R('suelo', { '<AGUA_SUELO>': d.agua_disponible_mm_por_m, '<ARC1>': a['0-5cm'], '<ARC2>': a['15-30cm'], '<PH>': String(d.ph).replace('-', ' a ') })} Es un mapa de suelos, no una muestra de tu parcela.`;
    }
    case 'verdor': {
      const u = (d.ultimos_anios || []).slice(-1)[0];
      return u ? R('verdor', { '<VERDOR>': u.verdor, '<ANIO>': u.anio }) : 'Del verdor del campo no tengo dato.';
    }
    case 'prueba_ia': {
      const m = d.mejora_de_la_red_sobre_el_promedio_en_prueba;
      return typeof m === 'number' ? R('prueba_ia', { '<RES>': m }) : R('metodo');
    }
    case 'modelo':
      return `${R('modelo', { '<ANIO>': d.anio, '<PRED>': d.prediccion, '<PCT>': d.pct_terrenos_predichos_bajo_lo_normal, '<N>': miles(d.terrenos_agricolas), '<ERR>': d.error_del_modelo, '<ERRC>': d.error_si_solo_se_usa_el_promedio })} ${R('advertencia_modelo')}`;
    default: return null;
  }
}

// Elige qué fragmentos van en la respuesta: solo los que se parecen de verdad a la pregunta
// (al menos 45 % del mejor puntaje), sin repetir el mismo dato de otros cultivos que la persona
// no pidió. Si la pregunta es de fechas, todas las fechas encontradas en orden; si es de
// confianza, primero de dónde salen y la prueba del modelo.
const ORDEN_ACT = { siembra: 0, fertilizacion: 1, cosecha: 2 };
function elegir(fragmentos, cultivoCorto, pregunta) {
  const q = norm(pregunta);
  const tipo = (f) => f.id.split(':')[0];
  const cultivoDe = (f) => (f.datos && f.datos.cultivo ? norm(corto(f.datos.cultivo)) : null);
  const pideVarios = /(^|[^a-z])(cada|todos|todas|cultivos|comparar|compara|otro|otros|alternar|rotar|cambiar)([^a-z]|$)/.test(q);
  const mencionado = (f) => cultivoDe(f) && q.includes(cultivoDe(f));
  const top = fragmentos.length ? fragmentos[0].puntaje : 0;
  let lista = fragmentos.filter((f) => f.puntaje >= 0.45 * top);
  lista = lista.filter((f) => tipo(f) !== 'sin_registro' || q.includes(norm(f.datos.cultivo)));
  if (!pideVarios) {
    const propio = (f) => !cultivoDe(f) || cultivoDe(f) === norm(cultivoCorto) || mencionado(f);
    lista = lista.filter((f) => propio(f) || !fragmentos.some((g) => tipo(g) === tipo(f) && propio(g)));
  }
  if (/confi|segur|salen|de donde/.test(q)) {
    const peso = (f) => ({ metodo: 0, prueba_ia: 1, modelo: 2 }[tipo(f)] ?? (f.id.endsWith(':siembra') && cultivoDe(f) === norm(cultivoCorto) ? 3 : 9));
    const base = fragmentos.filter((f) => ['metodo', 'prueba_ia'].includes(tipo(f)));
    return [...new Set([...base, ...lista])].sort((a, b) => peso(a) - peso(b)).filter((f) => peso(f) < 9).slice(0, 4);
  }
  if (lista.length && tipo(lista[0]) === 'fecha') {
    return (pideVarios ? fragmentos : lista).filter((f) => tipo(f) === 'fecha')
      .sort((a, b) => (cultivoDe(a) === norm(cultivoCorto) ? 0 : 1) - (cultivoDe(b) === norm(cultivoCorto) ? 0 : 1)
        || String(cultivoDe(a)).localeCompare(String(cultivoDe(b))) || ORDEN_ACT[a.datos.actividad] - ORDEN_ACT[b.datos.actividad]);
  }
  // La advertencia de la prueba ya va dentro del fragmento del modelo: no se repite.
  if (lista.some((f) => tipo(f) === 'modelo')) lista = lista.filter((f) => tipo(f) !== 'prueba_ia');
  return lista.slice(0, 3);
}

function responder(perfil, pregunta) {
  const cultivos = cargarJson('cultivos.json').datos || [];
  const cultivo = cultivos.find((c) => c.cultivo === perfil.cultivo);
  if (!cultivo) {
    return { respuesta: `No tengo datos para ese cultivo. Por ahora solo tengo ${cultivos.map((c) => corto(c.nombre)).join(', ')} de Amealco.`, fuentes: [], fragmentos: [] };
  }
  const zona = (cargarJson('zonas.json').datos || []).find((z) => z.zona_id === perfil.zona_id) || null;
  const encontrados = recuperar(pregunta, { cultivo: cultivo.cultivo, zona_id: zona ? zona.zona_id : null });
  const usados = elegir(encontrados, corto(cultivo.nombre), pregunta);

  // Lo que la persona contó (no es medición): solo para personalizar la entrada.
  usoLstm = 0;
  const lugar = perfil.lugar && typeof perfil.lugar === 'object' ? perfil.lugar : null;
  const coords = lugar && Number.isFinite(Number(lugar.lat)) && Number.isFinite(Number(lugar.lon))
    ? ` (${Number(lugar.lat).toFixed(4)}, ${Number(lugar.lon).toFixed(4)})` : '';
  const nombreLugar = lugar && typeof lugar.nombre === 'string' ? `${lugar.nombre.slice(0, 80)}${coords}` : '';
  const v = { '<CULTIVO>': corto(cultivo.nombre), '<LUGAR>': nombreLugar, '<NOTA>': CONDICION[perfil.condicion] };
  const partes = [!nombreLugar ? R('intro_simple', v) : CONDICION[perfil.condicion] ? R('intro_nota', v) : R('intro', v)];

  const q = norm(pregunta);
  if (!zona && /siembr|sembr|cosech|fertiliz|abon|fecha|cuando|suelo|tierra|lluvi|humed/.test(q)) partes.push(R('fuera_zona'));
  if (!usados.length) {
    partes.push(R('no_dato'));
    return { respuesta: partes.join(' '), fuentes: [PARCELA, ...(usoLstm ? [REDACTOR] : [])], fragmentos: [] };
  }
  for (const f of usados) { const s = frase(f); if (s) partes.push(s); }

  const alterno = ESTRATEGIA[perfil.estrategia];
  partes.push(alterno && usados.some((f) => f.datos && corto(f.datos.cultivo) === alterno)
    ? R('cierre_alterno', { '<ALTERNO>': alterno }) : R('cierre'));
  return {
    respuesta: partes.join(' '),
    fuentes: [PARCELA, ...new Set(usados.map((f) => f.fuente)), ...(usoLstm ? [REDACTOR] : [])],
    fragmentos: usados.map((f) => f.id)
  };
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
    res.status(200).json(responder(perfil || {}, pregunta.slice(0, 1000)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ respuesta: 'Error interno del servidor.', fuentes: [] });
  }
};
