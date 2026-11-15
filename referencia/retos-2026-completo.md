# Retos 2026: texto completo

Fuente: API pública de spaceappschallenge.org (consultado 2026-11-07). La pestaña Resources de los 14 retos dice: "Resources will be available on Friday, November 13."

## Field Shift: Adapting Farms with NASA Data

Slug: `adapting-farms-with-nasa-data`

Farmers around the world navigate shifting temperatures, changing rainfall patterns, water shortages, extreme weather, and declining soil health. These pressures make it difficult to choose crop rotations that protect fields, conserve water, and support long‑term resilience. Your challenge is to create a decision‑support tool that uses NASA Earth observations along with local soil information, crop characteristics, and farmer priorities to help farmers explore rotation strategies that could strengthen soil health and adapt their farms to changing conditions.

### Background
Farmers face increasingly complex decisions as temperatures shift, rainfall becomes less predictable, and soil health declines across many regions. Water shortages, erosion, nutrient depletion, and extreme weather events add further uncertainty. Selecting new crops to add to a rotation can be difficult, because a crop that improves soil health in one place may consume too much water, introduce disease, conflict with local markets, or fall outside expected growing seasons somewhere else.

This challenge is inspired in part by multigenerational farming experience — many families have lived through seasons where better tools for tracking changing conditions could have helped identify healthier, more resilient rotation choices. Today, NASA’s long‑term environmental datasets offer new ways to understand local growing conditions, and SI techniques open opportunities to translate that data into practical, farmer‑friendly insights.

### Objectives
You may consider combining NASA Earth observations with local agricultural information to create an app, model, interactive map, or other decision‑support tool. The goal is to help farmers explore crop‑rotation options that may improve soil health and strengthen resilience to changing weather and water conditions.

You may explore NASA datasets such as SMAP, ECOSTRESS, GPM, Landsat, MODIS, NASA POWER, GRACE and GRACE‑FO, and SRTM or other NASA elevation products. Using these datasets, you may analyze patterns in temperature, heat stress, rainfall, soil moisture, evaporation, frost risk, extreme precipitation, vegetation stress, and long‑term water trends. You may also consider local soil information, crop characteristics, and farmer priorities—such as water use, forage value, nitrogen‑fixing potential, erosion reduction, organic matter improvement, or market suitability.

Your tool may highlight times when fields are typically bare, seasons when current crops appear more vulnerable, or opportunities for rotations that could interrupt pest cycles, reduce water demand, improve infiltration, or add supplemental income. You may compare at least three rotation strategies, including the existing rotation. For each strategy, you may explain why it was suggested, what evidence supports it, what benefits it may offer, where information gaps exist, and any risks that would need local review by farmers or agricultural experts.

The intended outcome is a supportive tool — one that helps identify patterns and possibilities, but does not replace farmer judgment or local agricultural expertise.

### Potential Considerations
You may (but are not required to) consider the following:

Understanding Conditions & Data

- Explore how changes in temperature, soil moisture, rainfall, evaporation, and vegetation stress relate to crop vulnerability and soil health.
- Consider explaining scientific terms such as evapotranspiration, soil moisture anomalies, vegetation indices (e.g., NDVI), frost risk, and water‑balance indicators.
- Clarify how satellite observations differ from ground‑based measurements, and how combining both may improve accuracy.SI, Modeling, and Data Fusion

- You may compare different SI or statistical approaches for identifying patterns in historical climate and soil conditions.
- Consider how SI could highlight seasonal transitions, bare‑field periods, or times when current crops show increased stress.
- Explain how the model interprets uncertainty and where local expertise would be needed to validate results.
- You may consider harmonizing datasets with different spatial and temporal resolutions by downsampling, aggregating, or resampling them to a common analysis grid. Harmonizing resolution can help the SI combine SMAP soil moisture, ECOSTRESS land‑surface temperature, GPM precipitation, Landsat/MODIS vegetation indices, GEDI biomass, and soil datasets into coherent features that support clear, explainable rotation‑strategy comparisons.Rotation Strategy Exploration

- Compare rotation scenarios by examining nutrient cycling, erosion risk, organic matter contributions, pest‑cycle disruption, water use, forage potential, or market considerations.
- You may consider mapping which rotation ideas best align with farmer priorities—such as conserving water, generating supplemental income, or improving soil structure.
- Include brief explanations of how nitrogen‑fixing crops, cover crops, deep‑rooting crops, or drought‑tolerant crops contribute to long‑term soil health.Geospatial Mapping & Visualization

- Consider whether interactive maps could help users explore trends over time such as long‑term soil moisture, heat waves, or water‑storage declines.
- Explore ways to visualize field‑level vulnerabilities (e.g., zones of erosion risk, water stress hotspots, frost‑prone areas).
- You may include optional add‑ons such as timelines, overlays comparing datasets, or scenario sliders that adjust rainfall or temperature patterns.Farmer‑Centered Design

- Consider how to make the tool easily interpretable for farmers who may have limited technical or geospatial experience.
- Think about ways to allow farmers to input their own priorities or constraints, such as water availability, equipment limitations, or market preferences.
- Share reminders that the tool is intended to support—not replace—local expertise, and highlight where human judgment is particularly important.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Dancing with the SARs

Slug: `dancing-with-the-sars`

Earth's surface is an endless dance of natural processes and human activities, but these changes are often difficult to visualize, understand, and communicate. From wetland loss to forest wildfires, earthquakes, farming activities, glacier movement, and more, Earth is in a constant waltz of surface changes. Your challenge is to build an interactive application that uses radar remote sensing data from the NASA-ISRO Synthetic Aperture Radar (NISAR) mission to track and visualize one or more types of surface change at locations around the world.

### Background
Earth remote sensing helps us acquire information from a bird’s eye view. Space-borne and airborne instruments image the planet and contribute to Earth observations that help decision makers in lieu of or supplement their field surveys. The most common source of energy that these instruments use is from the Sun, which reflects from objects and surfaces on the ground back to the instrument. The amount of this energy varies by the wavelength within the electromagnetic spectrum, and we can use this spectral fingerprint to identify water, rocks/minerals, vegetation, etc. These instruments that utilize the Sun’s energy conduct passive remote sensing while radar instruments, such as those we’ll use in this challenge, conduct active remote sensing.

Active instruments emit and receive their own source of energy, and in the case of radar, operate in the microwave band of the electromagnetic spectrum. Radar instruments can be used to study forest structure, soil moisture, wetlands, ocean topography, sea ice, and more. In this challenge, we will download data from SAR (synthetic aperture radar) satellites. SAR “synthesizes” a long antenna by combining a sequence of acquisitions from its actual, shorter antenna to provide higher spatial resolution data. SAR instruments send out a pulse of energy which reacts with the Earth’s surface and is reflected back to the instrument. This collection can be done day or night and even in cloudy weather, which allows for critical data collection during disaster events like oil spills, wildfires, hurricanes, etc.

Radar data is most sensitive to two things: roughness and the dielectric constant. In other words, the radar images are more than just typical satellite images that you may see with your GPS app. This roughness information characterizes the backscatter from Earth’s surface and different polarizations and can tell us something about structure, geometry, and material properties. Since water has a high dielectric constant, SAR data also highlights water bodies, flood inundation, and soil moisture. SAR can also measure fine surface movement on the centimeter scale, such as for earthquakes and land subsidence.

### Objectives
On Earth's surface there is an endless dance of natural processes and human activities in constant motion, but these changes are often difficult to visualize, understand and communicate. Wetlands and floodplains are constantly extending and retracting; forest footprints are shrinking from deforestation and wildfires; agricultural lands transform their crop types and health, moisture is swelling and shrinking in soils; glaciers and sea ice are in a constant waltz; and land surfaces are deforming from earthquakes and coastal subsidence. All of these changes have important implications for ecosystems, water resources, agriculture and infrastructures, ultimately impacting local communities.

In this challenge, participants will build an interactive application that leverages radar remote sensing data from NISAR to track and visualize one or more types of surface changes, at locations around the world. Participants are encouraged to design intuitive tools and innovative visualizations, such as interactive change-detection maps, time-series animations, or dashboards, that make NISAR data accessible to a broad audience. The desired outcome is an open-source, user-friendly solution that translates complex radar observations into actionable insights, helping scientists, resource managers, educators, decision-makers, and the public better understand the patterns and rhythms of Earth’s surface at different time steps.

