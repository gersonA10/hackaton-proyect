# FireGuard — Guía 3: TODO de la A a la Z (referencia completa + banco de preguntas)

Todo lo que tiene la app, cómo funciona y cómo responder cualquier pregunta del jurado.

---

## 1. Resumen en una frase

FireGuard toma los incendios que detectan los satélites de la NASA, los cruza con el
territorio boliviano, usa IA (Google Gemini) para separar incendios reales de falsas
alarmas, generar un plan de acción y priorizar qué atacar primero, **y además predice
con datos del clima qué zonas están en riesgo de incendiarse antes de que haya fuego.**

> "La NASA dice DÓNDE hay calor. FireGuard dice QUÉ significa para Bolivia, QUÉ hacer, y
> AVISA antes de que arda."

## 2. El problema

Bolivia pierde millones de hectáreas por incendios cada año, sobre todo en la Chiquitanía
(bosque seco chiquitano) y la Amazonía, en la temporada seca (agosto-octubre). El dato
satelital crudo (un punto rojo en un mapa) no le dice al brigadista qué comunidad está en
peligro, ni qué foco atacar primero, ni si es un incendio real o una quema agrícola. Ese
es el vacío que llenamos.

## 3. Qué hace la app (funciones)

1. Muestra los incendios reales de Bolivia en un mapa.
2. Cruza cada foco con la comunidad y el área protegida más cercanas.
3. Clasifica si es incendio probable o posible falso positivo.
4. Genera, con IA, riesgo + dirección de propagación + plan de acción + recursos.
5. Prioriza varios incendios simultáneos (orden de ataque).
6. Predice el riesgo de ignición a 48 h por zona, con el clima.
7. Emite alertas (push / SMS) a las autoridades.
8. Recibe reportes ciudadanos de humo/fuego.
9. El brigadista confirma el estado en terreno.

## 4. Arquitectura (cómo se conecta todo)

```
   App Flutter (móvil/web)
        │  HTTP/REST
        ▼
   Backend Node.js + Express  ──►  NASA FIRMS     (focos satelitales)
        │                     ──►  Open-Meteo     (clima para la predicción)
        │                     ──►  Google Gemini  (análisis, validación, priorización, chat)
        │                     ──►  Twilio         (SMS)
        ▼
   Firebase: Firestore (datos en la nube) + FCM (notificaciones push)
```

El backend es el cerebro: habla con todas las APIs (las llaves quedan seguras en el
servidor, nunca en el celular) y le entrega a la app datos ya procesados.

## 5. Stack tecnológico (y por qué cada cosa)

| Capa | Tecnología | Por qué |
|---|---|---|
| App | **Flutter / Dart** | Un solo código para Android, iOS y web |
| Estado | **provider** | Manejo de estado simple y estándar |
| Red | **dio** | Cliente HTTP robusto |
| Mapa | **flutter_map + OpenStreetMap/CARTO** | Mapa gratis, sin API key |
| Backend | **Node.js + Express** | Rápido de construir, despliegue en un comando |
| IA | **Google Gemini 2.5 Flash** | Modelo potente, nivel gratuito |
| Base/nube | **Firebase (Firestore + FCM)** | Datos en tiempo real y push gratis |
| SMS | **Twilio** | Estándar para SMS |

## 6. Las APIs externas (a detalle)

- **NASA FIRMS** — Fire Information for Resource Management System. Publica los incendios
  que los satélites detectan casi en tiempo real. Gratis (con MAP_KEY). Usamos los
  sensores VIIRS (satélites Suomi-NPP y NOAA-20). Pedimos el área de Bolivia de los
  últimos 2 días y filtramos al territorio boliviano.
- **Open-Meteo** — clima en vivo y pronóstico. Gratis y sin clave. De aquí salen la
  temperatura, humedad, viento y lluvia que alimentan la predicción.
- **Google Gemini 2.5** — el modelo de IA. Lo usamos en 4 puntos (ver sección 9).
- **Firebase** — Firestore guarda focos y reportes en la nube; FCM manda notificaciones
  push gratis a la app. Gratuito en su nivel base.
- **Twilio** — envía SMS reales a teléfonos.

