"""Copia data/processed/*.json a site/data/ para que el sitio estático los pueda leer.

Correr después de cada cambio en data/processed:  python3 pipeline/copiar_datos.py
data/processed es la fuente de verdad; site/data es una copia (verifica.py revisa que coincidan).
"""
import pathlib
import shutil

origen = pathlib.Path("data/processed")
destino = pathlib.Path("site/data")
destino.mkdir(parents=True, exist_ok=True)
for viejo in destino.glob("*.json"):
    if not (origen / viejo.name).exists():
        viejo.unlink()
for f in sorted(origen.glob("*.json")):
    shutil.copyfile(f, destino / f.name)
    print(f"copiado {f} -> {destino / f.name}")