First, pick an interesting study area – this can be your hometown, a tropical wetland, ice sheet, forest wildfire, flooded neighborhood, volcano eruption, etc. - wherever the music calls you! Second, download freely available NISAR data using the list of resources provided. You may want to download supplemental data such as optical images or GIS (geographic information systems) layers to contextualize the SAR imagery. And lastly, present your findings in an interactive digital medium you prefer: a final report, video, presentation slides, story map - even an interpretive dance? Hypothesize the physical drivers behind what you see (or don’t see) in the SAR data. For example, if you are looking at the Amazon Rainforest, why might the vegetation change over time? Which polarizations highlight these changes on land and ice? What future applications of NISAR are possible?

### Potential Considerations
You may (but are not required to) consider the following:

- Analyze NISAR data with different polarizations and/or different frequencies (from other sensors). Download data from different dates to show a time series and ancillary datasets (population, vegetation type, etc.) to contextualize the study area.
- Show how human drivers (agriculture, industry, etc.) are impacting Earth’s natural resources.
- Focus on compelling storytelling through data visualizations. Your project summary can be in any digital medium you prefer: a final report, video, presentation slides, story map, etc.
- If you are familiar with your study area (e.g., it’s your hometown), you can provide personal context and stories for the SAR imagery.
- Consider making your summary interactive (e.g., image sliders, web maps, etc.).For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Be An Earth System Trend Detective!

Slug: `earth-system-trend-detective`

Change is always occurring in the Earth’s interconnected environmental system, and when it runs in a consistent direction – rising or falling, increasing or decreasing, thickening or thinning – measured variables reflect it. But a measured Earth science data variable can trend one way in one region and the opposite way in another, even when the same process drives both. The multitude of Earth science data variables makes it difficult to select variables that could indicate change, and to then perform an analysis on the selected variables. Your challenge is to create a tool that can select variables measured by Earth science missions or produced by Earth science models, visualize how they change over time, and determine what is changing, where it is changing, how much it is changing, and if these changes are what scientists call “significant.”

### Background
Instruments on satellites observe many different aspects of the Earth system: on land, in the atmosphere, and in the oceans. Global models also use satellite instrument data and other kinds of data to examine and analyze the Earth system. One important reason for doing this is to observe and characterize changes in the Earth system. Changes, especially those moving in a particular direction over time – a trend – indicate both the processes causing such changes and the processes that will respond to them.

One complicating factor in this work is the wide variety of variables that can be studied. Another is that changes in a particular variable can move in one direction in one region and in the opposite direction in another, even when both trends are caused by the same process! So there are two important parts to this problem: finding variables that are trending, from simple ones like temperature and rainfall to more complex ones like evaporation or streamflow; and analyzing trends in particular regions of the land, ocean, or even levels of the atmosphere.

Instruments such as the Moderate Resolution Imaging Spectroradiometer (MODIS), the Ozone Monitoring Instrument (OMI), the Atmospheric Infrared Sounder (AIRS), and the Global Precipitation Measurement (GPM) provide analyzable variables. Global models – notably the Modern Era Retrospective analysis for Research and Applications, Version 2 (MERRA-2) and the Global Land Data Assimilation System (GLDAS) – provide many more. Finding, analyzing, and relating significant trends to the processes causing them is one of the most important uses of NASA Earth science data.

### Objectives
A successful response to this challenge will bring together several important elements.

The first is to identify Earth science variables of interest that can be investigated for potential trends. As the Background notes, NASA and other space agencies offer numerous variables, some familiar and some more specialized for use by particular branches of science.

The second is to acquire the data variables for a particular region, since most trends in the data will not be global – though some trends can be!

The third is to generate and visualize a time series for the variable and region of interest over a long enough period of time to allow statistical analysis.

The final element of the challenge is to perform a basic statistical analysis of that time series, indicating the rate of change over time, and to test the trend’s significance using methods such as a t-test, the Mann-Kendall test, or confidence intervals.

Data sites offer tools that generate time series, and statistical analysis packages provide basic significance testing. A response that does both the visualization and the analysis meets the full scope of this challenge.

### Potential Considerations
You may (but are not required to) consider the following:

Audience

- This challenge involves science data and statistical analysis, so the likely audience is high school and college students, along with members of the public who have some scientific background.
- Providing simple definitions of the variables would help these users considerably.
- The concept is to help the users become data detectives – finding variables of interest, then determining whether those variables show a trend and whether that trend is significant.Approach

- Users could potentially respond to a short series of questions about what or where they would like to investigate, and then the answers to the questions would allow searching of related data variables. It would be highly useful to provide a couple of demonstration examples that the user could watch and would help them understand how the tool works.
- While not required, SI could be useful here to identify data with the potential to show trends in particular areas, drawing on either news articles and research papers or the characteristics of a region such as a desert, rain forest, tidal estuary, or the atmosphere above a large city.Working with the data

- Earth science data are available at several different temporal resolutions – hourly, 3-hourly, daily, and monthly. For this challenge, daily and monthly data are likely the easiest to process.
- Finding a trend is interesting even if it doesn’t reach the level of significance. Sometimes all a trend needs to become significant is a longer period for the data to be acquired.
- Consider looking for publicly available tools for plotting hydrological data offered by outside organizations like the Consortium of Universities for the Advancement of Hydrologic Science, Inc. (CUAHSI).Trend analysis with Earth science data can be complex. Trends can be non-linear, and some are not evident unless regular cycles, such as the seasonal cycle, are removed. More complex trend analyses are beyond the scope envisioned for this challenge; detecting and analyzing linear trends would be a great start.

For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data

Slug: `flame-in-freefall`

For decades, NASA has studied how flames and fire behave in microgravity, gathering a trove of experimental data along the way. That knowledge matters more than ever as humans gear up to return to the Moon and press on to Mars, yet the volume of results makes them hard to find, compare, and understand. Your challenge is to create an interactive, super intelligence (SI) powered dashboard that summarizes, ranks, and interprets those findings to deliver fire safety insights for human space exploration.

### Background
Fire hazards are extremely dangerous in space exploration! In describing a smoke alarm that went off during the recent Artemis II mission, the commander commented, “[If] you want to get somebody’s attention really quick, make the fire alarm go off in your spacecraft when you’re still about 80,000 miles from home.” Decades earlier, the Apollo 13 crew endured the life-threatening results of an oxygen tank explosion on their way to the Moon. Similarly, a multinational crew survived a fire aboard the Mir space station caused by an oxygen generator failure. In 1967, the Apollo 1 crew died in a pre-launch test when fire erupted in their oxygen-filled spacecraft.

Compared to Earth, flames in free fall (i.e., in microgravity) are often dramatically different because of the absence of buoyancy and thus rising hot gases. Instead of a flickering teardrop, a candle flame becomes a ghostly blue sphere reliant on diffusion for its oxygen.

NASA’s spacecraft fire safety work is focused on prevention, detection, and suppression. Prevention is achieved by controlling ignition sources and through material selection, which depends on understanding flammability limits. To facilitate spacesuit use, an atmosphere with increased oxygen and reduced pressure compared to Earth’s is expected within the planned Moon Base and pressurized rovers. Flammability is highly dependent on oxygen concentration, and air flow is also important in microgravity. Flammability studies focus on solid materials such as fabrics and plastics, as studied in the Burning and Suppression of Solids (BASS and BASS-II) and Spacecraft Fire Safety Demonstration (Saffire-I, -II, and -III) investigations.

Fire detection was tested in microgravity through the Smoke and Aerosol Measurement Experiment studies (SAME and SAME-R). Suppression was studied in the Flame Extinguishment Experiment (FLEX) through dilution of the chamber atmosphere with carbon dioxide and helium, both of which suppress fire.

### Objectives
Results from low-gravity combustion experiments, conducted for example on the International Space Station (ISS), are being made publicly available through NASA's Physical Science Informatics (PSI) database, but the amount of data can be overwhelming. It can be hard to find, harder to compare, and harder yet to interpret.

Your challenge is to build an SI-powered, web-based dashboard that summarizes, ranks, and interprets combustion science investigations to deliver critical foundational insights for fire safety. You may consider enabling users to:

