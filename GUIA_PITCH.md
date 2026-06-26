# FireGuard — Guía completa para el pitch

Sistema de inteligencia y alerta temprana de incendios forestales para Bolivia.
Construido sobre datos satelitales reales de la NASA e IA de Google.

---

## 1. Qué hace FireGuard (en una frase)

**La NASA dice DÓNDE hay calor. FireGuard dice QUÉ significa para Bolivia y QUÉ hacer.**

Toma las detecciones de incendios de los satélites de la NASA, las cruza con el
territorio boliviano (comunidades y áreas protegidas reales), usa IA para separar
incendios reales de falsos positivos, generar un plan de acción y priorizar qué
foco atacar primero, y emite alertas a las autoridades.

---

## 2. Qué hace la app, pantalla por pantalla

- **Inicio:** resumen nacional. Estadísticas (zonas críticas, focos activos, posibles
  falsos positivos filtrados, riesgo promedio), mapa de riesgo de Bolivia y lista de
  zonas ordenadas por nivel de riesgo.
- **Mapa:** mapa interactivo con todos los focos satelitales sobre Bolivia. Cada foco
  se toca y abre su detalle.
- **Detalle del foco:** datos del satélite, contexto territorial (comunidad y área
  protegida más cercanas), clasificación de detección (incendio probable / posible
  falso positivo) y, con un toque, el análisis de IA: nivel de riesgo, dirección de
  propagación, plan de acción paso a paso y recursos necesarios. Desde aquí el
  brigadista confirma el estado en terreno y consulta el asistente.
- **Alertas:** focos de riesgo alto y "orden de ataque" generado por IA (qué foco
  atender primero cuando hay varios a la vez).
- **Reporte:** un ciudadano reporta humo/fuego; el reporte llega al backend y queda
  registrado para las autoridades.
- **Predicción:** riesgo de **ignición a 48 h** por zona, con clima en vivo (Open-Meteo:
  temperatura, humedad, viento, lluvia). Marca qué zonas están en peligro de incendiarse
  **antes** de que el satélite vea fuego.

---

## 3. ¿Los datos son reales o simulados?

### Reales (con APIs y servicios que existen)

| Componente | Detalle |
|---|---|
| **Focos de incendio** | **NASA FIRMS** en vivo. Satélites VIIRS (Suomi-NPP y NOAA-20), recorte geográfico de Bolivia, últimas 48 h. Lo que se ve en el mapa son detecciones satelitales reales. |
| **Contexto territorial** | Dataset real de áreas protegidas y comunidades de Bolivia con coordenadas reales. El cruce (comunidad/área más cercana, distancia) se calcula de verdad. |
| **Detección de falsos positivos** | Clasificación determinista sobre FRP, confianza y brillo del satélite. Funciona sin internet. |
| **Inteligencia (IA)** | **Google Gemini 2.5** real. Análisis, validación, priorización y chat. |
| **Reportes y confirmaciones** | Se guardan de verdad en el backend. |
| **Predicción de ignición** | Clima en vivo (Open-Meteo) → índice de peligro de incendio a 48 h por zona. Predice riesgo **antes** de que haya fuego. |

### En modo demostración (el código es real; el envío externo necesita la cuenta configurada)

| Componente | Cómo está en la demo |
|---|---|
| **Alertas SMS (Twilio)** | El backend arma y envía el SMS por Twilio. En la demo corre en modo simulación (registra el mensaje en consola) porque Twilio restringe el envío de SMS a Bolivia (+591) en cuentas trial. |
| **Alertas push (FCM)** | El backend envía notificaciones push por Firebase Cloud Messaging. Queda activo cuando el proyecto Firebase tiene la base creada y el dispositivo registrado. |
| **Sincronización en la nube (Firestore)** | El backend espeja los focos y reportes a Firestore. Mientras la base no está creada, el sistema trabaja en modo local (archivo JSON) y la app funciona igual. |

> Resumen honesto para el jurado: **los incendios que ve la app son reales (NASA), y la
> IA que los analiza es real (Gemini).** Las alertas SMS/push están integradas y corren
> en modo demo por límites de cuenta, no por falta de código.

---

## 4. Dónde se usa Gemini, exactamente

Cuatro usos, todos con el modelo `gemini-2.5-flash` (SDK oficial `@google/genai`):

1. **Validación de detección** — `POST /api/ai/validate/:id`
   Decide si un punto de calor es un incendio forestal real o un falso positivo
   (quema agrícola, antorcha industrial, reflejo solar). Reduce falsas alarmas.
2. **Análisis del foco** — `POST /api/ai/analyze/:id`
   Devuelve nivel de riesgo, dirección de propagación, plan de acción y recursos.
3. **Priorización** — `POST /api/ai/prioritize`
   Ordena varios focos simultáneos por prioridad de ataque (vidas, comunidades, áreas).
4. **Asistente** — `POST /api/ai/chat/:id`
   Responde preguntas del brigadista usando los datos del foco.

---

## 5. Integración de APIs reales (punto fuerte del pitch)

Un proyecto sólido se construye sobre APIs reales que ya existen, no sobre datos
inventados. FireGuard integra cuatro:

