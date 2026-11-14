# Milpa Clara

Página web que, con datos de satélite de la NASA, muestra **las mejores fechas para sembrar, fertilizar y cosechar** en zonas de la milpa de Amealco de Bonfil, Querétaro, y explica por qué. Apoya la decisión del productor; no la reemplaza.

Proyecto para **NASA Space Apps Challenge 2026, sede CDMX**, reto *Field Shift: Adapting Farms with NASA Data*.

- **Ángel:** página e integración (este repo).
- **Aquiles:** red neuronal en Google Colab. Aquí solo llegan sus resultados como JSON.

> **Estado:** el calendario usa el **baseline sin red neuronal** (inicio de lluvias de NASA POWER 2003–2025 y ciclos FAO-56) para una sola zona, El Llano. Faltan las zonas adicionales y la integración de la salida de Aquiles.

---

## Ver la página en tu computadora

Requisitos: Python 3 (en Fedora ya viene como `python3`).

```bash
python3 -m http.server 8000 -d site
```

Abre **http://localhost:8000**. Para detenerla: `Ctrl+C`.

> Hay que usar el servidor. Si abres `site/index.html` con doble clic, el recorrido se queda en "Cargando datos…" porque el navegador no deja leer los JSON desde un archivo suelto.

## Cómo se usa la página

1. **Portada.** El botón **"Ver mi zona"** lleva al recorrido.
2. **Recorrido por zonas.** Elige una zona con sus botones o con las flechas ← →. Cada cultivo de la zona tiene una tarjeta con **Siembra, Fertilización y Cosecha**, y cada actividad muestra:
   - fecha recomendada,
   - ventana (rango de días buenos),
   - confianza,
   - razón de la fecha,
   - fuente del dato.

   Donde no hay dato aparece **"sin dato"**: el sitio nunca inventa números. Se puede compartir una zona con `?zona=z2`.
3. **La app (maqueta v6).** Pestañas *Mi zona*, *Mi plan*, *Historia* y *Avisos* con 23 temporadas (2003–2025) de datos reales de Amealco.
4. **Página del proyecto y estudio por año.** Explicación del método y de las fuentes para el jurado.

## De dónde salen los datos

```
Aquiles (Colab) / pipeline ──► data/processed/*.json ──► pipeline/copiar_datos.py ──► site/data/*.json ──► página
```

| Archivo | Qué tiene | Quién lo hace |
|---|---|---|
| `data/processed/zonas.json` | Zonas: nombre, coordenadas, cultivos | Acordado entre los dos |
| `data/processed/calendario.json` | Fecha, ventana, confianza y razón por zona, cultivo y actividad | Aquiles |
| `data/processed/cultivos.json` | Ciclo, agua (FAO-56), suelo y rendimientos de maíz, frijol y avena | Ángel, desde `referencia/amealco-datos-reales.md` |
| `data/processed/modelo-metricas.json` | Error del baseline contra la red | Aquiles (pendiente) |

- `data/processed/` es la **fuente de verdad**. `site/data/` es una copia: no se edita a mano.
- Todos los JSON llevan `fuente`, `fecha_consulta` y `ejemplo`. El formato completo está en [`docs/contrato-datos.md`](docs/contrato-datos.md).
- `generado_por` dice si las fechas vienen del **baseline** (reglas de inicio de lluvias y FAO-56) o de la **red neuronal**, y la página lo muestra.

### Actualizar los datos (cuando llegan resultados de Aquiles)

```bash
# 1. Guardar sus archivos en data/processed/ con el mismo nombre
# 2. Copiarlos a la página
python3 pipeline/copiar_datos.py
# 3. Verificar (debe decir "Verificación OK")
python3 .claude/hooks/verifica.py
# 4. Guardar y subir
git add -A && git commit -m "Datos del baseline de Aquiles" && git push
```

`verifica.py` revisa:
- que cada JSON tenga `fuente`;
- que no queden JSON de ejemplo después del checkpoint H24;
- que `site/data/` coincida con `data/processed/`;
- que la página tenga `viewport` para celular y no llame a `localhost`.

## Publicación

Cada `git push` a `main` publica `site/` en **GitHub Pages** con `.github/workflows/pages.yml`. Antes de publicar, el flujo copia los datos.

Enlace público: `[pendiente: poner aquí la URL de GitHub Pages]`

## Estructura

| Carpeta | Para qué |
|---|---|
| `site/` | La página estática: `index.html` (sale de la maqueta v6) y `recorrido.js` |
| `data/processed/` | Los JSON del contrato |
| `pipeline/` | Scripts de apoyo (`copiar_datos.py`) |
| `docs/` | Plan, contrato de datos, tablero de tareas, decisiones, uso de IA |
| `referencia/` | Maqueta v6 original, datos de Amealco, texto de los retos |
| `.claude/` | Configuración de Claude Code: hooks de verificación y subagentes de revisión |

## Datos de la NASA y otras fuentes

- **NASA POWER** (API diaria, comunidad AG; punto 20.19 N, 100.14 O): lluvia `PRECTOTCORR`, temperatura, humedad de raíz `GWETROOT`, 2000–2026.
- **HLS** (Sentinel-2/Landsat, 30 m) vía NASA GIBS y CMR: imágenes por temporada.
- **MODIS** NDVI de 16 días.
- **SIAP**: cierre agrícola municipal de Amealco, 2003–2025.
- **CONAGUA/SMN**: Monitor de Sequía por municipio.
- **SoilGrids** (ISRIC, 250 m): suelo.
- **FAO-56**: coeficientes de cultivo y etapas.

Detalle y validación: [`referencia/amealco-datos-reales.md`](referencia/amealco-datos-reales.md).

## Límites (lo decimos claro)

- Los datos son **de la zona y del municipio, no de una parcela**. NASA POWER es una celda de unos 55 km, así que las zonas comparten la misma lluvia.
- Los coeficientes FAO-56 son de tabla genérica y falta ajustarlos con un agrónomo.
- Si la red neuronal no supera al baseline, se entrega el baseline y se dice.

## Trabajo previo y uso de IA

Antes del evento se prepararon, con asistencia de IA:
- la maqueta Tu Parcela v6;
- el análisis de datos de Amealco;
- la configuración del agente (CLAUDE.md, hooks y subagentes).

El registro de lo que generó la IA durante el evento está en [`docs/uso-ia.md`](docs/uso-ia.md).
