"""Comprobaciones del repo. A mano: python .claude/hooks/verifica.py
Como hook Stop (--hook): si hay fallas, exit 2 y el agente no da la tarea por terminada.
"""
import datetime as dt
import json
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HOOK = "--hook" in sys.argv
if HOOK:
    try:
        evento = json.load(sys.stdin)
        if evento.get("stop_hook_active"):  # ya se bloqueó una vez: no hacer bucle
            sys.exit(0)
    except Exception:
        pass

H24 = dt.datetime(2026, 11, 14, 19, 0, tzinfo=dt.timezone.utc)
despues_h24 = dt.datetime.now(dt.timezone.utc) >= H24
fallas, avisos = [], []

for f in sorted(pathlib.Path("data/processed").glob("*.json")):
    try:
        d = json.loads(f.read_text(encoding="utf-8"))
    except Exception as e:
        fallas.append(f"{f}: JSON inválido ({e})")
        continue
    meta = d if isinstance(d, dict) else {}
    if not meta.get("fuente"):
        fallas.append(f"{f}: falta el campo 'fuente'")
    if meta.get("ejemplo") is True:
        (fallas if despues_h24 else avisos).append(f"{f}: sigue marcado como ejemplo")

site = pathlib.Path("site")
if site.exists():
    for f in site.rglob("*.html"):
        t = f.read_text(encoding="utf-8", errors="ignore")
        if f.name == "index.html" and 'name="viewport"' not in t:
            fallas.append(f"{f}: falta <meta name=\"viewport\"> (M2: móvil)")
    for f in list(site.rglob("*.html")) + list(site.rglob("*.js")):
        if re.search(r"localhost|127\.0\.0\.1", f.read_text(encoding="utf-8", errors="ignore")):
            fallas.append(f"{f}: llama a localhost (el juez no lo podrá abrir)")

if not pathlib.Path("docs/uso-ia.md").exists():
    avisos.append("falta docs/uso-ia.md (campo 'Use of AI')")

if fallas:
    print("Verificación con fallas:\n- " + "\n- ".join(fallas + avisos), file=sys.stderr)
    sys.exit(2 if HOOK else 1)
msg = "Verificación OK." + ("" if not avisos else " Avisos:\n- " + "\n- ".join(avisos))
print(msg)
