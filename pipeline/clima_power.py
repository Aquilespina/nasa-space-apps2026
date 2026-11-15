"""Humedad del suelo, lluvia de la temporada y heladas de NASA POWER para cada zona de zonas.json.

Se calcula por adelantado (el sitio no llama a la NASA en vivo, regla 3) y se guarda en
data/processed/clima_zona.json. Uso:  python pipeline/clima_power.py
Después: python3 pipeline/copiar_datos.py  (copia a site/data).
"""
import json, datetime as dt
from pathlib import Path
import requests

RAIZ = Path(__file__).resolve().parents[1]
DATOS = RAIZ / "data" / "processed"
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
ANIOS_NORMAL = range(2003, 2026)   # mismo periodo que el calendario


def power(lat, lon, inicio, fin):
    url = ("https://power.larc.nasa.gov/api/temporal/daily/point"
           "?parameters=PRECTOTCORR,T2M_MIN,GWETROOT&community=AG"
           f"&latitude={lat}&longitude={lon}&start={inicio}&end={fin}&format=JSON")
    p = requests.get(url, timeout=300).json()["properties"]["parameter"]
    dias = {}
    for var, serie in p.items():
        for k, v in serie.items():
            if v != -999.0:
                dias.setdefault(k, {})[var] = v
    return {dt.date(int(k[:4]), int(k[4:6]), int(k[6:])): v for k, v in dias.items()}


def percentil(valores, x):
    return sum(v <= x for v in valores) / len(valores)


def zona_clima(z, hoy):
    d = power(z["lat"], z["lon"], "20030101", hoy.strftime("%Y%m%d"))
    ultimo = max(k for k, v in d.items() if "PRECTOTCORR" in v and "GWETROOT" in v)

    # Humedad del suelo en la raíz (GWETROOT, 0 = seca, 1 = saturada): último mes completo contra
    # el mismo mes de 2003-2025. "más seca/húmeda" = fuera del 25-75 % de esos años.
    fin_mes = ultimo.replace(day=1) - dt.timedelta(days=1)
    if (ultimo + dt.timedelta(days=1)).month != ultimo.month:
        fin_mes = ultimo
    anio_m, mes_m = fin_mes.year, fin_mes.month
    prom = lambda a, m: (lambda xs: sum(xs) / len(xs) if xs else None)(
        [v["GWETROOT"] for k, v in d.items() if k.year == a and k.month == m and "GWETROOT" in v])
    actual = prom(anio_m, mes_m)
    hist = [x for x in (prom(a, mes_m) for a in ANIOS_NORMAL) if x is not None]
    p = percentil(hist, actual)
    estado = "más seca" if p <= 0.25 else "más húmeda" if p >= 0.75 else "igual de húmeda"

    # Lluvia desde el 1 de mayo hasta el último día con dato, contra el promedio del mismo tramo.
    def lluvia(a):
        ini, fin = dt.date(a, 5, 1), dt.date(a, ultimo.month, ultimo.day)
        return sum(v.get("PRECTOTCORR", 0) for k, v in d.items() if ini <= k <= fin)
    lluvia_hoy = lluvia(ultimo.year) if ultimo >= dt.date(ultimo.year, 5, 1) else None
    lluvia_normal = sum(lluvia(a) for a in ANIOS_NORMAL) / len(ANIOS_NORMAL)

    # Heladas: días con mínima <= 0 °C por año (promedio 2003-2025) y meses en que más caen.
    helada = [k for k, v in d.items() if k.year in ANIOS_NORMAL and v.get("T2M_MIN", 99) <= 0]
    por_mes = {m: sum(1 for k in helada if k.month == m) for m in range(1, 13)}
    meses_top = [MESES[m - 1] for m, n in sorted(por_mes.items(), key=lambda x: -x[1]) if n][:3]
    return {
        "zona_id": z["zona_id"],
        "ultimo_dia_con_dato": ultimo.isoformat(),
        "humedad_raiz": {"mes": f"{MESES[mes_m - 1]} de {anio_m}", "valor": round(actual, 2),
                         "normal": round(sum(hist) / len(hist), 2), "estado": estado,
                         "percentil_vs_2003_2025": round(p, 2),
                         "como_leer": "GWETROOT de 0 (tierra seca) a 1 (saturada) en la zona de raíces (~1 m). 'más seca' o 'más húmeda' = fuera del 25-75 % de los mismos meses de 2003-2025."},
        "lluvia_temporada": {"desde": f"{ultimo.year}-05-01", "hasta": ultimo.isoformat(),
                             "mm": round(lluvia_hoy) if lluvia_hoy is not None else None,
                             "normal_mm": round(lluvia_normal)},
        "heladas": {"dias_por_anio": round(len(helada) / len(ANIOS_NORMAL), 1), "meses": meses_top,
                    "como_leer": "Días con temperatura mínima de 0 °C o menos (NASA POWER T2M_MIN), promedio 2003-2025."},
    }


def main():
    zonas = json.loads((DATOS / "zonas.json").read_text(encoding="utf-8"))
    hoy = dt.date.today()
    datos = [zona_clima(z, hoy) for z in zonas["datos"] if z.get("lat") is not None]
    salida = {
        "fuente": "NASA POWER (AG), diario: GWETROOT (humedad del suelo en la raíz, de MERRA-2), PRECTOTCORR y T2M_MIN; celda de ~0.5° en el punto de cada zona (pipeline/clima_power.py)",
        "fecha_consulta": hoy.isoformat(),
        "ejemplo": False,
        "datos": datos,
    }
    (DATOS / "clima_zona.json").write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(salida, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
