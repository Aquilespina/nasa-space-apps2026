# Estado del equipo — Milpa Clara (Field Shift: Adapting Farms with NASA Data)

Meta: **ganar el evento local de CDMX** (13–15 nov 2026; H0 = 13 nov, 13:00 hora de CDMX; cierre del envío: 15 nov, 17:59).
Región: Amealco de Bonfil, Querétaro. Maqueta v6: `Maqueta Tu Parcela v6.html`. Datos: `retos/amealco-datos-reales.md`.
Plantilla: `supervision/milpa-clara/plantilla-idea.md`.

## Historial

| Fecha | Etapa | Veredicto | Imp | Crea | Val | Rel | Pres | Total | IC (variante recomendada) | Confianza | Revisión |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-27 12:46 | Idea (maqueta v6, antes del MVP) | 🟡 Ajustar | 4 | 4 | 3 | 3 | 4 | 18 potencial (21 con la variante Diferenciada) | ~87 (Diferenciada) · Segura ~65 · Ambiciosa ~75 | media | `revision-2026-09-27-1246.md` |

Probabilidad estimada (juicio, no medición; confianza baja):
- Nominación: ~20–25 % hoy → ~30–35 % con las 5 mejoras.
- Primer lugar de la sede: ~8–10 % → ~12–18 %.

## Riesgos abiertos

| ID | Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|---|---|---|---|---|---|
| R1 | **🔁 P3:** la app recomienda un cultivo de ciclo corto si la lluvia se atrasa (maqueta l.977), pero el backtest da −$4,048/ha en 23 años (+$178 sin 2023) | Alta si no se corrige | Alto (Validez) | Hacer del reparto la decisión central; quitar la regla; separar "la NASA ve el riesgo" de "esta decisión cuesta X" | `[FALTA]` |
| R2 | Regla de trabajo previo: fuentes secundarias dicen que el código y los activos se crean durante el evento; la guía oficial no se pudo leer | Media | Alto | Verificar la guía antes del evento; reservar ~8 h para reconstruir con IA; declarar el trabajo previo | `[FALTA]` |
| R3 | Sin productor real (0 contactos al 27 sep) | Alta | Alto (Impacto y el jurado local) | 1–3 productores o técnicos de Amealco o Aculco que acepten abrir un enlace el sábado 14 | `[FALTA]` |

Otros riesgos vigilados:
- Faltan suelo, salud del suelo y condiciones cambiantes (Relevancia).
- Datos dudosos de 2022–2023.
- Escala de 55 km.
- 🔁 P5 (la observación de la Tierra solo como imagen).
- 🔁 P6 (pulir antes de validar; 7 fuentes + 3 planeadas).
- La sede CDMX nominó a 0 en 2024.

## Decisiones tomadas (con su porqué)

| Fecha | Decisión | Por qué |
|---|---|---|
| 2026-09-27 | Seguir en Field Shift, sin cambiar de reto | Es el mejor encaje. *Trend Detective* no tiene usuario ni decisión |
| 2026-09-27 | La decisión central pasa de "qué rotar" a "¿cuánta tierra dejo en maíz?" (reparto) | Es lo único que el productor puede decidir en mayo con un costo medido: 70 % maíz + 30 % frijol cuesta $288/ha al año y pasa de 6 a 4 años malos en 23 (VERIFICADO). Las reglas de pronóstico no pagaron |
| 2026-09-27 | El suelo (SoilGrids) y "¿Qué está cambiando?" entran al DEBE | El reto los pide de forma explícita y los datos ya están verificados |
| 2026-09-27 | IMERG entra a la validación. Para 2026 se usa `GPM_3IMERGDL` | El satélite tiene que estar en el núcleo. IMERG Final termina el 2025-09-30 (CMR) |
| 2026-09-27 | Sin chatbot sin evaluar, sin WhatsApp y sin SMAP en el núcleo | Texcaliacenses (2024) no pasó con un chat. SMAP solo tiene 2 años malos desde 2015 |

(La decisión final es del equipo. Estas son las recomendaciones del supervisor hasta que el equipo las confirme.)

## Tareas pendientes

| Tarea | Cuándo | Responsable |
|---|---|---|
| Verificar en la guía oficial 2026 la regla de trabajo previo y el formato del demo | Antes del 13 nov | `[FALTA]` |
| Conseguir 1–3 productores o técnicos de Amealco o Aculco (5 preguntas: uso del maíz, milpa, ganado, costo por ha, qué pasó en 2022–2023) | Antes del 13 nov | `[FALTA]` |
| Preguntar al líder local de CDMX: premios, jurado, duración del pitch, si va a nominar | Antes del 13 nov | `[FALTA]` |
| Crear cuentas de Earthdata Login y GitHub Pages | Antes del 13 nov | `[FALTA]` |
| Llenar la tabla del equipo (roles y horas) en `plantilla-idea.md` | Antes del 13 nov | `[FALTA]` |
| ~~Guardar los scripts de la carpeta temporal~~ → ya no existen (scratchpads borrados, detectado el 2026-11-07). El pipeline se reconstruye en el evento desde `retos/amealco-datos-reales.md` | — | — |
| Ensayo de 1 h del harness (`harness/plantilla-repo/`) en cada laptop: ¿corren los hooks en Claude Code con Windows? | Antes del 13 nov | `[FALTA]` |
| En H0: revisar la pestaña Resources del reto (se publica el 13 nov) | H0 | `[FALTA]` |
| Prueba de humo con IMERG: `GPM_3IMERGM` jun–sep 2003–2025 contra el SIAP, junto a POWER | H0–H3 | `[FALTA]` |
| Sitio en GitHub Pages con datos reales | H12 | `[FALTA]` |
| Reparto + suelo + "¿Qué está cambiando?"; alcance congelado | H24 | `[FALTA]` |
| Prueba con el productor + número de IMERG + textos | H36 | `[FALTA]` |
| Video de 30 s con subtítulos en inglés + los 7 campos del envío | H44 | `[FALTA]` |
| Envío completo (con 3 h de margen) | H50 (15 nov, 15:00) | `[FALTA]` |

## Próxima revisión
- En H3, el MVP: ¿el dato de IMERG sostiene la validación?
- Si el equipo llena la plantilla antes del evento, una revisión de Idea con las horas reales para recalcular el IC.