- Identify investigations most relevant to the fire safety needs of habitable crew environments, including spacecraft, space stations, bases on the lunar and Martian surfaces, and pressurized rovers.*
- Extract data that supports predictive modeling of flammability and fire scenarios in space exploration.
- Highlight research that informs the development of next-generation fire safety controls and equipment.In this challenge, you’ll help turn complex data into clear answers and make the next giant leap a safer one.

Your dashboard could also address potential applications of the PSI data to fire safety on Earth. Fine-water-mist extinguishers developed for use on the ISS have practical applications here on Earth, and NASA technology has similarly led to improvements in terrestrial smoke detection and firefighter gear, including protective clothing and air tanks.

*Fire safety involving rockets and propellants is generally beyond the scope of the research available in the PSI database. The high velocities within rocket engines render the combustion effectively independent of gravity — although a rocket’s launch is of course strongly dependent on gravity.

### Potential Considerations
You may (but are not required to) consider the following:

- Your target audience can include professors, graduate students, undergraduate students, aerospace researchers, and aerospace engineers.
- Consider how you might summarize and display attributes such as:
- Experimental objectives
- Fuels, including shape and size of the samples or burners
- Other test conditions, such as oxygen concentration and airflow speed
- Variables: how did tests from the same investigation differ and how were they the same?
- Sensors or types of measurements
- Consider how to summarize and display similarities and differences between different investigations.
- Other investigations in PSI
- One of the instruments used for smoke detection in the SAME and SAME-R studies was instead used to detect dust in the Dust and Aerosol Measurement Feasibility Test (DAFT and DAFT-2) studies.
- While it burned gaseous fuels, the Burning Rate Emulator (BRE) experiment of the Advanced Combustion via Microgravity Experiments (ACME) project was a study of materials flammability in still atmospheres as a function of material properties.
- Other combustion investigations within the PSI database (but not explicitly referenced above) are still relevant to fire safety, just not as strongly or directly.
- Hardware
- The six experiments in the ACME project featured flames of gaseous fuels and were all conducted with the same modular set of ACME hardware in the Combustion Integrated Rack (CIR).
- FLEX, FLEX-2, and the Cool Flames Investigation (CFI) each featured burning droplets of liquid fuel and were conducted with the Multi-user Droplet Combustion Apparatus (MDCA) in the CIR.
- BASS, BASS-II, the Smoke Point In Co-flow Experiment (SPICE), and the Structure & Liftoff In Combustion Experiment (SLICE) collectively featured both solid and gaseous fuels. Each of these investigations was conducted within the Microgravity Science Glovebox (MSG) using the modular fan-driven flow duct built for SPICE.
- Spacesuits and oxygen concentration
- To enable flexibility, spacesuits are filled with 100% oxygen to only 4.3 psi (pounds per square inch), where the Earth’s pressure at sea level is 14.7 psi.
- To avoid the bends (decompression sickness), the astronauts pre-breathe 100% oxygen to expel absorbed nitrogen.
- To reduce the pre-breathing duration and thus facilitate lunar excursions, it is expected that the Moon Base and pressurized rover(s) will be at a pressure and oxygen concentration between those in a spacesuit and the Earth’s atmosphere.
- The intermediate oxygen concentration used on the Moon will likely be 30% or greater, with a corresponding pressure of 10.2 psi or less. Compared to Earth’s atmosphere, that’s more than a 40% increase in the oxygen concentration making materials much more flammable.
- Microgravity tests with the highest oxygen concentrations were conducted as part of the ACME’s Cool Flames Investigation with Gases (CFI-G). In those tests, the combustion chamber was filled with a mixture of nitrogen and a flammable gas (e.g., propane), while an oxygen-nitrogen mixture of up to 85% oxygen flowed from the spherical burner creating an inside-out flame.
- Partial-gravity data
- Although NASA is heavily focused on the return of astronauts to the Moon’s surface and the establishment of a Moon Base in preparation for the future human exploration of Mars, there is currently no partial-gravity combustion data available in PSI. We expect such data will be added in the future, for example from the Lunar-g Combustion Investigation (LUCI) and the Flammability of Materials on the Moon (FM2) experiment.
- Partial gravity was mimicked in ACME’s Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames) experiment through the effect of the electric field on the ions that naturally occur in flames.
- Microgravity and normal-gravity results could bound what occurs at intermediate gravity levels.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Create Health Monitoring Software for Astronauts on Space Missions

Slug: `health-monitoring-software`

Long-duration missions expose astronauts to space radiation, isolation and confinement, altered gravity, and a hostile closed environment, which can bring immune changes, bone loss, cardiovascular events, and behavioral health problems. On long missions, astronauts carry much of the responsibility for spotting these changes in themselves. Your challenge is to build a health monitoring software that gathers health indicators and enables astronauts to evaluate and act on the status of their health.

### Background
With rising investment in spacecraft technology and research, space missions have become more ambitious. NASA’s Artemis program recently accomplished a crewed lunar flyby, and NASA and others have plans to send humans to Mars in the future. With increasingly longer missions, astronauts will be more exposed to the hostile space environment, which brings both physical and mental health risks.

NASA’s Human Research Program has mapped the five hazards of human spaceflight, which are space radiation, isolation and confinement, distance from Earth, gravity fields, and hostile closed environments. These hazards can contribute to health problems such as immune system changes, bone density loss, cardiovascular events, inadequate nutrition, behavioral health conditions, and others. Astronauts must be capable of making health assessments on themselves during a mission, to prevent and treat health problems that may arise. Some useful health indicators are blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, and mood.

### Objectives
Your challenge is to create a visual tool that helps astronauts assess their own health during space missions and provides guidance on treatments and health improvements. You may consider gathering data from the user through any kind of input—keyboard text, mouse clicks, or camera images, for example. Any kind of data can be used, as long as it represents a health indicator, such as blood sugar levels in mg/dL or ultrasound images.

You can use NASA’s Human Research Program resources, along with the publicly available resources from other space agencies, to understand how spaceflight hazards affect human health, and to decide which indicators are useful and how they can support a quick assessment. Which measurements can be performed in space? Why is an exam needed? How do spaceflight hazards affect these health indicators? When might a result warrant attention from the crew or from flight surgeons on the ground? What actions can be taken to prevent a critical health condition? These are questions worth considering as you develop your solution.

User interface design plays an important role in presenting metrics and diagnosis clearly. You may consider taking advantage of animations and interactivity to present the information. For example, the software could display a human figure where each part of the body is clickable and displays information about its function and health status.

### Potential Considerations
You may (but are not required to) consider the following:

- Your tool could provide health insights for astronauts in different environments, such as a spacecraft, a space station, a rover, or a base on another planet or moon.
- Your tool could prompt astronauts to take measurements or complete specific actions from time to time as a part of the mission routine.
- Your tool could include the following features:
- A gamification system to help astronauts engage with tasks that support their health
- Dynamic charts that show how astronaut’s health indicators change over time
- Color coding that helps the astronaut interpret the status of a health indicator at a glance
- Do not assume that astronauts know everything about how to assess their health. Your tool could provide simple instructions and explanations covering measurements, health indicators, and risks.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Interplanetary Survival Guide: Martian Map

Slug: `interplanetary-survival-guide-martian-map`

NASA has explored Mars robotically for decades, studying its extreme environment, mapping its surface, and collecting many types of data. Far from home, the first astronauts to set foot on Mars will want the best map possible, with information on the details of their routes and destinations, updates on current conditions, and the data needed to complete their mission quickly and safely. Your challenge is to create a layered, integrated view of a location or route on the Martian surface that pulls together data from multiple NASA science missions and could help a human explorer plan and carry out a successful Marswalk while conducting new and exciting science along the way.

### Background
Human explorers are able to conduct science and do other activities that robotic systems cannot. As seen during the recent Artemis II mission’s lunar flyby, astronauts use their critical thinking skills to make connections, solve problems quickly, and apply context to observations and scientific measurements in real time. This is why NASA sends humans into the extreme environments of space, where we can learn more about our solar system and how it formed, and do science we can’t on Earth. Today, human exploration is focused on the lunar surface, with more Artemis missions upcoming and planning for the phased buildup of a Moon Base underway. Part of the role of science missions at NASA is to pave the way for humans to visit new destinations in the future. Each new robotic Mars mission has represented a hugely complex engineering challenge. Sending humans will be the biggest challenge, and the biggest achievement, yet, and becoming an interplanetary species will take all of our knowledge, imagination, and hard work.

