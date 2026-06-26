import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

const ai = new GoogleGenAI({ apiKey: config.gemini.key });
const MODEL = config.gemini.model;

function parseJson(text) {
  const cleaned = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/[[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Gemini no devolvió JSON válido: ' + cleaned.slice(0, 200));
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(prompt, { json = false, temperature = 0.4 } = {}) {

  let lastErr;
  for (let intento = 0; intento < 4; intento++) {
    try {
      const r = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature,
          ...(json ? { responseMimeType: 'application/json' } : {}),
        },
      });
      if (r.text && r.text.trim()) return r.text;
      lastErr = new Error('Gemini devolvió respuesta vacía');
    } catch (e) {
      lastErr = e;
    }
    if (intento < 3) await sleep(700 * (intento + 1));
  }

  const msg = String(lastErr?.message || '');
  if (/503|overload|high demand|unavailable|429|quota|exhausted|exceeded|rate.?limit/i.test(msg)) {
    throw new Error('El modelo de IA alcanzó el límite gratuito por minuto. Espera unos segundos e intenta de nuevo.');
  }
  throw lastErr;
}

export async function analyzeFire(fire) {
  const datos = {
    lat: fire.lat,
    lng: fire.lng,
    frp_mw: fire.frp,
    confianza: fire.confianza,
    fecha: fire.acq_date,
    dia_noche: fire.dia_noche,
    fuente: fire.fuente,
  };

  const prompt = `Eres el coordinador nacional de emergencias por incendios forestales de Bolivia.
Estamos en temporada seca (junio-octubre), cuando los chaqueos y el viento del norte/noreste propagan el fuego rápido en el bosque seco chiquitano.

FOCO DETECTADO POR SATÉLITE (NASA FIRMS):
${JSON.stringify(datos, null, 2)}

CONTEXTO TERRITORIAL BOLIVIANO:
${JSON.stringify(fire.contexto, null, 2)}

RIESGO BASE PRECALCULADO (0-100):
${JSON.stringify(fire.riesgo_base)}

Analiza este foco para Bolivia. Considera FRP (intensidad), cercanía a comunidades,
valor ecológico del área protegida y comportamiento típico del fuego en bosque seco.
Responde EXCLUSIVAMENTE en JSON válido con esta forma exacta:
{
  "riesgo": "ALTO|MEDIO|BAJO",
  "razon": "una frase con contexto local concreto",
  "comunidad_en_riesgo": "nombre o null",
  "area_protegida_afectada": "nombre o null",
  "direccion_propagacion": "texto corto (ej: 'hacia el SO, hacia Concepción')",
  "ventana_critica_min": número (minutos estimados antes de que escale),
  "plan_accion": ["paso 1", "paso 2", "paso 3", "paso 4"],
  "recursos_necesarios": ["recurso 1", "recurso 2"],
  "prioridad": número 1-5 (1 = atacar primero)
}`;

  return parseJson(await generate(prompt, { json: true }));
}

export async function prioritizeFires(fires) {
  const resumen = fires.map((f) => ({
    id: f.id,
    frp_mw: f.frp,
    riesgo_base: f.riesgo_base,
    comunidad: f.contexto?.comunidad_cercana
      ? `${f.contexto.comunidad_cercana.nombre} (${f.contexto.comunidad_cercana.distancia_km}km, ${f.contexto.comunidad_cercana.poblacion} hab)`
      : null,
    area_protegida: f.contexto?.area_protegida
      ? `${f.contexto.area_protegida.nombre} (${f.contexto.area_protegida.valor_ecologico})`
      : null,
  }));

  const prompt = `Eres el coordinador de emergencias de Bolivia en temporada de incendios.
Hay ${fires.length} focos activos AL MISMO TIEMPO y los recursos (brigadas, agua, aviones) son limitados.
Tu trabajo: decidir el ORDEN DE ATAQUE. No todos se pueden atacar a la vez.

FOCOS ACTIVOS:
${JSON.stringify(resumen, null, 2)}

Prioriza protegiendo primero vidas humanas, luego comunidades, luego áreas protegidas de alto valor.
Responde EXCLUSIVAMENTE en JSON válido:
{
  "resumen_situacion": "2-3 frases sobre la situación general",
  "orden": [
    { "id": "id_del_foco", "prioridad": 1, "razon": "por qué este orden", "accion_inmediata": "qué hacer ya" }
  ]
}
Incluye TODOS los focos en "orden", del más urgente (prioridad 1) al menos urgente.`;

  return parseJson(await generate(prompt, { json: true, temperature: 0.3 }));
}

export async function validateFire(fire) {
  const datos = {
    frp_mw: fire.frp,
    brillo_k: fire.brillo_k,
    confianza: fire.confianza,
    dia_noche: fire.dia_noche,
    fecha: fire.acq_date,
  };
  const prompt = `Eres un analista de detección temprana de incendios forestales en Bolivia.
Tu único objetivo es REDUCIR FALSOS POSITIVOS: decidir si un punto de calor satelital
es un incendio forestal real o un falso positivo.
Falsos positivos típicos en Bolivia: quema agrícola controlada (chaqueo), antorchas
industriales/gas, reflejo solar sobre techos o agua, ruido del sensor.

SEÑALES DEL SATÉLITE (NASA FIRMS):
${JSON.stringify(datos, null, 2)}

DETECCIÓN AUTOMÁTICA OFFLINE (heurística previa):
${JSON.stringify(fire.deteccion, null, 2)}

CONTEXTO TERRITORIAL:
${JSON.stringify(fire.contexto, null, 2)}

Responde EXCLUSIVAMENTE en JSON válido:
{
  "es_incendio_real": true|false,
  "clasificacion": "INCENDIO_FORESTAL|QUEMA_AGRICOLA|FALSO_POSITIVO|REQUIERE_VERIFICACION",
  "confianza_pct": número 0-100,
  "razon": "explicación breve y concreta",
  "recomendacion_verificacion": "qué hacer para confirmar"
}`;
  return parseJson(await generate(prompt, { json: true, temperature: 0.2 }));
}

export async function chatFire(fire, pregunta, history = []) {
  const hist = history
    .slice(-6)
    .map((m) => `${m.rol === 'asistente' ? 'Asistente' : 'Brigadista'}: ${m.texto}`)
    .join('\n');

  const prompt = `Eres un asistente de emergencias para brigadistas de incendios en Bolivia.
Respondes breve, claro y accionable, en español. Si no sabes algo, dilo.
Escribe en TEXTO PLANO: nada de markdown, sin **negritas**, sin # títulos ni viñetas con *.

DATOS DEL INCENDIO (úsalos para responder, incluida la ubicación EXACTA):
${JSON.stringify(
    {
      coordenadas: { lat: fire.lat, lng: fire.lng },
      frp_mw: fire.frp,
      confianza: fire.confianza,
      fecha: fire.acq_date,
      hora_utc: fire.acq_time,
      dia_noche: fire.dia_noche,
      satelite: fire.fuente,
      deteccion: fire.deteccion,
      contexto: fire.contexto,
      riesgo_base: fire.riesgo_base,
      analisis_ia: fire.analisis_ia,
    },
    null,
    2,
  )}
${hist ? `\nCONVERSACIÓN PREVIA:\n${hist}\n` : ''}
Pregunta del brigadista: ${pregunta}`;

  return (await generate(prompt, { temperature: 0.6 })).trim();
}
