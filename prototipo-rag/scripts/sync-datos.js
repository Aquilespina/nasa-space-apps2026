// Copia los JSON que usa el chat desde data/processed/ (fuente de verdad) a prototipo-rag/data/
// (lo que la función serverless puede leer en Vercel). Correr tras cualquier cambio en data/processed
// y antes de desplegar: node prototipo-rag/scripts/sync-datos.js

const fs = require('node:fs');
const path = require('node:path');

const ARCHIVOS = ['cultivos.json', 'calendario.json', 'zonas.json', 'modelos_comparacion.json'];
const origen = path.join(__dirname, '..', '..', 'data', 'processed');
const destino = path.join(__dirname, '..', 'data');

fs.mkdirSync(destino, { recursive: true });
for (const nombre of ARCHIVOS) {
  fs.copyFileSync(path.join(origen, nombre), path.join(destino, nombre));
  console.log(`copiado ${nombre}`);
}
