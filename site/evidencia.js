/* Evidencia adicional en #calculo: lee data/serie_regional.json y data/estres_mapa.json.
   Mismo patrón que calculo.js: "sin dato" si falta un campo, ningún número escrito a mano. */
(function () {
  const raiz = document.getElementById('calculo');
  if (!raiz) return;
  const $c = s => raiz.querySelector(s);
  const SIN = '<span class="falta">sin dato</span>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v.toFixed(d) : SIN);
  const signo = (v, d) => (typeof v === 'number' && isFinite(v) ? (v > 0 ? '+' : '') + v.toFixed(d) : SIN);
  const cargar = n => fetch(`data/${n}.json`, { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error(`${n}.json: ${r.status}`);
    return r.json();
  });

  cargar('serie_regional').then(pintarSerie).catch(e => {
    if ($c('#ccSerieGraf')) $c('#ccSerieGraf').innerHTML = `<p>${SIN} (${esc(e.message)})</p>`;
  });
  cargar('estres_mapa').then(pintarEstres).catch(e => {
    if ($c('#ccEstresResumen')) $c('#ccEstresResumen').innerHTML = `${SIN} (${esc(e.message)})`;
  });

  function pintarSerie(sr) {
    const filas = Array.isArray(sr && sr.datos) ? sr.datos : [];
    if (!filas.length) {
      $c('#ccSerieGraf').innerHTML = `<p>${SIN}</p>`;
      $c('#ccSerieTabla').innerHTML = `<tbody><tr><td>${SIN}</td></tr></tbody>`;
      return;
    }
    const vals = filas.map(f => typeof f.anomalia_ndvi_pico === 'number' ? Math.abs(f.anomalia_ndvi_pico) : 0);
    const maxAbs = Math.max(...vals) || 1;

    // Palabras simples en vez del número técnico (la "anomalía de NDVI"): qué tan verde se vio el
    // campo comparado con su propio promedio. El número exacto queda solo en la tabla de abajo.
    const palabra = v => {
      if (v === null) return 'Sin dato';
      if (Math.abs(v) < maxAbs * 0.12) return 'Normal';
      const fuerte = Math.abs(v) >= maxAbs * 0.5 ? 'Mucho más' : 'Un poco más';
      return v > 0 ? fuerte.replace('más', 'más verde') : fuerte.replace('más', 'menos verde');
    };
    const comoLeFue = (f, esMalo, esDemo) => esMalo ? 'Año malo para el maíz'
      : esDemo ? `${f.anio != null ? esc(f.anio) : 'Esta temporada'}: la IA nunca la había visto`
        : f.anio_malo_siap === false ? 'Año normal' : 'Sin dato';

    // Una gráfica de barras con 26 años se veía apretada y el eje numérico ("anomalía de NDVI")
    // no dice nada a quien no sabe de satélites. En su lugar: un año, un cuadro, un color — se lee
    // de un vistazo y no se rompe en celular. El detalle con número exacto sigue en la tabla de abajo.
    const chipsHtml = filas.map((f, idx) => {
      const v = typeof f.anomalia_ndvi_pico === 'number' ? f.anomalia_ndvi_pico : null;
      const esMalo = f.anio_malo_siap === true;
      const esDemo = f.anio_malo_siap === null && idx === filas.length - 1;
      const cls = esMalo ? 'malo' : esDemo ? 'demo' : (f.anio_malo_siap === false ? 'bueno' : 'sin');
      const etqAnio = f.anio != null ? esc(f.anio) : '?';
      const detalle = (v !== null ? `${palabra(v)} de lo normal · ` : '') + comoLeFue(f, esMalo, esDemo);
      return `<span class="cc-anio ${cls}" tabindex="0" role="img" aria-label="${etqAnio}: ${detalle}" title="${detalle}">${etqAnio}</span>`;
    }).join('');

    $c('#ccSerieGraf').innerHTML = `<div class="cc-anios-grid" role="img" aria-label="Años buenos y malos para el maíz, comparados con el satélite, de 2001 a 2026">${chipsHtml}</div>`;

    const cab = '<tr><th scope="col">Año</th><th scope="col">Qué tan verde se vio el campo</th><th scope="col">Cómo le fue al maíz</th></tr>';
    $c('#ccSerieTabla').innerHTML = `<thead>${cab}</thead><tbody>${filas.map((f, idx) => {
      const v = typeof f.anomalia_ndvi_pico === 'number' ? f.anomalia_ndvi_pico : null;
      const esMalo = f.anio_malo_siap === true;
      const esDemo = f.anio_malo_siap === null && idx === filas.length - 1;
      const cls = esMalo ? 'cc-fila-malo' : esDemo ? 'cc-fila-demo' : '';
      const color = esMalo ? 'var(--red)' : esDemo ? 'var(--blue)' : (f.anio_malo_siap === false ? 'var(--green)' : 'var(--dot)');
      const pct = v !== null ? Math.min(50, (Math.abs(v) / maxAbs) * 50) : 0;
      const izq = v !== null && v < 0 ? (50 - pct) : 50;
      const barra = v === null ? SIN : `<div class="cc-barra"><div class="cc-barra-pista" aria-hidden="true"><span class="cc-barra-cero"></span><span class="cc-barra-fill" style="left:${izq.toFixed(1)}%;width:${Math.max(1, pct).toFixed(1)}%;background:${color}" title="${v > 0 ? '+' : ''}${v.toFixed(4)}"></span></div><span>${palabra(v)}</span></div>`;
      const estado = `<span class="${esMalo ? 'flag' : esDemo ? 'lab est' : ''}">${comoLeFue(f, esMalo, esDemo)}</span>`;
      return `<tr class="${cls}"><th scope="row">${f.anio != null ? esc(f.anio) : SIN}</th><td>${barra}</td><td>${estado}</td></tr>`;
    }).join('')}</tbody>`;

    $c('#ccSeriePie').innerHTML = `fuente: serie_regional.json${sr.fuente ? ' · ' + esc(sr.fuente) : ''}${sr.fecha_consulta ? ' · consultado ' + esc(sr.fecha_consulta) : ''}`;
  }

  function pintarEstres(em) {
    const d = em && em.datos ? em.datos : {};
    const pred = Array.isArray(d.pred) ? d.pred : null;
    const obs = Array.isArray(d.obs) ? d.obs : null;
    const banda = Array.isArray(d.banda) ? d.banda : null;
    const clim = Array.isArray(d.clim) ? d.clim : null;

    if (!pred || !obs || !banda) {
      $c('#ccEstresKpis').innerHTML = `<div class="cc-kpi"><span class="k">Datos por píxel</span><span class="v">${SIN}</span></div>`;
      $c('#ccEstresResumen').innerHTML = SIN;
      return;
    }

    const total = Math.max(pred.length, obs.length, banda.length);
    let sumaErrPred = 0, nPred = 0;
    let sumaErrClim = 0, nClim = 0;
    let dentroBanda = 0, nBanda = 0;

    for (let i = 0; i < total; i++) {
      const p = pred[i], o = obs[i], b = banda[i], c = clim ? clim[i] : null;
      if (typeof p === 'number' && typeof o === 'number') {
        const diff = p - o;
        sumaErrPred += diff * diff;
        nPred++;
        if (typeof b === 'number') {
          nBanda++;
          if (Math.abs(diff) <= b) dentroBanda++;
        }
      }
      if (typeof c === 'number' && typeof o === 'number') {
        const diffC = c - o;
        sumaErrClim += diffC * diffC;
        nClim++;
      }
    }

    const rmsePred = nPred > 0 ? Math.sqrt(sumaErrPred / nPred) : null;
    const rmseClim = nClim > 0 ? Math.sqrt(sumaErrClim / nClim) : null;
    const pctCobertura = nBanda > 0 ? (dentroBanda / nBanda) * 100 : null;
    const pctMejora = (typeof rmsePred === 'number' && typeof rmseClim === 'number' && rmseClim > 0)
      ? ((rmseClim - rmsePred) / rmseClim) * 100 : null;

    // Palabras simples en vez de RMSE/"pred vs obs"/notación con barras: cuánto se acercó la IA a lo
    // que de verdad pasó, comparado con solo usar el promedio de años pasados. El número técnico
    // completo queda en el detalle de abajo, no como texto principal.
    $c('#ccEstresKpis').innerHTML = [
      ['¿Se acercó más que el promedio de años pasados?',
        typeof pctMejora === 'number' ? `${pctMejora >= 0 ? '+' : ''}${pctMejora.toFixed(0)} %` : SIN,
        typeof pctMejora === 'number' ? (pctMejora >= 0 ? 'La IA se acercó más' : 'El promedio de años pasados se acercó más') : ''],
      ['¿Qué tan seguido acertó su propio margen de error?',
        typeof pctCobertura === 'number' ? `${pctCobertura.toFixed(0)} %` : SIN,
        `de los pedazos de tierra revisados (${dentroBanda} de ${nBanda})`]
    ].map(([k, v, s]) => `<div class="cc-kpi"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${s}</span></div>`).join('');

    $c('#ccEstresResumen').innerHTML = `Revisamos <b>${total}</b> pedazos de tierra con cultivo${em.anio != null ? ' en la temporada ' + esc(em.anio) : ''}. `
      + (typeof pctMejora === 'number'
        ? (pctMejora >= 0
          ? `La IA le atinó un <b>${pctMejora.toFixed(0)} % más cerca</b> que solo usar el promedio de años pasados.`
          : `Un <b>${Math.abs(pctMejora).toFixed(0)} %</b> de las veces, el promedio de años pasados le atinó más que la IA.`)
        : SIN)
      + ` <details class="cc-detalle"><summary>Ver los números técnicos</summary><p class="fine">RMSE de la predicción contra lo real: ${num(rmsePred, 4)} (${nPred} de ${total} píxeles). RMSE del promedio histórico contra lo real: ${num(rmseClim, 4)} (${nClim} de ${total} píxeles). Cobertura de la banda de incertidumbre (|pred − obs| ≤ banda): ${typeof pctCobertura === 'number' ? pctCobertura.toFixed(1) + ' %' : SIN}.</p></details>`;

    $c('#ccEstresPie').innerHTML = `fuente: evaluación de la IA (Google Colab)${em.fecha_consulta ? ' · consultado ' + esc(em.fecha_consulta) : ''}`
      + (em.fuente ? ` <details class="cc-detalle" style="display:inline"><summary>detalle técnico de la fuente</summary><span class="fine">${esc(em.fuente)}</span></details>` : '');
  }
})();
