import { Router } from 'express';
import * as store from '../store/firesStore.js';
import { buildSmsMessage, sendSms, sendPush } from '../services/alertService.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const alertsRouter = Router();

alertsRouter.post('/sms', asyncHandler(async (req, res) => {
  const { id, to } = req.body || {};
  if (!id || !to) return res.status(400).json({ error: 'Faltan "id" y "to"' });
  const fire = store.getById(id);
  if (!fire) return res.status(404).json({ error: 'Foco no encontrado' });

  const mensaje = buildSmsMessage(fire);
  const resultado = await sendSms(to, mensaje);
  res.json({ ...resultado });
}));

alertsRouter.post('/push', asyncHandler(async (req, res) => {
  const { id, token, topic } = req.body || {};
  const fire = store.getById(id);
  if (!fire) return res.status(404).json({ error: 'Foco no encontrado' });
  const nivel = fire.analisis_ia?.riesgo || fire.riesgo_base?.nivel || 'MEDIO';
  const resultado = await sendPush({
    token,
    topic,
    title: `Alerta ${nivel}`,
    body: buildSmsMessage(fire),
    data: { fireId: id, nivel },
  });
  res.json(resultado);
}));

alertsRouter.post('/preview', asyncHandler(async (req, res) => {
  const { id } = req.body || {};
  const fire = store.getById(id);
  if (!fire) return res.status(404).json({ error: 'Foco no encontrado' });
  res.json({ id, mensaje: buildSmsMessage(fire) });
}));