Data from NASA’s current and past Mars missions paints a detailed picture of the planet, but it isn’t yet layered together in the combinations needed to plan specific human missions. Tools like the Jet Propulsion Laboratory’s (JPL) Mars Trek and the USGS-NASA Planetary Geologic Mapping Program allow you to layer different data over a global map of Mars, but they are built for regional and global views rather than the hyperlocalized areas astronauts will target on individual spacewalks or surface excursions.

### Objectives
Your challenge is to create a map, tool, or interface a Mars astronaut could use during a surface exploration mission, using NASA data and tools. You might start by identifying some scientific goals for your mission and the location the astronaut will explore. For example, if you chose a science objective of learning more about boxwork formations, a geologic phenomenon the Curiosity rover studied in 2025, you would want to pick a location where the formations are abundant, like the Mount Sharp region where Curiosity observed them.

You might start with a location one of NASA’s Mars Rovers or another mission has explored extensively, so you have a lot of data and imagery to work with, or you might challenge yourself by focusing on an area that hasn’t been studied as closely.

You may consider including at least three kinds of data—optical, thermal, spectral, topographic, geophysical, atmospheric, radiation, and chemical are a few examples—layered or combined in a way that provides helpful context for navigating the chosen location.

NASA’s first priority is always astronaut safety, so consider what information might help a crew move safely through a new environment. For example, the radiation environment on Mars differs from those of Earth, Earth-orbit, and the Moon, so you might include space weather data. Astronauts will conduct Mars surface science wearing spacesuits and possibly carrying scientific equipment and other supplies. Consider how this might impact their mobility and, if possible, include a route map that shows where the astronaut will travel to accomplish their scientific objectives while avoiding significant obstacles such as large rock formations.

### Potential Considerations
You may (but are not required to) consider the following:

- You might visualize your map as a display used inside the crew’s spacecraft or habitat to plan their route, as a tablet application they carry with them, as a heads-up-display (HUD) projected on the spacesuit’s helmet visor, or in another format you imagine.
- Your map can be a static snapshot, an interactive digital product, or a tool or system that generates maps of different locations or with different types of data.
- Look at how NASA missions to destinations other than Mars—Earth, the Moon, other planets in our solar system, and exoplanets in other systems—have created this type of map, for inspiration.
- You may choose to use data from a specific time frame in the past, predicted data and conditions for a future time frame, or no specified time frame at all, for example if you are focusing on more stable information like topography and geology.
- Try looking at imagery taken by NASA’s Mars surface missions to help visualize what it would feel like to execute your mission using your map. Consider how you might include these point-of-view images as part of your map, so the astronaut knows what to expect when they arrive at their destination.
- Think about whether your mission might use rovers or other robotic systems to help transport the crew and their tools, or whether the astronauts might work in pairs to accomplish more science.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Build a Junior Astronaut Mission Trainer

Slug: `junior-astronaut-mission-trainer`

Space-themed STEM content often oversimplifies the engineering trade-offs that define a real mission or presents them at a level too complex to hold a young learner's attention. Few tools make those trade-offs both tangible and fun. Your challenge is to design and build an interactive game or app that lets students run a lunar or Martian outpost, balancing competing demands like life support, radiation shielding, power, and food production, so they experience firsthand the decisions that determine whether a mission fails or succeeds.

### Background
As NASA works to establish a sustained presence on the Moon and extend human exploration toward Mars, one of the most persistent challenges isn't just engineering hardware — it's building public understanding of what survival actually requires in these environments. Astronauts on a lunar or Martian outpost must balance competing demands: limited power has to be split between life support, communications, and science; radiation exposure has to be weighed against mission objectives; and every decision carries a resource cost that compounds over time. These are the same kinds of trade-offs NASA's own mission planners navigate daily, informed by real data — solar activity and radiation risk from the Space Weather Database (DONKI), astronaut radiation dosimetry and biological research from the Open Science Data Repository (OSDR), and environmental data from Artemis and Mars surface missions.

The gap is in translation. Space education content for kids often stays too abstract (e.g., posters and general facts) to convey real trade-offs or assumes a technical background too advanced for a young audience to engage with meaningfully. As a result, many students never encounter the actual decision-making logic behind a mission—only its outcomes. Content that leans purely educational often struggles to hold attention; content that leans purely toward entertainment can lose accuracy.

Participants might prioritize designing mechanics—not just visuals—that mirror real constraints: a choice that saves power today might cost oxygen tomorrow. Grounding gameplay in real NASA open data, rather than invented statistics, is encouraged. Possible approaches include survival-style resource management, narrative decision trees, or dashboard-style mission control simulators—but participants are encouraged to explore whatever format best teaches the underlying trade-off rather than conforming to any single template.

### Objectives
Your challenge is to design and build an interactive game or app that lets kids ages 7–12 manage a lunar or Martian outpost, making real decisions about life support, radiation shielding, power budgeting, food production, and communication delay, and experiencing how those choices play out over the course of a simulated mission.

Think about how your tool can turn genuine mission constraints into gameplay: what does it feel like to trade oxygen reserves for an extra research opportunity, or to reinforce shielding against a radiation event at the cost of tonight's power supply? How will you represent competing resources so that no choice is free, and every decision teaches something true about what astronauts and mission planners actually navigate?

You're encouraged to ground your simulation in real NASA open data wherever possible — for example, using DONKI to reflect actual solar activity and radiation risk, the OSDR for real astronaut health and biological research findings, or Artemis and Mars surface mission data to inform environmental conditions at your chosen site. Incorporating live or archived NASA datasets, rather than fabricated numbers, will make the experience more authentic and give players a genuine window into how mission-critical decisions are made.

Format is open: you could build a resource-management survival game, a narrative-driven decision simulator, a mission-control-style dashboard experience, or something else entirely — browser-based, mobile, or desktop. The goal is a working prototype that demonstrates the trade-off mechanic clearly enough that a young player walks away understanding a real constraint of deep space survival, not just having played a fun game. Creative interpretations of "outpost," "site," or "mission" beyond the Moon and Mars are welcome, provided the underlying educational goal — teaching real engineering trade-offs through play — stays central.

### Potential Considerations
You may (but are not required to) consider the following:

Audience and Accessibility

- Your target audience is kids ages 7–12, but consider whether your tool can flex to engage older siblings, parents, or classroom settings too.
- Favor plain language over jargon; where a scientific term is unavoidable — radiation dose, microgravity, sol — briefly explain it in-context rather than assuming prior knowledge.
- Low barrier to entry matters — a browser-playable experience with no download or account required will reach more participants during judging and more students afterward.Grounding in Real Data

- Wherever possible, pull from NASA's public APIs and open datasets rather than inventing plausible-sounding numbers—even a small amount of real data—a real radiation reading, a real Mars photo, a real astronaut health finding—makes the experience meaningfully more credible than an entirely simulated one.
- Clearly attribute your data sources within the tool itself, so players understand they're engaging with real NASA science, not just a themed game.
- If live API calls aren't feasible during your build window, a curated real dataset embedded directly into your tool is a reasonable and honest alternative—just don't present static data as live.Gameplay and Design Pitfalls to Avoid

- Avoid designing a "safe" choice that has no cost—the educational value comes from every decision involving a genuine trade-off, mirroring real mission planning.
- Don't let visual polish substitute for mechanical accuracy—a simple game that teaches a real constraint beats a beautiful one that doesn't.
- Avoid overwhelming young players with too many simultaneous systems to track; two or three core resources—life support, power, shielding—are usually more effective than five or six.What Would Make a Solution Stand Out

- Tools that let players see the real-world consequences of their in-game choice—linking a radiation-shielding decision to actual current space weather data.
- Replayability—mechanics or events that vary between playthroughs encourage kids to try different strategies and learn from failure without it feeling punitive.
- Accompanying a working prototype with a short explanation of which NASA datasets were used and why, making the science traceable and verifiable by judges.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Lunar Landing Site Navigator

Slug: `lunar-landing-site-navigator`

Missions to the Moon’s south pole face extreme lighting and communication constraints, and planning them takes careful coordination between science and engineering teams. Tools for determining Sun and Earth positions at candidate landing sites exist, but their complicated interfaces make it difficult to evaluate critical information with efficiency. Your challenge is to create an intuitive tool or application that lets mission planners, educators, and the public compare landing sites and dates quickly, visualizing Sun and Earth positions relative to the horizon to assess power generation potential and direct-to-Earth communication windows.

