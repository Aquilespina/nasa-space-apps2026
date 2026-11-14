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
