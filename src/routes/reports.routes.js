import { Router } from 'express';
import * as store from '../store/reportsStore.js';

export const reportsRouter = Router();

reportsRouter.post('/', (req, res) => {
  const { tipo, referencia, descripcion, lat, lng } = req.body || {};
  if (!descripcion && !referencia) {
    return res.status(400).json({ error: 'Falta descripción o referencia' });
  }
  const reporte = store.add({ tipo, referencia, descripcion, lat, lng });
  res.json({ ok: true, reporte });
});

reportsRouter.get('/', (req, res) => {
  res.json({ count: store.getAll().length, reportes: store.getAll() });
});
