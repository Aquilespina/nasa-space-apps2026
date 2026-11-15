const datosUsuario = {
  cultivo: '',
  lugar: '',
  lat: null,
  lon: null,
  tiempo: '',
  objetivo: '',
  fueraDeCobertura: false,
  distanciaKm: null
};

// Única zona con datos verificados hoy (zonas.json, "El Llano"). Debe coincidir con
// RADIO_COBERTURA_KM en api/chat.js: si se cambia uno, se cambia el otro.
const REFERENCIA_AMEALCO = { lat: 20.209, lon: -100.146 };
const RADIO_COBERTURA_KM = 60;

function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Evalúa si el lugar (coordenadas o texto) cae dentro de la única zona con datos reales.
// No bloquea el wizard: solo marca fueraDeCobertura para avisar, porque el chat ya
// responde "sin dato" fuera de esa zona (misma regla que el backend).
function evaluarCobertura() {
  if (typeof datosUsuario.lat === 'number' && typeof datosUsuario.lon === 'number') {
    const d = distanciaKm(datosUsuario.lat, datosUsuario.lon, REFERENCIA_AMEALCO.lat, REFERENCIA_AMEALCO.lon);
    datosUsuario.distanciaKm = Math.round(d);
    datosUsuario.fueraDeCobertura = d > RADIO_COBERTURA_KM;
    return;
  }
  const texto = (datosUsuario.lugar || '').toLowerCase();
  datosUsuario.distanciaKm = null;
  datosUsuario.fueraDeCobertura = !(texto.includes('amealco') || texto.includes('llano'));
}

function siguientePaso(numeroPaso) {
  // Guardar valores actuales
  datosUsuario.cultivo = document.getElementById('cultivo').value.trim() || 'No especificado';
  datosUsuario.tiempo = document.getElementById('tiempo').value.trim() || 'No especificado';

  const lugarEscrito = document.getElementById('lugar').value.trim();
  if (lugarEscrito) {
    // Si la persona escribe algo después de usar el GPS, el texto manda.
    datosUsuario.lugar = lugarEscrito;
    datosUsuario.lat = null;
    datosUsuario.lon = null;
  } else if (!datosUsuario.lugar) {
    datosUsuario.lugar = 'Ubicación no especificada';
  }

  // Mostrar ubicación en el paso 3
  if (numeroPaso === 3) {
    if (typeof datosUsuario.lat !== 'number') evaluarCobertura();
    const base = datosUsuario.lat
      ? `${datosUsuario.lugar} (lat ${datosUsuario.lat.toFixed(3)}, lon ${datosUsuario.lon.toFixed(3)})`
      : datosUsuario.lugar;
    const aviso = datosUsuario.fueraDeCobertura
      ? `\n⚠️ Fuera de cobertura${datosUsuario.distanciaKm ? ` (a ${datosUsuario.distanciaKm} km de Amealco de Bonfil, Qro.)` : ''}: puedes seguir, pero el chat no tendrá fechas verificadas para esta ubicación.`
      : '';
    document.getElementById('texto-ubicacion').textContent = base + aviso;
  }

  cambiarTarjeta(`paso-${numeroPaso}`);
}

function usarMiUbicacion() {
  const estado = document.getElementById('estado-ubicacion');
  if (!('geolocation' in navigator)) {
    estado.textContent = 'Tu navegador no permite compartir ubicación. Escribe el lugar a mano.';
    return;
  }
  estado.textContent = 'Obteniendo tu ubicación...';
  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const lat = posicion.coords.latitude;
      const lon = posicion.coords.longitude;
      const d = Math.round(distanciaKm(lat, lon, REFERENCIA_AMEALCO.lat, REFERENCIA_AMEALCO.lon));

      if (d > RADIO_COBERTURA_KM) {
        // Ubicación inválida para este prototipo: solo cubre Amealco de Bonfil, Qro. No se guarda.
        datosUsuario.lat = null;
        datosUsuario.lon = null;
        datosUsuario.lugar = '';
        datosUsuario.fueraDeCobertura = true;
        datosUsuario.distanciaKm = d;
        estado.textContent = `❌ Ubicación no válida: está a ${d} km de Amealco de Bonfil, Qro. Este sitio solo cubre esa zona. Escribe "Amealco" o "El Llano" en el campo de arriba.`;
        return;
      }

      datosUsuario.lat = lat;
      datosUsuario.lon = lon;
      datosUsuario.fueraDeCobertura = false;
      datosUsuario.distanciaKm = d;
      document.getElementById('lugar').value = '';
      datosUsuario.lugar = 'Mi ubicación (GPS)';
      estado.textContent = `Ubicación capturada: ${lat.toFixed(3)}, ${lon.toFixed(3)} (dentro de la zona con datos verificados).`;
    },
    () => {
      estado.textContent = 'No se pudo obtener tu ubicación. Escribe el lugar a mano.';
    }
  );
}

function finalizar(objetivoElegido) {
  datosUsuario.objetivo = objetivoElegido;

  const resumen = document.getElementById('resumen');
  resumen.innerHTML = `
    <strong>Cultivo:</strong> ${datosUsuario.cultivo}<br>
    <strong>Lugar:</strong> ${datosUsuario.lugar}<br>
    <strong>Experiencia:</strong> ${datosUsuario.tiempo}<br>
    <strong>Meta:</strong> ${datosUsuario.objetivo}
  `;

  cambiarTarjeta('paso-final');

  // Entrar directo al chat (regla del equipo: "ya estás dentro" lleva al cuadro de preguntas).
  setTimeout(() => cambiarTarjeta('paso-chat'), 900);
}

function reiniciar() {
  document.querySelectorAll('input').forEach(input => input.value = '');
  document.getElementById('mensajes').innerHTML = '';
  datosUsuario.lat = null;
  datosUsuario.lon = null;
  cambiarTarjeta('paso-1');
}

function cambiarTarjeta(idDestino) {
  document.querySelectorAll('.tarjeta').forEach(t => t.classList.remove('activa'));
  document.getElementById(idDestino).classList.add('activa');
}

function agregarMensaje(texto, quien) {
  const contenedor = document.getElementById('mensajes');
  const burbuja = document.createElement('div');
  burbuja.className = `mensaje ${quien}`;
  burbuja.textContent = texto;
  contenedor.appendChild(burbuja);
  contenedor.scrollTop = contenedor.scrollHeight;
}

async function enviarPregunta() {
  const campo = document.getElementById('pregunta');
  const pregunta = campo.value.trim();
  if (!pregunta) return;

  agregarMensaje(pregunta, 'usuario');
  campo.value = '';
  document.getElementById('boton-enviar').disabled = true;

  try {
    const respuesta = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil: datosUsuario, pregunta })
    });
    const cuerpo = await respuesta.json();
    agregarMensaje(cuerpo.respuesta || 'No tengo ese dato.', 'asistente');
  } catch (error) {
    agregarMensaje('No pude conectar con el servidor del chat. Intenta de nuevo.', 'asistente');
  } finally {
    document.getElementById('boton-enviar').disabled = false;
  }
}

// Permite avanzar presionando Enter dentro de los campos de texto
document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const boton = input.parentElement.querySelector('button');
      if (boton) boton.click();
    }
  });
});
