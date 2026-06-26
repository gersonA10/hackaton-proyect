import express from 'express';
import { router } from './routes/index.js';

export function createApp() {
  const app = express();

  // Middlewares base
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rutas
  app.use('/api', router);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Manejador de errores
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}