## 7. Todos los endpoints del backend

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | Estado del servidor |
| POST | `/api/fires/ingest` | Baja focos reales de NASA y los cachea |
| GET | `/api/fires` | Lista de focos (filtros `?nivel`, `?limit`) |
| GET | `/api/fires/zonas` | Dataset de comunidades y áreas protegidas |
| GET | `/api/fires/:id` | Detalle de un foco |
| POST | `/api/fires/:id/confirm` | Confirmación del brigadista |
| POST | `/api/ai/validate/:id` | IA: ¿incendio real o falso positivo? |
| POST | `/api/ai/analyze/:id` | IA: riesgo + plan de acción |
| POST | `/api/ai/prioritize` | IA: orden de ataque |
| POST | `/api/ai/chat/:id` | IA: asistente sobre un foco |
| POST | `/api/alerts/preview` | Texto de la alerta (sin enviar) |
| POST | `/api/alerts/push` | Alerta push (FCM) |
| POST | `/api/alerts/sms` | Alerta SMS (Twilio) |
| POST | `/api/reports` | Crea reporte ciudadano |
| GET | `/api/reports` | Lista de reportes |
| GET | `/api/predict` | Riesgo de ignición 48 h (`?escenario=critico` = demo seca) |

## 8. Cada pantalla a detalle

- **Inicio:** cabecera FireGuard, 4 indicadores (zonas críticas, focos activos, posibles
  falsos positivos, riesgo promedio), mapa de riesgo con los focos reales y badge "NASA
  FIRMS · datos en vivo", y la lista de zonas ordenadas por riesgo. Tocar una zona abre
  sus focos.
- **Mapa:** todos los focos reales, interactivo, cada foco se toca y abre el detalle.
- **Detalle del foco:** datos del satélite, contexto territorial (comunidad/área),
  clasificación de detección, y "Analizar con IA" (Gemini). Botones de chat y confirmar.
- **Alertas:** acceso al orden de ataque + lista de focos de riesgo alto.
- **Reporte:** formulario ciudadano (tipo, referencia, descripción).
- **Predicción:** riesgo de ignición a 48 h por zona, con interruptor "Tiempo real /
  Temporada seca".

## 9. Cómo se calcula cada número

**a) Riesgo base de un foco (0-100):** intensidad del fuego (FRP) + cercanía a una
comunidad + valor ecológico del área. Da el color del foco (rojo/ámbar/celeste).

**b) Detección de falso positivo:** mira FRP, confianza del satélite y brillo. FRP muy
bajo + confianza baja = probable quema agrícola o ruido → "posible falso positivo". FRP
alto + brillo alto = incendio probable. Funciona sin internet.

**c) Predicción de ignición (clima):** por zona, suma puntos por humedad baja, calor,
viento y sequía (tabla en la Guía 2). Total 0-100 → EXTREMO/ALTO/MEDIO/BAJO.

**d) Validación, análisis, priorización y chat:** los hace **Gemini 2.5** con el contexto
de cada foco. La priorización ordena protegiendo vidas → comunidades → áreas protegidas.

## 10. Datos reales vs simulados

- **Reales:** focos (NASA FIRMS), clima de la predicción (Open-Meteo), la IA (Gemini),
  el contexto territorial, los reportes y las confirmaciones.
- **En modo demo:** SMS (Twilio restringe Bolivia en cuenta trial), push FCM y sync a
  Firestore (queda activo al terminar la configuración del proyecto Firebase). El sistema
  funciona igual en modo local mientras tanto.
- El interruptor "Temporada seca" en Predicción es una **simulación** para mostrar agosto
  en plena demo de invierno.

## 11. Limitaciones honestas (si preguntan por debilidades)

- No detectamos más rápido que la NASA; usamos su detección y le agregamos inteligencia.
- La predicción es un índice de **riesgo** (como el de los bomberos), no una certeza de
  que el fuego ocurrirá; un incendio necesita además una fuente de ignición.
- El listado de zonas es un dataset curado de comunidades (ampliable), no todo el país
  con detalle de manzana.
- El SMS a Bolivia depende de un proveedor de pago; por eso priorizamos el push gratis.

## 12. Diferenciadores vs Satellites on Fire (la empresa argentina)

Satellites on Fire detecta más rápido que la NASA (multi-satélite) y avisa por WhatsApp.
Es un referente. Nosotros no competimos en velocidad de detección; competimos en:
**predecir antes del fuego (clima), contexto boliviano, soporte a la decisión (plan +
orden de ataque), reducción de falsos positivos, gratis y con capacidad offline.**

---

## 13. BANCO DE PREGUNTAS DEL JURADO (con respuestas)

