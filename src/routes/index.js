import { Router } from 'express';
import { firesRouter } from './fires.routes.js';
import { aiRouter } from './ai.routes.js';
import { alertsRouter } from './alerts.routes.js';
import { reportsRouter } from './reports.routes.js';
import { predictRouter } from './predict.routes.js';

export const router = Router();

router.get('/', (req, res) => {
  res.json({
    nombre: 'FireGuard AI Bolivia API ',
    descripcion: 'Capa de inteligencia boliviana sobre datos satelitales de incendios (NASA FIRMS + Gemini)',
    endpoints: {
      datos: [
        'POST /api/fires/ingest        → descarga focos reales de NASA FIRMS',
        'GET  /api/fires               → lista de focos (?nivel=ALTO&limit=20)',
        'GET  /api/fires/zonas         → contexto territorial de Bolivia',
        'GET  /api/fires/:id           → detalle de un foco',
        'POST /api/fires/:id/confirm   → confirmación del brigadista',
      ],
      inteligencia: [
        'POST /api/ai/validate/:id     → detección: ¿incendio real o falso positivo?',
        'POST /api/ai/analyze/:id      → análisis Gemini de un foco',
        'POST /api/ai/prioritize       → orden de ataque de todos los focos',
        'POST /api/ai/chat/:id         → chat IA sobre un foco (con nuestros datos)',
      ],
      alertas: [
        'POST /api/alerts/preview      → mensaje que se enviaría (sin enviar)',
        'POST /api/alerts/push         → alerta push GRATIS por FCM (Firebase)',
        'POST /api/alerts/sms          → alerta SMS (simulado / Twilio opcional)',
      ],
      reportes: [
        'POST /api/reports             → crea un reporte ciudadano',
        'GET  /api/reports             → lista de reportes',
      ],
      prediccion: [
        'GET  /api/predict             → riesgo de ignición a 48h (clima real)',
      ],
    },
  });
});

router.use('/fires', firesRouter);
router.use('/ai', aiRouter);
router.use('/alerts', alertsRouter);
router.use('/reports', reportsRouter);
router.use('/predict', predictRouter);
