# FireGuard — Guía 2: cómo funciona por dentro (para explicar en el pitch)

Esta guía explica de dónde sale cada dato y cada número, sección por sección.
Si el jurado pregunta "¿de dónde sacaron eso?", aquí está la respuesta.

---

## 1. PREDICCIÓN — la parte que avisa antes del fuego

### ¿Qué es?

NASA detecta un incendio cuando el satélite ya ve calor (o sea, cuando **ya está
ardiendo**). La predicción hace lo contrario: estima **qué tan probable es que una
zona se incendie**, usando el clima, **antes** de que exista el fuego.

No predice "a tal hora se prende"; predice **condiciones de peligro**: cuando hay
mucho calor, poca humedad, viento y sin lluvia, cualquier chispa (un chaqueo, una
quema agrícola) se vuelve incendio. Eso es lo que medimos.

### ¿Por qué 48 horas?

Porque pedimos a la API del clima el **pronóstico de los próximos 2 días** y usamos
el de **mañana**. Es la ventana en la que un coordinador puede preparar brigadas.

### ¿De dónde sale el listado de zonas?

Del archivo `data/bolivia-zonas.json` — son **comunidades reales de Bolivia** con sus
coordenadas (Roboré, Concepción, San Matías, San José de Chiquitos, Charagua, etc.).
Para cada una calculamos el riesgo.

### ¿De dónde salen la humedad, la temperatura y el viento?

De **Open-Meteo** (`api.open-meteo.com`), una API meteorológica **gratuita y sin clave**.
Le mandamos las coordenadas de cada comunidad y nos devuelve, para mañana:
temperatura máxima, humedad mínima, viento máximo y lluvia acumulada. **Son datos
reales y en vivo**, no inventados.

### ¿De dónde sale ese 35%?

De una fórmula de **índice de peligro de incendio** (`fireDanger` en
`predictionService.js`). Cada factor suma o resta puntos:

| Factor | Condición | Puntos |
|---|---|---|
| Humedad mínima | < 20 % | +32 |
| | < 30 % | +24 |
| | < 40 % | +14 |
| | < 50 % | +6 |
| Temperatura máx. | > 35 °C | +26 |
| | > 32 °C | +20 |
| | > 28 °C | +12 |
| | > 24 °C | +6 |
| Viento máx. | > 35 km/h | +20 |
| | > 25 km/h | +14 |
| | > 15 km/h | +7 |
| Lluvia 48 h | ≥ 10 mm | −35 |
| | ≥ 3 mm | −20 |
| | ≥ 0,5 mm | −10 |
| | seco (0) | +10 |

**Ejemplo real — Roboré (35 %):** humedad 49 % (+6), temperatura 30 °C (+12),
viento 20,4 km/h (+7), lluvia 0,3 mm → seco (+10). Total = **35**.

El total (0–100) se traduce a un nivel:
- **60+ EXTREMO** · **40+ ALTO** · **22+ MEDIO** · resto **BAJO**.

### ¿Cuándo una alerta es "fea" / cuándo iniciará un incendio?

Una zona entra en peligro alto cuando se juntan: **humedad < 30 %, temperatura > 32 °C,
viento > 25 km/h y sin lluvia**. Ahí el índice sube a ALTO/EXTREMO.

Importante para ser honestos: **no decimos que el incendio va a ocurrir sí o sí.**
Decimos que las condiciones son tan secas y calurosas que, si hay una fuente de fuego
(en Bolivia casi siempre el chaqueo humano), se va a propagar rápido. Es una alerta
**preventiva**, como el "índice de riesgo de incendio" que usan los bomberos en el mundo.

---

## 2. Cómo simular un caso real (para la demo)

Estamos en invierno (junio): hay poca humedad-calor, así que la predicción da MEDIO/BAJO.
Es real, pero poco vistoso. Para mostrar un escenario fuerte en el pitch:

- En la app, pestaña **Predicción**, cambia el interruptor a **"Temporada seca"**.
  Verás zonas en **EXTREMO (88 %)** con humedad 10 %, 39 °C y viento 38 km/h —
  las condiciones reales de agosto-octubre en la Chiquitanía.
