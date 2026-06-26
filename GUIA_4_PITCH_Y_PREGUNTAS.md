# FireGuard — Guía 4: cómo dar el pitch y responder TODO

Guía de presentación. Léela en voz alta varias veces. El objetivo: que cuentes una
historia clara en 3 minutos y que ninguna pregunta te tome por sorpresa.

---

## PARTE A — Cómo se estructura un buen pitch

Un pitch ganador sigue este arco (no lo saltes):

1. **Gancho (10 s)** — una frase que duela.
2. **Problema (30 s)** — por qué importa, a quién afecta.
3. **Solución (30 s)** — qué es FireGuard en una frase + las 3 cosas que lo hacen único.
4. **Demo (90 s)** — mostrar, no contar.
5. **Diferenciador y cierre (20 s)** — por qué ustedes y no otro.

Regla de oro: **muestra datos reales**. Cuando el jurado ve incendios reales de la NASA
sobre Bolivia en vivo, ya ganaste la mitad.

---

## PARTE B — Guion sugerido (palabra por palabra, ~3 min)

> Ajústalo a tu voz, pero esta es la columna vertebral.

**Gancho:**
"Cada año, Bolivia pierde millones de hectáreas por incendios forestales. El problema no
es solo que no los detectamos a tiempo: es que cuando los detectamos, nadie sabe qué
hacer con ese dato."

**Problema:**
"Hoy, los satélites de la NASA detectan los incendios, sí. Pero le entregan al brigadista
un punto rojo en un mapa. Ese punto no dice a qué comunidad amenaza, no dice si es un
incendio real o una quema agrícola, no dice cuál atacar primero cuando hay veinte a la
vez, y no avisa nada antes de que el fuego empiece."

**Solución:**
"FireGuard es una capa de inteligencia sobre los datos satelitales, hecha para Bolivia.
La NASA dice DÓNDE hay calor; nosotros decimos QUÉ significa, QUÉ hacer, y avisamos ANTES
de que arda. Hace tres cosas que un mapa común no hace: uno, cruza cada incendio con las
comunidades y áreas protegidas reales de Bolivia. Dos, usa inteligencia artificial para
filtrar falsas alarmas y generar un plan de acción. Y tres —lo más importante— predice
con el clima qué zonas están en riesgo de incendiarse antes de que exista el fuego."

**Demo (ver Parte C).**

**Cierre:**
"Y todo esto corre sobre APIs reales y gratuitas: NASA, el clima de Open-Meteo, la IA de
Google y Firebase. Eso significa que un municipio boliviano sin recursos puede usarlo
mañana. No es una maqueta: los incendios que vieron son reales, ahora mismo, sobre
Bolivia. FireGuard convierte un dato satelital en una decisión que salva bosques y vidas."

---

## PARTE C — El demo, paso a paso (qué tocar y qué decir)

1. **Abre en Inicio.**
   Di: *"Esto es Bolivia ahora mismo. Cada punto es un incendio real detectado por los
   satélites de la NASA"* — señala el badge **"NASA FIRMS · datos en vivo"**.

2. **Toca una zona de riesgo alto (o el Mapa) y abre un foco.**
   Di: *"Tomemos este foco. El sistema ya sabe que amenaza a tal comunidad, a tantos
   kilómetros, dentro de tal área protegida."*

3. **Señala la detección (incendio probable / falso positivo).**
   Di: *"Y antes de movilizar una brigada, filtra: ¿es un incendio real o una quema
   agrícola? Eso evita falsas alarmas."*

4. **Toca "Analizar con IA".**
   Di: *"Aquí Gemini, la IA de Google, genera en vivo el nivel de riesgo, hacia dónde se
   propaga, y un plan de acción concreto."* (Espera el resultado y léelo.)

5. **Ve a Alertas → Orden de ataque.**
   Di: *"Cuando hay muchos incendios a la vez y pocas brigadas, la IA decide cuál atacar
   primero, protegiendo primero a las personas."*

6. **Ve a Predicción y activa "Temporada seca".**
   Di: *"Y esto es lo que nadie más hace: con el clima en vivo, predecimos qué zonas están
   en riesgo de incendiarse en 48 horas, ANTES de que haya fuego. Hoy es invierno y el
   riesgo es bajo; activo la simulación de agosto y miren —zonas en riesgo EXTREMO. Eso
   convierte el sistema de reactivo a preventivo."*

7. (Opcional) **Reporte ciudadano.**
   Di: *"Y cualquier ciudadano puede reportar humo; el reporte llega a las autoridades."*

Cierra volviendo al mapa: *"Todo real, todo gratis, todo para Bolivia."*

---

