// Función serverless de Vercel: POST /api/chat — el chat RAG de Milpa Clara, sin servicios externos.
//   1. Recuperación: api/_recuperar.js busca en data/processed/*.json los fragmentos más
//      parecidos a la pregunta (incluido lo que predijo el modelo que entrenó el equipo).
//   2. Respuesta: la LSTM de texto del equipo (api/_lstm_texto.js) escribe cada frase en el tono de
//      Amealquito con marcas; aquí se llenan con los datos de los fragmentos. Si no hay dato, se dice.
// No necesita llaves ni internet: corre igual en Vercel y en servidor-local.js.

const fs = require('node:fs');
const path = require('node:path');
const { recuperar, celdaClima } = require('./_recuperar.js');
const { redactar } = require('./_lstm_texto.js');

const RAIZ_DATOS = path.join(__dirname, '..', 'data', 'processed');
const PARCELA = 'Datos de tu parcela';
const REDACTOR = 'Redactado por la inteligencia artificial del equipo';
const cargarJson = (n) => JSON.parse(fs.readFileSync(path.join(RAIZ_DATOS, n), 'utf8'));

const CONDICION = { falta_agua: 'la tierra se te seca muy rápido', tierra_cansada: 'la tierra está cansada y rinde menos', plagas_clima: 'ves más plagas o lluvias disparejas' };
const ESTRATEGIA = { leguminosa: 'frijol', calabaza: 'calabaza' };
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
// "100 %" se explica una vez dentro del paréntesis de la frase, sin abrir otro.
const conEscala = (t) => (/\)\.$/.test(t) ? t.replace(/\)\.$/, '; 100 % es tierra llena de agua).') : t.replace(/\.$/, ' (100 % es tierra llena de agua).'));
const pct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)} %` : v);
const conArticulo = (c) => (c === 'avena' || c === 'calabaza' ? `la ${c}` : `el ${c}`);
let zonaActual = null;   // zona de la persona en esta respuesta (la fija responder)
const enTuZona = (t) => (/^En el municipio,/.test(t) ? t.replace(/^En el municipio,/, 'En tu zona,') : `En tu zona, ${t.charAt(0).toLowerCase()}${t.slice(1)}`);

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
      let s = R('agua', { '<EL_CULTIVO>': conArticulo(corto(d.cultivo)), '<MM>': d.agua_ciclo_mm, '<DIAS>': d.ciclo_dias, '<M3>': '§' })
        .replace(/(,\s*o sea\s*|;\s*son\s*|,\s*unos\s*|\s*\()§ m³ por hectárea\)?/, '')
        .replace(/(\d[\d,]*) mm de agua/, '$1 litros de agua por metro cuadrado').replace(/(\d[\d,]*) mm\b/, '$1 litros de agua por metro cuadrado');
      if (zonaActual === 'z1' && d.anios_con_falta_agua_mas_15pct) s += ` ${enTuZona(R('falta_agua', { '<X>': d.anios_con_falta_agua_mas_15pct.split(' (')[0] }))}`;
      else s += ' Se calculó con el clima de El Llano (Querétaro); en tu lugar puede variar un poco.';
      return s;
    }
    case 'cosechas': {
      if (!Array.isArray(d.anios_malos_2003_2025)) return `De ${conArticulo(corto(d.cultivo))} no tengo años malos ni lo que deja: ${d.nota || 'no hay registros de su cosecha.'}`;
      const c = corto(d.cultivo), malos = d.anios_malos_2003_2025;
      let s = enTuZona(R('cosechas', { '<EL_CULTIVO>': conArticulo(c), '<N>': malos.length, '<LISTA>': malos.join(', ') }));
      const p = d.rendimiento_en_los_anios_malos_del_maiz_pct_de_lo_normal;
      if (typeof p === 'number') s += ' ' + (c === 'maíz' ? R('rend_propio', { '<P>': p }) : R('rend_otro', { '<EL_CULTIVO>': conArticulo(c), '<P>': p }));
      if (typeof d.ingreso_bruto_ha_anio_normal_mxn === 'number') s += ' ' + R('ingreso', { '<DINERO>': `$${miles(d.ingreso_bruto_ha_anio_normal_mxn)}` });
      if (d.aviso) s += ` Ojo: ${d.aviso}`;
      return s;
    }
    case 'sin_registro': return `${R('sin_registro', { '<CULTIVO>': d.cultivo })} ${String(d.nota).replace(/en Amealco/gi, 'en tu zona').replace(/\s*\(SIAP\)/g, '').replace(/(\d) ha\b/g, '$1 hectáreas')}`;
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
      return typeof m === 'number' ? `Comparamos la inteligencia artificial que entrenamos contra el promedio de años pasados: de 2021 a 2025 ${m > 0 ? 'le ganó un poco' : 'no le ganó'}.` : R('metodo');
    }
    case 'modelo': {
      // La frase de la LSTM dice "se equivocó menos que el promedio": solo se usa si es verdad en esta zona.
      const partesM = [`Nuestra inteligencia artificial, que mira el campo desde el satélite, ve que en ${d.anio} el campo de tu zona está ${d.prediccion}.`];
      const prueba = /(\d+) de (\d+) años/.exec(d.confianza_en_palabras || '');
      if (prueba) partesM.push(`La probamos ${prueba[2]} años y acertó mejor que el promedio en ${prueba[1]}.`);
      if (/no lo usan/.test(d.advertencia || '')) partesM.push('Por eso tus fechas no dependen de ella.');
      return partesM.join(' ');
    }
    case 'rotacion': {
      const C = Object.fromEntries((d.cultivos || []).map((c) => [c.cultivo, c]));
      const linea = (c) => c ? `unos ${c.agua_ciclo_mm} litros de agua por metro cuadrado en unos ${Math.round(c.ciclo_dias / 30)} meses, le faltó agua en ${c.falta_agua || 'sin dato'} años y ${typeof c.ingreso === 'number' ? `deja unos $${miles(c.ingreso)} por hectárea en un año normal` : 'de su cosecha no hay registros, así que no sé cuánto deja'}` : 'sin dato';
      const partes = ['Te comparo tres caminos con lo que pasó en tu zona de 2003 a 2025:',
        `1) Seguir con maíz, lo de hoy: ${linea(C.maiz)}.`,
        `2) Alternar con frijol: ${linea(C.frijol)}; usa menos agua y, como leguminosa, ayuda a devolverle nitrógeno a la tierra, pero deja menos dinero.`,
        `3) Sembrar calabaza con el maíz (milpa): ${linea(C.calabaza)}; en la milpa sus hojas cubren la tierra y ayudan a guardar la humedad.`,
        'Lo que no tengo: costos de producción, dosis de abono, precio en tu mercado y plagas de tu parcela; eso hay que revisarlo con un técnico o con quien te compra.'];
      return partes.join(' ');
    }
    case 'rotacion_general': {
      const C = Object.fromEntries((d.cultivos || []).map((c) => [c.cultivo, c]));
      const meses = (dd) => (typeof dd === 'number' ? `unos ${Math.round(dd / 30)} meses` : 'todavía no lo sé');
      return ['Te comparo tres caminos:',
        `1) Seguir con maíz, lo de hoy: es el que más agua pide y tarda ${meses(C.maiz && C.maiz.ciclo_dias)}.`,
        `2) Alternar con frijol: pide como dos terceras partes del agua del maíz, tarda ${meses(C.frijol && C.frijol.ciclo_dias)} y le devuelve a la tierra parte del abono.`,
        `3) Sembrar calabaza con el maíz (milpa): tarda ${meses(C.calabaza && C.calabaza.ciclo_dias)} y sus hojas cubren la tierra y ayudan a que no se seque.`,
        'Para tu zona todavía no tengo registros de cosecha ni de precios, así que no sé cuál deja más. Revísalo con un técnico o con quien te compra.'].join(' ');
    }
    case 'clima': {
      const h = d.humedad_raiz || {}, l = d.lluvia_temporada || {}, he = d.heladas || {};
      const partes = [];
      if (h.estado) partes.push(conEscala(R('humedad', { '<ESTADO>': h.estado, '<MES>': h.mes, '<VALOR>': pct(h.valor), '<NORMAL>': pct(h.normal) })));
      if (typeof l.mm === 'number') partes.push((l.tramo ? R('lluvia_temporada', { '<LLUVIA>': l.mm, '<NORMAL>': l.normal_mm }).replace(/(\d[\d,]*) mm/g, '$1 litros por metro cuadrado').replace(/\.$/, ` (cuenta ${l.tramo}).`) : R('lluvia_temporada', { '<LLUVIA>': l.mm, '<NORMAL>': l.normal_mm }).replace(/(\d[\d,]*) mm/g, '$1 litros por metro cuadrado')));
      if (typeof he.dias_por_anio === 'number' && he.meses && he.meses.length) partes.push(R('heladas', { '<DIAS>': he.dias_por_anio, '<MESES>': he.meses.join(', ') }));
      return partes.join(' ') || null;
    }
    case 'suelo_hoy': {
      const h = d.humedad_raiz_hoy, p = d.pronostico, f = new Date(`${d.ultimo_dia_con_dato}T12:00:00`);
      const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const cuando = `${f.getDate() <= 10 ? 'principios' : f.getDate() <= 20 ? 'mediados' : 'finales'} de ${MES[f.getMonth()]}`;
      let s = conEscala(R('humedad', { '<ESTADO>': h.estado, '<MES>': cuando, '<VALOR>': pct(h.valor), '<NORMAL>': pct(h.normal) }));
      const quien = /^LSTM/.test(p.modelo_usado || '') ? 'la red neuronal que entrenamos' : 'el modelo que mejor acertó en tu zona';
      s += ` Para los próximos ${p.dias} días se espera ${p.estado} que lo normal (${pct(p.valor)} contra ${pct(p.normal)}); el pronóstico lo da ${quien}.`;
      if (d.confianza_en_palabras) s += ` ${d.confianza_en_palabras.replace('el modelo', 'nuestra red neuronal')}`;
      return s;
    }
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
  const pideCaminos = /rotac|rotar|alternar|conviene|camino|estrategia|que siembro|cambiar de cultivo/.test(q);
  if (pideCaminos && lista.some((f) => /^rotacion/.test(tipo(f)))) return lista.filter((f) => /^rotacion/.test(tipo(f)));
  lista = lista.filter((f) => !/^rotacion/.test(tipo(f)));
  if (/confi|segur|salen|de donde/.test(q)) {
    const peso = (f) => ({ metodo: 0, prueba_ia: 1, modelo: 2, clima: 5 }[tipo(f)] ?? (f.id.endsWith(':siembra') && cultivoDe(f) === norm(cultivoCorto) ? 3 : 9));
    const base = fragmentos.filter((f) => ['metodo', 'prueba_ia'].includes(tipo(f)));
    return [...new Set([...base, ...lista])].sort((a, b) => peso(a) - peso(b)).filter((f) => peso(f) < 9).slice(0, 4);
  }
  if (lista.length && tipo(lista[0]) === 'fecha') {
    // Sin pedir varios cultivos, solo las fechas de SU cultivo (o del que mencione): nunca las de otro como si fueran suyas.
    return (pideVarios ? fragmentos : lista).filter((f) => tipo(f) === 'fecha' && (pideVarios || cultivoDe(f) === norm(cultivoCorto) || mencionado(f)))
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
    return { respuesta: `No tengo datos para ese cultivo. Por ahora solo tengo ${cultivos.map((c) => corto(c.nombre)).join(', ')}.`, fuentes: [], fragmentos: [] };
  }
  const zona = (cargarJson('zonas.json').datos || []).find((z) => z.zona_id === perfil.zona_id) || null;
  zonaActual = zona ? zona.zona_id : null;
  const lugarP = perfil.lugar && typeof perfil.lugar === 'object' ? perfil.lugar : {};
  const celda = zona ? null : celdaClima(Number(lugarP.lat), Number(lugarP.lon));
  const extras = celda ? [{ id: 'clima:celda', fuente: 'Humedad del suelo y lluvia de tu lugar (NASA POWER)',
    texto: 'humedad humeda humedo seca seco tierra abajo raices raiz suelo mojada agua guardada estado del suelo como esta la tierra lluvia temporada cuanto ha llovido heladas helada frio clima',
    datos: celda }] : [];
  const encontrados = recuperar(pregunta, { cultivo: cultivo.cultivo, zona_id: zona ? zona.zona_id : null }, 8, extras);
  // Sin zona con modelo y pregunta de fechas: lo útil que sí hay es la humedad y la lluvia de su celda.
  if (celda && /cuando|fecha/.test(norm(pregunta)) && !encontrados.some((f) => f.id === 'clima:celda')) {
    encontrados.unshift({ ...extras[0], puntaje: Infinity });
  }
  const usados = elegir(encontrados, corto(cultivo.nombre), pregunta);

  // Lo que la persona contó (no es medición): solo para personalizar la entrada.
  usoLstm = 0;
  const lugar = perfil.lugar && typeof perfil.lugar === 'object' ? perfil.lugar : null;
  const coords = lugar && Number.isFinite(Number(lugar.lat)) && Number.isFinite(Number(lugar.lon))
    ? ` (${Number(lugar.lat).toFixed(4)}, ${Number(lugar.lon).toFixed(4)})` : '';
  const nombreLugar = lugar && typeof lugar.nombre === 'string' ? lugar.nombre.slice(0, 80) : '';
  const v = { '<CULTIVO>': corto(cultivo.nombre), '<LUGAR>': nombreLugar, '<NOTA>': CONDICION[perfil.condicion] };
  const partes = [!nombreLugar ? R('intro_simple', v) : CONDICION[perfil.condicion] ? R('intro_nota', v) : R('intro', v)];

  const q = norm(pregunta);
  if (!zona && celda && /cuando|fecha/.test(q)) {
    partes.push('Para tu lugar todavía no tengo fechas de siembra ni el pronóstico del equipo, pero sí la humedad y la lluvia que mide la NASA.');
  } else if (!zona && !celda && /siembr|sembr|cosech|fertiliz|abon|fecha|cuando|suelo|tierra|lluvi|humed/.test(q)) partes.push(R('fuera_zona'));
  // Si pregunta por fechas y su cultivo o su zona no las tiene, se dice (no se usan las de otro cultivo ni otra zona).
  if (zonaActual !== 'z1' && /(^|[^a-z])(mal|malos|perdi|perdida|perdidas|cosechas)([^a-z]|$)/.test(q) && !/cuando|fecha/.test(q)) {
    partes.push('Para tu zona todavía no tengo registros de cosecha, así que no sé qué años le fue mal a tu cultivo. Pregúntale a tus vecinos o al comisariado: ellos se acuerdan de los años malos.');
    partes.push(R('cierre'));
    return { respuesta: partes.join(' '), fuentes: [PARCELA, ...(usoLstm ? [REDACTOR] : [])], fragmentos: [] };
  }
  let avisoFechas = false;
  if (zona && /cuando|fecha/.test(q) && !usados.some((f) => f.id.startsWith('fecha:'))) {
    const conFechas = (cargarJson('calendario.json').datos || []).some((r) => r.zona_id === zona.zona_id && r.fecha_recomendada);
    partes.push(conFechas ? `Para ${conArticulo(corto(cultivo.nombre))} todavía no tengo fechas en tu zona.`
      : `Para la zona ${zona.nombre} todavía no tengo fechas de siembra ni de cosecha.`);
    if (cultivo.inicio_referencia_razon && (zona.zona_id === 'z1' || !/El Llano|\d+ mm/.test(cultivo.inicio_referencia_razon))) partes.push(cultivo.inicio_referencia_razon);
    avisoFechas = true;
  }
  if (!usados.length) {
    partes.push(avisoFechas ? R('cierre') : R('no_dato'));
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
