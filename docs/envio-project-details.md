# Project Details (campo del envío, en inglés)

**What it does and how it works**
Milpa Clara is a web page, in Spanish, for rainfed maize farmers in Amealco de Bonfil, Querétaro (2,600 m). It takes them through their area zone by zone. For each crop (maize, beans, oats) and activity (sowing, fertilizing, harvest) it shows a recommended date, a window of good days, a confidence level and a one-line reason with its source. For example, maize sowing is recommended on June 6, with a window from May 21 to June 15: in 15 of 23 seasons, that is when the rains became established. A "How it was calculated" section compares our models openly. A prototype app adds this season's rainfall and drought status, a 23-year replay ("what would you have planted in 2020?") and a ranking of crop options based on what the farmer values most: saving water, earning more, lowering risk or caring for the soil.

All numbers are precomputed into JSON files with their source and query date. The site never calls NASA services live, so it works on a weak connection. When a value is missing, the page says "no data" instead of guessing.

**Data and validation**
- NASA POWER daily rainfall, temperature, radiation, humidity and reference evapotranspiration (2000–2026).
- MODIS MOD13A1 NDVI, with a cropland mask from MCD12Q1 land cover.
- SRTM elevation.
- HLS imagery through NASA GIBS and CMR.
- Municipal harvest records (SIAP), the drought monitor (CONAGUA), soil data (SoilGrids) and FAO-56 crop coefficients.

We checked the satellite data against real harvests. All six of the worst maize years in 2003–2025 fell in seasons that NASA POWER measured as drier than the median (Fisher's exact test, p = 0.0046).

**Machine learning, honestly reported**
We trained an LSTM (2 layers, 64 units, 5 seeds) to forecast late-season NDVI from April–July inputs. The data was split by years: training 2001–2017, validation 2018–2020, test 2021–2025. We compared it with the per-pixel historical average, Ridge regression, Random Forest and a GRU. The historical average won on validation, and the LSTM did not beat it on the test years (skill −0.02). The page states this, and the calendar uses the simpler, validated method.

**Benefits and intended impact**
Sowing is the farmer's biggest yearly bet. In 2019 and 2020, Amealco lost 33% and 39% of its planted maize. Milpa Clara turns 23 years of satellite records into a decision a farmer can check: when to plant, how sure we are and why. It supports the farmer's own judgment; it does not replace it.

**Creativity**
- We test every recommendation against what actually happened. A tempting rule, "switch to oats if the rains are late," lost MXN $4,048 per hectare over 2003–2025 compared with always planting maize, so we removed it.
- Negative results stay visible.
- Every number carries its source, its resolution (30 m, 250 m, ~55 km or municipality) and its confidence.

**Tools**
- Website: HTML, CSS and vanilla JavaScript, as a static site with no login.
- Data scripts: Python.
- Models: Google Colab with PyTorch, exported to ONNX.
- Collaboration: Git and GitHub.
- AI assistance: Claude Code (see "Use of AI").

**Factors we considered**
- **Scale:** rainfall is a ~55 km grid cell, so we talk about the zone, not the plot.
- **Questionable records:** the SIAP reports no losses in the dry years 2022–2023.
- **Climate trend:** maximum temperature has risen +0.53 °C per decade, and there is early frost risk.
- **Connectivity:** rural internet is weak, so the page works without live calls.
- **Phones:** it is designed for mobile screens.
- **Privacy:** there is no login and no personal data.
- **The farmer decides:** the page gives information; the decision stays with the farmer.
