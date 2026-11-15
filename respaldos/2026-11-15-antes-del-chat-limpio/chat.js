/* Chat anclado a cultivos.json/calendario.json vía /api/chat (backend propio, llave solo ahí).
   Lee el mismo estado que guarda asistente.js (localStorage) sin modificarlo.
   Voz (dictado y lectura) es solo una forma extra de usar el mismo chat: si el navegador no la
   soporta, el campo de texto sigue funcionando igual. */
(function () {
  const $ = s => document.querySelector(s);
  const CLAVE = 'milpaclara.respuestas.v2';

  const mensajes = $('#chatMensajes');
  const campo = $('#chatPregunta');
  const boton = $('#chatEnviar');
  const aviso = $('#chatAviso');
  const chips = $('#chatChips');
  const vozBtn = $('#chatVoz');
  const mic = $('#chatMic');
  if (!mensajes || !campo || !boton) return;

  let vozActiva = false;
  let nombresCultivo = {};
  let zonas = null;

  function estadoActual() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || '{}'); } catch (e) { return {}; }
  }

  // Misma fórmula y mismo radio_cobertura_km que asistente.js: aquí no se guarda el estado,
  // solo se recalcula para saber a qué zona anclar la pregunta (o ninguna, si no hay cobertura).
  const km = (a, b, c, d) => {
    const R = 6371, r = x => x * Math.PI / 180;
    const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  function zonaIdCubierta(lugar) {
    if (!lugar || lugar.lat == null || !zonas) return null;
    const Z = (zonas.datos || []).filter(z => z.lat != null && z.lon != null);
    if (!Z.length) return null;
    const m = Z.map(z => ({ z, km: km(lugar.lat, lugar.lon, z.lat, z.lon) })).sort((a, b) => a.km - b.km)[0];
    return (typeof m.z.radio_cobertura_km === 'number' && m.km <= m.z.radio_cobertura_km) ? m.z.zona_id : null;
  }
  fetch('data/zonas.json', { cache: 'no-cache' }).then(r => r.json()).then(j => { zonas = j; }).catch(() => { /* sin zona confirmada, el backend dirá "no tengo ese dato" */ });

  function pintarChips() {
    if (!chips) return;
    const e = estadoActual();
    const partes = [];
    if (e.cultivo) partes.push(nombresCultivo[e.cultivo] || e.cultivo);
    if (e.lugar && e.lugar.nombre) partes.push(e.lugar.nombre);
    chips.innerHTML = partes.map(p => `<span>${p}</span>`).join('');
  }
  pintarChips();
  fetch('data/cultivos.json', { cache: 'no-cache' }).then(r => r.json()).then(j => {
    (j.datos || []).forEach(c => { nombresCultivo[c.cultivo] = (c.nombre || c.cultivo).split(/\s+/)[0]; });
    pintarChips();
    // Amealquito abre la conversación, como en WhatsApp
    if (!mensajes.children.length) {
      const e = estadoActual();
      const c = e.cultivo ? (nombresCultivo[e.cultivo] || e.cultivo).toLowerCase() : 'tu cultivo';
      agregar(`¡Hola! ¿Tienes alguna duda de tu ${c}? Toca una de las preguntas de abajo o escríbeme.`, 'asistente');
    }
  }).catch(() => { /* sin nombres amigables, los chips igual funcionan con el id crudo */ });

  function agregar(texto, quien, fuentes = []) {
    const p = document.createElement('div');
    p.className = `chat-msg ${quien}`;
    const t = document.createElement('p');
    t.textContent = texto;
    p.appendChild(t);
    if (fuentes.length) {
      const f = document.createElement('div');
      f.className = 'chat-fuentes';
      const etq = document.createElement('span');
      etq.className = 'chat-fuentes-etq';
      etq.textContent = 'Basado en:';
      f.appendChild(etq);
      fuentes.forEach(n => { const s = document.createElement('span'); s.textContent = n; f.appendChild(s); });
      p.appendChild(f);
    }
    mensajes.appendChild(p);
    mensajes.scrollTop = mensajes.scrollHeight;
    if (quien === 'asistente' && vozActiva && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-MX';
      window.speechSynthesis.speak(u);
    }
  }

  async function enviar(preguntaForzada) {
    const pregunta = (preguntaForzada || campo.value).trim();
    if (!pregunta) return;
    aviso.hidden = true;
    agregar(pregunta, 'usuario');
    campo.value = '';
    boton.disabled = true;

    const e = estadoActual();
    const cargando = document.createElement('p');
    cargando.className = 'chat-msg asistente chat-cargando';
    cargando.textContent = '🛰️ Consultando datos NASA y tu parcela...';
    mensajes.appendChild(cargando);
    mensajes.scrollTop = mensajes.scrollHeight;
    try {
      const lugar = e.lugar ? { nombre: [e.lugar.nombre, e.lugar.detalle].filter(Boolean).join(', '), lat: e.lugar.lat, lon: e.lugar.lon, origen: e.lugar.origen } : null;
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfil: {
            cultivo: e.cultivo, zona_id: zonaIdCubierta(e.lugar), lugar, anios: e.anios, prioridades: e.prioridades,
            riego: e.riego, condicion: e.condicion, descanso: e.descanso, estrategia: e.estrategia
          },
          pregunta
        })
      });
      const cuerpo = await r.json();
      cargando.remove();
      agregar(cuerpo.respuesta || 'No tengo ese dato.', 'asistente', Array.isArray(cuerpo.fuentes) ? cuerpo.fuentes : []);
    } catch (err) {
      cargando.remove();
      aviso.hidden = false;
      aviso.textContent = 'No pude conectar con el servidor del chat. Intenta de nuevo.';
    } finally {
      boton.disabled = false;
    }
  }

  boton.addEventListener('click', () => enviar());
  campo.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); enviar(); } });

  document.querySelectorAll('.chat-sugerida').forEach(b => {
    b.addEventListener('click', () => enviar(b.dataset.pregunta));
  });

  if (vozBtn) {
    vozBtn.addEventListener('click', () => {
      vozActiva = !vozActiva;
      vozBtn.setAttribute('aria-pressed', String(vozActiva));
      vozBtn.textContent = vozActiva ? 'Dejar de leer en voz alta' : 'Leer respuestas en voz alta';
      if (!vozActiva && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    });
  }

  if (mic) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      mic.hidden = true;
    } else {
      mic.addEventListener('click', () => {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.interimResults = false;
        mic.disabled = true;
        recognition.onresult = ev => { campo.value = ev.results[0][0].transcript; };
        recognition.onerror = () => { aviso.hidden = false; aviso.textContent = 'No se pudo captar el audio. Escribe tu pregunta.'; };
        recognition.onend = () => { mic.disabled = false; };
        recognition.start();
      });
    }
  }
})();
