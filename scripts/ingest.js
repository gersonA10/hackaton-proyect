import { fetchFires } from '../src/services/firmsService.js';
import { enrichAll } from '../src/services/boliviaContext.js';
import * as store from '../src/store/firesStore.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { fires, errores, total_detectados } = await fetchFires();
console.log(` NASA FIRMS: ${total_detectados} focos detectados sobre Bolivia`);
if (errores.length) console.warn('', errores.join(' | '));

let usados = fires;
let fuente = 'NASA FIRMS';
if (usados.length === 0) {
  usados = JSON.parse(readFileSync(join(__dirname, '../data/fires-seed.json'), 'utf-8'));
  fuente = 'seed (respaldo)';
  console.log('  NASA sin focos → usando seed de respaldo');
}

const enriched = enrichAll(usados);
const meta = store.setFires(enriched, { fuente, errores });
console.log(`${enriched.length} focos cacheados (${fuente})`);
console.log(meta);
