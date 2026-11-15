"""Arma data/processed/municipios.json: todos los municipios de México con las coordenadas de su
cabecera municipal, desde el servicio público de INEGI (Catálogo Único de Claves Geoestadísticas).

Uso:  python3 pipeline/municipios_inegi.py
El sitio usa este archivo para ubicar sin internet un lugar escrito a mano ("Texcoco").
Solo hace consultas de lectura y espera un poco entre ellas para no saturar el servicio.
"""
import concurrent.futures as cf
import datetime as dt
import json
import pathlib
import sys
import time
import urllib.request

BASE = "https://gaia.inegi.org.mx/wscatgeo/v2"
SALIDA = pathlib.Path("data/processed/municipios.json")
HILOS = 4


def leer(url, intentos=4):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "milpa-clara-pipeline"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # red inestable: reintenta con espera creciente
            if i == intentos - 1:
                raise RuntimeError(f"{url}: {e}")
            time.sleep(1.5 * (i + 1))


def main():
    estados = leer(f"{BASE}/mgee/")["datos"]
    municipios = []
    for e in estados:
        for m in leer(f"{BASE}/mgem/{e['cve_ent']}")["datos"]:
            municipios.append((e, m))
        time.sleep(0.1)
    print(f"{len(estados)} estados, {len(municipios)} municipios", file=sys.stderr)

    def cabecera(par):
        e, m = par
        # Las alcaldías de la CDMX no tienen cabecera ("----"): se usa su localidad principal (0001).
        cab = m["cve_cab"] if m.get("cve_cab", "").isdigit() else "0001"
        clave = f"{m['cvegeo']}{cab}"
        loc = leer(f"{BASE}/localidades/{clave}")["datos"][0]
        time.sleep(0.05)
        return {
            "cvegeo": m["cvegeo"],
            "municipio": m["nomgeo"],
            "estado": e["nomgeo"],
            "estado_abrev": e.get("nom_abrev"),
            "cabecera": loc.get("nomgeo"),
            "lat": round(float(loc["latitud"]), 4),
            "lon": round(float(loc["longitud"]), 4),
        }

    datos, fallas = [], []
    with cf.ThreadPoolExecutor(HILOS) as ex:
        futuros = {ex.submit(cabecera, p): p for p in municipios}
        for k, f in enumerate(cf.as_completed(futuros), 1):
            try:
                datos.append(f.result())
            except Exception as err:
                fallas.append(str(err))
            if k % 250 == 0:
                print(f"  {k}/{len(municipios)}", file=sys.stderr)
    datos.sort(key=lambda d: d["cvegeo"])
    salida = {
        "fuente": "INEGI, Catálogo Único de Claves Geoestadísticas (servicio wscatgeo v2): municipios y coordenadas "
                  "de su cabecera municipal; población del Censo de Población y Vivienda 2020.",
        "fecha_consulta": dt.date.today().isoformat(),
        "ejemplo": False,
        "generado_por": "pipeline/municipios_inegi.py",
        "nota": "La coordenada es la de la cabecera municipal (en las alcaldías de la CDMX, su localidad principal), no el centro del municipio.",
        "datos": datos,
    }
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(datos)} municipios escritos en {SALIDA}; fallas: {len(fallas)}", file=sys.stderr)
    for f in fallas[:10]:
        print("  falla:", f, file=sys.stderr)
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
