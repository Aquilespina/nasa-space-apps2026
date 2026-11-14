# Summary (campo del envío, en inglés)

Milpa Clara is a mobile-friendly web page that helps rainfed maize farmers in Amealco de Bonfil, Querétaro, Mexico, decide when to sow and harvest. In dry years, Amealco has lost over a third of its planted maize (2020), and planting too early or too late is a costly gamble.

We combined 23 seasons (2003–2025) of NASA POWER rainfall and temperature, MODIS vegetation index (NDVI), and HLS imagery with local harvest records (SIAP), drought monitoring (CONAGUA), soil data, and FAO-56 crop water needs. The page walks through each zone and shows, for every activity, a recommended date, a planting window, a confidence level, and a plain-language reason. Example: rains became established between May 21 and June 15 in 15 of 23 years, and every one of the six worst maize years fell in a season NASA measured as drier than the median.

We also trained an LSTM to forecast NDVI. It did not beat the historical average, so the page says so and uses the simpler method. When data is missing, it shows "no data" instead of guessing.

The tool supports the farmer's decision, not replaces it.
