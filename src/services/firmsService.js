import { config } from '../config/env.js';

const BASE = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

export function buildUrl(source, { key = config.firms.key, bbox = config.firms.bbox, days = config.firms.days } = {}) {
  return `${BASE}/${key}/${source}/${bbox}/${days}`;
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    const row = {};
    headers.forEach((h, i) => { row[h] = (cols[i] ?? '').trim(); });
    return row;
  });
}

const CONFIANZA = { l: 'baja', n: 'nominal', h: 'alta' };

function normalize(row, source) {
  const lat = parseFloat(row.latitude);
  const lng = parseFloat(row.longitude);
  const id = `${source}_${row.acq_date}_${row.acq_time}_${lat.toFixed(4)}_${lng.toFixed(4)}`
    .replace(/[^a-zA-Z0-9_-]/g, '');
  return {
    id,
    lat,
    lng,
    frp: parseFloat(row.frp) || 0,
    brillo_k: parseFloat(row.bright_ti4 || row.brightness) || null,
    confianza: CONFIANZA[String(row.confidence).toLowerCase()] || row.confidence || null,
    satelite: row.satellite || null,
    instrumento: row.instrument || 'VIIRS',
    acq_date: row.acq_date,
    acq_time: row.acq_time,
    dia_noche: row.daynight === 'D' ? 'dia' : row.daynight === 'N' ? 'noche' : row.daynight || null,
    fuente: source,
  };
}

export async function fetchFromSource(source, opts = {}) {
  const url = buildUrl(source, opts);
  const resp = await fetch(url);
  const text = await resp.text();

  if (!resp.ok || text.trim().startsWith('<') || /invalid|error|exceeded/i.test(text.slice(0, 120))) {
    throw new Error(`FIRMS ${source}: ${resp.status} — ${text.slice(0, 160)}`);
  }
  return parseCsv(text)
    .map((r) => normalize(r, source))
    .filter((f) => Number.isFinite(f.lat) && Number.isFinite(f.lng));
}

const BOLIVIA_POLY = [
  [-69.0, -16.2], [-69.5, -17.5], [-68.9, -19.0], [-68.2, -20.5], [-67.8, -22.0],
  [-67.0, -22.9], [-64.5, -22.8], [-62.8, -22.0], [-62.2, -21.0], [-61.7, -20.0],
  [-58.2, -19.6], [-58.0, -18.0], [-58.4, -16.3], [-60.2, -15.0], [-60.5, -12.5],
  [-62.7, -11.0], [-65.3, -10.0], [-65.4, -9.7], [-66.8, -10.0], [-68.8, -11.0],
  [-69.0, -12.5], [-69.0, -14.0],
];

export function enBolivia(lat, lng) {
  let dentro = false;
  for (let i = 0, j = BOLIVIA_POLY.length - 1; i < BOLIVIA_POLY.length; j = i++) {
    const [xi, yi] = BOLIVIA_POLY[i];
    const [xj, yj] = BOLIVIA_POLY[j];
    const cruza = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

export async function fetchFires({
  sources = config.firms.sources,
  days = config.firms.days,
  bbox = config.firms.bbox,
  limit = 150,
} = {}) {
  const all = [];
  const errores = [];

  for (const source of sources) {
    try {
      const fires = await fetchFromSource(source, { days, bbox });
      all.push(...fires);
    } catch (e) {
      errores.push(e.message);
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const f of all.sort((a, b) => b.frp - a.frp)) {
    const key = `${f.lat.toFixed(3)},${f.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(f);
  }

  const soloBolivia = deduped.filter((f) => enBolivia(f.lat, f.lng));

  return { fires: soloBolivia.slice(0, limit), errores, total_detectados: soloBolivia.length };
}
