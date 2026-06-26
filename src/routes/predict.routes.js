import { Router } from 'express';
import { predictRisk } from '../services/predictionService.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const predictRouter = Router();

predictRouter.get('/', asyncHandler(async (req, res) => {
  const prediccion = await predictRisk({ escenario: req.query.escenario });
  res.json(prediccion);
}));
