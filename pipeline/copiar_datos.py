"""Copia data/processed/*.json a site/data/ para que el sitio estático los pueda leer.

También reúne cualquier data/processed/suelo/<ZONA_ID>/suelo.json en data/processed/suelo_zonas.json
para que el navegador pueda leer todos los pronósticos de suelo sin listar carpetas.
Correr después de cada cambio en data/processed:  python3 pipeline/copiar_datos.py
data/processed es la fuente de verdad; site/data es una copia (verifica.py revisa que coincidan).
"""
import datetime as dt
import json
import pathlib
import shutil

origen = pathlib.Path("data/processed")
destino = pathlib.Path("site/data")
destino.mkdir(parents=True, exist_ok=True)

carpeta_suelo = origen / "suelo"
archivos_suelo = sorted(carpeta_suelo.glob("*/suelo.json")) if carpeta_suelo.exists() else []
datos_suelo = []
fechas_suelo = []
for sf in archivos_suelo:
    try:
        d = json.loads(sf.read_text(encoding="utf-8"))
        if isinstance(d, dict) and d.get("pronostico"):
            if not d.get("zona_id"):
                d["zona_id"] = sf.parent.name
            datos_suelo.append(d)
            if d.get("fecha_consulta"):
                fechas_suelo.append(str(d["fecha_consulta"]))
    except Exception as e:
        print(f"aviso: no se pudo leer {sf}: {e}")

suelo_zonas = {
    "fuente": "Pronósticos de humedad del suelo en la zona de raíces (GWETROOT, próximos 14 días) entrenados por zona en colab/lstm_zona.ipynb con NASA POWER diario (2001-2026).",
    "fecha_consulta": max(fechas_suelo) if fechas_suelo else dt.date.today().isoformat(),
    "ejemplo": False,
    "datos": datos_suelo,
}
(origen / "suelo_zonas.json").write_text(
    json.dumps(suelo_zonas, ensure_ascii=False, indent=2), encoding="utf-8"
)

for viejo in destino.glob("*.json"):
    if not (origen / viejo.name).exists():
        viejo.unlink()
for f in sorted(origen.glob("*.json")):
    shutil.copyfile(f, destino / f.name)
    print(f"copiado {f} -> {destino / f.name}")
