/* "Cómo se calculó": lee data/calendario.json (método de las fechas) y
   data/modelos_comparacion.json (evaluación de Aquiles). Ningún número se escribe aquí. */
(function () {
  const raiz = document.getElementById('calculo');
  if (!raiz) return;
  const $c = s => raiz.querySelector(s);
  const SIN = '<span class="falta">sin dato</span>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (v, d = 3) => (typeof v === 'number' ? v.toFixed(d) : SIN);
  const signo = v => (typeof v === 'number' ? (v > 0 ? '+' : '') + v.toFixed(2) : SIN);
  const cargar = n => fetch(`data/${n}.json`, { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error(`${n}.json: ${r.status}`);
    return r.json();
  });

  // Cada archivo se carga por separado: si falta uno, el otro bloque se muestra igual.
  cargar('calendario').then(metodoFechas).catch(e => { $c('#ccFechas').innerHTML = `${SIN} (${esc(e.message)})`; });
  cargar('modelos_comparacion').then(evaluacion).catch(e => { $c('#ccRed').innerHTML = `<p>${SIN}: no se pudo leer la evaluación de la red (${esc(e.message)}).</p>`; });

  function metodoFechas(cal) {
    const gen = cal.generado_por === 'red_neuronal' ? 'la red neuronal'
      : cal.generado_por === 'baseline' ? 'el baseline, sin red neuronal' : (cal.generado_por ? esc(cal.generado_por) : SIN);
    $c('#ccFechas').innerHTML = `Las fechas del recorrido vienen de <b>${gen}</b>. ${cal.fuente ? esc(cal.fuente) : ''}
      <span class="src">Consultado ${cal.fecha_consulta ? esc(cal.fecha_consulta) : SIN}</span>`;
  }

  function evaluacion(m) {
    const filas = m.datos || [];
    const red = m.red_del_sitio, mejor = m.mejor_modelo;
    const gano = red && mejor && red === mejor;

    $c('#ccVeredicto').className = 'card-msg ' + (gano ? 'ok' : 'warn');
    $c('#ccVeredicto').innerHTML = !red || !mejor ? `<b>Resultado</b><span>${SIN}</span>`
      : gano
        ? `<b>La red sí superó al promedio histórico</b><span>${esc(red)} fue el mejor modelo según el criterio de abajo.</span>`
        : `<b>La red neuronal no superó al promedio histórico</b><span>El mejor modelo fue <b>${esc(mejor)}</b>, no la red (${esc(red)}). Por eso las fechas del recorrido no usan la red. Lo decimos porque es lo que midieron los datos.</span>`;

    const cab = '<tr><th scope="col">Modelo</th><th scope="col">Error en validación<br><small>RMSE 2018–2020</small></th><th scope="col">Error en prueba<br><small>RMSE 2021–2025</small></th><th scope="col">Mejora sobre el promedio<br><small>prueba</small></th></tr>';
    $c('#ccTabla').innerHTML = `<thead>${cab}</thead><tbody>${filas.map(f => {
      const cls = [f.modelo === mejor ? 'mejor' : '', f.modelo === red ? 'red' : ''].join(' ').trim();
      const marca = (f.modelo === mejor ? ' <span class="lab real">mejor</span>' : '') + (f.modelo === red ? ' <span class="lab est">red del sitio</span>' : '');
      return `<tr class="${cls}"><th scope="row">${esc(f.modelo)}${marca}</th><td>${num(f.val_rmse, 4)}</td><td>${num(f.test_rmse, 4)}</td><td>${signo(f.test_skill_vs_climatologia)}</td></tr>`;
    }).join('')}</tbody>`;

    const porAnio = m.skill_por_anio_prueba || {};
    const modelos = Object.keys(porAnio);
    const anios = modelos.length ? Object.keys(porAnio[modelos[0]]) : [];
    $c('#ccAnios').innerHTML = !modelos.length ? `<tbody><tr><td>${SIN}</td></tr></tbody>`
      : `<thead><tr><th scope="col">Modelo</th>${anios.map(a => `<th scope="col">${esc(a)}</th>`).join('')}</tr></thead><tbody>${modelos.map(mo =>
        `<tr${mo === red ? ' class="red"' : ''}><th scope="row">${esc(mo)}</th>${anios.map(a => {
          const v = porAnio[mo][a];
          return `<td class="${typeof v === 'number' ? (v > 0 ? 'pos' : v < 0 ? 'neg' : '') : ''}">${signo(v)}</td>`;
        }).join('')}</tr>`).join('')}</tbody>`;

    const arq = m.arquitectura_red || {};
    $c('#ccDetalle').innerHTML = [
      ['Qué pronostica', 'El verdor de la vegetación (NDVI de MODIS) de la temporada, con datos hasta fines de julio.'],
      ['Entradas', m.variables ? esc(m.variables.join(', ')) : SIN],
      ['Red', red ? `${esc(red)} · ${arq.capas != null ? esc(arq.capas) + ' capas' : ''} ${arq.oculto != null ? '· ' + esc(arq.oculto) + ' unidades' : ''}` : SIN],
      ['Partición por años', m.fuente ? esc(m.fuente.replace(/^Evaluación por año:\s*/, '').replace(/\((\d{4}), (\d{4})\)/g, '$1–$2')
        .replace(/\btrain\b/, 'entrenamiento').replace(/\bval\b/, 'validación').replace(/\btest\b/, 'prueba')) : SIN],
      ['Criterio para elegir', m.criterio_mejor ? esc(m.criterio_mejor) : SIN],
      ['Métrica', m.metrica_principal ? esc(m.metrica_principal) : SIN],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    $c('#ccFuente').textContent = `Evaluación de Aquiles (Google Colab) · consultado ${m.fecha_consulta || 'sin dato'}`;
  }
})();