## PARTE D — Tips de presentación

- **Ten la pantalla de IA ya cargada una vez antes de empezar** (por si Gemini se satura).
- Habla **despacio** en el gancho y el cierre; acelera un poco en la demo.
- **No leas la pantalla entera**, resalta 2-3 cosas.
- Si algo falla, no te disculpes mil veces: *"el backend está en vivo, a veces la red…"* y
  sigues. El reintento de Gemini suele resolverlo solo.
- Mira al jurado, no a la laptop, en el gancho y el cierre.
- Reparte roles: uno narra, otro maneja la app.

## PARTE E — Manejo del tiempo

- **Si tienes 3 min:** gancho + problema (40 s) → solución (30 s) → demo (90 s) → cierre (20 s).
- **Si tienes 5 min:** agrega la diapositiva de diferenciadores vs la competencia y una de
  arquitectura.
- **Si tienes 1 min (elevator):** "FireGuard toma los incendios reales de la NASA, los
  cruza con las comunidades de Bolivia, usa IA para decir qué hacer y a cuál atacar
  primero, y predice con el clima qué zonas se van a incendiar antes de que pase. Gratis,
  sobre APIs reales."

---

## PARTE F — BANCO EXHAUSTIVO DE PREGUNTAS

### Datos y veracidad
1. **¿Los datos son reales o inventados?** Reales: detecciones en vivo de los satélites de
   la NASA (FIRMS), filtradas al territorio de Bolivia.
2. **¿Cada cuánto se actualizan?** NASA publica focos nuevos cada pocas horas; el clima de
   la predicción, cada hora.
3. **¿Por qué hay focos en zonas raras (ciudades, altiplano)?** Son detecciones reales;
   en invierno muchas son quemas agrícolas. Por eso filtramos falsos positivos.
4. **¿Por qué un foco cambió de color?** El color es el nivel de riesgo. Si agregamos una
   comunidad cercana, un mismo incendio sube de riesgo porque ahora hay gente cerca. El
   riesgo refleja el peligro para las personas.
5. **¿Y la ubicación de los reportes ciudadanos?** Se registran en el backend; se puede
   añadir GPS del teléfono.

### Inteligencia artificial
6. **¿La IA es real o un truco?** Real: Google Gemini 2.5. Hace cuatro cosas: valida si es
   incendio real, analiza y arma el plan, prioriza, y responde en el chat.
7. **¿Dónde corre la IA?** En el backend, no en el celular. Así la llave de la API queda
   segura y la app solo recibe el resultado.
8. **¿Cuánto cuesta usar Gemini?** Tiene un nivel gratuito que alcanza para esto.
9. **¿Y si la IA inventa cosas (alucina)?** Le damos solo los datos del foco como contexto
   y le pedimos JSON estructurado; además el riesgo base y la detección funcionan sin IA,
   así que siempre hay un resultado de respaldo.
10. **¿Qué pasa si Gemini falla o se satura?** Reintenta hasta 4 veces solo; si sigue
    saturado, avisa con un mensaje claro. El resto de la app sigue funcionando.
11. **¿Por qué Gemini y no un modelo propio?** Por velocidad y potencia; entrenar un modelo
    propio con histórico es la evolución natural, pero no es necesario para aportar valor.

### Predicción (la pregunta estrella)
12. **¿Cómo predicen un incendio antes de que ocurra?** Con el clima en vivo de Open-Meteo:
    humedad, temperatura, viento y lluvia por zona. Mucho calor + poca humedad + viento +
    sequía = alto riesgo de ignición, antes de que haya fuego.
13. **¿Eso no es solo clima?** Es clima aplicado a un índice de peligro de incendio, el
    mismo principio que usan los servicios de bomberos forestales del mundo (Fire Weather
    Index).
14. **¿Qué precisión tiene?** Es un índice de RIESGO, no una certeza. No decimos "aquí se
    prenderá"; decimos "estas condiciones son extremas, cualquier chispa se propaga".
15. **¿Por qué hoy da riesgo bajo?** Es invierno; el dato es honesto. En temporada seca el
    mismo sistema marca EXTREMO (lo mostramos con la simulación).
16. **¿De dónde sale el porcentaje exacto?** De una fórmula que suma puntos por humedad,
    calor, viento y sequía (está documentada). Ejemplo: Roboré 35% = humedad 49% +
    temperatura 30°C + viento 20 km/h + sin lluvia.

### Detección y falsos positivos
17. **¿Cómo distinguen un incendio de una quema agrícola?** Por las señales del satélite:
    FRP (potencia), confianza y brillo. FRP bajo + confianza baja = probable falso
    positivo. Lo confirma la IA.
