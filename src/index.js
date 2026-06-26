import { createApp } from './app.js';
import { config, checkConfig } from './config/env.js';
import * as store from './store/firesStore.js';
import * as reportsStore from './store/reportsStore.js';

const app = createApp();

const loaded = store.load();
console.log(`Caché de focos: ${loaded.count} cargados`);
console.log(`Reportes: ${reportsStore.load()} cargados`);
checkConfig();

app.listen(config.port, () => {
  console.log(`FireGuard AI Bolivia escuchando en http://localhost:${config.port}`);
  console.log(`   Entorno: ${config.nodeEnv} · Modelo IA: ${config.gemini.model}`);
});
