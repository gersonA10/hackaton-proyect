import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SA_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  join(__dirname, '../../serviceAccount.json');

let db = null;
let messaging = null;
let firebaseReady = false;

try {
  if (existsSync(SA_PATH)) {
    const serviceAccount = JSON.parse(readFileSync(SA_PATH, 'utf-8'));
    const app = initializeApp({ credential: cert(serviceAccount) });
    db = getFirestore(app);
    messaging = getMessaging(app);
    firebaseReady = true;
    console.log('Firebase conectado (Firestore + FCM)');
  } else {
    console.log(' Firebase no configurado (falta serviceAccount.json) → modo local');
  }
} catch (e) {
  console.warn(' No se pudo iniciar Firebase:', e.message);
}

export { db, messaging, firebaseReady };