- Por API: `GET /api/predict?escenario=critico`.

Di esto en la demo: *"En invierno el riesgo es bajo y así lo muestra. Activo la
simulación de temporada seca para ver qué pasa en agosto, cuando Bolivia se incendia."*

Para los **focos** (NASA): si algún día NASA no devuelve focos, el sistema usa
automáticamente un respaldo (`data/fires-seed.json`) con focos reales de la Chiquitanía,
así la demo nunca se queda en blanco.

---

## 3. Las otras secciones, una por una

### Inicio (dashboard)
- **Focos activos:** cuántos incendios reales detectó NASA en Bolivia (ya filtrados al
  territorio boliviano con un polígono).
- **Zonas críticas / riesgo promedio:** se calculan agrupando esos focos por región.
- **Mapa de riesgo:** los focos reales sobre Bolivia. El badge dice "NASA FIRMS · datos
  en vivo" para dejar claro de dónde vienen.

### Mapa
Todos los focos reales. Cada uno se toca y abre su detalle.

### Detalle del foco
- **Datos del satélite:** coordenadas, FRP (potencia del fuego en MW), confianza, hora.
- **Contexto territorial:** comunidad y área protegida más cercanas (calculado con la
  distancia real entre el foco y nuestras zonas de Bolivia).
- **Detección (incendio probable / posible falso positivo):** regla automática que mira
  FRP, confianza y brillo. Un FRP muy bajo con confianza baja suele ser una quema
  agrícola o ruido del sensor, no un incendio forestal.
- **Análisis IA:** aquí Gemini genera el nivel de riesgo, la dirección de propagación,
  el plan de acción y los recursos.

### Alertas — ¿qué es "orden de ataque"?

Cuando hay **muchos incendios al mismo tiempo** y pocos recursos (brigadas, agua,
aviones), no se pueden atacar todos a la vez. **Gemini ordena los focos por prioridad**,
protegiendo primero las **vidas y comunidades**, luego las **áreas protegidas de alto
valor**. Para cada foco devuelve por qué va en ese orden y qué hacer de inmediato.
Convierte "20 puntos rojos" en "ataca este primero, por esto".

### Reporte
Un ciudadano reporta humo o fuego (tipo, referencia, descripción). El reporte se guarda
en el backend y queda para las autoridades. Es la fuente humana que complementa al satélite.

### Predicción
Lo de la sección 1: riesgo de ignición a 48 h por zona, con clima real.

---

## 4. El error 503 de Gemini ("high demand")

Sí, ese error es de **Gemini**: significa que el modelo está **momentáneamente saturado**
(mucha gente usándolo a la vez). No es un bug tuyo.

Ya lo blindamos: el backend **reintenta hasta 4 veces** con esperas crecientes
(0,7s, 1,4s, 2,1s). Si aun así sigue saturado, muestra un mensaje claro:
*"El modelo de IA está saturado, intenta de nuevo en unos segundos."*

En la demo: si justo cae, **vuelve a tocar el botón**; casi siempre el reintento lo
resuelve solo. Conviene tener una pantalla de IA ya cargada antes de presentar.

---

## 5. Glosario rápido (por si el jurado pregunta)

- **NASA FIRMS:** servicio gratuito de la NASA que publica los incendios detectados por
  satélite casi en tiempo real.
- **VIIRS:** el sensor de los satélites (Suomi-NPP, NOAA-20) que detecta el calor.
- **FRP (Fire Radiative Power):** potencia del fuego en megavatios; a más FRP, más intenso.
- **Open-Meteo:** API de clima gratuita; de ahí sale humedad, temperatura, viento y lluvia.
- **Gemini 2.5:** el modelo de IA de Google que analiza, valida, prioriza y conversa.
- **Falso positivo:** un punto de calor que no es un incendio forestal (quema agrícola,
  reflejo solar, antorcha industrial). Nuestra detección los filtra.
