import { Router } from 'express';
import * as store from '../store/firesStore.js';
import { enrichFire } from '../services/boliviaContext.js';
import { analyzeFire, prioritizeFires, chatFire, validateFire } from '../services/geminiService.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const aiRouter = Router();

aiRouter.post('/analyze/:id', asyncHandler(async (req, res) => {
  const fire = store.getById(req.params.id);
  if (!fire) return res.status(404).json({ error: 'Foco no encontrado' });
  const analisis = await analyzeFire(fire);
  store.updateFire(fire.id, { analisis_ia: analisis, analizado_en: new Date().toISOString() });
  res.json({ id: fire.id, analisis });
}));

aiRouter.post('/analyze', asyncHandler(async (req, res) => {
  const fire = req.body?.fire;
  if (!fire?.lat || !fire?.lng) return res.status(400).json({ error: 'Falta fire con lat/lng en el body' });
  const enriched = fire.contexto ? fire : enrichFire(fire);
  const analisis = await analyzeFire(enriched);
  res.json({ analisis, contexto: enriched.contexto, riesgo_base: enriched.riesgo_base });
}));

aiRouter.post('/validate/:id', asyncHandler(async (req, res) => {
  const fire = store.getById(req.params.id);
  if (!fire) return res.status(404).json({ error: 'Foco no encontrado' });
  const validacion = await validateFire(fire);
  store.updateFire(fire.id, { validacion_ia: validacion });
  res.json({ id: fire.id, deteccion_offline: fire.deteccion, validacion });
}));

aiRouter.post('/prioritize', asyncHandler(async (req, res) => {
  const { limit } = req.body || {};
  let fires = store.getAll();
  if (!fires.length) {
    return res.status(400).json({ error: 'No hay focos. Ejecuta POST /api/fires/ingest primero.' });
  }
  if (limit) {
    fires = [...fires]
      .sort((a, b) => (b.riesgo_base?.score || 0) - (a.riesgo_base?.score || 0))
      .slice(0, Number(limit));
  }
  const resultado = await prioritizeFires(fires);
  res.json({ total_focos: fires.length, ...resultado });
}));

aiRouter.post('/chat/:id', asyncHandler(async (req, res) => {
  const fire = store.getById(req.params.id);
  if (!fire) return res.status(404).json({ error: 'Foco no encontrado' });
  const { pregunta, history } = req.body || {};
  if (!pregunta) return res.status(400).json({ error: 'Falta "pregunta"' });
  const respuesta = await chatFire(fire, pregunta, history || []);
  res.json({ id: fire.id, pregunta, respuesta });
}));