### Background
NASA’s Commercial Lunar Payload Services (CLPS) program and other lunar missions depend on careful selection of landing sites and dates that balance the needs of both science and engineering teams. One of the most significant challenges in this process is understanding the local lighting and communication environment at a potential landing site. The position of the Sun determines power availability for solar arrays and thermal conditions for equipment, while the position of Earth determines whether direct communication is possible without relay satellites.

This challenge is particularly acute at the Moon's south pole, where many future missions are planned due to the presence of water ice and other scientifically valuable resources. The south pole's geometry creates extreme variations in solar illumination and Earth visibility across different lunar days and seasons. Small changes in landing location or date can dramatically affect both power generation potential and communication windows, making rapid site evaluation critical.

In practice, mission development rarely proceeds on a fixed timeline. Hardware development challenges, launch delays, or other factors often force mission planners to reconsider their original landing date and location. When this happens, engineers need to quickly evaluate alternative sites in the same region, or alternative dates at the same site, to understand how these changes impact mission feasibility. A tool that enables rapid, intuitive comparison of multiple scenarios would accelerate this decision-making process and help teams identify viable alternatives when constraints shift.

Tools that provide this information — such as NASA's Quickmap, Moon Trek, and the JPL Horizons System — are built for detailed analysis and are often difficult for non-specialists to use effectively for rapid scenario comparison. Evaluating each site-data combination means navigating multiple interfaces and interpreting raw data. This leaves a gap between the technical data available and the accessible tools needed to support agile mission planning. An intuitive interface that translates complex ephemeris and topographic data into clear, comparable visualizations could help bridge that gap.

### Objectives
Your challenge is to create a tool or application that enables rapid evaluation of lunar landing site options. Your solution may include:

- Interactive site selection and comparison: You may consider allowing users to choose from a curated list of notable landing sites – such as past Apollo missions, future CLPS mission targets, targets of other commercial lunar missions, or landing sites from other countries' lunar programs – as well as the ability to input custom lunar coordinates. You may also consider enabling side-by-side or sequential comparison of multiple sites to help users quickly assess trade-offs.
- Date and time flexibility: You may consider allowing users to select landing dates and times, and providing tools to explore how conditions change across different lunar days or seasons. This enables users to understand how mission schedule adjustments affect feasibility.
- Sun and Earth position visualization: Display the positions of the Sun and Earth relative to the horizon at a selected landing site on a chosen date. You may consider showing how much time remains before sunset or Earthset, as this directly impacts mission operations and power generation windows.
- Power and communication assessment: You may consider highlighting key metrics such as solar elevation angle (which affects power generation efficiency), duration of sunlight, and Earth visibility windows. These metrics help mission planners quickly assess whether a site-date combination is viable.
- Multiple visualization approaches: You may explore 2D maps, 3D surface visualizations, or other creative representations that help users understand the spatial relationships between the landing site, Sun, and Earth.
- Temporal dynamics: You may consider creating animations or timeline views that show how Sun and Earth positions change over a lunar day or across multiple days, helping users understand the duration and timing of operational windows.
- Accessibility across skill levels: Your tool could serve mission planners seeking detailed technical information for rapid decision-making, as well as educators and the general public curious about why the Moon presents such distinct engineering challenges.You are encouraged to be creative in how you present this information. Your solution might be a web application, a mobile app, an interactive visualization, an educational game, or another format entirely — as long as it makes rapid site evaluation clear and efficient.

### Potential Considerations
You may (but are not required to) consider the following:

Technical approach:

- Ephemeris data – the positions and motions of celestial bodies – can be calculated using tools like the JPL Horizons System, or you may consider using pre-computed datasets.
- Lunar topography data from sources like the Lunar Orbiter Laser Altimeter (LOLA) can help create realistic surface visualizations and accurate horizon calculations.
- Consider how to handle the Moon's lack of atmosphere when calculating horizon positions. Without atmospheric refraction, the horizon is determined by local terrain and the edge of the lunar sphere as seen from the landing site.
- Solar elevation angle is a key metric for power generation, and you may consider calculating and displaying this prominently.User experience:

- Your interface could prioritize rapid scenario comparison, allowing mission planners to evaluate multiple site-date combinations efficiently.
- Consider how to clearly communicate time remaining before sunset or Earthset, as this is critical operational information.
- Think about how to make the extreme differences between lunar and terrestrial conditions apparent—they can be compelling when visualized effectively.
- You may consider features that help users understand why small location or date changes have large impacts on mission feasibility.Data and accuracy:

- Consider accounting for the Moon's actual topography, as terrain elevation can significantly affect horizon positions and visibility windows.
- Consider whether your tool will account for factors like Earth's libration (wobble) or the Moon's orbital variations.
- South pole terrain is particularly complex, and you may consider how to represent steep slopes and deep craters that create extreme shadow conditions.Engagement and impact:

- Your solution could support mission planners in coordinating between science and engineering teams during mission development.
- It could help teams respond quickly when schedule changes or hardware development challenges require landing date or location adjustments.
- It could also serve as an educational tool to help students and the public understand lunar exploration challenges and why mission planning is so complex.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Harmonization of MODIS and VIIRS Hot Spots

Slug: `modis-and-viirs-hot-spots`

Understanding how burning activity is distributed across our planet over time, including wildfires and agricultural burns intense enough to be detected by satellite sensors, enables us to anticipate critical periods, guide monitoring efforts, and improve fire response. Satellites have tracked active fire hotspots for more than two decades, but the record is split across sensors whose data cannot be compared directly, leaving fire managers without a consistent picture of when and where burning has occurred. Your challenge is to build a web application that harmonizes these records into a burning activity calendar based on active fire hotspots, enabling early warning and emergency responders, scientists, and land managers to examine historical fire patterns, unusual conditions, and critical periods within a selected area of interest.

### Background
Fire regimes

Some ecosystems need periodic fires to maintain their function and their structure. However, changes in fire intensity, extent, and frequency can have negative impacts on climate, society, and biodiversity, along with the ecosystem services they provide. Fires can also cause loss of life and properties, degradation of health, and acute risk to fire managers.

Because humans have modified global patterns of vegetation, ignition, and climate over millennia, fires on both local and global scales are increasingly human-related.

Burning activity involves wildfires in natural vegetation and forested areas, as well as anthropogenic fires associated with agriculture, land-clearing, waste disposal, and industrial activities. It is one of the many dynamic phenomena that can be detected with remote sensing.

Satellite fire detection and monitoring

Climate models project that fire weather will become more common and more intense. Earth Observation (EO) satellites provide technological solutions for early detection, rapid response, and postfire assessment, measuring thermal radiation and smoke across regional to global scales.

Detecting hotspots on Earth's surface

EO satellites provide information on fire location, intensity, and temporal evolution. Satellite sensors operating in the thermal infrared (TIR) range can detect hotspots on the Earth's surface generated by urban and wildfires, volcanic eruptions, and industrial processes such as gas flares in oil and gas operations.

For active fires, detection and monitoring rely mainly on mid-infrared (MIR) and TIR measurements, where active combustion produces its stronger signal. Sensors such as MODIS and VIIRS provide real-time thermal anomaly detection, enabling early hotspot identification and the assessment of burned areas.

Burn activity calendars

Using satellite-detected hotspots, fire activity calendars can be developed by integrating historical information with recent data, allowing for the rapid visual identification of seasonal patterns, anomalies, and trends in each region.

MODIS sensors on board Terra and Aqua satellites provide more than two decades of observations, but they are approaching the end of their operational life and are being replaced by VIIRS sensors. Their records cannot be directly compared without harmonization, since MODIS and VIIRS have different spatial resolutions, sensitivities, and observation schedules.

Therein lies the root of the challenge. As fire frequency and intensity increase, emergency managers benefit from an updated and consistent hotspot calendar that enables them to rapidly visualize, for example, which month and years had the highest fire activity, and compare the burning activity of the current month against the historical median for a selected area.

You may consider harmonizing NASA Earthdata FIRMS hotspots, combining the extensive historical series of MODIS with the continuity and greater detail of VIIRS.

Emergency managers could then use the web application to monitor sensitive regions, recognize changes relative to historical patterns, and strengthen fire forecasting and response.

