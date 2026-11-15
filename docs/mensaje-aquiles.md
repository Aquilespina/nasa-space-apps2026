# Mensaje para Aquiles (tarea 1 del tablero) — copiar y pegar

> Aquiles, para cerrar el contrato (`docs/contrato-datos.md`) necesito que me confirmes 4 cosas. Respóndeme "ok" o con cambios:
>
> 1. **Formato:** envoltorio `{fuente, fecha_consulta, ejemplo, generado_por, datos: [...]}`. `calendario.json` con un registro por zona × cultivo × actividad: `zona_id, cultivo, actividad (siembra|fertilizacion|cosecha), ventana_inicio, ventana_fin, fecha_recomendada (ISO), confianza (0–1), razon (≤200 caracteres), fuente`.
> 2. **Cultivos:** maíz, frijol y avena (los 3 que el SIAP registra en Amealco; ya están en `cultivos.json` con FAO-56). ¿De acuerdo?
> 3. **Zonas (3):** tú defines las coordenadas, porque dependen de dónde tengas NDVI limpio. Propuesta: dentro del recuadro HLS de la maqueta (20.1518–20.2382 N, 100.1674–100.0526 O), una de ellas en El Llano (≈20.209 N, 100.146 O). Ojo: NASA POWER es una celda de ~55 km, así que las 3 zonas tienen la misma lluvia; lo que las distingue es el NDVI (MODIS/HLS). Si eso no da diferencias reales, mejor lo decimos.
> 4. **Fertilización:** la referencia no trae dosis ni fechas. ¿Tu baseline la calcula (p. ej., días después de la siembra según etapa FAO-56) o la quitamos del calendario?
>
> Entregable que necesito hoy: `calendario.json` del **baseline** (aunque sea con `ejemplo: true` mientras tanto) y `zonas.json`. Checkpoint H24 = hoy 13:00.

Cuando conteste, anotar en `docs/decisiones.md` y marcar la tarea 1.
