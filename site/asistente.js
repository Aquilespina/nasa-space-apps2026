/* Asistente de 5 preguntas + "Tu plan".
   Lee data/cultivos.json, data/zonas.json, data/calendario.json e data/imagen_zona.json.
   Mismas reglas que recorrido.js y calculo.js: ningún número escrito a mano; si un campo falta
   o es null, se muestra "sin dato". La lógica de recorrido.js, calculo.js y evidencia.js no se toca:
   esos módulos se cargan tal cual dentro de "Tu plan". */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const SIN = '<span class="falta">sin dato</span>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fecha = iso => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} de ${MESES[m - 1]} de ${y}`;
  };
  const fechaCorta = iso => {
    if (!iso) return null;
    const [, m, d] = iso.split('-').map(Number);
    return `${d} de ${MESES[m - 1]}`;
  };
  const miles = n => Number(n).toLocaleString('es-MX');
  const cargar = n => fetch(`data/${n}.json`, { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error(`${n}.json: ${r.status}`);
    return r.json();
  });
  // Mismo texto amigable que recorrido.js (copiado para no tocar ese módulo).
  const sinJerga = s => (s || '')
    .replace(/NASA POWER PRECTOTCORR/g, 'satélites de la NASA que miden la lluvia')
    .replace(/\s*\(?FAO-56\)?/g, '');
  const razonAmigable = r => sinJerga(r).replace(/\+\s*ciclo de (\d+) días/, 'más $1 días de ciclo').replace(/\s{2,}/g, ' ').trim();

  // ---------- estado (se recuerda solo en este teléfono) ----------
  const CLAVE = 'milpaclara.respuestas.v2';
  // lugar = { nombre, detalle, lat, lon, origen: 'municipio' | 'gps' }
  let estado = { cultivo: null, lugar: null, anios: 10, prioridades: [], verReferencia: false };
  try { Object.assign(estado, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch (e) { /* sin almacenamiento */ }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } };

  let D = { cultivos: null, zonas: null, calendario: null, imagen: null, municipios: null };
  const corto = c => {
    const n = (c && c.nombre) || '';
    return n.split(/\s+/)[0] || (c && c.cultivo) || '';
  };
  const art = c => (/^avena/i.test(corto(c)) ? 'la' : 'el');
  const cultivoSel = () => (D.cultivos && D.cultivos.datos || []).find(c => c.cultivo === estado.cultivo);
  const km = (a, b, c, d) => {
    const R = 6371, r = x => x * Math.PI / 180;
    const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  // Zona con datos más cercana al lugar y si el lugar queda dentro de su radio de cobertura
  // (radio_cobertura_km de zonas.json; si una zona no lo trae, no se da por cubierto).
  function cobertura() {
    const L = estado.lugar;
    const Z = ((D.zonas && D.zonas.datos) || []).filter(z => z.lat != null && z.lon != null);
    if (!L || L.lat == null || !Z.length) return null;
    const m = Z.map(z => ({ z, km: km(L.lat, L.lon, z.lat, z.lon) })).sort((a, b) => a.km - b.km)[0];
    m.cubre = typeof m.z.radio_cobertura_km === 'number' && m.km <= m.z.radio_cobertura_km;
    m.kmTxt = m.km < 1 ? 'menos de 1' : `${Math.round(m.km)}`;
    return m;
  }
  const nombreLugar = () => (estado.lugar ? [estado.lugar.nombre, estado.lugar.detalle].filter(Boolean).join(', ') : '');

  // ---------- navegación ----------
  const TOTAL = 5;
  let paso = 1;
  function ir(n, enfocar = true) {
    paso = n;
    $$('.pantalla').forEach(p => { p.hidden = +p.dataset.paso !== n; });
    $('#progreso').textContent = n <= TOTAL ? `Pregunta ${n} de ${TOTAL}` : '';
    $('#progreso').hidden = n > TOTAL;
    if (n === 3) pintarLugar();
    if (n === 6) pintarPlan();
    window.scrollTo(0, 0);
    if (enfocar) { const h = document.querySelector(`.pantalla[data-paso="${n}"] h1`); if (h) h.focus({ preventScroll: true }); }
  }
  $$('[data-atras]').forEach(b => b.addEventListener('click', () => ir(Math.max(1, paso - 1))));

  // ---------- 1. ¿Qué cultivas? ----------
  function pintarCultivos() {
    const lista = (D.cultivos && D.cultivos.datos) || [];
    $('#opCultivo').innerHTML = lista.map(c =>
      `<button type="button" class="opcion" data-cultivo="${esc(c.cultivo)}" aria-pressed="${c.cultivo === estado.cultivo}">
        <i class="punto" style="--cc:var(--c-${esc(c.cultivo)},var(--dot))"></i>${esc(corto(c))}</button>`).join('')
      + '<button type="button" class="opcion secundaria" data-cultivo="otro">Otro cultivo</button>';
  }
  $('#opCultivo').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.cultivo === 'otro') {
      const nombres = ((D.cultivos && D.cultivos.datos) || []).map(corto).join(', ');
      const m = $('#msgCultivo');
      m.hidden = false;
      m.innerHTML = `No tengo datos de ese cultivo. Por ahora solo tengo ${esc(nombres)} de Amealco.`;
      return;
    }
    estado.cultivo = b.dataset.cultivo; guardar(); ir(2);
  });

  // ---------- 2. ¿Dónde cultivas? (cualquier lugar de México) ----------
  // Busca en municipios.json (INEGI) sin internet. No distingue acentos ni mayúsculas.
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  let indice = [];
  function prepararMunicipios() {
    indice = ((D.municipios && D.municipios.datos) || []).map(m => ({ m, n: norm(m.municipio), e: norm(m.estado), a: norm(m.estado_abrev) }));
    const Z = (D.zonas && D.zonas.datos) || [];
    $('#zonasConDatos').textContent = Z.length
      ? `Hoy tenemos datos para: ${Z.map(z => z.nombre).join(' · ')}. Para otros lugares te diremos si todavía no hay datos.`
      : '';
    if (!indice.length) $('#lugarAyuda').textContent = 'No se pudo cargar la lista de municipios. Usa tu ubicación.';
  }
  function buscar(q) {
    const t = norm(q).split(' ').filter(Boolean);
    if (!t.length || !indice.length) return [];
    const res = [];
    for (const x of indice) {
      const todo = `${x.n} ${x.e} ${x.a}`;
      if (!t.every(w => todo.includes(w))) continue;
      const puntos = (x.n.startsWith(t[0]) ? 0 : x.n.includes(t[0]) ? 1 : 2) + (x.n === t.join(' ') ? -1 : 0);
      res.push({ x, puntos });
    }
    return res.sort((a, b) => a.puntos - b.puntos || a.x.n.length - b.x.n.length).slice(0, 7).map(r => r.x.m);
  }
  const lugarTxt = $('#lugarTxt'), sug = $('#lugarSug');
  lugarTxt.addEventListener('input', () => {
    const lista = buscar(lugarTxt.value);
    sug.innerHTML = lista.map(m => `<li><button type="button" class="sug" role="option" data-cve="${esc(m.cvegeo)}"><b>${esc(m.municipio)}</b>, ${esc(m.estado)}</button></li>`).join('')
      + (lugarTxt.value.trim().length >= 3 && !lista.length ? '<li class="fine">No encontré ese municipio. Revisa cómo se escribe o usa tu ubicación.</li>' : '');
  });
  lugarTxt.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { const b = sug.querySelector('button'); if (b) { ev.preventDefault(); b.click(); } }
  });
  sug.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    const m = ((D.municipios && D.municipios.datos) || []).find(x => x.cvegeo === b.dataset.cve);
    if (!m) return;
    estado.lugar = { nombre: m.municipio, detalle: m.estado, lat: m.lat, lon: m.lon, origen: 'municipio' };
    estado.verReferencia = false; guardar(); ir(3);
  });
  $('#btnUbicacion').addEventListener('click', () => {
    const msg = $('#msgZona');
    if (!navigator.geolocation) { msg.hidden = false; msg.textContent = 'Tu teléfono no permite usar la ubicación. Escribe tu municipio.'; return; }
    msg.hidden = false; msg.textContent = 'Buscando tu ubicación…';
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      // Nombre de referencia: la cabecera municipal más cercana (solo para mostrar)
      const muni = ((D.municipios && D.municipios.datos) || []).map(m => ({ m, d: km(lat, lon, m.lat, m.lon) })).sort((a, b) => a.d - b.d)[0];
      estado.lugar = {
        nombre: muni ? `Cerca de ${muni.m.municipio}` : 'Tu ubicación',
        detalle: muni ? muni.m.estado : `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        lat, lon, origen: 'gps',
      };
      estado.verReferencia = false; guardar();
      msg.hidden = true; ir(3);
    }, () => { msg.textContent = 'No se pudo usar tu ubicación. Escribe tu municipio.'; }, { timeout: 15000, maximumAge: 600000 });
  });

  // ---------- 3. ¿Es este lugar? ----------
  function mapaPais(L, cob) {
    // Mapa de puntos de México dibujado con las cabeceras municipales de INEGI (sin internet).
    const M = (D.municipios && D.municipios.datos) || [];
    const svg = $('#mapaPais');
    if (!M.length) { svg.toggleAttribute('hidden', true); return false; }
    // Encuadre: tu lugar y la zona con datos más cercana, con margen (mínimo ~3° de lado).
    const pts = [[L.lat, L.lon]].concat(cob ? [[cob.z.lat, cob.z.lon]] : []);
    let n = Math.max(...pts.map(p => p[0])), s = Math.min(...pts.map(p => p[0]));
    let o = Math.min(...pts.map(p => p[1])), e = Math.max(...pts.map(p => p[1]));
    const pad = 0.8, minLado = 3;
    const cy = (n + s) / 2, cx = (o + e) / 2;
    const ladoX = Math.max(e - o + 2 * pad, minLado), ladoY = Math.max(n - s + 2 * pad, ladoX * 0.6);
    n = cy + ladoY / 2; s = cy - ladoY / 2; o = cx - ladoX / 2; e = cx + ladoX / 2;
    const kx = Math.cos(((n + s) / 2) * Math.PI / 180);
    const Wd = (e - o) * kx, Hd = n - s, W = 400, H = Math.round(W * Hd / Wd);
    const X = lon => ((lon - o) * kx / Wd) * W, Y = lat => ((n - lat) / Hd) * H;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    const dentro = M.filter(m => m.lat <= n && m.lat >= s && m.lon >= o && m.lon <= e);
    const puntos = dentro.map(m => `M${X(m.lon).toFixed(1)} ${Y(m.lat).toFixed(1)}h0`).join('');
    const zonas = ((D.zonas && D.zonas.datos) || []).filter(z => z.lat != null)
      .map(z => `<circle cx="${X(z.lon).toFixed(1)}" cy="${Y(z.lat).toFixed(1)}" r="5" class="m-zona"><title>${esc(z.nombre)}: zona con datos</title></circle>`).join('');
    const etiqueta = (x, y, txt, cls) => {
      const izq = x > W * 0.6;
      return `<text x="${(izq ? x - 10 : x + 10).toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="${izq ? 'end' : 'start'}" class="${cls}">${esc(txt)}</text>`;
    };
    const zl = cob ? etiqueta(X(cob.z.lon), Y(cob.z.lat), cob.z.nombre.split(',')[0], 'm-etq-zona') : '';
    svg.innerHTML = `<path d="${puntos}" class="m-muni"/>${zonas}
      <circle cx="${X(L.lon).toFixed(1)}" cy="${Y(L.lat).toFixed(1)}" r="7" class="m-tu"/>
      ${etiqueta(X(L.lon), Y(L.lat), L.nombre, 'm-etq-tu')}${zl}`;
    svg.setAttribute('aria-label', `Mapa: tu lugar en rojo${cob ? `; la zona con datos (${cob.z.nombre}) en verde` : ''}`);
    svg.toggleAttribute('hidden', false);
    return true;
  }
  function pintarLugar() {
    const L = estado.lugar;
    if (!L) { ir(2); return; }
    const cob = cobertura();
    $('#lugarNombre').textContent = nombreLugar();
    $('#lugarCobertura').className = 'cobertura ' + (cob && cob.cubre ? 'si' : 'no');
    $('#lugarCobertura').textContent = !cob ? 'Sin dato de cobertura.'
      : cob.cubre ? `Tenemos datos de tu zona: ${cob.z.nombre}, a ${cob.kmTxt} km.`
        : `Todavía no tenemos datos de tu zona. La más cercana con datos es ${cob.z.nombre}, a ${cob.kmTxt} km.`;
    $('#lugarNota').textContent = 'Los datos de lluvia y clima describen toda la zona, no tu parcela exacta.'
      + (L.origen === 'municipio' ? ' El punto es la cabecera municipal.' : '');

    const im = D.imagen && D.imagen.datos;
    const img = $('#mapaImg'), pin = $('#mapaPin');
    const enImagen = im && im.archivo && L.lat <= im.norte && L.lat >= im.sur && L.lon >= im.oeste && L.lon <= im.este;
    $('#mapa').hidden = false;
    if (enImagen) {
      $('#mapaPais').toggleAttribute('hidden', true);
      $('#mapa').classList.remove('pais');
      img.hidden = false; img.src = im.archivo;
      img.alt = `Imagen de satélite alrededor de ${nombreLugar()}`;
      pin.hidden = false;
      pin.style.left = `${((L.lon - im.oeste) / (im.este - im.oeste)) * 100}%`;
      pin.style.top = `${((im.norte - L.lat) / (im.norte - im.sur)) * 100}%`;
      $('#mapaPie').textContent = `${im.producto || 'Imagen de satélite'} · ${im.fecha_imagen ? fecha(im.fecha_imagen) : 'sin dato'}`;
    } else {
      img.hidden = true; pin.hidden = true;
      const ok = mapaPais(L, cob);
      $('#mapa').hidden = !ok;
      $('#mapa').classList.add('pais');
      $('#mapaPie').textContent = 'Rojo: tu lugar · Verde: zonas con datos · Puntos: municipios (INEGI)';
    }
  }
  $('#btnSiLugar').addEventListener('click', () => ir(4));

  // ---------- 4. ¿Cuánto tiempo? ----------
  const inp = $('#anios');
  inp.value = estado.anios != null ? estado.anios : 10;
  const ajustar = d => { const v = Math.max(0, Math.min(80, (parseInt(inp.value, 10) || 0) + d)); inp.value = v; };
  $('#aniosMenos').addEventListener('click', () => ajustar(-1));
  $('#aniosMas').addEventListener('click', () => ajustar(1));
  $('#btnAnios').addEventListener('click', () => {
    const v = parseInt(inp.value, 10);
    estado.anios = Number.isFinite(v) ? Math.max(0, Math.min(80, v)) : null; guardar(); ir(5);
  });

  // ---------- 5. ¿En qué te acompaño? ----------
  function pintarPrioridades() {
    $$('#opPrioridad button').forEach(b => b.setAttribute('aria-pressed', estado.prioridades.includes(b.dataset.prioridad)));
    $('#btnPlan').disabled = !estado.prioridades.length;
  }
  $('#opPrioridad').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    const p = b.dataset.prioridad;
    estado.prioridades = estado.prioridades.includes(p) ? estado.prioridades.filter(x => x !== p) : [...estado.prioridades, p];
    guardar(); pintarPrioridades();
  });
  $('#btnPlan').addEventListener('click', () => ir(6));

  // ---------- Tu plan ----------
  // armarPlan() junta todo en un resumen de texto plano (null = sin dato). La pantalla y el PDF
  // se dibujan desde ese mismo resumen, así que nunca dicen cosas distintas.
  const ACT = [['siembra', 'Siembra'], ['fertilizacion', 'Fertilización'], ['cosecha', 'Cosecha']];
  const PRIORIDAD = { cosecha: 'Mejorar mi cosecha', agua: 'No gastar tanta agua', ganar: 'Aumentar mis cosechas' };
  let ultimoPlan = null;

  function armarPlan() {
    const c = cultivoSel(), cob = cobertura();
    if (!c || !cob) return null;
    const z = cob.z;
    const nombreC = corto(c).toLowerCase();
    const cal = D.calendario || {};
    const lugar = nombreLugar();
    const slug = norm(lugar).replace(/ /g, '-').slice(0, 40) || z.zona_id;
    const plan = {
      titulo: `Tu plan para ${nombreC} en ${lugar}`,
      archivo: `milpa-clara-plan-${c.cultivo}-${slug}.pdf`,
      lugar: estado.lugar,
      cobertura: cob,
      soloAviso: !cob.cubre && !estado.verReferencia,
      referencia: !cob.cubre && estado.verReferencia,
      datosDe: cob.cubre ? `Con datos de la zona ${z.nombre}, a ${cob.kmTxt} km de tu lugar.` : null,
      avisoReferencia: !cob.cubre
        ? `Tu lugar está a ${cob.kmTxt} km de ${z.nombre}, fuera de su cobertura${typeof z.radio_cobertura_km === 'number' ? ` (${z.radio_cobertura_km} km)` : ''}. Lo que sigue es de otra zona: úsalo solo como referencia.`
        : null,
      sinCobertura: `La zona con datos más cercana a ${lugar} es ${z.nombre}, a ${cob.kmTxt} km. Las fechas dependen de la lluvia de cada zona, así que no las usamos para tu lugar.`,
      ejemplo: [D.zonas, cal].some(d => d && d.ejemplo === true),
      metodo: cal.generado_por === 'red_neuronal' ? 'Calculado por la inteligencia artificial.'
        : cal.generado_por === 'baseline' ? 'Calculado con las lluvias de años pasados, sin inteligencia artificial.' : null,
      respuestas: [
        ['Cultivo', corto(c)],
        ['Lugar', lugar || null],
        ['Datos de', cob.cubre ? `${z.nombre} (a ${cob.kmTxt} km)` : `Sin datos de tu zona (la más cercana: ${z.nombre}, a ${cob.kmTxt} km)`],
        ['Años cultivando', estado.anios != null ? `${estado.anios}` : null],
        ['Te acompaño en', estado.prioridades.map(p => PRIORIDAD[p]).join(', ') || null],
      ],
      zona: z, cultivo: c,
    };

    // Fechas del cultivo elegido (calendario.json)
    const filas = (cal.datos || []).filter(r => r.zona_id === z.zona_id && r.cultivo === c.cultivo);
    plan.fechas = filas.length ? ACT.map(([clave, etiqueta]) => {
      const r = filas.find(x => x.actividad === clave);
      return {
        etiqueta,
        dia: (r && fecha(r.fecha_recomendada)) || null,
        ventana: r && r.ventana_inicio && r.ventana_fin ? `Del ${fechaCorta(r.ventana_inicio)} al ${fechaCorta(r.ventana_fin)}` : null,
        conf: r && typeof r.confianza === 'number' ? `${Math.round(r.confianza * 100)} %` : null,
        porque: r && r.razon ? razonAmigable(r.razon) : null,
      };
    }) : null;
    plan.sinFechas = `Todavía no tenemos fechas de ${nombreC} para esta zona.`;

    // Años que le ha tocado sembrar (anios_malos_2003_2025 de cultivos.json)
    const malos = Array.isArray(c.anios_malos_2003_2025) ? c.anios_malos_2003_2025 : null;
    const hoy = new Date().getFullYear();
    plan.anios = null;
    if (estado.anios > 0 && malos) {
      const desdePedido = hoy - estado.anios;
      const desde = Math.max(2003, desdePedido), hasta = Math.min(2025, hoy - 1);
      const tocados = malos.filter(a => a >= desde && a <= hasta);
      plan.anios = desde > hasta ? { sinDato: true } : {
        n: tocados.length, tocados, desde, hasta,
        texto: `${tocados.length ? `${tocados.length} año${tocados.length === 1 ? '' : 's'} malo${tocados.length === 1 ? '' : 's'}` : 'Ningún año malo'} para ${art(c)} ${nombreC} en Amealco entre ${desde} y ${hasta}.`,
        nota: `Año malo: el cultivo rindió menos de la mitad de lo normal en el municipio (SIAP).${desdePedido < 2003 ? ' Los datos empiezan en 2003.' : ''}`,
      };
    }

    // Una sección por cada prioridad (cultivos.json)
    const todos = (D.cultivos && D.cultivos.datos) || [];
    const tuyo = x => x.cultivo === c.cultivo;
    const nom = x => `${corto(x)}${tuyo(x) ? ' (el tuyo)' : ''}`;
    plan.bloques = [];
    if (estado.prioridades.includes('cosecha')) {
      const pct = c.rendimiento_en_anios_malos_maiz_pct_de_lo_normal;
      plan.bloques.push({
        titulo: 'Mejorar tu cosecha',
        filas: [
          { n: `Años malos de ${nombreC} (2003–2025)`, v: malos ? `${malos.length}` : null },
          { n: c.cultivo === 'maiz' ? 'En sus años malos, el maíz rindió' : `En los años malos del maíz, ${art(c)} ${nombreC} rindió`, v: typeof pct === 'number' ? `${pct} % de lo normal` : null },
          { n: 'Años en que le faltó agua', v: c.anios_con_falta_agua_mas_15pct ? c.anios_con_falta_agua_mas_15pct.split(' (')[0] : null },
        ],
        nota: 'Datos del municipio (SIAP) y del clima medido por la NASA, 2003–2025.',
      });
    }
    if (estado.prioridades.includes('agua')) {
      const orden = todos.slice().sort((a, b) => (a.agua_ciclo_mm ?? Infinity) - (b.agua_ciclo_mm ?? Infinity));
      const max = Math.max(...todos.map(x => x.agua_ciclo_mm || 0)) || 1;
      plan.bloques.push({
        titulo: 'No gastar tanta agua',
        intro: 'Agua que necesita cada cultivo en todo su ciclo:',
        barras: orden.map(x => ({
          n: nom(x), tuyo: tuyo(x), cultivo: x.cultivo,
          pct: x.agua_ciclo_mm ? x.agua_ciclo_mm / max : 0,
          v: typeof x.agua_ciclo_mm === 'number'
            ? `${x.agua_ciclo_mm} mm${typeof x.agua_ciclo_m3_ha === 'number' ? ` (${miles(x.agua_ciclo_m3_ha)} m³ por hectárea)` : ''}${typeof x.ciclo_dias === 'number' ? ` · ${x.ciclo_dias} días` : ''}`
            : null,
        })),
        nota: 'Calculado con el clima medido por la NASA y las tablas de agua de cada cultivo.',
      });
    }
    if (estado.prioridades.includes('ganar')) {
      const orden = todos.slice().sort((a, b) => (b.ingreso_bruto_ha_anio_normal_mxn ?? -1) - (a.ingreso_bruto_ha_anio_normal_mxn ?? -1));
      plan.bloques.push({
        titulo: 'Aumentar tus cosechas',
        intro: 'Lo que deja una hectárea en un año normal (antes de costos):',
        filas: orden.map(x => ({ n: nom(x), tuyo: tuyo(x), v: typeof x.ingreso_bruto_ha_anio_normal_mxn === 'number' ? `$${miles(x.ingreso_bruto_ha_anio_normal_mxn)}` : null })),
        aviso: c.aviso || null,
        nota: 'Cosecha real en Amealco × precio medio en Querétaro. Faltan los costos, así que no es ganancia.',
      });
    }
    const cu = D.cultivos || {};
    plan.fuente = cu.fecha_consulta ? `Datos del cultivo consultados el ${fecha(cu.fecha_consulta)}.` : null;
    return plan;
  }

  const o = v => (v == null || v === '' ? SIN : esc(v));
  function pintarPlan() {
    const plan = armarPlan();
    if (!plan) { ir(1); return; }
    ultimoPlan = plan;
    $('#pr').textContent = plan.titulo;
    $('#resEjemplo').hidden = !plan.ejemplo || plan.soloAviso;
    $('#resDatosDe').textContent = plan.datosDe || '';
    $('#resDatosDe').hidden = !plan.datosDe;
    $('#resSinCobertura').hidden = !plan.soloAviso;
    $('#sinCTexto').textContent = plan.sinCobertura;
    $('#btnReferencia').textContent = `Ver el plan de ${plan.cobertura.z.nombre} como referencia`;
    $('#resReferencia').hidden = !plan.referencia;
    $('#resReferencia').textContent = plan.avisoReferencia || '';
    ['#resCalendario', '#resPrioridades', '#resFuente'].forEach(s => { $(s).hidden = plan.soloAviso; });

    $('#calLista').innerHTML = !plan.fechas
      ? `<p>${SIN}: ${esc(plan.sinFechas)} Abajo puedes ver qué necesita el cultivo.</p>`
      : `<ol class="fechas">${plan.fechas.map(f => `<li class="fecha-item">
          <span class="etq">${esc(f.etiqueta)}</span>
          <span class="dia">${o(f.dia)}</span>
          ${f.ventana ? `<span class="ventana">Días buenos: ${esc(f.ventana)}</span>` : ''}
          ${f.conf ? `<span class="conf">Confianza: <b>${esc(f.conf)}</b></span>` : ''}
          <span class="porque">${f.porque ? esc(f.porque) : `¿Por qué? ${SIN}`}</span>
        </li>`).join('')}</ol>`;
    $('#calMetodo').textContent = plan.metodo || '';

    $('#resAnios').hidden = !plan.anios || plan.soloAviso;
    if (plan.anios) {
      const a = plan.anios;
      $('#aniosCuerpo').innerHTML = a.sinDato ? `<p>${SIN} para esos años.</p>` : `
        <p class="grande">${esc(a.texto).replace(/^(\d+|Ningún)/, '<b>$1</b>')}</p>
        ${a.n ? `<div class="chips-anios">${a.tocados.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
        <p class="fine">${esc(a.nota)}</p>`;
    }

    $('#resPrioridades').innerHTML = plan.bloques.map(b => `<article class="bloque"><h2>${esc(b.titulo)}</h2>
      ${b.intro ? `<p>${esc(b.intro)}</p>` : ''}
      ${b.filas ? `<ul class="datos">${b.filas.map(f => `<li class="${f.tuyo ? 'tuyo' : ''}"><span>${esc(f.n)}</span><b>${o(f.v)}</b></li>`).join('')}</ul>` : ''}
      ${b.barras ? `<ul class="barras">${b.barras.map(x => `<li class="${x.tuyo ? 'tuyo' : ''}">
          <span class="n">${esc(x.n)}</span>
          <span class="b"><i style="width:${x.pct * 100}%;background:var(--c-${esc(x.cultivo)},var(--dot))"></i></span>
          <span class="v">${o(x.v)}</span></li>`).join('')}</ul>` : ''}
      ${b.aviso ? `<p class="aviso">${esc(b.aviso)}</p>` : ''}
      <p class="fine">${esc(b.nota)}</p></article>`).join('');
    $('#resFuente').textContent = plan.fuente || '';
  }

  $('#btnReferencia').addEventListener('click', () => { estado.verReferencia = true; guardar(); pintarPlan(); $('#resReferencia').focus && window.scrollTo(0, 0); });

  // ---------- Descargar el plan en PDF ----------
  // Usa jsPDF guardado en vendor/ (funciona sin internet). Si no cargó, abre "Imprimir" para
  // que el teléfono lo guarde como PDF.
  function cargarImagen(src) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = img.naturalWidth; cv.height = img.naturalHeight;
          cv.getContext('2d').drawImage(img, 0, 0);
          res({ data: cv.toDataURL('image/jpeg', 0.9), w: img.naturalWidth, h: img.naturalHeight });
        } catch (e) { res(null); }
      };
      img.onerror = () => res(null);
      img.src = src;
    });
  }

  async function descargarPDF() {
    const plan = ultimoPlan || armarPlan();
    const msg = $('#msgPdf');
    if (!plan) return;
    if (!(window.jspdf && window.jspdf.jsPDF)) { window.print(); return; }
    msg.hidden = false; msg.textContent = 'Preparando tu PDF…';
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const M = 18, ANCHO = W - 2 * M;
    const VERDE = [31, 122, 77], TINTA = [27, 36, 32], GRIS = [77, 90, 83], AMBAR = [143, 92, 12];
    const COLOR = { maiz: [217, 102, 31], frijol: [86, 70, 176], avena: [21, 154, 107] };
    const SD = 'sin dato';
    let y = M;

    const salto = alto => { if (y + alto > H - 20) { doc.addPage(); y = M; } };
    const texto = (t, { size = 11, bold = false, color = TINTA, x = M, ancho = ANCHO, gap = 1.5 } = {}) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
      const lineas = doc.splitTextToSize(String(t), ancho);
      const alto = lineas.length * size * 0.42;
      salto(alto);
      doc.text(lineas, x, y + size * 0.35);
      y += alto + gap;
    };
    const titulo = t => { y += 3; salto(14); texto(t, { size: 14, bold: true, color: VERDE, gap: 2 }); };
    const fila = (n, v, { tuyo = false } = {}) => {
      doc.setFontSize(11);
      const vv = v == null ? SD : String(v);
      doc.setFont('helvetica', 'bold');
      const anchoV = Math.min(doc.getTextWidth(vv) + 2, ANCHO * 0.45);
      doc.setFont('helvetica', tuyo ? 'bold' : 'normal');
      const ln = doc.splitTextToSize(n, ANCHO - anchoV - 4);
      const alto = Math.max(ln.length, 1) * 4.7 + 2.5;
      salto(alto);
      doc.setTextColor(...TINTA); doc.text(ln, M, y + 4);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...(v == null ? AMBAR : TINTA));
      doc.text(vv, W - M, y + 4, { align: 'right' });
      y += alto;
      doc.setDrawColor(220, 225, 217); doc.line(M, y - 1, W - M, y - 1);
    };

    // Encabezado
    doc.setFillColor(...VERDE); doc.rect(0, 0, W, 14, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
    doc.text('Milpa Clara', M, 9.3);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    const hoyL = new Date();
    doc.text(`Generado el ${hoyL.getDate()} de ${MESES[hoyL.getMonth()]} de ${hoyL.getFullYear()}`, W - M, 9.3, { align: 'right' });
    y = 22;
    texto(plan.titulo, { size: 18, bold: true, gap: 3 });
    if (plan.ejemplo && !plan.soloAviso) texto('Atención: estas fechas son de prueba mientras llega el cálculo final.', { size: 10, color: AMBAR });
    if (plan.datosDe) texto(plan.datosDe, { size: 10, color: GRIS });
    if (plan.referencia) texto(plan.avisoReferencia, { size: 10.5, bold: true, color: AMBAR });

    // Respuestas
    titulo('Tus respuestas');
    plan.respuestas.forEach(([n, v]) => fila(n, v));

    // Imagen de la zona con el punto
    const im = D.imagen && D.imagen.datos;
    const L = plan.lugar || {};
    const lugarEnImagen = im && L.lat != null && L.lat <= im.norte && L.lat >= im.sur && L.lon >= im.oeste && L.lon <= im.este;
    if (im && im.archivo && lugarEnImagen) {
      const foto = await cargarImagen(im.archivo);
      if (foto) {
        const ancho = Math.min(ANCHO, 110), alto = ancho * foto.h / foto.w;
        y += 2; salto(alto + 8);
        doc.addImage(foto.data, 'JPEG', M, y, ancho, alto);
        {
          const px = M + ((L.lon - im.oeste) / (im.este - im.oeste)) * ancho;
          const py = y + ((im.norte - L.lat) / (im.norte - im.sur)) * alto;
          doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.8); doc.setFillColor(184, 65, 44);
          doc.circle(px, py, 2.2, 'FD'); doc.setLineWidth(0.2);
        }
        y += alto + 1.5;
        texto(`${im.producto || 'Imagen de satélite'} · ${im.fecha_imagen ? fecha(im.fecha_imagen) : SD}. Los datos de lluvia y clima describen toda la zona, no tu parcela exacta.`, { size: 8.5, color: GRIS });
      }
    }

    if (plan.soloAviso) {
      titulo('Aún no tenemos datos de tu zona');
      texto(plan.sinCobertura, { size: 11 });
    }

    // Fechas
    if (!plan.soloAviso) titulo('Tus fechas');
    if (plan.soloAviso) { /* sin fechas para este lugar */ } else
    if (!plan.fechas) texto(`Sin dato: ${plan.sinFechas}`, { color: AMBAR });
    else plan.fechas.forEach(f => {
      salto(22);
      texto(f.etiqueta.toUpperCase(), { size: 9, bold: true, color: GRIS, gap: 0.5 });
      texto(f.dia || SD, { size: 14, bold: true, color: f.dia ? TINTA : AMBAR, gap: 0.8 });
      if (f.ventana) texto(`Días buenos: ${f.ventana}`, { size: 11, bold: true, color: VERDE, gap: 0.5 });
      if (f.conf) texto(`Confianza: ${f.conf}`, { size: 10.5, gap: 0.5 });
      texto(f.porque ? f.porque : `¿Por qué? ${SD}`, { size: 10, color: f.porque ? GRIS : AMBAR, gap: 3 });
    });
    if (plan.metodo && !plan.soloAviso) texto(plan.metodo, { size: 9, color: GRIS });

    // Años
    if (plan.anios && !plan.soloAviso) {
      titulo('Los años que te ha tocado sembrar');
      if (plan.anios.sinDato) texto(`${SD} para esos años.`, { color: AMBAR });
      else {
        texto(plan.anios.texto, { size: 12, bold: true });
        if (plan.anios.n) texto(`Años malos: ${plan.anios.tocados.join(', ')}`, { size: 11, color: [184, 65, 44] });
        texto(plan.anios.nota, { size: 9, color: GRIS });
      }
    }

    // Prioridades
    (plan.soloAviso ? [] : plan.bloques).forEach(b => {
      titulo(b.titulo);
      if (b.intro) texto(b.intro, { size: 10.5 });
      if (b.filas) b.filas.forEach(f => fila(f.n, f.v, { tuyo: f.tuyo }));
      if (b.barras) b.barras.forEach(x => {
        salto(13);
        texto(x.n, { size: 10.5, bold: x.tuyo, gap: 0.8 });
        doc.setFillColor(241, 243, 237); doc.roundedRect(M, y, ANCHO * 0.6, 3.2, 1.5, 1.5, 'F');
        if (x.pct > 0) { doc.setFillColor(...(COLOR[x.cultivo] || [139, 149, 143])); doc.roundedRect(M, y, ANCHO * 0.6 * x.pct, 3.2, 1.5, 1.5, 'F'); }
        y += 4.5;
        texto(x.v || SD, { size: 9.5, color: x.v ? GRIS : AMBAR, gap: 2 });
      });
      if (b.aviso) texto(b.aviso, { size: 10, color: AMBAR });
      texto(b.nota, { size: 8.5, color: GRIS });
    });

    // Cierre
    y += 4;
    salto(26);
    const y0 = y;
    texto('Esta herramienta te acompaña con datos del pasado. La decisión final es tuya.', { size: 11, bold: true, x: M + 4, ancho: ANCHO - 4 });
    doc.setDrawColor(...VERDE); doc.setLineWidth(1); doc.line(M, y0, M, y - 1); doc.setLineWidth(0.2);
    y += 3;
    if (plan.fuente && !plan.soloAviso) texto(plan.fuente, { size: 8.5, color: GRIS });
    texto('Fuentes: NASA POWER, MODIS y HLS (NASA), SIAP, CONAGUA (Monitor de Sequía), FAO-56 e INEGI (municipios). Proyecto para NASA Space Apps Challenge 2026, sede CDMX.', { size: 8.5, color: GRIS });

    // Número de página
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRIS);
      doc.text(`Milpa Clara · ${plan.titulo}`, M, H - 8);
      doc.text(`Página ${i} de ${n}`, W - M, H - 8, { align: 'right' });
    }
    doc.setProperties({ title: plan.titulo, subject: 'Plan de siembra con datos de satélite', creator: 'Milpa Clara' });
    doc.save(plan.archivo);
    msg.textContent = 'Listo. Tu PDF se descargó.';
  }
  $('#btnPdf').addEventListener('click', () => {
    descargarPDF().catch(() => { const m = $('#msgPdf'); m.hidden = false; m.textContent = 'No se pudo crear el PDF. Usa Imprimir y elige "Guardar como PDF".'; window.print(); });
  });
  $('#btnReiniciar').addEventListener('click', () => ir(1));

  // ---------- arranque ----------
  Promise.allSettled([cargar('cultivos'), cargar('zonas'), cargar('calendario'), cargar('imagen_zona'), cargar('municipios')]).then(([cu, zo, ca, im, mu]) => {
    D.cultivos = cu.status === 'fulfilled' ? cu.value : null;
    D.zonas = zo.status === 'fulfilled' ? zo.value : null;
    D.calendario = ca.status === 'fulfilled' ? ca.value : null;
    D.imagen = im.status === 'fulfilled' ? im.value : null;
    D.municipios = mu.status === 'fulfilled' ? mu.value : null;
    if (!D.cultivos || !D.zonas) {
      $('#opCultivo').innerHTML = '<p class="aviso">No se pudieron leer los datos. Abre el sitio con un servidor: <code>python3 -m http.server 8000 -d site</code>.</p>';
      return;
    }
    pintarCultivos(); prepararMunicipios(); pintarPrioridades();
    // Si ya contestó todo antes en este teléfono, va directo a su plan.
    const completo = cultivoSel() && cobertura() && estado.prioridades.length;
    ir(completo ? 6 : 1, false);
  });
})();