18. **¿Y si se equivocan?** El brigadista confirma en terreno; esa confirmación mejora el
    sistema con el tiempo.
19. **¿Qué es el FRP?** Fire Radiative Power: la potencia del fuego en megavatios.

### Tecnología y arquitectura
20. **¿Qué tecnologías usaron?** App en Flutter; backend en Node.js/Express; IA Gemini;
    mapa OpenStreetMap; clima Open-Meteo; Firebase para nube y notificaciones.
21. **¿Por qué Flutter?** Un solo código para Android, iOS y web.
22. **¿Cómo se conecta todo?** La app habla con nuestro backend; el backend habla con todas
    las APIs y guarda en Firebase. Las llaves nunca están en el celular.
23. **¿Funciona sin internet?** La clasificación de falsos positivos sí (reglas locales);
    el resto necesita conexión.
24. **¿Cómo escala a miles de usuarios?** Firebase escala solo y el backend se despliega en
    la nube.
25. **¿Es seguro?** Las llaves están en el servidor; la app solo consume resultados.

### Alertas
26. **¿Cómo avisan a las autoridades?** Por notificación push (Firebase, gratis) y por SMS
    (Twilio).
27. **¿El SMS funciona en Bolivia?** Está integrado; el SMS a Bolivia está restringido en
    cuentas trial de Twilio, por eso el canal principal y gratuito es el push.
28. **¿A quién le llega la alerta?** A bomberos forestales, Defensa Civil y gobiernos
    municipales; el diseño contempla SMS a la población.

### Negocio e impacto
29. **¿Quién lo usaría?** Defensa Civil, bomberos forestales, municipios y comunidades.
30. **¿Cuánto cuesta operarlo?** Casi nada: NASA, Open-Meteo, Gemini y Firebase son
    gratuitos en su nivel base. Esa es la clave para Bolivia.
31. **¿Cómo se sostiene / monetiza?** Gratis para municipios y comunidades; un modelo de
    servicio para gobernaciones o empresas (agro, forestales) puede financiarlo.
32. **¿Qué impacto concreto tiene?** Atacar el foco correcto primero, avisar a la comunidad
    antes de que llegue el fuego y reducir falsas alarmas que agotan a las brigadas.
33. **¿Cómo medirían el éxito?** Tiempo de respuesta, hectáreas salvadas, falsas alarmas
    evitadas, comunidades alertadas a tiempo.

### Competencia
34. **¿No existe ya algo así (Satellites on Fire)?** Sí, una empresa argentina que detecta
    más rápido que la NASA y avisa por WhatsApp. Nosotros no competimos en velocidad de
    detección: aportamos predicción antes del fuego, contexto boliviano, decisión (plan y
    prioridad), gratis y con capacidad offline.
35. **Si la NASA ya da los focos, ¿qué aportan ustedes?** La decisión. El dato crudo no
    salva bosques; saber a qué comunidad amenaza, si es real, cuál atacar primero y qué
    zonas se van a incendiar, sí.

### Críticas y trampas
36. **¿No es solo otro mapa de incendios?** No. Un mapa muestra puntos. Nosotros mostramos
    a quién amenazan, si son reales, qué hacer, cuál primero, y avisamos antes.
37. **¿Esto es un MVP o un producto?** Es un MVP funcional con datos e IA reales; lo
    construido funciona end-to-end.
38. **¿Qué es lo más difícil que resolvieron?** Convertir un punto satelital crudo en una
    decisión local: cruzarlo con el territorio boliviano y razonarlo con IA.
39. **¿Qué le falta?** Más cobertura de comunidades, el SMS productivo en Bolivia y un
    modelo predictivo entrenado con histórico; nada de eso bloquea el valor actual.
40. **¿En cuánto tiempo lo hicieron?** (Responde con la verdad de su hackathon.)

---

## PARTE G — Cómo responder una pregunta que no sabes

Nunca inventes. Usa una de estas:
- *"Buena pregunta. Hoy no lo medimos, pero el diseño lo permite así: …"*
- *"No tengo el número exacto, pero el orden de magnitud es…"*
- *"Eso es justo una de las cosas que validaríamos con Defensa Civil."*

Reconocer un límite con seguridad da **más** credibilidad que inventar.

---

## PARTE H — Frases clave para memorizar

- "La NASA dice DÓNDE hay calor; FireGuard dice QUÉ significa, QUÉ hacer y avisa ANTES."
- "No es una maqueta: estos incendios son reales, ahora, sobre Bolivia."
- "Convertimos un punto rojo en una decisión."
- "Reactivo a preventivo: predecimos antes de que arda."
- "Todo real, todo gratis, todo para Bolivia."