### Objectives
Your challenge is to develop a harmonized burning activity calendar based on active fire hotspots in a web application, combining the extensive historical series of MODIS with the continuity and greater detail of VIIRS to provide a consistent time series of hotspot activity.

This challenge could be approached in two parts. The first is MODIS and VIIRS hotspot harmonization, so that by the end of that phase the sensor of origin no longer matters and the patterns, trends, and anomalies become the focus.

The second involves developing a web application that takes harmonized hotspot data as input. Through this visual tool, a user could select a region and a specific date range, then download analytics and visualizations of fire activity.

A calendar of burning activity showing the number of hotspots detected from the early 2000s to the present, built on the harmonized hotspots dataset and integrated into the web application, would give emergency managers a view of the fire history of an area: which periods of the year see more fires, which years had more burning activity, and how a current fire compares with previous ones.

In addition to numerical information, you could consider how color ramps might represent similarities and differences in the number of detected hotspots across months, providing an accessible and intuitive way to visualize fire activity. A downloadable CSV File of hot spots detected during a search would be another useful output.

### Potential Considerations
You may (but are not required to) consider the following:

- Your target audience can include early warning and emergency responders, scientists, land managers, and firefighters.
- Consider making your web application interactive – for example, a map where users can draw the area of interest, or an option to enter latitude and longitude.
- Consider using accessible color ramps.
- Your tool could depict a burning calendar
- Your tool could focus on a few key indices and figures and present them through data visualizations, such as:
- Historical comparisons, including anomalies against multi-year averages
- Number of fires detected and reportedFor data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

Photo credit: The National Commission on Space Activities of Argentina (CONAE)

## Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars

Slug: `nasas-discarded-equipment-storytelling`

Since the 1960s, NASA has left hardware across the solar system–on the Moon, on Mars, and in deep space. From rovers and instruments that completed their science missions to probes still traveling away from Earth this hardware varies widely in both its purpose and current level of functionality. Your challenge is to tell the story of some or all of this equipment that introduces school-age space enthusiasts to the hardware and the science it made possible.

### Background
For over half a century, humanity has sent incredible machines to the Moon, Mars, and other celestial bodies. When their missions end, probes, rovers, landers, descent stages, and scientific instruments are left behind, standing—or flying—silently as monuments to human exploration. While space agencies know the histories of these machines, school-age space enthusiasts often hear only about active, ongoing missions. There is a real opportunity here to inspire the next generation using the rich, untold histories of these off-world artifacts and the groundbreaking science that paved the way for today's achievements and tomorrow’s exploration.

To respond to this challenge, participants will want to know what types of equipment currently reside on the Moon, on Mars, and elsewhere—old rovers, descent stages, scientific payloads—and the specific missions they facilitated. The priority is to translate complex historical and scientific data into an engaging narrative.

People looking to learn about past space missions often work through dense technical websites or historical textbooks that lack the spark of imagination and storytelling needed to capture a younger or more casual audience's attention. Potential projects could include an interactive map of the Moon with clickable "ghost rovers," a digital graphic novel told from the perspective of a dormant Mars lander, or an audio podcast series chronicling the final days of a deep space instrument. We encourage you to think outside the box and develop your own creative alternatives!

### Objectives
The goal of this challenge is to create an engaging, story-driven educational tool or narrative that teaches school-age and casual space enthusiasts about the hardware left on the Moon, Mars, and elsewhere. Your project might bring these silent or active artifacts (back) to life, explaining what they are, why they were originally sent into space, and the scientific discoveries they made and continue to make.

Your final project can take many forms, and we welcome a variety of formats and technologies. For example, you might develop an interactive web-based experience using HTML, CSS, or JavaScript; prototype an educational video game using a game engine of your choice; write and illustrate a digital children's book; produce a short animated video; design an interactive 3D timeline; or take another approach entirely!

### Potential Considerations
Regardless of the medium or technology you choose, a strong narrative focus will serve your project well. Consider weaving real historical facts and mission data into your story, and showing your audience how these missions operated rather than listing facts about them. The aim is to draw a clear, exciting connection between the engineering of the hardware and the scientific knowledge humanity gained from it. By the end of your story, your audience might walk away feeling a personal connection to these forgotten robotic explorers and inspired by the science they conducted. Accuracy is important throughout!

You may (but are not required to) consider the following:

- What age group is your story designed for?
- How accessible is the format you chose to use?
- Do you want to focus on specific missions and pieces of equipment, or tell a broader story about NASA’s exploration?
- What perspective(s) do you want to highlight?For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars

Slug: `permanent-moon-base-locations-and-mars`

Selecting future landing sites and lunar base locations depends on many factors, including topography, geology, environment, and available resources, to name a few. Places on Earth that have analogous characteristics to the Moon or Mars – the Atacama Desert, Haughton Crater, Death Valley – allow mission teams to test equipment and methods before they fly; however, such terrestrial analog sites are not entirely well characterized. Your challenge is to use open Earth, Moon, and Mars data from NASA and other space agencies to identify and characterize new terrestrial analogs for future bases or landing sites, drawing on deserts, polar regions, volcanic and arid terrains, caves, and other environments that share conditions with the lunar or Martian surface, then present your findings as a map, visualization, or other tool.

### Background
Earth is our most accessible laboratory for preparing to explore the Moon and Mars. Scientists and engineers already use terrestrial “analog” environments — deserts, polar regions, volcanic landscapes, impact craters, and caves — to study planetary processes and test instruments, technologies, and exploration concepts. However, no location on Earth perfectly reproduces another planetary environment, and different locations may provide useful analogs for different characteristics.

As humanity prepares for sustained exploration of the Moon and future human exploration of Mars, we could use open Earth, Moon, and Mars data to search globally and systematically for terrestrial environments that may provide useful — and perhaps previously unrecognized — analogs. Participants might consider dimensions such as geology and surface materials, terrain type and topography, atmospheric and aeolian processes such as dust storms, temperature and other environmental extremes, water or ice, biological and habitability characteristics, subsurface environments, and conditions relevant to robotic or human operations.

The goal is not simply to rediscover well-known analog sites, or to find one place that simply looks like the Moon or Mars. Participants are encouraged to combine datasets creatively to identify and characterize locations anywhere on Earth, explain what makes them analogous and what does not, and show how these environments could help conduct lunar or Mars science and exploration. Solutions might range from identifying a compelling individual site, environment, or geophysical process to developing maps, similarity metrics, machine learning approaches, or other innovative methods for discovering and comparing planetary analogs. You might consider Earth, Moon, Mars data obtained from various NASA and other space agencies missions, as well as data and images obtained locally.

### Objectives
Your challenge is to search our own planet Earth for places, environments and processes that could serve as analogs and can help us explore the Moon and Mars. Using open NASA Earth data together with available Moon and Mars data from other space agencies and open sources, identify and characterize one or more locations on Earth that could serve as useful analogs for candidate permanent Moon-base locations or future Mars landing and exploration sites. Explore what makes your Earth location analogous to the Moon or Mars. You might compare data and images of geology and surface materials, terrain and topography, temperature and environmental extremes, water or ice, dust and atmospheric processes, biology and habitability, caves or subsurface environments, or conditions relevant to robotic and human exploration. Your analog does not need to match the Moon or Mars in every way. Explain which characteristics or processes provide a strong analogy, where the analogy breaks down, and how studying or using your Earth analog could help prepare for the exploration of the Moon or Mars.

Be creative in how you search for, analyze, and communicate your analog. You could develop a written report, an interactive map, visualization, app, story, similarity-ranking system, ML tool, or another innovative approach. You might investigate a single compelling location, compare several locations around the world, or develop a method for systematically searching Earth for previously unrecognized analogs. Use open data from NASA and other space agencies as your window into Earth, the Moon, and Mars—and show us what our home planet can teach us about exploring the next ones. You might consider documenting your findings in a written format to share with other enthusiasts interested in the topic and to educate the public.

### Potential Considerations
You may (but are not required to) consider the following:

