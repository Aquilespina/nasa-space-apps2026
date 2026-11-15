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
  agua: ['riego', 'lluvia', 'mm', 'sequia'], regar: ['riego', 'agua'], llueve: ['lluvia'], lluvias: ['lluvia'], seca: ['falta', 'agua'],
  sembrar: ['siembra'], siembro: ['siembra'], cuando: ['fecha'], fecha: ['siembra', 'ventana'], fechas: ['siembra', 'cosecha', 'fertilizacion', 'ventana'],
  cosechar: ['cosecha'], levantar: ['cosecha'], fertilizar: ['fertilizacion', 'abono'], abono: ['fertilizacion'], abonar: ['fertilizacion'],
  confiar: ['confianza', 'inteligencia', 'promedio', 'metodo'], seguro: ['confianza'], segura: ['confianza'], salen: ['metodo', 'calculo'],
  mal: ['malos', 'rendimiento', 'perdida'], riesgo: ['malos', 'falta'], perder: ['malos', 'perdida'],
  suelo: ['tierra', 'arcilla', 'carbono'], tierra: ['suelo', 'arcilla'], verde: ['verdor'], vegetacion: ['verdor'], satelite: ['verdor', 'lluvia'],
  ganar: ['ingreso', 'precio'], dinero: ['ingreso', 'precio'], vender: ['precio'], precio: ['ingreso'], inversion: ['ingreso'],
  alternar: ['frijol', 'avena'], rotar: ['frijol', 'avena'], cambiar: ['frijol', 'avena', 'aviso'], ia: ['inteligencia'], red: ['inteligencia']
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
      id: `cosechas:${c.cultivo}`, cultivo: c.cultivo, fuente: 'Cosechas del municipio (SIAP)',
      texto: `${c.nombre} ${c.cultivo} anios malos perdida rendimiento ${(c.anios_malos_2003_2025 || []).join(' ')} ingreso ganancia dinero precio venta por hectarea superficie sembrada amealco ${c.aviso || ''}`,
      datos: { cultivo: c.nombre, anios_malos_2003_2025: c.anios_malos_2003_2025,
        rendimiento_en_los_anios_malos_del_maiz_pct_de_lo_normal: c.rendimiento_en_anios_malos_maiz_pct_de_lo_normal,
        ingreso_bruto_ha_anio_normal_mxn: c.ingreso_bruto_ha_anio_normal_mxn, precio_medio_rural_mxn_t: c.precio_medio_rural_mxn_t,
        superficie_amealco_ha: c.superficie_amealco_ha, aviso: c.aviso || null, fertilizacion: c.fertilizacion,
        nota: 'Datos del municipio de Amealco (SIAP 2003-2025), no de una parcela. Ingreso bruto: sin costos.' }
    });
  }
  for (const s of cultivos.sin_registro || []) {
    F.push({ id: `sin_registro:${s.cultivo}`, cultivo: s.cultivo, fuente: 'Cosechas del municipio (SIAP)',
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
  for (const z of zonas.datos || []) {
    F.push({ id: `metodo:${z.zona_id}`, zona_id: z.zona_id, fuente: 'Lluvia medida por satélites de la NASA',
      texto: 'de donde salen las fechas metodo calculo confiar confianza calendario lluvias de anios pasados baseline sin inteligencia artificial',
      datos: { generado_por: calendario.generado_por, como_se_calculo: calendario.fuente, consultado: calendario.fecha_consulta } });
  }

  // El suelo es de un punto: se asigna a la zona que está en ese punto (menos de ~1 km).
  const suelo = cultivos.suelo_zona;
  if (suelo && suelo.punto) {
    const z = (zonas.datos || []).find((x) => Math.abs(x.lat - suelo.punto.lat) < 0.01 && Math.abs(x.lon - suelo.punto.lon) < 0.01);
    if (z) {
      F.push({ id: `suelo:${z.zona_id}`, zona_id: z.zona_id, fuente: 'Suelo de tu zona (SoilGrids)',
        texto: 'suelo tierra arcilla arena ph acidez carbono organico materia agua que guarda humedad disponible retiene',
        datos: suelo });
    }
  }

  try {
    const serie = leer('serie_regional.json');
    const filas = (serie.datos || []).filter((r) => typeof r.anomalia_ndvi_pico === 'number');
    const signo = (v) => (v > 0 ? 'más verde que lo normal' : v < 0 ? 'menos verde que lo normal' : 'igual que lo normal');
    F.push({ id: 'verdor', fuente: 'Verdor del campo (satélite MODIS)',
      texto: 'verdor verde vegetacion campo satelite modis region anio este anio como va la temporada sequia 2023',
      datos: { alcance: 'Toda la región, no una parcela. Mide verdor de la vegetación, no humedad ni temperatura.',
        ultimos_anios: filas.slice(-6).map((r) => ({ anio: r.anio, verdor: signo(r.anomalia_ndvi_pico), anio_malo_maiz_siap: r.anio_malo_siap })),
        fuente: serie.fuente } });
  } catch (e) { /* sin serie: no hay fragmento de verdor */ }

  try {
    const m = leer('modelos_comparacion.json');
    const fila = (m.datos || []).find((d) => d.modelo === m.red_del_sitio);
    F.push({ id: 'prueba_ia', fuente: 'Prueba de la inteligencia artificial',
      texto: 'confiar confianza inteligencia artificial red neuronal modelo prediccion promedio de anios pasados mejor peor prueba metodo de donde salen',
      datos: { que_se_probo: 'Si una red neuronal predecía el verdor del campo mejor que el promedio de años pasados.',
        mejor_modelo: m.mejor_modelo, red_neuronal: m.red_del_sitio,
        mejora_de_la_red_sobre_el_promedio_en_prueba: fila ? fila.test_skill_vs_climatologia : null,
        mejora_por_anio: (m.skill_por_anio_prueba || {})[m.red_del_sitio] || null,
        como_leer: 'Mejora > 0 = mejor que el promedio de años pasados; < 0 = peor.',
        consecuencia: 'Las fechas NO usan la red neuronal; salen de las lluvias de años pasados.' } });
  } catch (e) { /* sin comparación: no hay fragmento */ }

  // Lo que predijo el modelo que entrenó el equipo (LSTM) para 2026, en los terrenos agrícolas
  // dentro de cada zona. Se resume aquí; no se corre el modelo en vivo.
  try {
    const e = leer('estres_mapa.json');
    const d = e.datos || {};
    const km = (a, b, c, dd) => { const R = 6371, r = (x) => x * Math.PI / 180; const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(dd - b) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    for (const z of zonas.datos || []) {
      if (typeof z.radio_cobertura_km !== 'number' || !Array.isArray(d.lat)) continue;
      const I = d.lat.map((_, i) => i).filter((i) => km(z.lat, z.lon, d.lat[i], d.lon[i]) <= z.radio_cobertura_km);
      if (!I.length) continue;
      const prom = (a) => I.reduce((s, i) => s + a[i], 0) / I.length;
      const error = (a) => Math.sqrt(I.reduce((s, i) => s + (a[i] - d.obs[i]) ** 2, 0) / I.length);
      const pct = (f) => Math.round(100 * I.filter(f).length / I.length);
      const pred = prom(d.pred), clim = prom(d.clim);
      F.push({ id: `modelo:${z.zona_id}`, zona_id: z.zona_id, fuente: 'Modelo que entrenamos (LSTM)',
        texto: 'modelo que entrenamos red neuronal lstm inteligencia artificial prediccion predijo pronostico este anio temporada 2026 verdor verde campo estres sequia como viene como va',
        datos: {
          anio: e.anio, terrenos_agricolas: I.length,
          prediccion: pred < clim ? 'un poco menos verde que lo normal' : pred > clim ? 'un poco más verde que lo normal' : 'igual que lo normal',
          verdor_predicho: +pred.toFixed(3), verdor_normal: +clim.toFixed(3), verdor_que_hubo: +prom(d.obs).toFixed(3),
          pct_terrenos_predichos_bajo_lo_normal: pct((i) => d.pred[i] < d.clim[i]),
          error_del_modelo: +error(d.pred).toFixed(3), error_si_solo_se_usa_el_promedio: +error(d.clim).toFixed(3),
          pct_terrenos_dentro_de_su_margen: pct((i) => Math.abs(d.pred[i] - d.obs[i]) <= d.banda[i]),
          que_mide: 'Verdor del campo de 0 a 1 (satélite MODIS), del 28 de julio al 15 de octubre, predicho con datos hasta el 27 de julio.',
          advertencia: 'En la prueba de 2021 a 2025 el modelo no le ganó al promedio de años pasados y falló en la sequía de 2023; por eso las fechas no lo usan.',
          fuente: e.fuente
        } });
    }
  } catch (err) { /* sin predicción del modelo: no hay fragmento */ }

  for (const f of F) {
    const ts = palabras(`${f.texto} ${JSON.stringify(f.datos)}`).map(raiz);
    f.tf = ts.reduce((o, t) => ((o[t] = (o[t] || 0) + 1), o), {});
    f.largo = ts.length;
  }
  return F;
}

let FRAGMENTOS = null;

// Devuelve hasta k fragmentos para la pregunta. Los de zona solo si la persona está en esa zona.
function recuperar(pregunta, perfil, k = 8) {
  FRAGMENTOS = FRAGMENTOS || construirFragmentos();
  const zona = perfil && perfil.zona_id;
  const cand = FRAGMENTOS.filter((f) => !f.zona_id || f.zona_id === zona);
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

module.exports = { recuperar };
