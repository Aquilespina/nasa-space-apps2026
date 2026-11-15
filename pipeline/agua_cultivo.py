"""Agua que necesita un cultivo en su ciclo (FAO-56) con el clima de NASA POWER, y en cuántas
temporadas le faltó más de 15 % del agua con un balance simple de 100 mm de suelo.

Mismo método que referencia/amealco-datos-reales.md (punto 9 y 10). Se valida reproduciendo
maíz (528 mm, 7 de 23) y frijol (354 mm, 1 de 23) antes de calcular un cultivo nuevo.
Uso: python pipeline/agua_cultivo.py
"""
import math, json, datetime as dt
import requests

LAT, LON = 20.19, -100.14          # punto de la referencia
ANIOS = range(2003, 2026)
# Kc y etapas (días): FAO-56 tablas 11 y 12 (genéricas; falta ajustarlas con un agrónomo)
CULTIVOS = {
    "maiz":     {"inicio": (6, 6),  "etapas": (30, 50, 60, 40), "kc": (0.30, 1.20, 0.35)},
    "frijol":   {"inicio": (6, 15), "etapas": (20, 30, 40, 20), "kc": (0.40, 1.15, 0.35)},
    "calabaza": {"inicio": (6, 6),  "etapas": (25, 35, 35, 25), "kc": (0.50, 1.00, 0.80)},
}


def power():
    url = ("https://power.larc.nasa.gov/api/temporal/daily/point"
           "?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,RH2M,WS2M,ALLSKY_SFC_SW_DWN&community=AG"
           f"&latitude={LAT}&longitude={LON}&start=20030101&end=20251231&format=JSON")
    j = requests.get(url, timeout=300).json()
    p, z = j["properties"]["parameter"], j["geometry"]["coordinates"][2]
    dias = {}
    for k in p["PRECTOTCORR"]:
        dias[dt.date(int(k[:4]), int(k[4:6]), int(k[6:]))] = {v: p[v][k] for v in p}
    return dias, z


def et0_pm(d, fecha, z):
    """FAO-56 Penman-Monteith diario (ec. 6), radiación de POWER (MJ/m²/día)."""
    tmax, tmin, rh, u2, rs = d["T2M_MAX"], d["T2M_MIN"], d["RH2M"], d["WS2M"], d["ALLSKY_SFC_SW_DWN"]
    t = (tmax + tmin) / 2
    p = 101.3 * ((293 - 0.0065 * z) / 293) ** 5.26
    g = 0.000665 * p
    es = (0.6108 * math.exp(17.27 * tmax / (tmax + 237.3)) + 0.6108 * math.exp(17.27 * tmin / (tmin + 237.3))) / 2
    ea = es * rh / 100
    delta = 4098 * 0.6108 * math.exp(17.27 * t / (t + 237.3)) / (t + 237.3) ** 2
    J, phi = fecha.timetuple().tm_yday, math.radians(LAT)
    dr = 1 + 0.033 * math.cos(2 * math.pi * J / 365); dec = 0.409 * math.sin(2 * math.pi * J / 365 - 1.39)
    ws = math.acos(-math.tan(phi) * math.tan(dec))
    ra = 24 * 60 / math.pi * 0.0820 * dr * (ws * math.sin(phi) * math.sin(dec) + math.cos(phi) * math.cos(dec) * math.sin(ws))
    rso = (0.75 + 2e-5 * z) * ra
    rns = 0.77 * rs
    rnl = 4.903e-9 * (((tmax + 273.16) ** 4 + (tmin + 273.16) ** 4) / 2) * (0.34 - 0.14 * math.sqrt(ea)) * (1.35 * min(rs / rso, 1) - 0.35)
    rn = rns - rnl
    return max(0.0, (0.408 * delta * rn + g * 900 / (t + 273) * u2 * (es - ea)) / (delta + g * (1 + 0.34 * u2)))


def kc_dia(i, etapas, kc):
    a, b, c, d = etapas; ini, mid, fin = kc
    if i < a: return ini
    if i < a + b: return ini + (mid - ini) * (i - a) / b
    if i < a + b + c: return mid
    return mid + (fin - mid) * (i - a - b - c) / d


def temporada(dias, z, cultivo, anio):
    c = CULTIVOS[cultivo]; ini = dt.date(anio, *c["inicio"]); n = sum(c["etapas"])
    etc_tot, falta, s = 0.0, 0.0, 100.0          # suelo lleno al sembrar (inicio de lluvias)
    for i in range(n):
        f = ini + dt.timedelta(days=i); d = dias.get(f)
        if not d: continue
        etc = kc_dia(i, c["etapas"], c["kc"]) * et0_pm(d, f, z)
        s = min(100.0, s + d["PRECTOTCORR"])
        usa = min(s, etc); s -= usa
        etc_tot += etc; falta += etc - usa
    return etc_tot, falta / etc_tot if etc_tot else 0


def main():
    dias, z = power()
    out = {}
    for cultivo, c in CULTIVOS.items():
        res = [temporada(dias, z, cultivo, a) for a in ANIOS]
        mm = sum(r[0] for r in res) / len(res)
        cortos = sum(1 for r in res if r[1] > 0.15)
        out[cultivo] = {"agua_ciclo_mm": round(mm), "ciclo_dias": sum(c["etapas"]), "anios_con_falta_agua_mas_15pct": f"{cortos} de {len(res)}"}
        print(cultivo, out[cultivo])
    return out


if __name__ == "__main__":
    main()
