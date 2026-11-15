"""Prueba local de la salida de Aquiles (carpeta salida/ de su rama main).

Uso:
    git fetch aquiles
    mkdir -p /ruta/temporal && git archive aquiles/main | tar -x -C /ruta/temporal
    python3 pipeline/probar_salida_aquiles.py /ruta/temporal/salida-.../salida

Revisa: (1) envoltorio del contrato en cada JSON, (2) coherencia interna,
(3) cruce con referencia/amealco-datos-reales.md (lluvia jun-sep y años malos del SIAP),
(4) que la copia en data/processed coincida con la de Aquiles.
Solo lee; no ejecuta ni entrena el modelo.
"""
import csv
import json
import math
import pathlib
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")
if len(sys.argv) != 2:
    sys.exit(__doc__)
P = pathlib.Path(sys.argv[1])
resultados = []  # (estado, prueba, detalle)


def anota(ok, prueba, detalle=""):
    resultados.append(("OK " if ok is True else "AVISO" if ok is None else "FALLA", prueba, detalle))


def carga(nombre):
    return json.loads((P / nombre).read_text(encoding="utf-8"))


# ---------- 1. Envoltorio del contrato ----------
jsons = sorted(P.glob("*.json"))
anota(bool(jsons), "hay archivos JSON", f"{len(jsons)} archivos")
for f in jsons:
    try:
        d = json.loads(f.read_text(encoding="utf-8"))
    except Exception as e:
        anota(False, f"{f.name}: JSON válido", str(e))
        continue
    faltan = [k for k in ("fuente", "fecha_consulta", "ejemplo") if k not in d]
    anota(not faltan, f"{f.name}: fuente, fecha_consulta y ejemplo", "faltan " + ", ".join(faltan) if faltan else "")
    if d.get("ejemplo") is True:
        anota(False, f"{f.name}: no es de ejemplo", "ejemplo = true")
for esperado in ("calendario.json", "zonas.json"):
    anota(None if not (P / esperado).exists() else True, f"contrato: {esperado} entregado",
          "no viene en la salida; el sitio usa el baseline de la referencia" if not (P / esperado).exists() else "")

# ---------- 2. Coherencia interna ----------
# Recuadro amplio de Amealco y alrededores (el municipio está aprox. en 20.0-20.4 N, 99.9-100.3 O)
LAT, LON = (19.9, 20.5), (-100.4, -99.8)

em = carga("estres_mapa.json")
D = em["datos"]
largos = {k: len(v) for k, v in D.items()}
anota(len(set(largos.values())) == 1, "estres_mapa: todas las listas del mismo largo", str(largos))
n = len(D["lat"])
fuera = sum(1 for la, lo in zip(D["lat"], D["lon"]) if not (LAT[0] <= la <= LAT[1] and LON[0] <= lo <= LON[1]))
anota(fuera == 0, "estres_mapa: píxeles dentro de la región de Amealco",
      f"lat {min(D['lat']):.3f}–{max(D['lat']):.3f}, lon {min(D['lon']):.3f}–{max(D['lon']):.3f}; fuera: {fuera}")
vals = [v for v in D["pred"] if v is not None]
anota(all(-1 <= v <= 1 for v in vals), "estres_mapa: NDVI predicho entre -1 y 1",
      f"{min(vals):.3f}–{max(vals):.3f}, nulos {n - len(vals)}")
dif = [abs(a - (p - c)) for a, p, c in zip(D["anomalia_pred"], D["pred"], D["clim"]) if None not in (a, p, c)]
# Los valores vienen redondeados a 3 decimales: una diferencia de hasta 0.001 es redondeo.
anota(max(dif) <= 1.5e-3, "estres_mapa: anomalía = predicción − climatología", f"diferencia máx {max(dif):.4f} (redondeo a 3 decimales)")
obs = [(o, p) for o, p in zip(D["obs"], D["pred"]) if o is not None and p is not None]
if obs:
    rmse = math.sqrt(sum((o - p) ** 2 for o, p in obs) / len(obs))
    rmse_c = math.sqrt(sum((o - c) ** 2 for o, c in zip(D["obs"], D["clim"]) if o is not None and c is not None) / len(obs))
    dentro = sum(1 for o, p, b in zip(D["obs"], D["pred"], D["banda"]) if None not in (o, p, b) and abs(o - p) <= b)
    anota(True, "estres_mapa 2026: error contra lo observado",
          f"RMSE LSTM {rmse:.4f} vs climatología {rmse_c:.4f} ({len(obs)} píxeles); "
          f"observado dentro de la banda: {dentro / len(obs):.0%}")
estres = sum(1 for a in D["anomalia_pred"] if a is not None and a < -0.05)
anota(True, "estres_mapa 2026: píxeles con estrés (anomalía < −0.05)", f"{estres} de {n}")

en = carga("entradas_2026.json")
anota(en.get("n") == n and len(en.get("lat", [])) == n, "entradas_2026: mismo número de píxeles que el mapa",
      f"n={en.get('n')}, mapa={n}")

mc = carga("modelos_comparacion.json")
filas = mc["datos"]
mejor_val = min(filas, key=lambda f: f["val_rmse"])["modelo"]
anota(mejor_val == mc["mejor_modelo"], "modelos_comparacion: mejor_modelo = menor RMSE en validación",
      f"menor RMSE val: {mejor_val}; declarado: {mc['mejor_modelo']}")
mejor_test = min(filas, key=lambda f: f["test_rmse"])["modelo"]
anota(None if mejor_test != mc["mejor_modelo"] else True, "modelos_comparacion: el mejor en prueba",
      f"en prueba gana {mejor_test} (se eligió por validación, como dice criterio_mejor)")
