"""Estado del suelo y clima de NASA POWER para TODO México, por celda (~0.5° x 0.625°).

Para que cualquier lugar que ponga el agricultor tenga datos: humedad del suelo en la zona de
raíces (GWETROOT) del último mes contra lo normal, lluvia de la temporada (mayo a hoy) contra lo
normal y días de helada. Se calcula por adelantado (el sitio no llama a la NASA en vivo, regla 3).
Uso: python pipeline/clima_mexico.py   y luego   python3 pipeline/copiar_datos.py
"""
import json, time, datetime as dt
from pathlib import Path
import requests

RAIZ = Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "data" / "processed" / "clima_mexico.json"
URL = "https://power.larc.nasa.gov/api/temporal/monthly/regional"
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
NORMAL = range(2003, 2026)
# Cuadros de 10° x 10° (límite de la API regional) que cubren México
CUADROS = [(la, la + 10, lo, lo + 10) for la in (14, 24) for lo in (-119, -109, -99, -89)]


def baja(parametro, anio_fin):
    celdas = {}
    for la0, la1, lo0, lo1 in CUADROS:
        for intento in range(4):
            r = requests.get(URL, params={"latitude-min": la0, "latitude-max": la1, "longitude-min": lo0,
                                          "longitude-max": lo1, "parameters": parametro, "community": "AG",
                                          "start": 2003, "end": anio_fin, "format": "JSON"}, timeout=300)
            if r.ok:
                break
            time.sleep(10 * (intento + 1))
        r.raise_for_status()
        for f in r.json()["features"]:
            lon, lat = f["geometry"]["coordinates"][:2]
            celdas[(round(lat, 3), round(lon, 3))] = {k: v for k, v in f["properties"]["parameter"][parametro].items() if v != -999.0}
        print(parametro, (la0, lo0), "celdas:", len(celdas), flush=True)
    return celdas


def main():
    hoy = dt.date.today()
    hum, llu, hel = baja("GWETROOT", hoy.year), baja("PRECTOTCORR_SUM", hoy.year), baja("FROST_DAYS", hoy.year)
    # Último mes del año actual con humedad publicada (POWER publica con unas semanas de retraso)
    ultimo_mes = max(int(k[4:]) for v in hum.values() for k in v if k.startswith(str(hoy.year)) and int(k[4:]) <= 12)
    filas = []
    for (lat, lon), h in hum.items():
        actual = h.get(f"{hoy.year}{ultimo_mes:02d}")
        hist = [h[f"{a}{ultimo_mes:02d}"] for a in NORMAL if f"{a}{ultimo_mes:02d}" in h]
        if actual is None or len(hist) < 15:
            continue   # mar u otra celda sin dato de suelo
        pct = sum(x <= actual for x in hist) / len(hist)
        l = llu.get((lat, lon), {})
        tramo = range(5, ultimo_mes + 1) if ultimo_mes >= 5 else range(0)
        lluvia = sum(l.get(f"{hoy.year}{m:02d}", 0) for m in tramo) if tramo else None
        lluvia_normal = sum(sum(l.get(f"{a}{m:02d}", 0) for m in tramo) for a in NORMAL) / len(NORMAL) if tramo else None
        fr = hel.get((lat, lon), {})
        por_mes = [sum(fr.get(f"{a}{m:02d}", 0) for a in NORMAL) / len(NORMAL) for m in range(1, 13)]
        top = [MESES[m] for m in sorted(range(12), key=lambda m: -por_mes[m]) if por_mes[m] >= 0.5][:3]
        filas.append([lat, lon, round(actual, 2), round(sum(hist) / len(hist), 2), round(pct, 2),
                      None if lluvia is None else round(lluvia), None if lluvia_normal is None else round(lluvia_normal),
                      round(sum(por_mes), 1), ", ".join(top)])
    salida = {
        "fuente": "NASA POWER (AG), mensual regional: GWETROOT (humedad del suelo en la zona de raíces, MERRA-2), PRECTOTCORR_SUM y FROST_DAYS; celdas de 0.5° x 0.625° (pipeline/clima_mexico.py)",
        "fecha_consulta": hoy.isoformat(),
        "ejemplo": False,
        "paso_grados": {"lat": 0.5, "lon": 0.625},
        "mes_humedad": f"{MESES[ultimo_mes - 1]} de {hoy.year}",
        "lluvia_tramo": f"del 1 de mayo al 30 de {MESES[ultimo_mes - 1]} de {hoy.year}" if ultimo_mes >= 5 else None,
        "periodo_normal": "2003-2025",
        "como_leer": "humedad de 0 (tierra seca) a 1 (saturada); 'más seca' o 'más húmeda' si el mes queda fuera del 25-75 % de los mismos meses de 2003-2025. Cada celda cubre unos 55 x 65 km: describe la zona, no una parcela.",
        "columnas": ["lat", "lon", "humedad", "humedad_normal", "percentil", "lluvia_mm", "lluvia_normal_mm", "dias_helada_anio", "meses_helada"],
        "celdas": sorted(filas),
    }
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("celdas con dato:", len(filas), "| mes de humedad:", salida["mes_humedad"], "|", SALIDA.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
