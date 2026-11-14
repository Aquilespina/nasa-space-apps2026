"""PreToolUse (Bash/PowerShell): bloquea comandos que destruyen trabajo. Exit 2 = bloqueado."""
import json
import re
import sys

sys.stderr.reconfigure(encoding="utf-8")

PELIGROSOS = [
    (r"git\s+push\b.*(--force|-f\b)", "push forzado"),
    (r"git\s+reset\s+--hard", "reset --hard"),
    (r"git\s+clean\s+-\w*f", "git clean"),
    (r"(rm\s+-\w*r\w*|Remove-Item\b.*-Recurse).*(\bdata\b|\.git\b|\bsite\b|\bpipeline\b)", "borrar carpetas del proyecto"),
]

try:
    cmd = (json.load(sys.stdin).get("tool_input") or {}).get("command", "")
except Exception:
    sys.exit(0)
for patron, nombre in PELIGROSOS:
    if re.search(patron, cmd, re.I):
        print(f"Bloqueado por el harness ({nombre}). Si de verdad hace falta, que lo corra una persona.", file=sys.stderr)
        sys.exit(2)