**Técnicas**
1. *¿Los datos son reales?* — Sí, son detecciones en vivo de los satélites de la NASA.
2. *¿La IA es real o un truco?* — Real: es Google Gemini 2.5 analizando cada foco.
3. *¿Cómo predicen un incendio antes de que ocurra?* — Con el clima en vivo (Open-Meteo):
   humedad, temperatura, viento y lluvia. Si una zona está muy seca, caliente y ventosa,
   su riesgo de ignición es alto, antes de que haya fuego.
4. *¿Qué precisión tiene esa predicción?* — Es un índice de peligro, igual que el que usan
   los bomberos forestales en el mundo; no es un porcentaje de certeza, es de riesgo.
5. *¿Y si no hay internet?* — La clasificación de falsos positivos funciona offline; el
   resto necesita conexión.
6. *¿Cómo evitan falsas alarmas?* — Doble filtro: una regla automática (FRP, confianza,
   brillo) y la validación de Gemini.
7. *¿Qué es FRP?* — Fire Radiative Power: la potencia del fuego en megavatios; a más FRP,
   más intenso el incendio.
8. *¿Cada cuánto se actualiza?* — NASA publica nuevos focos cada pocas horas; el clima,
   cada hora.
9. *¿Por qué Gemini y no un modelo propio?* — Por velocidad de desarrollo y potencia; un
   modelo propio entrenado con histórico es el siguiente nivel del proyecto.
10. *¿Por qué un foco "celeste"?* — El color indica el nivel de riesgo: rojo alto, ámbar
    medio, celeste bajo. No es un error.
11. *¿Funciona el SMS?* — Está integrado con Twilio; en Bolivia el SMS está restringido en
    cuentas trial, por eso el canal principal es el push gratuito (FCM).
12. *¿Dónde corre la IA, en el celular?* — No; en el backend, así la llave de la API queda
    segura y el celular solo recibe el resultado.

**Producto e impacto**
13. *¿Quién lo usa?* — Defensa Civil, bomberos forestales, gobiernos municipales y las
    propias comunidades.
14. *¿Cuánto cuesta operarlo?* — Casi nada: NASA, Open-Meteo, Gemini y Firebase son
    gratuitos en su nivel base. Por eso un municipio sin recursos puede usarlo.
15. *¿Cómo escala a miles de usuarios?* — Firebase escala solo; el backend se despliega en
    la nube.
16. *¿No es solo otro mapa de incendios?* — No. Un mapa muestra puntos. Nosotros decimos a
    qué comunidad amenaza, si es real, qué hacer, cuál atacar primero, y avisamos antes.
17. *¿Cuál es el diferenciador frente a la competencia?* — Predecir antes del fuego +
    contexto Bolivia + decisión (plan y prioridad) + gratis + offline.
18. *¿Qué impacto concreto tiene?* — Atacar el foco correcto primero, avisar a la comunidad
    antes de que el fuego llegue y reducir falsas alarmas que desgastan a las brigadas.

**Difíciles / críticas**
19. *Si la NASA ya da los focos, ¿qué aportan ustedes?* — La decisión: contexto local,
    priorización, plan de acción y la predicción preventiva. El dato crudo no salva
    bosques; la decisión sí.
20. *La predicción de hoy da riesgo bajo, ¿no sirve?* — Es invierno y el dato es honesto.
    En temporada seca el mismo sistema marca EXTREMO (lo mostramos con la simulación).
21. *¿Cómo sabemos que la detección de falsos positivos acierta?* — Usa las mismas señales
    que la ciencia de detección (FRP, confianza, brillo) y se refuerza con la IA; además
    el brigadista confirma en terreno, lo que mejora el sistema con el tiempo.
22. *¿Qué pasa si Gemini falla?* — Reintenta automáticamente; y el riesgo base y la
    detección offline siguen funcionando sin IA.

## 14. Glosario rápido

- **NASA FIRMS:** servicio gratuito de la NASA con los incendios detectados por satélite.
- **VIIRS:** el sensor satelital que detecta el calor (satélites Suomi-NPP, NOAA-20).
- **FRP:** potencia del fuego en megavatios.
- **Open-Meteo:** API de clima gratuita (humedad, temperatura, viento, lluvia).
- **Gemini 2.5:** el modelo de IA de Google que usamos.
- **FCM:** Firebase Cloud Messaging, las notificaciones push.
- **Falso positivo:** un punto de calor que no es incendio forestal (quema agrícola,
  reflejo solar, industria).
- **Chiquitanía / bosque seco chiquitano:** la región de Santa Cruz más golpeada por el
  fuego en Bolivia.
