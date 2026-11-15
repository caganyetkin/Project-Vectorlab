# Vectorlab | Planetary Analog Mapper
**NASA Space Apps Challenge Project**

> Vectorlab is an interactive, browser-based Geographic Information System (GIS) designed to bridge terrestrial extreme field research with future Lunar and Martian exploration planning.

---

## Overview
Before deploying multi-billion-dollar rovers, subsurface ice drills, ground-penetrating radar, or astronaut habitats to the Moon and Mars, space agencies rely on Earth's extreme analog environments to de-risk missions. **Vectorlab** transforms complex planetary science data into an intuitive, mission-control operational dashboard that maps terrestrial geological and climatic analogs directly to permanent lunar bases and Martian landing sites.

---

## Key Features
- **Interactive Orbital GIS Map:** Built with Leaflet.js and a custom dark-mode Cartographic raster filter, featuring smooth camera transitions (`flyTo`) and real-time coordinate tracking.
- **Target Body Filtering:** Seamlessly filter testbeds between **Mars Targets**, **Lunar Targets**, or view **All Analogs** instantly.
- **Dynamic Telemetry & Regolith Analysis:** Inspect structured scientific data for each site, including executive summaries, environmental stressor metrics, and mineralogical composition breakdown progress bars ($\text{SiO}_2$, $\text{Fe}_2\text{O}_3$, subsurface $\text{H}_2\text{O}$ ice, sulfates, and perchlorates).
- **Mission Brief Export:** One-click JSON report generation packaging selected site telemetry and GeoJSON coordinates for field researchers and mission planners.
- **Zero-Latency & Portable:** Fully self-contained single-page application requiring no backend servers or exposed API keys.

---

## Verified Terrestrial Analog Sites Covered
1. **McMurdo Dry Valleys, Antarctica** — *Mars Polar & Permafrost Analog*
2. **Atacama Desert, Chile** — *Mars Regolith & Hyper-Aridity Analog*
3. **Iceland Volcanic Fields & Lava Tubes** — *Lunar Mare Basalt & Martian Lava Tube Analog*
4. **Rio Tinto, Spain** — *Mars Ancient Aqueous & Mineralogical Analog*
5. **Devon Island / Haughton Crater, Canadian Arctic** — *Lunar & Martian Impact Crater Analog*

---

## Tech Stack
- **Frontend Architecture:** HTML5, CSS3, Vanilla ES6 JavaScript (Modular & Self-Contained)
- **Styling & UI:** Tailwind CSS, Google Fonts (*Inter* & *JetBrains Mono*), Lucide Vector Icons
- **Mapping Engine:** Leaflet.js (`v1.9.4`) & OpenStreetMap Global Tiles

---

## Super Intelligence (SI) Disclosure
In accordance with NASA Space Apps Challenge guidelines, generative AI tools were utilized to assist with frontend component structuring, CSS glassmorphism styling, and documentation drafting. No proprietary NASA branding or restricted design elements were used.

---

## License & Team
Developed with passion for the **2026 NASA Space Apps Challenge**. Open-source under the MIT License.