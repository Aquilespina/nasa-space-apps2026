"""SessionStart: hora del evento, siguiente checkpoint, último commit y tareas abiertas."""
import datetime as dt
import pathlib
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

H0 = dt.datetime(2026, 11, 13, 19, 0, tzinfo=dt.timezone.utc)  # 13:00 CDMX
CDMX = dt.timezone(dt.timedelta(hours=-6))
CHECKPOINTS = [
    (0, "Reto, roles, repo con harness, pestaña Resources revisada"),
    (3, "Prueba de humo: 1 archivo real graficado; contrato de JSON fijado"),
    (12, "Rebanada vertical de punta a punta en GitHub Pages"),
    (24, "MVP con datos reales, alcance congelado, cero JSON de ejemplo"),
    (36, "Validación con un número y demo desplegada"),
    (44, "Video 30 s, Summary, Project Details, uso de IA, lista de datos"),
    (50, "ENVÍO COMPLETO (3 h de margen)"),
    (52.98, "Cierre del envío 17:59"),
]

now = dt.datetime.now(dt.timezone.utc)
h = (now - H0).total_seconds() / 3600
lines = []
if h < 0:
    lines.append(f"Faltan {-h:.1f} h para H0 (13 nov 13:00 CDMX).")
else:
    lines.append(f"Evento: H+{h:.1f} ({now.astimezone(CDMX):%a %d %H:%M} CDMX).")
for ch, que in CHECKPOINTS:
    if ch >= h:
        hora = (H0 + dt.timedelta(hours=ch)).astimezone(CDMX)
        lines.append(f"Siguiente checkpoint H{ch:g} ({hora:%a %d %H:%M}, en {ch - h:.1f} h): {que}")
        break
else:
    lines.append("El envío ya cerró.")

try:
    age = subprocess.run(["git", "log", "-1", "--format=%cr"], capture_output=True, text=True, timeout=5).stdout.strip()
    lines.append(f"Último commit: {age or 'ninguno'}." + ("" if ("second" in age or "minute" in age or "segundo" in age or "minuto" in age) else " Haz commit y push."))
except Exception:
    lines.append("Último commit: git no disponible.")

tablero = pathlib.Path("docs/tablero.md")
if tablero.exists():
    abiertas = [l.strip() for l in tablero.read_text(encoding="utf-8").splitlines() if l.strip().startswith("- [ ]")]
    lines.append(f"Tareas abiertas: {len(abiertas)}")
    lines += abiertas[:5]

print("\n".join(lines))
