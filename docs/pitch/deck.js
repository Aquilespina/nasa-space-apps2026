const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const path = require("path");
const fs = require("fs");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const MEDIA = path.join(__dirname, "media");
const img = (n) => "image/png;base64," + fs.readFileSync(path.join(MEDIA, n)).toString("base64");
const OUT = process.argv[2];
const LANG = process.argv[3] || "en";

const TXT = {
  en: {
    footer: "Milpa Clara · NASA Space Apps 2026",
    k1: "NASA SPACE APPS 2026 · FIELD SHIFT · MEXICO CITY",
    tag: "The rain changed. The calendar didn't.",
    team: "Ángel & Aquiles",
    guide: "Amealquito, your plot guide",
    n1: "Every rainfed farmer makes one bet a year: the planting date. This is the story of one of them, and of the guide we built for him.",
    k2: "MEET DON ROBERTO",
    t2: "He inherited a calendar that no longer works",
    chips: ["3rd generation", "Rainfed plot", "The rain comes later"],
    comp: "Don Roberto represents the farmers we designed for.",
    n2: "Don Roberto, 48. His grandfather planted this plot, then his father, now him. He learned the dates by heart. But lately the rain comes later and the soil dries faster. His knowledge is real; the climate under it moved.",
    k3: "THE BET",
    t3: "If you planted tomorrow, would the rain come?",
    early: ["Too early", "The seed is lost"],
    late: ["Too late", "The frost wins"],
    stat3: "72%", stat3l: "of Mexico's farmland lives on rain alone",
    src3: "Source: INEGI, Encuesta Nacional Agropecuaria 2025.",
    gap: "NASA has measured his rain for decades. Nobody turned it into a date.",
    n3: "Ask the room: if you planted tomorrow, would you bet your seed? That's Don Roberto's bet every year. And 72% of Mexico's farmland makes the same bet. The data to help him exists: NASA measures daily rain everywhere. But it arrives as numbers, not as an answer.",
    k4: "THE GUIDE",
    t4: "Meet Amealquito",
    steps: ["What do you grow?", "Where is your plot?", "What NASA sees", "What you see"],
    n4: "Amealquito asks nine short questions, one per screen, in Spanish: what he grows, where his plot is (any of Mexico's 2,478 municipalities, or GPS), shows what NASA sees there, and asks what he sees when he walks his land. His observation is his, not a measurement, and the app says so.",
    k5: "HOW HIS SEASON CHANGED",
    t5: "Same land, now with the sky's memory",
    before: "Before", after: "With Milpa Clara",
    bItems: ["Plants and hopes", "Only maize, tired soil", "Drought by surprise"],
    aItems: ["Knows his rain window", "3 paths: maize, beans, milpa", "Plan on WhatsApp"],
    big: "15 of 23", bigL: "years, the rain arrived between May 21 and June 15",
    bigS: "El Llano, Querétaro · NASA POWER, 2003–2025",
    n5: "His grandfather's knowledge isn't replaced; it's updated. In a zone like El Llano, Querétaro, the rain settled between May 21 and June 15 in 15 of the last 23 years. A window with its confidence, not a promise.",
    k6: "WHY MILPA CLARA",
    t6: "Why not just ask a generic AI chatbot?",
    colA: "Generic AI chatbot", colB: "Milpa Clara",
    rows: [["Source", "The whole internet", "NASA data for his zone"], ["Doesn't know?", "May invent a date", "\"I don't have that data\""], ["Language", "Technical", "Field words"], ["Access", "Accounts", "No login, WhatsApp"]],
    honest: "Our LSTM didn't beat the historical average. So we use the simple method, and we say so.",
    n6: "A generic chatbot will invent a planting date with confidence. Ask Amealquito is our own search over the app's data, no external AI: if it doesn't know, it says so. We hold ourselves to the same rule: our neural network didn't beat the historical average, so we tell the farmer.",
    k7: "THE DREAM",
    t7: "That no farmer ever plants blind again",
    tl: [["TODAY", "Real NASA windows for our first zones"], ["NEXT", "Field tests with farmers"], ["THE DREAM", "All 2,478 municipalities"]],
    cta: "Help us take it to the field.",
    n7: "Today it works for our first zones. Next, we test it with farmers and extension workers. The dream: every rainfed farmer in Mexico gets his zone's window, in his words, on the phone he already has. Help us take it to the field.",
    q: ["NASA brings the satellites.", "The farmer knows the land.", "Milpa Clara brings them together."],
    n8: "Don Roberto still decides. Now he decides with the sky's memory in his pocket. Thank you.",
  },
  es: {
    footer: "Milpa Clara · NASA Space Apps 2026",
    k1: "NASA SPACE APPS 2026 · FIELD SHIFT · CIUDAD DE MÉXICO",
    tag: "La lluvia cambió. El calendario no.",
    team: "Ángel y Aquiles",
    guide: "Amealquito, tu guía de parcela",
    n1: "Cada agricultor de temporal hace una apuesta al año: la fecha de siembra. Esta es la historia de uno de ellos y del guía que construimos para él.",
    k2: "CONOZCAN A DON ROBERTO",
    t2: "Heredó un calendario que ya no funciona",
    chips: ["Tercera generación", "Siembra de temporal", "La lluvia llega tarde"],
    comp: "Don Roberto representa a los agricultores para quienes diseñamos.",
    n2: "Don Roberto, 48 años. Su abuelo sembró esta parcela, luego su padre, ahora él. Se sabe las fechas de memoria. Pero últimamente la lluvia llega más tarde y la tierra se seca más rápido. Su saber es real; el clima debajo de él se movió.",
    k3: "LA APUESTA",
    t3: "Si sembraras mañana, ¿llegaría la lluvia?",
    early: ["Muy pronto", "Se pierde la semilla"],
    late: ["Muy tarde", "Gana la helada"],
    stat3: "72%", stat3l: "del campo en México depende solo de la lluvia",
    src3: "Fuente: INEGI, Encuesta Nacional Agropecuaria 2025.",
    gap: "La NASA mide su lluvia desde hace décadas. Nadie la convirtió en una fecha.",
    n3: "Pregunten al público: si sembraran mañana, ¿apostarían su semilla? Esa es la apuesta de Don Roberto cada año, y la del 72 % del campo mexicano. El dato para ayudarlo existe: la NASA mide la lluvia diaria en todas partes. Pero llega como números, no como respuesta.",
    k4: "EL GUÍA",
    t4: "Conozcan a Amealquito",
    steps: ["¿Qué cultivas?", "¿Dónde siembras?", "Lo que ve la NASA", "Lo que tú ves"],
    n4: "Amealquito hace nueve preguntas cortas, una por pantalla: qué siembra, dónde está su parcela (cualquiera de los 2,478 municipios de México, o GPS), le muestra lo que ve la NASA ahí y le pregunta qué nota al caminar su tierra. Eso es lo que él observa, no una medición, y la app lo dice.",
    k5: "CÓMO CAMBIÓ SU TEMPORADA",
    t5: "La misma tierra, ahora con la memoria del cielo",
    before: "Antes", after: "Con Milpa Clara",
    bItems: ["Siembra y espera", "Solo maíz, tierra cansada", "La sequía lo sorprende"],
    aItems: ["Conoce su ventana de lluvia", "3 caminos: maíz, frijol, milpa", "Su plan en WhatsApp"],
    big: "15 de 23", bigL: "años la lluvia llegó entre el 21 de mayo y el 15 de junio",
    bigS: "El Llano, Querétaro · NASA POWER, 2003–2025",
    n5: "El saber de su abuelo no se reemplaza, se actualiza. En una zona como El Llano, Querétaro, la lluvia se estableció entre el 21 de mayo y el 15 de junio en 15 de los últimos 23 años. Una ventana con su confianza, no una promesa.",
    k6: "POR QUÉ MILPA CLARA",
    t6: "¿Por qué no preguntarle a una IA cualquiera?",
    colA: "IA genérica", colB: "Milpa Clara",
    rows: [["Fuente", "Todo internet", "Datos NASA de su zona"], ["¿No sabe?", "Puede inventar una fecha", "\"No tengo ese dato\""], ["Lenguaje", "Técnico", "Palabras de campo"], ["Acceso", "Cuentas", "Sin registro, WhatsApp"]],
    honest: "Nuestra red LSTM no superó al promedio histórico. Por eso usamos el método simple, y lo decimos.",
    n6: "Una IA genérica inventa una fecha de siembra con toda seguridad. Pregúntale a Amealquito es nuestra propia búsqueda sobre los datos de la app, sin IA externa: si no sabe, lo dice. Y nos aplicamos la misma regla: nuestra red neuronal no superó al promedio histórico, y se lo decimos al agricultor.",
    k7: "EL SUEÑO",
    t7: "Que ningún agricultor vuelva a sembrar a ciegas",
    tl: [["HOY", "Ventanas NASA reales en nuestras primeras zonas"], ["MAÑANA", "Pruebas en campo con agricultores"], ["EL SUEÑO", "Los 2,478 municipios"]],
    cta: "Ayúdennos a llevarlo al campo.",
    n7: "Hoy funciona en nuestras primeras zonas. Después, la probamos con agricultores y técnicos. El sueño: que cada agricultor de temporal en México tenga la ventana de su zona, en sus palabras, en el celular que ya tiene. Ayúdennos a llevarlo al campo.",
    q: ["La NASA pone los satélites.", "El agricultor conoce su tierra.", "Milpa Clara une los dos."],
    n8: "Don Roberto sigue decidiendo. Ahora decide con la memoria del cielo en el bolsillo. Gracias.",
  },
}[LANG];

