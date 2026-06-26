# 🔥 FireGuard AI Bolivia

**Capa de inteligencia boliviana sobre datos satelitales de incendios.**

> NASA te dice **DÓNDE** hay calor. FireGuard te dice **QUÉ significa para Bolivia** y **QUÉ hacer** en los próximos minutos.

Backend Node.js + Express que integra **NASA FIRMS** (focos reales) + **Gemini 2.5** (análisis y decisiones), con una capa propia de **contexto territorial boliviano** (áreas protegidas, comunidades, riesgo).

---

## El diferenciador (3 capas que un mapa genérico no tiene)

1. **Contexto geográfico boliviano** — cada foco de NASA se cruza con áreas protegidas y comunidades reales. No dice "incendio en -16.5,-61.2", dice "incendio a 12 km de Concepción, en bosque seco chiquitano de alto valor".
2. **Priorización inteligente** — cuando hay 40 focos simultáneos, Gemini decide el **orden de ataque** cruzando intensidad (FRP) + comunidades + valor ecológico. Convierte "40 puntos rojos" en "ataca este primero, por estas razones".
3. **Plan de acción accionable** — riesgo, dirección de propagación, recursos y pasos concretos para el brigadista.

---

## Requisitos

- Node.js >= 18 (probado con v24)
- Una `FIRMS_KEY` ([gratis aquí](https://firms.modaps.eosdis.nasa.gov/api/map_key/))
- Una `GEMINI_KEY` ([gratis aquí](https://aistudio.google.com/apikey))

## Instalación

```bash
npm install
cp .env.example .env      # y pega tus keys
```

## Uso

```bash
npm run dev      # desarrollo (recarga automática)
npm start        # producción
npm run ingest   # descarga focos de NASA a la caché (sin levantar el server)
```

Server en `http://localhost:3000`. **Primer paso siempre:** `POST /api/fires/ingest`.

---

## Arquitectura

```
Flutter  ──HTTP──►  Express API  ──►  NASA FIRMS (focos reales)
                         │
                         ├──►  Contexto Bolivia (data/bolivia-zonas.json)
                         ├──►  Gemini 2.5 (análisis / priorización / chat)
                         └──►  Caché JSON (data/fires-cache.json)
```

```
src/
├── index.js                 # arranque
├── app.js                   # Express (cors, json, errores)
├── config/env.js            # variables de entorno
├── lib/
│   ├── geo.js               # distancias (Haversine), zona más cercana
│   └── asyncHandler.js      # wrapper de errores async
├── services/
│   ├── firmsService.js      # NASA FIRMS: fetch + parse CSV + normaliza   (Persona A)
│   ├── boliviaContext.js    # 🇧🇴 enriquecimiento + riesgo base            (diferenciador)
│   └── geminiService.js     # Gemini: analyze / prioritize / chat         (Persona B)
├── store/firesStore.js      # persistencia en JSON
└── routes/
    ├── fires.routes.js      # /api/fires/*  (Persona A)
    └── ai.routes.js         # /api/ai/*     (Persona B)
data/
├── bolivia-zonas.json       # áreas protegidas + comunidades (editable)
└── fires-seed.json          # respaldo si NASA no devuelve focos
```

---

## Endpoints

### Datos (Persona A)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/fires/ingest` | Descarga focos reales de NASA, los enriquece y cachea. Body opc: `{days, sources, limit, bbox}` |
| GET | `/api/fires` | Lista de focos. Query: `?nivel=ALTO&limit=20` |
| GET | `/api/fires/zonas` | Dataset de contexto boliviano |
| GET | `/api/fires/:id` | Detalle de un foco |
| POST | `/api/fires/:id/confirm` | Confirmación brigadista. Body: `{estado, nota, brigadista}` |

### Inteligencia (Persona B)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/ai/analyze/:id` | Análisis Gemini de un foco (riesgo, plan de acción) |
| POST | `/api/ai/prioritize` | Orden de ataque de los focos. Body opc: `{limit}` |
| POST | `/api/ai/chat/:id` | Chat IA sobre un foco. Body: `{pregunta, history}` |

Health check: `GET /health`. Pruebas rápidas en [`requests.http`](./requests.http).

---

## Flujo de la demo

1. `POST /api/fires/ingest` → caché con focos reales de hoy.
2. `GET /api/fires` → el mapa los pinta.
3. `POST /api/ai/prioritize` → el "wow": orden de ataque priorizado.
4. `POST /api/ai/analyze/:id` → detalle + plan de acción de un foco.
5. `POST /api/ai/chat/:id` → preguntas del brigadista.
6. `POST /api/fires/:id/confirm` → cierra el ciclo en terreno.

> **Regla de oro:** corre `ingest` una vez antes del pitch. Queda cacheado en disco, así la demo no depende de la red en vivo. Si NASA no devuelve focos, usa `data/fires-seed.json` automáticamente.
