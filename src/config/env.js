import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  firms: {
    key: process.env.FIRMS_KEY || '',

    bbox: process.env.FIRMS_BBOX || '-70,-23,-57,-9',
    sources: (process.env.FIRMS_SOURCES || 'VIIRS_SNPP_NRT,VIIRS_NOAA20_NRT')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    days: Number(process.env.FIRMS_DAYS || 2),
  },

  gemini: {
    key: process.env.GEMINI_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    apiKeySid: process.env.TWILIO_API_KEY_SID || '',
    apiKeySecret: process.env.TWILIO_API_KEY_SECRET || '',
    from: process.env.TWILIO_FROM || '',
  },
};

export function checkConfig() {
  const warns = [];
  if (!config.firms.key) warns.push('FIRMS_KEY vacío → /api/fires/ingest fallará');
  if (!config.gemini.key) warns.push('GEMINI_KEY vacío → endpoints de /api/ai fallarán');
  for (const w of warns) console.warn(` ${w}`);
  return warns;
}
