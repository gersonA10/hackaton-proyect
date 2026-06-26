import { getZonas } from './boliviaContext.js';

function fireDanger({ tempMax, humedadMin, vientoMax, lluvia48 }) {
  let s = 0;

  if (humedadMin < 20) s += 32;
  else if (humedadMin < 30) s += 24;
  else if (humedadMin < 40) s += 14;
  else if (humedadMin < 50) s += 6;

  if (tempMax > 35) s += 26;
  else if (tempMax > 32) s += 20;
  else if (tempMax > 28) s += 12;
  else if (tempMax > 24) s += 6;

  if (vientoMax > 35) s += 20;
  else if (vientoMax > 25) s += 14;
  else if (vientoMax > 15) s += 7;

  if (lluvia48 >= 10) s -= 35;
  else if (lluvia48 >= 3) s -= 20;
  else if (lluvia48 >= 0.5) s -= 10;
  else s += 10;

  s = Math.max(0, Math.min(100, Math.round(s)));
  const nivel = s >= 60 ? 'EXTREMO' : s >= 40 ? 'ALTO' : s >= 22 ? 'MEDIO' : 'BAJO';
  return { score: s, nivel };
}

export async function predictRisk({ escenario = 'real' } = {}) {
  const comunidades = getZonas().comunidades;
  const seco = escenario === 'critico' || escenario === 'seco';

  let arr = [];
  if (!seco) {
    const lats = comunidades.map((c) => c.lat).join(',');
    const lngs = comunidades.map((c) => c.lng).join(',');
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}` +
      `&daily=temperature_2m_max,relative_humidity_2m_min,wind_speed_10m_max,precipitation_sum` +
      `&forecast_days=2&timezone=auto`;
    const resp = await fetch(url);
    const data = await resp.json();
    arr = Array.isArray(data) ? data : [data];
  }

  const zonas = comunidades
    .map((c, i) => {
      let tempMax, humedadMin, vientoMax, lluvia48;
      if (seco) {

        humedadMin = 10 + (i % 5) * 3;
        tempMax = 40 - (i % 4);
        vientoMax = 28 + (i % 6) * 2;
        lluvia48 = 0;
      } else {
        const d = arr[i]?.daily || {};
        const idx = (d.temperature_2m_max?.length || 0) > 1 ? 1 : 0;
        tempMax = d.temperature_2m_max?.[idx] ?? 0;
        humedadMin = d.relative_humidity_2m_min?.[idx] ?? 100;
        vientoMax = d.wind_speed_10m_max?.[idx] ?? 0;
        lluvia48 = (d.precipitation_sum?.[0] ?? 0) + (d.precipitation_sum?.[1] ?? 0);
      }

      return {
        zona: c.nombre,
        departamento: c.departamento,
        lat: c.lat,
        lng: c.lng,
        clima: {
          temp_max: tempMax,
          humedad_min: humedadMin,
          viento_max: vientoMax,
          lluvia_48h: Math.round(lluvia48 * 10) / 10,
        },
        riesgo_ignicion: fireDanger({ tempMax, humedadMin, vientoMax, lluvia48 }),
      };
    })
    .sort((a, b) => b.riesgo_ignicion.score - a.riesgo_ignicion.score);

  return {
    horizonte: '48h',
    fuente: seco ? 'Simulación temporada seca' : 'Open-Meteo (clima en vivo)',
    escenario: seco ? 'critico' : 'real',
    generado: new Date().toISOString(),
    zonas,
  };
}
