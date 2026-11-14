# Tablero de Ángel (se actualiza en cada checkpoint)

Formato: `- [ ] Tarea · cómo se comprueba`. Al terminar: `- [x]` + commit.

## Fase 0–1 (sábado 14)
- [ ] Acordar con Aquiles el contrato (`docs/contrato-datos.md`), las zonas y los cultivos · los dos confirman por mensaje y se anota en `docs/decisiones.md`
- [ ] Confirmar con la sede fecha y hora límite de entrega, formato y regla de trabajo previo · respuesta anotada en `docs/decisiones.md`
- [ ] Repo en GitHub con esta estructura y primer commit · `git log` muestra el commit (commit local hecho; falta crear el repo en GitHub y hacer push)
- [x] Sitio base desde la maqueta v6 en `site/`, sin la regla de "ciclo corto" · `python3 -m http.server 8000 -d site` abre y `grep -i "ciclo corto" site -r` no devuelve nada
- [x] Armar `data/processed/cultivos.json` desde `referencia/amealco-datos-reales.md` · tiene `fuente`, maíz/frijol/avena y `verifica.py` pasa
- [ ] Recorrido por zonas leyendo `calendario.json` (con el baseline de Aquiles) · cambiar de zona cambia fechas y razón en pantalla
- [ ] Interfaz del chat respondiendo desde `cultivos.json` · pregunta por un cultivo ausente responde "no tengo ese dato"

## Fase 2 (noche sábado a 09:00 domingo)
- [ ] Integrar la salida de la red de Aquiles en `calendario.json` · `generado_por` = `red_neuronal` y el sitio lo indica
- [ ] Backend del chat con la llave en variable de entorno · `grep -r "sk-" .` no devuelve nada
- [ ] Despliegue con enlace público · `curl -s -o /dev/null -w "%{http_code}" <url>` da 200
- [ ] Sección "Cómo se calculó" con `modelo-metricas.json` · muestra baseline contra red

## Fase 3–4 (domingo 15)
- [ ] Compuerta 09:00: ¿la red supera al baseline? · decisión anotada en `docs/decisiones.md`
- [ ] Evaluar el chat con 20–30 preguntas · tabla de aciertos en `docs/`
- [ ] Pruebas en celular de punta a punta · captura de cada pantalla
- [ ] Video de 30 s con subtítulos en inglés, pitch y README · enlaces en el README
- [ ] `docs/uso-ia.md` completo y envío a las 15:00 · confirmación del envío
