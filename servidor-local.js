// Servidor local para probar la página y el chat sin cuenta de Vercel: `npm run local`.
// Sirve site/ como archivos estáticos y POST /api/chat con la misma función de api/chat.js.
// No usa llaves ni servicios externos: el chat responde con data/processed/*.json.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const RAIZ = __dirname;
const SITIO = path.join(RAIZ, 'site');
const PUERTO = Number(process.env.PORT) || 3000;

const chat = require('./api/chat.js');

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.webp': 'image/webp'
};

// Ruta pedida sin "?..." y con una sola "/" al inicio; null si no se puede decodificar.
function rutaDe(req) {
  try { return '/' + decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, ''); } catch (e) { return null; }
}

function servirArchivo(req, res) {
  let ruta = rutaDe(req);
  if (ruta === null) { res.writeHead(400).end(); return; }
  if (ruta.endsWith('/')) ruta += 'index.html';
  let archivo = path.resolve(SITIO, '.' + ruta);
  if (!archivo.startsWith(SITIO + path.sep)) { res.writeHead(403).end(); return; }
  if (!path.extname(archivo) && fs.existsSync(archivo + '.html')) archivo += '.html';
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(datos);
  });
}

function atenderChat(req, res) {
  let cuerpo = '';
  req.on('data', (c) => { cuerpo += c; if (cuerpo.length > 100000) req.destroy(); });
  req.on('end', () => {
    let body = {};
    try { body = JSON.parse(cuerpo || '{}'); } catch (e) { /* cuerpo inválido: chat.js responde 400 */ }
    // Imita lo mínimo de la respuesta de Vercel que usa api/chat.js: status().json().
    const respuesta = {
      codigo: 200,
      status(c) { this.codigo = c; return this; },
      json(o) { res.writeHead(this.codigo, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(o)); }
    };
    Promise.resolve(chat({ method: req.method, body }, respuesta)).catch((e) => {
      console.error(e);
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' }).end('{"respuesta":"Error interno del servidor."}');
    });
  });
}

http.createServer((req, res) => {
  if (rutaDe(req) === '/api/chat') atenderChat(req, res);
  else if (req.method === 'GET' || req.method === 'HEAD') servirArchivo(req, res);
  else res.writeHead(405).end();
}).listen(PUERTO, () => {
  console.log(`Milpa Clara en http://localhost:${PUERTO}`);
});
