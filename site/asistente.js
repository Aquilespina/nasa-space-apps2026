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
  // armarPlan() junta todo en un resumen de texto plano (null = sin dato). La pantalla y el PDF
  // se dibujan desde ese mismo resumen, así que nunca dicen cosas distintas.
  const ACT = [['siembra', 'Siembra'], ['fertilizacion', 'Fertilización'], ['cosecha', 'Cosecha']];
  const PRIORIDAD = { cosecha: 'Mejorar mi cosecha', agua: 'No gastar tanta agua', ganar: 'Aumentar mis cosechas' };
  let ultimoPlan = null;

  function armarPlan() {
    const c = cultivoSel(), z = zonaSel();
    if (!c || !z) return null;
    const nombreC = corto(c).toLowerCase();
    const cal = D.calendario || {};
    const plan = {
      titulo: `Tu plan para ${nombreC} en ${z.nombre}`,
      archivo: `milpa-clara-plan-${c.cultivo}-${z.zona_id}.pdf`,
      ejemplo: [D.zonas, cal].some(d => d && d.ejemplo === true),
      metodo: cal.generado_por === 'red_neuronal' ? 'Calculado por la inteligencia artificial.'
        : cal.generado_por === 'baseline' ? 'Calculado con las lluvias de años pasados, sin inteligencia artificial.' : null,
      respuestas: [
        ['Cultivo', corto(c)],
        ['Zona', z.nombre || null],
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
    $('#resEjemplo').hidden = !plan.ejemplo;

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

    $('#resAnios').hidden = !plan.anios;
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
    if (plan.ejemplo) texto('Atención: estas fechas son de prueba mientras llega el cálculo final.', { size: 10, color: AMBAR });

    // Respuestas
    titulo('Tus respuestas');
    plan.respuestas.forEach(([n, v]) => fila(n, v));

    // Imagen de la zona con el punto
    const im = D.imagen && D.imagen.datos;
    if (im && im.archivo) {
      const foto = await cargarImagen(im.archivo);
      if (foto) {
        const ancho = Math.min(ANCHO, 110), alto = ancho * foto.h / foto.w;
        y += 2; salto(alto + 8);
        doc.addImage(foto.data, 'JPEG', M, y, ancho, alto);
        const z = plan.zona;
        if (z.lat != null && z.lon != null && z.lat <= im.norte && z.lat >= im.sur && z.lon >= im.oeste && z.lon <= im.este) {
          const px = M + ((z.lon - im.oeste) / (im.este - im.oeste)) * ancho;
          const py = y + ((im.norte - z.lat) / (im.norte - im.sur)) * alto;
          doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.8); doc.setFillColor(184, 65, 44);
          doc.circle(px, py, 2.2, 'FD'); doc.setLineWidth(0.2);
        }
        y += alto + 1.5;
        texto(`${im.producto || 'Imagen de satélite'} · ${im.fecha_imagen ? fecha(im.fecha_imagen) : SD}. Los datos de lluvia y clima describen toda la zona, no tu parcela exacta.`, { size: 8.5, color: GRIS });
      }
    }

    // Fechas
    titulo('Tus fechas');
    if (!plan.fechas) texto(`Sin dato: ${plan.sinFechas}`, { color: AMBAR });
    else plan.fechas.forEach(f => {
      salto(22);
      texto(f.etiqueta.toUpperCase(), { size: 9, bold: true, color: GRIS, gap: 0.5 });
      texto(f.dia || SD, { size: 14, bold: true, color: f.dia ? TINTA : AMBAR, gap: 0.8 });
      if (f.ventana) texto(`Días buenos: ${f.ventana}`, { size: 11, bold: true, color: VERDE, gap: 0.5 });
      if (f.conf) texto(`Confianza: ${f.conf}`, { size: 10.5, gap: 0.5 });
      texto(f.porque ? f.porque : `¿Por qué? ${SD}`, { size: 10, color: f.porque ? GRIS : AMBAR, gap: 3 });
    });
    if (plan.metodo) texto(plan.metodo, { size: 9, color: GRIS });

    // Años
    if (plan.anios) {
      titulo('Los años que te ha tocado sembrar');
      if (plan.anios.sinDato) texto(`${SD} para esos años.`, { color: AMBAR });
      else {
        texto(plan.anios.texto, { size: 12, bold: true });
        if (plan.anios.n) texto(`Años malos: ${plan.anios.tocados.join(', ')}`, { size: 11, color: [184, 65, 44] });
        texto(plan.anios.nota, { size: 9, color: GRIS });
      }
    }

    // Prioridades
    plan.bloques.forEach(b => {
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
    if (plan.fuente) texto(plan.fuente, { size: 8.5, color: GRIS });
    texto('Fuentes: NASA POWER, MODIS y HLS (NASA), SIAP, CONAGUA (Monitor de Sequía) y FAO-56. Proyecto para NASA Space Apps Challenge 2026, sede CDMX.', { size: 8.5, color: GRIS });

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
