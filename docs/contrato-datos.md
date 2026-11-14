# Contrato de datos entre Aquiles (Colab) y Ángel (página)

Estado: **propuesta de Ángel, por acordar con Aquiles en la Fase 0.** Lo que se cambie aquí se cambia en los dos lados el mismo momento.

## Envoltorio común (todo archivo de `data/processed/`)
```json
{
  "fuente": "NASA POWER daily PRECTOTCORR + MODIS MOD13Q1 (NDVI)",
  "fecha_consulta": "2026-11-14",
  "ejemplo": false,
  "generado_por": "baseline | red_neuronal",
  "datos": []
}
```
- `ejemplo: true` solo para pruebas temporales; el sitio las muestra marcadas.
- `generado_por` dice si las fechas vienen del baseline (reglas FAO-56 e inicio de lluvias) o de la red de Aquiles.

## `calendario.json` — lo produce Aquiles, lo lee el recorrido por zonas
Un registro por zona, cultivo y actividad.
```json
{
  "zona_id": "z1",
  "cultivo": "maiz",
  "actividad": "siembra",
  "ventana_inicio": "2027-05-21",
  "ventana_fin": "2027-06-15",
  "fecha_recomendada": "2027-06-06",
  "confianza": 0.0,
  "razon": "texto corto en español que el sitio muestra tal cual",
  "fuente": "producto NASA usado"
}
```
- `actividad`: `siembra` | `fertilizacion` | `cosecha`.
- Fechas en formato ISO `AAAA-MM-DD`.
- `confianza`: número de 0 a 1.
- `razon`: máximo ~200 caracteres, sin jerga.

## `zonas.json` — se acuerda entre los dos
`zona_id`, `nombre`, `lat`, `lon`, `cultivos` (lista). Entre 3 y 5 zonas.

## `cultivos.json` — lo arma Ángel desde `referencia/amealco-datos-reales.md`
Por cultivo: ciclo en días, agua por ciclo (mm), etapas y qué necesita (suelo, agua, fertilización). Es lo único que el chat puede afirmar de un cultivo. Si el cultivo no está aquí, el chat responde "no tengo ese dato".

## `modelos_comparacion.json` (antes `modelo-metricas.json`) — lo produce Aquiles
Error del baseline y error de la red en años de prueba (partición por años, no aleatoria), con la variable pronosticada y el periodo. El sitio muestra estos números en una sección "Cómo se calculó".

Nota (14 nov): Aquiles entregó `modelos_comparacion.json` en `main` (carpeta `salida-.../salida/`). Se copia tal cual a `data/processed/` y el sitio lee `datos[]` (val/test RMSE y skill), `mejor_modelo`, `red_del_sitio` y `skill_por_anio_prueba`.

## `serie_regional.json` y `estres_mapa.json` — evidencia adicional en `#calculo`
- **`serie_regional.json`**: serie anual 2001–2026 de la anomalía regional del pico de NDVI (`MOD13A1.061`, campo `anomalia_ndvi_pico`) cruzada con los años malos del maíz en Amealco según SIAP (`anio_malo_siap`: `true` / `false`, y `null` en 2026 por ser la temporada fuera de muestra). Se copia tal cual de `salida-.../salida/` a `data/processed/` y se grafica/tabla en `#calculo`.
- **`estres_mapa.json`**: evaluación por píxel fuera de muestra para la temporada 2026 sobre los 1,272 píxeles agrícolas de Amealco (`MCD12Q1.061` IGBP 12 y 14). Contiene arrays paralelos (`pred`, `obs`, `banda`, `clim`, `lat`, `lon`, `anomalia_pred`). El sitio calcula en vivo el RMSE de `pred` vs `obs`, el RMSE de `clim` vs `obs` y el porcentaje de píxeles con `|pred - obs| <= banda` (cobertura de la incertidumbre), sin pintar un mapa interactivo.
- **Archivos de `salida/` que NO se conectan al sitio (`escenarios.json`, `modelo_lstm.onnx`, `entradas_2026.*`, `estatico_2026.bin`)**:
  1. Según la nota 2 del 14 nov en `docs/decisiones.md`, en `modelos_comparacion.json` el mejor modelo es `"Climatología del píxel"` (val RMSE `0.0451` vs `0.0568` de la LSTM; skill en prueba `-0.016`); como la LSTM no supera al baseline, no se usa para inferencia en vivo (`modelo_lstm.onnx` / binarios) ni para recomendar fechas.
  2. En `escenarios.json`, los 12 escenarios de sensibilidad climática (4 factores de lluvia `0.70`–`1.15` × 3 incrementos de temperatura `0`–`+2 °C`) dan `pixeles_estres_pct: 0.0` (0 % de píxeles en estrés en los 4 niveles de lluvia probados, pues solo perturban abril–julio y la lluvia de agosto–septiembre no entra al modelo). Mostrar un control deslizante donde todos los escenarios marcan 0 % no aporta información y resta credibilidad.