- Think beyond visual similarity. Two places may look alike but differ substantially in geology, environment, or physical processes. Use data to explain why your proposed Earth location is a meaningful analog.
- Consider different dimensions of analogy, including:
- Geology, mineralogy, and surface materials
- Terrain, elevation, slope, roughness, craters, and other topographic features
- Temperature, illumination, and environmental extremes
- Water, ice, permafrost, and other potential resources
- Dust, wind, erosion, and other atmospheric or surface processes
- Biology, extremophiles, habitability, and biosignatures
- Caves, lava tubes, underground environments, and other subsurface features
- Conditions relevant to landing, mobility, navigation, robotic operations, human exploration, or construction
- An analog does not have to match everything. An Earth location might be an excellent geological analog but a poor temperature analog, for example. Identify what is similar, how similar it is, and what is different.
- Think about processes as well as places. Earth processes such as sedimentation, dust storms, volcanic activity, erosion, ice dynamics, or water-driven alteration may provide insights into processes occurring today — or that occurred in the past — on the Moon or Mars.
- Look beyond well-known analog sites. Locations such as Antarctica, the Atacama Desert, Iceland, Hawaii are already widely studied. For example, NASA's global Earth-observation datasets may allow you to discover compelling analogs in places that have received much less attention.
- Explore the whole Earth, including below its surface. Polar regions, deserts, mountains, volcanoes, impact craters, salt flats, glaciers, caves, lava tubes, mines, and other environments could all offer interesting possibilities.
- Use multiple datasets when useful. Combining observations of terrain, temperature, geology, vegetation, water, ice, aerosols, or other characteristics may reveal relationships that are difficult to recognize using a single dataset.
- Consider scale. A continent or desert does not need to be treated as a single analog. A particular crater, valley, volcanic field, cave system, or even a small area within a much larger region could provide a much stronger match.
- Connect your analog to exploration. Explain how the location or process you identify could help scientists and engineers understand Moon, Mars, or both; test instruments or technologies, prepare robotic or human operations; search for resources or signs of habitability; or reduce exploration risks.
- Be creative with your approach. Maps and visualizations are welcome, but solutions could also use geographic information systems (GIS), statistical analysis, similarity metrics, machine learning, interactive applications, games, or other innovative methods.
- Remember Earth's limits as an analog. Earth cannot reproduce important lunar and Martian conditions such as reduced gravity, the lunar vacuum, the thin Martian atmosphere, or their radiation environments. Recognizing these differences is part of good scientific analysis.
- Surprise us. A strong solution may identify an unexpected Earth location, reveal an unexpected connection between Earth and Moon or Mars, or introduce a new way of using Earth data to help enable future exploration.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Planet X and SPHEREx

Slug: `planet-x-and-spherex`

Since 2025, NASA’s SPHEREx mission has been mapping the entire sky every six months in 102 bands of near-infrared light, returning images of more than a billion objects. Comets, asteroids, stars, brown dwarfs, and even new planets reveal themselves by shifting position between images, but no one person can sift through all that data alone. Your challenge is to create a public-facing web tool to display images of the sky from SPHEREx mission, making it easy for anyone to quickly see how they change over time.

### Background
Asteroids and comets orbit around the Sun. Nearby stars march across the sky as they orbit around the Galaxy. The Earth orbits the Sun too, causing objects near us to change their apparent positions. Watching for these motions help us discover new astronomical objects and also help measure the distances to these objects. For example, the dwarf planet Pluto was discovered when an astronomer compared two images of the sky taken at different times and recognized that one point of light had shifted between images.

More recently, astronomers have mounted massive searches for nearby objects using this process with help from the public. Hundreds of thousands of volunteers have used this technique to discover asteroids, comets, stars and brown dwarfs—balls of gas too massive to be considered planets yet without enough mass to burn like stars. In fact, most of the known comets and brown dwarfs were discovered by volunteers in this manner through projects like backyardworlds.org.

Since May 2025, NASA’s new SPHEREx mission has been returning unique data that could yield new discoveries. SPHEREx is mapping the whole sky once every six months in 102 bands of near-infrared light, making it uniquely sensitive to objects that are rich in hydrogen, water, carbon dioxide, carbon monoxide, and many other molecules. There will be too much data for any one person or even computer code to completely comprehend. There will be images of more than a billion objects - including brown dwarfs, quasars, comets, asteroids, stars, supernovae and galaxies - which often overlap or vary in brightness. We need your creative new tools to make the most of this treasure trove and help as many people as possible pitch in to make discoveries.

### Objectives
Your challenge is to create a public-facing web tool to display images of the sky from the SPHEREx mission, making it easy for anyone to quickly see how they change over time. Users will enter the coordinates of a patch of sky (Right Ascension and declination). Your tool will display a series of images of that patch like a little video, making it easy to spot moving objects.

Test your tool on Barnard’s Star, Epsilon Indi B (a pair of brown dwarfs orbiting a star), WISE 0855 (a fast-moving brown dwarf Right Ascension 08h55m10.831s, declination -7d14m42.53s), and variable stars RW Aurigae and R Draconis.

### Potential Considerations
You may (but are not required to) consider the following:

- New SPHEREx data is arriving fast! Make sure to design a tool that’s easy to update with the latest data releases.
- Think creatively about how to display those 102 infrared bands so users can take advantage of them to make new discoveries! For example, it may make sense to separately add together all the data taken by each of the six detector arrays to improve the signal-to-noise in the images you display. Extra kudos if your tool can generate spectra on the fly.
- It may help users discover moving objects if they have the options to add together or subtract images taken at different times.
- Let users choose the field of view! Larger fields of view can make it possible to track faster-moving sources, at the cost of longer data transfer times.
- Users could benefit from having the option to overlay astronomical data from other telescopes, such as the Gaia mission or the WISE mission.
- If you make it possible to query your tool by including coordinates in the URL, users will be able to easily embed it in other websites and projects.
- It can be useful to display metadata, like contamination flags.
- Consider looking for publicly available tools that may help in handling astronomical data, like the Astrophy tools, and in displaying astronomical data, like the Aladin tool developed by the Strasbourg Astronomical Data Center (CDS).For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## Space Mission Design Game

Slug: `space-mission-design-game`

Designing a space mission requires careful consideration of competing demands, including mission objectives, spacecraft design, scientific instruments, launch vehicles, budgets, power, mass, communications, and orbital constraints. For students who rarely get to experiment with an entire mission from concept to operation, these trade-offs often remain abstract. Your challenge is to create an interactive game that allows participants to design, manage, and simulate a complete space mission while making engineering decisions, managing limited resources, and evaluating how each choice shapes the success of their mission.

### Background
Space missions are complex systems in which scientific objectives, engineering requirements, available resources, and operational constraints must work together. Designing a mission involves decisions about the spacecraft, scientific instruments, launch vehicle, orbit, power, mass, communications, budget, and mission lifetime. A decision that improves one aspect of a mission can create limitations in another. For example, adding a more capable instrument may increase scientific value while also increasing mass, power consumption, data volume, and cost. Understanding these trade-offs is essential to developing successful space missions.

However, learning space mission design is often limited to theoretical exercises because students and aspiring engineers rarely have access to an environment where they can experiment with an entire mission from concept to operation. Existing tools often focus on individual topics such as orbital mechanics, spacecraft design, or rocket launches without demonstrating how these elements interact as a complete system. This leaves a gap between learning individual space concepts and understanding how mission teams make integrated engineering decisions.

An interactive game can help address this gap by allowing participants to experiment, make decisions, encounter constraints, and learn from both successful and unsuccessful missions. Players could design missions individually or collaborate in teams of up to four people, with each participant contributing to the mission strategy and working together to achieve the best possible result. Potential approaches could include mission planning, spacecraft configuration, instrument selection, resource management, orbital selection, launch planning, communications, and mission simulation. You are encouraged to develop creative alternatives that make the experience engaging while preserving the fundamental trade-offs of real-world space mission design.

### Objectives
Your challenge is to create an interactive Space Mission Design Game that allows participants to experience the process of designing and managing a complete space mission. You may consider enabling a player to participate individually or collaborate with a team of up to four people, with participants working together to make strategic decisions and achieve the highest possible mission performance.

The game could allow participants to define a mission objective, establish mission requirements, design a spacecraft, select scientific instruments, choose a launch vehicle and orbit, and manage key constraints such as budget, mass, power, communications, data, and mission lifetime. Players benefit from seeing how their decisions affect other parts of the mission, and from understanding the trade-offs involved in real-world space mission design.

A strong solution might include a functional interactive game or simulation with a clear user interface, mission configuration system, resource management mechanisms, collaboration or multiplayer functionality for up to four participants, and a mission simulation and evaluation system. The game could provide feedback on mission performance and reward effective engineering decisions, efficient resource management, successful collaboration, and achievement of mission objectives. Participants are encouraged to develop creative game mechanics, visualizations, scoring systems, and mission scenarios that make the experience engaging while requiring players to solve problems, make trade-offs, and collaborate to achieve mission success.