red = next((f for f in filas if f["modelo"] == mc["red_del_sitio"]), None)
anota(red is not None, "modelos_comparacion: la red del sitio está en la tabla", mc["red_del_sitio"])
if red:
    anota(None if red["test_skill_vs_climatologia"] <= 0 else True, "modelos_comparacion: ¿la red supera al promedio?",
          f"skill prueba {red['test_skill_vs_climatologia']:+.3f}, validación {red['val_skill_vs_climatologia']:+.3f}")

es = carga("escenarios.json")
por_t = defaultdict(list)
for r in es["datos"]:
    por_t[r["delta_t_c"]].append((r["lluvia_factor"], r["anomalia_media"]))
mono = all(all(a[1] <= b[1] for a, b in zip(sorted(v), sorted(v)[1:])) or all(a[1] >= b[1] for a, b in zip(sorted(v), sorted(v)[1:]))
           for v in por_t.values())
anota(mono == es.get("monotono_lluvia"), "escenarios: 'monotono_lluvia' coincide con los datos",
      f"calculado {mono}, declarado {es.get('monotono_lluvia')}")
# sorted(v)[0] es el escenario con menos lluvia; se espera menos verde (anomalía menor).
seco_menos_verde = all(sorted(v)[0][1] <= sorted(v)[-1][1] for v in por_t.values())
anota(True if seco_menos_verde else None, "escenarios: con menos lluvia, ¿la anomalía baja?",
      "sí, en cada temperatura" if seco_menos_verde else "con menos lluvia la anomalía SUBE: revisar con Aquiles")
por_l = defaultdict(list)
for r in es["datos"]:
    por_l[r["lluvia_factor"]].append((r["delta_t_c"], r["anomalia_media"]))
calor_mas_verde = all(sorted(v)[-1][1] > sorted(v)[0][1] for v in por_l.values())
anota(None if calor_mas_verde else True, "escenarios: con más calor, ¿la anomalía baja?",
      "no: con +2 °C el modelo predice MÁS verde en toda lluvia; revisar con Aquiles si es esperable a 2,600 m"
      if calor_mas_verde else "")
max_estres = max(r["pixeles_estres_pct"] for r in es["datos"])
rango = [r["anomalia_media"] for r in es["datos"]]
anota(None if max_estres == 0 else True, "escenarios: ¿algún escenario llega a estrés?",
      f"máx {max_estres} % de píxeles; anomalía media {min(rango):+.4f} a {max(rango):+.4f} "
      "(el umbral es −0.05): el modelo casi no responde a los cambios")

# ---------- 3. Cruce con la referencia ----------
ref = pathlib.Path("referencia/amealco-datos-reales.md").read_text(encoding="utf-8")
lluvia_ref, malos_ref = {}, set()
for m in re.finditer(r"^\| (20\d\d) \| (\d+) \(", ref, re.M):
    lluvia_ref[int(m.group(1))] = int(m.group(2))
for m in re.finditer(r"^\| (20\d\d) \|.*\| año malo \|$", ref, re.M):
    malos_ref.add(int(m.group(1)))

lluvia = defaultdict(float)
with open(P / "power_diario.csv", encoding="utf-8") as fh:
    for fila in csv.DictReader(fh):
        fecha = fila[""]
        if fecha[5:7] in ("06", "07", "08", "09") and fila["PRECTOTCORR"] not in ("", "-999", "-999.0"):
            lluvia[int(fecha[:4])] += float(fila["PRECTOTCORR"])
comunes = sorted(set(lluvia) & set(lluvia_ref))
difs = {a: lluvia[a] - lluvia_ref[a] for a in comunes}
peor = max(difs, key=lambda a: abs(difs[a]))
anota(all(abs(v) <= 0.03 * lluvia_ref[a] + 5 for a, v in difs.items()),
      "power_diario: lluvia jun–sep igual a la referencia (±3 %)",
      f"{len(comunes)} años; mayor diferencia {peor}: {lluvia[peor]:.0f} vs {lluvia_ref[peor]} mm")

sr = carga("serie_regional.json")
malos_aq = {r["anio"] for r in sr["datos"] if r["anio_malo_siap"] is True}
anota(malos_aq == malos_ref, "serie_regional: años malos del SIAP = referencia",
      f"Aquiles {sorted(malos_aq)}; referencia {sorted(malos_ref)}")
ano = {r["anio"]: r["anomalia_ndvi_pico"] for r in sr["datos"]}
neg = [a for a in sorted(malos_ref) if ano.get(a) is not None and ano[a] < 0]
anota(None if len(neg) < len(malos_ref) / 2 else True, "serie_regional: ¿el NDVI baja en los años malos?",
      f"anomalía negativa en {len(neg)} de {len(malos_ref)} años malos: " +
      ", ".join(f"{a}: {ano.get(a):+.4f}" for a in sorted(malos_ref)))

# ---------- 4. Copia en data/processed ----------
for f in jsons:
    copia = pathlib.Path("data/processed") / f.name
    if copia.exists():
        anota(copia.read_bytes() == f.read_bytes(), f"data/processed/{f.name} = versión de Aquiles")

# ---------- Reporte ----------
ancho = max(len(r[1]) for r in resultados)
for estado, prueba, detalle in resultados:
    print(f"[{estado}] {prueba.ljust(ancho)}  {detalle}")
fallas = sum(1 for r in resultados if r[0] == "FALLA")
avisos = sum(1 for r in resultados if r[0] == "AVISO")
print(f"\n{len(resultados)} pruebas · {fallas} fallas · {avisos} avisos")
sys.exit(1 if fallas else 0)
