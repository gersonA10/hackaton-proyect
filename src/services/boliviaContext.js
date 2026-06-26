import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nearest } from '../lib/geo.js';
import { classifyFire } from './detectionService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const zonas = JSON.parse(readFileSync(join(__dirname, '../../data/bolivia-zonas.json'), 'utf-8'));

export function getZonas() {
  return zonas;
}

const PESO_ECOLOGICO = { 'muy alto': 1, alto: 0.8, medio: 0.5, bajo: 0.3 };

function riesgoBase(fire, comunidad, area, dentroArea) {
  const frp = Number(fire.frp) || 0;
  const frpScore = Math.min(50, (frp / 50) * 50);

  let proxScore = 0;
  if (comunidad && comunidad.distancia_km <= 50) {
    proxScore = 30 * (1 - comunidad.distancia_km / 50);
  }

  let ecoScore = 0;
  if (area) {
    const peso = PESO_ECOLOGICO[area.valor_ecologico] || 0.5;
    if (dentroArea) ecoScore = 20 * peso;
    else if (area.distancia_km <= 30) ecoScore = 10 * peso;
  }

  const score = Math.round(frpScore + proxScore + ecoScore);
  let nivel = 'BAJO';
  if (score >= 60) nivel = 'ALTO';
  else if (score >= 35) nivel = 'MEDIO';
  return { score, nivel };
}

export function enrichFire(fire) {
  const comunidad = nearest(fire.lat, fire.lng, zonas.comunidades);
  const area = nearest(fire.lat, fire.lng, zonas.areas_protegidas);
  const dentroArea = !!area && area.distancia_km <= (area.radio_km || 0);

  return {
    ...fire,
    contexto: {
      comunidad_cercana: comunidad && {
        nombre: comunidad.nombre,
        tipo: comunidad.tipo,
        departamento: comunidad.departamento,
        poblacion: comunidad.poblacion,
        distancia_km: comunidad.distancia_km,
      },
      area_protegida: area && {
        nombre: area.nombre,
        tipo: area.tipo,
        bosque: area.bosque,
        valor_ecologico: area.valor_ecologico,
        distancia_km: area.distancia_km,
        dentro: dentroArea,
      },
    },

    deteccion: classifyFire(fire),
    riesgo_base: riesgoBase(fire, comunidad, area, dentroArea),
  };
}

export function enrichAll(fires) {
  return fires.map(enrichFire);
}
