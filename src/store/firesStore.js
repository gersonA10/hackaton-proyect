import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db, firebaseReady } from '../config/firebase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const FILE = join(DATA_DIR, 'fires-cache.json');

async function mirrorAll(items) {
  if (!firebaseReady || !db) return;
  try {
    const batch = db.batch();
    for (const f of items) batch.set(db.collection('focos').doc(f.id), f);
    await batch.commit();
  } catch (e) {
    console.warn(' Firestore sync (focos):', e.message);
  }
}

async function mirrorOne(item) {
  if (!firebaseReady || !db || !item) return;
  try {
    await db.collection('focos').doc(item.id).set(item, { merge: true });
  } catch (e) {
    console.warn(' Firestore sync (foco):', e.message);
  }
}

let fires = [];
let meta = { ingerido_en: null, fuente: null, count: 0 };

function persist() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify({ meta, fires }, null, 2));
}

export function load() {
  if (existsSync(FILE)) {
    try {
      const data = JSON.parse(readFileSync(FILE, 'utf-8'));
      fires = data.fires || [];
      meta = data.meta || meta;
    } catch {

    }
  }
  return { count: fires.length, meta };
}

export function getAll() {
  return fires;
}

export function getById(id) {
  return fires.find((f) => f.id === id) || null;
}

export function setFires(newFires, info = {}) {
  fires = newFires;
  meta = { ingerido_en: new Date().toISOString(), count: fires.length, ...info };
  persist();
  mirrorAll(fires);
  return meta;
}

export function updateFire(id, patch) {
  const f = getById(id);
  if (!f) return null;
  Object.assign(f, patch);
  persist();
  mirrorOne(f);
  return f;
}

export function getMeta() {
  return meta;
}
