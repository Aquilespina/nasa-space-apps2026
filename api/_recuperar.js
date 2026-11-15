// Recuperación del RAG: convierte data/processed/*.json en fragmentos de texto y, para cada
// pregunta, devuelve los más parecidos (BM25 + sinónimos de campo). No usa servicios externos:
// corre igual en la función de Vercel y en servidor-local.js. El "_" evita que Vercel lo publique
// como ruta. Solo se indexa data/processed (regla 1 de CLAUDE.md: ningún número sale de otro lado).
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..', 'data', 'processed');
const leer = (n) => JSON.parse(fs.readFileSync(path.join(RAIZ, n), 'utf8'));

const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const VACIAS = new Set(('el la los las un una unos unas de del al a y o u en con por para que se mi mis tu tus su sus es son ' +
  'me lo le les como cual cuales cuanto cuanta cuantos cuantas donde mas muy ya hay este esta esto eso esa ese ' +
  'pero sin sobre entre yo te nos fue ser estar tiene tengo puedo debo dame dime quiero saber').split(' '));
// Palabras de campo -> palabras que aparecen en los fragmentos.
const SINONIMOS = {
  agua: ['riego', 'lluvia', 'mm', 'sequia'], llueve: ['lluvia'], lluvias: ['lluvia'],
  sembrar: ['siembra'], siembro: ['siembra'], cuando: ['fecha'], fecha: ['siembra', 'ventana'], fechas: ['siembra', 'cosecha', 'fertilizacion', 'ventana'],
  cosechar: ['cosecha'], levantar: ['cosecha'], fertilizar: ['fertilizacion', 'abono'], abono: ['fertilizacion'], abonar: ['fertilizacion'],
  confiar: ['confianza', 'inteligencia', 'promedio', 'metodo'], seguro: ['confianza'], segura: ['confianza'], salen: ['metodo', 'calculo'],
  mal: ['malos', 'rendimiento', 'perdida'], riesgo: ['malos', 'falta'], perder: ['malos', 'perdida'],
  suelo: ['tierra', 'arcilla', 'carbono'], tierra: ['suelo', 'arcilla'], verde: ['verdor'], vegetacion: ['verdor'], satelite: ['verdor', 'lluvia'],
  ganar: ['ingreso', 'precio'], dinero: ['ingreso', 'precio'], vender: ['precio'], precio: ['ingreso'], inversion: ['ingreso'],
  humedad: ['humeda', 'seca', 'raices'], humeda: ['humedad'], mojada: ['humedad'], seca: ['humedad', 'falta', 'agua'], regar: ['riego', 'agua', 'humedad'],
  alternar: ['frijol', 'calabaza', 'rotacion'], rotar: ['frijol', 'calabaza', 'rotacion'], milpa: ['calabaza', 'rotacion'], rotacion: ['rotar', 'alternar'], cambiar: ['frijol', 'calabaza', 'aviso'], ia: ['inteligencia'], red: ['inteligencia']
};
const raiz = (t) => (t.length > 5 ? t.slice(0, 5) : t);
const palabras = (s) => norm(s).split(/[^a-z0-9ñ]+/).filter((t) => t.length > 1 && !VACIAS.has(t));
const consulta = (s) => { const ts = palabras(s); return ts.concat(...ts.map((t) => SINONIMOS[t] || [])).map(raiz); };

