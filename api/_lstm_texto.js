// Corre en el servidor la LSTM de texto del equipo (api/_modelo_texto.json, entrenada con
// colab/entrenar_lstm_texto.py). Escribe una frase del tema pedido con marcas como <MM>;
// aquí se revisa que traiga exactamente las marcas necesarias y se llenan con datos reales.
// Si la red no da una frase válida en 6 intentos, se usa la plantilla del corpus.
const M = require('./_modelo_texto.json');

const IDX = Object.fromEntries(M.vocab.map((w, i) => [w, i]));
const FIN = IDX['<FIN>'];
const sigm = (x) => 1 / (1 + Math.exp(-x));

function paso(id, h, c) {
  const x = M.emb[id], H = M.H, z = new Float64Array(4 * H);
  for (let r = 0; r < 4 * H; r++) {
    let s = M.b[r];
    const wi = M.w_ih[r], wh = M.w_hh[r];
    for (let k = 0; k < x.length; k++) s += wi[k] * x[k];
    for (let k = 0; k < H; k++) s += wh[k] * h[k];
    z[r] = s;
  }
  const h2 = new Float64Array(H), c2 = new Float64Array(H);
  for (let k = 0; k < H; k++) {
    const i = sigm(z[k]), f = sigm(z[H + k]), g = Math.tanh(z[2 * H + k]), o = sigm(z[3 * H + k]);
    c2[k] = f * c[k] + i * g;
    h2[k] = o * Math.tanh(c2[k]);
  }
  return [h2, c2];
}

function muestrear(h, temperatura) {
  const V = M.vocab.length, l = new Float64Array(V);
  let max = -Infinity;
  for (let v = 0; v < V; v++) {
    let s = M.b_out[v];
    const w = M.w_out[v];
    for (let k = 0; k < M.H; k++) s += w[k] * h[k];
    l[v] = s / temperatura;
    if (l[v] > max) max = l[v];
  }
  let tot = 0;
  for (let v = 0; v < V; v++) { l[v] = Math.exp(l[v] - max); tot += l[v]; }
  let r = Math.random() * tot;
  for (let v = 0; v < V; v++) { r -= l[v]; if (r <= 0) return v; }
  return V - 1;
}

function escribir(tema, temperatura) {
  const ini = IDX[`<T:${tema}>`];
  if (ini == null) return null;
  let h = new Float64Array(M.H), c = new Float64Array(M.H), id = ini;
  const out = [];
  for (let t = 0; t < 70; t++) {
    [h, c] = paso(id, h, c);
    id = muestrear(h, temperatura);
    if (id === FIN) return out;
    out.push(M.vocab[id]);
  }
  return null;
}

const juntar = (toks) => toks.join(' ')
  .replace(/\s+([.,;:)?!³])/g, '$1').replace(/([(¿¡])\s+/g, '$1').replace(/\s{2,}/g, ' ').trim();

function valida(toks, tema) {
  if (!toks || toks.length < 3) return false;
  const marcas = toks.filter((w) => /^<[A-Z_0-9]+>$/.test(w)).map((w) => M.equivalencias[w] || w).sort();
  const req = M.marcas_requeridas[tema] || [];
  return marcas.length === req.length && marcas.every((m, i) => m === req[i]) && /[.:?!]$/.test(toks[toks.length - 1]);
}

function llenar(texto, valores) {
  const val = { ...valores };
  if (val['<ACT>'] != null) val['<ACT_MAYUS>'] = val['<ACT>'].charAt(0).toUpperCase() + val['<ACT>'].slice(1);
  const s = texto.replace(/<[A-Z_0-9]+>/g, (m) => (val[m] != null ? String(val[m]) : m));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Devuelve { texto, lstm }: lstm = true si la frase la escribió la red.
function redactar(tema, valores, temperatura = 0.7) {
  for (let intento = 0; intento < 6; intento++) {
    const toks = escribir(tema, temperatura);
    if (valida(toks, tema)) return { texto: llenar(juntar(toks), valores), lstm: true };
  }
  const plantilla = M.plantillas[tema];
  return plantilla ? { texto: llenar(plantilla, valores), lstm: false } : { texto: '', lstm: false };
}

module.exports = { redactar };
