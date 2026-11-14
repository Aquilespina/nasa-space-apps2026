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
  const CLAVE = 'milpaclara.respuestas.v1';
  let estado = { cultivo: null, zona: null, distanciaKm: null, anios: 10, prioridades: [] };
  try { Object.assign(estado, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch (e) { /* sin almacenamiento */ }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } };

  let D = { cultivos: null, zonas: null, calendario: null, imagen: null };
  const corto = c => {
    const n = (c && c.nombre) || '';
    return n.split(/\s+/)[0] || (c && c.cultivo) || '';
  };
  const art = c => (/^avena/i.test(corto(c)) ? 'la' : 'el');
  const cultivoSel = () => (D.cultivos && D.cultivos.datos || []).find(c => c.cultivo === estado.cultivo);
  const zonaSel = () => (D.zonas && D.zonas.datos || []).find(z => z.zona_id === estado.zona);

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

  // ---------- 2. ¿Dónde cultivas? ----------
  function pintarZonas() {
    const Z = (D.zonas && D.zonas.datos) || [];
    $('#opZona').innerHTML = Z.length ? Z.map(z =>
      `<button type="button" class="opcion" data-zona="${esc(z.zona_id)}" aria-pressed="${z.zona_id === estado.zona}">${esc(z.nombre)}</button>`).join('')
      : `<p>${SIN}: no hay zonas.</p>`;
  }
  $('#opZona').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    estado.zona = b.dataset.zona; estado.distanciaKm = null; guardar(); ir(3);
  });
  const km = (a, b, c, d) => {
    const R = 6371, r = x => x * Math.PI / 180;
    const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  $('#btnUbicacion').addEventListener('click', () => {
    const m = $('#msgZona');
    if (!navigator.geolocation) { m.hidden = false; m.textContent = 'Tu teléfono no permite usar la ubicación. Elige tu zona de la lista.'; return; }
    m.hidden = false; m.textContent = 'Buscando tu ubicación…';
    navigator.geolocation.getCurrentPosition(pos => {
      const Z = ((D.zonas && D.zonas.datos) || []).filter(z => z.lat != null && z.lon != null);
      if (!Z.length) { m.textContent = 'No hay zonas con coordenadas.'; return; }
      const conDist = Z.map(z => ({ z, d: km(pos.coords.latitude, pos.coords.longitude, z.lat, z.lon) })).sort((a, b) => a.d - b.d);
      estado.zona = conDist[0].z.zona_id; estado.distanciaKm = Math.round(conDist[0].d); guardar();
      m.hidden = true; ir(3);
    }, () => { m.textContent = 'No se pudo usar tu ubicación. Elige tu zona de la lista.'; }, { timeout: 15000, maximumAge: 600000 });
  });

  // ---------- 3. ¿Es este lugar? ----------
  function pintarLugar() {
    const z = zonaSel();
    if (!z) { ir(2); return; }
    $('#lugarNombre').textContent = z.nombre || 'sin dato';
    const notas = [];
    if (estado.distanciaKm != null) notas.push(`Es la zona con datos más cercana a ti: está a unos ${estado.distanciaKm} km.`);
    notas.push('Los datos de lluvia y clima describen toda la zona, no tu parcela exacta.');
    $('#lugarNota').textContent = notas.join(' ');
    $('#lugarNota').title = z.nota || '';

    const im = D.imagen && D.imagen.datos;
    const img = $('#mapaImg'), pin = $('#mapaPin');
    if (!im || !im.archivo) { $('#mapa').hidden = true; return; }
    $('#mapa').hidden = false;
    img.src = im.archivo;
    img.alt = `Imagen de satélite de la zona ${z.nombre || ''}`;
    $('#mapaPie').textContent = `${im.producto || 'Imagen de satélite'} · ${im.fecha_imagen ? fecha(im.fecha_imagen) : 'sin dato'}`;
    const dentro = z.lat != null && z.lon != null && z.lat <= im.norte && z.lat >= im.sur && z.lon >= im.oeste && z.lon <= im.este;
    pin.hidden = !dentro;
    if (dentro) {
      pin.style.left = `${((z.lon - im.oeste) / (im.este - im.oeste)) * 100}%`;
      pin.style.top = `${((im.norte - z.lat) / (im.norte - im.sur)) * 100}%`;
    } else {
      $('#mapaPie').textContent += ' · esta zona queda fuera de la imagen';
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
  const ACT = [['siembra', 'Siembra'], ['fertilizacion', 'Fertilización'], ['cosecha', 'Cosecha']];
  function pintarPlan() {
    const c = cultivoSel(), z = zonaSel();
    if (!c || !z) { ir(1); return; }
    const nombreC = corto(c).toLowerCase();
    $('#pr').textContent = `Tu plan para ${corto(c).toLowerCase()} en ${z.nombre}`;
    const cal = D.calendario || {};
    $('#resEjemplo').hidden = ![D.zonas, cal].some(d => d && d.ejemplo === true);

    // Calendario del cultivo elegido
    const filas = (cal.datos || []).filter(r => r.zona_id === z.zona_id && r.cultivo === c.cultivo);
    $('#calLista').innerHTML = !filas.length
      ? `<p>${SIN}: todavía no tenemos fechas de ${esc(nombreC)} para esta zona. Abajo puedes ver qué necesita el cultivo.</p>`
      : `<ol class="fechas">${ACT.map(([clave, etiqueta]) => {
        const r = filas.find(x => x.actividad === clave);
        const f = r && fecha(r.fecha_recomendada);
        const v = r && r.ventana_inicio && r.ventana_fin ? `Del ${fechaCorta(r.ventana_inicio)} al ${fechaCorta(r.ventana_fin)}` : null;
        const conf = r && typeof r.confianza === 'number' ? `${Math.round(r.confianza * 100)} %` : null;
        return `<li class="fecha-item">
          <span class="etq">${etiqueta}</span>
          <span class="dia">${f || SIN}</span>
          ${v ? `<span class="ventana">Días buenos: ${v}</span>` : ''}
          ${conf ? `<span class="conf">Confianza: <b>${conf}</b></span>` : ''}
          <span class="porque">${r && r.razon ? esc(razonAmigable(r.razon)) : `¿Por qué? ${SIN}`}</span>
        </li>`;
      }).join('')}</ol>`;
    const gen = cal.generado_por;
    $('#calMetodo').innerHTML = gen === 'red_neuronal' ? 'Calculado por la inteligencia artificial.'
      : gen === 'baseline' ? 'Calculado con las lluvias de años pasados, sin inteligencia artificial.' : '';

    // Años que le ha tocado sembrar (anios_malos_2003_2025 de cultivos.json)
    const malos = Array.isArray(c.anios_malos_2003_2025) ? c.anios_malos_2003_2025 : null;
    const hoy = new Date().getFullYear();
    if (estado.anios > 0 && malos) {
      const desdePedido = hoy - estado.anios;
      const desde = Math.max(2003, desdePedido), hasta = Math.min(2025, hoy - 1);
      const tocados = malos.filter(a => a >= desde && a <= hasta);
      $('#resAnios').hidden = false;
      $('#aniosCuerpo').innerHTML = desde > hasta ? `<p>${SIN} para esos años.</p>` : `
        <p class="grande">${tocados.length ? `<b>${tocados.length}</b> año${tocados.length === 1 ? '' : 's'} malo${tocados.length === 1 ? '' : 's'}` : '<b>Ningún</b> año malo'} para ${art(c)} ${esc(nombreC)} en Amealco entre ${desde} y ${hasta}.</p>
        ${tocados.length ? `<div class="chips-anios">${tocados.map(a => `<span>${a}</span>`).join('')}</div>` : ''}
        <p class="fine">Año malo: el cultivo rindió menos de la mitad de lo normal en el municipio (SIAP).${desdePedido < 2003 ? ' Los datos empiezan en 2003.' : ''}</p>`;
    } else {
      $('#resAnios').hidden = true;
    }

    // Tarjetas según lo que eligió
    const todos = (D.cultivos && D.cultivos.datos) || [];
    const bloques = [];
    if (estado.prioridades.includes('cosecha')) {
      const pct = c.rendimiento_en_anios_malos_maiz_pct_de_lo_normal;
      bloques.push(`<article class="bloque"><h2>Mejorar tu cosecha</h2>
        <ul class="datos">
          <li><span>Años malos de ${esc(nombreC)} (2003–2025)</span><b>${malos ? malos.length : SIN}</b></li>
          <li><span>${c.cultivo === 'maiz' ? 'En sus años malos, el maíz rindió' : `En los años malos del maíz, ${art(c)} ${esc(nombreC)} rindió`}</span><b>${typeof pct === 'number' ? `${pct} % de lo normal` : SIN}</b></li>
          <li><span>Años en que le faltó agua</span><b>${c.anios_con_falta_agua_mas_15pct ? esc(c.anios_con_falta_agua_mas_15pct.split(' (')[0]) : SIN}</b></li>
        </ul>
        <p class="fine">Datos del municipio (SIAP) y del clima medido por la NASA, 2003–2025.</p></article>`);
    }
    if (estado.prioridades.includes('agua')) {
      const orden = todos.slice().sort((a, b) => (a.agua_ciclo_mm ?? Infinity) - (b.agua_ciclo_mm ?? Infinity));
      const max = Math.max(...todos.map(x => x.agua_ciclo_mm || 0)) || 1;
      bloques.push(`<article class="bloque"><h2>No gastar tanta agua</h2>
        <p>Agua que necesita cada cultivo en todo su ciclo:</p>
        <ul class="barras">${orden.map(x => `<li class="${x.cultivo === c.cultivo ? 'tuyo' : ''}">
          <span class="n">${esc(corto(x))}${x.cultivo === c.cultivo ? ' (el tuyo)' : ''}</span>
          <span class="b"><i style="width:${x.agua_ciclo_mm ? (x.agua_ciclo_mm / max) * 100 : 0}%;background:var(--c-${esc(x.cultivo)},var(--dot))"></i></span>
          <span class="v">${typeof x.agua_ciclo_mm === 'number' ? `${x.agua_ciclo_mm} mm` : SIN}${typeof x.agua_ciclo_m3_ha === 'number' ? ` (${miles(x.agua_ciclo_m3_ha)} m³ por hectárea)` : ''}${typeof x.ciclo_dias === 'number' ? ` · ${x.ciclo_dias} días` : ''}</span></li>`).join('')}</ul>
        <p class="fine">Calculado con el clima medido por la NASA y las tablas de agua de cada cultivo.</p></article>`);
    }
    if (estado.prioridades.includes('ganar')) {
      const orden = todos.slice().sort((a, b) => (b.ingreso_bruto_ha_anio_normal_mxn ?? -1) - (a.ingreso_bruto_ha_anio_normal_mxn ?? -1));
      bloques.push(`<article class="bloque"><h2>Aumentar tus cosechas</h2>
        <p>Lo que deja una hectárea en un año normal (antes de costos):</p>
        <ul class="datos">${orden.map(x => `<li class="${x.cultivo === c.cultivo ? 'tuyo' : ''}"><span>${esc(corto(x))}${x.cultivo === c.cultivo ? ' (el tuyo)' : ''}</span><b>${typeof x.ingreso_bruto_ha_anio_normal_mxn === 'number' ? `$${miles(x.ingreso_bruto_ha_anio_normal_mxn)}` : SIN}</b></li>`).join('')}</ul>
        ${c.aviso ? `<p class="aviso">${esc(c.aviso)}</p>` : ''}
        <p class="fine">Cosecha real en Amealco × precio medio en Querétaro. Faltan los costos, así que no es ganancia.</p></article>`);
    }
    $('#resPrioridades').innerHTML = bloques.join('');
    const cu = D.cultivos || {};
    $('#resFuente').textContent = cu.fecha_consulta ? `Datos del cultivo consultados el ${fecha(cu.fecha_consulta)}.` : '';
  }
  $('#btnReiniciar').addEventListener('click', () => ir(1));

  // ---------- arranque ----------
  Promise.allSettled([cargar('cultivos'), cargar('zonas'), cargar('calendario'), cargar('imagen_zona')]).then(([cu, zo, ca, im]) => {
    D.cultivos = cu.status === 'fulfilled' ? cu.value : null;
    D.zonas = zo.status === 'fulfilled' ? zo.value : null;
    D.calendario = ca.status === 'fulfilled' ? ca.value : null;
    D.imagen = im.status === 'fulfilled' ? im.value : null;
    if (!D.cultivos || !D.zonas) {
      $('#opCultivo').innerHTML = '<p class="aviso">No se pudieron leer los datos. Abre el sitio con un servidor: <code>python3 -m http.server 8000 -d site</code>.</p>';
      return;
    }
    pintarCultivos(); pintarZonas(); pintarPrioridades();
    // Si ya contestó todo antes en este teléfono, va directo a su plan.
    const completo = cultivoSel() && zonaSel() && estado.prioridades.length;
    ir(completo ? 6 : 1, false);
  });
})();