function fechaTexto(iso) {
  if (!iso) return 'sin dato';
  const M = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${M[m - 1]} de ${a}`;
}
const sd = (v) => (v == null ? 'sin dato' : v);

function construirFragmentos() {
  const F = [];
  const cultivos = leer('cultivos.json');
  const zonas = leer('zonas.json');
  const calendario = leer('calendario.json');
  const nombre = {};
  for (const c of cultivos.datos || []) nombre[c.cultivo] = c.nombre || c.cultivo;

  for (const c of cultivos.datos || []) {
    F.push({
      id: `agua:${c.cultivo}`, cultivo: c.cultivo, fuente: 'Agua que necesita cada cultivo',
      texto: `${c.nombre} ${c.cultivo} agua del ciclo ${c.agua_ciclo_mm} mm ${c.agua_ciclo_m3_ha} m3 por hectarea ciclo de ${c.ciclo_dias} dias riego lluvia sequia falta de agua ${c.anios_con_falta_agua_mas_15pct} inicio de referencia ${c.inicio_referencia} siembra`,
      datos: { cultivo: c.nombre, ciclo_dias: c.ciclo_dias, agua_ciclo_mm: c.agua_ciclo_mm, agua_ciclo_m3_ha: c.agua_ciclo_m3_ha,
        anios_con_falta_agua_mas_15pct: c.anios_con_falta_agua_mas_15pct, inicio_referencia_mes_dia: c.inicio_referencia,
        inicio_referencia_razon: c.inicio_referencia_razon || null, fuente: c.fuente }
    });
    F.push({
      id: `cosechas:${c.cultivo}`, zona_id: 'z1', cultivo: c.cultivo, fuente: 'Registros de cosecha del gobierno',
      texto: `${c.nombre} ${c.cultivo} anios malos perdida rendimiento ${(c.anios_malos_2003_2025 || []).join(' ')} ingreso ganancia dinero precio venta por hectarea superficie sembrada amealco ${c.aviso || ''}`,
      datos: { cultivo: c.nombre, anios_malos_2003_2025: c.anios_malos_2003_2025,
        rendimiento_en_los_anios_malos_del_maiz_pct_de_lo_normal: c.rendimiento_en_anios_malos_maiz_pct_de_lo_normal,
        ingreso_bruto_ha_anio_normal_mxn: c.ingreso_bruto_ha_anio_normal_mxn, precio_medio_rural_mxn_t: c.precio_medio_rural_mxn_t,
        superficie_amealco_ha: c.superficie_amealco_ha, aviso: c.aviso || null, fertilizacion: c.fertilizacion,
        nota: c.nota || 'Registros de cosecha del municipio de 2003 a 2025, no de una parcela. Lo que deja es sin contar gastos.' }
    });
  }
  // Comparación de rotaciones (lo central del reto): seguir igual vs. alternar con frijol vs. sembrar calabaza con el maíz (milpa).
  F.push({ id: 'rotacion', zona_id: 'z1', fuente: 'Comparación de cultivos',
    texto: 'rotacion rotar alternar estrategia estrategias opciones comparar comparacion cambiar de cultivo cuidar el suelo mejorar la tierra ahorrar agua gastar menos agua cobertura leguminosa nitrogeno abono que me conviene que siembro despues',
    datos: { cultivos: (cultivos.datos || []).map((c) => ({ cultivo: c.cultivo, nombre: c.nombre, agua_ciclo_mm: c.agua_ciclo_mm, ciclo_dias: c.ciclo_dias,
      falta_agua: c.anios_con_falta_agua_mas_15pct ? c.anios_con_falta_agua_mas_15pct.split(' (')[0] : null,
      anios_malos: Array.isArray(c.anios_malos_2003_2025) ? c.anios_malos_2003_2025.length : null,
      ingreso: c.ingreso_bruto_ha_anio_normal_mxn, aviso: c.aviso || null })) } });

  F.push({ id: 'rotacion_general', zona_id: '__fuera_de_el_llano__', fuente: 'Comparación de cultivos',
    texto: 'rotacion rotar alternar estrategia estrategias opciones comparar comparacion cambiar de cultivo cuidar el suelo mejorar la tierra ahorrar agua gastar menos agua leguminosa nitrogeno abono milpa calabaza frijol que me conviene que siembro despues',
    datos: { cultivos: (cultivos.datos || []).map((c) => ({ cultivo: c.cultivo, ciclo_dias: c.ciclo_dias, agua_ciclo_mm: c.agua_ciclo_mm })) } });

  for (const s of cultivos.sin_registro || []) {
    F.push({ id: `sin_registro:${s.cultivo}`, zona_id: 'z1', cultivo: s.cultivo, fuente: 'Registros de cosecha del gobierno',
      texto: `${s.cultivo} sin registro sin dato ${s.nota}`, datos: s });
  }

  for (const z of zonas.datos || []) {
    F.push({ id: `zona:${z.zona_id}`, zona_id: z.zona_id, fuente: 'Lluvia medida por satélites de la NASA',
      texto: `zona ${z.nombre} cobertura radio ${z.radio_cobertura_km} km punto lluvia temperatura clima nasa power ${z.nota}`,
      datos: { zona: z.nombre, lat: z.lat, lon: z.lon, radio_cobertura_km: z.radio_cobertura_km, nota: z.nota, radio_cobertura_razon: z.radio_cobertura_razon } });
  }

  for (const r of calendario.datos || []) {
    F.push({
      id: `fecha:${r.zona_id}:${r.cultivo}:${r.actividad}`, zona_id: r.zona_id, cultivo: r.cultivo, fuente: 'Lluvia medida por satélites de la NASA',
      texto: `${nombre[r.cultivo] || r.cultivo} ${r.cultivo} ${r.actividad} fecha cuando ${r.actividad === 'fertilizacion' ? 'abono fertilizar' : ''} ventana dias buenos confianza ${r.razon || 'sin dato'} calendario temporada 2027`,
      datos: { cultivo: nombre[r.cultivo] || r.cultivo, actividad: r.actividad, fecha_recomendada: fechaTexto(r.fecha_recomendada),
        ventana: r.ventana_inicio && r.ventana_fin ? `del ${fechaTexto(r.ventana_inicio)} al ${fechaTexto(r.ventana_fin)}` : 'sin dato',
        confianza: typeof r.confianza === 'number' ? `${Math.round(r.confianza * 100)} %` : 'sin dato', razon: sd(r.razon), fuente: sd(r.fuente) }
    });
  }
  for (const z of (zonas.datos || []).filter((x) => (calendario.datos || []).some((r) => r.zona_id === x.zona_id && r.fecha_recomendada))) {
    F.push({ id: `metodo:${z.zona_id}`, zona_id: z.zona_id, fuente: 'Lluvia medida por satélites de la NASA',
      texto: 'de donde salen las fechas metodo calculo confiar confianza calendario lluvias de anios pasados baseline sin inteligencia artificial',
      datos: { generado_por: calendario.generado_por, como_se_calculo: calendario.fuente, consultado: calendario.fecha_consulta } });
  }

  // El suelo es de un punto: se asigna a la zona que está en ese punto (menos de ~1 km).
  const suelo = cultivos.suelo_zona;
  if (suelo && suelo.punto) {
    const z = (zonas.datos || []).find((x) => Math.abs(x.lat - suelo.punto.lat) < 0.01 && Math.abs(x.lon - suelo.punto.lon) < 0.01);
    if (z) {
      F.push({ id: `suelo:${z.zona_id}`, zona_id: z.zona_id, fuente: 'Mapa de suelos de tu zona',
        texto: 'suelo tierra arcilla arena ph acidez carbono organico materia agua que guarda humedad disponible retiene',
        datos: suelo });
    }
  }

  try {
    const serie = leer('serie_regional.json');
    const filas = (serie.datos || []).filter((r) => typeof r.anomalia_ndvi_pico === 'number');
    const signo = (v) => (v > 0 ? 'más verde que lo normal' : v < 0 ? 'menos verde que lo normal' : 'igual que lo normal');
    F.push({ id: 'verdor', zona_id: 'z1', fuente: 'Verdor del campo (satélite de la NASA)',
      texto: 'verdor verde vegetacion campo satelite modis region anio este anio como va la temporada sequia 2023',
      datos: { alcance: 'Toda la región, no una parcela. Mide verdor de la vegetación, no humedad ni temperatura.',
        ultimos_anios: filas.slice(-6).map((r) => ({ anio: r.anio, verdor: signo(r.anomalia_ndvi_pico), anio_malo_maiz_siap: r.anio_malo_siap })),
        fuente: serie.fuente } });
  } catch (e) { /* sin serie: no hay fragmento de verdor */ }

  try {
    const m = leer('modelos_comparacion.json');
    const fila = (m.datos || []).find((d) => d.modelo === m.red_del_sitio);
    F.push({ id: 'prueba_ia', zona_id: 'z1', fuente: 'Prueba de la inteligencia artificial',
      texto: 'confiar confianza inteligencia artificial red neuronal modelo prediccion promedio de anios pasados mejor peor prueba metodo de donde salen',
      datos: { que_se_probo: 'Si una red neuronal predecía el verdor del campo mejor que el promedio de años pasados.',
        mejor_modelo: m.mejor_modelo, red_neuronal: m.red_del_sitio,
        mejora_de_la_red_sobre_el_promedio_en_prueba: fila ? fila.test_skill_vs_climatologia : null,
        mejora_por_anio: (m.skill_por_anio_prueba || {})[m.red_del_sitio] || null,
        como_leer: 'Mejora > 0 = mejor que el promedio de años pasados; < 0 = peor.',
        consecuencia: 'Las fechas NO usan la red neuronal; salen de las lluvias de años pasados.' } });
  } catch (e) { /* sin comparación: no hay fragmento */ }

  // Lo que predijeron los modelos que entrenó el equipo, por zona. Cada zona usa sus propios
  // resultados de colab/lstm_zona.ipynb (data/processed/zonas/<zona>/); si no tiene, los de Amealco.
  // Se resume aquí; no se corre el modelo en vivo.
  const km = (a, b, c, dd) => { const R = 6371, r = (x) => x * Math.PI / 180; const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(dd - b) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const leerSiHay = (ruta) => { try { return leer(ruta); } catch (e) { return null; } };
  for (const z of zonas.datos || []) {
    if (typeof z.radio_cobertura_km !== 'number') continue;
    const propio = leerSiHay(`zonas/${z.zona_id}/estres_mapa.json`);
    const e = propio || leerSiHay('estres_mapa.json');
    const comp = (propio ? leerSiHay(`zonas/${z.zona_id}/modelos_comparacion.json`) : leerSiHay('modelos_comparacion.json')) || {};
    const d = (e && e.datos) || {};
    if (!Array.isArray(d.lat)) continue;
    const I = d.lat.map((_, i) => i).filter((i) => d.pred[i] != null && d.obs[i] != null && d.clim[i] != null
      && km(z.lat, z.lon, d.lat[i], d.lon[i]) <= z.radio_cobertura_km);
    if (!I.length) continue;
    const prom = (a) => I.reduce((s, i) => s + a[i], 0) / I.length;
    const error = (a) => Math.sqrt(I.reduce((s, i) => s + (a[i] - d.obs[i]) ** 2, 0) / I.length);
    const pct = (f) => Math.round(100 * I.filter(f).length / I.length);
    const pred = prom(d.pred), clim = prom(d.clim), errM = error(d.pred), errC = error(d.clim);

    // Advertencia honesta según la comparación de ESA zona (regla 6)
    const red = comp.red_del_sitio || 'el modelo';
    const fila = (comp.datos || []).find((x) => x.modelo === red) || {};
    const skill = fila.test_skill_vs_climatologia;
    const porAnio = (comp.skill_por_anio_prueba || {})[red] || {};
    const peor = Object.entries(porAnio).sort((a, b) => a[1] - b[1])[0];
    let advertencia = typeof skill === 'number'
      ? (skill > 0 ? `En la prueba de 2021 a 2025 le ganó un poco al promedio de años pasados (resultado ${skill})`
        : `En la prueba de 2021 a 2025 no le ganó al promedio de años pasados (resultado ${skill})`)
      : 'No tengo su comparación contra el promedio de años pasados';
    if (peor && peor[1] < -0.3) advertencia += ` y falló en ${peor[0]}${peor[0] === '2023' ? ' (la sequía)' : ''}`;
    advertencia += '; por eso las fechas de siembra no lo usan.';

    F.push({ id: `modelo:${z.zona_id}`, zona_id: z.zona_id, fuente: 'Modelo que entrenamos',
      texto: 'modelo que entrenamos red neuronal lstm gru inteligencia artificial prediccion predijo pronostico este anio temporada 2026 verdor verde campo estres sequia como viene como va',
      datos: {
        red, anio: e.anio, terrenos_agricolas: I.length,
        prediccion: pred < clim ? 'un poco menos verde que lo normal' : pred > clim ? 'un poco más verde que lo normal' : 'igual que lo normal',
        verdor_predicho: +pred.toFixed(3), verdor_normal: +clim.toFixed(3), verdor_que_hubo: +prom(d.obs).toFixed(3),
        pct_terrenos_predichos_bajo_lo_normal: pct((i) => d.pred[i] < d.clim[i]),
        error_del_modelo: +errM.toFixed(3), error_si_solo_se_usa_el_promedio: +errC.toFixed(3),
        mejor_que_el_promedio_esta_temporada: errM < errC,
        pct_terrenos_dentro_de_su_margen: pct((i) => d.banda[i] != null && Math.abs(d.pred[i] - d.obs[i]) <= d.banda[i]),
        confianza_en_palabras: comp.confianza_en_palabras || null,
        que_mide: 'Verdor del campo de 0 a 1 (satélite MODIS), del 28 de julio al 15 de octubre, predicho con datos hasta el 27 de julio.',
        advertencia, fuente: e.fuente
      } });
  }

  // Humedad del suelo, lluvia de la temporada y heladas de NASA POWER por zona (pipeline/clima_power.py).
  // Solo para zonas sin pronóstico del suelo propio (esas ya traen su humedad de hoy).
  const conPronostico = new Set(((leerSiHay('suelo_zonas.json') || {}).datos || []).map((x) => x.zona_id));
  for (const c of ((leerSiHay('clima_zona.json') || {}).datos || [])) {
    if (!c.zona_id || conPronostico.has(c.zona_id)) continue;
    F.push({ id: `clima:${c.zona_id}`, zona_id: c.zona_id, fuente: 'Humedad del suelo y lluvia (NASA)',
      texto: 'humedad humeda humedo seca seco tierra abajo raices raiz suelo mojada agua guardada estado del suelo como esta la tierra lluvia temporada cuanto ha llovido heladas helada frio',
      datos: c });
  }

  // Estado del suelo (humedad en la zona de raíces) y su pronóstico a 14 días, por zona (colab/lstm_zona.ipynb, celda 1a)
  for (const s of ((leerSiHay('suelo_zonas.json') || {}).datos || [])) {
    if (!s.zona_id || !s.humedad_raiz_hoy || !s.pronostico) continue;
    F.push({ id: `suelo_hoy:${s.zona_id}`, zona_id: s.zona_id, fuente: 'Humedad del suelo (NASA) y pronóstico del equipo',
      texto: 'humedad humeda humedo seca seco tierra abajo raices raiz suelo mojada agua guardada estado del suelo como esta la tierra proximos dias pronostico regar riego sembrar ahorita ahora hoy',
      datos: s });
  }

  for (const f of F) {
    const ts = palabras(`${f.texto} ${JSON.stringify(f.datos)}`).map(raiz);
    f.tf = ts.reduce((o, t) => ((o[t] = (o[t] || 0) + 1), o), {});
    f.largo = ts.length;
  }
  return F;
}

let FRAGMENTOS = null;

// Devuelve hasta k fragmentos para la pregunta. Los de zona solo si la persona está en esa zona.
function conTf(f) {
  const ts = palabras(`${f.texto} ${JSON.stringify(f.datos)}`).map(raiz);
  f.tf = ts.reduce((o, t) => ((o[t] = (o[t] || 0) + 1), o), {});
  f.largo = ts.length;
  return f;
}

// Celda de NASA POWER (0.5° x 0.625°) que contiene el lugar: clima_mexico.json cubre todo México.
// Así cualquier lugar tiene la humedad del suelo, la lluvia y las heladas de su propia celda.
let CLIMA_MX = null;
function celdaClima(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  CLIMA_MX = CLIMA_MX || (() => { try { return leer('clima_mexico.json'); } catch (e) { return {}; } })();
  const col = (CLIMA_MX.columnas || []).reduce((o, c, i) => ((o[c] = i), o), {});
  const r = (CLIMA_MX.celdas || []).find((c) => Math.abs(c[col.lat] - lat) <= 0.25 && Math.abs(c[col.lon] - lon) <= 0.3125);
  if (!r) return null;
  const pc = r[col.percentil];
  return {
    celda: { lat: r[col.lat], lon: r[col.lon], tamano: 'unos 55 x 65 km' },
    humedad_raiz: { mes: CLIMA_MX.mes_humedad, valor: r[col.humedad], normal: r[col.humedad_normal],
      estado: pc <= 0.25 ? 'más seca' : pc >= 0.75 ? 'más húmeda' : 'igual de húmeda' },
    lluvia_temporada: { mm: r[col.lluvia_mm], normal_mm: r[col.lluvia_normal_mm], tramo: CLIMA_MX.lluvia_tramo },
    heladas: { dias_por_anio: r[col.dias_helada_anio], meses: r[col.meses_helada] ? r[col.meses_helada].split(', ') : [] },
  };
}

function recuperar(pregunta, perfil, k = 8, extras = []) {
  FRAGMENTOS = FRAGMENTOS || construirFragmentos();
  const zona = perfil && perfil.zona_id;
  const cand = FRAGMENTOS.filter((f) => !f.zona_id || f.zona_id === zona || (f.zona_id === '__fuera_de_el_llano__' && zona !== 'z1')).concat(extras.map(conTf));
  const q = consulta(pregunta);
  const N = cand.length;
  const prom = cand.reduce((s, f) => s + f.largo, 0) / (N || 1);
  const df = {};
  for (const t of new Set(q)) df[t] = cand.filter((f) => f.tf[t]).length;
  const mencionados = new Set(palabras(pregunta).filter((t) => cand.some((f) => f.cultivo === t)));

  const puntaje = (f) => {
    let s = 0;
    for (const t of q) {
      const tf = f.tf[t]; if (!tf) continue;
      const idf = Math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5));
      s += idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * f.largo / prom));
    }
    if (s > 0 && f.cultivo && (f.cultivo === (perfil && perfil.cultivo) || mencionados.has(f.cultivo))) s *= 1.6;
    if (s > 0 && f.cultivo && mencionados.size && !mencionados.has(f.cultivo) && f.cultivo !== (perfil && perfil.cultivo)) s *= 0.5;
    return s;
  };
  const res = cand.map((f) => ({ f, s: puntaje(f) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, k);

  return res.map(({ f, s }) => ({ id: f.id, fuente: f.fuente, datos: f.datos, puntaje: s }));
}

module.exports = { recuperar, celdaClima };
