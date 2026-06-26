import { Router } from 'express';
import { fetchFires } from '../services/firmsService.js';
import { enrichAll, getZonas } from '../services/boliviaContext.js';
import * as store from '../store/firesStore.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const firesRouter = Router();

firesRouter.post('/ingest', asyncHandler(async (req, res) => {
  const { days, sources, limit, bbox } = req.body || {};
  const opts = {};
  if (days) opts.days = Number(days);
  if (limit) opts.limit = Number(limit);
  if (bbox) opts.bbox = bbox;
  if (sources) opts.sources = Array.isArray(sources) ? sources : String(sources).split(',');

  const { fires, errores, total_detectados } = await fetchFires(opts);

  let usados = fires;
  let fuente = 'NASA FIRMS';
  if (usados.length === 0) {
    const seed = JSON.parse(readFileSync(join(__dirname, '../../data/fires-seed.json'), 'utf-8'));
    usados = seed;
    fuente = 'seed (respaldo — NASA sin focos)';
  }

  const enriched = enrichAll(usados);
  const meta = store.setFires(enriched, { fuente, errores });

  res.json({
    ok: true,
    ingeridos: enriched.length,
    total_detectados,
    fuente,
    meta,
    errores,
  });
}));

firesRouter.get('/', (req, res) => {
  let fires = store.getAll();
  const { nivel, limit } = req.query;
  if (nivel) fires = fires.filter((f) => f.riesgo_base?.nivel === String(nivel).toUpperCase());
  if (limit) fires = fires.slice(0, Number(limit));
  res.json({ count: fires.length, meta: store.getMeta(), fires });
});

firesRouter.get('/zonas', (req, res) => res.json(getZonas()));

firesRouter.get('/:id', (req, res) => {
  const fire = store.getById(req.params.id);
  if (!fire) return res.status(404).json({ error: 'Foco no encontrado' });
  res.json(fire);
});

firesRouter.post('/:id/confirm', (req, res) => {
  const { estado, nota, brigadista } = req.body || {};
  if (!estado) return res.status(400).json({ error: 'Falta "estado"' });
  const updated = store.updateFire(req.params.id, {
    confirmacion: {
      estado,
      nota: nota || '',
      brigadista: brigadista || null,
      confirmado_en: new Date().toISOString(),
    },
  });
  if (!updated) return res.status(404).json({ error: 'Foco no encontrado' });
  res.json({ ok: true, fire: updated });
});
