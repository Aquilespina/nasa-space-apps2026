# Prueba local de la salida de Aquiles (14 nov 2026)

Commit probado: `5773cbd` de `aquiles/main` ("Resultados del entrenamiento del Modelo LSTM").
Cómo repetirla: ver el encabezado de `pipeline/probar_salida_aquiles.py`. No se ejecutó ni se entrenó el modelo (regla 5).

## Resultado

```
[OK ] hay archivos JSON                                             5 archivos
[OK ] entradas_2026.json: fuente, fecha_consulta y ejemplo          
[OK ] escenarios.json: fuente, fecha_consulta y ejemplo             
[OK ] estres_mapa.json: fuente, fecha_consulta y ejemplo            
[OK ] modelos_comparacion.json: fuente, fecha_consulta y ejemplo    
[OK ] serie_regional.json: fuente, fecha_consulta y ejemplo         
[AVISO] contrato: calendario.json entregado                           no viene en la salida; el sitio usa el baseline de la referencia
[AVISO] contrato: zonas.json entregado                                no viene en la salida; el sitio usa el baseline de la referencia
[OK ] estres_mapa: todas las listas del mismo largo                 {'lat': 1272, 'lon': 1272, 'pred': 1272, 'banda': 1272, 'obs': 1272, 'clim': 1272, 'anomalia_pred': 1272}
[OK ] estres_mapa: píxeles dentro de la región de Amealco           lat 20.052–20.328, lon -100.297–-99.983; fuera: 0
[OK ] estres_mapa: NDVI predicho entre -1 y 1                       0.564–0.839, nulos 60
[OK ] estres_mapa: anomalía = predicción − climatología             diferencia máx 0.0010 (redondeo a 3 decimales)
[OK ] estres_mapa 2026: error contra lo observado                   RMSE LSTM 0.0418 vs climatología 0.0470 (1205 píxeles); observado dentro de la banda: 85%
[OK ] estres_mapa 2026: píxeles con estrés (anomalía < −0.05)       0 de 1272
[OK ] entradas_2026: mismo número de píxeles que el mapa            n=1272, mapa=1272
[OK ] modelos_comparacion: mejor_modelo = menor RMSE en validación  menor RMSE val: Climatología del píxel; declarado: Climatología del píxel
[AVISO] modelos_comparacion: el mejor en prueba                       en prueba gana Random Forest (se eligió por validación, como dice criterio_mejor)
[OK ] modelos_comparacion: la red del sitio está en la tabla        LSTM (5 semillas)
[AVISO] modelos_comparacion: ¿la red supera al promedio?              skill prueba -0.016, validación -0.589
[OK ] escenarios: 'monotono_lluvia' coincide con los datos          calculado True, declarado True
[OK ] escenarios: con menos lluvia, ¿la anomalía baja?              sí, en cada temperatura
[AVISO] escenarios: con más calor, ¿la anomalía baja?                 no: con +2 °C el modelo predice MÁS verde en toda lluvia; revisar con Aquiles si es esperable a 2,600 m
[AVISO] escenarios: ¿algún escenario llega a estrés?                  máx 0.0 % de píxeles; anomalía media +0.0036 a +0.0190 (el umbral es −0.05): el modelo casi no responde a los cambios
[OK ] power_diario: lluvia jun–sep igual a la referencia (±3 %)     23 años; mayor diferencia 2003: 719 vs 719 mm
[OK ] serie_regional: años malos del SIAP = referencia              Aquiles [2005, 2009, 2011, 2014, 2019, 2020]; referencia [2005, 2009, 2011, 2014, 2019, 2020]
[AVISO] serie_regional: ¿el NDVI baja en los años malos?              anomalía negativa en 2 de 6 años malos: 2005: +0.0098, 2009: -0.0453, 2011: +0.0045, 2014: -0.0211, 2019: +0.0001, 2020: +0.0465
[OK ] data/processed/modelos_comparacion.json = versión de Aquiles  

27 pruebas · 0 fallas · 7 avisos
```

Sitio local (`python3 -m http.server -d site`): página, `recorrido.js`, `calculo.js` y los 4 JSON responden 200; `data/modelos_comparacion.json` servido es idéntico byte a byte al de Aquiles.

## Lo que está bien
- Los 5 JSON traen `fuente`, `fecha_consulta` y `ejemplo: false`.
- La lluvia jun–sep de su `power_diario.csv` coincide con la referencia en los 23 años (2003–2025).
- Sus años malos del SIAP son los mismos 6 de la referencia.
- El mapa 2026 es coherente (1,272 píxeles, todos en la región, anomalía = predicción − climatología salvo redondeo). En 2026 la LSTM se acercó más a lo observado que la climatología (RMSE 0.042 vs 0.047), pero es un solo año.

## Preguntas para Aquiles
1. **`calendario.json` y `zonas.json`** no vienen. ¿Los vas a generar, o el sitio se queda con el baseline de la referencia (una zona, El Llano)?
2. **Calor:** en `escenarios.json`, con +2 °C el modelo predice *más* verde con cualquier lluvia. ¿Es esperable a 2,600 m o es un artefacto?
3. **Sensibilidad:** ningún escenario llega a estrés (anomalía media entre +0.004 y +0.019; umbral −0.05), ni con 30 % menos lluvia. ¿El modelo responde poco a las entradas de abr–jul?
4. **NDVI y años malos:** en `serie_regional.json` la anomalía del pico de NDVI solo es negativa en 2 de los 6 años malos (2009 y 2014); en 2020 es la más positiva. ¿El NDVI regional de MODIS no capta las pérdidas, o la máscara de cultivo diluye la señal? Esto importa para el pitch: no podemos decir "el satélite ve los años malos" con este NDVI.
5. **Random Forest** gana en prueba (+0.12) aunque pierde en validación. Lo dejamos como está (criterio declarado: validación), pero conviene que los dos lo expliquemos igual.