- **NASA FIRMS** — detecciones de incendios satelitales (gratis).
- **Open-Meteo** — clima en vivo para predecir la ignición antes del fuego (gratis, sin key).
- **Google Gemini 2.5** — inteligencia (gratis en su nivel base).
- **Firebase (Firestore + FCM)** — base en la nube y notificaciones (gratis).
- **Twilio** — SMS a teléfonos.

Mensaje: todo el stack es gratuito y accesible, lo que permite que un municipio
boliviano sin recursos lo use.

---

## 6. Diferencia con Satellites on Fire (la empresa argentina)

Satellites on Fire es una startup argentina (US$2,7 M de inversión) que detecta
incendios agregando 8+ satélites y avisa por WhatsApp ~35 min antes que la NASA.
Es un referente serio. FireGuard no compite en "detectar más rápido"; compite en
**convertir la detección en la decisión correcta para Bolivia**.

| | Satellites on Fire | FireGuard |
|---|---|---|
| Qué resuelve | Detectar dónde y cuándo (más rápido) | Qué significa y qué hacer |
| Datos | 8+ satélites (NASA, NOAA, ESA) | NASA FIRMS (VIIRS) |
| IA | Modelos propios (20.000+ reportes) | Gemini 2.5 (análisis, validación, priorización, chat) |
| Contexto local | Genérico, global (21 países) | Hiperlocal Bolivia (comunidades, áreas protegidas, bosque chiquitano) |
| Salida | Predicción de propagación | Plan de acción + orden de ataque + filtra falsos positivos |
| Antes del fuego | Detecta antes que FIRMS | Predice ignición a 48 h con clima (antes de que haya calor) |
| Alertas | WhatsApp | Push (FCM) + SMS |
| Modelo de negocio | SaaS, US$0,02–10/hectárea/año | Gratis / abierto |
| Conectividad | Requiere conexión | Detección de falsos positivos funciona offline |

**Nuestros diferenciadores:** predicción de ignición con clima (alerta **antes** de que
arda), contexto territorial boliviano, soporte a la decisión (no solo detección),
reducción de falsos positivos, gratuito y accesible, y capacidad offline para zonas
rurales sin conexión.

> **El "antes que NASA":** los satélites detectan el incendio cuando ya hay calor.
> FireGuard cruza temperatura, humedad, viento y lluvia en vivo para marcar qué zonas
> están en riesgo de incendiarse en las próximas 48 h, antes de que exista el fuego.
> Eso convierte el sistema de reactivo a **preventivo**.

---

## 7. Guion de la demo (5 minutos)

1. **Problema:** Bolivia pierde millones de hectáreas por incendios cada año; el dato
   satelital crudo no le dice al brigadista qué hacer.
2. **Inicio:** se ve el mapa con focos reales — señalar el badge "NASA FIRMS · datos en
   vivo". Estos incendios están ocurriendo ahora.
3. **Mapa → tocar un foco:** se ve a qué comunidad y área protegida amenaza.
4. **Detección:** la app marca si es incendio probable o posible falso positivo.
5. **Analizar con IA:** Gemini genera, en vivo, el nivel de riesgo y el plan de acción.
6. **Alertas → orden de ataque:** Gemini ordena varios focos por prioridad.
7. **Predicción:** mostrar el riesgo de ignición a 48 h con clima en vivo — "esto avisa
   ANTES de que haya fuego". Es el cierre preventivo y el mayor diferenciador.
8. **Reporte:** un ciudadano reporta un evento y llega a las autoridades.
9. **Cierre:** todo corre sobre APIs reales y gratuitas (NASA + Open-Meteo + Gemini + Firebase).

---

## 8. Cómo probar las alertas y el SMS

Con el backend corriendo (`npm run dev`):

```bash
# 1) Cargar focos reales de NASA
curl -X POST localhost:3000/api/fires/ingest -H "Content-Type: application/json" -d '{"limit":15}'

# 2) Tomar el id de un foco
curl -s "localhost:3000/api/fires?limit=1"

# 3) Ver el mensaje de alerta que se enviaría (sin enviar)
curl -X POST localhost:3000/api/alerts/preview -H "Content-Type: application/json" -d '{"id":"PEGAR_ID"}'

# 4) Enviar la alerta SMS (en la demo responde {simulado:true} y registra el
#    mensaje en la consola del backend: "[SMS SIMULADO] ...")
curl -X POST localhost:3000/api/alerts/sms -H "Content-Type: application/json" -d '{"id":"PEGAR_ID","to":"+59171234567"}'

# 5) Enviar alerta push (FCM)
curl -X POST localhost:3000/api/alerts/push -H "Content-Type: application/json" -d '{"id":"PEGAR_ID"}'
```

El texto del SMS se arma con los datos reales del foco: nivel de riesgo, comunidad
cercana, intensidad y la primera acción del plan.

---

## 9. Preguntas probables del jurado

- **¿Los datos son reales?** Sí — son detecciones en vivo de los satélites de la NASA.
- **¿La IA es real?** Sí — es Google Gemini 2.5 analizando cada foco.
- **¿Por qué no detección propia como Satellites on Fire?** Porque el problema en Bolivia
  no es solo detectar; es decidir qué hacer con recursos limitados. Ahí aportamos valor.
- **¿Cómo se sostiene?** Todo el stack es gratuito: NASA, Gemini, Firebase.
- **¿Funciona sin internet?** La detección de falsos positivos sí, con reglas locales.
