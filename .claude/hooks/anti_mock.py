"""PostToolUse (Write/Edit): avisa al agente si escribió datos simulados en site/ o pipeline/.

Exit 2 = el mensaje de stderr regresa al agente para que lo corrija.
Para una línea legítima, agrega en esa misma línea: ok-sin-datos: <razón>
"""
import json
import pathlib
import re
import sys

sys.stderr.reconfigure(encoding="utf-8")

PATRON = re.compile(r"Math\.random|np\.random|random\.(rand|randint|uniform|choice)|lorem|\bmock|\bdummy|\bfake|placeholder|TODO: ?dato", re.I)
CARPETAS = ("site", "pipeline")

try:
    evento = json.load(sys.stdin)
except Exception:
    sys.exit(0)
ruta = (evento.get("tool_input") or {}).get("file_path") or ""
p = pathlib.Path(ruta)
partes = {x.lower() for x in p.parts}
if not ruta or not partes.intersection(CARPETAS) or not p.exists():
    sys.exit(0)
if p.suffix.lower() not in {".py", ".js", ".ts", ".html", ".json", ".css", ".md"}:
    sys.exit(0)

hallazgos = []
for n, linea in enumerate(p.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
    if PATRON.search(linea) and "ok-sin-datos" not in linea:
        hallazgos.append(f"  {p.name}:{n}: {linea.strip()[:120]}")
if hallazgos:
    print("Posibles datos simulados (regla 1 de CLAUDE.md). Cámbialos por datos de data/processed/ "
          "o justifica la línea con 'ok-sin-datos: <razón>':\n" + "\n".join(hallazgos[:10]), file=sys.stderr)
    sys.exit(2)
