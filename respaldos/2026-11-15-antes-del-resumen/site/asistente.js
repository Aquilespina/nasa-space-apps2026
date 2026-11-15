/* Asistente de 9 preguntas + "Tu plan" + chat.
   Lee data/cultivos.json, data/zonas.json, data/calendario.json, data/imagen_zona.json y
   data/municipios.json. Mismas reglas que recorrido.js y calculo.js: ningún número escrito a
   mano; si un campo falta o es null, se muestra "sin dato". La lógica de recorrido.js,
   calculo.js y evidencia.js no se toca: esos módulos se cargan tal cual dentro de "Tu plan". */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const SIN = '<span class="falta">todavía no lo sé</span>';
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

  // Lo que la persona cuenta de su parcela (riego, lo que observa, manejo tras cosechar, qué
  // quiere explorar): no es medición de satélite, por eso tiene sus propias etiquetas y el chat
  // lo trata como contexto, no como "dato verificado" (ver api/chat.js).
  const RIEGO = { temporal: 'Solo lluvia (temporal)', goteo: 'Riego por goteo o aspersión', rodado: 'Canal, pozo o riego rodado' };
  const CONDICION = { falta_agua: 'Se seca rápido / le falta agua', tierra_cansada: 'Tierra cansada, rinde menos', plagas_clima: 'Plagas o lluvias muy irregulares' };
  const DESCANSO = { descubierta: 'Queda tierra descubierta varios meses', rastrojo: 'Deja rastrojo o cobertura', inmediato: 'Siembra otro cultivo enseguida' };
  const ESTRATEGIA = { actual: 'Seguir con el cultivo actual', leguminosa: 'Alternar con frijol', calabaza: 'Sembrar calabaza con el maíz (milpa)' };

  // ---------- estado (se recuerda solo en este teléfono) ----------
  const CLAVE = 'milpaclara.respuestas.v2';
  // lugar = { nombre, detalle, lat, lon, origen: 'municipio' | 'gps' }
  let estado = { cultivo: null, lugar: null, anios: 10, prioridades: [], verReferencia: false, riego: null, condicion: null, descanso: null, estrategia: null };
  try { Object.assign(estado, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch (e) { /* sin almacenamiento */ }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } };

  let D = { cultivos: null, zonas: null, calendario: null, imagen: null, municipios: null };
  const corto = c => {
    const n = (c && c.nombre) || '';
    return n.split(/\s+/)[0] || (c && c.cultivo) || '';
  };
  const art = c => (/^(avena|calabaza)/i.test(corto(c)) ? 'la' : 'el');
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
  // ---------- Amealquito: el asistente cambia de cara según lo que pasa ----------
  // Cada pregunta tiene su propia tarjeta de guía (color fijo por tema); el avatar
  // adentro cambia de cara según la emoción. Solo paso 3 y 10 cambian también de color
  // (buenas/malas noticias sobre cobertura o plan), por eso llevan data-dinamico="1".
  const EMOCION = { feliz: 'Feliz', neutral: 'Neutral', nervioso: 'Nervioso', triste: 'Triste' };
  const COLOR_EMOCION = { feliz: 'verde', neutral: 'azul', nervioso: 'ambar', triste: 'ambar' };
  function amealquito(n, emocion, texto) {
    const img = $(`#guia${n}Img`), msg = $(`#guia${n}Msg`), caja = $(`#guia${n}`);
    if (!img || !msg) return;
    if (!EMOCION[emocion]) emocion = 'neutral';
    if (!img.src.endsWith(`/${emocion}.png`)) {
      img.src = `img/amealquito/${emocion}.png`;
      caja.classList.remove('cambia'); void caja.offsetWidth; caja.classList.add('cambia');
    }
    img.alt = `Amealquito ${EMOCION[emocion].toLowerCase()}`;
    img.title = EMOCION[emocion];
    msg.textContent = texto;
    if (caja.dataset.dinamico === '1') {
      caja.classList.remove('verde', 'azul', 'ambar', 'neutral');
      caja.classList.add(COLOR_EMOCION[emocion]);
    }
  }
  const SALUDO = {
    1: ['feliz', 'Te acompaño a planear tu siembra con datos de satélite de la NASA. Empecemos: ¿qué cultivas?'],
    2: ['neutral', '¿Dónde está tu parcela? Escribe tu municipio o usa tu ubicación.'],
    4: ['neutral', 'Nadie conoce esa tierra mejor que tú. Tu experiencia manda; los datos solo te ayudan a confirmar riesgos.'],
    5: ['neutral', '¿En qué te ayudo más? Puedes elegir varias.'],
    6: ['neutral', '¿Cómo le das agua a tu cultivo? Así ajusto mis consejos sobre el agua y la sequía.'],
    7: ['neutral', 'Yo veo tu zona desde el satélite, pero tú la caminas de cerca. ¿Qué has notado en tu parcela?'],
    8: ['neutral', '¿Qué haces con la tierra después de levantar la cosecha?'],
    9: ['feliz', 'Ya casi terminamos. Con lo que sabemos de tu zona, ¿qué te gustaría explorar para tu próxima siembra?'],
  };

  const TOTAL = 9;
  let paso = 1;
  function ir(n, enfocar = true) {
    paso = n;
    $$('.pantalla').forEach(p => { p.hidden = +p.dataset.paso !== n; });
    $('#progreso').textContent = n <= TOTAL ? `Pregunta ${n} de ${TOTAL}` : '';
    $('#progreso').hidden = n > TOTAL;
    $('#progresoPct').textContent = `${Math.round(Math.min(n, TOTAL) / TOTAL * 100)}%`;
    // Barra verde: avanza con cada pregunta y se llena en "Tu plan".
    const avance = Math.round(Math.min(n, TOTAL) / TOTAL * 100);
    $('#barraRelleno').style.width = `${Math.max(avance, 4)}%`;
    $('#barraAvance').setAttribute('aria-valuenow', avance);
    $('#barraAvance').setAttribute('aria-valuetext', n <= TOTAL ? `Pregunta ${n} de ${TOTAL}` : 'Plan listo');
    if (SALUDO[n]) amealquito(n, ...SALUDO[n]);
    if (n === 3) pintarLugar();
    if (n === 9) pintarEstrategia();
    if (n === 10) pintarPlan();
    window.scrollTo(0, 0);
    if (enfocar) { const h = document.querySelector(`.pantalla[data-paso="${n}"] h1`); if (h) h.focus({ preventScroll: true }); }
  }
  $$('[data-atras]').forEach(b => b.addEventListener('click', () => ir(Math.max(1, paso - 1))));

  // ---------- 1. ¿Qué cultivas? ----------
  function pintarCultivos() {
    const lista = (D.cultivos && D.cultivos.datos) || [];
    $('#opCultivo').innerHTML = lista.map(c =>
      `<button type="button" class="opcion" data-cultivo="${esc(c.cultivo)}" aria-pressed="${c.cultivo === estado.cultivo}">
        <i class="punto" style="--cc:var(--c-${esc(c.cultivo)},var(--dot))"></i><span>${esc(corto(c))}</span></button>`).join('')
      + '<button type="button" class="opcion secundaria" data-cultivo="otro">Otro cultivo</button>';
  }
  $('#opCultivo').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.cultivo === 'otro') {
      const nombres = ((D.cultivos && D.cultivos.datos) || []).map(corto).join(', ');
      const m = $('#msgCultivo');
      m.hidden = false;
      m.innerHTML = `No tengo datos de ese cultivo. Por ahora solo tengo ${esc(nombres)}.`;
      amealquito(1, 'nervioso', `Ay… todavía no tengo datos de ese cultivo. Por ahora solo conozco ${nombres.toLowerCase()}.`);
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
    if (lugarTxt.value.trim().length >= 3 && !lista.length) amealquito(2, 'nervioso', 'Uy… no encuentro ese municipio. ¿Lo escribimos de otra forma?');
    else if (lista.length) amealquito(2, 'neutral', 'Toca tu municipio en la lista.');
    else amealquito(2, ...SALUDO[2]);
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
    if (!navigator.geolocation) { msg.hidden = false; msg.textContent = 'Tu teléfono no permite usar la ubicación. Escribe tu municipio.'; amealquito(2, 'nervioso', 'Tu teléfono no me deja ver la ubicación. Mejor escribe tu municipio.'); return; }
    msg.hidden = false; msg.textContent = 'Buscando tu ubicación…';
    amealquito(2, 'neutral', 'Déjame ver dónde estás…');
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
    }, () => { msg.textContent = 'No se pudo usar tu ubicación. Escribe tu municipio.'; amealquito(2, 'nervioso', 'No pude ver tu ubicación… ¿Me escribes tu municipio?'); }, { timeout: 15000, maximumAge: 600000 });
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
  // Filas del panel "Lectura satelital": cada valor sale de un JSON de data/processed de ESA zona;
  // si falta, se muestra "sin dato" (no se usan las lecturas inventadas del boceto). Los datos que
  // solo existen para El Llano (SoilGrids, años con falta de agua, verdor regional) solo salen ahí.
  // Celda de NASA POWER (0.5° x 0.625°) que contiene el lugar: clima_mexico.json cubre todo México.
  function celdaClima(L) {
    const C = D.climaMx;
    if (!C || !L || L.lat == null) return null;
    const col = (C.columnas || []).reduce((o, c, i) => ((o[c] = i), o), {});
    const r = (C.celdas || []).find(c => Math.abs(c[col.lat] - L.lat) <= 0.25 && Math.abs(c[col.lon] - L.lon) <= 0.3125);
    if (!r) return null;
    const pc = r[col.percentil];
    return { mes: C.mes_humedad, tramo: C.lluvia_tramo, estado: pc <= 0.25 ? 'más seca' : pc >= 0.75 ? 'más húmeda' : 'igual de húmeda',
      lluvia: r[col.lluvia_mm], lluviaNormal: r[col.lluvia_normal_mm], heladas: r[col.dias_helada_anio], mesesHelada: r[col.meses_helada] };
  }
  function filasCelda(cel) {
    const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
    return [
      ['Humedad de la tierra abajo', `${cap(cel.estado)} que lo normal`, `NASA POWER, zona de raíces · ${cel.mes}`],
      ['Lluvia de la temporada', typeof cel.lluvia === 'number' ? `${cel.lluvia} mm (lo normal: ${cel.lluviaNormal} mm)` : null, `NASA POWER, ${cel.tramo || 'desde mayo'}`],
      ['Heladas al año', typeof cel.heladas === 'number' ? `${cel.heladas} días${cel.mesesHelada ? `, sobre todo en ${cel.mesesHelada}` : ''}` : null, 'NASA POWER, 2003–2025'],
    ];
  }

  function lecturaSatelital(zonaId, filaSiembra) {
    const c = cultivoSel() || {};
    const esLlano = zonaId === 'z1';
    const sz = ((D.sueloZonas && D.sueloZonas.datos) || []).find(x => x.zona_id === zonaId);
    const cz = ((D.climaZona && D.climaZona.datos) || []).find(x => x.zona_id === zonaId);
    const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
    const filas = [];
    if (filaSiembra) filas.push(['Cuándo llega la lluvia',
      filaSiembra.ventana_inicio && filaSiembra.ventana_fin ? `Del ${fechaCorta(filaSiembra.ventana_inicio)} al ${fechaCorta(filaSiembra.ventana_fin)}` : null,
      'Satélites de la NASA que miden la lluvia, 2003–2025']);
    if (sz) {
      filas.push(['Humedad de la tierra abajo (hoy)', `${cap(sz.humedad_raiz_hoy.estado)} que lo normal`,
        `NASA POWER, zona de raíces · ${fechaCorta(sz.ultimo_dia_con_dato)}`]);
      filas.push([`Próximos ${sz.pronostico.dias} días`, `${cap(sz.pronostico.estado)} que lo normal`,
        `Pronóstico del equipo (${/^LSTM/.test(sz.pronostico.modelo_usado || '') ? 'LSTM' : sz.pronostico.modelo_usado})`]);
    } else if (cz && cz.humedad_raiz) {
      filas.push(['Humedad de la tierra abajo', `${cap(cz.humedad_raiz.estado)} que lo normal`, `NASA POWER, zona de raíces · ${cz.humedad_raiz.mes}`]);
    }
    if (cz && cz.lluvia_temporada && typeof cz.lluvia_temporada.mm === 'number') {
      filas.push(['Lluvia de esta temporada', `${cz.lluvia_temporada.mm} mm (lo normal: ${cz.lluvia_temporada.normal_mm} mm)`, 'NASA POWER, desde el 1 de mayo']);
    }
    if (esLlano) {
      const suelo = D.cultivos && D.cultivos.suelo_zona;
      const serie = ((D.serie && D.serie.datos) || []).filter(r => typeof r.anomalia_ndvi_pico === 'number');
      const ult = serie[serie.length - 1];
      const falta = c.anios_con_falta_agua_mas_15pct ? c.anios_con_falta_agua_mas_15pct.split(' (')[0] : null;
      filas.push([`Años en que le faltó agua ${art(c) === 'la' ? 'a la' : 'al'} ${corto(c).toLowerCase()}`, falta, 'Clima medido por la NASA, 2003–2025']);
      filas.push(['Agua que guarda la tierra', suelo && typeof suelo.agua_disponible_mm_por_m === 'number' ? `${suelo.agua_disponible_mm_por_m} mm por metro de suelo` : null, 'Mapa de suelos SoilGrids']);
      filas.push([ult ? `Verdor del campo en ${ult.anio}` : 'Verdor del campo',
        ult ? (ult.anomalia_ndvi_pico > 0 ? 'Más verde que lo normal' : ult.anomalia_ndvi_pico < 0 ? 'Menos verde que lo normal' : 'Igual que lo normal') : null,
        'Satélite MODIS de la NASA, toda la región']);
    }
    return filas;
  }

  function pintarLugar() {
    const L = estado.lugar;
    if (!L) { ir(2); return; }
    const cob = cobertura();
    $('#lugarNombre').textContent = nombreLugar();
    const cel = cob && cob.cubre ? null : celdaClima(L);
    $('#lugarCobertura').className = 'cobertura ' + (cob && cob.cubre ? 'si' : cel ? 'si' : 'no');
    $('#lugarCobertura').textContent = !cob && !cel ? 'Sin dato de cobertura.'
      : cob && cob.cubre ? `Tenemos datos de tu zona: ${cob.z.nombre}, a ${cob.kmTxt} km.`
        : cel ? 'Tenemos la humedad del suelo y la lluvia de la NASA para tu lugar. Las fechas de siembra y el pronóstico del equipo todavía no.'
          : `Todavía no tenemos datos de tu zona. La más cercana con datos es ${cob.z.nombre}, a ${cob.kmTxt} km.`;
    if (cob && cob.cubre) amealquito(3, 'feliz', `¡Conozco esta zona! Tengo datos de ${cob.z.nombre}, a ${cob.kmTxt} km. ¿Es aquí?`);
    else if (cel) amealquito(3, 'feliz', `Ya vi tu lugar desde el satélite: la tierra abajo está ${cel.estado} que lo normal. ¿Es aquí?`);
    else if (!cob) amealquito(3, 'nervioso', 'Mmm… no pude revisar si tengo datos de este lugar.');
    else amealquito(3, 'nervioso', `Mmm… aquí todavía no tengo datos. Lo más cercano que conozco está a ${cob.kmTxt} km. ¿Es aquí tu parcela?`);
    $('#lugarNota').textContent = 'Los datos de lluvia y clima describen toda la zona, no tu parcela exacta.'
      + (L.origen === 'municipio' ? ' El punto es la cabecera municipal.' : '');

    // Lo que ven los satélites: solo filas con datos reales de esta zona; si no hay ninguna, el panel no sale.
    const sat = $('#satelite');
    const filaSat = cob && cob.cubre
      ? ((D.calendario && D.calendario.datos) || []).find(r => r.zona_id === cob.z.zona_id && r.cultivo === estado.cultivo && r.actividad === 'siembra')
      : null;
    const filasSat = cob && cob.cubre ? lecturaSatelital(cob.z.zona_id, filaSat && filaSat.razon ? filaSat : null) : cel ? filasCelda(cel) : [];
    if (filasSat.some(([, v]) => v != null)) {
      sat.hidden = false;
      $('#sateliteTexto').textContent = filaSat && filaSat.razon ? razonAmigable(filaSat.razon) : 'así se ve la humedad y la lluvia en tu zona.';
      $('#sateliteFilas').innerHTML = filasSat
        .map(([n, v, sub]) => `<div><dt>${esc(n)}</dt><dd>${v == null ? SIN : esc(v)}${sub ? `<small>${esc(sub)}</small>` : ''}</dd></div>`).join('');
    } else {
      sat.hidden = true;
    }

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

  // ---------- 6. ¿Cómo riegas? ----------
  $('#opRiego').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    estado.riego = b.dataset.riego; guardar(); ir(7);
  });

  // ---------- 7. ¿Qué has notado en tu parcela? (lo que cuenta la persona, no un sensor) ----------
  $('#opCondicion').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    estado.condicion = b.dataset.condicion; guardar(); ir(8);
  });

  // ---------- 8. ¿Qué pasa después de cosechar? ----------
  $('#opDescanso').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    estado.descanso = b.dataset.descanso; guardar(); ir(9);
  });

  // ---------- 9. ¿Qué te gustaría explorar? (con datos reales de cultivos.json, no cifras inventadas) ----------
  function pintarEstrategia() {
    const c = cultivoSel();
    const todos = (D.cultivos && D.cultivos.datos) || [];
    const frijol = todos.find(x => x.cultivo === 'frijol');
    const calabaza = todos.find(x => x.cultivo === 'calabaza');
    $('#estratActualNombre').textContent = c ? corto(c).toLowerCase() : 'tu cultivo';
    $('#estratLeguminosaDato').innerHTML = frijol
      ? `Unos ${Math.round(frijol.ciclo_dias / 30)} meses y medio. Pide menos agua que el maíz y le devuelve abono a la tierra.`
      : SIN;
    $('#estratCalabazaDato').innerHTML = calabaza
      ? `Unos ${Math.round(calabaza.ciclo_dias / 30)} meses. Se siembra junto al maíz y sus hojas cubren la tierra.`
      : SIN;
  }
  $('#opEstrategia').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    estado.estrategia = b.dataset.estrategia; guardar(); ir(10);
  });

  // ---------- Tu plan ----------
  // armarPlan() junta todo en un resumen de texto plano (null = sin dato). La pantalla y el mensaje
  // de WhatsApp salen de ese mismo resumen, así que nunca dicen cosas distintas.
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
        ['Riego', estado.riego ? RIEGO[estado.riego] || estado.riego : null],
        ['Lo que notas en tu parcela', estado.condicion ? CONDICION[estado.condicion] || estado.condicion : null],
        ['Después de cosechar', estado.descanso ? DESCANSO[estado.descanso] || estado.descanso : null],
        ['Para tu próxima siembra', estado.estrategia ? ESTRATEGIA[estado.estrategia] || estado.estrategia : null],
      ],
      zona: z, cultivo: c,
    };

    // Fechas del cultivo elegido (calendario.json, o referencia de cultivos.json si no hay fila en calendario.json)
    const filasZona = (cal.datos || []).filter(r => r.zona_id === z.zona_id);
    const filaLluvia = filasZona.find(r => r.actividad === 'siembra' && r.ventana_inicio && r.ventana_fin) || null;
    plan.ventanaLluvia = filaLluvia ? {
      ventana: `Del ${fechaCorta(filaLluvia.ventana_inicio)} al ${fechaCorta(filaLluvia.ventana_fin)}`,
      dia: fechaCorta(filaLluvia.fecha_recomendada),
      conf: typeof filaLluvia.confianza === 'number' ? `${Math.round(filaLluvia.confianza * 100)} %` : null,
      porque: filaLluvia.razon ? razonAmigable(filaLluvia.razon) : null,
    } : null;
    const filas = filasZona.filter(r => r.cultivo === c.cultivo);
    const sumarDias = (iso, dias) => {
      const [yy, mm, dd] = iso.split('-').map(Number);
      const dt = new Date(Date.UTC(yy, mm - 1, dd + dias));
      return dt.toISOString().slice(0, 10);
    };
    const anioCal = (filasZona.find(r => r.fecha_recomendada) || {}).fecha_recomendada;
    const anioRef = anioCal ? anioCal.slice(0, 4) : null;
    plan.fechas = filas.length ? ACT.map(([clave, etiqueta]) => {
      const r = filas.find(x => x.actividad === clave);
      return {
        etiqueta,
        dia: (r && fecha(r.fecha_recomendada)) || null,
        ventana: r && r.ventana_inicio && r.ventana_fin ? `Del ${fechaCorta(r.ventana_inicio)} al ${fechaCorta(r.ventana_fin)}` : null,
        conf: r && typeof r.confianza === 'number' ? `${Math.round(r.confianza * 100)} %` : null,
        porque: r && r.razon ? razonAmigable(r.razon) : null,
      };
    }) : (c.inicio_referencia && anioRef ? [
      {
        etiqueta: 'Siembra',
        dia: fecha(`${anioRef}-${c.inicio_referencia}`),
        ventana: plan.ventanaLluvia ? plan.ventanaLluvia.ventana : null,
        conf: null,
        porque: `Fecha de referencia del cálculo de agua (${typeof c.agua_ciclo_mm === 'number' ? `${c.agua_ciclo_mm} mm` : 'sin dato'}${typeof c.ciclo_dias === 'number' ? ` en ${c.ciclo_dias} días` : ''}). No se optimizó: tómala como punto de partida.`,
      },
      { etiqueta: 'Fertilización', dia: null, ventana: null, conf: null, porque: null },
      {
        etiqueta: 'Cosecha',
        dia: typeof c.ciclo_dias === 'number' ? fecha(sumarDias(`${anioRef}-${c.inicio_referencia}`, c.ciclo_dias)) : null,
        ventana: null,
        conf: null,
        porque: typeof c.ciclo_dias === 'number' ? `Siembra de referencia más ${c.ciclo_dias} días de ciclo. Es un cálculo, no un pronóstico.` : null,
      },
    ] : null);
    plan.sinFechas = `Todavía no tengo fechas de ${nombreC} para tu zona.`;

    // Suelo (SoilGrids en cultivos.json) y clima satelital de la zona (clima_zona.json)
    plan.suelo = (D.cultivos && D.cultivos.suelo_zona) || null;
    plan.clima = ((D.climaZona && D.climaZona.datos) || []).find(x => x.zona_id === z.zona_id) || null;

    // Lo que se midió en El Llano (cosechas del gobierno, agua con su clima) solo se muestra con
    // números a quien está en esa zona; a los demás se les dice que aún no hay datos de su zona.
    const enLlano = cob.cubre && z.zona_id === 'z1';
    const meses = d => { if (typeof d !== 'number') return null; const m = Math.round(d / 15) / 2; return `unos ${Math.floor(m)} ${Math.floor(m) === 1 ? 'mes' : 'meses'}${m % 1 ? ' y medio' : ''}`; };
    const litros = mm => typeof mm === 'number' ? `unos ${miles(mm)} litros por metro cuadrado` : null;
    const parte = p => p <= 40 ? 'como un tercio de lo normal' : p <= 60 ? 'como la mitad de lo normal' : p <= 85 ? 'como tres cuartas partes de lo normal' : 'casi lo normal';
    const nombreBonito = x => x.cultivo === 'calabaza' ? 'Calabaza (en la milpa, junto al maíz)' : corto(x);

    // Años que le ha tocado sembrar (anios_malos_2003_2025 de cultivos.json): solo en El Llano
    const malos = enLlano && Array.isArray(c.anios_malos_2003_2025) ? c.anios_malos_2003_2025 : null;
    const serieSiap = ((D.serie && D.serie.datos) || []).filter(r => typeof r.anio_malo_siap === 'boolean');
    const totalCiclos = serieSiap.length || null;
    plan.ciclosBuenos = (malos && totalCiclos) ? { buenos: totalCiclos - malos.length, total: totalCiclos, malos: malos.length, lista: malos } : null;
    const hoy = new Date().getFullYear();
    plan.anios = null;
    if (estado.anios > 0 && malos) {
      const desdePedido = hoy - estado.anios;
      const desde = Math.max(2003, desdePedido), hasta = Math.min(2025, hoy - 1);
      const tocados = malos.filter(a => a >= desde && a <= hasta);
      plan.anios = desde > hasta ? { sinDato: true } : {
        n: tocados.length, tocados, desde, hasta,
        texto: `${tocados.length ? `${tocados.length} año${tocados.length === 1 ? '' : 's'} malo${tocados.length === 1 ? '' : 's'}` : 'Ningún año malo'} para ${art(c)} ${nombreC} en tu zona entre ${desde} y ${hasta}.`,
        nota: `Año malo: se cosechó menos de la mitad de lo normal.${desdePedido < 2003 ? ' Los registros empiezan en 2003.' : ''}`,
      };
    }

    // Comparación de caminos y una sección por cada prioridad (cultivos.json)
    const todos = (D.cultivos && D.cultivos.datos) || [];
    const maiz = todos.find(x => x.cultivo === 'maiz') || null;
    const frijol = todos.find(x => x.cultivo === 'frijol') || null;
    const calabaza = todos.find(x => x.cultivo === 'calabaza') || null;
    const altCultivo = estado.estrategia === 'calabaza' && calabaza && c.cultivo !== 'calabaza' ? calabaza
      : (frijol && c.cultivo !== 'frijol' ? frijol : (calabaza || maiz || c));
    plan.rotacion = { elegida: estado.estrategia ? ESTRATEGIA[estado.estrategia] || estado.estrategia : null, alterno: altCultivo,
      maiz, frijol, calabaza, todos, totalCiclos, enLlano };
    const tuyo = x => x.cultivo === c.cultivo;
    const comoMaiz = x => {
      if (!maiz || typeof x.agua_ciclo_mm !== 'number' || x.cultivo === 'maiz') return null;
      const f = x.agua_ciclo_mm / maiz.agua_ciclo_mm;
      return f <= 0.55 ? 'la mitad del agua que el maíz' : f <= 0.75 ? 'como dos terceras partes del agua del maíz' : f <= 0.9 ? 'un poco menos agua que el maíz' : 'casi la misma agua que el maíz';
    };
    const notaOtraZona = 'Para tu zona todavía no tengo registros de cosecha. El agua se calculó con el clima de El Llano (Querétaro): en tu lugar puede variar un poco.';
    plan.bloques = [];
    if (todos.length) {
      plan.bloques.push({
        titulo: 'Tres caminos para tu tierra',
        intro: estado.estrategia ? `Elegiste ver: ${ESTRATEGIA[estado.estrategia] || estado.estrategia}. Así se comparan:` : 'Así se comparan:',
        filas: todos.map(x => {
          const m = Array.isArray(x.anios_malos_2003_2025) ? x.anios_malos_2003_2025.length : null;
          const partes = [
            meses(x.ciclo_dias),
            x.cultivo === 'maiz' ? 'el que más agua pide' : comoMaiz(x) ? `pide ${comoMaiz(x)}` : null,
            enLlano && m != null && totalCiclos ? `le fue bien ${totalCiclos - m} de cada ${totalCiclos} años` : null,
            enLlano && typeof x.ingreso_bruto_ha_anio_normal_mxn === 'number' ? `deja unos $${miles(x.ingreso_bruto_ha_anio_normal_mxn)} por hectárea` : null,
            enLlano && m == null ? 'no hay registros de su cosecha' : null,
          ];
          return { n: `${nombreBonito(x)}${tuyo(x) ? ' · lo que siembras hoy' : ''}`, tuyo: tuyo(x), v: partes.filter(Boolean).join(' · ') || null };
        }),
        aviso: null,
        nota: 'El frijol le devuelve a la tierra parte del abono que se llevó el maíz. La calabaza cubre la tierra con sus hojas y ayuda a que no se seque. Lo que todavía no sé: cuánto te cuesta sembrar, cuánto abono necesitas y a cuánto te compran; eso revísalo con un técnico o con quien te compra.'
          + (enLlano ? '' : ` ${notaOtraZona}`),
      });
    }
    if (estado.prioridades.includes('cosecha')) {
      const pct = c.rendimiento_en_anios_malos_maiz_pct_de_lo_normal;
      plan.bloques.push({
        titulo: '¿Cómo le ha ido a tu cultivo?',
        filas: enLlano ? [
          { n: 'Años malos, de 2003 a 2025', v: malos && totalCiclos ? `${malos.length} de ${totalCiclos}` : (Array.isArray(c.anios_malos_2003_2025) ? null : 'no hay registros de su cosecha') },
          { n: c.cultivo === 'maiz' ? 'En esos años se cosechó' : `Cuando al maíz le fue mal, ${art(c)} ${nombreC} dio`, v: typeof pct === 'number' ? parte(pct) : null },
          { n: 'Años en que le faltó agua', v: c.anios_con_falta_agua_mas_15pct ? c.anios_con_falta_agua_mas_15pct.split(' (')[0] : null },
        ] : [{ n: 'Cosechas de tu zona', v: 'todavía no tengo registros' }],
        nota: enLlano ? 'Registros de cosecha del gobierno y lluvia medida por la NASA, de 2003 a 2025.' : null,
      });
    }
    if (estado.prioridades.includes('agua')) {
      const orden = todos.slice().sort((a, b) => (a.agua_ciclo_mm ?? Infinity) - (b.agua_ciclo_mm ?? Infinity));
      const max = Math.max(...todos.map(x => x.agua_ciclo_mm || 0)) || 1;
      plan.bloques.push({
        titulo: '¿Cuánta agua pide cada cultivo?',
        intro: 'En toda su temporada (barra más larga = más agua):',
        barras: orden.map(x => ({
          n: `${corto(x)}${tuyo(x) ? ' (el tuyo)' : ''}`, tuyo: tuyo(x), cultivo: x.cultivo,
          pct: x.agua_ciclo_mm ? x.agua_ciclo_mm / max : 0,
          v: [litros(x.agua_ciclo_mm), meses(x.ciclo_dias)].filter(Boolean).join(' en ') || null,
        })),
        nota: enLlano ? 'Calculado con el clima que mide la NASA en tu zona.' : 'Calculado con el clima de El Llano (Querétaro): en tu lugar puede variar un poco.',
      });
    }
    if (estado.prioridades.includes('ganar')) {
      const orden = todos.slice().sort((a, b) => (b.ingreso_bruto_ha_anio_normal_mxn ?? -1) - (a.ingreso_bruto_ha_anio_normal_mxn ?? -1));
      plan.bloques.push({
        titulo: '¿Cuánto deja una hectárea?',
        intro: enLlano ? 'En un año normal, sin contar lo que gastas en sembrar:' : null,
        filas: enLlano
          ? orden.map(x => ({ n: `${corto(x)}${tuyo(x) ? ' (el tuyo)' : ''}`, tuyo: tuyo(x), v: typeof x.ingreso_bruto_ha_anio_normal_mxn === 'number' ? `$${miles(x.ingreso_bruto_ha_anio_normal_mxn)}` : 'no hay registros de su cosecha' }))
          : [{ n: 'Cosechas y precios de tu zona', v: 'todavía no los tengo' }],
        aviso: null,
        nota: enLlano ? 'Es lo que se cosecha en la zona por el precio promedio del estado. Como faltan tus gastos, no es ganancia.' : null,
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
    // Sin zona con modelo: si su celda de la NASA tiene datos, se muestran (no se deja sin respuesta).
    const celPlan = plan.soloAviso ? celdaClima(estado.lugar) : null;
    $('#hSinC').textContent = celPlan ? 'Tu tierra, vista desde la NASA' : 'Aún no tenemos datos de tu zona';
    $('#sinCTexto').textContent = celPlan
      ? 'Para tu lugar tengo la humedad del suelo y la lluvia que mide la NASA. Las fechas de siembra todavía no: dependen de la lluvia de cada zona y aún no las calculamos para aquí.'
      : plan.sinCobertura;
    $('#sinCFilas').hidden = !celPlan;
    $('#resSinCobertura').classList.toggle('sin-cobertura', !celPlan);
    $('#sinCFilas').innerHTML = celPlan
      ? filasCelda(celPlan).map(([n, v, sub]) => `<li><span>${esc(n)}<br><small class="fine">${esc(sub)}</small></span><b>${v == null ? SIN : esc(v)}</b></li>`).join('')
      : '';
    $('#btnReferencia').textContent = `Ver el plan de ${plan.cobertura.z.nombre} como referencia`;
    $('#resReferencia').hidden = !plan.referencia;
    $('#resReferencia').textContent = plan.avisoReferencia || '';
    ['#resCalendario', '#resPrioridades', '#resFuente'].forEach(s => { $(s).hidden = plan.soloAviso; });

    $('#calLista').innerHTML = !plan.fechas
      ? `<p>${esc(plan.sinFechas)} Abajo te muestro lo que sí sé del cultivo.</p>`
      : `<ol class="fechas">${plan.fechas.map(f => `<li class="fecha-item">
          <span class="etq">${esc(f.etiqueta)}</span>
          <span class="dia">${o(f.dia)}</span>
          ${f.ventana ? `<span class="ventana">Días buenos: ${esc(f.ventana)}</span>` : ''}
          ${f.conf ? `<span class="conf">Confianza: <b>${esc(f.conf)}</b></span>` : ''}
          <span class="porque">${f.porque ? esc(f.porque) : `¿Por qué? ${SIN}`}</span>
        </li>`).join('')}</ol>`;
    $('#calMetodo').textContent = plan.fechas ? (plan.metodo || '') : '';

    $('#resAnios').hidden = !plan.anios || plan.soloAviso;
    if (plan.anios) {
      const a = plan.anios;
      $('#aniosCuerpo').innerHTML = a.sinDato ? `<p>${SIN} para esos años.</p>` : `
        <p class="grande">${esc(a.texto).replace(/^(\d+|Ningún)/, '<b>$1</b>')}</p>
        ${a.n ? `<div class="chips-anios">${a.tocados.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
        ${a.nota ? `<p class="fine">${esc(a.nota)}</p>` : ''}`;
    }

    $('#resPrioridades').innerHTML = plan.bloques.map(b => `<article class="bloque"><h2>${esc(b.titulo)}</h2>
      ${b.intro ? `<p>${esc(b.intro)}</p>` : ''}
      ${b.filas ? `<ul class="datos">${b.filas.map(f => `<li class="${f.tuyo ? 'tuyo' : ''}"><span>${esc(f.n)}</span><b>${o(f.v)}</b></li>`).join('')}</ul>` : ''}
      ${b.barras ? `<ul class="barras">${b.barras.map(x => `<li class="${x.tuyo ? 'tuyo' : ''}">
          <span class="n">${esc(x.n)}</span>
          <span class="b"><i style="width:${x.pct * 100}%;background:var(--c-${esc(x.cultivo)},var(--dot))"></i></span>
          <span class="v">${o(x.v)}</span></li>`).join('')}</ul>` : ''}
      ${b.aviso ? `<p class="aviso">${esc(b.aviso)}</p>` : ''}
      ${b.nota ? `<p class="fine">${esc(b.nota)}</p>` : ''}</article>`).join('');
    $('#resFuente').textContent = plan.fuente || '';
    if (plan.soloAviso && celPlan) amealquito(10, 'neutral', `Para tu lugar ya tengo la humedad y la lluvia de la NASA; las fechas de siembra todavía no. Si quieres, te enseño ${plan.cobertura.z.nombre} solo como referencia.`);
    else if (plan.soloAviso) amealquito(10, 'triste', `Lo siento, todavía no tengo datos de tu zona. Si quieres, te enseño ${plan.cobertura.z.nombre} solo como referencia.`);
    else if (plan.referencia) amealquito(10, 'neutral', 'Esto es de otra zona. Úsalo solo como referencia y compáralo con lo que tú ves en tu parcela.');
    else if (!plan.fechas) amealquito(10, 'nervioso', `No encontré fechas de ${corto(plan.cultivo).toLowerCase()} en tu zona, pero te muestro lo que sí sé del cultivo.`);
    else amealquito(10, 'feliz', '¡Listo! Este es tu plan. Recuerda: yo te acompaño, pero la decisión final es tuya.');
  }

  $('#btnReferencia').addEventListener('click', () => { estado.verReferencia = true; guardar(); pintarPlan(); $('#resReferencia').focus && window.scrollTo(0, 0); });

  // Empezar de nuevo: se borran las respuestas guardadas para que al recargar no vuelva el plan anterior.
  $('#btnReiniciar').addEventListener('click', () => {
    try { localStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ }
    location.reload();
  });

  // ---------- plan por WhatsApp: formato Field Shift con datos reales de data/processed ----------
  function textoWhatsApp(plan) {
    const r = Object.fromEntries(plan.respuestas);
    const c = plan.cultivo || {};
    const cob = plan.cobertura;
    const z = plan.zona || {};
    const L = [
      '🌾 *Plan de siembra y rotación para su parcela*',
      `📍 *Ubicación:* ${r['Lugar'] || 'sin dato'}${cob ? (cob.cubre ? ` (${z.nombre}, a ${cob.kmTxt} km)` : ` (a ${cob.kmTxt} km de ${z.nombre}; datos de otra zona como referencia)`) : ''}`,
      `🌱 *Cultivo actual:* ${c.nombre || corto(c)}${typeof c.ciclo_dias === 'number' ? ` (${c.ciclo_dias} días)` : ''}${r['Riego'] ? ` · ${r['Riego']}` : ''}`,
    ];
    const obs = [r['Lo que notas en tu parcela'], r['Después de cosechar']].filter(Boolean).join(' · ');
    if (obs) L.push(`👁️ *Contexto en campo:* ${obs}`);
    if (cob && !cob.cubre) {
      L.push(`⚠️ *Nota de cobertura:* Tu lugar está fuera del radio de ${z.radio_cobertura_km || 'sin dato'} km de ${z.nombre}. Lo que sigue usa datos de esa zona solo como referencia.`);
    }

    // 1. Lo que marca el historial satelital
    L.push('', '📊 *Lo que marca el historial satelital (2003–2025):*');
    const fSiembra = (plan.fechas || []).find(f => f.etiqueta === 'Siembra');
    const fCosecha = (plan.fechas || []).find(f => f.etiqueta === 'Cosecha');
    const vl = plan.ventanaLluvia;
    if (fSiembra && (fSiembra.dia || fSiembra.ventana)) {
      const ventTxt = fSiembra.ventana
        ? `*${fSiembra.ventana.replace(/^Del /i, 'Del ')}*${fSiembra.dia ? ` (fecha recomendada: *${fSiembra.dia}*` + (fSiembra.conf ? `, confianza *${fSiembra.conf}*` : '') + ')' : ''}`
        : `Siembra de referencia el *${fSiembra.dia}*${vl && vl.ventana ? ` (lluvias firmes en la zona: *${vl.ventana.toLowerCase()}*${vl.dia ? `, fecha más común *${vl.dia}*` : ''})` : ''}`;
      const cosTxt = fCosecha && fCosecha.dia ? ` Cosecha estimada: *${fCosecha.dia}*.` : '';
      L.push(`• *Ventana recomendada de siembra:* ${ventTxt}.${fSiembra.porque ? ` ${fSiembra.porque}` : ''}${cosTxt}`);
    } else if (vl && vl.ventana) {
      L.push(`• *Ventana recomendada de siembra:* *${vl.ventana}*${vl.dia ? ` (fecha más común: *${vl.dia}*)` : ''}.${vl.porque ? ` ${vl.porque}` : ''}`);
    } else {
      L.push(`• *Ventana recomendada de siembra:* ${plan.sinFechas}`);
    }

    const hr = plan.clima && plan.clima.humedad_raiz;
    const lt = plan.clima && plan.clima.lluvia_temporada;
    const su = plan.suelo;
    const partesAgua = [];
    if (hr && typeof hr.valor === 'number') {
      partesAgua.push(`Humedad en zona de raíces *${hr.estado || 'medida'}* (*${hr.valor}* vs *${hr.normal}* normal en ${hr.mes || 'el último mes'}, NASA POWER)`);
    }
    if (lt && typeof lt.mm === 'number' && typeof lt.normal_mm === 'number') {
      partesAgua.push(`lluvia acumulada de temporada *${lt.mm} mm* vs *${lt.normal_mm} mm* normal`);
    }
    if (su && typeof su.agua_disponible_mm_por_m === 'number') {
      partesAgua.push(`el suelo guarda *${su.agua_disponible_mm_por_m} mm/m* (SoilGrids${su.ph ? `, pH ${su.ph}` : ''})`);
    }
    if (typeof c.agua_ciclo_mm === 'number') {
      partesAgua.push(`su cultivo pide *${c.agua_ciclo_mm} mm*${typeof c.agua_ciclo_m3_ha === 'number' ? ` (*${miles(c.agua_ciclo_m3_ha)} m³/ha*)` : ''} en el ciclo`);
    }
    L.push(`• *Agua en el subsuelo:* ${partesAgua.length ? partesAgua.join('; ') + '.' : 'sin dato.'}`);

    const cb = plan.ciclosBuenos;
    const faltaAgua = c.anios_con_falta_agua_mas_15pct ? c.anios_con_falta_agua_mas_15pct.split(' (')[0] : null;
    const hel = plan.clima && plan.clima.heladas;
    const partesRiesgo = [];
    if (cb) {
      partesRiesgo.push(`En *${cb.buenos} de cada ${cb.total} ciclos* (2003–2025, SIAP) le fue bien al cultivo en tu zona (*${cb.malos} años malos*: ${cb.lista.join(', ')})`);
    }
    if (plan.anios && plan.anios.texto) partesRiesgo.push(plan.anios.texto.replace(/\.$/, ''));
    if (faltaAgua) partesRiesgo.push(`falta de agua (>15 %) en *${faltaAgua}* temporadas`);
    if (hel && typeof hel.dias_por_anio === 'number') {
      partesRiesgo.push(`heladas: *${hel.dias_por_anio} días/año*${Array.isArray(hel.meses) && hel.meses.length ? ` (${hel.meses.join(', ')})` : ''}`);
    }
    L.push(`• *Riesgo por clima:* ${partesRiesgo.length ? partesRiesgo.join('; ') + '.' : 'sin dato.'}`);

    // 2. Opción sugerida de rotación para cuidar tierra y bolsillo + comparación de las 3 estrategias
    const rot = plan.rotacion || {};
    const alt = rot.alterno;
    const maiz = rot.maiz;
    if (alt) {
      const refAguaBase = (maiz && typeof maiz.agua_ciclo_mm === 'number' && alt.cultivo !== 'maiz') ? maiz : c;
      const ahorroMm = (typeof refAguaBase.agua_ciclo_mm === 'number' && typeof alt.agua_ciclo_mm === 'number' && refAguaBase.agua_ciclo_mm > alt.agua_ciclo_mm)
        ? refAguaBase.agua_ciclo_mm - alt.agua_ciclo_mm : null;
      const altFalta = alt.anios_con_falta_agua_mas_15pct ? alt.anios_con_falta_agua_mas_15pct.split(' (')[0] : null;
      const altRendSeco = alt.rendimiento_en_anios_malos_maiz_pct_de_lo_normal;
      const maizRendSeco = maiz && maiz.rendimiento_en_anios_malos_maiz_pct_de_lo_normal;
      const altInicio = alt.inicio_referencia ? fechaCorta(`2027-${alt.inicio_referencia}`) : null;
      L.push(
        '',
        '🔄 *Opción sugerida para cuidar tierra y bolsillo:*',
        `Alternar con *${alt.nombre || corto(alt)}* (${typeof alt.ciclo_dias === 'number' ? `ciclo corto de *${alt.ciclo_dias} días*` : 'ciclo alternativo'}${altInicio ? `, siembra de referencia *${altInicio}*` : ''}):`,
        `• *Ahorro de agua:* Pide *${typeof alt.agua_ciclo_mm === 'number' ? `${alt.agua_ciclo_mm} mm` : 'sin dato'}* por ciclo${typeof alt.agua_ciclo_m3_ha === 'number' ? ` (*${miles(alt.agua_ciclo_m3_ha)} m³/ha*)` : ''}${ahorroMm ? `, *${ahorroMm} mm menos* que ${art(refAguaBase)} ${corto(refAguaBase).toLowerCase()} (${refAguaBase.agua_ciclo_mm} mm)` : ''}${altFalta ? `; falta de agua (>15 %) en *${altFalta}* temporadas` : ''}.`,
        `• *Ahorro en abono y suelo:* ${alt.cultivo === 'frijol' ? 'Como leguminosa fija nitrógeno natural en el suelo para el siguiente ciclo' : (alt.cultivo === 'calabaza' ? 'En la milpa se siembra con el maíz y sus hojas cubren la tierra' : 'Cubre el suelo y protege la humedad')}${typeof altRendSeco === 'number' ? ` y en años malos del maíz rindió *${altRendSeco} % de lo normal*${typeof maizRendSeco === 'number' ? ` (frente a *${maizRendSeco} %* del maíz)` : ''}` : ''}. Dosis de fertilizante: *sin dato local* (revisar con técnico en campo).`,
        `• *Salida comercial:* ${typeof alt.ingreso_bruto_ha_anio_normal_mxn === 'number' ? `Ingreso bruto medio de *$${miles(alt.ingreso_bruto_ha_anio_normal_mxn)}/ha* en año normal` : 'Ingreso bruto: sin dato'}${typeof alt.precio_medio_rural_mxn_t === 'number' ? ` (precio medio rural en Querétaro: *$${miles(alt.precio_medio_rural_mxn_t)}/t*, SIAP; faltan costos de producción)` : ''}.`
      );
      const avisoRot = alt.aviso || c.aviso || (alt.nota && alt.cultivo === 'calabaza' ? alt.nota : null);
      if (avisoRot) L.push(`• *Riesgo a considerar:* ${avisoRot}`);
    }

    if (Array.isArray(rot.todos) && rot.todos.length) {
      L.push('', '📋 *Tres caminos para tu tierra:*');
      rot.todos.forEach((x, idx) => {
        const m = Array.isArray(x.anios_malos_2003_2025) ? x.anios_malos_2003_2025.length : null;
        const b = (m != null && rot.totalCiclos) ? `${rot.totalCiclos - m} de ${rot.totalCiclos} ciclos buenos` : null;
        const ag = typeof x.agua_ciclo_mm === 'number' ? `${x.agua_ciclo_mm} mm de agua` : null;
        const ing = typeof x.ingreso_bruto_ha_anio_normal_mxn === 'number' ? `$${miles(x.ingreso_bruto_ha_anio_normal_mxn)}/ha brutos` : null;
        const esTuyo = x.cultivo === c.cultivo ? ' _(tu cultivo actual)_' : '';
        const sinSiap = m == null && ing == null ? 'cosechas sin registro (SIAP)' : null;
        L.push(`${idx + 1}. *${x.nombre || corto(x)}*${typeof x.ciclo_dias === 'number' ? ` (${x.ciclo_dias} días)` : ''}${esTuyo}: ${[ag, b, ing, sinSiap].filter(Boolean).join(' · ')}`);
      });
    }

    L.push(
      '',
      '🤝 _Este reporte es una segunda opinión desde el satélite para respaldar su inversión. Usted conoce su tierra y tiene la última palabra._',
      '',
      '— *Milpa Clara* 🛰️'
    );
    return L.join('\n');
  }
  $('#btnWhatsApp').addEventListener('click', () => {
    const plan = ultimoPlan || armarPlan();
    if (!plan) return;
    window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(textoWhatsApp(plan))}&type=custom_url&app_absent=0`, '_blank', 'noopener');
    amealquito(10, 'feliz', '¡Listo! Elige a quién mandarle tu plan en WhatsApp.');
  });

  // ---------- arranque ----------
  Promise.allSettled([cargar('cultivos'), cargar('zonas'), cargar('calendario'), cargar('imagen_zona'), cargar('municipios'), cargar('serie_regional'), cargar('clima_zona'), cargar('suelo_zonas'), cargar('clima_mexico')]).then(([cu, zo, ca, im, mu, se, cz, sz, cm]) => {
    D.serie = se.status === 'fulfilled' ? se.value : null;
    D.cultivos = cu.status === 'fulfilled' ? cu.value : null;
    D.zonas = zo.status === 'fulfilled' ? zo.value : null;
    D.calendario = ca.status === 'fulfilled' ? ca.value : null;
    D.imagen = im.status === 'fulfilled' ? im.value : null;
    D.municipios = mu.status === 'fulfilled' ? mu.value : null;
    D.climaZona = cz && cz.status === 'fulfilled' ? cz.value : null;
    D.sueloZonas = sz && sz.status === 'fulfilled' ? sz.value : null;
    D.climaMx = cm && cm.status === 'fulfilled' ? cm.value : null;
    if (!D.cultivos || !D.zonas) {
      $('#opCultivo').innerHTML = '<p class="aviso">No se pudieron leer los datos. Abre el sitio con <code>npx vercel dev</code> desde la carpeta del proyecto, no el archivo <code>index.html</code> directamente.</p>';
      amealquito(1, 'triste', 'No pude cargar mis datos… Intenta abrir la página de nuevo.');
      return;
    }
    pintarCultivos(); prepararMunicipios(); pintarPrioridades();
    // Si ya contestó todo antes en este teléfono, va directo a su plan.
    const completo = cultivoSel() && cobertura() && estado.prioridades.length && estado.estrategia;
    ir(completo ? 10 : 1, false);
  });
})();
