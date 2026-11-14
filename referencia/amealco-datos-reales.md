# Amealco año por año (2003–2025): datos reales para Field Shift

Fecha: 2026-09-27. Es la base de la maqueta v6 (`Maqueta Tu Parcela v6.html`, publicada en https://claude.ai/artifact/Yati2fd86mYvCitPPJpvdD).
Reemplaza los números de ejemplo de las maquetas anteriores. Todo sale de fuentes públicas consultadas ese día.

## Fuentes

| Fuente | Qué se tomó | Detalle |
|---|---|---|
| NASA POWER, API diaria (comunidad AG), punto 20.19 N, 100.14 O | `PRECTOTCORR`, `T2M_MAX`, `T2M_MIN`, `RH2M`, `WS2M`, `ALLSKY_SFC_SW_DWN`, `GWETROOT` | Celda de 0.5° (unos 55 km), 2000-01-01 al 2026-09-20 |
| SIAP, cierre agrícola municipal | Temporal, primavera-verano: sembrada, siniestrada, producción, rendimiento, precio, valor | 2003–2025. Descarga: `https://nube.agricultura.gob.mx/index.php?view=10AE434F-A2158368-A120BC5A-EDF4AFAA&ANIO=<año>` (el 2026-09-27 sí respondió; el 2026-09-26 no) |
| CONAGUA/SMN, Monitor de Sequía por municipio | Categoría D0–D4 | 2003 al 15 sep 2026 (`MunicipiosSequia.xlsx`) |
| NASA GIBS + CMR | Imágenes HLS (S30/L30) sin nubes, una por temporada; Landsat WELD 1985, 1990 y 2000; NDVI MODIS 16 días | CMR da la nubosidad de cada granulo; GIBS da la imagen en color real |
| FAO-56 (tablas 11 y 12) | Kc y duración de etapas | Tabla genérica, falta ajustarla con un agrónomo |

## Resultados principales

1. **Cultivos de temporal que sí se siembran en Amealco (SIAP):** maíz grano (~11,000 ha al año; 10,800 en 2025), avena forrajera (85–3,650 ha), frijol (10–290 ha) y, hasta 2011, cebada forrajera. **No hay registro de haba** de 2003 a 2025. En Acambay (vecino) sí: unas 25 ha de haba verde al año.
2. **Validación (NASA contra SIAP):** los 6 años malos del maíz (rindió menos de la mitad de su mediana por hectárea sembrada: 2005, 2009, 2011, 2014, 2019 y 2020) fueron temporadas que NASA POWER midió por debajo de la mediana de lluvia de junio a septiembre (540 mm). De 11 temporadas secas, 6 fueron malas; de 12 normales o lluviosas, ninguna.
3. **En esos 6 años**, el maíz rindió 36 % de lo normal; la avena, 72 %; el frijol, 79 % (2019 con dato de Huimilpan).
4. **Años malos en 23 años:** maíz 6, avena 4 (2003, 2005, 2006, 2011), frijol 4 (2006, 2011, 2024, 2025).
5. **2024 no fue año malo para el maíz:** hubo sequía excepcional (D4) del 15 de abril al 15 de agosto, pero la temporada llovió 776 mm (141 % del promedio) y el maíz perdió 4 %. La sequía venía de 2023, la temporada más seca de la serie (311 mm, inicio de lluvias el 4 de julio).
6. **Dónde no cuadra:** 2022 y 2023 fueron secas y el SIAP reporta 0 % de pérdida en Amealco, mientras que en todo Querétaro se perdió 31 % y 42 % del maíz de temporal. En 2022 la superficie sembrada cayó a 5,800 ha (la mitad). Preguntarlo en campo.
7. **Relación lluvia-rendimiento:** en Amealco es débil año a año (Spearman 0.25); en Huimilpan, más fuerte (0.54; racha seca −0.63). La señal útil es la de los años extremos, no la de cada año.
8. **Inicio de lluvias** (20 mm en 5 días sin 10 días secos después): entre el 21 de mayo y el 15 de junio en 15 de 23 años; la fecha más común es el 6 de junio. Cuando llegó después del 15 de junio (2005, 2011, 2020, 2023), 3 de 4 años fueron malos para el maíz.
9. **Helada temprana:** en 6 de 23 años hubo una noche de 2 °C o menos antes del 31 de octubre (2007, 2008, 2010, 2011, 2012, 2020), temperatura mínima a 2 m de la celda; en la parcela, a 2,600 m, puede ser más frío.
10. **Agua de cada cultivo (FAO-56 con NASA POWER):** maíz 528 mm por ciclo (unos 5,280 m³/ha; 180 días desde el 6 de junio); avena forrajera 320 mm (3,200 m³/ha; 100 días desde el 1 de julio); frijol 354 mm (3,540 m³/ha; 110 días desde el 15 de junio). Con un balance simple de 100 mm de suelo, al maíz le faltó más de 15 % del agua en 7 de 23 temporadas; a la avena, en ninguna; al frijol, en 1.
11. **Dinero (ingreso bruto por hectárea sembrada, año normal):** maíz ~$8,070, frijol ~$6,710, avena ~$5,410, con el precio medio rural de Querétaro 2021–2025 (maíz $5,413/t, frijol $14,627/t, avena forrajera $592/t). En 23 años, sembrar maíz cada año deja más dinero bruto que rotar ($176 mil contra $168 mil con frijol y $146 mil con avena por hectárea). En las temporadas secas, maíz → frijol dejó en promedio $450 más al año que maíz cada año. **Faltan los costos** (FIRA) para hablar de ganancia.
12. **Temporada 2026 al 20 de septiembre:** 496 mm desde el 1 de junio (96 % de lo normal a esa fecha); humedad en la raíz 0.70 contra 0.66 normal; CONAGUA: D0 al 15 de septiembre.

**Lectura para el pitch:** la app no dice "rota y gana más". Dice cuánto arriesgas con el maíz, qué te protege y cuánto cuesta en un año normal. Eso es más creíble ante el jurado (criterio de Validez) y es lo que casi nadie hizo en 1,180 proyectos de agricultura.

## Tabla por año

Lluvia de junio a septiembre (NASA POWER, % del promedio de 550 mm; "seca" = debajo de la mediana). Sequía: % de quincenas de junio a octubre en D1 o peor (antes de 2014 el monitor es mensual). Rendimientos en toneladas por hectárea **sembrada** (incluye lo perdido). *Frijol 2018–2019: sin registro en Amealco, se usa Huimilpan.

| Año | Lluvia jun–sep, mm | Inicio de lluvias | Sequía | Maíz t/ha | Maíz perdido | Avena t/ha | Frijol t/ha | Nota |
|---|---|---|---|---|---|---|---|---|
| 2003 | 719 (131 %) | 30 may | 0 % | 1.32 | 13 % | 1.4 | 0.48 |  |
| 2004 | 636 (116 %) | 27 may | 0 % | 1.45 | 13 % | 8.9 | 0.37 |  |
| 2005 | 433 (79 %) · seca | 21 jun | 20 % | 0.59 | 26 % | 3.1 | 0.50 | año malo |
| 2006 | 540 (98 %) | 11 may | 20 % | 0.85 | 35 % | 3.0 | 0.23 |  |
| 2007 | 598 (109 %) | 14 jun | 0 % | 2.55 | 9 % | 10.0 | 0.95 |  |
| 2008 | 618 (112 %) | 4 jun | 40 % | 1.90 | 2 % | 9.7 | 0.62 |  |
| 2009 | 497 (90 %) · seca | 14 jun | 60 % | 0.72 | 10 % | 9.0 | 0.63 | año malo |
| 2010 | 537 (98 %) · seca | 8 jun | 0 % | 1.49 | 5 % | 11.1 | 0.71 |  |
| 2011 | 486 (88 %) · seca | 17 jun | 100 % | 0.09 | 45 % | 0.1 | 0.00 | año malo |
| 2012 | 511 (93 %) · seca | 14 jun | 0 % | 1.78 | 0 % | 6.1 | 0.91 |  |
| 2013 | 594 (108 %) | 6 jun | 0 % | 1.49 | 1 % | 9.8 | 0.46 |  |
| 2014 | 532 (97 %) · seca | 21 may | 0 % | 0.55 | 15 % | 10.4 | 0.44 | año malo |
| 2015 | 460 (84 %) · seca | 9 may | 0 % | 1.99 | 0 % | 9.8 | 0.65 |  |
| 2016 | 592 (108 %) | 24 may | 0 % | 1.70 | 0 % | 5.7 | 0.60 |  |
| 2017 | 554 (101 %) | 9 may | 50 % | 1.85 | 0 % | 7.6 | 0.70 |  |
| 2018 | 629 (114 %) | 8 jun | 10 % | 1.55 | 0 % | 7.7 | 0.66* |  |
| 2019 | 456 (83 %) · seca | 1 jun | 90 % | 0.67 | 33 % | 7.7 | 0.31* | año malo |
| 2020 | 452 (82 %) · seca | 19 jun | 30 % | 0.64 | 39 % | 9.1 | 0.30 | año malo |
| 2021 | 636 (116 %) | 7 may | 50 % | 1.49 | 1 % | 9.2 | 0.24 |  |
| 2022 | 460 (84 %) · seca | 9 jun | 100 % | 1.95 | 0 % | 10.8 | 0.35 | seca sin pérdida reportada |
| 2023 | 311 (56 %) · seca | 4 jul | 100 % | 1.94 | 0 % | 10.6 | 0.36 | seca sin pérdida reportada |
| 2024 | 776 (141 %) | 15 jun | 90 % | 1.86 | 4 % | 10.6 | 0.07 |  |
| 2025 | 626 (114 %) | 21 may | 0 % | 2.14 | 1 % | 9.6 | 0.00 |  |

## Imágenes de la maqueta

Área de 12 × 9.6 km al norte del pueblo (20.1518–20.2382 N, 100.1674–100.0526 O), 408 × 307 píxeles de 30 m. Fechas HLS: 2015-12-17, 2016-10-19, 2017-10-22, 2018-11-08, 2019-10-09, 2020-10-08, 2021-10-08, 2022-10-13, 2023-10-06, 2024-10-10, 2025-10-20. Portada: HLS S30 del 2024-10-10. La parcela "El Llano" es un ejemplo (unos 20.209 N, 100.146 O).

## Cómo se hizo

Scripts en la carpeta temporal de la sesión `4eca5c9c-9f9d-4482-9eac-592efcf83d8b/scratchpad/data/`: `power_proc.py` (lluvia y ET₀), `agro.py` (inicio de lluvias y heladas), `etc.py` (agua por cultivo), `siap_load.py` (SIAP), `build_data.py` (cruce y validación), `imgs.py` y `enc.py` (imágenes). Se pueden borrar; lo importante está en este archivo.

## Hallazgos adicionales (27 sep 2026, tarde)

El supervisor también los verificó (`supervision/milpa-clara/revision-2026-09-27-1246.md`).

1. **Qué tan sólida es la validación.** Los 6 años malos cayeron en temporadas secas: prueba exacta de Fisher, p = 0.0046. Con el tercil más seco (8 años), 5 de los 6 años malos caen dentro. Ojo: la lista de temporadas "secas" incluye 2014, que tuvo 97 % del promedio.
2. **La decisión al sembrar no está respaldada.**
   - Regla probada: "si la lluvia se establece después del 15 de junio, avena; si no, maíz".
   - Resultado: −$4,048 por ha en 2003–2025 frente a sembrar siempre maíz. Sin 2023, cuyo dato es dudoso, queda en +$178.
   - Solo 3 de los 6 años malos tuvieron inicio tarde (2005, 2011, 2020). En 2009, 2014 y 2019 la lluvia llegó a tiempo y el cultivo falló a media temporada.
   - La maqueta v6 todavía recomienda esa regla en la pestaña Avisos: hay que quitarla.
3. **Lo que sí aguanta: repartir la tierra.** Ingreso bruto por ha, 2003–2025; "año malo" = menos de $4,033, la mitad de un año normal de maíz.

   | Reparto | Promedio | Años malos |
   |---|---|---|
   | 100 % maíz | $7,663 | 6 |
   | 70 % maíz + 30 % frijol | $7,375 | 4 |
   | 70 % maíz + 30 % avena | $6,762 | 5 (aparece 2006) |
   | 50 % maíz + 25 % avena + 25 % frijol | $6,672 | 3 |

   En 2011 falla todo.
4. **Condiciones que cambian** (NASA POWER 2000–2025; Mann-Kendall y pendiente de Sen, sin corrección por autocorrelación):
   - Temperatura máxima: +0.53 °C por década (p = 0.011).
   - Temperatura mínima: +0.45 °C por década (p < 0.001).
   - ET₀: +28 mm por década (p = 0.078, no significativa).
   - Lluvia de junio a septiembre, inicio de lluvias y rachas secas: sin tendencia.
   - Noches a 0 °C o menos: 4.7 por año en 2003–2012 contra 1.6 en 2016–2025.
5. **Suelo** (SoilGrids 250 m, parcela de ejemplo en 20.209 N, 100.146 O):
   - Arcilla: 32 % de 0 a 5 cm y 42 % de 15 a 30 cm. Arena: 45 % y 38 %.
   - pH 5.8–5.9. Carbono orgánico: 3.3 % y 1.3 %.
   - Agua disponible: unos 168 mm por metro. El balance de la maqueta supone 100.
   - Consulta: `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=<lon>&lat=<lat>&property=clay&property=sand&property=phh2o&property=soc&property=wv0033&property=wv1500&depth=0-5cm&depth=15-30cm&value=mean`
6. **Autoconsumo** (INEGI, Encuesta Nacional Agropecuaria 2019, nacional): el 47 % de las unidades que producen granos vende toda o parte de su cosecha. De las que guardan para consumo propio, el 75.4 % es para la familia y el 27.5 % para animales. La app debe preguntar primero cuánto maíz necesita la casa.
7. **IMERG:** la versión Final (`GPM_3IMERGDF` v07) llega al 30 sep 2025. Para la temporada 2026 hay que usar `GPM_3IMERGDL` (Late).
