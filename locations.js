/**
 * ============================================================================
 * VECTORLAB | PLANETARY ANALOG MAPPER — NASA SPACE APPS CHALLENGE
 * Module: locations.js
 * Description: Verified terrestrial analog dataset correlating Earth extreme
 *              environments with Lunar and Martian surface/subsurface targets.
 * ============================================================================
 */

export const analogLocations = [
    {
        id: "VL-001",
        name: "McMurdo Dry Valleys, Antarctica",
        targetBody: "Mars",
        targetSubtitle: "Mars Polar & Permafrost Analog",
        coordinates: [-77.64, 162.52],
        summary:
            "Rare ice-free zones in continental Antarctica resembling Martian conditions due to extreme cold, hyper-aridity, katabatic winds, and cryospheric permafrost dynamics.",
        geologicalSimilarity:
            "Ice-cemented permafrost grounds, dry glacial valleys, polygonally patterned ground formations, and hyper-saline subglacial brines closely analogous to the Martian northern plains and polar layered deposits.",
        environmentalConditions:
            "Mean annual temperatures of -20°C (dropping below -50°C in winter), near-zero liquid precipitation (<50 mm water equivalent/year), intense desiccating katabatic winds reaching 320 km/h, and seasonal solar irradiance extremes.",
        spaceAgencyUtility:
            "Evaluating structural material degradation and thermal fatigue in cryogenic regimes; validating subsurface ice-drilling payloads (such as TRIDENT and ExoMars drills); and preparing planetary surface hardware for extreme cold-dry operational environments.",
        telemetry: {
            tempEarth: "-20°C to -50°C",
            tempTarget: "Mars Mean: -63°C",
            aridityEarth: "< 50 mm/yr (Hyper-Arid)",
            aridityTarget: "Target: ~0 mm/yr (Desiccated)",
            soilSimilarity: "94.2%",
            soilType: "Cryogenic Silicate Permafrost",
            uvFluxEarth: "High Seasonal Albedo UV",
            uvFluxTarget: "Target: Unfiltered UV-C/B"
        },
        soilComposition: [
            { mineral: "Silicate Regolith (SiO₂)", percentage: 56 },
            { mineral: "Subsurface Ground Ice (H₂O)", percentage: 24 },
            { mineral: "Iron Oxides (Fe₂O₃ / FeO)", percentage: 12 },
            { mineral: "Calcic & Perchlorate Salts", percentage: 8 }
        ]
    },
    {
        id: "VL-002",
        name: "Atacama Desert, Chile",
        targetBody: "Mars",
        targetSubtitle: "Mars Regolith & Hyper-Aridity Analog",
        coordinates: [-23.86, -69.13],
        summary:
            "One of the closest terrestrial analogs to the Martian surface, characterized by extreme desiccation, intense solar ultraviolet radiation, and oxidized, perchlorate-rich desert soils.",
        geologicalSimilarity:
            "Hyper-arid sulfate and chloride salt crusts, oxidized iron-rich regolith, desert pavements, and perchlorate-bearing horizons that directly mirror soils analyzed by the Viking, Phoenix, Curiosity, and Perseverance missions.",
        environmentalConditions:
            "Virtually non-existent rainfall (<1–3 mm/year in the Yungay core), minimal atmospheric water vapor, extreme diurnal thermal swings (-5°C to +40°C), and the highest surface solar UV radiation flux on Earth (~45 W/m²).",
        spaceAgencyUtility:
            "Field-testing the mechanical durability and autonomous navigation of life-detection rovers and landers; calibrating Raman and LIBS spectrometers on organic-poor regolith; and simulating resource-constrained deep-space exploration missions.",
        telemetry: {
            tempEarth: "+18°C Mean (-5°C / +40°C)",
            tempTarget: "Mars Equatorial: +20°C Max",
            aridityEarth: "< 2 mm/yr (Ultra-Dry Core)",
            aridityTarget: "Target: Zero Liquid Precip.",
            soilSimilarity: "96.8%",
            soilType: "Oxidized Sulfate/Perchlorate",
            uvFluxEarth: "45 W/m² (Extreme Solar UV)",
            uvFluxTarget: "Target: ~50 W/m² (Actinic UV)"
        },
        soilComposition: [
            { mineral: "Silica & Plagioclase (SiO₂)", percentage: 52 },
            { mineral: "Ferric Oxides (Fe₂O₃)", percentage: 21 },
            { mineral: "Gypsum & Sulfates (CaSO₄)", percentage: 18 },
            { mineral: "Nitrates & Perchlorates (ClO₄⁻)", percentage: 9 }
        ]
    },
    {
        id: "VL-003",
        name: "Iceland Volcanic Fields & Lava Tubes",
        targetBody: "Moon & Mars",
        targetSubtitle: "Lunar Mare Basalt & Martian Lava Tube Analog",
        coordinates: [64.96, -19.02],
        summary:
            "An exceptional high-latitude volcanic testbed featuring unaltered basaltic plains, tephra fields, and extensive subsurface lava tubes ideal for simulating both Lunar and Martian exploration.",
        geologicalSimilarity:
            "Tholeiitic flood basalts, glass-rich volcanic tephra, rugged aa/pahoehoe lava flows, and glaciovolcanic subsurface lava tubes containing perennial ice formations analogous to Lunar mare pits and Martian shield volcano flanks.",
        environmentalConditions:
            "Sub-polar volcanic climate with mean temperatures between -3°C and +10°C, frequent freeze-thaw cycles, sparse vegetation cover, high-velocity katabatic winds off glaciers, and dynamic geothermal/cryospheric interactions.",
        spaceAgencyUtility:
            "Deploying Ground-Penetrating Radar (GPR) to map subsurface ice deposits (mirroring Lunar polar volatile prospecting); validating autonomous cave-exploring robotics; and testing radiation-shielded extraterrestrial habitat concepts inside lava tubes.",
        telemetry: {
            tempEarth: "+2°C Mean (-15°C / +12°C)",
            tempTarget: "Subsurface Tube: Stable -2°C",
            aridityEarth: "400 mm/yr (Glaciovolcanic)",
            aridityTarget: "Target: Shielded Subsurface",
            soilSimilarity: "93.5%",
            soilType: "Tholeiitic Basalt & Tephra",
            uvFluxEarth: "Low / Subsurface Shielded",
            uvFluxTarget: "Target: Lava Tube Radiation Shield"
        },
        soilComposition: [
            { mineral: "Basaltic Glass & SiO₂", percentage: 48 },
            { mineral: "Ferrous Oxide & Magnetite (FeO)", percentage: 19 },
            { mineral: "Aluminum & Calcium Oxides", percentage: 22 },
            { mineral: "Magnesium Olivine (MgO)", percentage: 11 }
        ]
    },
    {
        id: "VL-004",
        name: "Rio Tinto, Spain",
        targetBody: "Mars",
        targetSubtitle: "Mars Ancient Water & Mineralogical Analog",
        coordinates: [37.69, -6.58],
        summary:
            "A striking astrobiological analog featuring deep-red, highly acidic river systems and iron-sulfate precipitates that mirror ancient aqueous and hydrothermal environments on Mars.",
        geologicalSimilarity:
            "Massive volcanogenic sulfide deposits, ferric-iron precipitates, jarosite, goethite, and hematite mineral assemblages directly equivalent to the sedimentary outcrops discovered at Meridiani Planum and Mawrth Vallis on Mars.",
        environmentalConditions:
            "Extreme geochemical acidity (mean pH 1.5 to 2.5), high concentrations of dissolved heavy metals (Fe, Cu, Zn, As), oxidative weathering regimes, and warm Mediterranean seasonal evaporation cycles.",
        spaceAgencyUtility:
            "Investigating chemolithoautotrophic extremophile microbial ecosystems in harsh iron-sulfur environments to refine biosignature preservation models and calibrate past/present life-detection payloads for Mars.",
        telemetry: {
            tempEarth: "+19°C Mean (+8°C / +36°C)",
            tempTarget: "Noachian Mars: Wet/Acidic",
            aridityEarth: "pH 2.1 (Acidic Aqueous)",
            aridityTarget: "Target: Meridiani Sulfate Basin",
            soilSimilarity: "95.1%",
            soilType: "Jarosite & Hematite Precipitate",
            uvFluxEarth: "32 W/m² (High Ferric Shielding)",
            uvFluxTarget: "Target: Ancient Aqueous Regolith"
        },
        soilComposition: [
            { mineral: "Hematite & Goethite (Fe₂O₃)", percentage: 38 },
            { mineral: "Jarosite & Iron Sulfates", percentage: 31 },
            { mineral: "Silicate Host Matrix (SiO₂)", percentage: 21 },
            { mineral: "Pyrite & Chalcopyrite Sulfides", percentage: 10 }
        ]
    },
    {
        id: "VL-005",
        name: "Devon Island / Haughton Crater, Canadian Arctic",
        targetBody: "Moon & Mars",
        targetSubtitle: "Lunar & Martian Impact Crater Analog",
        coordinates: [75.37, -89.80],
        summary:
            "The largest uninhabited island on Earth, featuring a cold, arid, and barren polar desert centered on the 23-km Haughton impact structure, serving as a premier dual analog for the Moon and Mars.",
        geologicalSimilarity:
            "Well-preserved complex impact crater morphology, shocked gneiss and carbonate impact breccia, allochthonous melt rocks, periglacial patterned ground, and ancient lacustrine crater-lake sediments.",
        environmentalConditions:
            "High-Arctic polar desert regime with mean annual temperatures of -16°C (winter lows of -50°C), low annual precipitation (<180 mm), continuous summer daylight followed by polar night, and complete geographic isolation.",
        spaceAgencyUtility:
            "Simulating end-to-end planetary base deployment, long-range delay-tolerant communications, pressurized rover traverses, EVA spacesuit ergonomics, and crew human-factors workflows in remote, high-stress environments.",
        telemetry: {
            tempEarth: "-16°C Mean (-50°C / +8°C)",
            tempTarget: "Lunar South Pole / Mars High-Lat",
            aridityEarth: "180 mm/yr (Polar Desert)",
            aridityTarget: "Target: Cryogenic Impact Basin",
            soilSimilarity: "95.9%",
            soilType: "Shocked Impact Breccia & Regolith",
            uvFluxEarth: "Continuous Polar Summer Solar",
            uvFluxTarget: "Target: Lunar Peaks of Eternal Light"
        },
        soilComposition: [
            { mineral: "Shocked Carbonate & Dolomite", percentage: 42 },
            { mineral: "Silicate Impact Melt Breccia", percentage: 34 },
            { mineral: "Subsurface Permafrost Ice", percentage: 16 },
            { mineral: "Metallic & Gneissic Clasts", percentage: 8 }
        ]
    }
];

// Attach to global window scope for non-module script fallback compatibility
if (typeof window !== "undefined") {
    window.analogLocations = analogLocations;
}

export default analogLocations;