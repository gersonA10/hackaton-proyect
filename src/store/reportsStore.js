import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db, firebaseReady } from '../config/firebase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const FILE = join(DATA_DIR, 'reports.json');

let reports = [];

function persist() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(reports, null, 2));
}

async function mirror(report) {
  if (!firebaseReady || !db) return;
  try {
    await db.collection('reportes').doc(report.id).set(report);
  } catch (e) {
    console.warn(' Firestore sync (reporte):', e.message);
  }
}

export function load() {
  if (existsSync(FILE)) {
    try {
      reports = JSON.parse(readFileSync(FILE, 'utf-8'));
    } catch {
      reports = [];
    }
  }
  return reports.length;
}

export function getAll() {
  return reports;
}

export function add({ tipo, referencia, descripcion, lat, lng }) {
  const report = {
    id: `r_${Date.now()}`,
    tipo: tipo || 'otro',
    referencia: referencia || '',
    descripcion: descripcion || '',
    lat: lat ?? null,
    lng: lng ?? null,
    estado: 'pendiente',
    creado_en: new Date().toISOString(),
  };
  reports.unshift(report);
  persist();
  mirror(report);
  return report;
}