const THEME = {
  name: "Milpa Clara",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "17251E", lt1: "FFFFFF", dk2: "0B4F3A", lt2: "EAF6EF",
    accent1: "0E7A55", accent2: "D99A1B", accent3: "7A4E2D",
    accent4: "B5432F", accent5: "5B6B63", accent6: "BFE5D0",
    hlink: "0E7A55", folHlink: "7A4E2D",
  },
};
const H = THEME.colors;

async function icon(Comp, color, size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Milpa Clara – Pitch";
  pres.lang = LANG === "es" ? "es-MX" : "en-US";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  for (const [name, bg, fc] of [["DARK", H.dk2, H.accent6], ["LIGHT", H.lt1, H.accent5]]) {
    pres.defineSlideMaster({
      title: name, background: { color: bg },
      objects: [{ text: { text: TXT.footer, options: { x: 0.5, y: 5.22, w: 5, h: 0.25, fontSize: 10, color: fc, margin: 0 } } }],
      slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.25, fontSize: 10, color: fc, align: "right" },
    });
  }

  const kicker = (s, t, dark) => s.addText(t, { x: 0.5, y: 0.35, w: 9, h: 0.3, fontSize: 11, bold: true, charSpacing: 3, color: dark ? C.accent2 : C.accent1, margin: 0, isTextBox: true });
  const title = (s, t, dark) => s.addText(t, { x: 0.5, y: 0.65, w: 9, h: 0.8, fontFace: THEME.headFontFace, fontSize: 28, bold: true, color: dark ? C.background1 : C.text2, margin: 0, valign: "top", isTextBox: true });
  const shadow = () => ({ type: "outer", color: "17251E", opacity: 0.12, blur: 8, offset: 2, angle: 90 });
  const T = (s, text, o) => s.addText(text, Object.assign({ margin: 0, isTextBox: true }, o));

  const I = {
    seed: await icon(fa.FaSeedling, "FFFFFF"),
    cloud: await icon(fa.FaCloudRain, "FFFFFF"),
    home: await icon(fa.FaHome, "FFFFFF"),
    snow: await icon(fa.FaSnowflake, "FFFFFF"),
    sun: await icon(fa.FaSun, "FFFFFF"),
    sat: await icon(fa.FaSatellite, "FFFFFF"),
    check: await icon(fa.FaCheck, "FFFFFF"),
    x: await icon(fa.FaTimes, "FFFFFF"),
  };
  const badge = (s, ic, x, y, d, fill) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
    s.addImage({ data: ic, x: x + d * 0.27, y: y + d * 0.27, w: d * 0.46, h: d * 0.46 });
  };
  const phone = (s, file, x, y, h) => {
    const w = h * 392 / 636;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.06, y: y - 0.06, w: w + 0.12, h: h + 0.12, rectRadius: 0.12, fill: { color: H.lt1 }, line: { color: "D5DDD8", width: 0.75 }, shadow: shadow() });
    s.addImage({ data: img(file), x, y, w, h });
  };
  const mascot = (s, x, y, w) => {
    const h = w * 0.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.25, fill: { color: H.lt1 }, line: { type: "none" } });
    const iw = w * 0.86, ih = iw * 96 / 125;
    s.addImage({ data: img("image2.png"), x: x + (w - iw) / 2, y: y + (h - ih) / 2 + 0.1, w: iw, h: ih });
  };

  // 1 — Title
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "DARK", sectionTitle: "Opening" });
  kicker(s, TXT.k1, true);
  T(s, "Milpa Clara", { x: 0.5, y: 1.5, w: 6, h: 1.0, fontFace: THEME.headFontFace, fontSize: 54, bold: true, color: C.background1 });
  T(s, TXT.tag, { x: 0.5, y: 2.6, w: 6, h: 0.5, fontSize: 24, italic: true, color: C.accent2 });
  T(s, TXT.team, { x: 0.5, y: 3.9, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.background1 });
  mascot(s, 6.55, 1.0, 3.0);
  T(s, TXT.guide, { x: 6.3, y: 4.0, w: 3.5, h: 0.3, fontSize: 12, color: C.accent6, align: "center" });
  s.addNotes(TXT.n1);

  // 2 — Don Roberto
  pres.addSection({ title: "Story" });
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Story" });
  kicker(s, TXT.k2);
  title(s, TXT.t2);
  [[I.home, H.accent1], [I.seed, H.accent3], [I.cloud, H.accent2]].forEach(([ic, col], i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.9, w: 2.8, h: 2.3, rectRadius: 0.12, fill: { color: H.lt2 }, line: { type: "none" } });
    badge(s, ic, x + 0.9, 2.2, 1.0, col);
    T(s, TXT.chips[i], { x: x + 0.15, y: 3.4, w: 2.5, h: 0.5, fontSize: 18, bold: true, color: C.text2, align: "center", valign: "middle" });
  });
  T(s, TXT.comp, { x: 0.5, y: 4.6, w: 9, h: 0.3, fontSize: 11, italic: true, color: C.accent5 });
  s.addNotes(TXT.n2);

  // 3 — The bet
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Story" });
  kicker(s, TXT.k3);
  title(s, TXT.t3);
  [[I.sun, H.accent4, TXT.early], [I.snow, "4A7FA6", TXT.late]].forEach(([ic, col, [h, t]], i) => {
    const y = 1.65 + i * 1.2;
    badge(s, ic, 0.5, y, 0.85, col);
    T(s, h, { x: 1.55, y: y + 0.02, w: 3.6, h: 0.42, fontSize: 20, bold: true, color: C.text2 });
    T(s, t, { x: 1.55, y: y + 0.44, w: 3.6, h: 0.38, fontSize: 16, color: C.text1 });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.7, y: 1.6, w: 3.8, h: 2.1, rectRadius: 0.12, fill: { color: H.dk2 }, line: { type: "none" } });
  T(s, TXT.stat3, { x: 5.95, y: 1.75, w: 3.3, h: 1.0, fontFace: THEME.headFontFace, fontSize: 54, bold: true, color: C.accent2 });
  T(s, TXT.stat3l, { x: 5.95, y: 2.8, w: 3.3, h: 0.7, fontSize: 15, color: C.background1, valign: "top" });
  T(s, TXT.src3, { x: 5.7, y: 3.8, w: 3.8, h: 0.25, fontSize: 9, color: C.accent5 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.25, w: 9, h: 0.75, rectRadius: 0.1, fill: { color: H.lt2 }, line: { type: "none" } });
  s.addImage({ data: await icon(fa.FaSatellite, H.accent1), x: 0.75, y: 4.43, w: 0.4, h: 0.4 });
  T(s, TXT.gap, { x: 1.35, y: 4.3, w: 8.0, h: 0.65, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
  s.addNotes(TXT.n3);

  // 4 — Amealquito
  pres.addSection({ title: "Solution" });
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Solution" });
  kicker(s, TXT.k4);
  title(s, TXT.t4);
  ["image5.png", "image1.png", "image4.png", "image3.png"].forEach((f, i) => {
    const x = 0.75 + i * 2.25;
    phone(s, f, x, 1.45, 2.85);
    s.addShape(pres.shapes.OVAL, { x: x - 0.1, y: 4.5, w: 0.36, h: 0.36, fill: { color: H.accent1 }, line: { type: "none" } });
    T(s, String(i + 1), { x: x - 0.1, y: 4.5, w: 0.36, h: 0.36, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle" });
    T(s, TXT.steps[i], { x: x + 0.33, y: 4.44, w: 1.85, h: 0.48, fontSize: 12, bold: true, color: C.text2, valign: "middle" });
  });
  mascot(s, 8.55, 0.3, 0.95);
  s.addNotes(TXT.n4);

  // 5 — Before / after
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Solution" });
  kicker(s, TXT.k5);
  title(s, TXT.t5);
  const col = (x, head, ic, fill, items, bg) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.55, w: 3.0, h: 3.35, rectRadius: 0.1, fill: { color: bg }, line: { type: "none" } });
    badge(s, ic, x + 0.25, 1.75, 0.45, fill);
    T(s, head, { x: x + 0.85, y: 1.75, w: 2.0, h: 0.45, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
    T(s, items.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1 } })), { x: x + 0.25, y: 2.5, w: 2.6, h: 2.2, fontSize: 15, color: C.text1, paraSpaceAfter: 12, valign: "top" });
  };
  col(0.5, TXT.before, I.x, H.accent4, TXT.bItems, "F6F2EE");
  col(3.65, TXT.after, I.check, H.accent1, TXT.aItems, H.lt2);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.55, w: 2.7, h: 3.35, rectRadius: 0.1, fill: { color: H.dk2 }, line: { type: "none" } });
  T(s, TXT.big, { x: 6.95, y: 1.8, w: 2.4, h: 0.7, fontFace: THEME.headFontFace, fontSize: 36, bold: true, color: C.accent2 });
  T(s, TXT.bigL, { x: 6.95, y: 2.55, w: 2.4, h: 1.2, fontSize: 15, color: C.background1, valign: "top" });
  T(s, TXT.bigS, { x: 6.95, y: 4.15, w: 2.4, h: 0.6, fontSize: 10, color: C.accent6, valign: "top" });
  s.addNotes(TXT.n5);

  // 6 — Why not a generic AI
  pres.addSection({ title: "Why us" });
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Why us" });
  kicker(s, TXT.k6);
  title(s, TXT.t6);
  const hdr = (t, fill, color) => ({ text: t, options: { bold: true, color, fill: { color: fill } } });
  const tbl = [[hdr("", H.lt1, C.text1), hdr(TXT.colA, "F6F2EE", C.accent4), hdr(TXT.colB, H.lt2, C.accent1)]];
  TXT.rows.forEach(([a, b, c]) => tbl.push([
    { text: a, options: { bold: true, color: C.text2 } },
    { text: b, options: { color: C.text1, fill: { color: "FBF9F7" } } },
    { text: c, options: { color: C.text1, fill: { color: "F4FBF7" } } },
  ]));
  s.addTable(tbl, { x: 0.5, y: 1.5, w: 6.5, colW: [1.5, 2.3, 2.7], fontSize: 14, fontFace: THEME.bodyFontFace, border: { type: "solid", pt: 0.5, color: "DCE3DE" }, valign: "middle", margin: 0.08, rowH: 0.48 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.15, w: 6.5, h: 0.8, rectRadius: 0.1, fill: { color: H.dk2 }, line: { type: "none" } });
  T(s, TXT.honest, { x: 0.7, y: 4.2, w: 6.1, h: 0.7, fontSize: 13, italic: true, color: C.background1, valign: "middle" });
  phone(s, "image6.png", 7.45, 1.5, 3.4);
  s.addNotes(TXT.n6);

  // 7 — Dream + call to action
  pres.addSection({ title: "Close" });
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Close" });
  kicker(s, TXT.k7, true);
  title(s, TXT.t7, true);
  s.addShape(pres.shapes.LINE, { x: 0.83, y: 2.2, w: 6.2, h: 0, line: { color: H.accent6, width: 1.5 } });
  TXT.tl.forEach(([h, t], i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 2.02, w: 0.36, h: 0.36, fill: { color: i === 2 ? H.accent2 : H.accent6 }, line: { color: H.dk2, width: 3 } });
    T(s, h, { x, y: 2.6, w: 2.8, h: 0.35, fontSize: 14, bold: true, charSpacing: 2, color: i === 2 ? C.accent2 : C.accent6 });
    T(s, t, { x, y: 3.0, w: 2.8, h: 0.8, fontSize: 17, color: C.background1, valign: "top" });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.15, w: 4.6, h: 0.6, rectRadius: 0.3, fill: { color: H.accent2 }, line: { type: "none" } });
  T(s, TXT.cta, { x: 0.5, y: 4.15, w: 4.6, h: 0.6, fontSize: 16, bold: true, color: C.text1, align: "center", valign: "middle" });
  s.addNotes(TXT.n7);

  // 8 — Closing phrase
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Close" });
  mascot(s, 0.6, 1.3, 2.7);
  T(s, [
    { text: TXT.q[0], options: { breakLine: true } },
    { text: TXT.q[1], options: { breakLine: true } },
    { text: TXT.q[2], options: { color: C.accent2 } },
  ], { x: 3.6, y: 1.3, w: 6.0, h: 2.6, fontFace: THEME.headFontFace, fontSize: 28, bold: true, color: C.background1, valign: "middle", paraSpaceAfter: 6 });
  s.addNotes(TXT.n8);

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
