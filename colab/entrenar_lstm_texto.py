"""LSTM que escribe las frases de Amealquito (Milpa Clara).

Aprende, palabra por palabra, a escribir frases de un tema (agua, fechas, suelo...) a partir del
corpus colab/corpus_amealquito.json. Las frases llevan marcas como <MM> o <FECHA> en lugar de números:
la LSTM nunca escribe un número; el sitio llena las marcas con datos de data/processed.

Uso (en Colab o local):  python entrenar_lstm_texto.py corpus_amealquito.json modelo_texto.json
El JSON de salida lo usa api/_lstm_texto.js (copiarlo como api/_modelo_texto.json).
"""
import json, re, sys, random
import torch, torch.nn as nn

TOKEN = re.compile(r"<[A-Z_0-9]+>|[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+|[^\sA-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]")
MARCA = re.compile(r"<[A-Z_0-9]+>")
EQUIV = {"<ACT_MAYUS>": "<ACT>"}  # misma información, distinta mayúscula


def marcas(frase):
    return sorted(EQUIV.get(m, m) for m in MARCA.findall(frase))


def main(ruta_corpus, ruta_salida, epocas=400, semilla=0):
    random.seed(semilla); torch.manual_seed(semilla)
    corpus = json.load(open(ruta_corpus, encoding="utf-8"))["temas"]
    requeridas = {}
    for tema, frases in corpus.items():
        base = marcas(frases[0])
        for f in frases:
            assert marcas(f) == base, f"El tema {tema} tiene frases con marcas distintas: {f}"
        requeridas[tema] = base

    secuencias = [[f"<T:{t}>"] + TOKEN.findall(f) + ["<FIN>"] for t, fs in corpus.items() for f in fs]
    vocab = ["<PAD>"] + sorted({w for s in secuencias for w in s})
    idx = {w: i for i, w in enumerate(vocab)}
    largo = max(len(s) for s in secuencias)
    datos = torch.zeros((len(secuencias), largo), dtype=torch.long)
    for i, s in enumerate(secuencias):
        datos[i, :len(s)] = torch.tensor([idx[w] for w in s])
    print(f"frases: {len(secuencias)} · vocabulario: {len(vocab)} · largo máximo: {largo}")

    E, H = 48, 128

    class Red(nn.Module):
        def __init__(self):
            super().__init__()
            self.emb = nn.Embedding(len(vocab), E, padding_idx=0)
            self.lstm = nn.LSTM(E, H, batch_first=True)
            self.sal = nn.Linear(H, len(vocab))

        def forward(self, x):
            h, _ = self.lstm(self.emb(x))
            return self.sal(h)

    red = Red()
    opt = torch.optim.Adam(red.parameters(), lr=3e-3)
    perdida = nn.CrossEntropyLoss(ignore_index=0)
    for ep in range(epocas):
        red.train(); opt.zero_grad()
        sal = red(datos[:, :-1])
        loss = perdida(sal.reshape(-1, len(vocab)), datos[:, 1:].reshape(-1))
        loss.backward(); nn.utils.clip_grad_norm_(red.parameters(), 1.0); opt.step()
        if ep % 50 == 0 or ep == epocas - 1:
            print(f"época {ep:3d} · pérdida {loss.item():.3f}")

    r = lambda t: [[round(v, 4) for v in fila] for fila in t.detach().tolist()]
    sd = red.state_dict()
    modelo = {
        "fuente": "LSTM de texto entrenada con colab/corpus_amealquito.json (colab/entrenar_lstm_texto.py)",
        "ejemplo": False,
        "arquitectura": {"celda": "lstm", "capas": 1, "embedding": E, "oculto": H, "orden_compuertas": "i,f,g,o (PyTorch)"},
        "vocab": vocab, "E": E, "H": H,
        "emb": r(sd["emb.weight"]),
        "w_ih": r(sd["lstm.weight_ih_l0"]), "w_hh": r(sd["lstm.weight_hh_l0"]),
        "b": [round(v, 4) for v in (sd["lstm.bias_ih_l0"] + sd["lstm.bias_hh_l0"]).tolist()],
        "w_out": r(sd["sal.weight"]), "b_out": [round(v, 4) for v in sd["sal.bias"].tolist()],
        "marcas_requeridas": requeridas,
        "plantillas": {t: fs[0] for t, fs in corpus.items()},
        "equivalencias": EQUIV,
    }
    json.dump(modelo, open(ruta_salida, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    # Muestra: lo que escribe la red para cada tema (temperatura 0.7)
    red.eval()
    with torch.no_grad():
        for tema in list(corpus)[:8]:
            sec = [idx[f"<T:{tema}>"]]
            for _ in range(60):
                p = torch.softmax(red(torch.tensor([sec]))[0, -1] / 0.7, 0)
                w = int(torch.multinomial(p, 1))
                if vocab[w] == "<FIN>":
                    break
                sec.append(w)
            print(f"[{tema}]", " ".join(vocab[i] for i in sec[1:]))
    print("Guardado:", ruta_salida)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
