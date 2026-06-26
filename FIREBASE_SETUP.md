# 🔥 Configurar Firebase (Firestore + FCM) — todo gratis

El código ya está listo en backend y front. Solo faltan estos pasos que **debes hacer tú**
(requieren tu cuenta de Google). Toma ~15 min.

---

## A. Crear el proyecto (consola web)

1. Entra a <https://console.firebase.google.com> → **Agregar proyecto**.
   - Nombre: `fireguard-bolivia` (o el que quieras). Puedes **desactivar Google Analytics**.
2. En el menú izquierdo: **Build → Firestore Database → Crear base de datos**.
   - Modo: **test mode** (para el hackathon está bien).
   - Región: `southamerica-east1` o `us-central1`.
3. Cloud Messaging (FCM) ya viene habilitado con el proyecto, no hay paso extra.

## B. Credencial del BACKEND (service account)

4. Engranaje ⚙️ (arriba izq.) → **Configuración del proyecto** → pestaña **Cuentas de servicio**.
5. **Generar nueva clave privada** → descarga el archivo JSON.
6. Renómbralo a **`serviceAccount.json`** y ponlo en la raíz del backend:
   ```
   /Users/gersonaguilar/Documents/hackaton-proyect/serviceAccount.json
   ```
   Ya está en `.gitignore` (nunca se sube). Al reiniciar el backend verás:
   `🔥 Firebase conectado (Firestore + FCM)`

## C. Configurar el FRONT (Flutter)

7. Instala las CLIs (una sola vez):
   ```bash
   dart pub global activate flutterfire_cli
   firebase login
   ```
8. En el front, agrega los paquetes y configura:
   ```bash
   cd /Users/gersonaguilar/front_fireguard
   flutter pub add firebase_core cloud_firestore firebase_messaging
   flutterfire configure
   ```
   - Elige el proyecto `fireguard-bolivia`.
   - Marca plataformas: **android, ios, web**.
   - Esto genera `lib/firebase_options.dart`.

---

## Qué avisarme

- ✅ **"serviceAccount.json puesto"** → el backend ya escribe focos en Firestore y manda push.
- ✅ **"flutterfire configure listo"** → yo cableo el front: init de Firebase, lectura de
  focos desde Firestore en tiempo real y recepción de alertas FCM.

## Cómo queda la arquitectura

```
NASA FIRMS ─► Backend Express ─► Firestore ──(realtime)──► App Flutter
                   │                                          ▲
                   ├─ Gemini (análisis / detección)           │
                   └─ FCM push ───────────────────────────────┘ (alertas gratis)
```
