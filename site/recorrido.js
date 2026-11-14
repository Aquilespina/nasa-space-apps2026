/* Recorrido por zonas: lee data/zonas.json, data/calendario.json y data/cultivos.json.
   Ningún número se escribe aquí: si un campo falta o es null, se muestra "sin dato". */
(function () {
  const raiz = document.getElementById('recorrido');
  if (!raiz) return;
  const $r = s => raiz.querySelector(s);
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const ACT = [['siembra', 'Siembra'], ['fertilizacion', 'Fertilización'], ['cosecha', 'Cosecha']];
  const SIN = '<span class="falta">sin dato</span>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fecha = iso => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MESES[m - 1]} ${y}`;
  };
  const cargar = n => fetch(`data/${n}.json`, { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error(`${n}.json: ${r.status}`);
    return r.json();
  });

  Promise.all([cargar('zonas'), cargar('calendario'), cargar('cultivos')])
    .then(([zonas, cal, cult]) => iniciar(zonas, cal, cult))
    .catch(err => {
      $r('#rzCuerpo').innerHTML = `<p class="card-msg warn">No se pudieron leer los datos (${esc(err.message)}). Abre el sitio con un servidor: <code>python3 -m http.server 8000 -d site</code>.</p>`;
    });

  function iniciar(zonas, cal, cult) {
    const Z = zonas.datos || [];
    const nombreCultivo = {};
    (cult.datos || []).forEach(c => { nombreCultivo[c.cultivo] = c.nombre; });

    const ejemplo = [zonas, cal].some(d => d.ejemplo === true);
    $r('#rzEjemplo').hidden = !ejemplo;
    const gen = cal.generado_por;
    $r('#rzMetodo').innerHTML = gen === 'red_neuronal'
      ? '<span class="lab est">Pronóstico de la red neuronal</span>'
      : gen === 'baseline'
        ? '<span class="lab real">Baseline: reglas de inicio de lluvias y FAO-56, sin red neuronal</span>'
        : `Método: ${gen ? esc(gen) : SIN}`;
    $r('#rzFuente').textContent = `Fuente: ${cal.fuente || 'sin dato'} · consultado ${cal.fecha_consulta || 'sin dato'}`;

    if (!Z.length) { $r('#rzCuerpo').innerHTML = `<p>${SIN}: no hay zonas en zonas.json.</p>`; return; }

    const chips = $r('#rzChips');
    chips.innerHTML = Z.map((z, i) =>
      `<button type="button" role="tab" data-i="${i}" aria-selected="false">${esc(z.nombre)}</button>`).join('');
    chips.addEventListener('click', ev => { const b = ev.target.closest('button'); if (b) ver(+b.dataset.i); });
    $r('#rzAnt').addEventListener('click', () => ver((actual + Z.length - 1) % Z.length));
    $r('#rzSig').addEventListener('click', () => ver((actual + 1) % Z.length));

    let actual = 0;
    function ver(i) {
      actual = i;
      const z = Z[i];
      try { const u = new URL(location.href); u.searchParams.set('zona', z.zona_id); history.replaceState(null, '', u); } catch (e) { /* sin historial */ }
      chips.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-selected', k === i));
      $r('#rzPaso').textContent = `Zona ${i + 1} de ${Z.length}`;
      const coord = (z.lat != null && z.lon != null)
        ? `${Math.abs(z.lat).toFixed(3)}° ${z.lat >= 0 ? 'N' : 'S'}, ${Math.abs(z.lon).toFixed(3)}° ${z.lon >= 0 ? 'E' : 'O'}`
        : 'coordenadas: sin dato';
      const cultivos = z.cultivos || [];
      const tarjetas = cultivos.map(c => {
        const filas = ACT.map(([clave, etiqueta]) => {
          const r = (cal.datos || []).find(x => x.zona_id === z.zona_id && x.cultivo === c && x.actividad === clave);
          const f = r && fecha(r.fecha_recomendada);
          const v = r && r.ventana_inicio && r.ventana_fin ? `${fecha(r.ventana_inicio)} – ${fecha(r.ventana_fin)}` : null;
          const conf = r && typeof r.confianza === 'number' ? `${Math.round(r.confianza * 100)} %` : null;
          return `<li class="rz-act">
            <div class="rz-act-h"><b>${etiqueta}</b><span class="rz-fecha tn">${f || SIN}</span></div>
            <dl>
              <div><dt>Ventana</dt><dd class="tn">${v || SIN}</dd></div>
              <div><dt>Confianza</dt><dd class="tn">${conf || SIN}</dd></div>
            </dl>
            <p class="rz-razon">${r && r.razon ? esc(r.razon) : `¿Por qué? ${SIN}`}</p>
            ${r && r.fuente ? `<p class="src">${esc(r.fuente)}</p>` : ''}
          </li>`;
        }).join('');
        return `<article class="rz-cult"><h4 style="--cc:var(--c-${esc(c)},var(--dot))">${esc(nombreCultivo[c] || c)}</h4><ol>${filas}</ol></article>`;
      }).join('');
      $r('#rzCuerpo').innerHTML = `
        <div class="rz-zona"><h3>${esc(z.nombre)}</h3><span class="muted tn">${coord}</span></div>
        <div class="rz-grid">${tarjetas || `<p>${SIN}: esta zona no tiene cultivos.</p>`}</div>`;
    }
    const pedida = new URLSearchParams(location.search).get('zona');
    ver(Math.max(0, Z.findIndex(z => z.zona_id === pedida)));
  }
})();