### Potential Considerations
You may (but are not required to) consider the following:

Game design and experience

- The game could be accessible to participants with different levels of knowledge about space science and engineering.
- The game could support both single-player and team play, allowing up to four participants to collaborate on the same mission.
- Team members could have different responsibilities, such as mission planning, spacecraft design, science, communications, or resource management.
- Clear objectives and feedback help participants understand why a mission succeeds or fails.
- Consider making the game interactive, allowing participants to modify their mission design and simulate it multiple times.
- A scoring system could reward mission success, scientific value, efficient use of resources, and effective decision making.
- The game could include different difficulty levels, mission types, or scenarios.Mission design

- Participants could begin by defining a mission objective before making spacecraft and engineering decisions.
- Consider giving every major design decision a consequence. For example, increasing the number of instruments could increase scientific capabilities but also increase mass, power consumption, cost, and data generation.
- Consider demonstrating that there is rarely a single perfect solution. Different combinations of spacecraft, instruments, orbits, and launch vehicles could achieve the same mission objective.
- Consider including realistic constraints such as limited budget, spacecraft mass, available power, communications capacity, and mission lifetime.Spacecraft and payload

- The spacecraft could include components such as structure, power systems, batteries, communications, onboard computers, attitude control, and scientific instruments.
- Scientific instruments could have different characteristics, including mass, power consumption, cost, data generation, and scientific value.
- Consider allowing participants to choose between simple and advanced spacecraft components depending on the difficulty level.Orbit and launch

- The game could provide several orbital options and explain their basic characteristics.
- Participants could consider how the selected orbit affects coverage, observation opportunities, communications, mission lifetime, and other mission requirements.
- Launch vehicles could have different payload capacities, costs, and orbital capabilities.
- Consider building in a check that the spacecraft mass and selected orbit are compatible with the chosen launch vehicle.Resource Management

- The game should clearly display the main resources available to the mission team.
- Important resources could include:
- Mass: the total mass of the spacecraft and payload.
- Power: the energy available to operate spacecraft systems and instruments.
- Budget: the financial resources available to develop and operate the mission.
- Data: the amount of information generated by scientific instruments.
- Communications: the spacecraft's ability to transmit data to ground stations.
- Time: The planned development and operational lifetime of the mission.
- You may consider identifying which resources are most critical to your specific mission.Collaboration

- In team mode, up to four participants could work together on the same mission.
- Consider giving team members different roles or responsibilities while asking them to make decisions collectively.
- The game could include situations where team members must negotiate between competing priorities.
- The final mission result could depend on how effectively the team coordinates its decisions.Educational value

- Scientific and engineering concepts work best when explained in simple terms rather than assuming advanced knowledge.
- Complex concepts such as orbital altitude, payload capacity, power consumption, data rate, and communications could be introduced through the game itself.
- Consider including short explanations, tutorials, visual indicators, or optional learning resources.
- Consider teaching participants why a particular decision affects mission performance, rather than simply indicating whether the decision is correct or incorrect.You may consider adding features such as:

- Multiple mission scenarios with different objectives
- Random events or unexpected mission constraints
- Different difficulty levels
- Realistic or simplified spacecraft models
- Interactive spacecraft visualizations
- Mission dashboards showing real-time resource consumption
- Leaderboards or mission rankings
- Mission reports generated at the end of each simulation
- The ability to save, share, and compare mission designs
- Cooperative missions for teams of up to four participants
- Competitive scenarios where different teams design missions to solve the same objective
- A sandbox mode that allows participants to experiment without predefined constraints
- A post-mission analysis explaining why the mission succeeded or failedFor data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.

## The Earth Information Jukebox

Slug: `the-earth-information-jukebox`

NASA’s Earth Information Center (EIC) produces stunning visualizations of our changing planet, but presenting Earth science through visualization alone limits who can reach it. We invite you to make this complex Earth science accessible, engaging, and multi-sensory by translating sight into sound. Your challenge is to build an "Earth Jukebox"—an interface, script, or application that pairs EIC visual frames with dynamic sonifications generated in real time.

### Background
NASA’s EIC provides extraordinary visualizations that track how our planet is changing, from shifting global temperatures to evolving oceanic currents. However, this vital information is predominantly presented in a visual format. This current landscape presents a significant gap: relying exclusively on sight limits accessibility for blind and low-vision users and constrains how the public can interact with complex Earth science.

Sonification—the process of translating data into sound—offers a powerful way to bridge this gap. Converting visual elements into audio unlocks multi-sensory ways to experience Earth data. Auditory processing can reveal subtle data patterns that might be missed by the naked eye and can foster a deeper emotional connection to our home planet. Participants might prioritize creating an interactive environment where the translation from sight to sound is exploratory, blending scientific data with artistic expression.

To do this, participants need a way to connect visual imagery with audio generation. You may consider building a "jukebox" interface or algorithm that analyzes EIC visual frames and plays a corresponding soundscape. Potential solutions could involve using computer vision to map color spectrums to musical chords, applying algorithms to translate pixel density into rhythm, or writing artistic rulesets that drive synthesizer parameters based on visual shapes. These are just examples, and we encourage you to develop your own creative alternatives that blend software development, data processing, and audio engineering.

### Objectives
Your challenge is to create an "Earth Jukebox" experience that generates dynamic sonifications from NASA's EIC visual frames. The desired outcome is a project where individuals can select or experience a specific EIC visualization alongside its corresponding soundscape. You may consider developing an interactive tool that actively translates the visual data into sound, or you may choose to submit a curated collection of original, generated audio files that tell the auditory story of the data.

As you build your project, you may consider exploring a variety of methods and technologies to process the visual data. You might use computer vision techniques to analyze color palettes, shapes, or pixel densities in the EIC imagery, and map those elements to audio parameters like pitch, tempo, or instrumentation. You are welcome to employ machine learning algorithms, open-source audio synthesis frameworks, or custom data-driven artistic rulesets to generate the soundscapes. The exact method of translation is entirely up to you — we encourage you to aim for soundscapes that balance data interpretation with artistic, musically pleasing outputs.

The final deliverable can take many forms to suit your team's skills. You may consider developing an interactive web-based jukebox, a standalone desktop application, a backend API endpoint, or an engaging playlist of original, generated audio files accompanied by an explanation of the creative process used to make them. Think about how your audience will experience the visual data and how your approach can best convey the complexity of our changing planet through sound. By blending software development, audio engineering, and artistic creativity, you can create a unique multi-sensory experience.

### Potential Considerations
You may (but are not required to) consider the following:

Understanding the Concepts

- Sonification: the use of non-speech audio to convey information or perceptualize data.
- Visual Frames: many EIC visualizations are animated sequences or images. You might explore extracting individual images (frames) from these sequences to serve as the foundation for your audio generation.Designing Your "Jukebox" Experience

- Your final submission can take many forms, from a coded, interactive user interface (UI) to a thoughtfully curated digital gallery or playlist of your original, generated audio files paired with the imagery.
- If you choose to build an interactive tool, you might consider the user experience (UX) and how intuitively someone can select a visualization and initiate the audio.
- Accessibility is a core theme of this challenge. You could explore adding features that support blind and low-vision users, such as screen-reader compatibility, tactile feedback, or rich descriptive text accompanying your audio.Approaches to Data Translation

- You might explore mapping visual elements—color spectrums, brightness, geometric shapes, or spatial pixel density—to audio parameters such as pitch, rhythm, tempo, volume, or instrumentation.
- Consider the balance between strict data translation and musicality. A direct pixel-to-sound translation might result in chaotic noise; you may want to apply artistic rulesets, musical scales, or harmonies to make the audio engaging and pleasant to listen to.
- You may explore using a variety of disciplines, from writing custom computer vision algorithms and machine learning models to utilizing audio synthesizers and digital audio workstations.Telling the Story

- Documenting your process can help others understand your vision. You might consider sharing the "why" behind your artistic choices or explaining the algorithms and scripts you used to generate the sounds.
- Think about the emotional impact of the Earth science data. You might consider how your soundscapes can reflect the urgency of climate change or the beauty of our planet's interconnected systems.For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.
