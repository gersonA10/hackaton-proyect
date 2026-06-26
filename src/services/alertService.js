import { config } from '../config/env.js';
import { messaging, firebaseReady } from '../config/firebase.js';

export function buildSmsMessage(fire) {
  const com = fire.contexto?.comunidad_cercana?.nombre || 'zona sin identificar';
  const a = fire.analisis_ia;
  const nivel = a?.riesgo || fire.riesgo_base?.nivel || 'MEDIO';
  const accion = a?.plan_accion?.[0] || 'Verificar foco y activar brigada';
  const frp = fire.frp != null ? `FRP ${fire.frp}MW` : '';
  return `FireGuard ALERTA ${nivel}: foco cerca de ${com}. ${frp}. ${accion}. Responda CONFIRMA o FALSA.`
    .replace(/\s+/g, ' ')
    .slice(0, 300);
}

export async function sendPush({ token, topic = 'alertas', title, body, data = {} }) {
  if (!firebaseReady || !messaging) {
    console.log(`[PUSH SIMULADO] ${title} — ${body}`);
    return { ok: true, simulado: true, canal: 'fcm', title, body };
  }
  const mensaje = {
    notification: { title, body },

    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    ...(token ? { token } : { topic }),
  };
  const id = await messaging.send(mensaje);
  return { ok: true, simulado: false, canal: 'fcm', id, title, body };
}

export async function sendSms(to, body) {
  const { accountSid, authToken, apiKeySid, apiKeySecret, from } = config.twilio;

  const user = apiKeySid || accountSid;
  const pass = apiKeySid ? apiKeySecret : authToken;

  if (!accountSid || !user || !pass || !from) {
    console.log(`[SMS SIMULADO] → ${to}: ${body}`);
    return { ok: true, simulado: true, to, body };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const params = new URLSearchParams({ To: to, From: from, Body: body });

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || 'Error enviando SMS (Twilio)');
  return { ok: true, simulado: false, sid: data.sid, to, body };
}
