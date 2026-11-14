# Cómo empezar en Fedora

1. Descomprime este zip donde quieras (por ejemplo `~/proyectos/`). Te queda la carpeta `milpa-clara/`.
2. Instala Claude Code si aún no lo tienes (según la documentación oficial, el instalador nativo sirve para Linux):
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   claude --version
   ```
   Si dice `claude: command not found`, el directorio de instalación no está en tu PATH; revisa la guía de solución en https://code.claude.com/docs/en/troubleshoot-install.md
3. Confirma que tienes Python 3 y git: `python3 --version` y `git --version`.
4. Entra a la carpeta, crea el repo y abre Claude Code:
   ```bash
   cd milpa-clara
   git init && git add -A && git commit -m "Paquete de arranque"
   claude
   ```
5. En la primera sesión inicia sesión con `/login`. Luego Claude Code lee `CLAUDE.md` solo, y el hook de arranque te dice la hora del evento y las tareas abiertas.
6. Primer mensaje sugerido:
   > Lee CLAUDE.md, docs/plan.md y docs/contrato-datos.md. Empieza por la primera tarea abierta de docs/tablero.md y no la des por terminada hasta correr su comprobación.

Para el repo en GitHub: crea uno vacío en github.com y conéctalo con `git remote add origin <url>` y `git push -u origin main`.

Archivos de referencia (solo se leen cuando la tarea lo pide): `referencia/`.
